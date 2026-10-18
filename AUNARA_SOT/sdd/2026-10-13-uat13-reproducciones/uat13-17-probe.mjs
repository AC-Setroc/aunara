// UAT13-17: with a two-day route, what can the person do from each day's box in view mode and in edit mode? Dev build.
import { startServer, stopServers, launch, installSyntheticSupabase, syntheticSession, syntheticUser } from "./lib.mjs";
const BUILDS = new URL("../builds/", import.meta.url).pathname;
const url = await startServer(4385, "/", `${BUILDS}${process.env.BUILD ?? "h02-root"}`);
const browser = await launch();
const user = syntheticUser({ user_metadata: { health_data_consent: "declined" } });
const PROFILE = { onboardingCompleted: true, initialRoutineDecision: "rejected", primaryGoal: "strength", equipmentPreference: "mixed", trainingDaysPerWeek: 3, sessionMinutes: 45, birthDate: "", ageYears: null, metabolicSex: "unspecified", heightCm: null, currentWeightKg: null, targetWeightKg: null, waistCm: null, activityLevel: "moderate", experience: "intermediate", dietaryPattern: "omnivore", nutritionPlanMode: "simple", macroMealsPerDay: 4, allergies: "", healthNotes: "", readinessScreen: { confirmed: true, chestPain: false, dizzinessOrFainting: false, medicallySupervisedOnly: false, musculoskeletalConcern: false }, limitations: [] };
const TRACKS = [{ id: "t1", name: "Fuerza base", kind: "goal", focus: "strength", equipment: "mixed", sessionMinutes: 45, daysPerWeek: 2, creationMode: "manual", trainingDays: ["monday", "thursday"], workout: [{ id: "w1", exerciseId: "0047", sets: 3, reps: 8, day: "monday" }] }];
for (const [name, vp] of [["desktop", { width: 1440, height: 900 }], ["mobile", { width: 390, height: 844 }]]) {
  const context = await browser.newContext({ serviceWorkers: "block", viewport: vp, locale: "es-CO" });
  await context.addInitScript(`localStorage.setItem("aunara-storage-notice-v1", "1"); localStorage.setItem("repbook-training-tracks-initialized", "true"); localStorage.setItem("repbook-health-profile", ${JSON.stringify(JSON.stringify(PROFILE))}); localStorage.setItem("repbook-training-tracks", ${JSON.stringify(JSON.stringify(TRACKS))}); localStorage.setItem("repbook-active-track", '"t1"'); localStorage.setItem("sb-synthetic-auth-token", ${JSON.stringify(JSON.stringify(syntheticSession(user)))});`);
  await installSyntheticSupabase(context);
  const page = await context.newPage(); await page.goto(url); await page.waitForSelector(".sync-trigger.is-synced", { state: "attached", timeout: 15000 });
  const texts = (sel) => page.evaluate((s) => [...document.querySelectorAll(s)].map((b) => b.textContent.trim().replace(/\s+/g, " ").slice(0, 40)).filter(Boolean), sel);
  // What the home shows for the route and its days (day boxes) before opening the editor
  const home = { dayBoxes: await texts(".track-card button, .track-days button, .training-day, [class*='day'] button"), cardButtons: await texts(".track-card button") };
  const mobile = page.locator("button.mobile-workout");
  if (await mobile.isVisible().catch(() => false)) await mobile.click(); else await page.locator("button.workout-trigger").first().click();
  await page.waitForSelector(".workout-panel");
  const view = { buttons: await texts(".workout-panel button"), adder: await page.locator(".manual-exercise-adder").count(), daySections: await texts(".workout-panel .training-session-day, .workout-panel h3, .workout-panel h4") };
  await page.getByRole("button", { name: "Editar rutina" }).first().click(); await page.waitForTimeout(300);
  const edit = { adders: await page.locator(".manual-exercise-adder").count(), dayPicker: await texts(".compact-day-picker button"), adderHeading: await texts(".manual-adder-heading strong"), buttons: await texts(".workout-panel button") };
  console.log(name, JSON.stringify({ home, view, edit }));
  await context.close();
}
await browser.close(); stopServers();
