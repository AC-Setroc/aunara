# SDD-003 — Enmienda 1: recuperación contextual y mensaje honesto

Versión 0.1 · 2026-10-02 · Estado: **Implementada localmente; revisión REJECTED por evidencia WebKit y UAT real pendientes**.
Origen: `[AUNARA/codex · GPT-6.1 Sol]`. Enmienda [SDD-003](SDD-003-acceso-y-recuperacion.md), preserva A1–A3/A5–A7 y sus pendientes globales.

Aprobación del Operator 2026-10-02: «Aprobado con la primera propuesta de slogan.» Aprueba ambas enmiendas presentadas. Se activa la allowlist y supersesión parcial de A4 descritas aquí; sin autorización de publicación ni operaciones reales de cuentas/correos. Frontera inicial de archivos solapados y NO-TOCAR: `/private/tmp/aunara-uat-amendments-boundary.266FLD`.

## 1. Problema y resultado deseado

UAT del Operator del 2026-10-02: crear cuenta ofrece recuperar antes de saber si hay una cuenta; login inválido necesita una orientación específica con recuperación accionable; la solicitud se informa procesada pero no llega el correo. Debe quedar claro qué puede afirmar la interfaz, y qué requiere diagnóstico/entrega real.
Resultado: alta sin recuperación genérica; recuperación contextual solo ante conflicto ya detectado por signup; login conserva recuperación voluntaria y agrega la acción en el error de credenciales. La respuesta de recuperación nunca acredita cuenta existente, envío ni entrega.

## 2. Alcance y NO-TOCAR

Ahora se autoriza **solo crear este documento**. Implementación futura únicamente tras aprobación explícita:

| Archivo exacto | Límite permitido |
|---|---|
| `src/components/AccessPanel.tsx` | Visibilidad create/login; copy contextual ES/EN; acción semántica en invalid credentials; feedback solicitado separado de conflicto. Extensión tipada aditiva de `CloudAccessState` solo si necesaria para identificar el error/provenance sin comparar strings. Validación compartida local antes de cada clic de recuperación. |
| `src/hooks/useCloudSync.ts` | Copy de credenciales/recuperación, exposición tipada mínima de clasificación auth ya existente; dejar de asignar cuenta existente como resultado de reset aceptado. Preservar requests, ramas signup y mecanismos de error/generación/deduplicación. |
| `src/styles.css` | Solo selector local del botón/enlace del mensaje auth si el estilo existente no sirve: foco, contraste, wrap. Ningún rediseño o CSS fuera de ese mensaje. |
| `src/components/AccessPanel.test.tsx` | Casos de visibilidad, copia exacta, semántica/clic/teclado, validación y regresiones cercanas. |
| `src/hooks/useCloudSync.test.tsx` | Clasificación/provenance mínima, reset neutro sin falsa existencia y conservación de rate/error/generación/dedup. |
| `src/components/AppFlows.test.tsx` | Integración acotada de los estados/callback existentes y regresión footer/legal. |
| `AUNARA_SOT/sdd/SDD-003-enmienda-1-recuperacion-contextual.md` | Aprobación, evidencia, diagnóstico sanitizado y estado. |
| `AUNARA_SOT/sdd/SDD-003-acceso-y-recuperacion.md` | Solo marcar A4/par de frases de §2/§4 superados en visibilidad create por esta enmienda, conservar historia y recibos. |
| `AUNARA_SOT/02-ESTADO-ACTUAL.md` | Hunk de estado/bloqueos de esta enmienda, sin absorber dirty. |
| `AUNARA_SOT/03-HISTORIA-Y-BACKLOG.md` | Una entrada nueva arriba, sin reescribir anteriores. |
| `AUNARA_SOT/PENDIENTES.md` | Solo recuperación contextual/diagnóstico de correo y UAT pendiente. |

NO-TOCAR: `src/App.tsx` de producción (ya transmite objeto cloud y callback); APIs/calls auth, signup account lookup, backend/RLS/tablas/permisos, client Supabase, URLs/redirects, SMTP/DNS/templates/settings/secrets, cuentas/correos reales sin permiso propio, sync/bootstrap/cloudStore, datos/limpieza/logout/exportación/borrado; entrenamiento, consentimientos legales/salud, versión jurídica, almacenamiento, footer/assets/SDD-002, worker/PWA/Pages, config/deps/lockfiles. No service-role en browser, endpoint nuevo, consulta de existencia ni enumeración durante typing/blur. Preservar dirty previo, referencias privadas y docs ajenos. Cualquier cambio operativo para correo requiere diagnóstico probado y gate separado.

### Cambio explícito respecto del SDD aprobado

Esta enmienda **supersede A4 y las frases de §2/§4 que exigen recuperación visible «en ambos modos», solo respecto de create**. Login retiene recuperación visible normal. Los restantes requisitos de A4 (clic explícito, correo válido, sin contraseña/checkbox, deduplicación, cero signup/login, cero reset al escribir/cambiar modo) se conservan y se endurecen mediante C1–C7. No borrar ni declarar falsos los recibos históricos: describen la revisión de la versión anterior.

## 3. Estado real de partida y diagnóstico

Fuente fresca 2026-10-02, no inferencia desde documentación:

- `src/components/AccessPanel.tsx:141-160`: correo público/trim, limpieza de modo y `requestRecovery()` ya validan; escribir correo en `:394` no llama auth.
- `AccessPanel.tsx:309-338,455-456`: rama `existingAccountEmail` con recuperación directa y texto anterior; botón de recuperar incondicional en formulario normal de ambos modos. La rama directa no reutiliza la validación local. Mensaje genérico se renderiza como texto, no como acción.
- `src/hooks/useCloudSync.ts:60-89,100-144,580-581`: invalid_credentials clasificado como `credentials`; copy anterior «Revisá tu correo y contraseña y volvé a intentar.»; clasificación/provenance/generación internas, panel recibe `message` string. No detectar tipo de error comparando traducciones.
- `useCloudSync.ts:301-337`: signup existente detecta `data.user?.identities?.length === 0`; conservar exactamente esa rama y su respuesta autoritativa actual, sin añadir búsqueda de cuenta. Una respuesta opaca no autoriza afirmar existencia por heurística.
- `useCloudSync.ts:401-433`: reset conserva redirect actual, dedup `resetPending`, try/catch/finally y clasificación; tras respuesta sin error asigna `setExistingAccountEmail(email)` en `:425` y `requested`. **Reset aceptado no demuestra existencia**: provoca rama de «cuenta ya registrada» sin evidencia propia. Separar estado solicitado de conflicto originado en signup.
- `AccessPanel.test.tsx:69-94` exige hoy recuperación en ambos modos; actualizar solo esa expectativa superada. `useCloudSync.test.tsx` ya cubre error tardío, provenance, traducción, dedup y liberación de transporte; mantener esas garantías.

Diagnóstico readonly aportado por coordinador, ventana consultada de 24h: `/recover` POST 200 ×1; `/token` 400 `invalid_credentials` ×4; signup 400 `email_address_invalid` ×1. No se observaron errores de correo en esa evidencia, lo cual **no demuestra ausencia**, envío o entrega ni identifica causa de no recepción. Sin correos/datos privados en este documento. Metadata SMTP/proveedor, eventos de envío/entrega, bloqueos y carpeta spam permanecen pendientes si no están accesibles/verificados. No afirmar «es SMTP», rate-limit, DNS o bandeja como causa sin evidencia.

Consulta posterior solo de conteos sobre el correo indicado por el Operator: `matching_accounts = 0`, `confirmed_accounts = 0` en el proyecto Aunara consultado; metadata de URL cliente local coincide con ese proyecto. No se registran correo, claves, filas de usuarios ni valores de sesión. Es una foto actual, no prueba retrospectiva de cada request. Es **consistente con** los invalid_credentials y recovery200 sin correo: la [fuente primaria de Supabase Auth, Recover](https://github.com/supabase/auth/blob/master/internal/api/recover.go) devuelve 200 vacío si no encuentra usuario antes de llegar a envío. No demuestra fallo de SMTP, ni autoriza cambiarlo, ni acredita la versión exacta desplegada del servidor. Para UAT de recuperación se necesita primero una cuenta válida existente/confirmada en el entorno autorizado; creación y envío/confirmación manual requieren permiso propio, no se ejecutan por esta spec. SMTP sigue no verificado; no se infiere necesidad de arreglo de infraestructura.

## 4. Diseño

### Alta y conflicto existente

Formulario `create` normal no muestra recuperación, aunque se escriba un correo con formato válido; cero consultas de existencia durante typing/blur/cambio de modo. Tras el submit signup y la rama existente ya implementada, conservar correo visible y opción de ingresar; cambiar orientación a:

- ES: «Este correo ya está registrado. ¿Querés recuperar tu contraseña?»
- EN: «This email is already registered. Would you like to recover your password?»

La pregunta acompaña un control semántico «Recuperar contraseña / Recover password». Solo ese clic solicita reset con correo validado/trim; no dispara automáticamente reset por detectar conflicto. Una respuesta desconocida/no concluyente sigue comportamiento neutral actual. No nuevas APIs de account lookup.

### Login inválido y recuperación explícita

Login conserva botón normal «Recuperar contraseña / Recover password». Para un error real clasificado `invalid_credentials` de login, copy exacto:

- ES: «Tu correo o contraseña no coinciden con los datos registrados. Intentá de nuevo o recuperá tu contraseña»
- EN: «Your email or password do not match the registered details. Try again or recover your password»

La frase final «recuperá tu contraseña / recover your password» es botón `type="button"` (no span clickable; o enlace solo si tiene destino real). Texto leído completo igual al copy exacto, sin duplicación. Accesible por Tab/Enter/Espacio, con nombre/foco/contraste visibles y anuncio comprensible. `Intentá de nuevo` invita a reintentar login, sin enviarlo automáticamente.

Usar discriminante aditivo mínimo de la clasificación auth interna (por ejemplo `authErrorKind?: "credentials"`) y modo login; nunca parsing de `cloud.message`, ni convertir un error sync/desconocido/429 en credenciales. Proteger provenance existente: un error de signup/rama ajena no gana acción de login por coincidencia textual. Exponer solo metadata necesaria, no códigos/raw privados ni un rediseño del controlador. Al cambiar idioma conserva el tipo y traduce; cambio de modo mantiene limpieza/generación actuales.

Todos los disparadores (normal login, error y conflicto) usan validación local equivalente; vacío/dominio incompleto/espacios muestra ayuda enfocada y cero requests. Recovery no exige contraseña/nombre/checks. Pendiente deshabilita acciones y conserva dedup hook; escribir, cambiar modo, recibir error/conflicto o mensaje solicitado no manda correo.

### Solicitud procesada no es cuenta existente ni entrega

Dejar de crear `existingAccountEmail` por respuesta de reset. Ese estado solo procede de detección signup ya existente (o se conserva sin sobrescribir si el conflicto era conocido antes del clic). `passwordRecoveryState === "requested"` representa exclusivamente solicitud aceptada por la API, no cuenta ni email enviado. Renderizar feedback solicitado como estado distinto; no titularlo cuenta registrada si no provenía de signup. Después de conflicto ya autoritativo puede conservarse el correo/opción de ingresar, sin usar reset como prueba nueva.

Copy temporal neutral explícito hasta completar diagnóstico/UAT:

- ES: «Solicitud de recuperación procesada. Esto no confirma que el correo se haya enviado o entregado. Si recibís las instrucciones, revisá tu bandeja de entrada y spam. Si no llegan, podés intentar nuevamente más tarde.»
- EN: «Recovery request processed. This does not confirm that an email was sent or delivered. If you receive the instructions, check your inbox and spam folder. If they do not arrive, you can try again later.»

No auto-reintentos ni override de rate-limit; conservar error seguro ES/EN y bloqueo pendiente actual. La ruta `PASSWORD_RECOVERY` → nueva contraseña y éxito posterior siguen intactas.

### Correo no recibido: frente condicionado

Continuar diagnóstico solo lectura de metadata/logs autorizados, sanitizando valores. Distinguir API aceptada, generación del correo, aceptación por proveedor y entrega/rechazo; ausencia de evento no prueba el siguiente paso. No efectuar envíos de prueba ni abrir mensajes privados sin autorización específica. Si la causa exige SMTP, DNS, templates o settings, presentar hallazgo y enmienda/orden operativa aparte antes de cambiar nada. Este documento no autoriza ni garantiza arreglar entrega backend; el pendiente permanece abierto.

## 5. Alternativas descartadas

No esconder recuperación en login; no lookup/enumeración por correo tipeado; no reset automático tras error/signup; no atribuir existencia por 200 de recovery; no matching de strings para insertar acción; no «correo enviado» o «entregado» sin evidencia; no modificar SMTP/URLs para probar una hipótesis ni rebajar UAT real.

## 6. Riesgos y mitigación

Provenance compartida puede confundir sync con auth: discriminante mínimo y negativos. Estado solicitado puede volver a falso conflicto: probar login reset y conflicto signup como casos diferentes. Async/errorclear/generación/dedup/rate ya funcionan: conservar algoritmos y pruebas; si se precisa cambiarlos, volver al gate. Botón dentro de formulario puede ejecutar login: `type="button"`, spies de cero signup/login. CSS local podría alterar mensajes ajenos: selector acotado al control, revisión diff/visual.

## 7. Criterios falsables y matriz

- **C1:** Create normal vacío/válido/inválido sin recuperación ni consultas de existencia; escribir/blur/cambiar modo hacen cero requests auth/reset. Solo respuesta de la rama signup existente muestra copy exacto ES/EN y controles; detección sola no resetea.
- **C2:** Login normal conserva recuperación. Invalid_credentials muestra copy exacto y frase final accionable por rol/teclado; otros errores, sync y éxitos no se reinterpretan. Idioma cambia traducción sin perder tipo; modo limpia solo auth según A1/A2.
- **C3:** Clic explícito válido en cada disparador realiza exactamente un reset, cero login/signup, correo trim/case intacto; no requiere nombre/password/consent. Vacío/incompleto/espacios inválidos dan cero requests y ayuda accesible. Doble clic pending da un request; transporte fallido libera bloqueo; 429 conserva error, sin reintento automático.
- **C4:** Reset aceptado desde login no produce copy/título ni estado de cuenta registrada; solo feedback neutral exacto ES/EN. Conflicto previo autoritativo no pierde su correo/opción de ingreso. Ni respuesta API ni feedback prueban envío/entrega.
- **C5:** Generación/errorclear/provenance, respuesta tardía, éxito/sesión legítima, sync-error, pendingVerification, reenvío, ready/update, aceptación legal obligatoria y salud opcional/separada mantienen regresiones A1–A3/A5–A7.
- **C6:** Revisión visual en computador y móvil ES/EN: estados create normal/conflicto, login normal/error, reset pending/procesado/error429/transporte, confirmación y ready. Ningún texto cortado/overflow, acción/foco visible y reachable; legal sobre signup conserva valores/foco.
- **C7:** Diff solo allowlist; cero backend/settings/deps/secrets/assets/dirty absorbido. Diagnóstico y UAT correo pendientes explícitos: no cerrar por mocks ni logs 200.

Checks frescos de revisión independiente: typecheck, suite completa `npm test`, directorio, guards Pages/worker con negativos y normal, builds `/` y `/aunara/`, allowlist artifact, diff-check. Lint N/A por ausencia de script, no instalarlo.
UI obligatoria **Chromium y WebKit** × 1440×900/375×812 × ES/EN × bases raíz/Pages; revisar además 1050×900 intermedio/tablet y regresión del pie a 1051/1049 si se comparte build con la enmienda footer. Capturas sanitizadas del acceso en todos los estados C6, del pie y ventanas cercanas; inspección visual computador/móvil, no solo geometría. Mocks de auth etiquetados y tráfico externo bloqueado en automatizados. WebKit ausente bloquea; Safari real en UAT cuando disponible.
Negativos en copia aislada: reinstalar recuperación en create → C1 rojo; asignar existingAccountEmail tras reset → C4 rojo; convertir acción en submit/quitar validación → C3 rojo; quitar limpieza/generación → regresiones previas rojas. Restituir normal PASS, no fuente viva. Network/spies prueban cero requests negativos, no solo ausencia de pantalla.
UAT real separado y bloqueante: permiso explícito del Operator para cuenta/sesión y cada envío de correo, credenciales ingresadas manualmente, primero comprobar cuenta válida/confirmada en el entorno autorizado (o crear/confirmar manualmente solo con permiso), después confirmar solicitud/recepción/retorno/update/login/sync con evidencia sanitizada. No usar contraseñas de capturas. El reporte actual de no recepción sigue abierto; no declarar «entregado» por API 200 ni aceptación global por simulaciones.

## 8. Entrega y frontera documental

Aprobación exacta → desarrollo acotado → revisión independiente fresca (máximo tres iteraciones) → entrega. La spec original y sus recibos quedan históricos; marcar superado solo requisito de create de A4. Proponer hunks mínimos en 02/historia/PENDIENTES: orientación contextual en revisión/implementada, diagnóstico sin causa confirmada y entrega real/UAT pendientes. **Ahora solo este documento nuevo**, sin esos hunks ni edición del SDD previo.
Snapshot/hash de archivos solapados antes de implementar; comparar delta contra dirty actual de SDD-003 y frontera de SDD-002. Commit local enfocado después de APPROVED, excluyendo footer/almacenamiento y otros dirty. Si no hay aislamiento seguro, pedir decisión; sin stage/commit/push/deploy en fase spec, sin acciones reales de cuenta/correo por aprobación del código.

## 9. Decisiones y pendientes del Operator

Aprobar/ajustar alcance exacto, supersesión parcial de A4, copy ES/EN y futuros hunks documentales. Diagnóstico de causa de no recepción continúa pendiente; cualquier solución externa tiene gate propio. Autorizar específicamente UAT real/envío y su entorno cuando corresponda. La aprobación de la enmienda no autoriza esos efectos externos.

## 10. Definición de terminado

Aprobación explícita, C1–C7/regresiones demostrados, revisión visual computador/móvil y matriz Chromium/WebKit ES/EN completas, revisión independiente APPROVED, documentación mínima y commit aislado; cierre del Operator. Entrega real no resuelta/validada mantiene abierto el pendiente global de recuperación aunque el frontend pase. No reducir requisitos originales de inventario/entrenamiento/auth UAT.

Registro inicial de propuesta: únicamente documento nuevo, fuente y metodología leídas, logs/conteos readonly recibidos sin datos privados; no implementación, pruebas de implementación, stage/commit/push ni cambios de backend. No declaraba recuperación corregida ni causalidad histórica definitiva del correo ausente.

Registro de desarrollo tras aprobación: recuperación contextual, acción semántica de credenciales y feedback neutral implementados en allowlist; reset aceptado ya no establece cuenta existente. Desarrollo declara 238 pruebas Vitest + preparador, tipos, builds y guardas PASS; negativos aislados de visibilidad, validación, falsa existencia y generación volvieron rojo y normal restaurado PASS. Recibo local `/private/tmp/aunara-uat-amendments-dev-receipt.md`; revisión independiente aún en curso. No se cambió backend ni se enviaron correos/crearon cuentas. UAT real y entrega de correo siguen abiertos; sin commit/push/publicación.

Revisión independiente posterior: REJECTED por evidencia obligatoria incompleta, sin defecto de producto confirmado. Raíz Chromium/WebKit y Pages Chromium verifican estados y recuperación explícita; Pages WebKit se detuvo ante Tab que omite controles. Negativos aislados submit2, recuperación create15, validación18, falso conflicto1 y generación2 fallaron; restauración93 PASS. Recibo `/private/tmp/aunara-uat-amendments-independent-review.md`. Diagnóstico acotado posterior: Tab omite todos los botones, Option-Tab alcanza la acción; control visible/habilitado con tabIndex0, consistente con preferencia `tabsToLinks` nativa. No se cambió preferencia del sistema ni fuente, ni se aprobó por foco directo. Falta completar matriz WebKit con entorno de navegación apropiado y UAT real autorizado. No commit/push/publicación; entrega de correo no demostrada.
