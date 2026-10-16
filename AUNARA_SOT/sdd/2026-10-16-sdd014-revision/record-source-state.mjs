// Local development evidence only; no network, build, credentials or runtime changes.
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
const root = new URL("../../../", import.meta.url);
const git = (...args) => execFileSync("git", args, { cwd: fileURLToPath(root), encoding: "utf8" });
const explicit = [
  "scripts/auth-email-templates.node-test.mjs", "supabase/templates/README.md",
  "supabase/templates/confirm-signup.html", "supabase/templates/reset-password.html",
  "AUNARA_SOT/sdd/2026-10-16-sdd014-revision/record-source-state.mjs",
];
const paths = [...new Set([...git("ls-files", "-z", "--", "src", "public", "scripts", "supabase", "docs/compliance", ".github", "package.json", "package-lock.json", "vite.config.ts", "tsconfig.json", "tsconfig.app.json", "tsconfig.node.json").split("\0").filter(Boolean), ...explicit])].sort();
const sha256 = {};
for (const path of paths) sha256[path] = createHash("sha256").update(await readFile(new URL(path, root))).digest("hex");
const manifest = {
  role: "development-local-only", base: "61610c1", head: git("rev-parse", "HEAD").trim(),
  branch: git("branch", "--show-current").trim(), recordedAt: new Date().toISOString(),
  node: process.version, tz: process.env.TZ ?? "unset", nodeOptionsPresent: !!process.env.NODE_OPTIONS,
  note: "Postbuild source hashes, not an independent approval. SDD dirty preexists and is owned by principal. No secrets or remote inspection.",
  sha256,
};
await writeFile(new URL("source-sha256.json", import.meta.url), `${JSON.stringify(manifest, null, 2)}\n`);
await writeFile(new URL("tracked-implementation.diff", import.meta.url), git("diff", "--", "src/lib/privacy.ts", "src/components/LegalPanel.test.tsx", "docs/compliance/README.md", "docs/compliance/retention-and-rights.md", "docs/compliance/incident-response.md"));
console.log(`Recorded ${paths.length} source hashes after local builds.`);
