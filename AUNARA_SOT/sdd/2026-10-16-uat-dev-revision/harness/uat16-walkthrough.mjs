// UAT 2026-10-16 walkthrough on dev d2ba0aa: points of the guion not covered by the compiled matrices.
// W-01 two devices (same account) · W-02 legal contact · W-03 editor series text · W-04 console delta on main screens
// W-05 Cuenta / privacidad through the drawer · W-06 drawer inventory (guest/session). BASE=/ BUILD=dev16-root PORT=…
import { writeFileSync } from "node:fs";
import { startServer, stopServers, launch, VIEWPORTS, installSyntheticSupabase, syntheticSession, syntheticUser, tally, consoleCollector } from "./lib.mjs";
const BUILDS = new URL("../builds/", import.meta.url).pathname;
const BUILD = process.env.BUILD ?? "dev16-root"; const BASE = process.env.BASE ?? "/"; const ENGINE = process.env.BROWSER ?? "chromium";
const url = await startServer(Number(process.env.PORT ?? 4395), BASE, `${BUILDS}${BUILD}`);
const SESSION_KEY = "sb-synthetic-auth-token";
const PROFILE = { onboardingCompleted: true, primaryGoal: "strength", equipmentPreference: "mixed", trainingDaysPerWeek: 3, sessionMinutes: 45, birthDate: "", ageYears: null, metabolicSex: "unspecified", heightCm: null, currentWeightKg: null, targetWeightKg: null, waistCm: null, activityLevel: "moderate", experience: "beginner", dietaryPattern: "omnivore", nutritionPlanMode: "simple", macroMealsPerDay: 4, allergies: "", healthNotes: "", readinessScreen: { confirmed: true, chestPain: false, dizzinessOrFainting: false, medicallySupervisedOnly: false, musculoskeletalConcern: false }, limitations: [], goals: ["strength"], healthDataMode: "basic" };
const TRISET = { id: "track-triset", name: "Triserie fixture", kind: "goal", focus: "strength", equipment: "mixed", sessionMinutes: 45, daysPerWeek: 2, creationMode: "manual", trainingDays: ["monday", "thursday"], workout: [
  { id: "t1", exerciseId: "0001", sets: 3, reps: 8, day: "monday", structure: { id: "triset-1", type: "triset", position: 0, size: 3 } },
  { id: "t2", exerciseId: "0002", sets: 3, reps: 10, day: "monday", structure: { id: "triset-1", type: "triset", position: 1, size: 3 } },
  { id: "t3", exerciseId: "0003", sets: 3, reps: 20, day: "monday", structure: { id: "triset-1", type: "triset", position: 2, size: 3 } } ] };
const seed = ({ name = "Mi perfil", tracks = [], language = "es", session = true, profile = PROFILE, consent = "declined" } = {}) => {
  const user = syntheticUser({ user_metadata: { health_data_consent: consent } }); const sess = session ? syntheticSession(user) : null;
  return `(() => { localStorage.setItem("repbook-profile-name", ${JSON.stringify(JSON.stringify(name))}); localStorage.setItem("repbook-health-profile", ${JSON.stringify(JSON.stringify(profile))});
    localStorage.setItem("repbook-training-tracks", ${JSON.stringify(JSON.stringify(tracks))}); localStorage.setItem("repbook-training-tracks-initialized", "true");
    ${tracks.length ? `localStorage.setItem("repbook-active-track", ${JSON.stringify(JSON.stringify(tracks[0].id))});` : ""}
    localStorage.setItem("repbook-favorites", "[]"); localStorage.setItem("repbook-weekly-checkins", "[]"); localStorage.setItem("repbook-language", ${JSON.stringify(JSON.stringify(language))});
    localStorage.setItem("aunara-storage-notice-v1", "1"); ${sess ? `localStorage.setItem(${JSON.stringify(SESSION_KEY)}, ${JSON.stringify(JSON.stringify(sess))});` : ""} })();`;
};
const t = tally(); const browser = await launch(); const report = {};
async function open({ name, tracks, session = true, vp = "desktop", language = "es", state, log, stateful = false, consent, remoteRow = null } = {}) {
  const context = await browser.newContext({ serviceWorkers: "block", viewport: VIEWPORTS[vp], locale: "es-CO" });
  await installSyntheticSupabase(context, { stateful, state, log, remoteRow, user: syntheticUser({ user_metadata: { health_data_consent: consent ?? "declined" } }) });
  await context.addInitScript(seed({ name, tracks, session, language, consent }));
  const page = await context.newPage(); const errors = consoleCollector(page);
  await page.goto(url); await page.waitForSelector(".shared-navigation", { timeout: 15000 });
  return { context, page, errors };
}
const openMenu = (page) => page.locator("button.navigation-trigger").click();
const rows = (page) => page.locator("#aunara-navigation .navigation-row").allTextContents();
const clickRow = async (page, re) => { await openMenu(page); await page.locator("#aunara-navigation .navigation-row").filter({ hasText: re }).first().click(); };
const posts = (log) => log.filter((l) => l.method === "POST" && l.path.startsWith("/rest/v1/repbook_user_data")).length;
async function waitSave(log, previous, page) { for (let i = 0; i < 60 && posts(log) <= previous; i++) await page.waitForTimeout(100); return posts(log) > previous; }

try {
  // W-01 two devices, same account, shared synthetic server with state.
  { const state = {}; const log = [];
    const A = await open({ name: "Alejo A", tracks: [TRISET], state, log, stateful: true });
    const saved = await waitSave(log, 0, A.page); writeFileSync(new URL("../results/w01-row.json", import.meta.url).pathname, JSON.stringify(state.remoteRow));
    t.add("W-01a dispositivo A guarda en el servidor", saved && state.remoteRow?.payload?.profileName === "Alejo A", JSON.stringify({ posts: posts(log), name: state.remoteRow?.payload?.profileName }));
    const stateB = {}; const B = await open({ name: "Mi perfil", tracks: [], state: stateB, log, stateful: true, remoteRow: state.remoteRow });
    await B.page.waitForFunction(() => localStorage.getItem("repbook-profile-name") === JSON.stringify("Alejo A"), null, { timeout: 15000 }).catch(() => {});
    const bName = await B.page.evaluate(() => JSON.parse(localStorage.getItem("repbook-profile-name") ?? "null"));
    const bTracks = await B.page.evaluate(() => JSON.parse(localStorage.getItem("repbook-training-tracks") ?? "[]").map((x) => x.name));
    t.add("W-01b dispositivo B recibe nombre y rutina de A", bName === "Alejo A" && bTracks.includes("Triserie fixture"), JSON.stringify({ bName, bTracks }));
    // B changes experience in the profile → server → A reload sees it
    await clickRow(B.page, /Perfil|Profile/); await B.page.waitForSelector(".profile-panel", { timeout: 8000 });
    const before = posts(log);
    const exp = B.page.locator(".profile-panel select").filter({ has: B.page.locator('option[value="advanced"]') }).first();
    await exp.selectOption("advanced"); await B.page.locator(".profile-done").click();
    let savedB = false; for (let i = 0; i < 120 && !savedB; i++) { await B.page.waitForTimeout(100); savedB = stateB.remoteRow?.payload?.healthProfile?.experience === "advanced"; }
    const serverExp = stateB.remoteRow?.payload?.healthProfile?.experience;
    t.add("W-01c cambio en B llega al servidor", savedB && serverExp === "advanced", JSON.stringify({ savedB, serverExp }));
    const A2 = await open({ name: "Alejo A", tracks: [TRISET], state: {}, log, stateful: true, remoteRow: stateB.remoteRow }); await A2.page.waitForFunction(() => JSON.parse(localStorage.getItem("repbook-health-profile") ?? "{}").experience === "advanced", null, { timeout: 15000 }).catch(() => {});
    const aExp = await A2.page.evaluate(() => JSON.parse(localStorage.getItem("repbook-health-profile") ?? "{}").experience);
    t.add("W-01d A recarga y ve el cambio de B", aExp === "advanced", JSON.stringify({ aExp }));
    t.add("W-01e sin errores de consola en A, B y A2", A.errors.length + B.errors.length + A2.errors.length === 0, JSON.stringify([...A.errors, ...B.errors, ...A2.errors].slice(0, 4)));
    await A2.context.close();
    report.w01Log = log.filter((l) => l.method).map((l) => `${l.method} ${l.path}`).slice(0, 40);
    await A.context.close(); await B.context.close(); }

  // W-02 legal contact in privacy and terms (guest, es/en)
  for (const language of ["es", "en"]) { const { context, page, errors } = await open({ session: false, language });
    const out = {};
    for (const [doc, re] of [["privacy", /privacidad|privacy/i], ["terms", /términos|terms/i]]) {
      await page.locator("footer button").filter({ hasText: re }).first().click(); await page.waitForSelector(".legal-panel[role=dialog]", { timeout: 8000 });
      const text = await page.locator(".legal-panel").innerText(); out[doc] = { newMail: text.includes("admin@aunaratraining.com"), oldMail: text.includes("alejandro@ac-setroc.com"), version: /1\.0/.test(text) };
      await page.keyboard.press("Escape"); await page.waitForSelector(".legal-panel[role=dialog]", { state: "detached", timeout: 5000 }); }
    t.add(`W-02 contacto legal nuevo y sin el viejo (${language})`, out.privacy.newMail && out.terms.newMail && !out.privacy.oldMail && !out.terms.oldMail, JSON.stringify(out));
    t.add(`W-02 consola legal (${language})`, errors.length === 0, errors.slice(0, 3).join(" | ")); await context.close(); }

  // W-03 editor: triset visible, series plan not duplicated as fixed text
  for (const vp of ["desktop", "mobile"]) { const { context, page, errors } = await open({ tracks: [TRISET], vp });
    await clickRow(page, /Triserie fixture|Entrenamiento de hoy|Today/); await page.waitForSelector("aside.workout-panel", { timeout: 8000 });
    const text = await page.locator("body").innerText();
    const fixedPlan = (text.match(/Plan de series/g) ?? []).length; const planControls = await page.locator('[aria-label^="Plan de series para"]').count();
    t.add(`W-03 editor sin «Plan de series» como texto fijo (${vp})`, fixedPlan === 0, JSON.stringify({ fixedPlan, planControls }));
    t.add(`W-03 consola entrenamiento (${vp})`, errors.length === 0, errors.slice(0, 3).join(" | ")); await context.close(); }

  // W-04/W-05/W-06 drawer inventory + account/privacy + console delta per screen (guest & session, desktop & mobile)
  for (const session of [false, true]) for (const vp of ["desktop", "mobile"]) { const { context, page, errors } = await open({ session, vp, tracks: [TRISET] });
    const base = errors.length; await openMenu(page); const inventory = await rows(page); report[`inventory-${session ? "session" : "guest"}-${vp}`] = inventory;
    await page.keyboard.press("Escape");
    const dup = inventory.filter((x, i) => inventory.findIndex((y) => y.trim() === x.trim()) !== i);
    t.add(`W-06 menú sin filas duplicadas (${session ? "sesión" : "invitado"}/${vp})`, dup.length === 0, JSON.stringify({ inventory, dup }));
    await clickRow(page, session ? /Cuenta \/ privacidad|Account \/ privacy/ : /Ingresar|Login/); await page.waitForSelector(".access-panel", { timeout: 8000 });
    if (session) { const summary = await page.locator(".privacy-summary li").allTextContents(); const hasExport = await page.getByRole("button", { name: /Exportar mis datos|Export my data/ }).count();
      const trigger = page.locator("button.account-deletion-trigger"); const hasDelete = await trigger.count();
      let modal = false; if (hasDelete) { await trigger.click(); modal = (await page.locator(".account-deletion[role=dialog]").count()) === 1; await page.keyboard.press("Escape"); await page.locator(".account-deletion[role=dialog]").waitFor({ state: "detached", timeout: 5000 }).catch(() => {}); }
      t.add(`W-05 Cuenta/privacidad lista perfil, exporta y elimina (${vp})`, summary.some((s) => /Perfil|Profile/.test(s)) && hasExport === 1 && modal, JSON.stringify({ summary, hasExport, hasDelete, modal })); }
    await page.keyboard.press("Escape"); await page.locator(".access-panel").waitFor({ state: "detached", timeout: 5000 }).catch(async () => { await page.locator(".access-panel button[aria-label*=errar], .access-panel button[aria-label*=lose]").first().click().catch(() => {}); });
    if (session) { await clickRow(page, /^\s*Perfil|Profile/); await page.waitForSelector(".profile-panel", { timeout: 8000 }); const salir = await page.locator(".profile-signout").count(); await page.locator(".profile-done").click();
      t.add(`W-04 perfil abre desde el menú y tiene Salir (${vp})`, salir === 1, `salir=${salir}`); }
    t.add(`W-04 consola pantallas principales (${session ? "sesión" : "invitado"}/${vp})`, errors.length - base === 0, errors.slice(base, base + 3).join(" | "));
    await context.close(); }
} catch (error) { t.add("fatal", false, String(error).slice(0, 300)); }
finally { await browser.close(); stopServers(); }
writeFileSync(new URL(`../results/uat16-${ENGINE}-${BUILD}.json`, import.meta.url).pathname, JSON.stringify({ build: BUILD, base: BASE, browser: ENGINE, summary: t.summary(), rows: t.rows, report }, null, 2));
console.log(`UAT16 [${ENGINE} ${BUILD}]:`, t.summary());
