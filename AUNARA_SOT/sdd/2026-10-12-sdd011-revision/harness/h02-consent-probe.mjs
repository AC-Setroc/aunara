// SDD-011 H-02 compiled checks (S11-06/07/08): what the save POST carries per consent status, local health preserved
// when the remote has none, legacy server copy cleaned on bootstrap, revoke → server cleaned, grant → restored.
// Usage: BROWSER=chromium|webkit BUILD=h02-root node h02-consent-probe.mjs
import { writeFileSync } from "node:fs";
import { startServer, stopServers, launch, installSyntheticSupabase, syntheticSession, syntheticUser, tally } from "./lib.mjs";
const BUILDS = new URL("../builds/", import.meta.url).pathname;
const BUILD = process.env.BUILD ?? "h02-root";
const url = await startServer(4380, "/", `${BUILDS}${BUILD}`);
const browser = await launch();
const t = tally();
const USER_ID = "11111111-1111-4111-8111-111111111111";
const PROFILE = { onboardingCompleted: true, initialRoutineDecision: "rejected", primaryGoal: "endurance", equipmentPreference: "bodyweight", trainingDaysPerWeek: 4, sessionMinutes: 30, birthDate: "1990-05-01", ageYears: 36, metabolicSex: "male", heightCm: 180, currentWeightKg: 82, targetWeightKg: 78, waistCm: 86, activityLevel: "very-active", experience: "intermediate", dietaryPattern: "vegetarian", nutritionPlanMode: "macros", macroMealsPerDay: 5, allergies: "maní", healthNotes: "nota de salud sintética", readinessScreen: { confirmed: true, chestPain: false, dizzinessOrFainting: false, medicallySupervisedOnly: false, musculoskeletalConcern: true }, limitations: [] };
const CHECKINS = [{ id: "ci-1", date: "2026-10-05", weightKg: 81.5, sleepHours: 7, energy: 4, stress: 2, notes: "" }];
// Row shape written by the new client (mirrors privacy.ts stripSensitiveHealthData) and by older clients (optional keys absent).
const stripped = (p) => ({ ...p, healthDataMode: "basic", birthDate: "", ageYears: null, metabolicSex: "unspecified", heightCm: null, currentWeightKg: null, targetWeightKg: null, waistCm: null, bodyFatPercent: null, musclePercent: null, visceralFatLevel: null, activityLevel: "moderate", dietaryPattern: "omnivore", nutritionPlanMode: "simple", macroMealsPerDay: 4, allergies: "", healthNotes: "", preferredIngredients: [], readinessScreen: { confirmed: false, chestPain: false, dizzinessOrFainting: false, medicallySupervisedOnly: false, musculoskeletalConcern: false }, limitations: [] });
const olderClientEmpty = (p) => { const { bodyFatPercent, musclePercent, visceralFatLevel, preferredIngredients, healthDataMode, ...rest } = stripped(p); return rest; };
const snapshotRow = (healthProfile, checkIns, profileName = "Atleta sintético") => ({ user_id: USER_ID, payload: { schemaVersion: 1, profileName, language: "es", favoriteIds: [], tracks: [], activeTrackId: "", healthProfile, checkIns, tracksInitialized: true } });

const isStripped = (payload) => payload.healthProfile.healthNotes === "" && payload.healthProfile.heightCm === null && payload.healthProfile.allergies === "" && payload.checkIns.length === 0;
const keepsPrefs = (payload) => payload.healthProfile.onboardingCompleted === true && payload.healthProfile.primaryGoal === "endurance" && payload.healthProfile.trainingDaysPerWeek === 4 && payload.healthProfile.experience === "intermediate";
const hasData = (payload) => payload.healthProfile.healthNotes === "nota de salud sintética" && payload.healthProfile.heightCm === 180 && payload.checkIns.length === 1;

async function open({ consent, remoteRow = null, lang = "es" }) {
  const metadata = consent === null ? {} : { health_data_consent: consent };
  const user = syntheticUser({ user_metadata: metadata });
  const context = await browser.newContext({ serviceWorkers: "block", viewport: { width: 1440, height: 900 }, locale: "es-CO", acceptDownloads: true });
  await context.addInitScript(`localStorage.setItem("repbook-language", '"${lang}"'); localStorage.setItem("aunara-storage-notice-v1", "1"); localStorage.setItem("repbook-profile-name", '"Atleta sintético"'); localStorage.setItem("repbook-health-profile", ${JSON.stringify(JSON.stringify(PROFILE))}); localStorage.setItem("repbook-weekly-checkins", ${JSON.stringify(JSON.stringify(CHECKINS))}); localStorage.setItem("repbook-training-tracks-initialized", "true"); localStorage.setItem("sb-synthetic-auth-token", ${JSON.stringify(JSON.stringify(syntheticSession(user)))});`);
  const state = {}; const log = [];
  await installSyntheticSupabase(context, { remoteRow, log, stateful: true, user, state });
  const page = await context.newPage();
  const errors = []; page.on("pageerror", (e) => errors.push(String(e).slice(0, 120)));
  await page.goto(url); await page.waitForSelector(".sync-trigger.is-synced", { state: "attached", timeout: 15000 });
  await page.waitForTimeout(1200); // let any debounced save settle
  return { context, page, state, log, errors };
}
async function exportData(page) {
  if (!(await page.locator(".privacy-center").count())) { await page.locator("button.sync-trigger").click(); await page.waitForSelector(".privacy-center"); }
  const [d] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: /Exportar mis datos|Export my data/ }).click()]);
  return JSON.parse(Buffer.concat(await (await d.createReadStream()).toArray()).toString()).data;
}
const lastSave = (state) => state.saves.at(-1)?.payload;

// S11-06: what leaves the device per consent status (remote empty → bootstrap uploads local)
for (const consent of ["granted", "declined", "revoked", null]) {
  const { context, state, errors } = await open({ consent });
  const payload = lastSave(state);
  const expectData = consent === "granted";
  const ok = Boolean(payload) && (expectData ? hasData(payload) : isStripped(payload) && keepsPrefs(payload)) && errors.length === 0;
  t.add(`S11-06 consentimiento=${consent} → POST ${expectData ? "con" : "sin"} datos sensibles`, ok, `saves=${state.saves.length} notes="${payload?.healthProfile?.healthNotes}" height=${payload?.healthProfile?.heightCm} checkIns=${payload?.checkIns?.length} prefs=${payload ? keepsPrefs(payload) : "?"} errors=${errors.join("|")}`);
  await context.close();
}

// S11-06 (legacy): declined + server row still carrying health → bootstrap cleans it and the device keeps its data
{
  const { context, page, state, errors } = await open({ consent: "declined", remoteRow: snapshotRow({ ...PROFILE, healthNotes: "subido antes del fix" }, CHECKINS, "Otro dispositivo") });
  const cleaned = state.saves.length >= 1 && isStripped(lastSave(state)) && isStripped(state.remoteRow.payload);
  const exported = await exportData(page);
  const localKept = exported.healthProfile.healthNotes === "nota de salud sintética" && exported.checkIns.length === 1 && exported.profileName === "Otro dispositivo";
  t.add("S11-06 legacy: fila remota con salud + declined → servidor limpiado en el arranque, salud local intacta, resto del remoto aplicado", cleaned && localKept && errors.length === 0, `saves=${state.saves.length} remoteNotes="${state.remoteRow.payload.healthProfile.healthNotes}" exportNotes="${exported.healthProfile.healthNotes}" name="${exported.profileName}" errors=${errors.join("|")}`);
  await context.close();
}

// S11-07: declined + remote already stripped → local health preserved across reload, and no redundant save
{
  const { context, page, state, errors } = await open({ consent: "declined", remoteRow: snapshotRow(stripped(PROFILE), [], "Otro dispositivo") });
  const savesAfterBootstrap = state.saves.length;
  await page.reload(); await page.waitForSelector(".sync-trigger.is-synced", { state: "attached", timeout: 15000 }); await page.waitForTimeout(1200);
  const exported = await exportData(page);
  const ok = exported.healthProfile.healthNotes === "nota de salud sintética" && exported.healthProfile.heightCm === 180 && exported.checkIns.length === 1 && state.saves.length === savesAfterBootstrap && savesAfterBootstrap === 0 && errors.length === 0;
  t.add("S11-07 declined + remoto sin salud → recarga conserva salud local, cero guardados redundantes", ok, `savesBootstrap=${savesAfterBootstrap} savesAfterReload=${state.saves.length} exportNotes="${exported.healthProfile.healthNotes}" height=${exported.healthProfile.heightCm} errors=${errors.join("|")}`);
  await context.close();
}

// S11-07b: declined + older-client row (no optional keys, no sensitive data) → one normalization save at first bootstrap,
// local health preserved, and no further save after reload.
{
  const { context, page, state, errors } = await open({ consent: "declined", remoteRow: snapshotRow(olderClientEmpty(PROFILE), [], "Otro dispositivo") });
  const first = state.saves.length;
  await page.reload(); await page.waitForSelector(".sync-trigger.is-synced", { state: "attached", timeout: 15000 }); await page.waitForTimeout(1200);
  const exported = await exportData(page);
  const ok = first === 1 && isStripped(lastSave(state)) && state.saves.length === 1 && exported.healthProfile.healthNotes === "nota de salud sintética" && errors.length === 0;
  t.add("S11-07b declined + fila de cliente viejo sin salud → una sola normalización, salud local intacta, cero guardados tras recargar", ok, `savesFirst=${first} savesAfterReload=${state.saves.length} exportNotes="${exported.healthProfile.healthNotes}" errors=${errors.join("|")}`);
  await context.close();
}

// S11-08: granted → revoke in the privacy center. The product already clears the device's sensitive data on revoke
// (App.changeHealthConsent → stripSensitiveHealthData); H-02 makes the server follow. Granting again re-enables the mode;
// there is nothing left on this device to restore.
{
  const { context, page, state, errors } = await open({ consent: "granted" });
  const uploaded = hasData(lastSave(state));
  await page.locator("button.sync-trigger").click(); await page.waitForSelector(".privacy-center");
  await page.getByRole("button", { name: "Revocar autorización de datos de salud" }).click();
  await page.waitForFunction(() => document.body.innerText.includes("Autorización de salud: no otorgada"), null, { timeout: 10000 });
  await page.waitForTimeout(2500);
  const serverCleaned = isStripped(state.remoteRow.payload) && keepsPrefs(state.remoteRow.payload) && state.remoteRow.payload.healthProfile.healthDataMode === "basic";
  const exportedAfterRevoke = await exportData(page);
  const localCleaned = exportedAfterRevoke.healthProfile.healthNotes === "" && exportedAfterRevoke.healthProfile.heightCm === null && exportedAfterRevoke.checkIns.length === 0 && exportedAfterRevoke.healthProfile.primaryGoal === "endurance";
  await page.getByRole("button", { name: "Autorizar uso de datos de salud" }).click();
  await page.waitForFunction(() => document.body.innerText.includes("Autorización de salud: otorgada"), null, { timeout: 10000 });
  await page.waitForTimeout(2500);
  const regranted = state.remoteRow.payload.healthProfile.healthDataMode === "personalized" && isStripped(state.remoteRow.payload);
  const ok = uploaded && serverCleaned && localCleaned && regranted && errors.length === 0;
  t.add("S11-08 granted → revocar: servidor y dispositivo sin datos sensibles, preferencias intactas → autorizar: modo personalizado, servidor = dispositivo", ok, `uploaded=${uploaded} serverCleaned=${serverCleaned} localCleaned=${localCleaned} regranted=${regranted} saves=${state.saves.length} errors=${errors.join("|")}`);
  await context.close();
}

// S11-08b: a second device that still holds health data, consent granted, finds a server row written while consent was
// withheld (no sensitive data) → the device keeps its data and restores the server copy.
{
  const { context, page, state, errors } = await open({ consent: "granted", remoteRow: snapshotRow({ ...stripped(PROFILE), healthDataMode: "personalized" }, [], "Otro dispositivo") });
  const restored = state.saves.length >= 1 && hasData(state.remoteRow.payload) && state.remoteRow.payload.profileName === "Otro dispositivo";
  const exported = await exportData(page);
  const ok = restored && exported.healthProfile.healthNotes === "nota de salud sintética" && exported.checkIns.length === 1 && errors.length === 0;
  t.add("S11-08b segundo dispositivo con datos + granted + remoto sin salud → conserva y restaura el servidor", ok, `saves=${state.saves.length} remoteNotes="${state.remoteRow.payload.healthProfile.healthNotes}" exportNotes="${exported.healthProfile.healthNotes}" errors=${errors.join("|")}`);
  await context.close();
}

writeFileSync(new URL(`../results/h02-consent-${process.env.BROWSER ?? "chromium"}-${BUILD}.json`, import.meta.url).pathname, JSON.stringify({ build: BUILD, browser: process.env.BROWSER ?? "chromium", summary: t.summary(), rows: t.rows }, null, 2));
console.log(`H-02 CONSENT [${process.env.BROWSER ?? "chromium"} ${BUILD}]:`, t.summary());
await browser.close(); stopServers();
