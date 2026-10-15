# SDD-013 — verificaciones independientes de comandos y frontera

2026-10-14 · `[AUNARA/codex · modelo no expuesto]` · Revisor principal, distinto de desarrollo. Base549b100, ocho archivos de fuente/tests congelados según development-receipt. No es veredicto final: matrices compiladas y revisión visual a cargo del revisor independiente.

- `NODE_OPTIONS=--require=/private/tmp/aunara-sdd013-monday-clock.cjs npm test`: exit0, Vitest25archivos/366pruebas, Sites1/1, sin skips. Fecha lunes controlada fuera del código: los cuatro fallos de editor con fecha real miércoles están reproducidos iguales en baseline y candidato por desarrollo; este resultado no afirma corregirlos ni pasa la suite con fecha real.
- `npm run typecheck`: exit0.
- `npm run test:exercise-directory`: exit0,4/4.
- `node --test scripts/check-pages-client.node-test.mjs scripts/sw-scope.node-test.mjs`: exit0,27/27, incluidos negativos existentes.
- `git diff --check`: exit0.
- `git diff --name-only 549b100`: solo App, NavigationMenu, AccessPanel, styles y cuatro tests permitidos. Lectura de diff realizada por revisor principal.
- `git diff --quiet 549b100 -- public/brand src/hooks src/lib src/types.ts src/components/LegalPanel.tsx src/components/WorkoutPanel.tsx src/components/ProfilePanel.tsx package.json package-lock.json .github supabase`: exit0; NO-TOCAR inspeccionado sin cambios.
- Chromium instalado148.0.7778.96 y WebKit26.5 arrancan en Mac. Adaptador ESM solo temporal para runtime bundled existente y ejecutable Chromium1223; no se instala/modifica dependencia. Eso acredita motores disponibles, no UI PASS.

Observación para revisión: invitado presenta Inicio/rutas y enlace Inicio de ancla. Contrastarlo con no duplicar destinos equivalentes del SDD y calidad elegida A antes de aprobar; principal no lo corrige en lugar de desarrollo. Óptica de footer queda pendiente de medición de tinta, no se hereda aprobación anterior. Sin commit/push/publicación de implementación.

## Freeze ciclo2 con tabindex explícito

Repetición independiente tras los cambios de fuente/tests autorizados: mismo comando controlado `NODE_OPTIONS=--require=/private/tmp/aunara-sdd013-monday-clock.cjs npm test`, exit0,25archivos/367Vitest +Sites1/1, sin skips (45.95s). `git diff --check` exit0 y mismo NO-TOCAR comprobado sin cambios. Este resultado sustituye366 del freeze anterior, no el caveat de fecha real. Revisor clasifica Inicio/rutas frente a Inicio ancla como acciones distintas preservadas explícitamente en SDD; no autoriza un ajuste de copy fuera de alcance. Matriz compilada/negativos/revisión visual frescos siguen necesarios.
