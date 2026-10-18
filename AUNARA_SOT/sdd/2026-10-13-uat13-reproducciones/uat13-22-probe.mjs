// UAT13-22: change training experience in Profile → Resumen, switch to Cuerpo y salud and back; read what each tab shows,
// what is persisted, and what "Guardar preferencias" / "Listo" do. Dev build, synthetic session.
import { startServer, stopServers, launch, installSyntheticSupabase, syntheticSession, syntheticUser } from "./lib.mjs";
const BUILDS = new URL("../builds/", import.meta.url).pathname;
const url = await startServer(4384, "/", `${BUILDS}${process.env.BUILD ?? "h02-root"}`);
const browser = await launch();
const user = syntheticUser({ user_metadata: { health_data_consent: "granted" } });
const PROFILE = { onboardingCompleted: true, initialRoutineDecision: "rejected", healthDataMode: "personalized", primaryGoal: "strength", equipmentPreference: "mixed", trainingDaysPerWeek: 3, sessionMinutes: 45, birthDate: "", ageYears: null, metabolicSex: "unspecified", heightCm: null, currentWeightKg: null, targetWeightKg: null, waistCm: null, activityLevel: "moderate", experience: "beginner", dietaryPattern: "omnivore", nutritionPlanMode: "simple", macroMealsPerDay: 4, allergies: "", healthNotes: "", readinessScreen: { confirmed: false, chestPain: false, dizzinessOrFainting: false, medicallySupervisedOnly: false, musculoskeletalConcern: false }, limitations: [] };
const context = await browser.newContext({ serviceWorkers: "block", viewport: { width: 1440, height: 900 }, locale: "es-CO" });
await context.addInitScript(`localStorage.setItem("aunara-storage-notice-v1", "1"); localStorage.setItem("repbook-training-tracks-initialized", "true"); localStorage.setItem("repbook-health-profile", ${JSON.stringify(JSON.stringify(PROFILE))}); localStorage.setItem("sb-synthetic-auth-token", ${JSON.stringify(JSON.stringify(syntheticSession(user)))});`);
await installSyntheticSupabase(context);
const page = await context.newPage(); await page.goto(url); await page.waitForSelector(".sync-trigger.is-synced", { state: "attached", timeout: 15000 });
await page.locator("button.profile-trigger").click(); await page.waitForSelector(".profile-done");
const stored = () => page.evaluate(() => JSON.parse(localStorage.getItem("repbook-health-profile")).experience);
const sel = () => page.getByLabel("Experiencia entrenando");
const step = {};
step.inicialResumen = await sel().inputValue();
await sel().selectOption("intermediate");
step.resumenTrasCambiar = await sel().inputValue(); step.storedTrasCambiar = await stored();
await page.getByRole("button", { name: "Cuerpo y salud" }).click(); await page.waitForTimeout(200);
step.cuerpoYSalud = await sel().inputValue(); step.storedEnCuerpo = await stored();
await page.getByRole("button", { name: "Resumen" }).click(); await page.waitForTimeout(200);
step.resumenAlVolver = await sel().inputValue();
// Try again, this time saving with the preferences button before switching
await sel().selectOption("intermediate");
await page.getByRole("button", { name: /Guardar preferencias/ }).click(); await page.waitForTimeout(300);
step.storedTrasGuardar = await stored();
await page.getByRole("button", { name: "Cuerpo y salud" }).click(); await page.waitForTimeout(200);
step.cuerpoTrasGuardar = await sel().inputValue();
// Change in Cuerpo y salud directly → immediate?
await sel().selectOption("advanced"); await page.waitForTimeout(200);
step.storedTrasCambiarEnCuerpo = await stored();
await page.getByRole("button", { name: "Resumen" }).click(); await page.waitForTimeout(200);
step.resumenTrasCambiarEnCuerpo = await sel().inputValue();
// Unsaved change then Listo
await sel().selectOption("beginner"); await page.locator(".profile-done").click(); await page.waitForTimeout(300);
step.storedTrasListoSinGuardar = await stored();
console.log(JSON.stringify(step));
await browser.close(); stopServers();
