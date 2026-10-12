# SDD-006 — Acceso, navegación y creación de rutinas

2026-10-10 · Estado: **Implementado en candidato aislado; revisión conjunta E3 REJECTED por resumen de perfil parcial** · v1 + E1 + E2 + E3; E4 propuesta pendiente
Origen: [Aunara/Codex · modelo no expuesto en este agente]
Orden: entrega 1 de [006–009](SDD-006-009-plan-entregas.md). El Operator aprobó alcance y slogan EN con «Dale. Arrancá.» el 2026-10-10. No autoriza publicación ni las entregas siguientes.

## 1. El problema, en el idioma del Operator

Estado actualizado2026-10-12 `[AUNARA/codex · modelo no expuesto]`: E3 protegió el arranque con conducta aprobada y verificaciones parciales; revisión conjunta rechazada por CA06-03 que omite nombre/preferencias parciales guardados. Repro válido8/8 con bootstrap/export sintéticos y sin legacy. [E4](SDD-006-enmienda-4-resumen-datos-guardados.md) propone solo App y dos tests, requiere aprobación antes de implementar. Recibos anteriores siguientes son historia; no se afirma aceptación global ni commit/publicación. Matrices/negativos restantes y UAT real pendientes; dos ciclos restantes del límite aprobado.

Actualización2026-10-11 `[AUNARA/codex · modelo no expuesto]`: [Enmienda 2](SDD-006-enmienda-2-consolidacion-local.md) aprobada construyó candidato aislado; revisión fresca **REJECTED** por CL-07, lectura top-level del SDK falla antes de React si getItem está denegado y set/remove permitidos. No cambia fuente ni corrige fuera de alcance. PASS anteriores quedan históricos, no aceptación de este candidato; matrices restantes incompletas. Sin commit/push/publicación. Conteo canónico fresco298/24+Node1;302/25 anterior incluía4tests de copia ignorada. Ver recibo completo E2; nueva frontera requiere decisión del Operator.

Al ingresar, la persona debe encontrar sus rutas y la siguiente acción, no abrir automáticamente su perfil. La navegación, privacidad e instalación deben ser claras. Al construir una rutina, necesita elegir un día, sus ejercicios y la prescripción particular de cada uno, y combinar estructuras dentro del mismo día sin perder su trabajo anterior.

Resultado: acceso a inicio/rutas, un menú consistente y accesible, privacidad comprensible, instalación contextual y creación manual progresiva. Integrar las correcciones locales previas sin rehacerlas ni afirmar que están publicadas.

## 2. Alcance y fuera de alcance

Entra: destino tras login; menú público/privado compartido entre logo y hamburguesa; separación cuenta/nube vs perfil; resumen de datos; modal de borrado permanente; instalación según contexto; slogan; ajuste móvil de badge de sesiones planeadas y botón flotante; flujo manual por día; prescripción independiente por miembro; presentación bilingüe y pruebas de compatibilidad.

Allowlist exacta para implementación, **solo después de aprobación**:

- `src/App.tsx`, `src/styles.css`, `src/types.ts`.
- `src/components/AccessPanel.tsx`, `src/components/AccessPanel.test.tsx`, `src/components/AppFlows.test.tsx`, `src/components/GuestApp.test.tsx`.
- `src/components/WorkoutPanel.tsx`, `src/components/ExerciseAssignmentDialog.tsx`, `src/components/TrainingTracks.tsx`.
- `src/components/ProfilePanel.tsx`, `src/components/ProfilePanel.test.tsx`, `src/components/OnboardingPanel.tsx`, `src/components/OnboardingPanel.test.tsx`, `src/components/OnboardingApp.test.tsx`.
- `src/components/InitialRoutineProposal.tsx`, `src/components/InitialRoutineProposal.test.tsx`, `src/components/ExerciseDetail.tsx`, `src/components/ExerciseCard.tsx`.
- `src/lib/workoutPrescription.ts`, `src/lib/workoutPrescription.test.ts`, `src/lib/exercises.ts`, `src/lib/exercises.test.ts`, `src/lib/cloudSnapshot.ts`, `src/lib/cloudSnapshot.test.ts`, `src/lib/install.ts`, `src/lib/install.test.ts`, `src/lib/i18n.ts`.
- `public/data/exercise-directory/name-overrides.es.json`, `public/data/exercise-directory/taxonomy.es.json`, `public/data/exercise-directory/en-es.json`: solamente correcciones bilingües revisadas/regeneración, no medios.
- Nuevos tests acotados: `src/components/WorkoutPanel.test.tsx`, `src/components/ExerciseAssignmentDialog.test.tsx`, `src/components/NavigationMenu.test.tsx`. Nuevo componente opcional `src/components/NavigationMenu.tsx` si el diseño aprobado lo requiere.
- Documentación propia al entregar: este SDD, `AUNARA_SOT/02-ESTADO-ACTUAL.md`, `AUNARA_SOT/PENDIENTES.md`, `AUNARA_SOT/03-HISTORIA-Y-BACKLOG.md`, `docs/product/2026-08-25-feedback-work-plan.md`, `docs/product/README.md`; solo estado y decisiones de este delta, sin cerrar gates ajenos.

Todo archivo no listado requiere enmienda. La allowlist no autoriza refactors ni reemplaza el recibo de aislamiento del dirty previo.

**NO-TOCAR:** `src/hooks/useCloudSync.ts`, `src/hooks/useStoredState.ts`, `src/lib/supabaseClient.ts`, `src/lib/cloudStore.ts` y sus tests; `supabase/`, `.env*`, workflows, `scripts/check-pages-client*`, dependencias/configuración; DNS, Auth settings, SMTP, correos/cuentas reales y producción. Preservar byte a byte activos `public/brand/`, fuente del dataset, referencias inmutables y matrices clínicas congeladas. No cambiar permisos/backend/export/revocación/borrado para resolver un defecto visual. No introducir checker servidor de existencia de correo ni enumeración. No fatiga automática, HealthKit/Health Connect, sesiones por serie, nutrición nueva ni entrenador aquí.

## 3. Estado real de partida, medido y no supuesto

Lectura local 2026-10-10, HEAD `1c709a3f6d09b940a01e39eb55a2a49b74de712f`; numerosos archivos modificados y SDD-002/003/004 locales no versionados. La frontera publicada informada es `dfffa87` documental + `1c709a3` dominio/E2; no se ejecutó una nueva inspección de producción en esta especificación. Existencia local ≠ revisión aprobada ≠ publicación verificada.

| Evidencia local | Consecuencia |
| --- | --- |
| `src/App.tsx:110` inicializa home; `:209–217` conserva gates; `:1023–1025` abre perfil desde «Corregir mis datos» | Apertura postlogin es síntoma reportado por Operator, causa pendiente de reproducción; ese callback de corrección no demuestra la causa y debe conservarse. |
| `src/App.tsx:630` logo dirige home; `:637–650` cuenta, perfil y secciones separados | Logo/hamburguesa deben abrir el mismo menú, no destinos distintos. |
| `src/components/AccessPanel.tsx:440–480` acciones de privacidad y confirmación permanente inline | Agregar resumen y mover confirmación a modal sin debilitar condición DELETE/ELIMINAR. |
| `src/App.tsx:121–126`, `:233–239`; `src/lib/install.ts:3–11` detectan modo instalado y guía | Presentación debe ocultarse en standalone y no presumir prompt disponible. |
| `src/types.ts:31–46`, `:80–110` soportan ítem/grupo y targets reps/fallo técnico/tiempo | Reutilizar prescripción existente; validar cada miembro, no imponer un target al grupo. |
| `src/App.tsx:417`, `src/components/WorkoutPanel.tsx:704` pasan una prescripción común al crear grupo | Brecha concreta: creación con targets independientes, no una nueva metodología. |
| `src/components/WorkoutPanel.tsx:141`, `:172–175`, `:459` muestran día activo/nota legacy | Integrar estas correcciones locales; no duplicar editores ni borrar nota/historia. |
| `docs/architecture/0001-bilingual-exercise-directory.md:9–20`, `:36` | IDs estables e índice bilingüe existen; nombres pending no equivalen a traducción terminada. |
| `src/lib/cloudSnapshot.ts:10–20` snapshot v1 y `AUNARA_SOT/sdd/SDD-004-uat-perfil-y-rutinas.md` | Conservar compatibilidad y gates pendientes; no volver a ejecutar migración implícita. |

La lectura de `src/App.tsx` y búsqueda `setProfileOpen`, `setAppSection`, `install`, `brand` sustentan el alcance de navegación; no se afirma ausencia global de otras capacidades. No se corrieron pruebas de producto en esta fase documental.

## 4. Diseño

### Acceso y navegación

Después de login con perfil completo: cerrar panel de acceso, mantener perfil cerrado, mostrar inicio/rutas. Reproducir primero el síntoma con consentimiento/onboarding completos y recuperación normal/rápida; no atribuirlo al callback «Corregir mis datos», que legítimamente abre el perfil y debe seguir haciéndolo. Usuarios nuevos conservan consentimiento/onboarding requeridos, sin crear un perfil ficticio ni evadir sus gates. Si la causa está en un hook excluido, volver al gate, no ampliar scope tácitamente.

Logo y hamburguesa son dos disparadores del **mismo** menú y estado. Cada uno tiene nombre accesible, `aria-expanded` y vínculo al mismo contenedor. Enter/Space abren; Escape cierra; foco regresa al disparador usado; no queda foco detrás de un overlay. Seleccionar destino cierra menú. No usar semántica ARIA de application-menu si se implementa una navegación estándar.

Público: inicio, ingreso/crear cuenta, idioma/configuración y ayuda/instalación cuando aplique. Privado: inicio/rutas, biblioteca, perfil, cuenta/privacidad, configuración/idioma, ayuda/instalación cuando aplique y salir. Destinos privados no aparecen para invitado ni se habilitan por manipular la UI. Nube/cuenta sigue mostrando estado de sincronización y acceso; perfil sigue siendo el contexto personal editable. Cerrar sesión conserva el aislamiento y limpieza ya implementados.

### Privacidad e instalación

Resumen anterior a acciones: categorías realmente guardadas (perfil/preferencias, rutas y prescripciones, favoritos, registros/check-ins y salud solo cuando exista/esté autorizada), alcance local/nube y estado de autorización. No mostrar datos ajenos, secretos ni valores sensibles innecesarios. Exportar/corregir/revocar reutilizan handlers existentes. Diferenciar eliminar datos de eliminar cuenta.

«Eliminar cuenta permanentemente» es acción secundaria explícita que abre un modal. Explica efectos reales y conserva palabra exacta DELETE/ELIMINAR, botón deshabilitado hasta confirmarla y handler/backend actuales. Cancelar/Escape no llama borrado; abrir de nuevo reinicia confirmación; cambio de idioma reinicia entrada para impedir confirmación residual. Mantener foco/scroll y prevenir doble envío según estado real del handler, sin inventar garantía del proveedor.

Instalación solo en navegador, oculta en standalone. Con prompt soportado, acción lo invoca; cancelación no se trata como instalación. Sin prompt, instrucciones adaptadas al dispositivo/navegador y alternativa manual honesta. En iOS no prometer instalación automática. En contexto desconocido ofrecer guía sin afirmar soporte. No afirmar capacidad offline total.

### Presentación e integración local

Slogan español elegido: **«Tu propósito marca el camino.»**. Versión inglesa aprobada: «Your purpose leads the way.» (Operator, 2026-10-10). Sustituir únicamente ocurrencias del slogan de producto en superficies aprobadas; no alterar lockups/archivos de marca.

Mobile: badge de sesiones planeadas alineado con su tarjeta, sin recortar texto ni superponerse. Botón flotante de rutas no tapa acciones, tarjetas o campos al final del scroll, con teclado abierto ni safe-area. Mantener escritorio y medir a 320/390/1440px.

Preservar e integrar SDD-002/003/004 locales: footer centrado con crédito horizontal ES/EN; etiqueta de consentimiento vinculada; confirmación por enlace solamente; objetivos generales 1–3; deporte separado/Ninguno; preferencias editables; propuesta por día; sin «Set plan» redundante; «Agregar ruta»/«Add route». No rehacer ni marcar cerradas UAT Auth/correo pendientes. Regresión de recuperación rápida E2 es prueba obligatoria, no se toca hook excluido: si falla, bloquear revisión y abrir enmienda mínima.

### Rutina y prescripción por miembro

Orden: **día → ejercicio(s) → prescripción de cada ejercicio → estructura local → técnica cuando aplique**. Nombre del día visible. Monoserie, biserie, triserie y circuito coexisten en un día; estructuras no configuran globalmente ruta/día. Elegir estructura valida su cardinalidad; no borra ejercicios ni prescripciones al volver atrás. Movimiento/eliminación de grupo conserva confirmaciones, miembros restantes, IDs e historia; otro día no cambia.

Cada miembro tiene target propio (repeticiones fijas, fallo técnico, tiempo u otros ya soportados), número de series/rondas y controles pertinentes. Primero adaptar `WorkoutItem`/`SpecialWorkoutPrescription`; ningún target «fallo» obligatorio ni consejo clínico nuevo. Si no puede expresarse con contrato actual, detener y proponer extensión aditiva revisada antes de programar, no texto libre que el ejecutor deba adivinar.

Caso contractual confirmado por el Operator el 2026-10-10: triserie con press inclinado con barra a **8 repeticiones**, flexiones a fallo técnico y escalador a **20 repeticiones por lado**. Tres IDs y targets independientes; no convertir las tres a fallo ni copiar las 20 al press. No convertir «20 por lado» en «20 totales» ni inventar descanso/carga/rondas. El conteo por lado debe conservarse explícitamente; ver enmienda propuesta al final. Una nota libre no se interpreta como unidad por el ejecutor.

Datos: snapshots antiguos abren sin auto-reescritura, `primaryGoal`/notas/historia permanecen, `setPlan` legacy ambiguo queda nota original. Exportación/round-trip conserva datos nuevos; validador rechaza incoherencias sin destruir el original. Cualquier cambio de versión/transporte/servidor vuelve al gate.

Biblioteca/editor/detalle: nombres, músculos, equipo e instrucciones en ES/EN mediante directorio y fuente correspondientes, IDs inmutables para futuras animaciones. Pendientes editoriales llevan estado visible y lista de revisión; no llamar «ES completo» a fallback inglés. Completar nombres exige lote editorial revisado; no traducción masiva no aprobada ni traducción destructiva del dataset.

## 5. Alternativas descartadas

Abrir perfil automáticamente; logo a home y hamburguesa a otro menú; nube como sustituto del perfil; borrado permanente inline prominente; instalación idéntica para todos; estructura global/prescripción compartida obligatoria; parsear notas legacy; generación clínica nueva sin Danny; checker de cuentas; rehacer el dirty previo. Todas contradicen alcance, consentimiento o preservación.

## 6. Riesgo sobre lo que hoy funciona

- Archivos compartidos sucios: recibo inicial con HEAD, status, diff/hashes por archivo y atribución a SDD previo; comparar delta nuevo contra frontera, no absorber todo el archivo. Imposibilidad de aislar detiene entrega.
- Navegación/gates: tests invitado, login, onboarding incompleto, recuperación rápida, logout y cambio de cuenta; nunca sustituir validación backend por ocultamiento.
- Contrato/historia: fixtures legacy y nuevos, lectura/export/recarga, miembros de varios grupos/días; cambios aditivos, sin reset de datos.
- CSS/foco: selectores acotados, Chromium/WebKit, teclado y estados de modal/scroll. NO cambios globales oportunistas.
- Traducción/metodología: separar corrección editorial de regla clínica; pendientes no son aprobación. Matriz Danny permanece congelada.

## 7. Verificación

| ID | Criterio falsable |
| --- | --- |
| CA06-01 | Login simulado con perfil completo termina en inicio/rutas, perfil cerrado; incompleto conserva gates, sin alta automática. Recuperación rápida y normal regresan correctamente en ambos motores. |
| CA06-02 | Logo/hamburguesa abren mismo menú; inventario público/privado correcto; teclado, Escape, selección y retorno de foco operan; invitado no accede a datos privados. |
| CA06-03 | Cuenta/nube y perfil tienen destinos distintos; resumen enumera solo categorías propias guardadas antes de export/corregir/revocar; logout/cambio de usuario no filtra datos. |
| CA06-04 | Borrado permanente requiere abrir modal y palabra exacta; cancelar/Escape/entrada errónea/cambio de idioma/reabrir nunca ejecutan handler; confirmación válida usa handler intacto. |
| CA06-05 | Standalone no presenta sección de instalar; prompt disponible se usa; cancelación/ausencia produce guía adaptada sin afirmar éxito ni instalación automática iOS. |
| CA06-06 | ES muestra slogan exacto; EN solo versión aprobada. Badge y flotante no obstruyen/recortan controles a 320/390/1440px, scroll completo y teclado; footer/crédito mantienen geometría local aprobada. |
| CA06-07 | Día→ejercicios→targets propios→estructura→técnica; mono/bi/tri/circuito coexisten; grupo incompleto/target inválido no guarda; otro día/grupo queda idéntico. |
| CA06-08 | Fixture triserie conserva press8, flexiones a fallo técnico, escalador20 por lado; recarga/edición/export conserva tres targets independientes y la convención de conteo sin recomendar fallo. |
| CA06-09 | Perfil/objetivos/deporte, propuesta por día, etiqueta de consentimiento, enlace de confirmación y editor único previos no regresan; no se cierra ninguna UAT pendiente por mocks. |
| CA06-10 | Fixtures legacy/nuevos preservan IDs, notas libres, `primaryGoal`, `loadHistory`; cambiar modo conserva secuencia; snapshot inválido no destruye estado válido. |
| CA06-11 | Nombres/músculos/equipo/instrucciones usan idioma elegido y IDs intactos; pendientes se identifican y bloquean declaración de cobertura completa; búsqueda/filtros/favoritos/detalle no regresan. |
| CA06-12 | Diff respeta allowlist/NO-TOCAR y frontera previa; cero cuentas/correos/SMTP/DNS reales, código OpenGym o nuevas reglas clínicas. |

Matriz obligatoria del revisor independiente:

| Nivel | Evidencia requerida |
| --- | --- |
| Tipos/tests/build | `npm run typecheck`, `npm test`, `npm run check:exercise-directory`, `npm run test:exercise-directory`, `npm run build`; build raíz y `/aunara/` + guard de artifact/negativos conforme runbook. |
| Lint | `package.json` no tiene script; registrar no aplicable, no inventar PASS ni instalar herramienta. |
| UI real local | Chromium **y WebKit**, ES/EN, desktop 1440 y móvil 390 + extremos 320; raíz y rollback `/aunara/`; público/login simulado/onboarding/menú/privacidad/instalación/biblioteca/editor, teclado y scroll. |
| Datos | Round-trip antiguo/nuevo, grupo mixto/two days, revocación y usuarios aislados con fixtures; no mutaciones sobre cuenta real. |
| Negativos | Forzar menú privado invitado, borrado sin palabra, guía standalone, target compartido, grupo incompleto, pérdida de nota/history y cuarto objetivo: cada guarda rojo al romper y verde al restaurar. |
| UAT real separada | Operator autoriza cuenta descartable/correo/sync/borrado reales y Safari iPhone/Chrome Android; registrar build/plataforma/fecha/resultado. Mock no demuestra envío ni eliminación backend. |

WebKit no disponible o regresión E2 ⇒ bloqueo, no «verificado». No debilitar pruebas. Ronda real autorizada y simulación son evidencias separadas.

## 8. Plan de entrega

1. Aprobar SDD y decisiones §9 explícitamente; recibo de aislamiento actualizado antes de código.
2. Desarrollo acotado con ownership único para App/styles/types. Integración local previa primero, delta de navegación/editor después; no frentes concurrentes sobre mismos archivos.
3. Revisor no desarrollador comprueba CA/matriz/NO-TOCAR; máximo 3 ciclos desarrollo→revisión. Rechazo persistente vuelve al Operator.
4. Tras APPROVED, entrega actualiza documentación propia, staged solo delta revisado y commit **local** enfocado. Sin aislamiento seguro, no commit de archivos completos sucios.
5. Operator UAT/cierre; push/publicación por permiso separado. No retirar rollback ni modificar producción desde este SDD.

## 9. Decisiones que necesita el Operator

- Resuelto: alcance/allowlist/NO-TOCAR, menú y destino postlogin aprobados el 2026-10-10. La aprobación no incluye publicación ni backend.
- Resuelto: inglés del slogan aprobado. Pendiente: alcance editorial/lote ES/EN y aprobador técnico de términos; no declarar catálogo traducido completamente.
- Resuelto por el Operator: press8 y escalador20 por lado; estructura/rondas/descansos siguen elegidos por persona, no recomendación.
- Validar adaptación de contrato existente para target por miembro; si precisa extensión mayor, rebaseline antes de implementar.
- Autorizar por separado UAT de cuentas/correos reales y posterior publicación. Danny/metodología y correo de marca siguen pendientes externos.

## 10. Definición de terminado

Implementación local con PASS técnico acotado independiente; falta aislamiento de entrega y cierre global. Producto termina con CA aplicables verdes, matriz completa, revisión independiente APPROVED, delta aislado, documentación y commit local, UAT/cierre del Operator. Dependencia no resuelta se separa formalmente con aprobación, nunca PASS implícito. Nada se pushea, despliega ni altera en Auth/mail por este desarrollo.

### Recibo de inicio · 2026-10-10

`[AUNARA/codex · GPT-5]` — Base HEAD `1c709a3f6d09b940a01e39eb55a2a49b74de712f`; index vacío y dirty previo preservado. Copia local y hashes de la frontera en `/private/tmp/aunara-sdd006-VdRTV4/receipt.json`, sin referencias personales ni entornos. Los cambios nuevos se comparan contra esa frontera, no contra HEAD solamente. Fixture resuelto durante desarrollo (press8/escalador20 por lado); lote editorial pendiente. No hay permiso para SMTP, cuentas reales, backend, push ni deploy.

### Recibo de revisión CI3 · 2026-10-10

`[AUNARA/codex · GPT-5]` — **REJECTED** independiente: CA06-06 falla porque el acceso flotante tapa la tarjeta inicial en móvil. Reproducido en viewport real, no captura de página completa: 390×900, scrollY0, botón y832–884 y tarjeta y828–1039; a320 también se intersectan. Chromium y WebKit coinciden. Evidencia local: `/private/tmp/aunara-sdd006-ci3-float.json` y capturas `aunara-sdd006-ci3-float-{chromium,webkit}-390-start.png`. Los tres ciclos permitidos se agotaron; no realizar un cuarto ajuste sin decisión explícita del Operator ni debilitar el criterio.

Verificaciones particulares PASS: 293 pruebas Vitest/25 archivos + Node1; typecheck; directorio Node4; UI24/24 y recuperación inmediata compilada24/24 (Chromium/WebKit, ES/EN, raíz/rollback, 1440/390/320); ingreso/salida normal4/4; instalación/standalone/cancelación20/20; builds raíz y `/aunara/`, allowlist31 por build y guardas negativas20/20; diff-check. Lint N/A (sin script). Auth/HTTP sintéticos no prueban backend/correo real. CA06-08 sigue bloqueado por Enmienda1 pendiente: no se guardó «20 por lado» como «20 totales». Round-trip/export mixto completo, aislamiento construible contra HEAD, teclado físico y dispositivos reales no verificados.

Delta nuevo: 15 archivos fuente/test y cinco documentos respecto del recibo inicial; NO-TOCAR preservado byte a byte. Cambios anteriores no absorbidos. Sin staging, commit, push, publicación, cuentas reales, correo ni infraestructura. SDD-007–009 no iniciados. Próximo gate: autorizar corrección puntual del flotante y nueva revisión, y resolver Enmienda1 antes de cerrar CA06-08.

### Enmienda 1 — conteo de repeticiones · 2026-10-10

Estado: **Aprobada por el Operator el 2026-10-10**, con «Sí» a la solicitud conjunta de conteo y corrección del flotante.

### Autorización de continuidad puntual · 2026-10-10

`[AUNARA/codex · modelo no expuesto]` — El Operator autoriza una iteración adicional después de CI3, limitada a corregir la superposición del acceso móvil y aplicar Enmienda1 (conteo total/por lado). No reinicia un ciclo ilimitado ni autoriza nuevos cambios de producto. Desarrollo por integrador único, nueva revisión independiente de ambos ajustes y regresiones; preservar frontera original y cambios locales previos. Si persiste rechazo, volver al Operator. Sin publicación, push, backend ni cuentas/correos reales. Aislamiento para commit y round-trip/export se verifican antes de entregar; no absorber dirty previo.

### Recibo final técnico de continuidad + E1 · 2026-10-10

`[AUNARA/codex · modelo no expuesto]` — **PASS técnico acotado** independiente sobre árbol local cerrado, sin defectos reproducibles restantes en los escenarios verificados. CI3 queda superado únicamente para CA06-06; Enmienda1 satisface CA06-08. Conteo opcional total/per-side por ítem y bloque, selector ES/EN y etiquetas explícitas en vista/entrenamiento/propuesta; legacy sin campo no se reescribe. El acceso móvil ocupa su propio espacio al final del flujo y ya no se superpone a tarjetas ni controles. NO-TOCAR intacto; sin backend/migración.

Evidencia independiente fresca: 302 Vitest/25 + Node1, typecheck, directorio Node4, builds raíz/rollback con allowlist31 cada uno, guardas negativas20/20 y diff-check PASS; lint N/A. E1 compilado8/8 (ambos motores, bases, ES/EN390): triserie8/fallo técnico/20porlado, guardado, edición, export JSON, recarga, cambio de modo/técnica, enum inválido rechazado sin pérdida, IDs/notas/historial/primaryGoal y otro día/ruta conservados. Propuesta estándar/especial ES/EN cubierta por pruebas unitarias frescas. Flotante24/24 y120 geometrías (ambos motores/bases/idiomas,320/390/1440; inicio/medio/rutas/final/altura460) sin intersecciones ni overflow; botón móvil presente52px y badge acotado. Main inspeccionó imágenes finales de escritorio1440EN y WebKit390ES inicio/final. Auth/menú/modal/instalación CI3 siguen aplicables por hashes idénticos de archivos no afectados. Recibo dev58hashes y reporte independiente en `/private/tmp/aunara-sdd006-extra-review.md`; artifacts frescos `/private/tmp/aunara-sdd006-review-extra-build.S78HmB/`. El error temporal de navegación WebKit se resolvió en harness local sin tocar fuente ni demorar Auth.

**DELIVERY BLOCKED:** delta original contra HEAD no aplicado íntegramente en copia temporal:13 conflictos; alternativa mecánica de tres vías deja11, incluido test preexistente no versionado ausente en HEAD. Recibos `/private/tmp/aunara-sdd006-isolated-EU0eRG/isolation-receipt.json` y `/private/tmp/aunara-sdd006-isolated-CzryoF/isolation-receipt.json`. No se construyó un árbol parcial como evidencia de entrega ni se demuestra imposibilidad absoluta de aislamiento manual: no hay todavía una entrega aislada segura verificada. Resolver requiere decisión del Operator sobre frontera/integración de cambios anteriores; no absorberlos ni hacer adaptaciones de producto adicionales automáticamente. Sin staging/commit/push/publicación; trabajo local declarado sin commit. UAT física (incluido teclado real), correo/backend y cierre humano permanecen pendientes separados. SDD-007–009 no iniciados.

`[AUNARA/codex · GPT-5]` — La lectura de `WorkoutItem` y `WorkoutWorkBlock` confirmó que no existe unidad/conteo por lado; la nota libre no satisface un contrato inequívoco para el ejecutor. Propuesta: campo opcional `repetitionCount: "total" | "per-side"` por ítem/bloque de trabajo. Campo ausente conserva semántica legacy «total», sin auto-reescritura ni migración/versionado de snapshot/backend. Selector ES/EN solo para targets de repeticiones y presentación explícita «20 por lado»; no duplica cantidades ni inventa carga/descanso. Validar ambos valores, rechazar valor inválido y preservar en recarga/export/edición. Archivos dentro de allowlist existente: `src/types.ts`, `src/App.tsx`, `src/components/WorkoutPanel.tsx`, `src/lib/workoutPrescription.ts` y test, `src/lib/cloudSnapshot.ts` y test, tests de editor/flujos pertinentes. NO-TOCAR intacto. CA06-08 requiere fixture press8/fallo/escalador20 per-side; negativos de enum inválido y legacy sin campo. Resto del desarrollo puede continuar mientras este frente espera aprobación.
