# SDD-011 — Sincronización: estado `syncing` atascado (H-01) y datos de salud sin consentimiento (H-02)

2026-10-12 · v0.1 · Estado: **H-01 construido en candidato aislado y en revisión; H-02 especificado, decisiones D-11-1…D-11-4 pendientes del Operator**.
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

### H-02 — allowlist propuesta (efectiva solo tras D-11-1…D-11-4)

| Archivo exacto | Cambio permitido |
|---|---|
| `src/App.tsx` | El `cloudSnapshot` que se sincroniza lleva `healthProfile` real solo si `cloud.healthDataConsent === "granted"`; en otro caso lleva `DEFAULT_HEALTH_PROFILE`. El `healthProfile` local, el export y la UI no cambian. |
| `src/hooks/useCloudSync.ts` | Al aplicar un snapshot remoto (`use-remote`), si el consentimiento no es `granted`, conservar el `healthProfile` local en vez del remoto. Al pasar a `revoked`/`declined`, forzar un guardado inmediato (no debounce) del snapshot sin salud. |
| `src/lib/cloudSnapshot.ts` | Solo si hace falta un helper puro `withoutHealthProfile(snapshot, defaults)` para no duplicar lógica. Sin cambios de validación ni de esquema. |
| Tests de los tres archivos | Aditivos. |

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

### H-02 (propuesto)

1. **Qué viaja.** `cloudSnapshot` lleva `healthProfile` real solo con consentimiento `granted`. Con `declined`, `revoked` o `null`, lleva `DEFAULT_HEALTH_PROFILE`. El esquema no cambia (el validador exige `healthProfile`), así que ningún cliente viejo se rompe.
2. **Qué baja.** Al aplicar un snapshot remoto, si el consentimiento no es `granted`, se conserva el `healthProfile` local. Con consentimiento `granted`, el remoto manda, como hoy. Esto evita la pérdida de datos del punto anterior y mantiene local-first para la salud.
3. **Revocar = borrar en el servidor.** Al pasar de `granted` a `revoked`, se guarda de inmediato el snapshot sin salud: como hay una sola fila por usuario, eso elimina los datos de salud del servidor sin función nueva. La copia local de la persona no se toca.
4. **Check-ins.** Como `sleepHours`, `energy` y `stress` son sensibles según el inventario, los check-ins siguen la misma regla que el perfil de salud: sin `granted` no viajan. Decisión D-11-2 porque cambia lo que hoy se sincroniza.
5. **Consentimiento `null`** (cuentas que nunca respondieron): se trata como no otorgado. Hoy esas cuentas suben salud; con el cambio dejan de hacerlo y, en el primer guardado, la salud remota pasa a defaults. Decisión D-11-1.

## 5. Alternativas descartadas

- **Dejar de subir salud sin tocar el bootstrap:** pierde la salud local en el siguiente arranque (§3). Descartado.
- **Borrar la fila entera al revocar:** destruye rutas, favoritos y progreso no sensible. Descartado; la revocación es de salud, no de la cuenta.
- **Conservar «progreso» desvinculado del usuario como estadística para mejores rutinas** (propuesta del Operator, 2026-10-12): **no en este SDD**, por cuatro razones medibles. (a) No existe hoy ningún consumidor: no hay motor de sugerencias ni SDD-007 iniciado; se guardaría para un uso futuro indefinido, que es justo lo que la minimización de datos prohíbe. (b) La finalidad «mejorar rutinas con datos agregados» no figura en la política v1.0 ni en el inventario; agregarla es cambio material de tratamiento ⇒ v1.1 y nueva aceptación, decisión jurídica abierta. (c) Con una base de pocas personas, quitar el `user_id` no anonimiza: edad, medidas, días de entrenamiento y fechas reidentifican; bajo Ley 1581 un dato reidentificable sigue siendo personal y, si es de salud, sensible. (d) Parte del «progreso» (energía, estrés, sueño) es sensible según el propio inventario, así que no puede conservarse tras revocar sin contradecir la regla que este mismo SDD implementa. Si más adelante hay motor y política que lo cubra, va en un SDD propio con agregación real (umbrales mínimos por celda, sin fechas exactas ni medidas crudas) y opt-in explícito.

## 6. Riesgo sobre lo que hoy funciona

- H-01: cambio de 10 líneas en un efecto; riesgo de restaurar `synced` encima del `syncing` de otra operación dentro de 800 ms (§4). Mitigado por los estados finales propios de cada operación y verificado por las matrices de Auth, privacidad, navegación y round-trip en ambos motores.
- H-02: cambia qué datos viajan y qué datos bajan. Riesgo de regresión en bootstrap multi-dispositivo (A con salud y consentimiento, B sin consentimiento) y en el export (que debe seguir mostrando la salud local). Por eso la matriz de §7 incluye los cuatro cruces de consentimiento × dispositivo y el export antes/después.

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
| S11-06 | Con consentimiento `declined`, `revoked` o `null`, el cuerpo de cada `POST repbook_user_data` tiene `healthProfile` igual a defaults y `checkIns: []`; con `granted`, lleva los valores reales. Medido con el proxy sintético, ambos motores. |
| S11-07 | Con consentimiento no otorgado y remoto con salud en defaults, tras recargar la salud local sigue intacta (export idéntico salvo timestamp). Con `granted`, el remoto manda como hoy. |
| S11-08 | Pasar de `granted` a `revoked` produce un POST inmediato con salud en defaults y `checkIns: []`; el GET siguiente devuelve esa fila; el export local conserva la salud. |
| S11-09 | Resumen de privacidad (E4) y UI de salud no cambian de comportamiento para el mismo consentimiento (RG-01…06 verdes). |
| S11-10 | Negativos: quitar el filtro de consentimiento ⇒ S11-06 rojo; quitar la preservación local ⇒ S11-07 rojo; ambos en copia disposable, restaurados. |

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

## 10. Definición de terminado

H-01: S11-01…S11-05 verdes en ambos motores con evidencia versionada; integrado a `dev` junto con 006 cuando el Operator confirme. H-02: D-11-1…D-11-4 decididas, S11-06…S11-10 verdes, revisión completa, commit en `dev`. Ninguno publica nada por sí mismo; UAT real y cierre siguen siendo del Operator.

## 11. Recibo H-01

Pendiente: se completa cuando terminen las matrices sobre el build del candidato `96b71c8` en Chromium y WebKit.
