# SDD-011 — Sincronización: estado `syncing` atascado (H-01) y datos de salud sin consentimiento (H-02)

2026-10-12 · v0.3 · Estado: **H-01 y H-02 APPROVED técnico (Chromium + WebKit) e integrados en `dev` como `8db846e` y `13a1264`; sin publicación**. D-11-1…D-11-4 aprobadas por el Operator («aprobadas D-11-1 a D-11-4»).
Origen: `[AUNARA/claude · modelo no expuesto]`. Orden del Operator: «Corregí vos los hallazgos» (2026-10-12), sobre los hallazgos H-01 y H-02 del [recibo del ciclo 2 de SDD-006](2026-10-12-sdd006-ciclo2-revision/RECIBO.md).
Base: candidato E4 `6704681` (E2+E3+E4, APPROVED técnico). Los dos hallazgos existen idénticos en `main` `1c709a3`; se corrigen sobre el candidato para que entren a `dev` con la integración de 006 y no generen conflictos con los 189 hunks que E2 ya cambió en `useCloudSync.ts`.

## 1. El problema, en el idioma del Operator

**H-01.** Si hacés un cambio y lo deshacés en menos de un segundo (dos cambios de idioma seguidos, marcar y desmarcar un favorito), la app queda diciendo que está sincronizando y no termina nunca. Mientras tanto, todos los botones que esperan a la nube quedan grises: Cancelar y Eliminar del modal de borrado, Ingresar, Recuperar contraseña, la autorización de salud. No se pierde nada; se destraba con cualquier otro cambio. Es un error de lógica en el guardado con retardo.

**H-02.** Hoy la app sube a Supabase el perfil de salud completo aunque la persona haya dicho que no autoriza el uso de sus datos de salud. La autorización gatea la personalización y el resumen de privacidad, pero no lo que viaja al servidor. El inventario de cumplimiento declara que la salud tiene «autorización separada, expresa, opcional y revocable». El Operator decidió el 2026-10-12: sin autorización no se almacena; al revocar, se elimina lo sensible del servidor.

Resultado buscado: (H-01) el estado de sincronización siempre vuelve a reposo; (H-02) el servidor solo contiene datos de salud de quien los autorizó, y deja de contenerlos cuando la autorización se retira, sin perder la copia local de la persona.

## 2. Alcance, allowlist y NO-TOCAR

### H-01 — allowlist (construido)

| Archivo exacto | Cambio |
|---|---|
| `src/hooks/useCloudSync.ts` | Un `useRef` propio del efecto de guardado con debounce y la restauración de `synced` en el retorno temprano cuando ese efecto había puesto `syncing`. Nada más. |
| `src/hooks/useCloudSync.test.tsx` | Un test nuevo, aditivo: A → B → A dentro de los 800 ms vuelve a `synced` sin guardado extra; un cambio no revertido sigue guardando una vez. |

### H-02 — allowlist (aprobada con D-11-1…D-11-4; forma final tras Build, ver Enmienda 1)

| Archivo exacto | Cambio |
|---|---|
| `src/lib/cloudSnapshot.ts` | Política de datos sensibles: `withholdSensitiveData` (reutiliza `stripSensitiveHealthData` de `privacy.ts` y vacía `checkIns`), `outboundSnapshot` (qué sale del dispositivo según consentimiento), `reconcileRemoteSnapshot` (qué baja), `snapshotsEqual` (igualdad estructural) y la lista `SENSITIVE_HEALTH_FIELDS` pineada por test a la función de `privacy.ts`. Sin cambios de validación ni de esquema. |
| `src/hooks/useCloudSync.ts` | El bootstrap reconcilia el remoto con la política y deja el servidor consistente de inmediato; el guardado con debounce envía solo el snapshot permitido. |
| `src/lib/cloudSnapshot.test.ts`, `src/hooks/useCloudSync.test.tsx` | Aditivos: 5 + 3 tests. |

`src/App.tsx` **no cambia**: la propuesta inicial de filtrar en App era circular (el snapshot se calcula antes de que el hook conozca el consentimiento) y la regla de qué es sensible ya existía en `privacy.ts`. `privacy.ts` no se toca.

### NO-TOCAR

- Esquema de `repbook_user_data`, funciones Edge (`delete-my-account`), políticas RLS, migraciones: fuera de alcance. Si el diseño exigiera tocarlos, volver al Operator.
- `LegalPanel.tsx`, `privacy.ts`, `LEGAL_VERSION`, textos legales: cualquier cambio de propósito o de tratamiento es decisión jurídica (D-11-4).
- Export de datos, resumen de privacidad (E4), onboarding, perfil, nutrición: intactos.
- No se agrega captura de datos nuevos, ni telemetría, ni «estadísticas anonimizadas» (ver §5 y D-11-4).

## 3. Estado de partida, medido

- H-01: `useCloudSync.ts` `6704681:289–311` y `main` `1c709a3:202–224`, bloque idéntico. Reproducido compilado en Chromium y WebKit: dos `selectOption` seguidos con el modal de borrado abierto ⇒ `.sync-trigger.is-syncing` durante ≥ 12 s, Cancelar deshabilitado, un solo POST; con 2,5 s entre cambios ⇒ `is-synced`, 3 POST (`2026-10-12-sdd006-ciclo2-revision/resultados/h01-debounce-probe.log`).
- H-02: con `user_metadata.health_data_consent = "declined"` y `healthNotes` local, el `POST /rest/v1/repbook_user_data` contiene `healthNotes` (`…/resultados/webkit/h02-security-probe.log`, `savePostCarriesHealthNotes: true`). `createRepbookSnapshot` (`App.tsx` `6704681:157–165`, `main:135–143`) incluye `healthProfile` sin mirar el consentimiento.
- Bootstrap: `selectBootstrapSnapshot` (`cloudSnapshot.ts:264–271`) elige **siempre** el remoto cuando existe. Por eso «dejar de subir salud» a secas pierde datos: el remoto quedaría con defaults y el próximo arranque los traería encima de la salud local.
- Los check-ins incluyen `sleepHours`, `energy` y `stress` (`types.ts:261–263`). El inventario de cumplimiento clasifica «energía, estrés y sueño» como salud sensible. Es decir: parte de lo que el Operator llama «progreso» **es** dato sensible según su propio registro.
- Ningún documento de `docs/compliance/` menciona uso estadístico, anonimización ni mejora de rutinas como finalidad. Marco declarado: Ley 1581 de 2012 (Colombia), responsable en Colombia, datos en Supabase São Paulo.

## 4. Diseño

### H-01 (construido en `wip/sdd011-h01-candidate-2026-10-12` = `96b71c8`)

Un `useRef<boolean>` `debouncedSavePending` que solo este efecto escribe: `true` al programar el guardado, `false` cuando el guardado resuelve o falla. En el retorno temprano (`serialized === lastSavedSnapshot.current`), si el ref está en `true`, se restaura `synced` y se limpia el ref. Así el `syncing` de otras operaciones (borrado, consentimiento, auth) no se toca: el efecto solo deshace el `syncing` que él mismo anunció. Limitación conocida: si otra operación pone `syncing` dentro de la ventana de 800 ms y el cambio se revierte, el estado vuelve a `synced` antes de que esa operación termine; esas operaciones vuelven a fijar su propio estado al completar y el modal de borrado conserva su latch `deleteSubmitted`.

### H-02 (construido en `wip/sdd011-h02-candidate-2026-10-12` = `0fd2743`, sobre H-01)

1. **Qué viaja.** Con consentimiento `granted`, el snapshot completo. Con `declined`, `revoked` o `null`, el snapshot pasa por la **misma regla que el producto ya aplica localmente** al revocar (`stripSensitiveHealthData`, `privacy.ts`): fecha de nacimiento, edad, sexo metabólico, medidas y composición, nivel de actividad, patrón y plan nutricional, ingredientes, alergias, notas de salud, cuestionario de aptitud y limitaciones vuelven a su valor vacío, `healthDataMode` queda `basic`, y `checkIns` viaja vacío. Las preferencias no sensibles (objetivo, metas, deporte, equipo, días, minutos, experiencia) y `onboardingCompleted` **sí** viajan: si no, un usuario sin consentimiento perdería la sincronización de preferencias y repetiría el onboarding en otro dispositivo. El esquema no cambia.
2. **Qué baja.** Sin consentimiento, el dispositivo conserva sus campos sensibles y check-ins y toma del remoto todo lo demás. Con consentimiento, el remoto manda, salvo dos casos en que fue escrito sin autorización y no debe pisar al dispositivo: trae cero datos sensibles mientras el dispositivo los tiene, o degradaría un dispositivo `personalized` a `basic`. «Cero datos sensibles» normaliza vacíos: ausente, `null`, `""` y `[]` cuentan igual, porque las filas de clientes anteriores omiten claves opcionales que la regla escribe como `null` o `[]`, y esa diferencia no puede valer como «datos» (Build lo encontró como pérdida de datos real en el probe compilado y lo cerró con test).
3. **Servidor consistente en el arranque.** Tras aplicar el remoto, si lo que este dispositivo puede enviar difiere estructuralmente de la fila (comparación sin orden de claves), se guarda ahí mismo. Eso limpia una copia legacy con salud subida antes del arreglo aunque la persona no cambie nada, restaura la salud al servidor cuando un dispositivo con datos vuelve a tener autorización, y normaliza una sola vez las filas con forma vieja.
4. **Revocar.** El producto **ya** vacía la salud sensible local y los check-ins al revocar o declinar (`App.changeHealthConsent`, presente en `main`); este SDD no lo cambia. Con H-02 el servidor sigue al dispositivo: el cambio de consentimiento dispara el guardado del snapshot permitido dentro de la ventana de debounce (≤ 2 s medidos), y como hay una sola fila por usuario eso elimina la salud del servidor sin función nueva. Volver a autorizar reactiva el modo `personalized`; no hay datos locales que restaurar salvo que otro dispositivo los conserve (caso cubierto en el punto 2).
5. **Check-ins** siguen la misma regla que el perfil de salud (D-11-2). **Consentimiento `null`** se trata como no otorgado (D-11-1).

## 5. Alternativas descartadas

- **Dejar de subir salud sin tocar el bootstrap:** pierde la salud local en el siguiente arranque (§3). Descartado.
- **Borrar la fila entera al revocar:** destruye rutas, favoritos y progreso no sensible. Descartado; la revocación es de salud, no de la cuenta.
- **Conservar «progreso» desvinculado del usuario como estadística para mejores rutinas** (propuesta del Operator, 2026-10-12): **no en este SDD**, por cuatro razones medibles. (a) No existe hoy ningún consumidor: no hay motor de sugerencias ni SDD-007 iniciado; se guardaría para un uso futuro indefinido, que es justo lo que la minimización de datos prohíbe. (b) La finalidad «mejorar rutinas con datos agregados» no figura en la política v1.0 ni en el inventario; agregarla es cambio material de tratamiento ⇒ v1.1 y nueva aceptación, decisión jurídica abierta. (c) Con una base de pocas personas, quitar el `user_id` no anonimiza: edad, medidas, días de entrenamiento y fechas reidentifican; bajo Ley 1581 un dato reidentificable sigue siendo personal y, si es de salud, sensible. (d) Parte del «progreso» (energía, estrés, sueño) es sensible según el propio inventario, así que no puede conservarse tras revocar sin contradecir la regla que este mismo SDD implementa. Si más adelante hay motor y política que lo cubra, va en un SDD propio con agregación real (umbrales mínimos por celda, sin fechas exactas ni medidas crudas) y opt-in explícito.

## 6. Riesgo sobre lo que hoy funciona

- H-01: cambio de 10 líneas en un efecto; riesgo de restaurar `synced` encima del `syncing` de otra operación dentro de 800 ms (§4). Mitigado por los estados finales propios de cada operación y verificado por las matrices de Auth, privacidad, navegación y round-trip en ambos motores.
- H-02: cambia qué datos viajan y qué datos bajan. Riesgo de regresión en bootstrap multi-dispositivo y en el export. Por eso §7 cubre los cuatro estados de consentimiento, fila legacy con salud, fila sin salud con forma nueva y vieja, revocación y re-autorización, segundo dispositivo con datos, y el export antes/después.
- Preexistente y **fuera de este SDD** (anotado para Spec, H-03): el hook vuelve a hacer bootstrap ante cualquier cambio del objeto `user` (consentimiento, refresco de token) y el remoto gana; un cambio local hecho justo antes puede ser pisado. H-02 protege la salud y el modo, no el resto del snapshot.

## 7. Verificación: criterios falsables

### H-01

| ID | Criterio binario |
|---|---|
| S11-01 | Test `returns to synced when a change is reverted inside the debounce window` **rojo** sobre `6704681` (`expected 'syncing' to be 'synced'`) y **verde** sobre el candidato; sin cambios en otros tests. |
| S11-02 | Compilado, ambos motores, ambas bases: dos `selectOption` seguidos con el modal de borrado abierto ⇒ `.sync-trigger.is-synced` en ≤ 3 s y Cancelar habilitado; el build E4 de control sigue en `is-syncing` (negativo). |
| S11-03 | Un cambio no revertido guarda exactamente una vez y termina `synced` (unitario y compilado: 1 POST por cambio). |
| S11-04 | Matrices del ciclo 2 (storage, startup, Auth, privacidad, navegación, geometría) repetidas sobre el build del candidato en Chromium y WebKit, mismos totales que el recibo de 006. |
| S11-05 | Delta del candidato contra `6704681`: exactamente `useCloudSync.ts` y `useCloudSync.test.tsx`; suite 349/25 (348 + 1); typecheck; allowlist Pages 32 en `/` y `/aunara/`. |

### H-02 (a ejecutar tras aprobación)

| ID | Criterio binario |
|---|---|
| S11-06 | Con consentimiento `declined`, `revoked` o `null`, el cuerpo de cada `POST repbook_user_data` tiene los campos sensibles de `stripSensitiveHealthData` en su valor vacío, `healthDataMode: "basic"` y `checkIns: []`, y conserva preferencias no sensibles y `onboardingCompleted`; con `granted`, lleva los valores reales. Con fila legacy con salud y consentimiento no otorgado, el arranque produce un POST limpio y el export local conserva la salud. Medido con el proxy sintético con estado, ambos motores. |
| S11-07 | Consentimiento no otorgado y remoto sin salud (forma nueva): recarga conserva la salud local y produce **cero** guardados. Forma vieja (sin claves opcionales): exactamente **un** guardado de normalización en el primer arranque y cero tras recargar. Con `granted` y remoto con datos, el remoto manda. |
| S11-08 | `granted` → revocar en el centro de privacidad: la fila remota queda sin datos sensibles con preferencias intactas y `healthDataMode: "basic"`, y el dispositivo también (regla preexistente del producto). Volver a autorizar deja la fila con `personalized` e igual al dispositivo. Segundo dispositivo con datos, `granted`, frente a una fila sin salud: conserva sus datos y restaura la fila. |
| S11-09 | Resumen de privacidad (E4) y UI de salud no cambian de comportamiento para el mismo consentimiento (RG-01…06 verdes). |
| S11-10 | Negativos en copia disposable, uno por vez, restaurados: sin filtro de consentimiento; sin preservación local; sin limpieza del servidor en bootstrap; sin normalización de vacíos; sin protección del modo. Cada uno pone en rojo al menos un test; control verde. |

Regla de siempre: tráfico externo bloqueado, datos sintéticos, WebKit obligatorio, cero cambios de producto para ocultar un rojo.

## 8. Plan de entrega

1. H-01: candidato `96b71c8` en `wip/sdd011-h01-candidate-2026-10-12` (un commit sobre `6704681`). Revisión por el mismo harness del ciclo 2 en ambos motores; recibo en §11.
2. Si H-01 APPROVED y el Operator confirma la integración de 006: commit integrado E2+E3+E4 en `dev` seguido del commit H-01 (dos commits, historia legible), o un solo commit si el Operator prefiere. Sin publicación.
3. H-02: tras D-11-1…D-11-4, Build en candidato aislado sobre el H-01, tests rojo→verde por criterio, revisión completa, commit en `dev`. Sin publicación.
4. Publicación de todo lo anterior: paso 3 de la [orden](../ordenes/ORDEN-2026-10-12-retomar-sdd006.md), con orden nueva.

## 9. Decisiones que necesita el Operator

- **D-11-1 — Consentimiento `null`:** tratarlo como no otorgado (deja de subir salud y la salud remota pasa a defaults en el primer guardado). Recomendado. Alternativa: mantener el comportamiento actual solo para `null` hasta que la persona responda, lo que deja el defecto abierto para cuentas antiguas.
- **D-11-2 — Check-ins:** seguir la misma regla que el perfil de salud (sin `granted` no viajan), porque energía/estrés/sueño son sensibles según el inventario. Recomendado. Alternativa: separar los campos sensibles del check-in y subir el resto, que exige cambio de esquema y queda fuera de este SDD.
- **D-11-3 — Revocación:** borrar la salud del servidor sobrescribiendo la fila con defaults (sin función nueva, sin tocar rutas ni favoritos). Recomendado. Nota: Supabase conserva respaldos del proyecto según su plan; el borrado lógico en la fila no borra respaldos, igual que hoy el borrado de cuenta. Es un hecho del proveedor a declarar en `retention-and-rights.md`, no algo que este SDD resuelva.
- **D-11-4 — Estadísticas desvinculadas para «entrenar» sugerencias:** fuera de este SDD por §5. Si el Operator insiste, abrir SDD propio condicionado a: motor consumidor existente, política v1.1 con la finalidad declarada y aceptada, agregación con umbral mínimo y sin fechas/medidas crudas, opt-in. Recomendación: diferir hasta SDD-007.

### Enmienda 1 — decisiones de Build sobre H-02 · 2026-10-12

`[AUNARA/claude · modelo no expuesto]` — Cuatro desvíos respecto del §4 propuesto, todos a favor de menos código y menos pérdida de datos, sin tocar las decisiones D-11-1…D-11-4: (1) la regla de qué es sensible no se duplica: se reutiliza `stripSensitiveHealthData` de `privacy.ts`, que el producto ya aplica localmente; (2) se retienen solo los campos sensibles, no el `healthProfile` entero, para no romper la sincronización de preferencias ni el onboarding en otro dispositivo; (3) «la copia local no se toca» era falso: el producto ya la vacía al revocar desde `main`; el criterio S11-08 se corrigió a lo que el producto hace; (4) dos protecciones adicionales descubiertas por el probe compilado (fila de cliente viejo con claves ausentes que valía como «datos» y pisaba al dispositivo; modo `personalized` degradado al re-autorizar), ambas con test y negativo. `App.tsx` queda fuera del delta.

## 10. Definición de terminado

H-01: S11-01…S11-05 verdes en ambos motores con evidencia versionada; integrado a `dev` junto con 006 cuando el Operator confirme. H-02: D-11-1…D-11-4 decididas, S11-06…S11-10 verdes, revisión completa, commit en `dev`. Ninguno publica nada por sí mismo; UAT real y cierre siguen siendo del Operator.

## 11. Recibos

### H-01 (`96b71c8`)

Unitario: test rojo sobre `6704681` (`expected 'syncing' to be 'synced'`) → verde; suite 349/25; typecheck. Compilado (`harness/h01-negative.mjs`, ambos motores): build E4 `stuck=is-syncing`, candidato `stuck=is-synced`, un POST por cambio no revertido. Matrices del ciclo 2 sobre el build del candidato (`resultados/h01/`), Chromium y WebKit: storage 276/276, startup 84/84, Auth 42/42, privacidad 84/84, navegación/modal/legal 156/156, round-trip/flotante/footer 52/52 (la primera pasada de storage en Chromium dio 96/276 porque la carpeta de corrida no tenía enlazados los builds de control E2; enlazados, 276/276; no es producto). S11-01…S11-05 **PASS**. Veredicto: **APPROVED técnico**.

### H-02 (`0fd2743`)

Unitario: 5 tests nuevos en `cloudSnapshot.test.ts` y 3 en `useCloudSync.test.tsx`, rojos sobre H-01 (`expected 'rodilla derecha' to be ''`, `withholdSensitiveData is not a function`) → verdes; suite 359/25; typecheck; builds `/` y `/aunara/` allowlist 32; guards 27/27. Negativos S11-10: N1 sin filtro ⇒ 3 rojos; N2 sin preservación ⇒ 5 rojos; N3 sin limpieza en bootstrap ⇒ 1 rojo; N4 sin normalización de vacíos ⇒ 1 rojo; N5 sin protección del modo ⇒ 1 rojo; worktree restaurado, control 96/96. Compilado (`harness/h02-consent-probe.mjs`, Supabase sintético con estado, `resultados/h02/`): **9/9 en Chromium y 9/9 en WebKit** (S11-06 × 4 estados + legacy, S11-07, S11-07b, S11-08, S11-08b). Matrices del ciclo 2 sobre el build del candidato (`resultados/h02/<motor>/`), Chromium y WebKit: storage 276/276, startup 84/84, Auth 42/42, privacidad 84/84 (RG-01…06 ⇒ S11-09), navegación/modal/legal 156/156, round-trip/flotante/footer 52/52. S11-06…S11-10 **PASS**. Veredicto: **APPROVED técnico**.

### Entrega — 2026-10-12

`dev` recibe `8db846e` (H-01, cherry-pick de `96b71c8`) y `13a1264` (H-02, árbol idéntico al candidato `0fd2743`, un solo commit). Verificado sobre `dev`: typecheck; Vitest 359/25 + Node 28 tests de scripts; guards 28/28; builds `/` y `/aunara/` con allowlist 32; `git diff --check` limpio. Caveat de método, igual que en 006: un solo revisor independiente del constructor y constructor a la vez en este SDD (Build y Review por el mismo agente, por orden directa del Operator «Corregí vos los hallazgos»); la evidencia es ejecutable y queda versionada para un panel posterior si el Operator lo quiere. Sin publicación: `main` sigue en `1c709a3`.
