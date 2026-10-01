# Historia y backlog — Aunara

Entradas más recientes arriba; no reescribir entradas previas.

## 2026-10-01 · Revisión aprobada y entrega local

`[AUNARA/codex · GPT-6.1 Sol]` — Revisión independiente **APPROVED**: typecheck, 18 archivos/143 pruebas Vitest + Node, cinco guards E2 con negativos, builds `/` y `/aunara/` y allowlist de 30 archivos pasaron. Smoke local Chrome escritorio/móvil y Safari WebKit escritorio ES/EN/login pasó; manifest/worker acotados a `/aunara/`. El Operator autorizó commit, push y publicación UAT desde el repo público existente. La entrega conserva cambios previos de producto y referencias locales fuera del commit; no declara deploy, instalación física PWA ni autenticación/sync real completos. Supabase sigue pausado y requiere decisión del Operator. Ver [estado](02-ESTADO-ACTUAL.md).

## 2026-10-01 · Pages desde Aunara, desarrollo local

`[AUNARA/codex · GPT-6.1 Sol]` — El Operator aprobó la Enmienda 2 y la visibilidad pública del repo existente `AC-Setroc/aunara`. Se prepararon base `/aunara/`, paths de datos/marca/callbacks, PWA acotada y workflow con artifact `dist/client/`; la revisión y publicación aún no están cerradas. Las siete referencias y su inventario siguen locales y fuera del commit público. Supabase Repbook permanece pausado por límite del plan gratuito, de modo que registro/login/sync y allowlist de callback están bloqueados. Ver [estado](02-ESTADO-ACTUAL.md) y [pendientes](PENDIENTES.md).

## 2026-09-30 · Casa canónica local en implementación

`[AUNARA/codex · GPT-6.1 Sol]` — El repositorio fuente fue trasladado a `Personal/aunara`; se incorporaron las siete referencias intactas y los SDD en `AUNARA_SOT/sdd/`. Pasaron typecheck, 141 pruebas Vitest + una prueba Node, build y 44 enlaces locales. Esta entrada registra trabajo local, no aceptación final; falta revisión independiente y smoke de dispositivos. Evidencia y gates pendientes: [estado](02-ESTADO-ACTUAL.md), [SDD-001](sdd/SDD-001-casa-canonica.md) y [pendientes](PENDIENTES.md). No hubo cambio de producto ni publicación.
