// Security lens (H-02 evidence; run with BROWSER=webkit or chromium): full flow (load, account panel, export, language change, delete modal, sign-out) → list every host contacted
// and every blocked (non-synthetic) request; check the session token never appears in the DOM; check what the save POST carries.
import { startServer, stopServers, launch, installSyntheticSupabase, syntheticSession, syntheticUser } from "./lib.mjs";
const BUILDS = new URL("../builds/", import.meta.url).pathname;
const url = await startServer(4378, "/", `${BUILDS}e4-root`);
const browser = await launch();
const user = syntheticUser({ user_metadata: { health_data_consent: "declined" } });
const profile = JSON.stringify({ onboardingCompleted: true, initialRoutineDecision: "rejected", primaryGoal: "strength", equipmentPreference: "mixed", trainingDaysPerWeek: 3, sessionMinutes: 45, birthDate: "", ageYears: null, metabolicSex: "unspecified", heightCm: null, currentWeightKg: null, targetWeightKg: null, waistCm: null, activityLevel: "moderate", experience: "beginner", dietaryPattern: "omnivore", nutritionPlanMode: "simple", macroMealsPerDay: 4, allergies: "", healthNotes: "nota de salud sintética", readinessScreen: { confirmed: false, chestPain: false, dizzinessOrFainting: false, medicallySupervisedOnly: false, musculoskeletalConcern: false }, limitations: [] });
const context = await browser.newContext({ serviceWorkers: "block", viewport: { width: 390, height: 844 }, locale: "es-CO", acceptDownloads: true });
await context.addInitScript(`localStorage.setItem("repbook-language", '"es"'); localStorage.setItem("repbook-profile-name", '"Atleta sintético"'); localStorage.setItem("repbook-health-profile", ${JSON.stringify(profile)}); localStorage.setItem("repbook-training-tracks-initialized", "true"); localStorage.setItem("aunara-storage-notice-v1", "1"); localStorage.setItem("sb-synthetic-auth-token", ${JSON.stringify(JSON.stringify(syntheticSession(user)))});`);
const log = []; await installSyntheticSupabase(context, { log });
const hosts = new Set(); const posts = [];
context.on("request", (r) => { const u = new URL(r.url()); hosts.add(u.hostname); if (r.method() === "POST" && u.pathname.includes("repbook_user_data")) posts.push(r.postData() ?? ""); });
const page = await context.newPage();
await page.goto(url); await page.waitForSelector(".sync-trigger.is-synced", { state: "attached", timeout: 15000 });
await page.locator("button.sync-trigger").click(); await page.waitForSelector(".privacy-center");
const [d] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Exportar mis datos" }).click()]);
const exported = JSON.parse(Buffer.concat(await (await d.createReadStream()).toArray()).toString());
await page.locator(".language-select select").selectOption("en"); await page.waitForTimeout(2000);
await page.getByRole("button", { name: "Delete account permanently", exact: true }).click(); await page.keyboard.press("Escape");
await page.getByRole("button", { name: "Sign out", exact: true }).click(); await page.waitForTimeout(1500);
const html = await page.content();
const blocked = log.filter((l) => l.blocked).map((l) => l.blocked);
const body = posts.at(-1) ?? "";
console.log(JSON.stringify({
  hosts: [...hosts], blocked, requests: log.filter((l) => l.method).map((l) => `${l.method} ${l.path}`),
  tokenInDom: html.includes("synthetic-access-token") || html.includes("synthetic-refresh-token"),
  tokenInExport: JSON.stringify(exported).includes("synthetic-access-token"),
  exportKeys: Object.keys(exported), dataKeys: Object.keys(exported.data ?? {}),
  savePostHasAuthHeaderOnly: !body.includes("synthetic-access-token"), savePostCarriesHealthNotes: body.includes("nota de salud sintética"), savePostUserId: /11111111-1111-4111-8111-111111111111/.test(body),
  storageAfterSignOut: await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith("sb-"))),
}, null, 1));
await browser.close(); stopServers();
