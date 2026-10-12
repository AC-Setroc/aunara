# SDD-006 — Enmienda 2: consolidación local y frontera de entrega

2026-10-10 · v0.1 · Estado: **Aprobado; candidato local REJECTED, entrega bloqueada**.
Origen: `[AUNARA/codex · modelo no expuesto]`.
Casa canónica: `/Users/alejandro/AI Projects/Personal/aunara`.

Complementa [SDD-006 + E1](SDD-006-acceso-y-creacion-rutinas.md). El primer «Dale» autorizó preparar la propuesta. El segundo «Dale», del 2026-10-11, respondió a la solicitud explícita de aprobación de esta enmienda, incluida la separación entre entrega técnica y UAT: quedan aprobadas D-CL1–4 con las exclusiones documentales por defecto. Se autoriza integración aislada y revisión; commit local solo tras APPROVED técnico. Sin push ni publicación.

## 1. El problema y el resultado deseado

Las correcciones funcionan juntas en la copia local, pero todavía no hay una entrega independiente que pueda guardarse sin arrastrar otros trabajos pendientes. Separar únicamente el último ajuste produjo conflictos porque comparte piezas con las correcciones anteriores.

Resultado propuesto: preparar una entrega local integrada de correcciones **ya aprobadas** de SDD-002/003/004 y SDD-006 + E1, demostrar que el conjunto seleccionado funciona por sí mismo y conservar intacto todo lo ajeno. No rehacer funcionalidades ni convertir pruebas simuladas en aprobación de cuentas, correo, dispositivos o metodología.

## 2. Alcance, archivos permitidos y NO-TOCAR

### 2.1 Frontera técnica de inclusión propuesta

La tabla autoriza, **solo tras aprobación explícita**, trasladar bytes/hunks existentes y atribuibles a esos SDD al candidato temporal. **No autoriza nuevas ediciones de producción o pruebas**, ni todo cambio que casualmente esté en un archivo listado. Un hunk desconocido se excluye; si resulta indispensable, se detiene la integración y se vuelve al Operator con su atribución y ampliación exactas.

| Archivos exactos | Procedencia y límite de inclusión |
| --- | --- |
| `scripts/check-pages-client.mjs`, `scripts/check-pages-client.node-test.mjs`, `public/brand/ac-setroc-wordmark.png` | SDD-002: entrada exacta del PNG y positivo/negativo de marca arbitraria. PNG original, SHA-256 `fd079be4095398d5f55b2bb5ccc720e3479fa473d3d0a2b4ea593ba5f17050a5`; sin reencode ni ampliación de categorías. |
| `src/components/StorageNotice.tsx`, `src/components/StorageNotice.test.tsx`, `src/components/LegalPanel.tsx`, `src/components/LegalPanel.test.tsx` | SDD-002: aviso informativo, clave propia, documento de almacenamiento, hosting y accesibilidad/foco. No nuevo consentimiento ni reescritura contractual. |
| `src/hooks/useStoredState.ts`, `src/hooks/useStoredState.test.tsx` | SDD-002 E1: protección de serialización/escritura y continuidad en memoria, conservando claves, firma y lectura. |
| `src/hooks/useCloudSync.ts`, `src/hooks/useCloudSync.test.tsx` | SDD-003/E1: clasificación/copy/provenance/generación de errores, callback de limpieza y recuperación explícita deduplicada/neutral. Mantener retorno rápido E2 ya presente en HEAD; no copiar cambios ajenos de sync/bootstrap. |
| `src/App.tsx`, `src/components/AccessPanel.tsx`, `src/components/AccessPanel.test.tsx`, `src/components/AppFlows.test.tsx`, `src/styles.css` | Hunks compartidos: aviso/footer/legal (002 y enmiendas), acceso contextual (003/E1), enlace/consentimiento/ES-EN y perfil/editor (004/E1), navegación/privacidad/modal/instalación/slogan/targets/flotante (006/E1). Imports/fixtures/callbacks solo cuando necesarios para esas piezas. |
| `src/components/GuestApp.test.tsx` | Expectativas ES/EN autorizadas en SDD-004 E1 y regresión del menú compartido 006; no debilitar acceso invitado. |
| `src/components/OnboardingPanel.tsx`, `src/components/OnboardingPanel.test.tsx`, `src/components/OnboardingApp.test.tsx`, `src/components/ProfilePanel.tsx`, `src/components/ProfilePanel.test.tsx` | SDD-004: objetivos 1–3/deporte separado y preferencias editables, legacy y consentimiento; 006 solo regresiones/integración aprobadas. |
| `src/components/InitialRoutineProposal.tsx`, `src/components/InitialRoutineProposal.test.tsx`, `src/components/TrainingTracks.tsx`, `src/components/ExerciseAssignmentDialog.tsx`, `src/components/WorkoutPanel.tsx`, `src/components/WorkoutPanel.test.tsx` | SDD-004 y 006/E1: presentación por día, editor progresivo, grupos/targets por miembro, notas/IDs/historia y conteo. No balance/generador clínico nuevo. |
| `src/components/NavigationMenu.tsx`, `src/components/NavigationMenu.test.tsx` | SDD-006: mismo menú para logo/hamburguesa, destinos y foco público/privado. |
| `src/components/ExerciseCard.tsx`, `src/components/ExerciseDetail.tsx` | SDD-006: presentación bilingüe y pendiente editorial explícito; no medios nuevos ni IDs alterados. |
| `src/types.ts`, `src/lib/cloudSnapshot.ts`, `src/lib/cloudSnapshot.test.ts` | SDD-004: campos opcionales de objetivos/deporte/nota original y validadores; 006/E1: targets/conteo opcional por ítem/bloque. Snapshot v1 y transporte intactos. |
| `src/lib/exercises.ts`, `src/lib/exercises.test.ts`, `src/lib/workoutPrescription.ts`, `src/lib/workoutPrescription.test.ts` | SDD-004/006/E1: presentación/actualización compatible de prescripción, preservación de nota/history y helpers/validación de conteo. No recetas ni distribución nueva. |
| `src/lib/privacy.test.ts` | SDD-004: regresión de stripping que conserva preferencias no sensibles. Producción `privacy.ts` permanece en HEAD. |
| `src/lib/wellness.ts` | SDD-004: únicamente lector de primer objetivo/deporte en `proteinPlanningFactors` ya existente. Conserva factores 1.4/2 y fórmulas; no es aprobación clínica/nutricional nueva. Si atribución/equivalencia no queda demostrada, gate antes de incluirlo. |

La inclusión del hook de almacenamiento, hook de acceso, sus tests, guard y PNG **amplía expresamente la frontera de entrega de SDD-006**, donde estaban excluidos. No se levantan sus prohibiciones para editar comportamiento nuevo. La aprobación de los SDD anteriores no autorizaba absorberlos automáticamente en el commit 006: esta es la decisión que solicita E2.

Archivos ya presentes sin delta necesario —por ejemplo `src/lib/supabaseClient.ts` y su test, `src/lib/cloudStore.ts` y su test, `src/lib/privacy.ts`, `src/lib/install.ts` y su test, `src/lib/i18n.ts`, dataset/directorio— permanecen byte por byte en HEAD. No se crea un delta para ellos por estar mencionados en una spec histórica.

### 2.2 Documentación de entrega permitida

Únicamente después del gate, el frente principal/delivery podrá preparar hunks propios en:

- `AUNARA_SOT/02-ESTADO-ACTUAL.md`, `AUNARA_SOT/PENDIENTES.md`, `AUNARA_SOT/03-HISTORIA-Y-BACKLOG.md`: estado técnico local, pendiente global, decisión y una entrada nueva; no absorber todos sus cambios previos ni borrar historia.
- `AUNARA_SOT/sdd/SDD-002-avisos-legales-creditos.md`, `AUNARA_SOT/sdd/SDD-002-enmienda-1-almacenamiento-y-cierre.md`, `AUNARA_SOT/sdd/SDD-002-enmienda-2-armonia-footer.md`, `AUNARA_SOT/sdd/SDD-003-acceso-y-recuperacion.md`, `AUNARA_SOT/sdd/SDD-003-enmienda-1-recuperacion-contextual.md`, `AUNARA_SOT/sdd/SDD-004-uat-perfil-y-rutinas.md`, `AUNARA_SOT/sdd/SDD-006-acceso-y-creacion-rutinas.md` y este documento: contratos/aprobaciones/recibos pertinentes y separación explícita entre entrega técnica integrada y cierres pendientes. Conservar recibos históricos; no declarar cerrados los anteriores.

Los documentos anteriores nuevos pueden incluirse completos solo si la revisión confirma que todo su contenido pertenece a esos alcances y está sanitizado. La bitácora/estado con dirty previo siempre requieren selección de hunks. La spec de SDD-004 E2 ya versionada se conserva desde HEAD; no requiere delta.

Por defecto **no se incluyen** `SDD-006-009-plan-entregas.md` ni SDD-007/008/009. Si los enlaces de documentación seleccionada necesitan ese conjunto, registrar decisión expresa de manifest documental antes del commit; alternativa acotada: dejar referencias a futuro como texto sin enlace huérfano en la versión documental entregada. No incorporar esos borradores como aprobación de producto ni editarlos para construir una dependencia artificial.

### 2.3 NO-TOCAR

- Repo canónico: fuente/tests/activos/entornos e índice actuales se preservan byte por byte durante preparación y revisión; no swaps, resets ni resolución de conflictos en el árbol vivo. Solo documentación propia puede actualizarse por su dueño después del gate.
- Todo hunk/archivo sin atribución positiva: excluido. Especialmente dirty de `AUNARA_SOT/06-RUNBOOK.md`, `AUNARA_SOT/sdd/SDD-001-enmienda-2-pages-en-repo.md`, `AUNARA_SOT/sdd/SDD-005-dominio-aunaratraining.md`, `docs/product/2026-08-25-feedback-work-plan.md`, `docs/product/README.md`, `docs/product/2026-09-18-opengym-adoption-review.md`, `docs/product/2026-09-26-device-uat-matrix.md`; no absorción por cercanía o por aprobación histórica de otro frente.
- `AUNARA_SOT/reference/`, insumos/capturas/audios privados y `.env*`: sin copia al candidato ni stage/commit; no documentar valores sensibles.
- Config/deps/lockfiles, workflows, hosting/PWA/worker/manifest, `supabase/`, backend/RLS/tablas/permisos, DNS/HTTPS/Auth settings/SMTP/templates, cuentas/correo/sesiones reales y producción.
- Assets Aunara/dataset/IDs y matrices metodológicas congeladas; excepción única de inclusión del PNG ya aprobado, no edición de activos.
- SDD-007–009 y nuevas capacidades: ejecución por serie, fatiga/Health, coaches/invitaciones, nutrición/medios propios, checker de cuentas o reglas clínicas. No cambios funcionales, refactors ni ajustes para hacer pasar pruebas desde esta enmienda.

## 3. Estado real de partida, medido y no supuesto

Inspección read-only 2026-10-10: `git rev-parse HEAD` devuelve `1c709a3f6d09b940a01e39eb55a2a49b74de712f`; rama `codex/aunara-rebrand`; `git diff --cached --name-only` vacío. `git status --short`/`git diff --stat` muestran dirty técnico/documental extenso y archivos nuevos. Se leyeron AGENTS, metodología Personal, índice/estado/pendientes/historia SOT, SDD-002/003/004 y sus enmiendas, SDD-006 + E1, diff actual y recibos. No se inspeccionó producción ni se corrieron nuevas pruebas funcionales en esta fase spec.

| Evidencia fresca | Hecho y límite |
| --- | --- |
| `scripts/check-pages-client.mjs:10` y diff del guard/test | Única entrada PNG exacta + prueba de archivo arbitrario, autorizadas en SDD-002. No requiere abrir directorio completo. |
| `src/hooks/useStoredState.ts:14–19` y diff | Escritura protegida, autorizada por 002 E1; nada de claves/migración/clear. |
| `src/hooks/useCloudSync.ts:60–155,434–468,610–623` y diff contra HEAD | Clasificación/generación/provenance, dedup/liberación y feedback neutral de 003/E1. El delta aún local no debe confundirse con E2 de retorno rápido ya versionada. |
| `src/components/OnboardingPanel.tsx:25–66`, `src/components/ProfilePanel.tsx:207–225` | Preferencias compatibles de 004; no es un nuevo módulo de producto. |
| `src/lib/wellness.ts:186–208` y diff | Lector de `goals[0]`/`sport`, factores existentes preservados. Su inclusión requiere atribución y regresión, no reinterpretación clínica. |
| `src/types.ts:36,39,50–51,94,151–154,230–231`; `src/lib/cloudSnapshot.ts:68–104,179–188` | Campos opcionales/validadores de 004 y 006 E1. No se cambia schemaVersion/servidor. |
| `package.json:6–14` | Scripts reales de tipos/tests/directorio/build; ausencia de lint demostrada en esa sección, no instalarlo. |

Frontera previa a 006: `/private/tmp/aunara-sdd006-VdRTV4/receipt.json` y sus archivos. Frontera final E1: `/private/tmp/aunara-sdd006-e1-nIdAM2/final-receipt.json`. El recibo final fija 58 hashes de fuente, no vuelve oficiales hunks ajenos.

Revisión independiente anterior: `/private/tmp/aunara-sdd006-extra-review.md`, mapa CA06-01–12. PASS técnico **sobre working tree**: 302 Vitest/25 + Node1, tipos/directorio4, builds raíz/rollback y allowlist31, guards20; flotante24/24 y120 geometrías; E1 export/round-trip8/8. UI anterior de auth/menú/modal/instalación sigue aplicable a esa frontera por hashes iguales. Esto no verifica el futuro candidato integrado.

Dos intentos de aislamiento solo del delta 006: `/private/tmp/aunara-sdd006-isolated-EU0eRG/isolation-receipt.json` registra13 conflictos y `/private/tmp/aunara-sdd006-isolated-CzryoF/isolation-receipt.json`11 restantes tras alternativa mecánica de tres vías. **No hay build aislado verificado**; no se construyó ni aceptó árbol parcial. Eso no demuestra imposibilidad absoluta de aislamiento manual y no autoriza integrar todo el dirty.

## 4. Diseño propuesto y fronteras afectadas

1. Congelar recibo local sanitizado: HEAD/status/index y hashes de archivos relevantes/NO-TOCAR. Guardar diffs/hunks técnicos sin `.env*`, referencias privadas ni valores de sesión; documentos compartidos tienen dueño único.
2. Crear copia temporal limpia de **HEAD exacto**, sin mover rama ni índice canónicos. HEAD conserva dominio/PWA/retorno E2 ya publicados. Añadir únicamente material de §2.
3. Construir manifest explícito por archivo **y hunk**: origen SDD/CA, diff contra HEAD y contra fronteras históricas disponibles, hash HEAD, hash seleccionado, hunk/objeto de bytes, motivo de dependencia y decisión incluir/excluir. Para nuevos archivos, revisar todos los bytes; para archivos compartidos, no atribuir por nombre solamente. Registrar las fronteras sin prometer trazabilidad retrospectiva que no existe.
4. La integración selecciona bytes ya existentes, no resuelve conflictos inventando comportamiento. Si todos los hunks de un archivo pertenecen positivamente al conjunto aprobado, puede trasladarse íntegro con hash; si hay mezcla, preparar solo hunks atribuibles. Cualquier adaptación nueva necesaria para compilar es hallazgo/gate, no permiso de desarrollo.
5. Candidato = HEAD + manifest acotado. Comparar su delta completo contra allowlist/NO-TOCAR y verificar que ningún excluido se trasladó. No seleccionar automáticamente una dependencia porque el build la reclame.
6. Revisión técnica independiente **fresca en ese candidato**, incluidas UI compilada y guardas negativas. Resultado se refiere a hashes exactos del candidato; la evidencia del árbol sucio es antecedente, no sustituto.
7. Entrega futura: docs/hunks propios y único commit local del candidato APPROVED. Preferir repositorio temporal limpio para no alterar índice/código canónicos; registrar SHA/base/manifest y ubicación recuperable. Si se vuelve a usar índice canónico, se necesita comprobación previa de bytes seleccionados y conservación de dirty; nunca `git add .`.

### Separación explícita de aceptación

Esta enmienda solicita **autorizar entrega técnica integrada y commit local con los gates globales todavía abiertos**. Es una excepción documental al orden de cierre/commit que algunos SDD anteriores condicionaban a UAT real completa. Solo aplica si el Operator aprueba expresamente §9; no se infiere de «Dale» ni del PASS técnico.

No elimina criterios ni marca pruebas reales como PASS. SDD-002/003/004 siguen abiertos para inventario autenticado/responsable, auth/sync/entrenamiento/correo reales, ausencia autoritativa, metodología y demás dependencias. SDD-006 mantiene UAT física/teclado/cierre humano y editorial pendientes. Commit técnico ≠ cierre global ≠ permiso de publicación.

## 5. Alternativas descartadas

- Commit de todo el working tree o copia recursiva del repo: absorbe trabajos ajenos/secretos.
- Continuar automáticamente resolución manual del delta 006 sobre HEAD: puede demandar adaptaciones no aprobadas; sigue siendo opción solo con atribución exacta y autorización si cambia alcance.
- Usar el working tree como baseline completa implícita: no produce frontera de entrega revisable.
- Rehacer anteriores correcciones, borrar tests rojos o tocar hooks/guards nuevamente: no solicitado.
- Declarar terminado por PASS previo o por commit local: confunde entrega técnica con UAT/global/publicación.

## 6. Riesgos sobre lo que hoy funciona y mitigación

Hunks compartidos pueden absorber cambios no pedidos: manifest positivo por hunk y revisión independiente; cualquier desconocido bloquea su inclusión. Datos legacy pueden perderse al integrar contratos: fixtures antiguos/nuevos, enum inválido, notas/history/IDs/días y export/recarga completos. Auth y almacenamiento son compartidos: recuperación0/200ms, premount/postmount y nueve consumidores del hook; no cambiar implementación para satisfacer pruebas. CSS debe conservar footer/foco/menú y flotante: ambos motores/idiomas/bases/extremos más breakpoint del footer. Lector wellness: conservar fórmulas/factores/legacy y declarar metodología no validada por este trabajo. Documento parcial puede enlazar borradores excluidos: revisar enlaces del conjunto versionable y elevar decisión antes del commit.

## 7. Verificación: criterios falsables y matriz

| ID | Criterio obligatorio para entrega técnica local |
| --- | --- |
| CL-01 | HEAD/base exactos; manifest enumera todos los archivos/hunks nuevos y modificados, con SDD/CA/hash; cero cambios desconocidos o fuera de allowlist. |
| CL-02 | Candidato completo se construye desde HEAD + selección acotada, sin secretos/referencias ni dirty ajeno. No faltan dependencias ni se acepta build parcial. |
| CL-03 | Fuente/test/activos/config/entornos e índice canónicos permanecen iguales al recibo inicial; docs concurrentes se comparan por dueño/hunks, no se pisan. |
| CL-04 | Checks frescos completos PASS sobre candidato y hash final; negativos verdaderos fallan al romper la guarda y normal vuelve a PASS sin cambios vivos. |
| CL-05 | UI compilada Chromium/WebKit ES/EN raíz/rollback1440/390/320 conserva navegación/acceso/modal/instalación/legal/footer/perfil/editor y flotante sin intersección/overflow; medición y capturas inspeccionadas. |
| CL-06 | Legacy/nuevo, triserie8/fallo/20porlado, standard/special y otro día/ruta sobreviven guardar/editar/export/recarga sin alterar IDs/notas/primaryGoal/history; enums inválidos se rechazan sin pérdida. |
| CL-07 | Almacenamiento normal/denegado, todos sus usos y auth simulado rápido/lento/premount/postmount conservan resultados; cero solicitudes de cuenta/correo real, privacidad/gates/aislamiento intactos. |
| CL-08 | Revisor independiente no integrador emite APPROVED técnico del candidato; docs diferencian criterios técnicos y gates reales/editoriales/metodológicos pendientes, sin cierre global de SDD anteriores. |
| CL-09 | Árbol del commit local corresponde al candidato revisado/manifest más docs propias revisadas; excluidos no aparecen en delta. Sin push/merge/release/deploy. |

| Nivel | Matriz requerida |
| --- | --- |
| Automatizados | `npm run typecheck`, `npm test`, `npm run check:exercise-directory`, `npm run test:exercise-directory`, `npm run build`, builds raíz y `AUNARA_BASE_PATH=/aunara/` conforme runbook vigente; guards de artifact/worker existentes y `git diff --check`. Lint N/A por script ausente. No bajar conteo silenciosamente respecto de302/25+Node1; cualquier diferencia debe explicarse por manifest/revisión. |
| Guards | Tests actuales Pages/worker y negativos: PNG exacto permitido/arbitrario rechazado, archivo servidor y rutas fuera de base. Introducir cada defecto en copia temporal y restaurar normal. Comparar allowlist cliente esperada31; discrepancia bloquea, no ampliar el guard. |
| UI | Chromium y WebKit × ES/EN × `/`/`/aunara/` ×1440/390/320. Footer además375/1051/1050/1049 por criterios previos. Teclado/foco/Escape/capas, scroll inicio/medio/final y altura reducida460; instalación prompt/ausente/cancelado/standalone. Altura reducida no equivale a teclado físico. |
| Regresión previa | Aviso/diálogos/foco y formulario conservado; reconocimiento/recarga/storage denegado; acceso create/login/error/recovery neutral/pending/429/transporte; enlace de confirmación/reenvío;0/200ms antes/después de montaje; menú público/privado/logout/cambio de usuario sintéticos; preferencias/consentimiento/objetivos/propuesta/editor. Completar matrices previas pertinentes del candidato, no heredar un WebKit incompleto. |
| Datos | Fixtures legacy/nuevos/invalid, groups/two days, standard/special/count, notas libres e historial, export JSON real sintético y round-trip/reload; stripping sin consentimiento y aislamiento entre usuarios sintéticos. Wellness: lector nuevo/legacy con factores y fórmulas preservados; no certificar adecuación clínica. |
| Negativos producto | Quitar protección de escritura/generación/buffer recovery; reintroducir falsa existencia tras reset; permitir cuarto objetivo/deporte en goals; borrar nota/history; compartir targets o enum inválido; habilitar privado invitado/borrado sin palabra/instalación standalone; restaurar flotante superpuesto. Cada caso rojo y normal verde documentados en copia aislada. |

Red externa bloqueada antes de navegar; Auth HTTP completamente interceptado con fixtures sintéticos y sin cuentas/tokens reales. Si WebKit no está disponible o falla una regresión, REJECTED. Preferencias nativas de Tab requieren diagnóstico de ambiente y navegación apropiada registrada, no cambio del sistema ni foco forzado para aprobar. No instalar herramientas/deps ni modificar tests/producto para esconder el fallo.

UAT real permanece separada: cuentas/confirmación/recepción y retorno de correo/sync/borrado/entrenamiento/inventario autenticado; Safari/iPhone, Chrome/Android, PWA y teclado físicos; revisión del responsable, términos editoriales y metodología/Danny. Cada frente requiere intervención/autoridad propia del Operator. No omitir criterios originales ni atribuirles PASS por simulación.

## 8. Plan de entrega y límite de commit

1. Presentar E2 y obtener aprobación explícita de alcance, excepciones de inclusión, separación técnica/global y manifest documental. Antes de eso, solo spec.
2. Integrador único arma recibo/manifest/candidato temporal sin editar bytes nuevos. Si aparece dependencia fuera de tabla, hunk no atribuible o necesidad funcional, para y presenta enmienda; no autocompleta.
3. Revisor independiente comprueba CL-01–08, CA técnicos de SDD-002/003/004/006 y matrices vigentes. Máximo tres ciclos según metodología; esta enmienda no habilita nuevos ajustes funcionales ni reinicia ilimitadamente la continuidad puntual de006.
4. Main/delivery actualiza únicamente documentación §2.2 y conserva historia/criterios/gates. Revisa vínculos, privacidad y consistencia del paquete; no incorpora docs007–009 automáticamente.
5. Tras APPROVED técnico explícito, delivery verifica hashes/árbol/manifest y crea **un commit local integrado** de correcciones aprobadas, con tag de origen real, sin push. Si no puede demostrar aislamiento del dirty ajeno, no commit y decisión del Operator. Reporta SHA, base, ubicación del repo temporal si aplica, manifest/evidencia y pendientes.
6. Operator realiza UAT/cierre cuando autorice esos frentes. Publicación futura requiere orden separada; esta enmienda no la propone ni autoriza.

Trabajo actual declarado **sin commit** por gate de especificación; no se stagea nada. Estado/pendientes/bitácora/SDD original006 pertenecen al frente principal, no al agente que crea esta spec.

## 9. Decisiones, supuestos y preguntas pendientes del Operator

- **D-CL1:** aprobar o ajustar baseline HEAD + inclusión integrada acotada de002/003/004/006, con tabla §2.1 y política positiva por hunk; no toda la copia local.
- **D-CL2:** aprobar excepción de **inclusión, no edición** del hook/storage, hook/auth/tests, guard/test y PNG ya autorizados por anteriores SDD, pese al NO-TOCAR de006. Supabase client/E2 ya versionados quedan intactos.
- **D-CL3:** aprobar explícitamente commit local después de APPROVED técnico del candidato **sin declarar cierre global**; los requisitos reales/responsable/editoriales/metodológicos siguen vigentes, abiertos y reservados al Operator. Esto supersede solo el gate de commit técnico anterior, no sus criterios de producto.
- **D-CL4:** aprobar docs/hunks de §2.2; por defecto excluidos runbook/domain/OpenGym/UAT/007–009/plan futuro. Si se quiere conservar enlazado el plan006–009 en el commit, decidir manifest documental específico; no se infiere permiso de implementación futura.
- Pendiente verificatorio: atribuir todos los hunks y construir el candidato; no se afirma que ya existe o que está APPROVED. Fronteras históricas incompletas no autorizan inventar provenance; documentar duda y gate.
- Pendientes globales: cuentas/correo/backend/teclado/PWA físicos, editorial y reglas metodológicas. No se supone aprobación ni disponibilidad. Esta decisión no configura infraestructura ni arregla entrega de correo.

## 10. Definición de terminado

**Spec aprobada:** el Operator aprobó esta frontera el 2026-10-11. La aprobación no acredita todavía integración, checks frescos ni aceptación del candidato.

**Entrega técnica local:** E2 aprobada explícitamente; CL-01–09 completos; candidato independiente reproducible y revisado APPROVED; documentación acotada, manifest y commit local coherentes; canónico preservado y excluded dirty no absorbido. Si no se logra, entrega bloqueada con evidencia y decisión pendiente, no «listo».

**Producto/global:** solo el Operator cierra después de resolver/validar o separar formalmente los gates originales. Commit técnico no cierra SDD-002/003/004/006, no acredita correo/cuentas/dispositivos/metodología ni autorización de push/publicación.

Registro de la preparación (2026-10-10): lectura de metodología/SOT/source/diff/recibos; solo documento nuevo, sin ejecución de checks de implementación ni modificación de source/tests/config/deps/índice/producción. Evidencia anterior permanece histórica. Registro de aprobación (2026-10-11): `[AUNARA/codex · modelo no expuesto]`; integración y manifest final todavía pendientes al registrar esta decisión.

### Recibo de integración y revisión — 2026-10-11

`[AUNARA/codex · modelo no expuesto]` — Candidato construido en `/private/tmp/aunara-sdd006-e2-candidate.EZJxlS/repo`, base `1c709a3f6d09b940a01e39eb55a2a49b74de712f`; manifest técnico41 archivos/175 hunks y documental8 SDD+3 entradas propias sobre HEAD. Los58 hashes E1 coinciden. No se incorporaron borradores007–009, referencias privadas, entornos ni dirty documental ajeno. Revisión independiente **REJECTED**: CL-07 falla con lectura `localStorage.getItem` denegada y escritura/remoción permitidas, en Chromium/WebKit y raíz/rollback; body vacío y `#root` sin hijos antes de React.

Causa confirmada: import estático `src/lib/supabaseClient.ts:1` → SDK transitivo auth-js2.110.8 `dist/module/lib/locks.js:22`, lectura top-level del flag debug sin captura. El guard de soporte prueba solo escritura/remoción. Un adapter pasado a `createClient` no evita una excepción que ocurre antes de llamarlo. No se comparó runtime con HEAD: no se afirma que E2 lo introdujo ni que sea exclusivo de esta entrega. Resolverlo exige una nueva frontera aprobada de arranque/importación o dependencia; E2 no autoriza editarla.

PASS particulares frescos:298 Vitest/24+Node1, tipos/directorio4/guards27, builds ambas bases/allowlist31, UI/legal/footer56, acceso contextual24, recuperación0ms24, instalación192 escenarios/240 registros, E1 round-trip8 y flotante24. Diez negativos red→green; matrices adicionales y auditoría semántica completa deliberadamente no finalizadas tras el gate, **no PASS heredado**. Borrado diagnóstico390 en ambos motores pasa esperando foco natural; assertions inmediatas previas no prueban defecto de producto. Main inspeccionó footer escritorio, móvil320, editor por lado y pantalla vacía WebKit.

Corrección del conteo histórico:302/25 incluía4 tests de una copia ignorada `outputs/repbook-mvp/src/lib/exercises.test.ts`. El conjunto canónico fresco es298/24, sin pruebas eliminadas ni cobertura inflada. Se conserva el recibo histórico con esta aclaración, no se lo reinterpreta como aceptación.

Reporte `/private/tmp/aunara-sdd006-e2-review.md`; evidencia de fallo `/private/tmp/aunara-sdd006-e2-storage-candidate.json`; preservación `/private/tmp/aunara-sdd006-e2-review-preservation.json` (170 hashes canónicos e índice intactos,41 seleccionados/175 objetos/58 E1/11 docs sin cambios; copia negativa restaurada). No hubo stage, commit, push, publicación ni cuentas/correos reales. Trabajo local **sin commit** por rechazo técnico; se solicita dirección del Operator antes de ampliar alcance. UAT real y cierre global siguen abiertos.

Continuidad documental2026-10-11 `[AUNARA/codex · modelo no expuesto]`: el Operator primero autorizó preparar la [Enmienda 3](SDD-006-enmienda-3-arranque-almacenamiento.md) y posteriormente aprobó D-E3-1–4 con «Dale». Quedan autorizados bloqueo explicado sin App/Auth en get-only, entrada/test aislados y delta de chunks medido; desarrollo E3 cerrado y revisión completa retomada el 2026-10-12. El rechazo histórico E2 no se convierte en PASS; aceptación independiente conjunta todavía pendiente. Sin commit/push/publicación.
