import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const folder = 'AUNARA_SOT/sdd/2026-10-16-sdd014-revision/';
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const manifestBytes = fs.readFileSync(path.join(root, folder, 'source-sha256.json'));
const manifest = JSON.parse(manifestBytes);
if (hash(manifestBytes) !== '12ff41305825c61f54c7416474c11b94bee438faf2e6ddec2e61b31ef5417344') throw Error('Manifest changed');
const entries = Object.entries(manifest.sha256);
if (entries.length !== 117) throw Error('Manifest count changed');
for (const [file, expected] of entries) {
  if (hash(fs.readFileSync(path.join(root, file))) !== expected) throw Error(`Source changed: ${file}`);
  if (process.argv.includes('--head')) {
    const bytes = execFileSync('git', ['show', `HEAD:${file}`], { cwd: root, maxBuffer: 64 * 1024 * 1024 });
    if (hash(bytes) !== expected) throw Error(`HEAD mismatch: ${file}`);
  }
}
const expectedTracked = ['docs/compliance/README.md', 'docs/compliance/incident-response.md', 'docs/compliance/retention-and-rights.md', 'src/components/LegalPanel.test.tsx', 'src/lib/privacy.ts'];
const changedTracked = entries.map(([f]) => f).filter(f => {
  try { return hash(execFileSync('git', ['show', `61610c1:${f}`], { cwd: root, maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] })) !== manifest.sha256[f]; }
  catch { return false; }
}).sort();
if (JSON.stringify(changedTracked) !== JSON.stringify(expectedTracked)) throw Error('Tracked scope mismatch');
const rows = ['reviewer-ui-root.json', 'reviewer-ui-rollback.json'].map(n => JSON.parse(fs.readFileSync(path.join(root, folder, n))).rows.length);
if (JSON.stringify(rows) !== '[48,24]') throw Error('Review rows mismatch');
const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], { cwd: root, encoding: 'utf8' }).trim().split('\n').filter(f => f.startsWith(folder) || f.startsWith('supabase/templates/') || f === 'scripts/auth-email-templates.node-test.mjs');
// Report paths only, never the potentially sensitive matching text.
const sensitive = /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|eyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}|\b(?:sb_secret_|sb_publishable_)[A-Za-z0-9_-]{20,}|\bAKIA[A-Z0-9]{16}\b|\bgh[pousr]_[A-Za-z0-9]{30,}/;
for (const f of files) {
  if (/\.(png|jpg|jpeg)$/.test(f)) continue;
  if (sensitive.test(fs.readFileSync(path.join(root, f), 'utf8'))) throw Error(`Sensitive material: ${f}`);
}
execFileSync('git', ['diff', '--check'], { cwd: root });
console.log(JSON.stringify({ role: 'delivery-local', sourceCount: entries.length, sourceUnchanged: true, manifestSha256: hash(manifestBytes), changedTrackedImplementation: changedTracked, reviewRows: rows, sensitiveScanFiles: files.length, sensitiveMatches: 0, headVerified: process.argv.includes('--head') }, null, 2));
