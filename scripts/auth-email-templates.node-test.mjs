import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = fileURLToPath(new URL("../", import.meta.url));
const confirmationURL = "{{ .ConfirmationURL }}";
const files = [
  "src/lib/privacy.ts", "src/hooks/useCloudSync.ts", "src/components/LegalPanel.tsx",
  "docs/compliance/README.md", "docs/compliance/retention-and-rights.md",
  "docs/compliance/incident-response.md", "supabase/templates/confirm-signup.html",
  "supabase/templates/reset-password.html", "supabase/templates/README.md",
];
// SHA-256 of immutable source contracts at approved base 61610c1. No Git-history
// dependency: these checks also run in a source archive or a shallow clone.
const baselineHashes = {
  "src/lib/privacy.ts": "2c7ed232f740e5e7932cc81a4f4ba87a01e3c549ba1972b8150be7872817dc25",
  "src/hooks/useCloudSync.ts": "c977db60872384df136bef879a4bdf95af336bd9d90201ef52c2d1623e572afd",
  "src/components/LegalPanel.tsx": "142e3355e457312224759f6b9ec17f7e942ff9c09a4b18fd739283d22d0207f9",
};
const hash = (value) => createHash("sha256").update(value).digest("hex");
export async function readSources(directory = root) {
  return Object.fromEntries(await Promise.all(files.map(async (path) => [path, await readFile(join(directory, path), "utf8")])));
}

export function validateContact(sources) {
  assert.match(sources["src/lib/privacy.ts"], /export const DATA_CONTROLLER_EMAIL = "admin@aunaratraining\.com";/, "controller constant");
  for (const path of files.filter((path) => path.startsWith("docs/compliance/"))) {
    assert.ok(sources[path].includes("admin@aunaratraining.com"), `${path}: admin contact`);
    assert.ok(!sources[path].includes("alejandro@ac-setroc.com"), `${path}: stale contact`);
  }
}

export function validateInvariants(sources) {
  assert.equal(hash(sources["src/lib/privacy.ts"].replace(
    'DATA_CONTROLLER_EMAIL = "admin@aunaratraining.com"', 'DATA_CONTROLLER_EMAIL = "alejandro@ac-setroc.com"',
  )), baselineHashes["src/lib/privacy.ts"], "privacy.ts: only contact value may change; legal version/date/name and data handling stay intact");
  for (const path of ["src/hooks/useCloudSync.ts", "src/components/LegalPanel.tsx"]) {
    assert.equal(hash(sources[path]), baselineHashes[path], `${path}: Auth/consent/rendering contracts unchanged`);
  }
}

// Deliberately small HTML tree reader for these static, quoted-attribute email documents.
// It rejects malformed/unclosed markup rather than pretending to be a browser HTML repairer.
export function parseEmail(html) {
  const document = { tag: "#document", attrs: {}, children: [] };
  const stack = [document];
  const voidTags = new Set(["meta", "br", "hr", "img"]);
  const tokens = html.match(/<!--[\s\S]*?-->|<!doctype[^>]*>|<[^>]+>|[^<]+/gi) ?? [];
  assert.equal(tokens.join(""), html, "complete HTML tokenization");
  for (const token of tokens) {
    if (/^<!/i.test(token)) continue;
    if (!token.startsWith("<")) { stack.at(-1).children.push(token); continue; }
    const closing = token.match(/^<\/([a-z][\w-]*)\s*>$/i);
    if (closing) {
      assert.equal(stack.at(-1).tag, closing[1].toLowerCase(), "balanced HTML closing tag");
      stack.pop();
      continue;
    }
    const opening = token.match(/^<([a-z][\w-]*)([\s\S]*?)\s*\/?\s*>$/i);
    assert.ok(opening, "valid opening tag");
    const attrs = {};
    const remainder = opening[2].replace(/\s+([\w:-]+)\s*=\s*("[^"]*"|'[^']*')/g, (_, key, value) => {
      assert.ok(!(key.toLowerCase() in attrs), "no duplicate attribute");
      attrs[key.toLowerCase()] = value.slice(1, -1);
      return "";
    });
    assert.equal(remainder.trim(), "", "only explicit quoted attributes");
    const node = { tag: opening[1].toLowerCase(), attrs, children: [] };
    stack.at(-1).children.push(node);
    if (!voidTags.has(node.tag)) stack.push(node);
  }
  assert.equal(stack.length, 1, "all email elements closed");
  return document;
}
const descendants = (node) => [node, ...node.children.filter((child) => typeof child !== "string").flatMap(descendants)];
const textContent = (node) => node.children.map((child) => typeof child === "string" ? child : textContent(child)).join("").replace(/\s+/g, " ").trim();

export function validateTemplate(html, kind) {
  const nodes = descendants(parseEmail(html));
  const body = nodes.find((node) => node.tag === "body");
  assert.ok(body, "email body");
  const content = textContent(body);
  assert.match(content, /Aunara/, "visible brand name");
  assert.ok(nodes.some((node) => node.tag === "table" && node.attrs.role === "presentation"), "presentation table");
  assert.ok(nodes.some((node) => node.attrs.lang === "es"));
  assert.ok(nodes.some((node) => node.attrs.lang === "en"));
  for (const node of nodes) {
    assert.ok(!["script", "iframe", "form", "style", "svg", "link", "object"].includes(node.tag), "no active or external dependency");
    assert.ok(!Object.keys(node.attrs).some((key) => /^on/i.test(key)), "no event handlers");
    assert.doesNotMatch(node.attrs.style ?? "", /display\s*:\s*none|visibility\s*:\s*hidden|font-size\s*:\s*0(?:px)?(?:;|$)/i, "copy not hidden");
    assert.ok(!("hidden" in node.attrs) && node.attrs["aria-hidden"] !== "true", "visible copy");
    if (node.tag === "img") assert.ok(node.attrs.alt && Number(node.attrs.width) > 2 && Number(node.attrs.height) > 2, "no tracking pixel; meaningful alt");
  }
  const links = nodes.filter((node) => node.tag === "a");
  const primary = links.filter((node) => node.attrs["data-email-role"] === "primary");
  const backup = links.filter((node) => node.attrs["data-email-role"] === "backup");
  assert.equal(primary.length, 1, "one primary CTA");
  assert.equal(backup.length, 1, "one backup link");
  for (const link of [...primary, ...backup]) assert.equal(link.attrs.href, confirmationURL, "Auth destination must be exact ConfirmationURL");
  assert.match(primary[0].attrs.style ?? "", /background(?:-color)?\s*:\s*#164edf/i, "primary button visible");
  assert.equal(textContent(backup[0]), confirmationURL, "backup displays the same URL");
  assert.equal(links.length, 5, "only CTA, backup and three separate contacts");
  for (const [address, label] of [["soporte", "Español"], ["support", "English"], ["admin", "Privacidad / Privacy"]]) {
    const link = links.find((node) => node.attrs.href === `mailto:${address}@aunaratraining.com`);
    assert.ok(link, `${address}: correct mailto`);
    assert.equal(textContent(link), `${address}@aunaratraining.com`, `${address}: visible contact matches link`);
    assert.ok(content.includes(`${label}: ${address}@aunaratraining.com`), `${address}: separate role/language`);
  }
  assert.equal(textContent(primary[0]), kind === "confirm-signup" ? "Confirmar cuenta / Confirm account" : "Restablecer contraseña / Reset password", "bilingual action");
  if (kind === "confirm-signup") {
    assert.match(content, /verificar tu cuenta/);
    assert.match(content, /verify your account/);
  } else {
    assert.match(content, /elegir una contraseña nueva/);
    assert.match(content, /choose a new password/);
  }
  assert.match(content, /podés ignorar/);
  assert.match(content, /can ignore/);
  assert.match(content, /No compartas contraseñas ni enlaces/);
  assert.match(content, /Do not share passwords or links/);
  assert.doesNotMatch(html, /\.(?:Data|SiteURL|RedirectTo|Token|TokenHash|Email)\b|https?:\/\/|utm_|tracking|expires?\s+in|vence\s+en|caduca\s+en|\b\d+\s*(?:hours?|horas?|minutes?|minutos?)\b/i, "no reconstruction, user data, tracking or invented expiry");
  const expressions = html.match(/{{[\s\S]*?}}/g) ?? [];
  assert.deepEqual(expressions, [confirmationURL, confirmationURL, confirmationURL], "only URL placeholders, CTA then backup href/text");
}

export function validateFrom(rawHeader) {
  // Synthetic header contract only. This is NOT evidence of any actual SMTP sender.
  const from = rawHeader.replace(/\r?\n[ \t]+/g, " ").split(/\r?\n/).filter((line) => /^From:/i.test(line));
  assert.deepEqual(from, ["From: Aunara <noreply@aunaratraining.com>"], "exact intended From fixture");
}

export function validateAll(sources) {
  validateContact(sources);
  validateInvariants(sources);
  for (const kind of ["confirm-signup", "reset-password"]) validateTemplate(sources[`supabase/templates/${kind}.html`], kind);
  const readme = sources["supabase/templates/README.md"];
  for (const subject of ["Confirmá tu cuenta de Aunara / Confirm your Aunara account", "Restablecé tu contraseña de Aunara / Reset your Aunara password"]) assert.ok(readme.includes(subject), "documented exact subject");
  assert.match(readme, /NO ACTIVADO/);
  assert.match(readme, /Texto simple/);
  assert.match(readme, /rollback/i);
  assert.match(readme, /Aunara <noreply@aunaratraining\.com>/);
}

test("local contact and preserved legal/Auth source contracts", async () => {
  const sources = Object.fromEntries(await Promise.all(files.slice(0, 6).map(async (path) => [path, await readFile(join(root, path), "utf8")])));
  validateContact(sources);
  validateInvariants(sources);
});
test("both local email artifacts satisfy bilingual content and link contracts", async () => validateAll(await readSources()));
test("intended From fixture is exact (not an actual received header)", () => validateFrom("From: Aunara <noreply@aunaratraining.com>\r\nSubject: Synthetic fixture\r\n"));

const negativeCases = [
  ["N1 old controller", "src/lib/privacy.ts", (value) => value.replace('DATA_CONTROLLER_EMAIL = "admin@aunaratraining.com"', 'DATA_CONTROLLER_EMAIL = "alejandro@ac-setroc.com"'), validateContact, /controller constant/],
  ["N1 crossed support", "supabase/templates/confirm-signup.html", (value) => value.replace("mailto:soporte@", "mailto:support@"), (sources) => validateTemplate(sources["supabase/templates/confirm-signup.html"], "confirm-signup"), /soporte: correct mailto/],
  ["N3 fixed CTA host", "supabase/templates/confirm-signup.html", (value) => value.replace('href="{{ .ConfirmationURL }}"', 'href="https://wrong.invalid/confirm"'), (sources) => validateTemplate(sources["supabase/templates/confirm-signup.html"], "confirm-signup"), /exact ConfirmationURL/],
  ["N3 divergent backup", "supabase/templates/reset-password.html", (value) => value.replace('data-email-role="backup" href="{{ .ConfirmationURL }}"', 'data-email-role="backup" href="https://wrong.invalid/reset"'), (sources) => validateTemplate(sources["supabase/templates/reset-password.html"], "reset-password"), /exact ConfirmationURL/],
  ["N4 legal version", "src/lib/privacy.ts", (value) => value.replace('LEGAL_VERSION = "1.0"', 'LEGAL_VERSION = "1.1"'), validateInvariants, /only contact value/],
  ["N4 consent mutation", "src/hooks/useCloudSync.ts", (value) => value.replace('healthConsentStatus = healthDataConsent ? "granted" : "declined"', 'healthConsentStatus = "granted"'), validateInvariants, /Auth\/consent/],
];
for (const [name, path, mutate, validate, error] of negativeCases) {
  test(`${name}: disposable copy is rejected and original hashes stay intact`, async () => {
    const sources = await readSources();
    const hashes = (entries) => Object.fromEntries(Object.entries(entries).map(([key, value]) => [key, createHash("sha256").update(value).digest("hex")]));
    const before = hashes(sources);
    const directory = await mkdtemp(join(tmpdir(), "aunara-sdd014-negative-"));
    try {
      for (const [file, content] of Object.entries(sources)) {
        await mkdir(dirname(join(directory, file)), { recursive: true });
        await writeFile(join(directory, file), content);
      }
      const changed = mutate(sources[path]);
      assert.notEqual(changed, sources[path], "negative mutation must actually change its target");
      await writeFile(join(directory, path), changed);
      const mutatedSources = await readSources(directory);
      assert.throws(() => validate(mutatedSources), error);
      await writeFile(join(directory, path), sources[path]);
      validateAll(await readSources(directory));
      assert.deepEqual(hashes(await readSources()), before, "candidate source hashes unchanged");
    } finally { await rm(directory, { recursive: true, force: true }); }
  });
}
test("N2 wrong From synthetic fixture is rejected; intended fixture is green", () => {
  assert.throws(() => validateFrom("From: Supabase <noreply@supabase.invalid>\r\n"), /exact intended From/);
  assert.throws(() => validateFrom("From: Aunara <support@aunaratraining.com>\r\n"), /exact intended From/);
  validateFrom("From: Aunara <noreply@aunaratraining.com>\r\n");
});
