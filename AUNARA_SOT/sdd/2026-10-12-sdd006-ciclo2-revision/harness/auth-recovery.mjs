// Auth regression on the E4 build (SDD-004 E2 buffer + E3 async boundary): verified PASSWORD_RECOVERY callback
// with /user at 0 ms and 200 ms, both bases, ES/EN, 1440/390 → `.password-recovery` must appear without sleeps.
// Negatives: invalid/expired token (401), signup-type hash, plain sign-in → no recovery form.
import { writeFileSync } from "node:fs";
import { startServer, stopServers, launch, BASES, VIEWPORTS, LANGS, installSyntheticSupabase, consoleCollector, tally } from "./lib.mjs";

const BUILDS = new URL("../builds/", import.meta.url).pathname;
const urls = { root: await startServer(4321, "/", `${BUILDS}e4-root`), aunara: await startServer(4322, "/aunara/", `${BUILDS}e4-aunara`) };
const browser = await launch();
const t = tally();
const RECOVERY_HASH = "#access_token=synthetic-access-token&refresh_token=synthetic-refresh-token&expires_in=3600&token_type=bearer&type=recovery";
const SIGNUP_HASH = RECOVERY_HASH.replace("type=recovery", "type=signup");

async function run(base, lang, vp, { delay = 0, status = 200, hash = RECOVERY_HASH, expectRecovery, label }) {
  const context = await browser.newContext({ serviceWorkers: "block",  viewport: VIEWPORTS[vp], locale: lang === "en" ? "en-US" : "es-CO" });
  const log = [];
  await installSyntheticSupabase(context, { userDelayMs: delay, userStatus: status, log });
  const page = await context.newPage();
  const consoleEntries = consoleCollector(page);
  const started = Date.now();
  await page.goto(urls[base] + hash);
  await page.waitForSelector(".shared-navigation", { timeout: 10000 });
  let recovery = false;
  try { await page.waitForSelector(".password-recovery", { timeout: 6000 }); recovery = true; } catch { recovery = false; }
  const elapsed = Date.now() - started;
  const userCalls = log.filter((l) => l.path === "/auth/v1/user").length;
  const hashNow = await page.evaluate(() => location.hash);
  const leaked = await page.evaluate(() => document.body.innerHTML.includes("synthetic-access-token"));
  const ok = recovery === expectRecovery && !leaked && consoleEntries.filter((e) => e.startsWith("pageerror")).length === 0;
  t.add(`${label} ${base}/${lang}/${vp}`, ok, `recovery=${recovery} esperado=${expectRecovery} userCalls=${userCalls} ${elapsed}ms hash="${hashNow.slice(0, 20)}" leaked=${leaked} ${consoleEntries.slice(0, 1).join("")}`);
  await context.close();
}

for (const base of Object.keys(BASES)) for (const lang of LANGS) for (const vp of ["desktop", "mobile"]) {
  await run(base, lang, vp, { delay: 0, expectRecovery: true, label: "recovery 0ms" });
  await run(base, lang, vp, { delay: 200, expectRecovery: true, label: "recovery 200ms" });
  await run(base, lang, vp, { status: 401, expectRecovery: false, label: "neg invalid/expired 401" });
  await run(base, lang, vp, { hash: SIGNUP_HASH, expectRecovery: false, label: "neg signup hash" });
  await run(base, lang, vp, { hash: "", expectRecovery: false, label: "neg sin callback" });
}

// Post-mount recovery: open normally, then let the SDK observe a recovery session via a second navigation in the same
// document (hashchange is not re-parsed by supabase-js; a real post-mount event comes from a token refresh). We verify
// instead that an already-consumed signal does not re-open the form on remount: reload after recovery shows no form.
for (const base of Object.keys(BASES)) {
  const context = await browser.newContext({ serviceWorkers: "block",  viewport: VIEWPORTS.desktop, locale: "es-CO" });
  await installSyntheticSupabase(context);
  const page = await context.newPage();
  await page.goto(urls[base] + RECOVERY_HASH);
  await page.waitForSelector(".password-recovery", { timeout: 8000 });
  // supabase-js persists the session; reload without hash must not show recovery again (consumed, not persisted signal).
  await page.goto(urls[base]);
  await page.waitForSelector(".shared-navigation", { timeout: 8000 });
  let again = true;
  try { await page.waitForSelector(".password-recovery", { timeout: 2500 }); } catch { again = false; }
  t.add(`consumo único: recarga sin hash no reabre recuperación ${base}`, !again, `again=${again}`);
  await context.close();
}

writeFileSync(new URL("../results/auth-recovery.json", import.meta.url).pathname, JSON.stringify({ summary: t.summary(), rows: t.rows }, null, 2));
console.log("AUTH RECOVERY:", t.summary());
await browser.close(); stopServers();
