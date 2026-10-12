// E1 / CL-06 data round-trip and CA06-06 / F2 geometry on the E4 build (Chromium).
//  Round-trip: triset fixture (press 3×8, push-up technical failure, mountain climber 3×20 per side) renders, exports,
//  survives reload; an invalid remote enum is rejected without destroying the valid local state.
//  Geometry: floating mobile access never overlaps interactive controls at 320/390/1440 (+ height 460) across scroll
//  positions; planned-sessions badge not clipped; footer blocks visible without overflow at 375/1049/1050/1051.
import { writeFileSync } from "node:fs";
import { startServer, stopServers, launch, BASES, LANGS, installSyntheticSupabase, consoleCollector, syntheticSession, syntheticUser, tally } from "./lib.mjs";

const BUILDS = new URL("../builds/", import.meta.url).pathname;
const urls = { root: await startServer(4351, "/", `${BUILDS}e4-root`), aunara: await startServer(4352, "/aunara/", `${BUILDS}e4-aunara`) };
const browser = await launch();
const t = tally();
const SESSION_KEY = "sb-synthetic-auth-token";
const PROFILE = { onboardingCompleted: true, primaryGoal: "strength", equipmentPreference: "mixed", trainingDaysPerWeek: 3, sessionMinutes: 45, birthDate: "", ageYears: null, metabolicSex: "unspecified", heightCm: null, currentWeightKg: null, targetWeightKg: null, waistCm: null, activityLevel: "moderate", experience: "intermediate", dietaryPattern: "omnivore", nutritionPlanMode: "simple", macroMealsPerDay: 4, allergies: "", healthNotes: "", readinessScreen: { confirmed: true, chestPain: false, dizzinessOrFainting: false, medicallySupervisedOnly: false, musculoskeletalConcern: false }, limitations: [] };
const structure = (position) => ({ id: "triset-1", type: "triset", position, size: 3 });
const TRISET_TRACK = { id: "track-triset", name: "Triserie fixture", kind: "goal", focus: "strength", equipment: "mixed", sessionMinutes: 45, daysPerWeek: 2, creationMode: "manual", trainingDays: ["monday", "thursday"], workout: [
  { id: "w-press", exerciseId: "0047", sets: 3, reps: 8, day: "monday", structure: structure(0), notes: "nota libre press" },
  { id: "w-pushup", exerciseId: "0662", sets: 3, reps: 0, day: "monday", structure: structure(1), prescriptionMode: "special", specialPrescription: { technique: "rest-pause", rounds: 3, restBetweenRoundsSeconds: 90, blocks: [{ id: "b1", type: "work", target: "technical-failure", loadType: "bodyweight" }] } },
  { id: "w-climber", exerciseId: "0630", sets: 3, reps: 20, repetitionCount: "per-side", day: "monday", structure: structure(2), loadHistory: [{ date: "2026-10-01", setPlan: "3x20", loadKg: null }] },
] };
const SECOND_TRACK = { id: "track-2", name: "Running fixture", kind: "sport", focus: "running", equipment: "bodyweight", sessionMinutes: 30, daysPerWeek: 2, creationMode: "manual", trainingDays: ["tuesday", "friday"], workout: [{ id: "r1", exerciseId: "0001", sets: 2, reps: 12, day: "tuesday" }] };

function seed({ lang, tracks, remote = false }) {
  const user = syntheticUser({ user_metadata: { health_data_consent: "declined" } });
  return `(() => {
    localStorage.setItem("repbook-language", ${JSON.stringify(JSON.stringify(lang))});
    localStorage.setItem("repbook-profile-name", ${JSON.stringify(JSON.stringify("Synthetic athlete"))});
    localStorage.setItem("repbook-health-profile", ${JSON.stringify(JSON.stringify(PROFILE))});
    localStorage.setItem("repbook-training-tracks", ${JSON.stringify(JSON.stringify(tracks))});
    localStorage.setItem("repbook-active-track", ${JSON.stringify(JSON.stringify(tracks[0].id))});
    localStorage.setItem("repbook-training-tracks-initialized", "true");
    localStorage.setItem("aunara-storage-notice-v1", "1");
    localStorage.setItem(${JSON.stringify(SESSION_KEY)}, ${JSON.stringify(JSON.stringify(syntheticSession(user)))});
  })();`;
}
async function openWorkoutText(page) {
  const mobile = page.locator("button.mobile-workout");
  if (await mobile.isVisible()) await mobile.click(); else await page.locator("button.workout-trigger").first().click();
  await page.waitForSelector(".workout-panel", { timeout: 8000 });
  await page.waitForTimeout(300);
  return (await page.locator(".workout-panel").innerText()).replace(/\s+/g, " ");
}
async function exportJson(page, lang) {
  await page.locator("button.sync-trigger").click();
  await page.waitForSelector(".privacy-center", { timeout: 8000 });
  const [d] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: lang === "en" ? "Export my data" : "Exportar mis datos" }).click()]);
  return JSON.parse(Buffer.concat(await (await d.createReadStream()).toArray()).toString());
}

for (const base of Object.keys(BASES)) for (const lang of LANGS) {
  console.log("… roundtrip", base, lang);
  const context = await browser.newContext({ serviceWorkers: "block",  viewport: { width: 390, height: 844 }, locale: lang === "en" ? "en-US" : "es-CO", acceptDownloads: true });
  await context.addInitScript(seed({ lang, tracks: [TRISET_TRACK] }));
  await installSyntheticSupabase(context);
  const page = await context.newPage();
  const consoleEntries = consoleCollector(page);
  try {
    await page.goto(urls[base]); await page.waitForSelector(".shared-navigation", { timeout: 10000 });
    const text = await openWorkoutText(page);
    const perSide = lang === "en" ? "3 × 20 per side" : "3 × 20 por lado";
    const failure = lang === "en" ? "Technical failure" : "Fallo técnico";
    const renderOk = text.includes("3 × 8") && !text.includes("3 × 8 por lado") && text.includes(perSide) && text.includes(failure) && /1\/3/.test(text) && /3\/3/.test(text);
    t.add(`E1 render triserie ${base}/${lang}`, renderOk, text.slice(0, 220));
    await page.locator(".workout-panel .close-button").first().click();
    await page.waitForSelector(".workout-panel", { state: "detached", timeout: 8000 });
    const j1 = await exportJson(page, lang);
    const w = j1.data?.tracks?.[0]?.workout ?? [];
    const exportOk = w[0]?.reps === 8 && w[0]?.repetitionCount === undefined && w[1]?.specialPrescription?.blocks?.[0]?.target === "technical-failure" && w[2]?.repetitionCount === "per-side" && w[2]?.reps === 20 && w[0]?.notes === "nota libre press" && Array.isArray(w[2]?.loadHistory) && w[2].loadHistory[0].setPlan === "3x20" && j1.data.healthProfile.primaryGoal === "strength";
    t.add(`E1 export conserva targets independientes/notas/historial ${base}/${lang}`, exportOk, JSON.stringify(w.map((i) => [i.exerciseId, i.sets, i.reps, i.repetitionCount ?? "-", i.specialPrescription?.blocks?.[0]?.target ?? "-"])));
    await page.reload(); await page.waitForSelector(".shared-navigation", { timeout: 10000 });
    const text2 = await openWorkoutText(page);
    t.add(`E1 recarga conserva ${base}/${lang}`, text2.includes(perSide) && text2.includes(failure) && text2.includes("3 × 8"), text2.slice(0, 120));
    t.add(`E1 consola ${base}/${lang}`, consoleEntries.length === 0, consoleEntries.join("|").slice(0, 100));
  } catch (error) { t.add(`E1 round-trip ${base}/${lang}`, false, String(error).slice(0, 140)); }
  await context.close();

  // Invalid remote enum: remote row carries repetitionCount "sideways"; local valid state must survive, no crash.
  const bad = JSON.parse(JSON.stringify(TRISET_TRACK)); bad.workout[2].repetitionCount = "sideways"; bad.name = "REMOTO INVALIDO";
  const remoteRow = { user_id: "11111111-1111-4111-8111-111111111111", payload: { schemaVersion: 1, profileName: "Remote", language: lang, favoriteIds: [], tracks: [bad], activeTrackId: bad.id, healthProfile: PROFILE, checkIns: [], tracksInitialized: true }, updated_at: "2026-10-12T00:00:00Z" };
  const context2 = await browser.newContext({ serviceWorkers: "block",  viewport: { width: 390, height: 844 }, locale: lang === "en" ? "en-US" : "es-CO", acceptDownloads: true });
  await context2.addInitScript(seed({ lang, tracks: [TRISET_TRACK] }));
  await installSyntheticSupabase(context2, { remoteRow });
  const page2 = await context2.newPage();
  const console2 = consoleCollector(page2);
  try {
    await page2.goto(urls[base]); await page2.waitForSelector(".shared-navigation", { timeout: 10000 });
    await page2.waitForTimeout(1200);
    const stored = await page2.evaluate(() => JSON.parse(localStorage.getItem("repbook-training-tracks") ?? "[]"));
    const kept = stored[0]?.name === "Triserie fixture" && stored[0]?.workout?.[2]?.repetitionCount === "per-side";
    const text3 = await openWorkoutText(page2);
    t.add(`CL-06 enum inválido remoto rechazado sin pérdida ${base}/${lang}`, kept && !text3.includes("REMOTO INVALIDO") && console2.filter((e) => e.startsWith("pageerror")).length === 0, `name=${stored[0]?.name} rc=${stored[0]?.workout?.[2]?.repetitionCount} errors=${console2.length}`);
  } catch (error) { t.add(`CL-06 enum inválido ${base}/${lang}`, false, String(error).slice(0, 140)); }
  await context2.close();
}

// ---- Geometry ----
const intersects = (a, b) => !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);
for (const base of Object.keys(BASES)) for (const lang of LANGS) for (const [w, h] of [[320, 720], [390, 844], [390, 460], [1440, 900]]) {
  console.log("… geometry", base, lang, w, h);
  const context = await browser.newContext({ serviceWorkers: "block",  viewport: { width: w, height: h }, locale: lang === "en" ? "en-US" : "es-CO" });
  await context.addInitScript(seed({ lang, tracks: [TRISET_TRACK, SECOND_TRACK] }));
  await installSyntheticSupabase(context);
  const page = await context.newPage();
  try {
    await page.goto(urls[base]); await page.waitForSelector(".shared-navigation", { timeout: 10000 });
    await page.waitForTimeout(500);
    const positions = ["start", "middle", "end"];
    const findings = [];
    for (const pos of positions) {
      await page.evaluate((p) => { document.documentElement.style.scrollBehavior = "auto"; const max = document.documentElement.scrollHeight - window.innerHeight; window.scrollTo(0, p === "start" ? 0 : p === "middle" ? max / 2 : max); }, pos);
      await page.waitForTimeout(300);
      const r = await page.evaluate(() => {
        const fab = document.querySelector("button.mobile-workout");
        const visible = (el) => { const s = getComputedStyle(el); const b = el.getBoundingClientRect(); return s.display !== "none" && s.visibility !== "hidden" && b.width > 0 && b.height > 0 && b.bottom > 0 && b.top < innerHeight; };
        const out = { fabPresent: Boolean(fab) && getComputedStyle(fab).display !== "none", fabVisible: Boolean(fab) && visible(fab), overlaps: [], overflow: document.documentElement.scrollWidth > innerWidth + 1 };
        if (out.fabVisible) {
          const fb = fab.getBoundingClientRect();
          for (const el of document.querySelectorAll("button, input, select, a, .track-card, textarea")) {
            if (el === fab || fab.contains(el) || !visible(el)) continue;
            const b = el.getBoundingClientRect();
            if (!(fb.right <= b.left || fb.left >= b.right || fb.bottom <= b.top || fb.top >= b.bottom)) out.overlaps.push((el.textContent || el.getAttribute("aria-label") || el.tagName).trim().slice(0, 30));
          }
        }
        const badge = document.querySelector(".weekly-load");
        if (badge) { const card = badge.parentElement.getBoundingClientRect(); const b = badge.getBoundingClientRect(); out.badge = { clipped: badge.scrollWidth > badge.clientWidth + 1 || badge.scrollHeight > badge.clientHeight + 1, inside: b.left >= card.left - 1 && b.right <= card.right + 1, text: badge.textContent.trim().slice(0, 40) }; }
        return out;
      });
      findings.push({ pos, ...r });
    }
    const fabExpected = w < 1440; // desktop hides the floating access (display:none)
    const endFinding = findings.find((f) => f.pos === "end");
    const fabOk = findings.every((f) => f.fabPresent === fabExpected) && (!fabExpected || endFinding.fabVisible) && findings.every((f) => f.overlaps.length === 0);
    const badgeOk = findings.every((f) => !f.badge || (!f.badge.clipped && f.badge.inside));
    const noOverflow = findings.every((f) => !f.overflow);
    t.add(`CA06-06 flotante/badge/overflow ${base}/${lang}/${w}x${h}`, fabOk && badgeOk && noOverflow, JSON.stringify(findings.map((f) => ({ p: f.pos, fab: `${f.fabPresent}/${f.fabVisible}`, ov: f.overlaps, badge: f.badge && [f.badge.clipped, f.badge.inside], of: f.overflow }))).slice(0, 200));
  } catch (error) { t.add(`CA06-06 geometría ${base}/${lang}/${w}x${h}`, false, String(error).slice(0, 140)); }
  await context.close();
}
// Footer breakpoints (F2): both identity blocks visible, text not clipped, no overflow; report box-center offsets.
for (const base of Object.keys(BASES)) for (const lang of LANGS) for (const w of [375, 1049, 1050, 1051]) {
  const context = await browser.newContext({ serviceWorkers: "block",  viewport: { width: w, height: 900 }, locale: lang === "en" ? "en-US" : "es-CO" });
  await context.addInitScript(seed({ lang, tracks: [TRISET_TRACK] }));
  await installSyntheticSupabase(context);
  const page = await context.newPage();
  try {
    await page.goto(urls[base]); await page.waitForSelector("footer .footer-development-credit img", { timeout: 10000 });
    await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; window.scrollTo(0, document.documentElement.scrollHeight); });
    await page.waitForTimeout(300);
    const r = await page.evaluate(() => {
      const box = (el) => el.getBoundingClientRect();
      const brandImg = box(document.querySelector(".footer-brand img")); const brandText = box(document.querySelector(".footer-brand span"));
      const credText = box(document.querySelector(".footer-development-credit span")); const credImg = box(document.querySelector(".footer-development-credit img"));
      const clipped = [...document.querySelectorAll(".footer-brand span, .footer-development-credit span")].some((el) => el.scrollWidth > el.clientWidth + 1);
      return { brandOffset: Math.abs((brandImg.left + brandImg.width / 2) - (brandText.left + brandText.width / 2)).toFixed(1), credOffset: Math.abs((credImg.left + credImg.width / 2) - (credText.left + credText.width / 2)).toFixed(1), credHorizontal: Math.abs(credText.top - credImg.top) < Math.max(credText.height, credImg.height), imgRatio: (credImg.width / credImg.height).toFixed(2), overflow: document.documentElement.scrollWidth > innerWidth + 1, clipped, visible: brandImg.width > 0 && credImg.width > 0 };
    });
    t.add(`F2 footer ${base}/${lang}/${w}`, r.visible && !r.overflow && !r.clipped && r.credHorizontal && Math.abs(Number(r.imgRatio) - 2464 / 671) < 0.05, JSON.stringify(r));
  } catch (error) { t.add(`F2 footer ${base}/${lang}/${w}`, false, String(error).slice(0, 140)); }
  await context.close();
}

writeFileSync(new URL("../results/geometry-roundtrip.json", import.meta.url).pathname, JSON.stringify({ summary: t.summary(), rows: t.rows }, null, 2));
console.log("GEOMETRY/ROUNDTRIP:", t.summary());
await browser.close(); stopServers();
