# SDD-015 — Recibo de desarrollo

2026-10-16. `[AUNARA/codex · modelo no expuesto]`.

Estado actual: implementado y APPROVED técnico independiente; entrega local registrada al final, pendiente de cierre del Operator. Supera el estado inicial de revisión/entrega pendientes. Aprobación del Operator transmitida en la orden: «Implementá. Necesito que esta versión quede lista hoy».

## Entorno y alcance

- Copia candidata no canónica: `/private/tmp/aunara-sdd015-016-candidate`.
- Base/HEAD durante las corridas: `2ebb5693ab49b44510d95bed20cc63e57a1b2c54`, detached; dependencias existentes sin cambios.
- Fecha real: viernes 2026-10-16, zona America/Bogota, UTC−05; baseline desde 07:30:23, candidato desde 07:31:06. Node `v24.15.0`, npm `11.12.1`.
- Miércoles simulado: `2026-10-14T12:00:00.000Z` (07:00 local), mismo harness histórico, sin editarlo. SHA-256 del harness: `b679affb97bed5a9ab80a159a3c15b0225cb3905ca3106d81c60e49f8dd92d20`.
- Único cambio de tests: tres inserciones `fireEvent.click(screen.getByRole("button", { name: "Monday" }));` en los casos autorizados de `AppFlows.test.tsx` y `WorkoutPanel.test.tsx`. El `it.each([2, 3])` cubre dos casos: cuatro en total. Ninguna expectativa, aserción, fixture, helper o inventario de pruebas cambia.

## RED → GREEN

Comandos exactos, ejecutados antes y después de editar en el mismo entorno:

```sh
npm test
NODE_OPTIONS=--require=/private/tmp/aunara-sdd014-candidate/AUNARA_SOT/sdd/2026-10-16-uat-dev-revision/harness/wednesday-clock.cjs npm test
npm run typecheck
git diff --check
```

| Corrida | Vitest | Node | Exit |
|---|---|---|---|
| Baseline fecha real | 371 PASS / 25 archivos | 11 PASS | 0 |
| Baseline miércoles | 367 PASS / 4 FAIL; 23 archivos PASS / 2 FAIL | No ejecuta por `&&` | 1 |
| Candidato fecha real | 371 PASS / 25 archivos | 11 PASS | 0 |
| Candidato miércoles | 371 PASS / 25 archivos | 11 PASS | 0 |

Los cuatro rojos previos coinciden exactamente con el SDD:

- `keeps routine editing separate from logging today’s workout`: no encontraba `Training day for Jump Squat`.
- `removes a member from 2 slots without discarding surviving targets or searches`: callback con día distinto de `monday`.
- `removes a member from 3 slots without discarding surviving targets or searches`: misma causa.
- `chooses exercises before structure and keeps each target independent when going back`: misma causa.

Typecheck y diff-check: exit 0. No hay script lint; no se añadió. Build/UI no exigidos por el SDD para este cambio exclusivo de tests. La prueba negativa por retiro temporal de las inserciones fuera del candidato queda para revisión independiente; desarrollo aporta el baseline rojo anterior a cualquier edición y el candidato verde con idéntico inventario.

Salidas completas locales (no incorporadas al repo): `/private/tmp/aunara-sdd015-baseline-real.log`, `/private/tmp/aunara-sdd015-baseline-wednesday.log`, `/private/tmp/aunara-sdd015-candidate-real.log`, `/private/tmp/aunara-sdd015-candidate-wednesday.log`.

## Identidad del candidato y límites

SHA-256 de los tests verificados:

```text
9011e6c9810164ee3cd4bfc44020a98e76ac5edd49fc8bdbc27a52f9cdd9798a  src/components/AppFlows.test.tsx
757cfcc6dea485142a15582f625536829a9ab5bca40c7ff0db31655037efd3be  src/components/WorkoutPanel.test.tsx
```

`WorkoutPanel.tsx`, resto del runtime, paquetes/lockfiles, workflows, harness y servidor UAT intactos por este frente. Los cambios concurrentes del coordinador en SDD-015/016 no pertenecen a este frente. Solo se escribió este recibo documental; SOT compartida y specs reservadas al coordinador. Sin commit, push, deploy ni autoaprobación.

Metodología Personal leída completa desde la copia local; el intento de actualización de este frente fue bloqueado por el sandbox (`.git/FETCH_HEAD: Operation not permitted`). El coordinador confirmó después la actualización mediante escalación segura: `Already up to date`. No se modificó esa copia desde este frente.

## Revisión independiente — APPROVED

2026-10-16, 07:31–07:33 America/Bogota (UTC−05). `[AUNARA/codex revisor independiente · modelo no expuesto]`. Revisor distinto de desarrollo, sin cambios de código, commits, push, despliegue ni intervención del servidor UAT. Leídos AGENTS, metodología Personal completa, SOT y skill `operator-sdd-workflow`; actualización de metodología bloqueada por sandbox en este frente, con confirmación de vigencia ya registrada arriba por el coordinador.

| Criterio del SDD | Evidencia independiente |
|---|---|
| Alcance exacto y cobertura intacta | Diff frente a `2ebb569`: 1 inserción en AppFlows y 2 en WorkoutPanel; exclusivamente clic Monday dentro de los casos autorizados. El parametrizado aporta dos casos. Sin cambios de aserciones, expectativas, fixtures/helpers, inventario, skip/only ni otros tests. Se preservan ambos días, Monday → Wednesday y el registro posterior de carga. |
| Baseline real verde | `npm test` en copia desechable de `git archive 2ebb569`, mismas dependencias mediante symlink: Vitest 371 PASS / 25 archivos; Node 11 PASS; exit 0. |
| Candidato real y miércoles verdes | Reejecución independiente de los dos comandos exactos de §RED → GREEN: cada uno Vitest 371 PASS / 25 archivos y Node 11 PASS; exit 0. |
| Guarda negativa reproduce el defecto | Copia desechable `/private/tmp/aunara-sdd015-review-negative.lTEb79`, archivos baseline sin las tres inserciones, mismo `node_modules` y harness miércoles inalterado: 367 PASS / 4 FAIL, 23 archivos PASS / 2 FAIL; exit 1. Fallan exactamente el caso AppFlows y los tres casos WorkoutPanel enumerados arriba. Node no ejecuta por `&&`. El candidato nunca se revirtió ni editó para provocar el rojo. |
| Typecheck y formato | `npm run typecheck` y `git diff --check`: exit 0. No existe script lint; no se creó. |
| Runtime y NO-TOCAR | Hash agregado SHA-256 de los 34 archivos versionados de `src/` excluyendo `*.test.*`, con nombre+NUL+contenido: baseline y candidato `1966c84d941f4422a3d612073017babf0c4b818c225093d93c551dfd106a5b06`. `WorkoutPanel.tsx` SHA-256 `2f808b2bee5a572e49dca1c3e9db0c1e540c01b83a61c903e4eedcc46d322ed4`, blob Git idéntico `8f129833bdcc6fe02aa4a612c117e0c748e0e62c`. Paquetes, lockfiles, workflows y harness sin diff. |

Los hashes SHA-256 de ambos tests coinciden exactamente con el recibo de desarrollo. No se ejecutó build/UI: exclusión explícita del SDD para este cambio tests-only, runtime byte a byte intacto. La documentación concurrente de SDD-016 pertenece al coordinador y queda fuera del veredicto SDD-015; no debe mezclarse en su commit. Entrega documental y commit local todavía corresponden al frente de entrega; el cierre es del Operator.

Salidas completas locales de esta revisión: `/private/tmp/sdd015-review-real.log`, `/private/tmp/sdd015-review-wed.log`, `/private/tmp/sdd015-review-typecheck.log`, `/private/tmp/sdd015-review-negative.log`, `/private/tmp/sdd015-review-baseline-real.log`. El revisor solo añadió esta sección al recibo autorizado.

## Entrega local de SDD-015

2026-10-16. `[AUNARA/codex · gpt-6.1-sol]`. Gate APPROVED independiente confirmado por el coordinador antes de editar documentación o preparar el commit. Este frente no implementó ni aprobó su propio código. Verificados los dos SHA-256 de tests contra el recibo de revisión: coinciden exactamente; solo tres inserciones Monday frente a `2ebb569`. Se contrastaron las salidas locales de revisión y el diff final; `git diff --check` PASS. La actualización documental no altera el estado de código revisado ni exige repetir sus corridas.

Frontera del commit: los dos archivos de tests, SDD-015, este recibo y los tres documentos compartidos (`02-ESTADO-ACTUAL`, `PENDIENTES`, `03-HISTORIA-Y-BACKLOG`). SDD-016 queda deliberadamente fuera, con su enmienda pendiente y sin implementación. No se modifican runtime, paquetes, locks, workflows, harness ni servidor UAT/canónico. Sin push, merge ni deploy por este frente; la coordinación conserva la obligación documental en dev y el Operator conserva el cierre. El identificador del commit local se obtiene del historial de esta entrega.
