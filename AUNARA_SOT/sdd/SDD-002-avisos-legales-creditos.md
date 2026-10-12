# SDD-002 — Avisos legales, almacenamiento y crédito de desarrollo

Versión: 0.1 · 2026-10-01

Estado: **Aprobado por el Operator — implementado localmente, cierre bloqueado por revisión**

Aprobación explícita: 2026-10-01, «Apruebo alcance de SDD-002». Autoriza el alcance de implementación de §2; no autoriza push, publicación ni el gate documental adicional de §8. El defecto de mensajes de acceso reportado después de la propuesta queda fuera de este SDD.

Origen: `[AUNARA/codex · GPT-5]`

Casa canónica: `/Users/alejandro/AI Projects/Personal/aunara`. Fuente y Pages: `AC-Setroc/aunara`; URL vigente: <https://ac-setroc.github.io/aunara/>.

Durante la fase de especificación solo estaba autorizada la escritura de este documento. Con la aprobación registrada se inicia implementación dentro de la allowlist; revisión independiente y gate documental preceden a la entrega. Push, publicación y cambios externos siguen requiriendo autorización explícita. Silencio no es aprobación.

## 1. El problema y el resultado deseado

La persona que usa Aunara debe poder consultar en ventanas los términos, la privacidad y una explicación honesta de cookies/almacenamiento, sin perder lo que estaba haciendo. Debe reconocer también quién desarrolló la aplicación, con el crédito bilingüe y la marca AC Setroc que ya usa Ander Tattoo Studio.

Los términos y la privacidad ya tienen ventanas y la creación de cuenta ya exige aceptar los términos. No se necesitan dos sistemas legales ni una aceptación nueva en cada visita. Falta la explicación accesible del almacenamiento técnico, un aviso informativo discreto y el crédito de desarrollo. La privacidad todavía identifica al proveedor anterior de la web.

Resultado propuesto: conservar los flujos legales y de cuenta existentes; sumar un aviso no bloqueante con «Entendido / Understood», una ventana «Cookies y almacenamiento / Cookies and storage» reabrible desde el pie, y «Desarrollado por / Developed by» junto al wordmark real de AC Setroc. Corregir únicamente el nombre del hosting en privacidad. No introducir rastreadores ni simular preferencias que la aplicación no controla.

## 2. Alcance, archivos permitidos y NO-TOCAR

### Allowlist de implementación propuesta, solo después del gate

| Archivo exacto | Cambio autorizado |
|---|---|
| `src/App.tsx` | Integrar aviso informativo; agregar acción de cookies/almacenamiento al pie; presentar crédito; reutilizar estado y apertura del panel legal. No alterar lógica de negocio. |
| `src/components/LegalPanel.tsx` | Añadir variante de cookies/almacenamiento, copy ES/EN y comportamiento accesible de las ventanas legales; reemplazar OpenAI Sites por GitHub Pages en el párrafo de hosting, sin reescribir las demás condiciones. |
| `src/components/StorageNotice.tsx` (nuevo) | Aviso no bloqueante, persistencia aislada de su reconocimiento y manejo seguro del almacenamiento no disponible. |
| `src/styles.css` | Reglas acotadas para aviso, pie/crédito y paneles legales; no rediseñar otras superficies ni cambiar tokens globales. |
| `public/brand/ac-setroc-wordmark.png` (nuevo) | Copia byte por byte del activo ya usado en ATS; sin generar/redibujar otra marca. |
| `src/components/StorageNotice.test.tsx` (nuevo) | Pruebas del aviso y persistencia/fallo de almacenamiento. |
| `src/components/LegalPanel.test.tsx` | Pruebas ES/EN de las tres variantes, accesibilidad, cierre/foco y proveedor vigente. |
| `src/components/AppFlows.test.tsx` | Integración del pie/aviso y regresiones cercanas, sin alterar fixtures ajenos innecesariamente. |
| `src/components/AccessPanel.test.tsx` | Afirmar conservación de la aceptación obligatoria en signup y separación del consentimiento de salud; sin cambiar el componente de producción. |
| `scripts/check-pages-client.mjs` | Añadir exclusivamente `brand/ac-setroc-wordmark.png` a `STATIC_FILES`; conservar todas las otras restricciones. |
| `scripts/check-pages-client.node-test.mjs` | Aceptación del nuevo archivo exacto y rechazo de otro archivo arbitrario en `brand/`; mantener negativos existentes. |
| `AUNARA_SOT/sdd/SDD-002-avisos-legales-creditos.md` | Estado, decisiones, evidencia y log de este ítem. |

La nueva imagen en `public/brand/` hace necesaria la entrada exacta en el guard del artifact; no se abre una categoría genérica de imágenes permitidas. Si la implementación requiere otro archivo o una modificación fuera de los límites de la tabla, detener ese frente, enmendar este SDD y pedir nueva aprobación.

### NO-TOCAR

- `src/components/ConsentGate.tsx`, sus decisiones de autorización de salud y cualquier lectura/escritura de datos sensibles.
- Producción de auth: `src/components/AccessPanel.tsx`, `src/lib/supabaseClient.ts`, signup/login/confirmación/recuperación, contratos cloud y aceptación jurídica existente. No cambiar callbacks, datos, usuarios ni settings de Supabase.
- `src/lib/privacy.ts`: conservar `LEGAL_VERSION = "1.0"`, fecha, responsable, contacto, exportación y stripping de datos. No forzar reconsentimiento masivo mediante una subida automática de versión.
- `src/hooks/useStoredState.ts`, claves y mecanismos actuales de persistencia de producto, sync, limpieza de sesión, perfiles, rutinas, entrenamiento, alimentos, ejercicios y dataset. El nuevo aviso no borra ni modifica nada de eso.
- `public/sw.js`, registro del worker, manifest, caches existentes, funcionamiento offline/PWA, Vite, workflows, dependencias y lockfiles. No efectuar migraciones ni limpieza de almacenamiento.
- Atribuciones de Hasan Emir Yıldırım, MIT y Gym visual; marca Aunara, navegación y funcionalidades actuales fuera de lo descrito.
- Analytics, píxeles, cookies opcionales, CMP de terceros, embeds o nuevas llamadas externas. No introducir ninguna de estas tecnologías.
- GitHub/Pages/Supabase/hosting, DNS, secretos, correos, producción, otros sitios del mismo origen y cualquier otro proyecto. ATS se inspecciona como referencia, nunca se edita.
- `AUNARA_SOT/reference/`: insumos privados/inmutables, no usar como assets, no stage ni publicar. `.env*`, tokens y valores de sesiones no se copian a documentación.
- Cambios preexistentes en `AUNARA_SOT/02-ESTADO-ACTUAL.md`, `06-RUNBOOK.md`, `PENDIENTES.md`, `sdd/SDD-001-enmienda-2-pages-en-repo.md`, `docs/product/2026-08-25-feedback-work-plan.md`, `docs/product/README.md` y archivos nuevos de `docs/product/`: no absorber, reescribir ni incluir en este commit.
- Todo archivo no enumerado en la allowlist. Los documentos generales de SOT requieren un gate documental de entrega específico descrito en §8; no están implícitamente autorizados aquí.

## 3. Estado real de partida y evidencia

Inspección de fuente local del 2026-10-01, no equivalentes a una prueba de interacción en navegador:

| Evidencia | Hecho observado |
|---|---|
| `src/App.tsx:24,113,889-896,1024-1031` | Usa `LegalPanel`, mantiene un documento activo y ofrece botones de privacidad/términos desde el pie. El pie conserva atribuciones del contenido. |
| `src/components/LegalPanel.tsx:12-42` | Solo existen variantes `privacy` y `terms`; hay `role="dialog"`, `aria-modal`, título y listener de Escape. No se observa gestión explícita de foco inicial, trap y restitución en esta implementación. |
| `src/components/LegalPanel.tsx:83-89` | Privacidad declara OpenAI Sites como entrega pública; requiere sustituir ese proveedor por GitHub Pages en ES/EN. |
| `src/components/AccessPanel.tsx:133,155-160,383-427` | Signup contiene checkbox obligatorio `acceptedLegal`, enlaces T&C/privacy y autorización de salud en checkbox separado. Crear cuenta queda deshabilitado sin aceptación legal. |
| `src/App.tsx:22,832` y `src/components/ConsentGate.tsx` | Gate de salud distinto de las ventanas legales; no es un gestor de cookies. |
| `src/lib/privacy.ts:4-7` | Versión jurídica 1.0, fecha 2026-07-29, responsable/contacto existentes. |
| `src/hooks/useStoredState.ts:6,14`; `src/App.tsx` y tests de flujos | Persistencia mediante `localStorage` de preferencias y estado de la aplicación. |
| `src/lib/supabaseClient.ts:11` | `persistSession: true`; la sesión de autenticación es persistente. |
| `public/sw.js:13,19-21,40,50-55` | Cache API para shell/respuestas y política existente de caches. Describir su existencia no autoriza modificarla. |
| `src/styles.css:435-443,911-921,1083-1084,1111-1114,1433-1439` | Pie y paneles tienen reglas desktop/móvil y overrides de marca; las nuevas reglas deben convivir con ambos bloques. |
| `scripts/check-pages-client.mjs:6-25` | Artifact con allowlist exacta de archivos estáticos; nuevo wordmark no está permitido todavía. |
| `package.json:6-14` | Scripts de typecheck, tests y build; no hay script de lint configurado. |

Búsqueda negativa acotada: se inspeccionaron `src/`, `public/sw.js` e `index.html` mediante búsqueda de `document.cookie`, `analytics`, `gtag` y `pixel`; no aparecieron integraciones directas con esos nombres. Esto **no acredita ausencia absoluta** de cookies/rastreo de dependencias o infraestructura, ni reemplaza inventario de red/almacenamiento en navegador. No escribir «no usamos cookies» como hecho absoluto sin esa verificación.

Referencia ATS, solo lectura: `/Users/alejandro/AI Projects/Personal/ander-tattoo-studio/src/plataforma/componentes/PieDePagina.astro:96-108,188-213` muestra texto y PNG, alt `AC Setroc`, proporción 2464×671, ancho visual 7rem, sin anchor. Los rótulos están en `src/contenido/infraestructura/es.ts:393` y `en.ts:390`: «Desarrollado por» / «Developed by». Fuente del asset: `public/marca/ac-setroc-wordmark.png` del mismo proyecto. No copiar layout/tokens de ATS ni crear un enlace que no existe allí.

## 4. Diseño y fronteras afectadas

### Aviso informativo, no autorización de finalidades

- Mostrar al ingresar un aviso no modal y no bloqueante si no existe reconocimiento de esta versión del aviso. No abrir automáticamente T&C ni esconder la aplicación detrás del aviso.
- Copy bilingüe: Aunara conserva en el dispositivo preferencias/datos de uso de la app, sesión y recursos técnicos para funcionamiento/offline. Ofrecer «Más información / Learn more» y «Entendido / Understood».
- «Entendido» registra únicamente que se leyó/cerró el aviso. **No llamarlo consentimiento**, aceptación de T&C o autorización de salud; no cambia ninguno de esos estados.
- Usar una clave nueva y aislada, `aunara-storage-notice-v1`, con dato mínimo de reconocimiento. No almacenar cuenta, correo, tokens, datos de salud ni historial. Lectura/escritura bajo manejo de excepciones: si el navegador bloquea almacenamiento, la app sigue operativa y el aviso puede reaparecer en otra visita; en la visita actual se puede cerrar.
- No existe botón «rechazar todo» ni toggles falsos de marketing, porque este alcance no incorpora finalidades opcionales ni mecanismos para desactivarlas. Tampoco un botón que borre datos para rechazar almacenamiento.
- El aviso permanece accesible sin tapar controles principales, navegación móvil o entrenamiento. No se anuncia como diálogo; las ventanas sí lo son.

### Ventana de cookies y almacenamiento

Reutilizar `LegalPanel` agregando la variante `cookies`, título bilingüe y acción permanente del pie. Explicar con lenguaje simple: almacenamiento local de preferencias/estado; persistencia de sesión gestionada por Supabase; cache de recursos offline del service worker; reconocimiento del propio aviso. Relacionar con privacidad y datos personales, y mencionar controles del navegador y posible pérdida de preferencias/sesión al eliminarlos, sin ejecutar borrados.

Inventario verificatorio previo a cerrar el copy: registrar nombres/patrones de claves/cookies, tecnología, proveedor/origen, finalidad, duración observada/documentada y si hay datos personales, sin valores privados. Revisar primer ingreso, uso invitado, apertura de login y, en entorno autorizado/disponible, sesión autenticada. Si aparece una finalidad opcional o cookies personales no contempladas, no esconder el hallazgo: detener la afirmación afectada y volver al gate. No categorizar todo el almacenamiento personal como «exento» por llamarlo esencial.

### Diálogos y accesibilidad

Las tres variantes comparten foco inicial dentro del diálogo, tabulación confinada, Escape y botón de cierre accesibles, título vinculado y devolución del foco al control que abrió la ventana. Mantener scroll del documento largo y que el resto de la página no reciba interacción mientras está abierto. La apertura desde signup no debe perder valores ni cerrar el panel de acceso; al cerrar legal se regresa al disparador dentro del panel de acceso. Escape afecta solo la capa legal superior. Verificar la convivencia sin modificar otros paneles: cualquier dependencia fuera de allowlist requiere enmienda.

### Crédito y privacidad

Copiar el wordmark aprobado de ATS sin modificaciones. Renderizarlo en el pie con alt `AC Setroc`, proporción preservada y ancho inicial 7rem ajustable solo para evitar desbordamiento. Rótulo según idioma, sin URL inventada, junto a las acciones legales pero sin sustituir marca Aunara ni atribuciones existentes. Resolver su ruta con `import.meta.env.BASE_URL` para `/` y `/aunara/`.

Cambiar exclusivamente «OpenAI Sites» por «GitHub Pages» en el párrafo de proveedores de privacidad, ambas traducciones. No afirmar otro país/región de hosting ni alterar las finalidades, responsables, fechas, contratos o versión jurídica. Si una revisión jurídica solicita cambios materiales adicionales, son un alcance separado.

## 5. Alternativas descartadas y base de la decisión

- Crear otro modal de términos: duplica contenido y aceptación existentes.
- Abrir T&C obligatorios en toda visita: no pedido y perturba flujos que ya funcionan.
- Mezclar aviso de almacenamiento y consentimiento sensible de salud: objetos y efectos distintos; introduciría cambios de privacidad/autenticación fuera de alcance.
- CMP, marketing y «aceptar/rechazar todas»: no respaldados por integraciones observadas; no ofrecer control ficticio.
- Texto «sin cookies» basado solamente en búsqueda de código: infraestructura/dependencias no auditadas.
- Link comercial a AC Setroc o logo nuevo: ATS no incluye ese link y ya hay un wordmark real.
- Cambiar `LEGAL_VERSION` automáticamente: puede impactar aceptación persistente; no necesario para identificar hosting/copy informativo.

Referencias legales oficiales consultadas el 2026-10-01: [Ley 1581 de 2012, arts. 4, 9 y 10](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=49981) y [SIC: Google y cookies que recolectan datos personales](https://sedeelectronica.sic.gov.co/noticias/superindustria-ordena-google-cumplir-con-el-estandar-nacional-de-proteccion-de-datos). El acceso directo devolvió errores, pero los resultados oficiales de búsqueda permitieron contrastar su contenido; [copia oficial consultable de la ley](https://www1.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=49981) y [boletín oficial SIC](https://sedeelectronica.sic.gov.co/publicaciones/boletin-juridico/boletin/superindustria-ordena-google-llc-cumplir-con-la-ley-1581-de-2012).

Estas fuentes establecen obligaciones de protección/autorización para tratamiento de datos personales, incluidas cookies cuando recogen esos datos. La autorización debe ser previa, expresa e informada cuando corresponde, considerando excepciones legales; llamar «esencial» a una tecnología no elimina por sí mismo esas obligaciones. La propuesta es una decisión acotada de producto basada en fuente observada, **no un dictamen jurídico ni certificación de cumplimiento**. Un aviso «Entendido» no sustituye autorización donde sea exigible; inventario y validación del responsable son condiciones previas al cierre de copy.

## 6. Riesgos sobre lo que hoy funciona

| Riesgo | Mitigación y rechazo |
|---|---|
| Banner tapa controles, móvil o entrenamiento | No modal; comprobar viewport estrecho, navegación y botón flotante. Si tapa acciones, rechazo. |
| CSS global cambia otras páginas/paneles | Selectores específicos; comparar superficies cercanas. Ningún ajuste oportunista de estilos. |
| Nueva ventana rompe foco o cierra signup | Verificar teclado y superposición desde AccessPanel; no modificar producción de auth. Esc/foco perdido o formulario borrado implica rechazo. |
| Persistencia borra claves o falla la app | Clave independiente, dato mínimo, try/catch y pruebas con almacenamiento denegado; ninguna operación clear. |
| Copy afirma controles o exclusiones jurídicas inexistentes | Inventario navegador y revisión del responsable; no promesas de ausencia absoluta ni categorías ficticias. |
| Wordmark rompe Pages o abre artifact indiscriminadamente | `BASE_URL`, hash idéntico a ATS, allowlist de un archivo y negativo de archivo arbitrario. |
| Reconsentimiento/regresión de salud | No tocar versión, signup, ConsentGate ni datos. Tests de regresión obligatorios. |
| Dirty preexistente entra a entrega pública | Inventario inicial/final, stage exacto y gate documental para SOT; referencias privadas nunca se stagean. |

## 7. Verificación y criterios falsables

### Criterios de aceptación

- **A1:** En ES y EN, invitado y usuario, el pie conserva términos/privacidad y abre cookies/almacenamiento; cada ventana muestra título/copy del idioma activo y se puede cerrar y reabrir.
- **A2:** Con la clave del aviso ausente aparece aviso no bloqueante. «Entendido» lo cierra; recargar con reconocimiento guardado no lo vuelve a mostrar. No se escribe consentimiento legal/de salud. Con almacenamiento denegado la aplicación sigue funcionando y el aviso se cierra durante esa visita.
- **A3:** Ventana informa las tecnologías realmente verificadas, sus finalidades y limitaciones; no tiene preferencias ficticias ni afirma ausencia absoluta de cookies. Inventario sin tokens/valores personales queda registrado como evidencia. Hallazgo opcional no contemplado impide dar este criterio por aprobado.
- **A4:** Las tres ventanas soportan foco inicial, Tab/Shift+Tab confinados, Escape/cierre y restitución de foco. Abiertas desde signup, conservan formulario y aceptación; Escape no cierra acceso debajo. El documento largo se puede leer completo en móvil.
- **A5:** ES muestra «Desarrollado por» y EN «Developed by», wordmark AC Setroc visible, sin distorsión ni enlace inventado. Hash del PNG igual al origen ATS. Funciona con base `/` y `/aunara/`; sin 404 ni overflow a 375px.
- **A6:** Privacidad ES/EN identifica GitHub Pages y no OpenAI Sites. `LEGAL_VERSION`, fecha, responsable/contacto y demás copy contractual permanecen sin cambios.
- **A7:** Signup sigue requiriendo aceptación de T&C, autorización de salud sigue separada/opcional, términos no aparecen obligatoriamente en cada visita y los flujos de invitado/login/entrenamiento conservan comportamiento.
- **A8:** Guard acepta el wordmark exacto y rechaza otro archivo arbitrario bajo `brand/`; los negativos de servidor y paths fuera de base continúan fallando correctamente. No se amplían regex/rangos ni se desactivan guardas.
- **A9:** No nuevos trackers, llamadas externas, cookies opcionales, dependencias, cambios de backend/infra ni archivos fuera de allowlist. Diff revisado contra baseline; ningún dirty preexistente ni referencia privada se entrega.

### Matriz obligatoria de revisión independiente

| Verificación | Cobertura / evidencia requerida |
|---|---|
| Typecheck | `npm run typecheck`, PASS. |
| Lint | No hay script configurado; registrar N/A por evidencia de `package.json`, no instalar uno. Revisar consistencia y `git diff --check`. |
| Suite existente | `npm test` y `npm run test:exercise-directory`, PASS; incluir auth/guest/consent y paneles. |
| Guard Pages | `node --test scripts/check-pages-client.node-test.mjs`; positivo PNG exacto, negativo PNG arbitrario, servidor y ruta fuera de base. Provocar fallo, confirmar normal nuevamente; fixtures temporales, no contaminar artifact. |
| Build local/Pages | `npm run build` para raíz; `AUNARA_BASE_PATH=/aunara/ npm run build` y `AUNARA_BASE_PATH=/aunara/ node scripts/check-pages-client.mjs`; PASS. Inspeccionar cliente y path runtime de la imagen. |
| UI real Chromium | Escritorio 1440×900 y móvil 375×812, ES y EN, bajo `/aunara/`: A1–A7, consola/red sin errores nuevos y sin overflow. |
| UI real WebKit | Misma matriz desktop/móvil, ES/EN y acciones que Chromium; teclado y capas legales sobre signup. **Obligatorio**: si no se puede ejecutar, registrar bloqueo, no aprobado. Safari real para UAT del Operator cuando disponible. |
| Persistencia y error | Primer ingreso, Entendido, recarga, reapertura desde pie, storage bloqueado; comparar claves sensibles/producto antes/después sin exponer valores. |
| Regresión auth/salud | Invitado, login/alta, links legales desde alta, checkbox obligatorio, autorización de salud separada; no generar cuentas/correos ni mutar backend sin autorización. Si el caso real autenticado no tiene ambiente/cuenta autorizados, registrar pendiente bloqueante para esa cobertura, no sustituir por prueba simulada silenciosamente. |
| Regresión cercana | Home/biblioteca, apertura de rutina/entrenamiento ya existente, navegación móvil, footer y atribuciones; ningún dato real modificado por probar crédito/aviso. |
| Inventario técnico | Red/cookies/localStorage/Cache API antes/después de interacciones permitidas. Metadata sanitizada solamente; hallazgos discrepantes vuelven al gate. |
| Diff y NO-TOCAR | Comparar archivos/cambios contra baseline y allowlist. Revisar que no haya eliminación/alteración de datos ni stage de referencia privada. |

No se corrieron estas verificaciones de implementación en la fase documental: no hay cambio implementado. La revisión no puede debilitar un check para marcar verde.

## 8. Plan de entrega, documentación y frontera de commit

1. Operator aprueba esta versión, alcance y decisiones de §9; registrar fecha/respuesta en el SDD. Hasta entonces no hay código.
2. Desarrollo acotado, sin commits propios. Si aparece dependencia fuera de scope o hallazgo de tracking/finalidades, detener y pedir enmienda.
3. Agente independiente revisa diff y ejecuta matriz; resultado APPROVED solo con criterios/evidencia completos. REJECTED vuelve a desarrollo y revisión nueva; hasta tres iteraciones según metodología Personal.
4. Entrega actualiza este SDD con resultado, evidencia concisa, decisiones, pendientes y log. Antes de cerrar la implementación, abrir **gate documental acotado** para las entradas necesarias en `AUNARA_SOT/02-ESTADO-ACTUAL.md`, `03-HISTORIA-Y-BACKLOG.md` y `PENDIENTES.md`: esos documentos de estado/historia son exigidos por la metodología, pero 02 y PENDIENTES ya tienen cambios ajenos. No están autorizados por esta fase ni se absorben completos. El Operator debe aprobar ampliación exacta y aislamiento de hunks antes de editarlos/stagearlos; si no es seguro aislar, detener entrega. No tocar 06-RUNBOOK ni documentos de producto para este ítem.
5. Tras revisión aprobada y gate documental resuelto, entrega confirma que los archivos revisados son los entregados y crea un commit **local, enfocado** solo con cambios aprobados, sin referencias privadas ni baseline dirty. Mensaje propuesto: `feat: add storage notice and AC Setroc footer credit`, con tag de origen en cuerpo conforme a metodología.
6. Reportar resultado, commit, verificaciones y pendientes. **Sin push, merge, release ni deploy** salvo orden posterior expresa. El Operator hace UAT y cierre.

LOG de especificación (2026-10-01): se leyeron skill, metodología, AGENTS, índice SOT y fuente actual. Metodología actualizada previamente por el agente coordinador. Solo se crea este SDD; código/pruebas/configuración permanecen intactos. No se absorbieron modificaciones previas, no stage/commit/push ni cambios en ATS/infraestructura.

LOG de desarrollo (2026-10-01): alcance aprobado e implementado en 11 archivos de producción, pruebas, asset y guard permitidos. Reporte de desarrollo: typecheck PASS; suite 159 pruebas + 1 preparación de artifact PASS; directorio de ejercicios 4 PASS; guard Pages 4 PASS, incluidos negativos; builds raíz y Pages PASS; artifact 31 archivos; diff-check PASS. PNG copiado de ATS con SHA-256 `fd079be4095398d5f55b2bb5ccc720e3479fa473d3d0a2b4ea593ba5f17050a5`, igual al origen. Advertencia preexistente de tamaño de bundle; no se optimizó fuera de alcance. Revisión independiente/UI todavía en curso; estos resultados no constituyen aceptación final. Sin commit/push/deploy.

Revisión independiente, iteración 1 (2026-10-01): REJECTED. Checks técnicos frescos PASS y Chromium escritorio/móvil ES/EN PASS. En WebKit, Tab desde el cierre de Privacidad deja el foco en BODY fuera del diálogo (A4); el nuevo botón Cookies hereda hover blanco sobre footer blanco (A1). Evidencia local temporal `/private/tmp/sdd002-webkit-focus-failure.png` y diagnóstico `/private/tmp/sdd002-focus-diagnostic.mjs`, no publicables ni parte del commit. Dev recibe corrección acotada de foco y estilo en archivos permitidos; requiere revisión independiente nueva. Cobertura de sesión autenticada real y gate documental adicional continúan pendientes. No se declara aprobado ni terminado.

Revisión independiente, iteración 2 (2026-10-01): correcciones de foco WebKit y hover PASS; veredicto global REJECTED por cobertura pendiente y dependencia fuera de alcance. Chromium/WebKit, escritorio 1440×900 y móvil 375×812, ES/EN: tres diálogos, Tab/Shift+Tab, Escape, restitución de foco, formulario de registro conservado, lectura completa, reconocimiento/recarga y fallo aislado de la nueva clave PASS. PNG/ruta/proporción/sin overflow PASS en bases raíz y Pages. Checks frescos: typecheck; 160 pruebas + 1 preparación; 4 directorio; 4 guard con negativos/normal; builds raíz/Pages; artifact 31; diff-check PASS. Lint N/A porque no existe script. Evidencia temporal `/private/tmp/sdd002-review-{chromium,webkit}-{1440,375}-{es,en}-footer.png` y `/private/tmp/sdd002-storage-total.mjs`.

Bloqueo A2: con getItem/setItem bloqueados globalmente, la app no renderiza y aparece error `Blocked`. `src/hooks/useStoredState.ts:14` tiene escritura sin protección, idéntica en HEAD; no se ejecutó reproducción runtime del baseline completo, por lo que el origen preexistente está respaldado por fuente, no por comparación runtime. Ese hook compartido está expresamente NO-TOCAR; no se corrigió ni se debilitó el criterio. Requiere enmienda aprobada que autorice tratar fallos de escritura y verificar todos los usos, o decisión expresa del Operator sobre el bloqueo. El aviso nuevo por sí solo tolera fallo de su clave.

Bloqueos A1/A3/A7: faltan sesión autenticada real, inventario de ese flujo y entrenamiento real en ambiente/cuenta autorizados; no se sustituyeron silenciosamente por mocks ni se usaron credenciales de capturas. Gate documental de §8 sigue sin respuesta: no se editaron entradas generales de SOT. Vista local para UAT/manual: `http://127.0.0.1:4187/aunara/`, artifact Pages restaurado. Sin stage, commit, push o deploy; los 11 archivos de implementación/pruebas/assets y este SDD quedan locales sin commit, conservando todo dirty previo. No autorizados para entrega final mientras revisión no sea APPROVED.

Inventario observado antes de publicar este cambio: visita invitada nueva a `https://ac-setroc.github.io/aunara/` en Chromium aislado, sin cuentas ni valores de credenciales. Cookies observadas: ninguna en esa visita. Nombres de localStorage: `repbook-language`, `repbook-profile-name`, `repbook-favorites`, `repbook-workout`, `repbook-training-tracks`, `repbook-active-track`, `repbook-training-tracks-initialized`, `repbook-health-profile`, `repbook-weekly-checkins`. Cache API: `aunara-project-shell-v1`. Orígenes de peticiones del home: solo `https://ac-setroc.github.io`. No extrapolar a sesión autenticada, otros flujos ni proveedores.

Inventario por fuente: claves `repbook-*` persisten sin TTL fijo; preferencias/estado y, según datos/consentimiento, información personal/de salud. Nueva clave `aunara-storage-notice-v1` guarda únicamente reconocimiento mínimo, sin TTL fijo, hasta eliminación del navegador o futura versión del aviso. SDK Supabase usa patrón `sb-<ref>-auth-token` y sufijos auxiliares `-code-verifier`/`-user` para autenticación; no se leyeron sus valores. El ciclo de sesión corresponde al SDK, sin plazo local único. Cache de recursos/respuestas GET del origen/base de la app permanece hasta actualización de versión o eliminación/evicción del navegador. La verificación de sesión autenticada real requiere un entorno/cuenta autorizados; no se utilizará la contraseña de una captura.

Actualización posterior, 2026-10-01 `[AUNARA/codex · GPT-5]`: el Operator aprobó la [Enmienda 1](SDD-002-enmienda-1-almacenamiento-y-cierre.md), incluido el gate documental acotado. La protección de escritura compartida quedó implementada y revisada independientemente: 167 pruebas Vitest + preparación, directorio 4, guards 4, typecheck, builds raíz/Pages y allowlist de 31 archivos PASS. Las 32 combinaciones UI Chromium/WebKit × escritorio/móvil × ES/EN × normal/denegado × raíz/Pages pasaron. El baseline aislado reprodujo el blanco y el mismo HEAD con solo la protección quedó operativo; el bloqueo técnico A2 anterior queda resuelto, sin borrar ese registro histórico. Sigue REJECTED el cierre global por inventario autenticado, login/entrenamiento reales y revisión del responsable pendientes. No hay stage, commit, push ni deploy. La frontera posterior a almacenamiento se congeló para ejecutar SDD-003 por separado; no prueba retrospectivamente todos los bytes previos de los 11 archivos originales.

## 9. Decisiones del Operator, supuestos y pendientes

Decisiones propuestas para aprobar junto al SDD:

1. Aviso **informativo no bloqueante** y ventana cookies/almacenamiento, sin nueva aceptación de T&C en cada visita y sin mezclar autorización de salud.
2. Reutilización del crédito de ATS: «Desarrollado por / Developed by», wordmark AC Setroc exacto, sin link inventado.
3. Corrección puntual del hosting a GitHub Pages, conservando versión/fecha jurídicas; cualquier reconsentimiento o revisión contractual material queda separado.
4. Inventario verificatorio como condición del copy final y revisión de su suficiencia por el responsable; no declarar cumplimiento jurídico integral.
5. Allowlist de §2 y matriz obligatoria de §7; entrega documental general tiene su gate adicional de §8.

Pendientes verificatorios, no hechos cerrados: inventario completo de cookies/almacenamiento de infraestructura y duración de cada mecanismo; revisión de copy final por responsable; disponibilidad de entorno/cuenta autorizados para auth real; ejecución WebKit desktop/móvil ES/EN; UAT del Operator. Si una revisión exige autorización previa distinta al aviso para alguna finalidad existente, este SDD no la implementa por inferencia: requiere decisión y alcance nuevo.

Reporte adicional del Operator (2026-10-01), fuera del alcance de implementación: falta un acceso visible a recuperación de contraseña en el formulario normal de login/registro. Inspección actual de `src/components/AccessPanel.tsx` confirma que el enlace de recuperación solo aparece en la rama de cuenta existente detectada, no en el formulario normal. También quedan pendientes los errores que persisten al alternar crear cuenta/iniciar sesión y su traducción/validación de correo. No modificar autenticación bajo SDD-002; preparar alcance específico para resolver estos defectos. No copiar contraseñas ni otros valores de credenciales de capturas al repositorio.

Supuestos acotados: el PNG usado por ATS es el activo que el Operator quiere reutilizar y tiene derechos para ello; no hay URL de marca autorizada para el crédito; el nuevo reconocimiento no es una base de autorización jurídica. La identidad del responsable/contacto se conserva porque este pedido no ordena revisarla.

## 10. Definición de terminado

La **especificación** está preparada cuando este nuevo SDD contiene estado real, límites, criterios y decisiones, y está presentado al Operator. No equivale a funcionalidad entregada.

La **implementación** solo estará terminada con aprobación explícita previa del SDD, A1–A9 demostrados, matriz requerida PASS (incluido WebKit), revisión independiente APPROVED, SOT actualizada dentro del gate documental aprobado y commit local aislado; sin modificaciones fuera de alcance. Pendientes jurídicos o inventario faltante no se disfrazan de cumplimiento.

La publicación/cierre del producto requiere autorización posterior de push/deploy y UAT/cierre del Operator. Aprobar este SDD no concede esos permisos.
