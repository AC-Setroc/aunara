// Read-only reproduction of UAT13-06 and UAT13-15 on the dev build (h02-root = dev technical tree): computed colors.
import { startServer, stopServers, launch, installSyntheticSupabase } from "./lib.mjs";
const BUILDS = new URL("../builds/", import.meta.url).pathname;
const url = await startServer(4381, "/", `${BUILDS}${process.env.BUILD ?? "h02-root"}`);
const browser = await launch();
for (const vp of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  const context = await browser.newContext({ serviceWorkers: "block", viewport: vp, locale: "es-CO" });
  await context.addInitScript(`localStorage.setItem("aunara-storage-notice-v1", "1");`);
  await installSyntheticSupabase(context);
  const page = await context.newPage(); await page.goto(url); await page.waitForSelector(".shared-navigation");
  const style = (sel, props) => page.evaluate(([s, p]) => { const el = document.querySelector(s); if (!el) return null; const cs = getComputedStyle(el); const o = { text: el.textContent.trim().slice(0, 40), visible: el.getClientRects().length > 0 }; for (const k of p) o[k] = cs[k]; return o; }, [sel, props]);
  // UAT13-15: footer legal buttons normal vs hover
  const footerBg = await style("footer", ["backgroundColor"]);
  const legalNormal = await style(".footer-legal button", ["color", "borderBottomColor"]);
  await page.hover(".footer-legal button");
  const legalHover = await style(".footer-legal button", ["color", "borderBottomColor"]);
  // UAT13-06: sign-in form → resend/recover control
  await page.locator("button.guest-account-button").click(); await page.waitForSelector(".access-panel");
  const signIn = page.getByRole("button", { name: /Ya tengo cuenta|Ingresar|Sign in/ }).first();
  if (await signIn.count()) await signIn.click().catch(() => null);
  await page.waitForTimeout(300);
  const resend = await style(".verification-resend", ["color", "backgroundColor", "borderColor", "opacity"]);
  let resendHover = null;
  if (resend) { await page.hover(".verification-resend"); resendHover = await style(".verification-resend", ["color", "backgroundColor"]); }
  const panelBg = await style(".access-panel", ["backgroundColor"]);
  console.log(JSON.stringify({ viewport: vp.width, footerBg: footerBg?.backgroundColor, legalNormal, legalHover, panelBg: panelBg?.backgroundColor, resend, resendHover }));
  await context.close();
}
await browser.close(); stopServers();
