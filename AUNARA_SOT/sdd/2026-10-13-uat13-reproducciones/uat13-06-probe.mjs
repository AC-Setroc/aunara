// UAT13-06: pending-verification state → computed colors of the "Reenviar correo de confirmación" button (dev build).
import { startServer, stopServers, launch, installSyntheticSupabase, syntheticUser } from "./lib.mjs";
const BUILDS = new URL("../builds/", import.meta.url).pathname;
const url = await startServer(4382, "/", `${BUILDS}${process.env.BUILD ?? "h02-root"}`);
const browser = await launch();
for (const vp of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  const context = await browser.newContext({ serviceWorkers: "block", viewport: vp, locale: "es-CO" });
  await context.addInitScript(`localStorage.setItem("aunara-storage-notice-v1", "1");`);
  await installSyntheticSupabase(context);
  // Sign-up without immediate session → the app shows the pending-verification block.
  await context.route("**/auth/v1/signup", (route) => route.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify({ user: syntheticUser({ email: "uat@example.invalid" }), session: null }) }));
  const page = await context.newPage(); await page.goto(url); await page.waitForSelector(".shared-navigation");
  await page.locator("button.guest-account-button").click(); await page.waitForSelector(".access-panel form");
  const modeGroup = page.locator(".access-mode");
  if (await modeGroup.count()) { const create = modeGroup.getByRole("button", { name: /Crear|Create/ }); if (await create.count()) await create.first().click(); }
  await page.waitForTimeout(200);
  const form = page.locator(".access-panel form");
  await form.locator('input[type="text"]:not([inputmode="email"])').first().fill("Atleta UAT");
  await form.locator('input[inputmode="email"]').fill("uat@example.invalid");
  const passwords = form.locator('input[type="password"]');
  await passwords.nth(0).fill("ClaveSegura-2026"); if (await passwords.count() > 1) await passwords.nth(1).fill("ClaveSegura-2026");
  await form.locator('input[type="checkbox"]').first().check();
  await form.getByRole("button", { name: /Crear mi cuenta/ }).click();
  const ok = await page.waitForSelector(".account-verification", { timeout: 8000 }).then(() => true).catch(() => false);
  const measure = (hover) => page.evaluate(() => { const el = document.querySelector(".account-verification .verification-resend"); if (!el) return null; const cs = getComputedStyle(el); const parentBg = getComputedStyle(el.closest(".account-verification")).backgroundColor; return { text: el.textContent.trim(), color: cs.color, bg: cs.backgroundColor, border: cs.borderColor, parentBg, disabled: el.disabled }; });
  const normal = ok ? await measure() : null;
  if (ok) await page.hover(".account-verification .verification-resend");
  const hover = ok ? await measure() : null;
  const sameColor = normal && normal.color === normal.bg;
  console.log(JSON.stringify({ viewport: vp.width, pendingBlock: ok, normal, hover, textInvisibleWithoutHover: sameColor }));
  await context.close();
}
await browser.close(); stopServers();
