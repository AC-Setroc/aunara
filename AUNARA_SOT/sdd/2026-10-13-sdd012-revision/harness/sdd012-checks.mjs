// SDD-012 S12-01…S12-06 on a compiled build. Usage: BROWSER=chromium|webkit BUILD=sdd012-root node sdd012-checks.mjs
import { writeFileSync } from "node:fs";
import { startServer, stopServers, launch, VIEWPORTS, LANGS, installSyntheticSupabase, syntheticSession, syntheticUser, tally, setLanguageViaMenu } from "./lib.mjs";
const BUILDS = new URL("../builds/", import.meta.url).pathname;
const BUILD = process.env.BUILD ?? "sdd012-root";
const BASE = process.env.BASE ?? "/";
const url = await startServer(4390, BASE, `${BUILDS}${BUILD}`);
const browser = await launch();
const t = tally();
const PROFILE = { onboardingCompleted: true, initialRoutineDecision: "rejected", healthDataMode: "personalized", primaryGoal: "strength", goals: ["strength"], equipmentPreference: "mixed", trainingDaysPerWeek: 3, sessionMinutes: 45, birthDate: "", ageYears: null, metabolicSex: "unspecified", heightCm: null, currentWeightKg: null, targetWeightKg: null, waistCm: null, activityLevel: "moderate", experience: "beginner", dietaryPattern: "omnivore", nutritionPlanMode: "simple", macroMealsPerDay: 4, allergies: "", healthNotes: "", readinessScreen: { confirmed: false, chestPain: false, dizzinessOrFainting: false, medicallySupervisedOnly: false, musculoskeletalConcern: false }, limitations: [] };
async function open({ session, lang, vp }) {
  const user = syntheticUser({ user_metadata: { health_data_consent: "granted" } });
  const context = await browser.newContext({ serviceWorkers: "block", viewport: VIEWPORTS[vp], locale: lang === "en" ? "en-US" : "es-CO" });
  await context.addInitScript(`localStorage.setItem("repbook-language", ${JSON.stringify(JSON.stringify(lang))}); localStorage.setItem("aunara-storage-notice-v1", "1"); localStorage.setItem("repbook-training-tracks-initialized", "true"); localStorage.setItem("repbook-health-profile", ${JSON.stringify(JSON.stringify(PROFILE))}); ${session ? `localStorage.setItem("sb-synthetic-auth-token", ${JSON.stringify(JSON.stringify(syntheticSession(user)))});` : ""}`);
  const log = []; await installSyntheticSupabase(context, { log });
  const page = await context.newPage(); await page.goto(url); await page.waitForSelector(".shared-navigation");
  if (session) await page.waitForSelector(".sync-trigger.is-synced", { state: "attached", timeout: 15000 });
  return { context, page, log };
}
const L = { es: { logo: "Navegación de Aunara", burger: "Abrir navegación", login: "Ingresar / crear cuenta", account: "Cuenta / privacidad", lang: "Idioma / configuración", out: "Salir" }, en: { logo: "Aunara navigation", burger: "Open navigation", login: "Login / create account", account: "Account / privacy", lang: "Language / settings", out: "Sign out" } };

for (const session of [false, true]) for (const lang of LANGS) for (const vp of ["desktop", "mobile"]) {
  const tag = `${session ? "sesión" : "invitado"}/${lang}/${vp}`; const s = L[lang];
  const { context, page, log } = await open({ session, lang, vp });
  try {
    // S12-02: logo first, hamburger last in the header row; banner without language select / guest login
    const row = await page.evaluate(() => { const r = document.querySelector(".site-header .shared-navigation"); const kids = [...r.children].filter((el) => getComputedStyle(el).display !== "none"); const rect = (el) => el.getBoundingClientRect(); const xs = kids.map((el) => ({ cls: el.className, x: Math.round(rect(el).x), right: Math.round(rect(el).right) })); const all = [...r.querySelectorAll("button, a, select")].filter((el) => el.getClientRects().length).map((el) => ({ name: (el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 24), x: Math.round(rect(el).x) })); return { first: kids[0]?.className, last: kids[kids.length - 1]?.className, xs, maxX: Math.max(...all.map((a) => a.x)), burgerX: Math.round(rect(r.querySelector(".navigation-trigger")).x), logoX: Math.round(rect(r.querySelector(".brand")).x), minX: Math.min(...all.map((a) => a.x)), langInBanner: r.querySelectorAll(".language-select").length, guestBtn: r.querySelectorAll(".guest-account-button").length, overflow: document.documentElement.scrollWidth > innerWidth + 1 }; });
    t.add(`S12-02 hamburguesa última y logo primero ${tag}`, row.last === "navigation-trigger" && row.first === "brand" && row.burgerX === row.maxX && row.logoX === row.minX && !row.overflow, JSON.stringify(row).slice(0, 220));
    t.add(`S12-03 banner sin idioma ni Ingresar ${tag}`, row.langInBanner === 0 && row.guestBtn === 0, `lang=${row.langInBanner} guest=${row.guestBtn}`);
    // S12-01: open by logo and by hamburger → panel geometry
    for (const opener of [s.logo, s.burger]) {
      await page.getByRole("button", { name: opener }).click();
      await page.waitForSelector("#aunara-navigation"); await page.waitForTimeout(150);
      const g = await page.evaluate(() => { const m = document.querySelector("#aunara-navigation"); const r = m.getBoundingClientRect(); const nav = m.querySelector("nav"); const cs = getComputedStyle(nav); const items = [...nav.querySelectorAll("button")].map((b) => Math.round(b.getBoundingClientRect().x)); return { inHeader: Boolean(m.closest(".site-header")), y: Math.round(r.y), bottom: Math.round(r.bottom), vh: innerHeight, display: cs.display, sameX: new Set(items).size === 1, scrollW: nav.scrollWidth, clientW: nav.clientWidth, items: items.length }; });
      t.add(`S12-01 panel íntegro y en columna (${opener === s.logo ? "logo" : "hamburguesa"}) ${tag}`, !g.inHeader && g.y >= 0 && g.bottom <= g.vh && g.display === "grid" && g.sameX && g.scrollW === g.clientW && g.items >= 3, JSON.stringify(g));
      const labels = await page.locator("#aunara-navigation nav button").allTextContents();
      const hasSelect = await page.locator("#aunara-navigation .language-select select").count();
      t.add(`S12-03 panel con selector de idioma y entrada de cuenta ${tag} (${opener === s.logo ? "logo" : "hamburguesa"})`, hasSelect === 1 && labels.includes(session ? s.account : s.login) && !labels.includes(s.lang), `select=${hasSelect} labels=${labels.join("|")}`);
      await page.evaluate(() => document.querySelector("#aunara-navigation > button")?.click());
      await page.waitForSelector("#aunara-navigation", { state: "detached" });
    }
    // S12-03: changing language inside the panel keeps it open and translates it
    await page.getByRole("button", { name: s.burger }).click(); await page.waitForSelector("#aunara-navigation .language-select select");
    const other = lang === "en" ? "es" : "en";
    await page.selectOption("#aunara-navigation .language-select select", other); await page.waitForTimeout(150);
    const stillOpen = await page.locator("#aunara-navigation").count();
    const translated = (await page.locator("#aunara-navigation nav button").allTextContents()).includes(session ? L[other].account : L[other].login);
    t.add(`S12-03 cambio de idioma dentro del panel ${tag}`, stillOpen === 1 && translated, `open=${stillOpen} translated=${translated}`);
    await page.selectOption("#aunara-navigation .language-select select", lang);
    await page.evaluate(() => document.querySelector("#aunara-navigation > button")?.click()); await page.waitForSelector("#aunara-navigation", { state: "detached" });
    // S12-04 / S12-05: profile
    if (session) {
      await page.locator("button.profile-trigger").click(); await page.waitForSelector(".profile-done");
      const outLabel = s.out;
      const hasOut = await page.getByRole("button", { name: outLabel }).count();
      const expCount = await page.getByLabel(lang === "en" ? "Training experience" : "Experiencia entrenando").count();
      await page.getByLabel(lang === "en" ? "Training experience" : "Experiencia entrenando").selectOption("intermediate"); await page.waitForTimeout(150);
      const stored1 = await page.evaluate(() => JSON.parse(localStorage.getItem("repbook-health-profile")).experience);
      await page.getByRole("button", { name: lang === "en" ? "Body and health" : "Cuerpo y salud" }).click(); await page.waitForTimeout(150);
      const expInBody = await page.getByLabel(lang === "en" ? "Training experience" : "Experiencia entrenando").count();
      await page.getByRole("button", { name: lang === "en" ? "Overview" : "Resumen" }).click(); await page.waitForTimeout(150);
      await page.getByLabel(lang === "en" ? "Training days per week" : "Días de entrenamiento por semana").fill("0"); await page.waitForTimeout(150);
      const storedDays = await page.evaluate(() => JSON.parse(localStorage.getItem("repbook-health-profile")).trainingDaysPerWeek);
      const warning = await page.locator(".profile-training-preferences [role=status]").count();
      await page.getByLabel(lang === "en" ? "Training days per week" : "Días de entrenamiento por semana").fill("4"); await page.waitForTimeout(150);
      const noSave = await page.getByRole("button", { name: lang === "en" ? "Save training preferences" : "Guardar preferencias de entrenamiento" }).count();
      await page.locator(".profile-done").click(); await page.waitForTimeout(150);
      const stored2 = await page.evaluate(() => { const p = JSON.parse(localStorage.getItem("repbook-health-profile")); return `${p.experience}/${p.trainingDaysPerWeek}`; });
      t.add(`S12-05 un control de experiencia, persiste al instante, inválido no persiste, Listo conserva ${tag}`, expCount === 1 && stored1 === "intermediate" && expInBody === 0 && storedDays === 3 && warning === 1 && noSave === 0 && stored2 === "intermediate/4", `exp=${expCount} stored1=${stored1} body=${expInBody} days0→${storedDays} warn=${warning} save=${noSave} final=${stored2}`);
      await page.locator("button.profile-trigger").click(); await page.waitForSelector(".profile-done");
      const logouts = () => log.filter((l) => l.path === "/auth/v1/logout").length;
      await page.getByRole("button", { name: outLabel }).click(); await page.waitForTimeout(1200);
      const profileClosed = (await page.locator(".profile-done").count()) === 0;
      const guestNow = (await page.locator("button.sync-trigger").count()) === 0;
      t.add(`S12-04 Salir en el perfil ${tag}`, hasOut === 1 && profileClosed && logouts() === 1 && guestNow, `salir=${hasOut} closed=${profileClosed} logouts=${logouts()} guest=${guestNow}`);
    } else {
      // Guest: the account entry inside the menu opens the access panel; the panel's sign-in form has no profile sign-out.
      await page.getByRole("button", { name: s.burger }).click(); await page.getByRole("button", { name: s.login }).click();
      const access = await page.locator(".access-panel").count();
      t.add(`S12-03 entrada Ingresar del menú abre el acceso ${tag}`, access === 1, `access=${access}`);
    }
  } catch (error) { t.add(`bloque ${tag}`, false, `error: ${String(error).slice(0, 160)}`); }
  await context.close();
}

// S12-06: pending-verification resend button colors (desktop + mobile, es)
for (const vp of ["desktop", "mobile"]) {
  const { context, page } = await open({ session: false, lang: "es", vp });
  try {
    await context.route("**/auth/v1/signup", (route) => route.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify({ user: syntheticUser({ email: "uat@example.invalid" }), session: null }) }));
    await page.getByRole("button", { name: L.es.burger }).click(); await page.getByRole("button", { name: L.es.login }).click(); await page.waitForSelector(".access-panel form");
    const create = page.locator(".access-mode").getByRole("button", { name: /Crear/ }); if (await create.count()) await create.first().click();
    const form = page.locator(".access-panel form");
    await form.locator('input[type="text"]:not([inputmode="email"])').first().fill("Atleta UAT");
    await form.locator('input[inputmode="email"]').fill("uat@example.invalid");
    const pw = form.locator('input[type="password"]'); await pw.nth(0).fill("ClaveSegura-2026"); if (await pw.count() > 1) await pw.nth(1).fill("ClaveSegura-2026");
    await form.locator('input[type="checkbox"]').first().check();
    await form.getByRole("button", { name: /Crear mi cuenta/ }).click(); await page.waitForSelector(".account-verification", { timeout: 8000 });
    const m = await page.evaluate(() => { const el = document.querySelector(".account-verification .verification-resend"); const cs = getComputedStyle(el); const lum = (c) => { const [r, g, b] = c.match(/\d+/g).map(Number).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; }; const l1 = lum(cs.color), l2 = lum(cs.backgroundColor); const contrast = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); return { color: cs.color, bg: cs.backgroundColor, contrast: Math.round(contrast * 100) / 100 }; });
    await page.hover(".account-verification .verification-resend");
    const h = await page.evaluate(() => { const el = document.querySelector(".account-verification .verification-resend"); const cs = getComputedStyle(el); return { color: cs.color, bg: cs.backgroundColor }; });
    t.add(`S12-06 reenviar legible sin hover (${vp})`, m.color !== m.bg && m.contrast >= 4.5 && h.color !== h.bg, JSON.stringify({ normal: m, hover: h }));
  } catch (error) { t.add(`S12-06 (${vp})`, false, `error: ${String(error).slice(0, 160)}`); }
  await context.close();
}

writeFileSync(new URL(`../results/sdd012-${process.env.BROWSER ?? "chromium"}-${BUILD}.json`, import.meta.url).pathname, JSON.stringify({ build: BUILD, base: BASE, browser: process.env.BROWSER ?? "chromium", summary: t.summary(), rows: t.rows }, null, 2));
console.log(`SDD-012 [${process.env.BROWSER ?? "chromium"} ${BUILD}]:`, t.summary());
await browser.close(); stopServers();
