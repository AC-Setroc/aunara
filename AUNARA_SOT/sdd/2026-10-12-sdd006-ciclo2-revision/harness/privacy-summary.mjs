// E4 RG-01..RG-06 in the compiled app (Chromium): stored-data summary derived from the snapshot.
// Synthetic session persisted the way supabase-js persists it; remote GET returns [] so bootstrap uploads local state.
import { writeFileSync } from "node:fs";
import { startServer, stopServers, launch, BASES, VIEWPORTS, LANGS, installSyntheticSupabase, consoleCollector, syntheticSession, syntheticUser, tally } from "./lib.mjs";

const BUILDS = new URL("../builds/", import.meta.url).pathname;
const urls = { root: await startServer(4331, "/", `${BUILDS}e4-root`), aunara: await startServer(4332, "/aunara/", `${BUILDS}e4-aunara`) };
const browser = await launch();
const t = tally();
const SESSION_KEY = "sb-synthetic-auth-token";

const BASE_PROFILE = { onboardingCompleted: false, primaryGoal: "strength", equipmentPreference: "mixed", trainingDaysPerWeek: 3, sessionMinutes: 45, birthDate: "", ageYears: null, metabolicSex: "unspecified", heightCm: null, currentWeightKg: null, targetWeightKg: null, waistCm: null, activityLevel: "moderate", experience: "beginner", dietaryPattern: "omnivore", nutritionPlanMode: "simple", macroMealsPerDay: 4, allergies: "", healthNotes: "", readinessScreen: { confirmed: false, chestPain: false, dizzinessOrFainting: false, medicallySupervisedOnly: false, musculoskeletalConcern: false }, limitations: [] };
const TRACK = { id: "track-fixture-1", name: "Fuerza fixture", kind: "goal", focus: "strength", equipment: "mixed", sessionMinutes: 45, daysPerWeek: 2, creationMode: "manual", trainingDays: ["monday", "thursday"], workout: [{ id: "w1", exerciseId: "0001", sets: 3, reps: 8, day: "monday" }] };

function seedScript({ name = "Mi perfil", profile = {}, tracks = [], favorites = [], checkIns = [], language = "es", session = true, userId = "11111111-1111-4111-8111-111111111111", consent = "declined" } = {}) {
  const user = syntheticUser({ id: userId, user_metadata: { health_data_consent: consent } });
  const sess = session ? syntheticSession(user) : null;
  return `(() => {
    localStorage.setItem("repbook-profile-name", ${JSON.stringify(JSON.stringify(name))});
    localStorage.setItem("repbook-health-profile", ${JSON.stringify(JSON.stringify({ ...BASE_PROFILE, ...profile }))});
    localStorage.setItem("repbook-training-tracks", ${JSON.stringify(JSON.stringify(tracks))});
    localStorage.setItem("repbook-training-tracks-initialized", "true");
    localStorage.setItem("repbook-favorites", ${JSON.stringify(JSON.stringify(favorites))});
    localStorage.setItem("repbook-weekly-checkins", ${JSON.stringify(JSON.stringify(checkIns))});
    localStorage.setItem("repbook-language", ${JSON.stringify(JSON.stringify(language))});
    localStorage.setItem("aunara-storage-notice-v1", "1");
    ${sess ? `localStorage.setItem(${JSON.stringify(SESSION_KEY)}, ${JSON.stringify(JSON.stringify(sess))});` : ""}
  })();`;
}

async function openSummary(page) {
  await page.waitForSelector(".shared-navigation", { timeout: 10000 });
  // Account/synchronization control in the header is the real trigger.
  await page.locator("button.sync-trigger").click();
  await page.waitForSelector(".access-panel", { timeout: 8000 });
  const present = await page.locator(".privacy-summary").count();
  if (!present) return { present: false, items: [] };
  await page.waitForTimeout(600); // let bootstrap settle to synced
  const items = await page.locator(".privacy-summary li").allTextContents();
  const status = await page.locator(".privacy-summary p").first().textContent();
  return { present: true, items, status: status?.slice(0, 40) };
}

async function scenario(name, base, lang, seed, check, { vp = "mobile" } = {}) {
  const context = await browser.newContext({ serviceWorkers: "block",  viewport: VIEWPORTS[vp], locale: lang === "en" ? "en-US" : "es-CO", acceptDownloads: true });
  await context.addInitScript(seedScript({ ...seed, language: lang }));
  const log = [];
  await installSyntheticSupabase(context, { log });
  const page = await context.newPage();
  const consoleEntries = consoleCollector(page);
  try {
    await page.goto(urls[base]);
    const result = await check(page, log, consoleEntries);
    t.add(`${name} ${base}/${lang}`, result.ok, result.detail);
  } catch (error) {
    t.add(`${name} ${base}/${lang}`, false, `error: ${String(error).slice(0, 120)}`);
  } finally { await context.close(); }
}

const PROFILE_LABEL = { es: "Perfil y preferencias", en: "Profile and preferences" };
const has = (items, lang) => items.some((x) => x.includes(PROFILE_LABEL[lang]));

const ONLY = process.env.ONLY_NAMES ? process.env.ONLY_NAMES.split(",") : null;
const scenarioAll = scenario;
const scenarioFiltered = async (name, ...rest) => { if (ONLY && !ONLY.some((s) => name.startsWith(s))) return; return scenarioAll(name, ...rest); };
for (const base of Object.keys(BASES)) for (const lang of LANGS) {
  // RG-01: partial name only, onboarding false / omitted
  for (const onboarding of [false, undefined]) {
    await scenarioFiltered(`RG-01 nombre parcial (onboarding=${onboarding})`, base, lang, { name: "Synthetic athlete", profile: { onboardingCompleted: onboarding } }, async (page) => {
      const s = await openSummary(page); return { ok: s.present && has(s.items, lang) && s.items.length === 1, detail: JSON.stringify(s.items) };
    });
  }
  // RG-03: each preference alone
  for (const [key, value] of [["primaryGoal", "mobility"], ["goals", ["strength"]], ["sport", "running"], ["equipmentPreference", "bodyweight"], ["trainingDaysPerWeek", 2], ["sessionMinutes", 30], ["experience", "intermediate"]]) {
    await scenarioFiltered(`RG-03 preferencia sola ${key}`, base, lang, { profile: { [key]: value } }, async (page) => {
      const s = await openSummary(page); return { ok: s.present && has(s.items, lang), detail: JSON.stringify(s.items) };
    });
  }
  await scenarioFiltered("RG-03 completado sin nombre ni prefs", base, lang, { profile: { onboardingCompleted: true, initialRoutineDecision: "rejected" } }, async (page) => {
    const s = await openSummary(page); return { ok: s.present && has(s.items, lang), detail: JSON.stringify(s.items) };
  });
  // RG-02: defaults, empty name, fallback name, empty collections, sensitive-only, language-only → no profile item
  for (const [label, seed] of [["defaults", {}], ["nombre vacío", { name: "   " }], ["goals []", { profile: { goals: [] } }], ["sport null", { profile: { sport: null } }], ["solo sensible", { profile: { birthDate: "1990-01-01", currentWeightKg: 80, healthDataMode: "personalized" } }], ["solo readiness", { profile: { readinessScreen: { ...BASE_PROFILE.readinessScreen, confirmed: true } } }], ["solo decisión propuesta", { profile: { initialRoutineDecision: "rejected" } }]]) {
    await scenarioFiltered(`RG-02 sin falso positivo: ${label}`, base, lang, seed, async (page) => {
      const s = await openSummary(page); return { ok: s.present && !has(s.items, lang), detail: JSON.stringify(s.items) };
    });
  }
  // RG-04: other categories unchanged; health not granted → absent
  await scenarioFiltered("RG-04 rutas/favoritos/check-ins y salud no autorizada", base, lang, { name: "Synthetic athlete", tracks: [TRACK], favorites: ["0001", "0002"], checkIns: [{ id: "c1", date: "2026-10-01", weightKg: null, sleepHours: 7, energy: 3, stress: 2, notes: "" }], profile: { healthDataMode: "personalized" } }, async (page) => {
    const s = await openSummary(page);
    const ok = s.present && has(s.items, lang) && s.items.some((x) => /(Rutas y prescripciones|Routes and prescriptions): 1/.test(x)) && s.items.some((x) => /(Favoritos|Favorites): 2/.test(x)) && s.items.some((x) => /(Registros semanales|Weekly check-ins): 1/.test(x)) && !s.items.some((x) => /salud|health/i.test(x));
    return { ok, detail: JSON.stringify(s.items) };
  });
  // RG-05: guest never sees the privacy center
  await scenarioFiltered("RG-05 invitado sin centro de privacidad", base, lang, { name: "Synthetic athlete", session: false }, async (page) => {
    await page.waitForSelector(".shared-navigation", { timeout: 10000 });
    const syncTrigger = await page.locator("button.sync-trigger").count();
    await page.locator("button.guest-account-button").first().click();
    await page.waitForSelector(".access-panel", { timeout: 8000 });
    const center = await page.locator(".privacy-center").count() + syncTrigger;
    return { ok: center === 0, detail: `privacy-center=${center}` };
  });
  // RG-05: user B with empty remote does not inherit A's categories (fresh context = fresh browser profile; here B seeded with defaults)
  await scenarioFiltered("RG-05 usuario B vacío", base, lang, { userId: "22222222-2222-4222-8222-222222222222" }, async (page) => {
    const s = await openSummary(page); return { ok: s.present && !has(s.items, lang), detail: JSON.stringify(s.items) };
  });
  // RG-06: export bytes identical across open/close/language switch, except exportedAt; no new writes caused by the summary
  await scenarioFiltered("RG-06 export estable y sin escrituras nuevas", base, lang, { name: "Synthetic athlete", profile: { experience: "intermediate" } }, async (page, log) => {
    const s1 = await openSummary(page);
    const exportLabel = lang === "en" ? "Export my data" : "Exportar mis datos";
    const [d1] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: exportLabel }).click()]);
    const j1 = JSON.parse(await (await d1.createReadStream()).toArray().then((c) => Buffer.concat(c).toString()));
    const writesBefore = log.filter((l) => l.method && l.method !== "GET" && l.method !== "OPTIONS").length;
    // close, switch language twice, reopen
    await page.getByRole("button", { name: lang === "en" ? "Close access panel" : "Cerrar acceso" }).click();
    await page.locator(".language-select select").selectOption(lang === "en" ? "es" : "en");
    await page.locator(".language-select select").selectOption(lang);
    const s2 = await openSummary(page);
    const [d2] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: exportLabel }).click()]);
    const j2 = JSON.parse(await (await d2.createReadStream()).toArray().then((c) => Buffer.concat(c).toString()));
    const writesAfter = log.filter((l) => l.method && l.method !== "GET" && l.method !== "OPTIONS").length;
    const strip = (j) => JSON.stringify({ ...j, exportedAt: undefined });
    const ok = s1.present && s2.present && has(s1.items, lang) && has(s2.items, lang) && strip(j1) === strip(j2) && writesAfter === writesBefore && j1.data?.profileName === "Synthetic athlete";
    return { ok, detail: `same=${strip(j1) === strip(j2)} writes ${writesBefore}->${writesAfter} name=${j1.data?.profileName}` };
  });
}

writeFileSync(new URL(ONLY ? "../results/privacy-summary-subset.json" : "../results/privacy-summary.json", import.meta.url).pathname, JSON.stringify({ summary: t.summary(), rows: t.rows }, null, 2));
console.log("PRIVACY SUMMARY:", t.summary());
await browser.close(); stopServers();
