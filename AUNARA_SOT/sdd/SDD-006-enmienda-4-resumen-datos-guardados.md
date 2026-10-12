# SDD-006 — Enmienda 4: resumen de perfil y preferencias guardados

2026-10-12 · v0.1 · Estado: **Aprobado; desarrollo aislado en curso**.
Origen: `[AUNARA/codex · modelo no expuesto]`.
Casa canónica: `/Users/alejandro/AI Projects/Personal/aunara`.

Complementa [SDD-006 + E1](SDD-006-acceso-y-creacion-rutinas.md), [E2](SDD-006-enmienda-2-consolidacion-local.md) y [E3](SDD-006-enmienda-3-arranque-almacenamiento.md). La revisión independiente de E3 fue **REJECTED** por CA06-03: el resumen omite perfil/preferencias existentes si el onboarding está incompleto. E3 no permitía arreglar App; esta enmienda fue preparada sin implementar y posteriormente aprobada explícitamente, como consta abajo. Desarrollo aislado en curso, revisión completa y commit pendientes.

Registro posterior2026-10-12 `[AUNARA/codex · modelo no expuesto]`: el Operator respondió «Sí» a la solicitud explícita de aprobar el alcance mínimo E4. D-E4-1 queda aprobada; la fase de preparación del párrafo anterior es histórica. Se autoriza solo App y dos tests en nuevo candidato, dentro del siguiente ciclo del límite vigente. Revisión completa y commit local aún pendientes; no autorización de publicación ni UAT real.

## 1. El problema y el resultado deseado

Una persona que ya guardó su nombre o preferencias puede abrir el centro de privacidad y ver una lista vacía de datos guardados porque todavía no completó el onboarding. La lista confunde haber terminado una tarea con tener datos existentes.

Resultado propuesto: enumerar «Perfil y preferencias / Profile and preferences» cuando el contexto actual de la cuenta que ya usa la exportación contiene un perfil completado **o** información significativa de nombre/preferencias aunque esté incompleto. No inventar información guardada a partir de los valores iniciales vacíos. No cambiar el onboarding, los permisos ni qué datos se guardan, exportan o sincronizan.

## 2. Alcance y fuera de alcance

### Allowlist aprobada el 2026-10-12

| Archivo exacto existente | Único delta permitido |
| --- | --- |
| `src/App.tsx` | Derivación pura de `dataSummary.profile` desde el mismo estado/snapshot que usa `exportPersonalData`; sustituir la dependencia exclusiva de `onboardingCompleted`. Helper local únicamente si mejora legibilidad, sin archivo nuevo ni efecto de persistencia. |
| `src/components/AppFlows.test.tsx` | Casos de integración del resumen derivado, perfiles parciales/vacíos/completados, exportación inalterada y regresiones de acceso/identidad. |
| `src/components/AccessPanel.test.tsx` | Casos de categoría presente/ausente, bilingüismo, categorías existentes y privacidad, sin debilitar tests previos. |

Tres archivos constituyen la frontera exacta propuesta: App y dos tests existentes. Se autorizarían hunks nuevos únicamente de este defecto en un candidato aislado derivado de E3 congelado. Los hunks E2 anteriores de App/tests se conservan salvo la línea de derivación identificada y adiciones pertinentes; no copiar el dirty canónico ni rehacer la integración. `AccessPanel.tsx` ya consume correctamente el booleano existente y permanece byte por byte; no hay necesidad demostrada de cambiar renderer, copy o contrato.

En esta fase, este agente solo crea **este documento**. Main conserva propiedad de estado/pendientes/bitácora/SDD-006/E2/E3. En entrega futura esos documentos podrán actualizarse con decisión, estado y recibos propios, según las fronteras documentales E2/E3; no absorber cambios ajenos ni borradores007–009.

### NO-TOCAR

- `src/main.tsx`, `src/main.test.tsx`: bootstrap E3 congelado. Sin nueva excepción get-only ni cambio de clasificación/carga/recarga/idioma/worker.
- `src/components/AccessPanel.tsx`: firma opcional `dataSummary.profile`, etiquetas, renderer, callbacks y demás UI sin cambios. Sus tests son aditivos, no permiso de editar producción.
- `src/hooks/useCloudSync.ts`, `src/hooks/useStoredState.ts`, sus tests; `src/lib/supabaseClient.ts`, `src/lib/cloudStore.ts`, `src/lib/cloudSnapshot.ts`, `src/lib/privacy.ts`, sus tests; `src/types.ts`. No cambios de owner/session/bootstrap, storage, tokens, claves, schemaVersion, stripping, exportación ni transporte.
- No lectura directa de almacenamiento privado, tokens o claves adicionales para inferir presencia. No flags «perfil guardado», timestamps, IDs de dueño ni metadatos persistidos nuevos. Ningún setter, escritura, borrado o migración provocado por el resumen.
- `legacyWorkout` y `repbook-workout`: sin conteo/categoría nueva en el resumen de cuenta, sin migración a tracks, sin inclusión nueva en exportación/nube, sin cambios de lectura/limpieza. Su dueño no está acreditado por el contrato actual; ausencia en ese resumen **no se declara otro defecto confirmado**.
- Rutas/prescripciones, favoritos, check-ins y salud: mismas derivaciones/categorías/conteos y consentimiento; no cambiar onboarding, creación/edición de perfil o preferencias, biblioteca, nutrición/wellness, reglas clínicas, coaches, directorio/IDs, notas/historia/conteo por lado.
- Todos los demás componentes/estilos/scripts/guardas/dependencias/config/lockfiles/activos/PWA/worker/manifest, referencias privadas y metodología. Fuente/tests/activos/config/entornos/índice canónicos intactos.
- `.env*`, backend/RLS/tablas/permisos, DNS/HTTPS/Auth/SMTP, cuentas/correos/tokens reales, push/merge/release/deploy/producción: fuera de alcance. No instalar herramientas, debilitar assertions ni forzar foco para obtener PASS.

Una necesidad adicional, incluido aislamiento que exija contrato de owner nuevo, detiene implementación y vuelve al gate; no se amplía por cercanía ni por un test rojo.

## 3. Estado real de partida, medido y no supuesto

Lectura fresca 2026-10-12: HEAD canónico `1c709a3f6d09b940a01e39eb55a2a49b74de712f`; índice canónico vacío. Se leyeron AGENTS, metodología Personal completa, SOT/estado, E2/E3 completos, código del candidato congelado y reporte independiente. No se corrieron pruebas nuevas ni experimentos de producto en esta fase.

| Evidencia del candidato `/private/tmp/aunara-sdd006-e3-candidate.DKIck1/repo` | Hecho y límite |
| --- | --- |
| `src/App.tsx:66–94,131–157` | Defaults reales de perfil, nombre inicial `Mi perfil`, estado usado para `cloudSnapshot`; completar onboarding es solo un campo del perfil. |
| `src/App.tsx:161–198` | Snapshot remoto actualiza nombre/preferencias y limpieza existente restaura defaults al salir. No nueva política de identidad. |
| `src/App.tsx:213–219,613–626,1038` | Gates de acceso/onboarding separados; export usa `cloudSnapshot` y exige email. Resumen usa exclusivamente `healthProfile.onboardingCompleted === true` para perfil. |
| `src/components/AccessPanel.tsx:81,474–486` | Contrato booleano opcional `profile`; centro visible con email; lista solo categorías truthy. No defecto de renderer demostrado. |
| `src/lib/cloudSnapshot.ts:10–20,234–270`; `src/lib/privacy.ts:16–46,48–64` | Snapshot v1 incluye nombre/healthProfile/preferencias; export devuelve el snapshot, sin condicionar su existencia al onboarding. Stripping conserva preferencias no sensibles. Defaults y campos omitidos no prueban por sí mismos una edición. |
| `src/hooks/useCloudSync.ts:246–281,610–627`; `src/lib/cloudStore.ts:66–91` | Bootstrap carga/guarda por `user.id`, eligiendo remoto o local con contrato existente; retorno UI expone email/status, no nuevo ownerID. E4 no modifica ese límite ni promete seguridad adicional. |
| `src/App.tsx:134,140–157,175–198`; búsqueda `legacyWorkout` en App y campos de `RepbookCloudSnapshot` | Legacy es estado local separado, no parte del snapshot/export ni de la limpieza mostrada. No hay base para atribuirlo a cuenta por su presencia local; la búsqueda se limitó a esos contratos/consumidores, no a infraestructura real. |
| `src/components/AppFlows.test.tsx:1–35,97–113`; `src/components/AccessPanel.test.tsx:61–72` | Nombres reales de tests confirmados. El primero simula hook; el segundo pasa `profile:true` manualmente: por sí solos no ejercitan el booleano incorrecto. |

Reporte `/private/tmp/aunara-sdd006-e3-review.md`: **8/8** Chromium/WebKit × raíz/rollback × ES/EN a390; cuenta sintética, nombre/preferencias persistidos y onboarding incompleto; panel abierto mediante control real; `.privacy-summary li` vacío. `/private/tmp/aunara-sdd006-e3-independent/summary-probe.json` conserva discrepancia DOM. Captura `summary-webkit-root-es.png` es frame incidental de animación, no prueba de un defecto de recorte; no fundar aceptación visual en ella.

Soporte leído `/private/tmp/aunara-sdd006-e2-independent-extra-support.mjs:5–23`: contexto limpio sintético, usuario Auth sintético, remoto GET null, nombre `Synthetic athlete`, experiencia `intermediate` y días2 frente a defaults beginner/3. El hook sube la copia local del contexto sintético a ese usuario y el probe espera estado synced. Esto acredita el caso actual local→cuenta de prueba, no propiedad de legacy ni infraestructura real. El probe histórico añade `initialRoutineDecision='declined'`, fuera del enum del validador; la regresión nueva debe usar un snapshot válido, sin ese campo, y probar nombre/preferencias independientemente de él.

El defecto está en material E2 congelado, no en el arranque E3. No hubo comparación runtime con HEAD: no atribuir introducción/regresión a E2 o E3. PASS parciales309 Vitest/25+Node1,32 assets y matrices anteriores son antecedentes; no aceptación del futuro candidato E4. Auditoría E3 revisó41archivos/175hunks E2 +2E3 +12docs/27enlaces, pero rechazó la semántica del resumen.

Revalidación independiente acotada posterior, 2026-10-12 `[AUNARA/codex · modelo no expuesto]`: **8/8** con snapshot aceptado por el normalizador real, sin `initialRoutineDecision` inválido y sin legacyWorkout. GET/POST sintéticos ligados al mismo ID, bootstrap real synced y descarga de export real contienen nombre/preferencias/onboarding incompleto válidos; lista del resumen sigue vacía. La evidencia válida supera el fixture histórico para demostrar este defecto, sin borrar su antecedente. Recibo `/private/tmp/aunara-sdd006-e3-independent/summary-valid-probe.json`; addendum `/private/tmp/aunara-sdd006-e3-review-valid-summary-addendum.md`; captura asentada `summary-valid-webkit-root-es.png`. Main/test E3 sin cambios; no implementación del fix ni nuevas pruebas completas E4.

Precisión de fixtures del desarrollo, sin cambio de alcance: `cloudSnapshot.ts:179–182` exige1–3 objetivos si `goals` está presente; `goals:[]` no es un snapshot válido. Controles SDK/export/import usan `goals` omitido para vacío. La equivalencia de array vacío en la derivación propuesta se prueba solo como estado local representable, sin afirmar validez de snapshot ni modificar el validador. Rojo por fixture inválida se distingue del rojo que reproduce el defecto del resumen.

## 4. Diseño propuesto

1. Derivar el booleano solo del `cloudSnapshot` actual empleado por exportación, no de una inspección adicional de storage. El renderer y los gates de cuenta existentes permanecen. No esperar onboarding para reconocer información parcial.
2. `profile:true` si onboarding está completado **o** hay nombre significativo distinto del fallback real **o** preferencias no sensibles significativas respecto de defaults normalizados. Nombre vacío/solo espacios y fallback `Mi perfil` no acreditan información introducida; normalizar únicamente para comparar, sin modificar el nombre almacenado/exportado.
3. Comparación explícita y pequeña de campos de preferencias ya existentes: `primaryGoal`, `goals`, `sport`, `equipmentPreference`, `trainingDaysPerWeek`, `sessionMinutes`, `experience`. Usar defaults de App; campo opcional omitido equivale a default cuando corresponda; goals ausente/[] y sport ausente/null son vacíos equivalentes. Un array de goals no vacío explícito constituye una preferencia existente, incluso si coincide con el objetivo inicial. Valores numéricos y enums no se inventan ni convierten por coerción. El helper puede usar una proyección local normalizada; no `JSON.stringify` indiscriminado del healthProfile ni comparar orden de claves.
4. Información sensible, readiness/limitaciones, idioma de UI, IDs de ruta, `tracksInitialized`, decisión de propuesta y estado de consentimiento no son indicadores de perfil/preferencias en este fix. Salud permanece bajo su categoría y consentimiento actuales; no filtrar valores sensibles ni contarlos como nombre/preferencias.
5. Defaults completos o parciales equivalentes sin nombre/preferencia significativa y sin onboarding completado dan `profile:false`. No agregar siempre la categoría para toda sesión ni afirmar «perfil guardado» por existir el objeto en memoria. Un dato realmente guardado igual a todos los defaults, sin marcador, es indistinguible del estado inicial con el contrato vigente: no introducir metadata para resolverlo. El criterio se define sobre contenido significativo del snapshot, no sobre historia de escritura imposible de reconstruir aquí.
6. Mantener rutas/favoritos/check-ins/salud y sus conteos sin cambios. Mostrar la categoría de perfil una vez; conservar etiquetas ES/EN existentes, estado local/nube y autorización, sin afirmar que cada dato está confirmado remotamente por el resumen.
7. El resumen no cambia estado ni asigna propiedad nueva. Salida/cambio de usuario mantiene controles actuales; verificar deliberadamente que no aparece categoría de A en contexto vacío de B ni información de invitado en cuenta no autorizada. Si revela un defecto previo del contrato de identidad que no puede resolverse dentro de estos tres archivos sin nuevos datos/gates, reportar REJECTED y volver al Operator, no arreglar hooks/backend por inferencia.

No se propone categoría legacy «en este dispositivo», conteo nuevo ni pregunta de producto adicional en esta E4. Esa capacidad, si se solicita en el futuro, necesita evidencia propia de dueño/alcance/exportación y una especificación distinta.

## 5. Alternativas descartadas

- Mantener onboarding como prueba de existencia: reproduce el defecto confirmado.
- `profile:true` para cualquier email u objeto healthProfile: falsos positivos con valores iniciales/vacíos.
- Leer keys o guardar flag/timestamp para detectar escritura: nuevo contrato de persistencia fuera de alcance; no necesario para el caso confirmado.
- Comparar healthProfile entero: campos sensibles/consentimiento/defaults opcionales producirían categorías incorrectas.
- Contar legacy como ruta propia o migrarlo/exportarlo: no pertenece al contrato actual ni tiene dueño acreditado.
- Aprovechar para corregir sync, validadores, enums del harness histórico, salud/nutrición o onboarding: son frentes separados; usar una fixture válida no autoriza cambiarlos.

## 6. Riesgos sobre lo que hoy funciona

Defaults omitidos pueden parecer datos: normalización explícita y negativos por cada campo. Prefill puede confundirse con intención de usuario: no leer historia ni prometer guardado remoto, delimitar contenido significativo. Datos sensibles podrían activar perfil: proyección exclusiva de preferencias no sensibles y consentimiento sin cambios. Identidad/estado transitorio podría filtrar datos: pruebas de cuenta vacía, invitado, salida/cambio y bootstrap; cualquier necesidad de contrato nuevo vuelve al gate. App compartido contiene muchos hunks aprobados: diff mínimo, manifest E4 separado, hashes E3/NO-TOCAR y auditoría fresca; no refactor.

## 7. Verificación: criterios falsables y matriz

| ID | Criterio obligatorio |
| --- | --- |
| RG-01 | Snapshot válido del contexto sintético actual con onboarding false/omitido, nombre no default o preferencias significativas, sin rutas/favoritos/check-ins: muestra exactamente una categoría Perfil y preferencias; el caso rojo falla en E3 congelado y verde pasa con E4. No depender de `initialRoutineDecision='declined'`. |
| RG-02 | Defaults iniciales, objeto equivalente con opcionales omitidos, nombre vacío/espacios/fallback y colecciones vacías, onboarding false/omitido: no muestra perfil. Idioma, consentimiento o marcadores de rutas solos no producen falso positivo. |
| RG-03 | Perfil completado conserva categoría; nombre parcial solo y cada preferencia significativa por separado la producen. Versiones legacy válidas y defaults omitidos no se reescriben. |
| RG-04 | Rutas0/n, favoritos0/n, check-ins0/n y salud con granted/declined/revoked/null mantienen resultados previos; salud no autorizada no aparece. Legacy local no atribuido no introduce categoría/conteo de cuenta. |
| RG-05 | Invitado no ve centro privado; salida y cambio A→B con snapshot B vacío no filtran categorías/valores de A. Prueba SDK/hook real sintética, no solo mock email. Gating y handlers previos intactos. |
| RG-06 | Abrir/cerrar, idioma, render/re-render y recarga del resumen no modifican datos: snapshot/export antes/después iguales salvo timestamp de export; sin setters nuevos, escrituras/migraciones/borrados/solicitudes adicionales originadas por el resumen. Sync existente se distingue de nuevas solicitudes. |
| RG-07 | Delta E4 dentro de allowlist; main/test E3 idénticos y resto de hunks anteriores conservados. Manifest registra única sustitución autorizada y tests aditivos; canónico/índice/NO-TOCAR íntegros. |
| RG-08 | Todos CA/CL/AR técnicos aplicables y matrices pendientes E2/E3 completos en candidato final, revisión independiente APPROVED y auditoría documental/manifest fresca antes de entrega/commit. Ningún PASS parcial se hereda como aceptación. |

| Nivel | Matriz requerida después de aprobación |
| --- | --- |
| Automatizados | Tipos, suite completa (baseline E3 309/25+Node1; registrar adiciones exactas y explicar cualquier diferencia), directorio check/test, guards Pages/worker, builds raíz/rollback y diff-check. Lint N/A por script ausente. No instalar ni modificar configuración. |
| Derivación/renderer | Tests RED→GREEN sobre E3/derivación corregida: parcial por nombre, preferencias individualmente, completado, vacío/defaults normalizados, arrays opcionales, salud/consentimiento sin falso positivo. AccessPanel con booleano ausente/false/true mantiene contrato opcional/etiquetas; pruebas de App ejercen el paso real de props. |
| UI compilada | Chromium/WebKit × ES/EN × `/`/`/aunara/` ×1440/390/320; nombre parcial, preferencias parciales sin nombre significativo, completado y vacío. Cuenta/privacidad via control real, DOM y capturas asentadas, teclado/cierre/foco/idioma/reload sin overflow. Inspeccionar capturas, no frame de animación incidental. |
| Categorías y privacidad | Matriz rutas legacy-local solo/sin legacy/tracks solo/ambos sin inventar propietario, favoritos/check-ins0/n, consentimientos granted/declined/revoked/null; confirmar categorías previas y ausencia de datos sensibles/secretos. Contextos sintéticos independientes, invitado, salida, A→B/B vacío; bootstrap0/200ms y export vigente. |
| Preservación de datos | Snapshot/export reales sintéticos antes/después de abrir/cerrar/cambiar idioma/reload; IDs, notas, historial, primaryGoal, preferencias y legacy sin auto-reescritura. No ampliar export ni tocar storage como solución. |
| Negativos del fix | Restaurar condición exclusiva onboarding ⇒ RG-01 rojo; forzar profile:true ⇒ RG-02 rojo; incluir salud/idioma como preferencia ⇒ negativo rojo; romper guard invitado ⇒ rojo de privacidad. Copia disposable, una mutación por vez, restauración y positivo verde con hashes documentados; nunca mutar candidato vivo/canónico. |
| Pendientes E2/E3 completos | Todo §7 de E2/E3 sigue obligatorio: Auth SDK0/200ms pre/postmount, refresh/session reload/user-switch; nueve consumidores de stored-state; perfil/objetivos/deporte/wellness y borrado con idioma; biblioteca completa; negativos UI compilados shared-targets/guest-private/float-overlap y negativos E3 captura/clasificación/recarga/duplicación/frontera estática. Repetir checks afectados sobre hash final, sin usar un run focal para cerrar matriz amplia. |
| Arranque/assets/auditoría | AR-01–08 y CL-01–09 vigentes; E3 bloqueado get-only y controles restantes conservados; builds/guard/inventario transitivo y worker en ambas bases.32 assets es recibo anterior, no constante nueva: medir delta generado atribuible al fix, preservar27 estáticos/CSS y guard vigente sin ampliar categorías. Auditoría semántica de41/175 E2 +2E3 +delta E4, docs seleccionados/enlaces/provenance/NO-TOCAR. |

Tráfico externo bloqueado antes de navegar, datos/Auth totalmente sintéticos, sin cuentas/correos/backend reales ni copia de entornos privados. WebKit ausente o matriz incompleta ⇒ REJECTED. Un problema de harness se diagnostica sin cambiar producto, SDK, sistema o tiempos para ocultar un rojo.

## 8. Plan de entrega

1. Gate de especificación completado: D-E4-1 aprobada el 2026-10-12. Preparación histórica solo documental; fase de desarrollo aislado autorizada, no aceptación técnica.
2. Tras aprobar, desarrollo acotado en nuevo candidato aislado derivado de E3 congelado; registrar hashes/manifest E4 y preservar el canónico. Crear tests falsables y delta mínimo, sin ampliar archivos por fallos encontrados.
3. Revisión independiente por agente distinto, con toda matriz E2/E3/E4 y auditoría; no solo ocho casos del resumen. El primer ciclo E3 terminó REJECTED: este arreglo y revisión serían el siguiente ciclo dentro de los **dos restantes** del máximo tres aprobado en D-E3-4. No se reinicia el contador ni se solicita continuidad ilimitada. Nuevo alcance o rechazo persistente devuelve decisión al Operator.
4. Solo tras APPROVED completo, delivery verifica árbol/manifest/hash final, documentación propia y prepara único commit local integrado E2+E3+E4. No stage canónico durante spec ni absorber dirty ajeno. Las excepciones E2 técnico/global y E3 CL-07 permanecen exactamente como aprobadas.
5. Reportar SHA/base/ubicación/manifest/checks/NO-TOCAR y pendientes. UAT real y cierre del Operator separados; sin push/publicación implícitos. Esta enmienda es documentación interna SOT, no entrega cliente ni documento Word.

## 9. Decisiones que necesita el Operator

- **D-E4-1 aprobada 2026-10-12:** fix mínimo del indicador de perfil/preferencias parciales derivado del snapshot actual (§4), con allowlist exacta de App y dos tests, NO-TOCAR y revisión completa dentro del límite ya aprobado. No autoriza datos/ownership/exportación nuevos ni cambio de producto legacy.
- Supuesto explícito: «perfil/preferencias existentes» se reconoce por onboarding completado o contenido significativo de nombre/preferencias, no por tener un objeto inicial ni por historia de escritura desconocida. Un dato idéntico a todos los defaults y sin marcador no puede distinguirse de un estado inicial; no se implementa metadata para hacerlo.
- Preguntas adicionales no necesarias para este defecto: ninguna. Legacy/infra/UAT futura no se convierten en decisiones urgentes de esta E4. Un hallazgo nuevo que haga imposible esta frontera se reportará con evidencia y volverá al gate antes de modificarla.

## 10. Definición de terminado

**Spec actual:** aprobada el 2026-10-12. Preparación histórica únicamente documental; desarrollo aislado autorizado, sin aprobación técnica aún. Main actualiza las demás superficies. Sin commit/push/publicación mientras falte revisión completa APPROVED.

**Entrega técnica futura:** D-E4-1 aprobada explícitamente; RG-01–08 y CA/CL/AR aplicables completos con evidencia fresca sobre candidato final, red→green efectivos, revisión independiente APPROVED, documentación/manifest/commit local coherentes y NO-TOCAR preservado. Listar correctamente un perfil parcial no compensa las matrices E2/E3 pendientes ni cierra por sí solo el conjunto.

**Producto/global:** el Operator cierra después de UAT/cuentas/correo/sync/borrado/entrenamiento reales, Safari/iPhone/Android/PWA/teclado físicos, responsable/editorial/metodología y demás gates originales. Entrega técnica local no los acredita ni autoriza publicación.

### Recibo independiente del ciclo 2 — 2026-10-12 · mitad Chromium

`[AUNARA/claude · modelo no expuesto]` — Revisión conjunta E2+E3+E4 sobre `wip/sdd006-e4-candidate-2026-10-12` (`6704681`, base `1c709a3`), control E2 `19dcb4f`, revisor distinto del constructor, sin acceso a `/private/tmp`. Chromium completo con Supabase sintético y tráfico externo bloqueado: RG-01 rojo→verde (tests E4 sobre `App.tsx` de E3: 19 fallan/110 pasan; sobre E4: 129/129), RG-01…06 en UI compilada 84/84 (`/`,`/aunara/` × ES/EN), RG-07 delta exacto App + dos tests + docs, AR-01 12/12 y AR-02 192/192 contra control E2 (blank 12/12 en get-only), AR-03/04/05 84/84, AR-06 exacto, AR-07 32 assets/allowlist 32 con 27 estáticos + CSS idénticos al control, Auth 0/200 ms + negativos 42/42, E1 round-trip + CA06-06 + footer 52/52, menú/inventario/modal/standalone/aviso/legal/slogan 156/156, negativos red→green 6/6 (guest-private, float-overlap, e3-static-import, e3-classification, e3-duplicate-root, shared-targets) con controles verdes y worktree restaurado, guard CLI N1–N5 rechazados, suite 348/25 + Node 1 + typecheck. Cinco ajustes de harness documentados; **cero cambios de producto**.

Veredicto: **NO CONCLUYENTE**. §7 exige WebKit y este entorno solo tiene Chromium; no se declara REJECTED por una limitación del entorno ni APPROVED sin la mitad obligatoria. El ciclo 2 sigue abierto y no se consume. Recibo, harness reproducible (`BROWSER=webkit`) y resultados en [`2026-10-12-sdd006-ciclo2-revision/`](2026-10-12-sdd006-ciclo2-revision/RECIBO.md). Hallazgo H-01 (`useCloudSync` queda en `syncing` si el snapshot vuelve al último guardado dentro del debounce; idéntico en `main`) fuera de allowlist, no bloqueante, a PENDIENTES. Sin stage, commit de código, push ni publicación.
