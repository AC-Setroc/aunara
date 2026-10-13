import { startServer, stopServers, launch, installSyntheticSupabase, syntheticSession, syntheticUser } from "./lib.mjs";
const BUILDS = new URL("../builds/", import.meta.url).pathname;
const url = await startServer(4383, "/", `${BUILDS}${process.env.BUILD ?? "h02-root"}`);
const browser = await launch();
const user = syntheticUser({ user_metadata: { health_data_consent: "declined" } });
for (const [name, vp] of [["desktop", { width: 1440, height: 900 }], ["mobile", { width: 390, height: 844 }]]) {
  const context = await browser.newContext({ serviceWorkers: "block", viewport: vp, locale: "es-CO" });
  await context.addInitScript(`localStorage.setItem("aunara-storage-notice-v1", "1"); localStorage.setItem("repbook-training-tracks-initialized", "true"); localStorage.setItem("repbook-health-profile", JSON.stringify({ onboardingCompleted: true, initialRoutineDecision: "rejected", primaryGoal: "strength", equipmentPreference: "mixed", trainingDaysPerWeek: 3, sessionMinutes: 45, birthDate: "", ageYears: null, metabolicSex: "unspecified", heightCm: null, currentWeightKg: null, targetWeightKg: null, waistCm: null, activityLevel: "moderate", experience: "beginner", dietaryPattern: "omnivore", nutritionPlanMode: "simple", macroMealsPerDay: 4, allergies: "", healthNotes: "", readinessScreen: { confirmed: false, chestPain: false, dizzinessOrFainting: false, medicallySupervisedOnly: false, musculoskeletalConcern: false }, limitations: [] })); localStorage.setItem("sb-synthetic-auth-token", ${JSON.stringify(JSON.stringify(syntheticSession(user)))});`);
  await installSyntheticSupabase(context);
  const page = await context.newPage(); await page.goto(url); await page.waitForSelector(".sync-trigger.is-synced", { state: "attached", timeout: 15000 });
  await page.getByRole("button", { name: /Abrir navegación|Navegación de Aunara/ }).first().click();
  await page.waitForSelector("#aunara-navigation"); await page.waitForTimeout(300);
  const geo = await page.evaluate(() => { const m = document.querySelector("#aunara-navigation"); const r = m.getBoundingClientRect(); const nav = m.querySelector("nav"); const cs = getComputedStyle(nav); const items = [...m.querySelectorAll("nav button")].map((b) => { const q = b.getBoundingClientRect(); return { t: b.textContent.trim().slice(0, 18), x: Math.round(q.x), y: Math.round(q.y), w: Math.round(q.width) }; }); return { menu: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }, navDisplay: cs.display, navFlexDirection: cs.flexDirection, navOverflowX: cs.overflowX, scrollW: nav.scrollWidth, clientW: nav.clientWidth, items }; });
  console.log(name, JSON.stringify(geo));
  await page.screenshot({ path: `../results/uat13-menu-${name}.png`, clip: { x: 0, y: 0, width: vp.width, height: Math.min(400, vp.height) } });
  await context.close();
}
await browser.close(); stopServers();
