# SDD-013 — independent review, cycle2

2026-10-15 · [AUNARA/codex · model not exposed]. **APPROVED — independent technical review under approved SDD-013 v0.1 + D13-6.**

All required compiled matrices, guards and negative/restored controls are complete. This approves only the frozen technical candidate below, not physical UAT, normal real-date unit-suite health, publication or changes beyond its manifest. No pending/unexecuted required matrix is counted as PASS.

Reviewed candidate `/private/tmp/aunara-sdd013-candidate`, base549b100. Independent reviewer did not implement or edit application/tests/dependencies/historical harnesses. No commit, push, merge or deployment by reviewer.

## Authority and bounded exception

Approved SDD-013 v0.1 plus **D13-6 explicitly approved15Oct** (current amendment read by reviewer). D13-6 accepts only comparative Monday evidence for the four identified pre-existing weekday-dependent unit failures; it is not a claim that normal `npm test` is green, does not fix the editor, and does not excuse any other failure.

The recorded real-date run on Wednesday14Oct has four failures in candidate and baseline: routine editing expects Monday's Jump Squat, plus three WorkoutPanel assertions tied to Monday slots/exercise selection. Baseline359 PASS/4 FAIL. Controlled identical Monday comparison: baseline363/363 Vitest+Sites1/1; current freeze candidate367/367 Vitest+Sites1/1, independently repeated by principal. Real-date defect remains open outside scope. See development-receipt and main-checks; no current-day normal-suite green claim.

## Verified compiled matrix

All four authoritative JSON files show **393/393 PASS and completedCases12**: Chromium and WebKit × `/` and `/aunara/`, each ES/EN ×1440/390/320 ×guest/session, both menu triggers, short400px viewport, plus blocked-access/installed gates. Folders under `resultados/cycle2/`:

- `accepted-chromium-root`, `accepted-chromium-aunara`;
- `final-webkit-root`, `final-webkit-aunara`.

Folder names identify calibrated runs, not approval by themselves. Earlier aborted/calibration folders do not provide global acceptance.

Visual inspection covers all96 menu/footer surfaces via16 `visual-*.png` sheets plus initial direct captures: complete wordmarks, edge-attached drawer, localized rows, no text clipping or footer overflow. Both trigger inventories and geometry agree. Two guest Home rows remain an explicit UX observation: original set-section Home/routes and `#top` anchor are distinct preserved actions required by the SDD. No unilateral label removal/consolidation; Operator still owns visual UAT.

## Criterion mapping

| Criterion | Evidence / current result |
|---|---|
| S13-01 | Full compiled matrix: desktop370±1, right/top/bottom viewport;390/320 full viewport; portal outside header, horizontal overflow≤1, short-viewport internal scrolling. PASS. |
| S13-02 | Header194desktop/168mobile, complete original lockup, only two triggers,44px hit areas and no overlap. PASS. |
| S13-03 | Preserved inventories/gates/localized selector; language stays open; guest anchor, profile, workout with real synthetic route, library/home, and logout exactly one synthetic request. Unit action-once/mode contracts plus direct App diff preserve create vs sign-in and original handlers. PASS for exercised functional contracts; UX observation above. |
| S13-04 | Native Tab/Shift+Tab in both engines includes select; close/Escape/backdrop return focus, body scroll blocked only open, reduced motion no transform/animation. Unit tests explicitly cover prior-overflow restoration, unmount, hidden/disabled controls and one callback. PASS. |
| S13-05 | Wrapper border/radius0 and transparent, optional false/not required/associated; teal exactly#063f43, measured contrast10.364:1, normal/hover/focus; mandatory blocks signup, synthetic signup without health sends declined and accepted legal version. Legal copy unchanged (only AccessPanel wrapper class). PASS. |
| S13-06 | Rasterized original image ink, original proportions/bytes; Aunara/slogan delta≤0.120px, AC/label≤1.387px, credit center≤0.025px; credit horizontal. Legal action contrast11.668:1, slogan/credit/attributions4.795:1; no overflow. PASS. |
| S13-07 | Deletion geometry/computed styles/actions compare exactly against compiled549b100 for both engines/bases/languages/widths. NO-TOCAR unchanged. All six full compiled historical regressions PASS in both engines/bases, including legal/profile/logout/training/data paths. PASS. |
| S13-08 | Main typecheck/directory4/4/pages+SW27/27/diff-check green; root+rollback artifact allowlist32/32 each; all four full UI matrices, twelve historical matrix runs and sixteen negative/restored controls PASS. Unit gate PASS only under explicitly approved D13-6 comparative exception, not a normal real-date green claim. Lint N/A: no script, none installed. |

## Historical regressions (unmodified assertions)

| Matrix | Chromium | WebKit |
|---|---|---|
| Storage,192 scenarios including real E2 control19dcb4f |276/276 PASS|276/276 PASS|
| Startup fallback |84/84 PASS|84/84 PASS|
| Auth recovery incl0/200ms and negatives |42/42 PASS|42/42 PASS|
| Privacy summary |84/84 PASS|84/84 PASS|
| Navigation/legal/deletion/standalone |156/156 PASS|156/156 PASS|
| Geometry/roundtrip |52/52 PASS|52/52 PASS|

Chromium storage: `regressions-chromium-page-close/`; startup: `regressions-chromium-remaining/`; final four: `regressions-chromium-isolated/`. WebKit: `regressions-webkit/`. All under cycle2. No successful matrix is rerun merely to consolidate output.

N1–N4 in **both engines**: all four intended guards red and exact-byte restored controls green,8/8 per engine, in `negatives-{chromium,webkit}-final/negatives.json`. Independently parsed all16 records and verified restoredHash===originalHash for every control. N1 fails drawer geometry; N2 fails native Tab and Shift+Tab select traversal for both triggers; N3 fails consent normal/hover/focus presentation; N4 fails deletion baseline geometry/styles. No runtime/selector failure is credited as an intended negative. Mutations exist only in disposable copied artifacts, never candidate source.

## Harness adaptations and aborted evidence

Historical harness files are unchanged. Generated disposable adapters import their helpers/server and retain all scenario/assertion logic. Changes are selectors for approved moved controls/groups, select-inclusive final focus endpoint, account-panel sync status instead of removed header indicator, close button nested in new drawer head, and isolated ports. Storage control is the exact historical E2 source19dcb4f, not current candidate relabeled as control.

Chromium1223 (148.0.7778.96) is launched via existing bundled Playwright with explicit executable path; WebKit2336 is26.5. No installs/dependency edits. A temporary ESM adapter resolves bare historical imports. Initial Chromium storage context disposal stalled after set-only after its observations, with no renderer left; those runs were stopped and not credited. Explicit `page.close({runBeforeUnload:false})` before `context.close()` resolves cleanup without skipping any scenario/assertion; final276 includes all192 contexts. Auth server preflight exited1 on old ports before any page; no PASS credited, remaining matrices use port offset2000.

Other documented calibration: selector accessible-name prefix (not incorrect exact label including option text); SVG canvas draw at explicit intrinsic dimensions to avoid WebKit's rendered-size artifact; signup matcher includes redirect query and preflight; real synthetic track required before workout rendering. Main matrix uses unchanged local SVG as intercepted external-image fixture when visiting library; external traffic remains blocked, console errors are not filtered away. Aborted five-second action-timeout runs are not accepted. No fake Tab handler or OS keyboard preference mutation was used: explicit tabindex0 in approved source was independently proven with native WebKit keyboard events.

## Reproducing the controlled weekday comparison

Save this disposable CommonJS preload outside product source, identically for baseline/candidate, then run `NODE_OPTIONS=--require=/absolute/path/monday-clock.cjs npm test`. Never use it for builds. It changes no system clock, explicit constructed dates or real timers.

```js
const NativeDate = Date;
const monday = NativeDate.parse("2026-10-12T12:00:00.000Z");
globalThis.Date = new Proxy(NativeDate, {
  construct(target, args, newTarget) {
    return Reflect.construct(target, args.length ? args : [monday], newTarget);
  },
  apply() { return new NativeDate(monday).toString(); },
  get(target, key) {
    return key === "now" ? () => monday : Reflect.get(target, key);
  },
});
```

## Frozen source manifest

```text
ca707430b3f93e7d902980c744a60d07380156091f173b52901266e828e1f806 src/App.tsx
b112d7de04e8641d5b09c7c6bc616cb08725587c7f2c9312f65a830007902a9a src/components/AccessPanel.tsx
987eea12053402208e504bcebf5f19f17248d56672a1c652ea288dbc6a45a850 src/components/NavigationMenu.tsx
d1be8e7592e43384c234b90da32032765b19eb6c4a45fe86331c2f2534f34590 src/styles.css
3b165fbab4105d8a31d19d8a75f36bf043377b8319a850d1aaaf598244f1fc8a src/components/AccessPanel.test.tsx
30804d8c82f8f67fcedfa7e6f174bf1bb07b2022e567af08e5f9bace8ef01080 src/components/AppFlows.test.tsx
8565542a581d3e9f32fe39981e63816bffbd45b16a482d62e0ba60788fcbbcc0 src/components/GuestApp.test.tsx
a575a7ec9cda7b8395acd71518018134cbf17b412cc0e989527597dd5db47fff src/components/NavigationMenu.test.tsx
```

Fresh diff-check, harness syntax and explicit NO-TOCAR comparison against549b100 pass; brand/hooks/lib/types/LegalPanel/WorkoutPanel/ProfilePanel/dependencies/workflows/Supabase remain unchanged. All eight source hashes were rechecked after final negatives and match the manifest above. Source must match these bytes at delivery. Physical Safari/iPhone UAT, real email/recovery redirect diagnosis and publication remain outside this technical review and pending Operator. The four pre-existing weekday-dependent unit failures remain an explicitly accepted separate defect, not fixed here. No publication authorized.
