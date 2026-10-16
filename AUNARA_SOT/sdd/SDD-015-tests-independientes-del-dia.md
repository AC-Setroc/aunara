# SDD-015 — Cuatro pruebas independientes del día

**Estado: Implementado; APPROVED técnico independiente, pendiente de cierre del Operator.** 2026-10-16. `[AUNARA/codex · gpt-6.1-sol]`.
Revisión independiente aprobada: candidato real y miércoles con 371/371 pruebas Vitest (25 archivos) + 11/11 Node; baseline real verde y negativo miércoles con los cuatro fallos esperados. Typecheck/diff-check PASS y runtime idéntico. [Recibo completo](2026-10-16-sdd015-revision/README.md). Supera el estado previo de desarrollo/revisión en curso; no cierra SDD-016 ni autoriza producción.
Operator: «Implementá. Necesito que esta versión quede lista hoy» aprueba SDD-015/016. Base de desarrollo `2ebb569` en copia aislada `/private/tmp/aunara-sdd015-016-candidate`, sin tocar servidor UAT/canónico. La inspección original siguiente se preserva: `dev` `999c8f6`, copia `/private/tmp/aunara-sdd014-candidate`. IDs 015/016 libres al buscar nombres y referencias en `AUNARA_SOT/`. Se leyeron AGENTS, metodología Personal, SOT y `operator-sdd-workflow`.

## 1. Problema y resultado

Cuatro pruebas suponen que el panel comienza en lunes, pero los miércoles comienza correctamente en miércoles. El chequeo puede impedir la publicación aunque el producto funcione. Resultado: conservar la cobertura y que esas pruebas pasen cualquier día sin cambiar el producto.

## 2. Alcance y NO-TOCAR

Allowlist de implementación, exclusivamente dentro de estos casos:

- `src/components/AppFlows.test.tsx`: `keeps routine editing separate from logging today’s workout`.
- `src/components/WorkoutPanel.test.tsx`: `removes a member from %i slots without discarding surviving targets or searches` para 2 y 3 (dos casos), y `chooses exercises before structure and keeps each target independent when going back` (uno).

Son **cuatro casos**, no tres. NO-TOCAR: cualquier otro caso, fixtures/helpers compartidos (incluido `setup()`), `src/components/WorkoutPanel.tsx`, resto del runtime, reloj global del producto, harness histórico, workflows/CI, `package.json`, lockfiles, dependencias, datos, Auth, legal, SMTP/DNS y servidores UAT. Prohibido quitar/reducir aserciones, cambiar expectativas para tolerar otro día, usar skip/only o esconder fallos. Documentación de entrega permitida: este SDD, `AUNARA_SOT/02-ESTADO-ACTUAL.md`, `AUNARA_SOT/PENDIENTES.md`, entrada aditiva en `AUNARA_SOT/03-HISTORIA-Y-BACKLOG.md` y nuevo recibo `AUNARA_SOT/sdd/2026-10-16-sdd015-revision/README.md`. Cualquier necesidad adicional vuelve al gate.

## 3. Estado real y evidencia

- `WorkoutPanel.tsx:139-145`: selecciona el día actual si pertenece a la ruta; el editor filtra por ese día.
- `WorkoutPanel.test.tsx:11-15`: fixture con lunes y miércoles; `:18-51` y `:53-80` esperan callbacks con `monday` sin seleccionarlo antes.
- `AppFlows.test.tsx:843-884`: fixture de dos días, ejercicio de lunes y cambio explícito a miércoles; `:890-895` selecciona lunes solo en la etapa posterior de registro.
- [Diagnóstico UAT](../handoffs/UAT-2026-10-16-claude-dev-diagnostico.md), §1/§2: reporta 367/367 con fecha real y cuatro fallos con miércoles sobre `d2ba0aa`. **Baseline nuevo `999c8f6`**, ejecutado por el frente principal en Mac: fecha real **371 pruebas / 25 archivos PASS**, más Sites **1 PASS**; reloj miércoles **367 PASS / 4 FAIL**, exactamente los cuatro casos de §2, exit 1 (Sites no ejecuta tras fallar Vitest). No confundir conteos heredados con esta base ni presentarlos como candidato corregido.

## 4. Diseño

Seleccionar explícitamente el botón **Monday** en cada uno de los cuatro casos antes de operar sobre el día. En WorkoutPanel, después de `setup()` y antes del asistente; en AppFlows, al entrar en edición y antes de buscar `Training day for Jump Squat`. Mantener los dos días, el movimiento **Monday → Wednesday**, las aserciones de separación edición/registro y la selección de lunes posterior al iniciar el entrenamiento. Esto usa una interacción existente y evita cambiar los fixtures que consumen otros casos.

## 5. Alternativas descartadas

Un solo día eliminaría el escenario de mover entre días en AppFlows. Cambiar `setup()` ampliaría innecesariamente el alcance. Inyectar fecha por caso es posible pero añade manejo de reloj; no hace falta cuando la prueba puede declarar el día que quiere operar. Cambiar la selección inicial del producto sería una regresión ajena al problema.

## 6. Riesgos y mitigación

Un clic en un momento incorrecto puede ocultar el ejercicio o debilitar el flujo: conservar todas las interacciones/aserciones y revisar el diff por caso. No asumir que cuatro fallos equivalen a cuatro declaraciones `it`: el parametrizado aporta dos. Las dos ejecuciones deben conservar exactamente el mismo inventario de pruebas que su baseline.

## 7. Verificación y aceptación falsable

Ejecutar baseline sin cambios de tests y candidato, con el mismo entorno/dependencias, guardando fecha/hora/zona, SHA, conteos y salida:

1. `npm test` con fecha real: baseline y candidato verdes; documentar el conteo real, sin trasladar automáticamente 367/25 desde la UAT.
2. `NODE_OPTIONS=--require=/private/tmp/aunara-sdd014-candidate/AUNARA_SOT/sdd/2026-10-16-uat-dev-revision/harness/wednesday-clock.cjs npm test`: baseline reproduce exactamente los cuatro casos; candidato verde completo. Si la firma no coincide, investigar antes de editar; no corregir otros rojos dentro de este SDD.
3. `npm run typecheck` y `git diff --check` verdes. No hay script lint en `package.json`; no se añade uno. Build/UI: no exigidos para este cambio exclusivo de tests; se acredita que el runtime no tiene diff.
4. Revisión independiente: ninguna aserción debilitada, ninguna prueba omitida y solo selección explícita del día en los casos autorizados. Restaurar temporalmente los cuatro cambios, fuera del candidato de entrega, debe devolver los cuatro rojos de miércoles (guarda red → green).

## 8. Plan de entrega

Aprobación del Operator → desarrollo mínimo → revisión independiente con comparación baseline/candidato → actualización de recibo/estado/pendientes/bitácora → commit local exclusivo de SDD-015. No combinar con SDD-016 ni tocar el runtime que sirve UAT. Este frente entrega solo el commit local, sin push/deploy; la coordinación conserva la orden permanente de documentación en dev.

## 9. Decisiones del Operator

La selección explícita de lunes y el alcance de cuatro casos fueron aprobados por la orden del Operator registrada en la cabecera. Resta su cierre; la aprobación técnica independiente no lo sustituye. No se solicita una decisión de producto adicional para SDD-015.

## 10. Definición de terminado

Cuatro casos estables con fecha real y miércoles; suite completa y typecheck verdes; mismo inventario/cobertura, NO-TOCAR intacto, revisión independiente aprobada, documentación y commit local. Cierre por el Operator; publicación requiere otra autorización.
