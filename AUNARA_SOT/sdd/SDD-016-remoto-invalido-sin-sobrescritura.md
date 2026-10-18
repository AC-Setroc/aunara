# SDD-016 — Remoto inválido sin sobrescritura

**Estado: Implementado y APPROVED técnico; cierre del Operator pendiente.** 2026-10-16. `[AUNARA/codex · modelo no expuesto]`.
Revisión y entrega: [recibo](2026-10-16-sdd016-revision/README.md). Suites real/miércoles396/25+Node11 PASS; HTTP24/24 por versión y repetición independiente24/24; builds raíz/rollback32 cada uno y guardas27 PASS. El coordinador completó el veredicto/entrega tras interrupción de los agentes revisor/entrega, sin haber implementado fuente ni probe. No es aceptación humana ni publicación.
Operator: «Implementá. Necesito que esta versión quede lista hoy» aprueba SDD-015/016. Base de desarrollo `2ebb569` en `/private/tmp/aunara-sdd015-016-candidate` (no canónica ni servidor UAT). Inspección original preservada: `dev` `999c8f6`, `/private/tmp/aunara-sdd014-candidate`. Se leyeron AGENTS, metodología Personal, SOT y `operator-sdd-workflow`; IDs 015/016 sin ocupación previa en nombres/referencias de la SOT.

## Enmienda mínima aprobada — guarda de SDD-014

Operator responde **«Aprobar enmienda mínima»** a la consulta específica del script. `2ebb569` incorpora a npm test las guardas de correo. `scripts/auth-email-templates.node-test.mjs:21,41-42` exige el hash exacto de useCloudSync de61610c1, incompatible con el fix de este SDD. Se añade a la allowlist **solo ese script**, para actualizar únicamente su referencia de useCloudSync a la fuente corregida y revisada, con comentario de procedencia SDD-016; mantener hashes de privacidad/LegalPanel, todas las validaciones, pruebas negativas y conteos. El revisor debe calcular/contrastar el hash final por su cuenta y verificar que la mutación de consentimiento siga roja; no aceptar un hash para esconder un diff no revisado. Aclaración documental de esta transición en el recibo SDD-016, sin modificar las plantillas ni la evidencia SDD-014 original. El resto del scope/NO-TOCAR se conserva.

## 1. Problema y resultado

Si el servidor devuelve datos que este cliente no entiende, conserva correctamente su copia local, pero puede reemplazar la copia del servidor con ella. Un cliente antiguo en caché podría así destruir datos de otro cliente. Resultado: **un remoto existente rechazado por el validador nunca habilita una subida automática de la copia local**. Se conserva la edición local y se informa error de sincronización, no éxito.

## 2. Alcance y NO-TOCAR

Allowlist exacta propuesta para implementación:

- `src/lib/cloudStore.ts` y `src/lib/cloudStore.test.ts`: distinguir fila ausente de fila presente con payload desconocido, incluido null/falsy.
- `src/lib/cloudSnapshot.ts` y `src/lib/cloudSnapshot.test.ts`: resultado explícito de validación, aditivo, reutilizando las reglas actuales; preservar el contrato fallback de `normalizeRepbookSnapshot`.
- `src/hooks/useCloudSync.ts` y `src/hooks/useCloudSync.test.tsx`: gate de bootstrap/autoguardado y mensaje de error ES/EN; pruebas de rechazo, recuperación y regresión acotadas.
- Evidencia nueva: `AUNARA_SOT/sdd/2026-10-16-sdd016-revision/README.md`, `probe.mjs`, `baseline.json`, `candidate.json`, `verification.txt` dentro de esa misma carpeta. El probe nuevo puede consumir helpers existentes solo en lectura; no reparar el harness histórico por esta vía.
- Documentación de entrega: este SDD, `AUNARA_SOT/02-ESTADO-ACTUAL.md`, `AUNARA_SOT/PENDIENTES.md`, entrada aditiva en `AUNARA_SOT/03-HISTORIA-Y-BACKLOG.md`.

NO-TOCAR: todo runtime ajeno al gate (componentes/UI, rutinas, almacenamiento local, Auth/recuperación, consentimiento y borrado explícito), contratos de payload/schemaVersion, reglas del validador, H-01/H-02, tablas/RLS/migraciones/funciones remotas, nuevas políticas de datos, fusión/versionado/conflictos, reset o sobrescritura implícita. Tampoco workflows/CI, scripts de paquete, dependencias/lockfiles, pruebas de SDD-015, evidencia histórica, legal, SMTP/DNS, cuentas reales, servidor UAT ni publicación. No cambiar el comportamiento de H-03 como objetivo independiente. Un archivo o política adicional requiere SDD revisado y aprobación.

## 3. Estado real y evidencia

- `cloudStore.ts:44-46,66-73`: load declara snapshot tipado pero no valida; `data?.payload ?? null` confunde fila ausente con payload nulo. `:76-85` hace upsert por usuario.
- `cloudSnapshot.ts:348-368`: devuelve el mismo fallback si rechaza el valor. `:100-103` exige position < size; `:184` no acepta sport vacío. `:371-377` distingue remoto/no remoto, no inválido.
- `useCloudSync.ts:272-295`: normalize recibe el local como fallback, luego reconciliación/bootstrap y posible save; el rechazo no queda representado como estado distinto. `:297-304` marca synced o error; `:311-345` habilita debounce por bootstrappedUserId y guarda a los 800 ms. `:259-264` resetea marcas solo sin cliente/usuario; rebootstrap del mismo usuario exige impedir que una marca anterior permita guardar tras rechazo.
- `useCloudSync.test.tsx:20-23` mockea load/save; `:311-331` fija preservación de error de sync; `:334-355` cubre H-01; `:358-422` cubre H-02. `cloudStore.test.ts:28-83` cubre filtro por usuario, ausencia, upsert y error; `cloudSnapshot.test.ts:178-206` exige fallback intacto ante datos inválidos, `:209-234` fija ausente/válido.
- Búsqueda `rg` de createCloudStore, `.load(` y normalize en `src/**/*.{ts,tsx}`: único consumidor productivo de `store.load` en `useCloudSync.ts:272`; normalize también se usa en tests, cuyo contrato debe permanecer. No se presume soporte de retry explícito: interfaz del hook `:33-45` no lo expone.
- [Diagnóstico UAT](../handoffs/UAT-2026-10-16-claude-dev-diagnostico.md), §2.2; [validate-row](2026-10-16-uat-dev-revision/harness/validate-row.ts) y [W-01](2026-10-16-uat-dev-revision/harness/uat16-walkthrough.mjs): antecedente medido en `d2ba0aa`. El probe cuenta POST de repbook_user_data (`:35`) y simula dos dispositivos (`:39-60`). No es evidencia nueva de corrección.

## 4. Diseño y límites

1. Lectura devuelve una unión interna **ausente / presente(payload: unknown)**; solo ausencia real de fila habilita inicializar con local. Payload null, false, 0, vacío, incompleto o de esquema desconocido es presente inválido, no cuenta nueva. Los errores de transporte siguen el camino de error existente.
2. Exponer una validación explícita válida/inválida reutilizando las mismas comprobaciones que normalize, sin duplicarlas ni hacerlas permisivas. Mantener normalize(value, fallback) con exactamente su comportamiento actual. Nunca inferir rechazo comparando con el objeto local, que podría ser idéntico a un remoto válido en tests.
3. Antes de cada bootstrap, cerrar elegibilidad de autoguardado de esa identidad e invalidar temporizadores pendientes de ese ciclo. Ausente permite la subida normal; válido mantiene reconcile/outbound/H-02 y save cuando corresponde. Inválido termina antes de callback remoto, reconciliación, lastSaved y save: local intacto, estado error y mensaje ES/EN que indica que no se pudo leer la copia de nube y no se sobrescribió. No afirmar versión nueva/corrupción como causa cierta.
4. El bloqueo debe cubrir bootstrap inicial, ediciones posteriores, debounce pendiente y rechazo en rebootstrap de la misma identidad. Una generación/identidad vieja no puede habilitar guardado ni limpiar bloqueo de una sesión nueva. No se promete deshacer un POST ya enviado antes de conocer el rechazo; registrar esa frontera y prevenir nuevos POST del ciclo rechazado.
5. Reintento **sin nuevo botón/API**: una nueva lectura por los mecanismos existentes (recarga/remontaje o evento de sesión que hoy dispara bootstrap) vuelve a comprobar el servidor. Mientras siga inválido, cero subidas. Solo una lectura posterior válida o realmente ausente habilita el flujo normal; cambiar campos locales o limpiar error de Auth no desbloquea. Estado error tras concluir el intento, nunca syncing indefinido ni synced falso.
6. No introducir reparación, delete/reset, migración o elección local/remoto. Las acciones explícitas de borrado existentes no se alteran ni se convierten en recuperación automática. No guardar payload remoto ni datos personales en logs de evidencia.

## 5. Alternativas descartadas

Normalizar a local y seguir mezcla rechazo con éxito. Tratar payload falso como ausencia sigue siendo destructivo. Relajar el esquema o subir un formato nuevo decide políticas que este SDD no autoriza. **Recomendación: H-03 fuera**: cambiar dependencias/bootstrap por identidad modifica precedencia de datos ante consentimiento/token y requiere decisiones y pruebas propias; este guard protege cualquier bootstrap actual, sin corregir esa política preexistente (`PENDIENTES.md`, H-03).

## 6. Riesgos y mitigación

Cerrar solo el primer save deja abierto debounce tras rebootstrap: probar ambos. Bloqueo global puede contaminar cuenta B: marcas por identidad/generación y pruebas A → B. Cambiar load obliga a actualizar sus mocks/consumidores enumerados, no a ampliar otros contratos. Un error de lectura no debe borrar datos ni alterar consentimiento. Si la garantía necesita cambios fuera de allowlist, detener y volver al Operator.

## 7. Verificación y aceptación falsable

- **Red → green unitario:** antes del fix, rechazo de sport vacío y position ≥ size demuestra subida indebida; después cero llamadas save y callback remoto, local idéntico, error visible al terminar. Incluir payload null/falsy, versión desconocida, shape anidado inválido y remoto válido idéntico al local (no falso rechazo).
- Mantener cero save tras editar local y avanzar >800 ms; repetir tras un bootstrap previo exitoso, temporizador pendiente y evento del mismo usuario con remoto ahora inválido. clearAuthError no desbloquea. Lecturas/replies tardías de A no autorizan writes de B.
- Reintento con remoto aún inválido permanece bloqueado; luego remoto válido vuelve a synced con reconciliación normal. Ausencia real sube local válido normalmente. Error de transporte mantiene local y error sin subida.
- Cuenta A inválida → B válida/ausente: B funciona sin heredar bloqueo ni datos de A; B → A inválida vuelve a bloquear. H-01 A→B→A dentro de 800 ms (aquí snapshots, no cuentas), H-02 granted/declined/revoked/null, limpieza legacy y restauración continúan verdes, sin reducir aserciones.
- **Probe sintético negativo GET/POST**, sobre baseline y candidato, derivado de W-01: GET devuelve fila existente inválida; contar específicamente POST a repbook_user_data, esperar bootstrap+>800 ms y editar un campo local. Baseline debe mostrar POST indebido, candidato **0** y fila remota sin cambios, local conservado. Repetir ambos defectos reportados. Después probar fila ausente y fila válida, y W-01 normal de dos dispositivos con fixture validado. Un mock de save solo no acredita este criterio.
- Probe en Chromium y WebKit, bases `/` y `/aunara/`, ES/EN para mensaje afectado. Usar Supabase sintético y builds aislados; sin cuentas reales. El harness histórico no es autocontenido: validate-row importa ruta Linux absoluta y lib depende de server.mjs no incluido. No declarar reproducibilidad sin resolver dependencias en el probe nuevo autorizado o registrar bloqueo. No parchear antecedentes.
- `npm run typecheck`, `npm test`, `npm run build`, `git diff --check`. No existe script lint; no añadirlo. Si SDD-015 no está integrado y la fecha controlada reproduce sus cuatro rojos, documentarlos como baseline de otro SDD sin reducir cobertura ni atribuir verde global. Inspección independiente del diff contra allowlist/NO-TOCAR.

## 8. Plan de entrega

Aprobar esta spec → tests que reproduzcan el defecto → implementación acotada → revisión independiente unitario+HTTP/UI negativa y normal → documentación con recibos sanitizados → commit local exclusivo de SDD-016. Tope de tres iteraciones por metodología; rechazo vuelve al desarrollo. No push, deploy, producción ni cambios de infraestructura. Esta fase solo versiona la propuesta documental, no implementación.

## 9. Decisiones del Operator

Aprobar el fail-closed, unión interna de lectura, error ES/EN sin nueva UI de retry y exclusión de H-03. Versionado, reparación, merge de copias y nueva política de conflictos quedan sin decisión y fuera del alcance; este SDD no los resuelve tácitamente.

## 10. Definición de terminado

Remoto rechazado preservado con cero nuevas subidas automáticas; local intacto y error coherente; retry seguro, ausente/válido y cuentas aisladas; regresiones H-01/H-02 verdes; prueba negativa HTTP baseline/candidato y normal en ambos motores; revisión independiente aprobada; recibos/doc y commit local. Cierre final exclusivo del Operator.
