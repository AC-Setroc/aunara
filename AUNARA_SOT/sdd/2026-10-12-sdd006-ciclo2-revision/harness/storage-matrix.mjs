// AR-01 / AR-02: cold load under storage denial variants, E4 candidate vs E2 control.
// 2 builds × 2 bases × 2 languages × 3 viewports × 8 variants = 192 fresh contexts.
import { writeFileSync, mkdirSync } from "node:fs";
import { startServer, stopServers, launch, BASES, VIEWPORTS, LANGS, STORAGE_VARIANTS, storageInitScript, installSyntheticSupabase, consoleCollector, tally } from "./lib.mjs";

const BUILDS = new URL("../builds/", import.meta.url).pathname;
const urls = {
  "e4:root": await startServer(4301, "/", `${BUILDS}e4-root`),
  "e4:aunara": await startServer(4302, "/aunara/", `${BUILDS}e4-aunara`),
  "e2:root": await startServer(4303, "/", `${BUILDS}e2-root`),
  "e2:aunara": await startServer(4304, "/aunara/", `${BUILDS}e2-aunara`),
};
const browser = await launch();
const t = tally();
const results = [];

async function probe(build, base, lang, vpName, variant) {
  const context = await browser.newContext({ serviceWorkers: "block",  viewport: VIEWPORTS[vpName], locale: lang === "en" ? "en-US" : "es-CO" });
  const script = storageInitScript(variant);
  if (script) await context.addInitScript(script);
  const log = [];
  await installSyntheticSupabase(context, { log });
  const page = await context.newPage();
  const consoleEntries = consoleCollector(page);
  let outcome = "unknown"; let title = ""; let text = "";
  try {
    await page.goto(urls[`${build}:${base}`], { waitUntil: "load" });
    // Settle: either the App shell (navigation) or the startup alert or nothing.
    await page.waitForSelector(".shared-navigation, .app-shell .brand, [role=alert], .install-action", { timeout: 8000 }).catch(() => null);
    await page.waitForTimeout(400);
    const state = await page.evaluate(() => {
      const root = document.getElementById("root");
      const alert = document.querySelector("[role=alert]");
      return {
        rootChildren: root ? root.children.length : -1,
        bodyText: (document.body.innerText || "").trim().slice(0, 160),
        alertTitle: alert?.querySelector("h1")?.textContent ?? "",
        alertText: alert?.querySelector("p")?.textContent ?? "",
        hasNav: Boolean(document.querySelector(".shared-navigation, header .brand")),
        shells: document.querySelectorAll("main.app-shell").length,
        lang: document.querySelector("main")?.getAttribute("lang") ?? "",
        buttons: Array.from(document.querySelectorAll("[role=alert] button")).map((b) => b.textContent.trim()),
      };
    });
    title = state.alertTitle; text = state.alertText;
    if (state.alertTitle) outcome = "blocked";
    else if (state.hasNav) outcome = "app";
    else if (state.rootChildren === 0 || state.bodyText === "") outcome = "blank";
    else outcome = `other:${state.bodyText.slice(0, 40)}`;
    results.push({ build, base, lang, vp: vpName, variant, outcome, title, text: text.slice(0, 80), shells: state.shells, lang_attr: state.lang, buttons: state.buttons, console: consoleEntries.slice(0, 3), external: log.filter((l) => l.blocked).length });
  } catch (error) {
    results.push({ build, base, lang, vp: vpName, variant, outcome: `error:${String(error).slice(0, 80)}` });
    outcome = "error";
  } finally { await context.close(); }
  return outcome;
}

const ONLY = process.env.ONLY ? process.env.ONLY.split(",") : null;
for (const build of ["e4", "e2"]) for (const base of Object.keys(BASES)) for (const lang of LANGS) for (const vpName of Object.keys(VIEWPORTS)) for (const variant of Object.keys(STORAGE_VARIANTS)) {
  if (ONLY && !ONLY.includes(`${build}:${variant}`)) continue;
  const outcome = await probe(build, base, lang, vpName, variant);
  const last = results[results.length - 1];
  const name = `${build}/${base}/${lang}/${vpName}/${variant}`;
  if (build === "e4" && variant === "get-only") {
    const expectTitle = lang === "en" ? "Aunara could not start" : "No se pudo iniciar Aunara";
    const expectText = lang === "en" ? "does not allow storage to be read" : "no permite leer el almacenamiento";
    const ok = outcome === "blocked" && last.title === expectTitle && last.text.includes(expectText) && last.shells === 1 && last.buttons.length === 3;
    t.add(name, ok, `${outcome} "${last.title}" shells=${last.shells} buttons=${last.buttons?.join("|")}`);
  } else if (build === "e2" && variant === "get-only") {
    t.add(name, outcome === "blank", `control E2 esperado blank, obtenido ${outcome}`);
  } else {
    t.add(name, outcome === "app", `${outcome}`);
  }
}

// AR-02: every non get-only variant must have the same outcome in E4 and E2.
for (const r of results.filter((x) => x.build === "e4" && x.variant !== "get-only")) {
  const control = results.find((x) => x.build === "e2" && x.base === r.base && x.lang === r.lang && x.vp === r.vp && x.variant === r.variant);
  t.add(`AR-02 parity ${r.base}/${r.lang}/${r.vp}/${r.variant}`, control && control.outcome === r.outcome, `e4=${r.outcome} e2=${control?.outcome}`);
}

mkdirSync(new URL("../results/", import.meta.url).pathname, { recursive: true });
writeFileSync(new URL(ONLY ? "../results/storage-matrix-subset.json" : "../results/storage-matrix.json", import.meta.url).pathname, JSON.stringify({ summary: t.summary(), rows: t.rows, results }, null, 2));
console.log("STORAGE MATRIX:", t.summary());
const byVariant = {};
for (const r of results) { byVariant[`${r.build}:${r.variant}`] ??= {}; byVariant[`${r.build}:${r.variant}`][r.outcome] = (byVariant[`${r.build}:${r.variant}`][r.outcome] ?? 0) + 1; }
console.table(byVariant);
const externals = results.reduce((n, r) => n + (r.external ?? 0), 0);
console.log("peticiones externas bloqueadas (deberían ser 0 o solo fonts/CDN):", externals);
await browser.close(); stopServers();
