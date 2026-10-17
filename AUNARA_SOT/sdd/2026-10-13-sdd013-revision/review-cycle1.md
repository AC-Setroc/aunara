# SDD-013 — Independent review, cycle 1

[AUNARA/codex · model not exposed] 2026-10-14. **REJECTED**.

Candidate base `549b100`; eight source files read after explicit freeze, matching development receipt. Review role did not edit application, tests, dependencies, historical harnesses or assets; no commit/push/publication.

## Blocking finding: S13-06 footer text contrast

Selector `.footer-legal button`, all three existing legal actions, renders normal foreground `rgb(184, 186, 175)` on effective white `rgb(255, 255, 255)`: **1.96617:1**, below approved ≥4.5:1. Reproduced in compiled root build in Chromium and WebKit, ES/EN, guest/session, widths1440/390/320. Hover on the first action raises that action to11.66799:1; the remaining normal actions stay1.96617:1. This is a genuine existing CSS value, not an opacity or screenshot calculation artifact. Approved S13-06 requires the candidate to satisfy contrast, whether or not this value predates the change.

Bounded correction: only footer-scoped legal-action color normal/focus/hover in `src/styles.css`, using existing palette and keeping every label, callback and asset unchanged. The reviewer did not implement this correction.

Evidence: `resultados/cycle1/chromium-root-calibrated/sdd013-chromium-root.json` and equivalent `webkit-root-calibrated/` JSON. Captures in those folders show the final rendered surfaces of this frozen candidate. These are preliminary rejected-candidate measurements, **not global PASS receipts**.

## Remaining checks and calibration notes

- Chromium drawer/header geometry, focus traversal, language retention, short-viewport scrolling and deletion-modal baseline comparisons passed the exercised root cases. No claim of complete acceptance for other criteria or bases.
- WebKit default macOS Tab skips buttons/links and alternates select/BODY. Determine engine keyboard-access setting and compare baseline before attributing a new product regression. Do not replace genuine keyboard testing with synthetic focus handlers.
- The exact accessible name of the implicit language label includes selector option text; the harness now asserts localized prefix through the combobox role instead of an incorrect exact-name lookup.
- WebKit canvas SVG draw without explicit destination dimensions uses rendered-image dimensions; corrected harness draws at intrinsic dimensions, avoiding false65px optical offsets. Corrected checks require a fresh run.
- Signup route has `?redirect_to`; capture glob corrected to include query parameters. Prior zero-request result is harness calibration, not an app failure. The access panel must close before subsequent menu interaction.
- Global reduced-motion CSS uses0.00001s durations; acceptance checks absence of transform/animation movement, not unjustified literal zero duration.
- Root/rollback synthetic artifacts passed unchanged client allowlist32/32. Baseline549b100 visual artifacts and E2 control19dcb4f artifacts were generated in disposable scratch without real environment credentials.
- Six compiled regressions, final full matrix, visual inspection and N1–N4 negatives remain required on the next frozen candidate. Nothing unexecuted is treated as PASS.
- Main independent checks report typecheck, directory4/4, pages/SW27/27, surgical eight-file diff and NO-TOCAR preservation. Controlled Monday suite366 plus Sites1 passes; real Wednesday's four failures also reproduce on baseline and are not fixed by this scope.

All active candidate review runs were stopped at rejection. Application source remains frozen and unmodified by the review role. New development correction must produce a new explicit freeze followed by fresh cycle2 review.
