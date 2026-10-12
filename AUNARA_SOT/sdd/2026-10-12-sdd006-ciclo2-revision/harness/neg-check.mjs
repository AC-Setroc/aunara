// Focused guard checks used for red→green negatives. Usage: node neg-check.mjs <mode> <dir>
// Modes: guest-private | float | storage-get-only | shells. Serves <dir> at / on port 4361, prints GUARD=GREEN|RED.
import { startServer, stopServers, launch, installSyntheticSupabase, storageInitScript, syntheticSession, syntheticUser } from "./lib.mjs";

const [mode, dir] = process.argv.slice(2);
const url = await startServer(4361, "/", dir);
const browser = await launch();
let green = false; let detail = "";
const PROFILE = JSON.stringify({ onboardingCompleted: true, primaryGoal: "strength", equipmentPreference: "mixed", trainingDaysPerWeek: 3, sessionMinutes: 45, birthDate: "", ageYears: null, metabolicSex: "unspecified", heightCm: null, currentWeightKg: null, targetWeightKg: null, waistCm: null, activityLevel: "moderate", experience: "beginner", dietaryPattern: "omnivore", nutritionPlanMode: "simple", macroMealsPerDay: 4, allergies: "", healthNotes: "", readinessScreen: { confirmed: true, chestPain: false, dizzinessOrFainting: false, medicallySupervisedOnly: false, musculoskeletalConcern: false }, limitations: [] });
const TRACKS = JSON.stringify([{ id: "t1", name: "A", kind: "goal", focus: "strength", equipment: "mixed", sessionMinutes: 45, daysPerWeek: 2, creationMode: "manual", trainingDays: ["monday", "thursday"], workout: [{ id: "w1", exerciseId: "0047", sets: 3, reps: 8, day: "monday" }] }, { id: "t2", name: "B", kind: "sport", focus: "running", equipment: "bodyweight", sessionMinutes: 30, daysPerWeek: 2, creationMode: "manual", trainingDays: ["tuesday", "friday"], workout: [{ id: "r1", exerciseId: "0001", sets: 2, reps: 12, day: "tuesday" }] }]);

try {
  if (mode === "guest-private") {
    const context = await browser.newContext({ serviceWorkers: "block",  viewport: { width: 390, height: 844 }, locale: "es-CO" });
    await context.addInitScript(`localStorage.setItem("aunara-storage-notice-v1", "1");`);
    await installSyntheticSupabase(context);
    const page = await context.newPage(); await page.goto(url); await page.waitForSelector(".shared-navigation");
    await page.getByRole("button", { name: "Abrir navegación" }).click();
    const labels = await page.locator("#aunara-navigation nav button").allTextContents();
    green = !labels.includes("Biblioteca de ejercicios") && !labels.includes("Perfil") && !labels.includes("Salir");
    detail = labels.join(" | ");
  } else if (mode === "float") {
    const context = await browser.newContext({ serviceWorkers: "block",  viewport: { width: 390, height: 844 }, locale: "es-CO" });
    const user = syntheticUser({ user_metadata: { health_data_consent: "declined" } });
    await context.addInitScript(`localStorage.setItem("aunara-storage-notice-v1", "1"); localStorage.setItem("repbook-health-profile", ${JSON.stringify(PROFILE)}); localStorage.setItem("repbook-training-tracks", ${JSON.stringify(TRACKS)}); localStorage.setItem("repbook-training-tracks-initialized", "true"); localStorage.setItem("sb-synthetic-auth-token", ${JSON.stringify(JSON.stringify(syntheticSession(user)))});`);
    await installSyntheticSupabase(context);
    const page = await context.newPage(); await page.goto(url); await page.waitForSelector("button.mobile-workout"); await page.waitForTimeout(400);
    const overlaps = [];
    for (const pos of [0, 0.5, 1]) {
      await page.evaluate((p) => { document.documentElement.style.scrollBehavior = "auto"; window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * p); }, pos);
      await page.waitForTimeout(300);
      overlaps.push(...await page.evaluate(() => { const fab = document.querySelector("button.mobile-workout"); const fb = fab.getBoundingClientRect(); const out = []; const vis = (el) => { const s = getComputedStyle(el); const b = el.getBoundingClientRect(); return s.display !== "none" && b.width > 0 && b.bottom > 0 && b.top < innerHeight; }; for (const el of document.querySelectorAll("button, input, select, a, .track-card")) { if (el === fab || fab.contains(el) || !vis(el)) continue; const b = el.getBoundingClientRect(); if (!(fb.right <= b.left || fb.left >= b.right || fb.bottom <= b.top || fb.top >= b.bottom)) out.push((el.textContent || el.getAttribute("aria-label") || "?").trim().slice(0, 25)); } return out; }));
    }
    green = overlaps.length === 0; detail = `overlaps=${JSON.stringify(overlaps.slice(0, 5))}`;
  } else if (mode === "storage-get-only" || mode === "shells") {
    const context = await browser.newContext({ serviceWorkers: "block",  viewport: { width: 390, height: 844 }, locale: "es-CO" });
    if (mode === "storage-get-only") await context.addInitScript(storageInitScript("get-only"));
    await installSyntheticSupabase(context);
    const page = await context.newPage(); await page.goto(url);
    await page.waitForSelector(".shared-navigation, [role=alert]", { timeout: 8000 }).catch(() => null);
    await page.waitForTimeout(500);
    const s = await page.evaluate(() => ({ shells: document.querySelectorAll(".app-shell").length, h1: document.querySelector("[role=alert] h1")?.textContent ?? "", nav: Boolean(document.querySelector(".shared-navigation")), rootKids: document.getElementById("root").children.length }));
    green = mode === "shells" ? s.shells === 1 && s.nav : s.h1 === "No se pudo iniciar Aunara" && s.shells === 1;
    detail = JSON.stringify(s);
  } else { throw new Error(`unknown mode ${mode}`); }
} catch (error) { green = false; detail = `error: ${String(error).slice(0, 120)}`; }
console.log(`GUARD=${green ? "GREEN" : "RED"} mode=${mode} ${detail}`);
await browser.close(); stopServers(); process.exit(0);
