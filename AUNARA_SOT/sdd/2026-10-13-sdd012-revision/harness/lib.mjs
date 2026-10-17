// Shared helpers for the Chromium review matrix (SDD-006 E2+E3+E4, review cycle 2).
// All external traffic is blocked before navigation; Supabase is fully synthetic.
import { spawn } from "node:child_process";
import { chromium, webkit, firefox } from "playwright";

export const SUPABASE_HOST = "synthetic.supabase.invalid";
export const BASES = { root: "/", aunara: "/aunara/" };
export const VIEWPORTS = { desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 }, narrow: { width: 320, height: 720 } };
export const LANGS = ["es", "en"];

const servers = new Map();
export async function startServer(port, base, dir) {
  const child = spawn("node", [new URL("./server.mjs", import.meta.url).pathname, String(port), base, dir], { stdio: ["ignore", "pipe", "ignore"] });
  await new Promise((resolve, reject) => {
    child.stdout.on("data", (chunk) => { if (String(chunk).includes("serving")) resolve(); });
    child.on("exit", (code) => reject(new Error(`server exited ${code}`)));
  });
  servers.set(port, child);
  return `http://127.0.0.1:${port}${base}`;
}
export function stopServers() { for (const child of servers.values()) child.kill(); servers.clear(); }
process.on("exit", stopServers);

/** BROWSER=chromium (default) | webkit | firefox. On the Mac run with BROWSER=webkit to complete the WebKit half. */
export async function launch() {
  const name = process.env.BROWSER ?? "chromium";
  const engine = { chromium, webkit, firefox }[name];
  if (!engine) throw new Error(`BROWSER must be chromium, webkit or firefox (got ${name})`);
  return engine.launch();
}

/** Storage denial variants injected before any script of the page runs. */
export const STORAGE_VARIANTS = {
  none: null,
  "get-only": ["getItem"],
  "set-only": ["setItem"],
  "get+set": ["getItem", "setItem"],
  "getter-throws": "getter",
  "remove-only": ["removeItem"],
  "get+remove": ["getItem", "removeItem"],
  "all-denied": ["getItem", "setItem", "removeItem", "clear", "key"],
};
export function storageInitScript(variant) {
  const spec = STORAGE_VARIANTS[variant];
  if (spec === null) return "";
  if (spec === "getter") {
    return `Object.defineProperty(window, "localStorage", { configurable: true, get() { throw new DOMException("Blocked", "SecurityError"); } });`;
  }
  return `(() => { const proto = Object.getPrototypeOf(window.localStorage); const denied = ${JSON.stringify(spec)};
    for (const name of denied) { Object.defineProperty(proto, name, { configurable: true, value() { throw new DOMException("Blocked", "SecurityError"); } }); } })();`;
}

/** Synthetic Supabase: every request to the fake project is answered locally. Options control auth behaviour. */
export function syntheticUser(overrides = {}) {
  return { id: "11111111-1111-4111-8111-111111111111", aud: "authenticated", role: "authenticated", email: "synthetic@example.invalid", email_confirmed_at: "2026-10-01T00:00:00Z", created_at: "2026-10-01T00:00:00Z", updated_at: "2026-10-01T00:00:00Z", app_metadata: { provider: "email" }, user_metadata: {}, identities: [{ id: "x", user_id: "11111111-1111-4111-8111-111111111111", identity_data: {}, provider: "email", created_at: "2026-10-01T00:00:00Z" }], ...overrides };
}
export function syntheticSession(user = syntheticUser()) {
  return { access_token: "synthetic-access-token", token_type: "bearer", expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, refresh_token: "synthetic-refresh-token", user };
}

/**
 * Synthetic Supabase. `remoteRow` is what GET /rest/v1/repbook_user_data returns. With `stateful: true` the fake keeps the
 * last POSTed row (so a later GET or a reload sees what the app saved) and PUT /auth/v1/user merges user_metadata, which
 * is what supabase-js calls for updateUser (consent changes). `state.user` / `state.remoteRow` expose the current values.
 */
export async function installSyntheticSupabase(context, { userDelayMs = 0, userStatus = 200, remoteRow = null, log = [], stateful = false, user = syntheticUser(), state = {} } = {}) {
  state.remoteRow = remoteRow; state.user = user; state.saves = [];
  await context.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === "127.0.0.1") return route.continue();
    if (url.hostname !== SUPABASE_HOST) { log.push({ blocked: url.href }); return route.abort("blockedbyclient"); }
    const path = url.pathname; const method = route.request().method();
    log.push({ method, path });
    const json = (status, body) => route.fulfill({ status, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(body) });
    if (method === "OPTIONS") return route.fulfill({ status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "*" } });
    if (path === "/auth/v1/user" && method === "GET") {
      if (userDelayMs) await new Promise((r) => setTimeout(r, userDelayMs));
      return userStatus === 200 ? json(200, state.user) : json(userStatus, { message: "invalid token", code: userStatus });
    }
    if (path === "/auth/v1/user" && method === "PUT") {
      const body = JSON.parse(route.request().postData() ?? "{}");
      state.user = { ...state.user, user_metadata: { ...state.user.user_metadata, ...(body.data ?? {}) }, updated_at: new Date().toISOString() };
      return json(200, state.user);
    }
    if (path === "/auth/v1/token") return json(200, syntheticSession(state.user));
    if (path === "/auth/v1/logout") return json(204, {});
    if (path === "/auth/v1/recover") return json(200, {});
    if (path === "/auth/v1/signup") return json(200, { user: syntheticUser(), session: syntheticSession() });
    if (path.startsWith("/rest/v1/repbook_user_data")) {
      if (method === "GET") return json(200, state.remoteRow ? [state.remoteRow] : []);
      if (method === "POST" || method === "PATCH") {
        const body = JSON.parse(route.request().postData() ?? "null");
        const row = Array.isArray(body) ? body[0] : body;
        state.saves.push(row);
        if (stateful && row) state.remoteRow = row;
      }
      return json(201, state.remoteRow ? [state.remoteRow] : []);
    }
    if (path.startsWith("/rest/v1/repbook_consent_events")) return json(201, []);
    if (path.startsWith("/functions/v1/")) return json(200, {});
    return json(404, { message: `unhandled ${method} ${path}` });
  });
}

export function consoleCollector(page) {
  const entries = [];
  // Contexts run with serviceWorkers:"block" (fixture isolation, as in the SDD-004 E2 matrix); Playwright logs one warning for it.
  const HARNESS_NOISE = /Service Worker registration blocked by Playwright/;
  page.on("console", (msg) => { if (["error", "warning"].includes(msg.type()) && !HARNESS_NOISE.test(msg.text())) entries.push(`${msg.type()}: ${msg.text()}`.slice(0, 200)); });
  page.on("pageerror", (err) => entries.push(`pageerror: ${String(err).slice(0, 200)}`));
  return entries;
}

export function tally() {
  const rows = [];
  return {
    rows,
    add(name, pass, detail = "") { rows.push({ name, pass, detail }); },
    summary() { const pass = rows.filter((r) => r.pass).length; return `${pass}/${rows.length} PASS` + (pass === rows.length ? "" : `; FAIL: ${rows.filter((r) => !r.pass).map((r) => `${r.name} (${r.detail})`).join("; ")}`); },
  };
}

/** SDD-012: the language selector lives inside the navigation panel. Opens the menu programmatically (the panel is portaled
 * to <body>), selects the language and closes the panel with its close button. */
export async function setLanguageViaMenu(page, code) {
  const opened = await page.evaluate(() => { const t = document.querySelector("button.navigation-trigger"); if (!t) return false; if (t.getAttribute("aria-expanded") !== "true") t.click(); return true; });
  if (!opened) throw new Error("navigation trigger not found");
  await page.waitForSelector("#aunara-navigation .language-select select", { state: "attached", timeout: 5000 });
  await page.selectOption("#aunara-navigation .language-select select", code);
  await page.evaluate(() => document.querySelector("#aunara-navigation > button")?.click());
  await page.waitForSelector("#aunara-navigation", { state: "detached", timeout: 5000 });
}
