// SDD-016 compiled HTTP/UI differential probe, derived from historical W-01.
// No real accounts, env files, tokens, network services or production data are read.
// Usage: node <this-file> baseline|candidate [repository-root]
import { mkdtemp, readFile, writeFile, copyFile, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';

const mode = process.argv[2];
if (!['baseline', 'candidate'].includes(mode)) throw new Error('Expected baseline|candidate');
const outputDir = dirname(fileURLToPath(import.meta.url));
const repo = resolve(process.argv[3] ?? join(outputDir, '../../..'));
const scratch = await mkdtemp(join(tmpdir(), `aunara-sdd016-${mode}-`));
const runtimeModules = process.env.PLAYWRIGHT_MODULE_DIR ?? '/Users/alejandro/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const require = createRequire(join(repo, 'package.json'));
const hash = value => createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
async function run(command, args, options = {}) {
  return new Promise((yes, no) => {
    const child = spawn(command, args, { cwd: scratch, ...options });
    let out = ''; child.stdout?.on('data', d => { out += d; }); child.stderr?.on('data', d => { out += d; });
    child.on('error', no); child.on('exit', code => code === 0 ? yes(out.trim()) : no(new Error(`${command} exited ${code}: ${out.slice(-1500)}`)));
  });
}
// Archive the baseline rather than copying a working tree containing local env files.
const baselineRef = '22ee411740b675f92f7c9b07dcd824ce951cfbfc';
await run('git', ['-C', repo, 'archive', baselineRef, '-o', join(scratch, 'source.tar')]);
await run('tar', ['-xf', join(scratch, 'source.tar'), '-C', scratch]);
const sources = ['src/lib/cloudSnapshot.ts', 'src/lib/cloudStore.ts', 'src/hooks/useCloudSync.ts'];
if (mode === 'candidate') for (const source of sources) await copyFile(join(repo, source), join(scratch, source));
await symlink(join(repo, 'node_modules'), join(scratch, 'node_modules'));
const sourceHashes = Object.fromEntries(await Promise.all(sources.map(async f => [f, hash(await readFile(join(scratch, f), 'utf8'))])));
const history = join(repo, 'AUNARA_SOT/sdd/2026-10-16-uat-dev-revision/harness/lib.mjs');
const helperOriginal = await readFile(history, 'utf8');
// Only scratch adaptation: resolve the installed Playwright module. Historical file stays byte-identical.
const chromiumExecutable = process.env.CHROMIUM_EXECUTABLE_PATH ?? '/Users/alejandro/Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const helperAdapted = helperOriginal
  .replace('from "playwright"', `from ${JSON.stringify(pathToFileURL(join(runtimeModules, 'playwright/index.mjs')).href)}`)
  .replace('return engine.launch();', `return engine.launch(name === "chromium" ? { executablePath: ${JSON.stringify(chromiumExecutable)} } : {});`);
if (helperAdapted === helperOriginal) throw new Error('Historical helper import changed; inspect adapter');
await writeFile(join(scratch, 'lib.mjs'), helperAdapted);
await copyFile(join(repo, 'AUNARA_SOT/sdd/2026-10-12-sdd006-ciclo2-revision/harness/server.mjs'), join(scratch, 'server.mjs'));
const helper = await import(pathToFileURL(join(scratch, 'lib.mjs')).href);
// Validate fixtures using the exact source validator, bundled only in scratch to resolve TS imports.
const { rolldown } = await import(pathToFileURL(require.resolve('rolldown')).href);
const bundle = await rolldown({ input: join(scratch, 'src/lib/cloudSnapshot.ts'), platform: 'node', logLevel: 'silent' });
await bundle.write({ file: join(scratch, 'validator.mjs'), format: 'esm' });
await bundle.close();
const { normalizeRepbookSnapshot } = await import(pathToFileURL(join(scratch, 'validator.mjs')).href);
const PROFILE = { onboardingCompleted: true, primaryGoal: 'strength', equipmentPreference: 'mixed', trainingDaysPerWeek: 3, sessionMinutes: 45, birthDate: '', ageYears: null, metabolicSex: 'unspecified', heightCm: null, currentWeightKg: null, targetWeightKg: null, waistCm: null, activityLevel: 'moderate', experience: 'beginner', dietaryPattern: 'omnivore', nutritionPlanMode: 'simple', macroMealsPerDay: 4, allergies: '', healthNotes: '', readinessScreen: { confirmed: true, chestPain: false, dizzinessOrFainting: false, medicallySupervisedOnly: false, musculoskeletalConcern: false }, limitations: [], goals: ['strength'], healthDataMode: 'basic' };
const TRACK = { id: 'synthetic-triset', name: 'Synthetic triset', kind: 'goal', focus: 'strength', equipment: 'mixed', sessionMinutes: 45, daysPerWeek: 2, creationMode: 'manual', trainingDays: ['monday', 'thursday'], workout: [0, 1, 2].map(position => ({ id: `synthetic-${position}`, exerciseId: ['0001', '0002', '0003'][position], sets: 3, reps: 8, day: 'monday', structure: { id: 'synthetic-group', type: 'triset', position, size: 3 } })) };
const fixture = (language, name = 'Synthetic local', tracks = [TRACK]) => ({ schemaVersion: 1, profileName: name, language, favoriteIds: [], tracks: structuredClone(tracks), activeTrackId: tracks[0]?.id ?? '', healthProfile: structuredClone(PROFILE), checkIns: [], tracksInitialized: true });
const sentinel = {};
if (normalizeRepbookSnapshot(fixture('es'), sentinel) === sentinel) throw new Error('W-01 fixture is invalid');
const rows = [];
const user = helper.syntheticUser({ user_metadata: { health_data_consent: 'declined' } });
const remoteRow = payload => ({ user_id: user.id, payload });
const postCount = log => log.filter(x => x.method === 'POST' && x.path === '/rest/v1/repbook_user_data').length;
const getCount = log => log.filter(x => x.method === 'GET' && x.path === '/rest/v1/repbook_user_data').length;
const wait = page => page.waitForTimeout(1250); // Explicitly exceeds the app's 800ms debounce.
async function open(browser, url, initial, remote) {
  const context = await browser.newContext({ serviceWorkers: 'block', viewport: helper.VIEWPORTS.desktop });
  const state = {}, log = [];
  await helper.installSyntheticSupabase(context, { user, remoteRow: remote, stateful: true, state, log });
  const session = helper.syntheticSession(user);
  await context.addInitScript(({ initial, session }) => {
    const values = { 'repbook-profile-name': initial.profileName, 'repbook-language': initial.language, 'repbook-health-profile': initial.healthProfile, 'repbook-training-tracks': initial.tracks, 'repbook-training-tracks-initialized': true, 'repbook-active-track': initial.activeTrackId, 'repbook-favorites': initial.favoriteIds, 'repbook-weekly-checkins': initial.checkIns, 'sb-synthetic-auth-token': session };
    for (const [key, value] of Object.entries(values)) localStorage.setItem(key, JSON.stringify(value));
    localStorage.setItem('aunara-storage-notice-v1', '1');
  }, { initial, session });
  const page = await context.newPage(); const consoleErrors = helper.consoleCollector(page);
  await page.goto(url); await page.locator('.shared-navigation').waitFor();
  await page.waitForFunction(() => !!document.querySelector('button.navigation-trigger'));
  for (let i = 0; i < 60 && getCount(log) === 0; i++) await page.waitForTimeout(100);
  if (!getCount(log)) throw new Error('Bootstrap GET missing');
  await wait(page);
  return { context, state, log, page, consoleErrors };
}
async function navigate(page, text) {
  await page.locator('button.navigation-trigger').click();
  await page.locator('#aunara-navigation .navigation-row').filter({ hasText: text }).first().click();
}
async function editProfile(page) {
  await navigate(page, /Perfil|Profile/);
  await page.locator('.profile-panel').waitFor();
  await page.locator('.profile-panel select').filter({ has: page.locator('option[value="advanced"]') }).first().selectOption('advanced');
  await page.locator('.profile-done').click(); await wait(page);
}
async function localState(page) {
  return page.evaluate(() => ({ name: JSON.parse(localStorage.getItem('repbook-profile-name')), tracks: JSON.parse(localStorage.getItem('repbook-training-tracks')), profile: JSON.parse(localStorage.getItem('repbook-health-profile')) }));
}
const env = { ...process.env, VITE_SUPABASE_URL: 'https://synthetic.supabase.invalid', VITE_SUPABASE_PUBLISHABLE_KEY: 'synthetic-public-key' };
for (const key of Object.keys(env)) if (key.startsWith('VITE_') && !['VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY'].includes(key)) delete env[key];
try {
  for (const base of ['/', '/aunara/']) {
    await run(process.execPath, [join(scratch, 'node_modules/vite/bin/vite.js'), 'build'], { env: { ...env, AUNARA_BASE_PATH: base } });
    const actualUrl = await helper.startServer((mode === 'baseline' ? 4486 : 4496) + (base === '/' ? 0 : 1), base, join(scratch, 'dist'));
    for (const engine of ['chromium', 'webkit']) {
      process.env.BROWSER = engine;
      const browser = await helper.launch();
      try {
        for (const language of ['es', 'en']) {
          for (const defect of ['sport-empty', 'structure-position']) {
            const initial = fixture(language); const bad = fixture(language, 'Synthetic remote');
            if (defect === 'sport-empty') bad.healthProfile.sport = '';
            else bad.tracks[0].workout[0].structure.position = 3;
            if (normalizeRepbookSnapshot(bad, sentinel) !== sentinel) throw new Error('Negative fixture accepted');
            const remote = remoteRow(bad), before = JSON.stringify(remote);
            const opened = await open(browser, actualUrl, initial, remote);
            const bootstrapPosts = postCount(opened.log);
            const localBefore = await localState(opened.page);
            await editProfile(opened.page);
            const localAfter = await localState(opened.page);
            await navigate(opened.page, /Cuenta \/ privacidad|Account \/ privacy/);
            await opened.page.locator('.access-account').waitFor();
            const errorState = await opened.page.locator('.access-account.is-error').count() === 1;
            const message = await opened.page.locator('.access-account small').allTextContents();
            if (mode === 'candidate' && base === '/' && defect === 'sport-empty') await opened.page.screenshot({ path: join(scratch, `error-${engine}-${language}.png`), fullPage: true });
            const readable = language === 'es' ? message.some(x => /nube/i.test(x) && /sobrescrib/i.test(x)) : message.some(x => /cloud/i.test(x) && /overwrit/i.test(x));
            const posts = postCount(opened.log), remoteUnchanged = JSON.stringify(opened.state.remoteRow) === before;
            const localPreserved = localBefore.name === initial.profileName && localAfter.name === initial.profileName && hash(localBefore.tracks) === hash(initial.tracks) && hash(localAfter.tracks) === hash(initial.tracks) && localAfter.profile.experience === 'advanced' && localBefore.profile.experience === 'beginner';
            const pass = (mode === 'baseline' ? posts > 0 && !remoteUnchanged && localPreserved : posts === 0 && remoteUnchanged && localPreserved && errorState && readable) && opened.consoleErrors.length === 0;
            rows.push({ engine, base, language, case: defect, pass, getCount: getCount(opened.log), bootstrapPosts, postsAfterEdit: posts, remoteUnchanged, localPreserved, errorState, readableMessage: readable, consoleErrors: opened.consoleErrors.length });
            await opened.context.close();
          }
          // Normal W-01: absent -> device A save; valid -> B restores; edit B -> A2 restores.
          const a = await open(browser, actualUrl, fixture(language, 'Synthetic A'), null);
          const savedA = postCount(a.log) > 0 && a.state.remoteRow?.payload?.profileName === 'Synthetic A';
          const savedFixtureValid = normalizeRepbookSnapshot(a.state.remoteRow?.payload, sentinel) !== sentinel;
          const b = await open(browser, actualUrl, fixture(language, 'Synthetic B', []), a.state.remoteRow);
          const bLocal = await localState(b.page);
          await editProfile(b.page);
          const savedB = b.state.remoteRow?.payload?.healthProfile?.experience === 'advanced';
          const a2 = await open(browser, actualUrl, fixture(language, 'Synthetic A'), b.state.remoteRow);
          const a2Local = await localState(a2.page);
          const restoredB = bLocal.name === 'Synthetic A' && hash(bLocal.tracks) === hash([TRACK]);
          const restoredA2 = a2Local.profile.experience === 'advanced';
          const consoleErrors = a.consoleErrors.length + b.consoleErrors.length + a2.consoleErrors.length;
          rows.push({ engine, base, language, case: 'absent-valid-W01', pass: savedA && savedFixtureValid && restoredB && savedB && restoredA2 && consoleErrors === 0, savedA, savedFixtureValid, restoredB, savedB, restoredA2, consoleErrors });
          await Promise.all([a.context.close(), b.context.close(), a2.context.close()]);
        }
      } finally { await browser.close(); }
    }
    helper.stopServers();
  }
} finally { helper.stopServers(); }
const result = { mode, baselineRef, sourceHashes, helperHash: hash(helperOriginal), scratch, fixture: 'Synthetic W-01 validated with unchanged source validator; empty sport and position=size rejected', adaptations: ['historical helper copied to scratch with installed Playwright absolute import', 'explicit preinstalled Chromium executable (runtime default revision is absent); WebKit runtime default', 'missing server copied from SDD-006 history to scratch; no historical files changed'], rows, passed: rows.filter(r => r.pass).length, total: rows.length };
await writeFile(join(outputDir, `${mode}.json`), JSON.stringify(result, null, 2) + '\n');
console.log(`${mode}: ${result.passed}/${result.total} PASS; scratch ${scratch}`);
if (rows.some(r => !r.pass)) process.exitCode = 1;
