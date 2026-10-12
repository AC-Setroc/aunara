// SDD-006 CA06-02/03/04/05/06 + SDD-002 regressions on the E4 build (Chromium, both bases, ES/EN, 1440/390/320):
//  menu shared by logo and hamburger, public/private inventory, install hidden in standalone, delete modal guards,
//  storage notice, legal dialogs focus, slogan, no horizontal overflow.
import { writeFileSync } from "node:fs";
import { startServer, stopServers, launch, BASES, VIEWPORTS, LANGS, installSyntheticSupabase, consoleCollector, syntheticSession, syntheticUser, tally } from "./lib.mjs";

const BUILDS = new URL("../builds/", import.meta.url).pathname;
const urls = { root: await startServer(4341, "/", `${BUILDS}e4-root`), aunara: await startServer(4342, "/aunara/", `${BUILDS}e4-aunara`) };
const browser = await launch();
const t = tally();
const SESSION_KEY = "sb-synthetic-auth-token";
const L = {
  es: { logo: "Navegación de Aunara", burger: "Abrir navegación", close: "Cerrar navegación", home: "Inicio / rutas", library: "Biblioteca de ejercicios", profile: "Perfil", login: "Ingresar / crear cuenta", account: "Cuenta / privacidad", lang: "Idioma / configuración", help: "Ayuda / instalación", out: "Salir", slogan: "Tu propósito marca el camino.", understood: "Entendido", privacy: "Política de privacidad", terms: "Términos de uso", cookies: "Cookies y almacenamiento", deleteTrigger: "Eliminar cuenta permanentemente", deleteWord: "ELIMINAR", deleteBtn: "Eliminar mi cuenta permanentemente", cancel: "Cancelar", install: "Instalar Aunara ahora" },
  en: { logo: "Aunara navigation", burger: "Open navigation", close: "Close navigation", home: "Home / routes", library: "Exercise library", profile: "Profile", login: "Login / create account", account: "Account / privacy", lang: "Language / settings", help: "Help / installation", out: "Sign out", slogan: "Your purpose leads the way.", understood: "Understood", privacy: "Privacy policy", terms: "Terms of use", cookies: "Cookies and storage", deleteTrigger: "Delete account permanently", deleteWord: "DELETE", deleteBtn: "Delete my account permanently", cancel: "Cancel", install: "Install Aunara now" },
};

function seed({ session, completed = true, standalone = false, notice = true, lang }) {
  const user = syntheticUser({ user_metadata: { health_data_consent: "declined" } });
  const profile = JSON.stringify({ onboardingCompleted: completed, initialRoutineDecision: "rejected", primaryGoal: "strength", equipmentPreference: "mixed", trainingDaysPerWeek: 3, sessionMinutes: 45, birthDate: "", ageYears: null, metabolicSex: "unspecified", heightCm: null, currentWeightKg: null, targetWeightKg: null, waistCm: null, activityLevel: "moderate", experience: "beginner", dietaryPattern: "omnivore", nutritionPlanMode: "simple", macroMealsPerDay: 4, allergies: "", healthNotes: "", readinessScreen: { confirmed: false, chestPain: false, dizzinessOrFainting: false, medicallySupervisedOnly: false, musculoskeletalConcern: false }, limitations: [] });
  return `(() => {
    localStorage.setItem("repbook-language", ${JSON.stringify(JSON.stringify(lang))});
    localStorage.setItem("repbook-health-profile", ${JSON.stringify(profile)});
    localStorage.setItem("repbook-training-tracks-initialized", "true");
    ${notice ? `localStorage.setItem("aunara-storage-notice-v1", "1");` : ""}
    ${session ? `localStorage.setItem(${JSON.stringify(SESSION_KEY)}, ${JSON.stringify(JSON.stringify(syntheticSession(user)))});` : ""}
    ${standalone ? `const mm = window.matchMedia; window.matchMedia = (q) => q.includes("display-mode: standalone") ? { matches: true, media: q, addEventListener(){}, removeEventListener(){}, addListener(){}, removeListener(){} } : mm.call(window, q); Object.defineProperty(navigator, "standalone", { value: true });` : ""}
  })();`;
}

async function ctx(base, lang, vp, opts = {}) {
  const context = await browser.newContext({ serviceWorkers: "block",  viewport: VIEWPORTS[vp], locale: lang === "en" ? "en-US" : "es-CO" });
  await context.addInitScript(seed({ lang, ...opts }));
  const log = [];
  await installSyntheticSupabase(context, { log });
  const page = await context.newPage();
  const consoleEntries = consoleCollector(page);
  await page.goto(urls[base]);
  await page.waitForSelector(".shared-navigation", { timeout: 10000 });
  return { context, page, log, consoleEntries };
}
const menuLabels = (page) => page.locator("#aunara-navigation nav button").allTextContents();

for (const base of Object.keys(BASES)) for (const lang of LANGS) for (const vp of Object.keys(VIEWPORTS)) {
  const tag = `${base}/${lang}/${vp}`; const s = L[lang];
  console.log("…", tag);
  // ---- Guest: menu shared, inventory public, focus/escape, overflow, slogan, legal dialogs, notice ----
  try {
    const { context, page, consoleEntries } = await ctx(base, lang, vp, { session: false, notice: false });
    const notice = page.locator(".storage-notice");
    const noticeShown = (await notice.count()) === 1;
    const coversControls = noticeShown ? await page.evaluate(() => { const n = document.querySelector(".storage-notice").getBoundingClientRect(); const b = (document.querySelector("button.sync-trigger") || document.querySelector("button.guest-account-button")).getBoundingClientRect(); return !(n.bottom <= b.top || n.top >= b.bottom || n.right <= b.left || n.left >= b.right); }) : false;
    await page.getByRole("button", { name: s.understood }).click();
    const noticeGone = (await notice.count()) === 0;
    await page.reload(); await page.waitForSelector(".shared-navigation");
    const noticeAfterReload = await notice.count();
    const ack = await page.evaluate(() => localStorage.getItem("aunara-storage-notice-v1"));
    t.add(`SDD-002 aviso almacenamiento ${tag}`, noticeShown && !coversControls && noticeGone && noticeAfterReload === 0 && Boolean(ack) && !/consent/i.test(ack ?? ""), `shown=${noticeShown} covers=${coversControls} gone=${noticeGone} reload=${noticeAfterReload} key=${ack}`);

    // logo opens the menu
    await page.getByRole("button", { name: s.logo }).click();
    const panel = page.locator("#aunara-navigation");
    const openedByLogo = await panel.isVisible();
    const expandedLogo = await page.getByRole("button", { name: s.logo }).getAttribute("aria-expanded");
    const focusInside = await page.evaluate(() => Boolean(document.activeElement?.closest("#aunara-navigation")));
    await page.keyboard.press("Escape");
    const closedByEsc = (await panel.count()) === 0;
    const focusBackLogo = await page.evaluate((name) => document.activeElement?.getAttribute("aria-label") === name, s.logo);
    // hamburger opens the same panel
    await page.getByRole("button", { name: s.burger }).click();
    const openedByBurger = await panel.isVisible();
    const labels = await menuLabels(page);
    const publicOk = [s.home, s.login, s.lang, s.help].every((x) => labels.includes(x)) && ![s.library, s.profile, s.account, s.out].some((x) => labels.includes(x));
    // Tab trap: Shift+Tab from first wraps to last
    await page.keyboard.press("Shift+Tab");
    const wrapped = await page.evaluate(() => { const b = document.querySelectorAll("#aunara-navigation button"); return document.activeElement === b[b.length - 1]; });
    // selecting a destination closes the menu
    await page.getByRole("button", { name: s.home, exact: true }).click();
    const closedBySelect = (await panel.count()) === 0;
    await page.getByRole("button", { name: s.burger }).click();
    await page.getByRole("button", { name: s.close }).click();
    const focusBackBurger = await page.evaluate((name) => document.activeElement?.getAttribute("aria-label") === name, s.burger);
    t.add(`CA06-02 menú compartido ${tag}`, openedByLogo && expandedLogo === "true" && focusInside && closedByEsc && focusBackLogo && openedByBurger && wrapped && closedBySelect && focusBackBurger, `logo=${openedByLogo}/${expandedLogo} focusIn=${focusInside} esc=${closedByEsc} back=${focusBackLogo} burger=${openedByBurger} trap=${wrapped} select=${closedBySelect} back2=${focusBackBurger}`);
    t.add(`CA06-02 inventario público ${tag}`, publicOk, labels.join(" | "));
    const privateLeak = await page.evaluate(() => Boolean(document.querySelector(".privacy-center, .profile-trigger")));
    t.add(`CA06-03 invitado sin datos privados ${tag}`, !privateLeak, `leak=${privateLeak}`);

    // slogan + overflow
    const slogan = await page.locator(".footer-brand span").first().textContent();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    t.add(`CA06-06 slogan y sin overflow ${tag}`, slogan === s.slogan && !overflow, `slogan="${slogan}" overflow=${overflow}`);

    // legal dialogs: open each from footer, Escape closes, focus returns to the opener, Tab stays inside
    for (const doc of ["privacy", "terms", "cookies"]) {
      const opener = page.getByRole("button", { name: s[doc] });
      await opener.scrollIntoViewIfNeeded(); await opener.click();
      const dialog = page.locator(".legal-panel[role=dialog]");
      const visible = await dialog.isVisible();
      const focusIn = await page.evaluate(() => Boolean(document.activeElement?.closest(".legal-panel")));
      await page.keyboard.press("Tab"); await page.keyboard.press("Tab");
      const stillIn = await page.evaluate(() => Boolean(document.activeElement?.closest(".legal-panel")));
      await page.keyboard.press("Escape");
      const closed = (await dialog.count()) === 0;
      const back = await page.evaluate((name) => document.activeElement?.textContent?.trim() === name, s[doc]);
      t.add(`SDD-002 diálogo ${doc} ${tag}`, visible && focusIn && stillIn && closed && back, `visible=${visible} focusIn=${focusIn} tabIn=${stillIn} closed=${closed} back=${back}`);
    }
    t.add(`consola invitado ${tag}`, consoleEntries.length === 0, consoleEntries.join(" | ").slice(0, 100));
    await context.close();
  } catch (error) { t.add(`bloque invitado ${tag}`, false, `error: ${String(error).slice(0, 140)}`); }

  // ---- Signed in: private inventory, delete modal guards, install section present (browser) ----
  try {
    const { context, page, log } = await ctx(base, lang, vp, { session: true });
    await page.getByRole("button", { name: s.burger }).click();
    const labels = await menuLabels(page);
    const privateOk = [s.home, s.library, s.profile, s.account, s.lang, s.help, s.out].every((x) => labels.includes(x)) && !labels.includes(s.login);
    t.add(`CA06-02 inventario privado ${tag}`, privateOk, labels.join(" | "));
    await page.getByRole("button", { name: s.account, exact: true }).click();
    await page.waitForSelector(".privacy-center", { timeout: 8000 });
    const installPresent = await page.locator("#install-title").count();
    t.add(`CA06-05 instalación visible en navegador ${tag}`, installPresent === 1, `install-title=${installPresent}`);

    // delete modal
    const deletes = () => log.filter((l) => l.path?.includes("delete-my-account")).length;
    await page.getByRole("button", { name: s.deleteTrigger, exact: true }).click();
    const dialog = page.locator(".account-deletion[role=dialog]");
    const open1 = await dialog.isVisible();
    const btn = page.getByRole("button", { name: s.deleteBtn });
    const disabledEmpty = await btn.isDisabled();
    const input = page.getByLabel(lang === "en" ? "Type DELETE to confirm" : "Escribí ELIMINAR para confirmar");
    await input.fill(lang === "en" ? "delete" : "eliminar");
    const disabledWrong = await btn.isDisabled();
    await input.fill(lang === "en" ? "ELIMINAR" : "DELETE"); // other language's word must not count
    const disabledOtherLang = await btn.isDisabled();
    await input.fill(s.deleteWord);
    const enabledExact = !(await btn.isDisabled());
    // Escape never deletes; reopening resets the field
    await page.keyboard.press("Escape");
    const closedEsc = (await dialog.count()) === 0;
    await page.getByRole("button", { name: s.deleteTrigger, exact: true }).click();
    const resetValue = await input.inputValue();
    await input.fill(s.deleteWord);
    // language switch resets the entry
    // Each language change is a snapshot change → debounced cloud save (800 ms). Two changes inside the debounce window
    // that return to the last saved snapshot leave useCloudSync in "syncing" (pre-existing in main, see receipt H-01);
    // we wait for the first save to settle so the step measures the modal, not that race.
    await page.locator(".language-select select").selectOption(lang === "en" ? "es" : "en");
    await page.waitForSelector(".sync-trigger.is-synced", { state: "attached", timeout: 20000 });
    await page.locator(".language-select select").selectOption(lang);
    const afterLang = await dialog.count() ? await input.inputValue() : "(closed)";
    await page.waitForSelector(".sync-trigger.is-synced", { state: "attached", timeout: 20000 });
    await page.waitForFunction(() => !document.querySelector(".account-deletion button[disabled]:first-of-type"), null, { timeout: 20000 }).catch(() => null);
    if (await dialog.count()) { await page.getByRole("button", { name: s.cancel }).click(); }
    const closedCancel = (await dialog.count()) === 0;
    const zeroCalls = deletes() === 0;
    // valid confirmation calls the handler exactly once
    await page.getByRole("button", { name: s.deleteTrigger, exact: true }).click();
    await input.fill(s.deleteWord);
    await page.waitForFunction(() => !document.querySelector(".account-deletion button[disabled]:first-of-type"), null, { timeout: 20000 }).catch(() => null);
    await btn.click();
    await page.waitForTimeout(800);
    const oneCall = deletes() === 1;
    t.add(`CA06-04 modal de borrado ${tag}`, open1 && disabledEmpty && disabledWrong && disabledOtherLang && enabledExact && closedEsc && resetValue === "" && afterLang !== s.deleteWord && closedCancel && zeroCalls && oneCall, `open=${open1} empty=${disabledEmpty} wrong=${disabledWrong} otherLang=${disabledOtherLang} exact=${enabledExact} esc=${closedEsc} reset="${resetValue}" afterLang="${afterLang}" cancel=${closedCancel} calls0=${zeroCalls} calls1=${oneCall}`);
    await context.close();
  } catch (error) { t.add(`bloque sesión ${tag}`, false, `error: ${String(error).slice(0, 140)}`); }

  // ---- Standalone: install section and help entry hidden ----
  try {
    const { context, page } = await ctx(base, lang, vp, { session: true, standalone: true });
    await page.getByRole("button", { name: s.burger }).click();
    const labels = await menuLabels(page);
    await page.getByRole("button", { name: s.account, exact: true }).click();
    await page.waitForSelector(".access-panel", { timeout: 8000 });
    const installPresent = await page.locator("#install-title").count();
    const installBtn = await page.getByRole("button", { name: s.install }).count();
    t.add(`CA06-05 standalone oculta instalación ${tag}`, !labels.includes(s.help) && installPresent === 0 && installBtn === 0, `help=${labels.includes(s.help)} title=${installPresent} btn=${installBtn}`);
    await context.close();
  } catch (error) { t.add(`bloque standalone ${tag}`, false, `error: ${String(error).slice(0, 140)}`); }
}

writeFileSync(new URL("../results/ui-navigation.json", import.meta.url).pathname, JSON.stringify({ summary: t.summary(), rows: t.rows }, null, 2));
console.log("UI NAVIGATION:", t.summary());
await browser.close(); stopServers();
