// AR-03 / AR-04 / AR-05: startup boundary behaviour on the E4 build (both bases, ES/EN, 3 viewports).
//  AR-04: non-storage import failure (App chunk blocked) → "could not load", not storage wording; ES/EN toggle; Reload really reloads.
//  AR-03: get-only block, then permission restored + reload → App mounts and persisted values survive; callback hash untouched.
//  AR-05: exactly one root, one App chunk request per document, one main.app-shell.
import { writeFileSync } from "node:fs";
import { startServer, stopServers, launch, BASES, VIEWPORTS, LANGS, storageInitScript, installSyntheticSupabase, consoleCollector, tally } from "./lib.mjs";

const BUILDS = new URL("../builds/", import.meta.url).pathname;
const urls = { root: await startServer(4311, "/", `${BUILDS}e4-root`), aunara: await startServer(4312, "/aunara/", `${BUILDS}e4-aunara`) };
const browser = await launch();
const t = tally();

for (const base of Object.keys(BASES)) for (const lang of LANGS) for (const vp of Object.keys(VIEWPORTS)) {
  const tag = `${base}/${lang}/${vp}`;
  console.log("…", tag);
  const locale = lang === "en" ? "en-US" : "es-CO";

  // ---- AR-04: block the App chunk (non-storage rejection) ----
  try {
    const context = await browser.newContext({ serviceWorkers: "block",  viewport: VIEWPORTS[vp], locale });
    await installSyntheticSupabase(context);
    const page = await context.newPage();
    let appRequests = 0;
    await page.route(/\/assets\/App-[^/]+\.js$/, (route) => { appRequests += 1; route.abort("failed"); });
    await page.goto(urls[base]);
    await page.waitForSelector("[role=alert]", { timeout: 8000 });
    const s = await page.evaluate(() => ({ h1: document.querySelector("[role=alert] h1")?.textContent, p: document.querySelector("[role=alert] p")?.textContent, shells: document.querySelectorAll("main.app-shell").length }));
    const expectH1 = lang === "en" ? "Aunara could not load" : "No se pudo cargar Aunara";
    const storageWord = /almacenamiento|storage/i.test(s.p ?? "");
    t.add(`AR-04 ${tag} fallo no-storage honesto`, s.h1 === expectH1 && !storageWord && s.shells === 1, `h1="${s.h1}" p="${(s.p ?? "").slice(0, 50)}" shells=${s.shells}`);
    // language toggle in memory
    await page.getByRole("button", { name: lang === "en" ? "Español" : "English" }).click();
    const h1b = await page.textContent("[role=alert] h1");
    t.add(`AR-04 ${tag} selector de idioma`, h1b === (lang === "en" ? "No se pudo cargar Aunara" : "Aunara could not load"), h1b ?? "");
    // no retry of the failed module inside the same document
    await page.waitForTimeout(800);
    t.add(`AR-05 ${tag} un solo intento de import`, appRequests === 1, `requests=${appRequests}`);
    // Reload button performs a real reload, URL preserved (add a hash first via location to prove it is kept)
    const before = page.url();
    await page.evaluate(() => { window.__aunaraMarker = 1; });
    await page.getByRole("button", { name: lang === "en" ? "Recargar" : "Reload" }).click();
    await page.waitForFunction(() => !window.__aunaraMarker, null, { timeout: 15000 });
    await page.waitForSelector("[role=alert]", { timeout: 8000 });
    t.add(`AR-04 ${tag} recarga real y URL intacta`, page.url() === before && appRequests === 2, `url=${page.url()} requests=${appRequests}`);
    await context.close();
  } catch (error) { t.add(`AR-04 ${tag}`, false, `error: ${String(error).slice(0, 120)}`); }

  // ---- AR-03: get-only block, then restore and reload; persisted data survives; hash untouched ----
  try {
    const context = await browser.newContext({ serviceWorkers: "block",  viewport: VIEWPORTS[vp], locale });
    await installSyntheticSupabase(context);
    // Seed persisted values in a normal page first.
    const seed = await context.newPage();
    await seed.goto(urls[base]);
    await seed.waitForSelector(".shared-navigation", { timeout: 8000 });
    await seed.evaluate(() => { localStorage.setItem("repbook-profile-name", JSON.stringify("Persistida Atleta")); localStorage.setItem("repbook-language", JSON.stringify("en")); });
    await seed.close();
    // Now a page with get-only denial, carrying a synthetic callback hash that must not be consumed/rewritten.
    const blocked = await context.newPage();
    await blocked.addInitScript(storageInitScript("get-only"));
    const hash = "#access_token=synthetic-not-a-real-token&type=recovery";
    await blocked.goto(urls[base] + hash);
    await blocked.waitForSelector("[role=alert]", { timeout: 8000 });
    const h1 = await blocked.textContent("[role=alert] h1");
    const hashKept = (await blocked.evaluate(() => location.hash)) === hash;
    t.add(`AR-03 ${tag} bloqueo get-only con hash intacto`, h1 === (lang === "en" ? "Aunara could not start" : "No se pudo iniciar Aunara") && hashKept, `h1="${h1}" hashKept=${hashKept}`);
    // Restore permission: a fresh page in the same context has no init script → reload equivalent with permission back.
    const restored = await context.newPage();
    const consoleEntries = consoleCollector(restored);
    await restored.goto(urls[base]);
    await restored.waitForSelector(".shared-navigation", { timeout: 8000 });
    const persisted = await restored.evaluate(() => ({ name: localStorage.getItem("repbook-profile-name"), lang: localStorage.getItem("repbook-language"), shells: document.querySelectorAll(".app-shell").length, roots: document.getElementById("root").children.length }));
    t.add(`AR-03 ${tag} App vuelve y conserva datos`, persisted.name === JSON.stringify("Persistida Atleta") && persisted.lang === JSON.stringify("en") && persisted.shells === 1 && persisted.roots === 1, JSON.stringify(persisted));
    t.add(`AR-05 ${tag} sin errores de consola al montar`, consoleEntries.length === 0, consoleEntries.join(" | ").slice(0, 120));
    await context.close();
  } catch (error) { t.add(`AR-03 ${tag}`, false, `error: ${String(error).slice(0, 120)}`); }
}

writeFileSync(new URL("../results/startup-fallback.json", import.meta.url).pathname, JSON.stringify({ summary: t.summary(), rows: t.rows }, null, 2));
console.log("STARTUP FALLBACK:", t.summary());
await browser.close(); stopServers();
