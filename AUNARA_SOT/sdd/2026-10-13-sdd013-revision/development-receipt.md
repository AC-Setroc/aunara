# SDD-013 development receipt

[AUNARA/codex · model not exposed] Candidate `/private/tmp/aunara-sdd013-candidate`, base `549b100`. No commit, push or deployment.

## RED, before production edits

`vitest run NavigationMenu.test.tsx GuestApp.test.tsx AccessPanel.test.tsx --maxWorkers=2 --configLoader runner` (full paths under src/components): 4 expected assertion failures, 60 passed, 2026-10-14. Failures: old guest anchor remains in header; selector precedes destinations instead of settings; Shift+Tab wraps to Home rather than select; create-account presentation wrapper missing. The default config loader first failed with EPERM in the shared dependency cache; runner avoids writing that external cache. This startup error is not counted as RED.

Compiled matrix, visual review, negatives and independent acceptance remain pending.

Authenticated header RED also observed before source edits: AppFlows targeted new case fails `children length expected 2 received 3` (1 failed, 74 skipped).

## Verification at source freeze

- Focused four files: 138 passed, one existing date-dependent editor failure, no failure in SDD013 assertions.
- `npm run typecheck`: exit0. Shared dependencies have been isolated as a local directory of symlinks with local caches; no dependency version/config edits, no canonical/UAT files modified.
- `npm run test:exercise-directory`: 4/4 passed.
- `node --test scripts/check-pages-client.node-test.mjs scripts/sw-scope.node-test.mjs`: 27/27 passed (including existing negative guards).
- `AUNARA_BASE_PATH=/ npm run build`: exit0; matching artifact guard: 32 files passed.
- `AUNARA_BASE_PATH=/aunara/ npm run build`: exit0; matching artifact guard: 32 files passed. Current dist is rollback base.
- `git diff --check`: exit0.
- Lint N/A (no existing script); not installed.

## Date-controlled comparison (authorized verification only)

Real date 2026-10-14 Wednesday: candidate `npm test` fails four assertions: AppFlows routine editing cannot find Monday's Jump Squat while Wednesday is selected, and WorkoutPanel removes member 2/3 slots + chooses exercises tests expect Monday but receive Wednesday. Disposable `git archive HEAD` baseline549b100 at `/private/tmp/aunara-sdd013-baseline-F7wSSu` reproduces the exact same four failures: 359 passed /4 failed,25 files. No editor/test changes are made to fix this unrelated assumption.

Controlled command for both trees: `NODE_OPTIONS=--require=/private/tmp/aunara-sdd013-monday-clock.cjs npm test`. Temporary preload proxies only no-argument Date/Date.now to `2026-10-12T12:00:00Z`, retaining explicit dates and timers. The preload is outside deliverable source and is never used for builds. Candidate: 25 files/366 tests passed plus Sites1/1,exit0. Baseline:25 files/363 tests passed plus Sites1/1,exit0. No skipped/assertions weakened. The real-date suite remains red in both trees; this is a controlled regression comparison, not a claim that the unrelated weekday assumptions are fixed.

## Source freeze manifest (SHA256)

```text
eeeab5a8a24fbb8323ac7a70f52942513804864fde0d6285025080f42744f22b src/App.tsx
b112d7de04e8641d5b09c7c6bc616cb08725587c7f2c9312f65a830007902a9a src/components/AccessPanel.tsx
8b5fe46f73fed515ae62e51597a7813069609d0295bff60899ec4482420c2652 src/components/NavigationMenu.tsx
f33016fc4c5d0234f0d5c52c3821d0d315ffe716283dc54690d39ec446e6e2b3 src/styles.css
3b165fbab4105d8a31d19d8a75f36bf043377b8319a850d1aaaf598244f1fc8a src/components/AccessPanel.test.tsx
30804d8c82f8f67fcedfa7e6f174bf1bb07b2022e567af08e5f9bace8ef01080 src/components/AppFlows.test.tsx
9c6f324d26ac73918e62610abb6d9fdb1c8f03772b21088bcf50b3b2ecd4c9b0 src/components/GuestApp.test.tsx
fe16c6ba0a835e97e313b6386c383026ad7e8d57ffe398786e44cf8b02a6791f src/components/NavigationMenu.test.tsx
```

Footer optical offsets are unchanged pending compiled measurements; no brand bytes edited. Header controls are moved to the drawer with original gates, no editor/storage/Auth/privacy/config changes. Safari/iPhone UAT and auth redirect diagnosis remain separate.

## Cycle2 — bounded footer contrast correction

Independent cycle1 REJECTED supplied compiled RED evidence before this correction: all three legal actions normal text184/186/175 onwhite,1.96617:1, both engines/ESEN/guest-session/all widths. See `review-cycle1.md` and its calibrated measurement IDs. Production correction adds only a normal-state footer-scoped rule using existing `--teal-800` for foreground/border; existing hover/focus teal remains unchanged. No copy/callback/asset or other source edits.

Fresh four-file focused run with the same authorized Monday clock:139/139 tests,4 files green. Root and rollback builds exit0 (include typecheck/directory check); matching artifact guards32/32 each. `git diff --check` exit0. Full controlled suite366 + Sites1 and unrelated real-date baseline comparison from cycle1 remain applicable to unchanged TypeScript/tests; compiled contrast GREEN and other required matrix/negatives must be established independently on this new CSS build.

New source freeze: all seven non-CSS SHA256 above unchanged; `src/styles.css` now `d1be8e7592e43384c234b90da32032765b19eb6c4a45fe86331c2f2534f34590`. No commit/push/deployment. Current dist rollback base.

## Cycle2 preflight — explicit native WebKit tab order

Reviewer isolated native WebKit keyboard evidence before edits: `resultados/keyboard-isolation/webkit-keyboard-isolation.json` demonstrates default Tab skipping buttons/links, while explicit tabIndex0 traverses all native controls in both directions. Additive unit RED before production edits: NavigationMenu case asserts explicit0 on both header triggers, close, destination button/anchor, account/help/exit; GuestApp asserts explicit0 on the real language select. Both failed `expected null to be '0'`,8 passed (10 tests total).

Minimal source change: explicit tabIndex0 on header triggers, drawer close and shared destination props, and the real language selector. No trap/event/callback/copy or other behavior changes. Typecheck and diff check exit0. Fresh four-file focused run with the same Monday control:140/140 tests,4 files green; compiled WebKit preflight and full review must rebuild artifacts from the new source, not reuse previous dist.

### Current eight-file freeze (supersedes prior freezes)

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
