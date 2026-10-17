# SDD-017 — UAT17: presentación, menú y retorno de acceso

2026-10-17 · v0.1 · **En revisión del Operator — PENDIENTE APROBACIÓN. Solo especificación; no implementado.**

`[AUNARA/codex · modelo no expuesto]` — [Reporte UAT sanitizado](../handoffs/UAT-2026-10-17-resultados-operator.md). ID017 libre comprobado mediante inventario de `AUNARA_SOT/sdd/`; candidato aislado `/private/tmp/aunara-sdd015-016-candidate`, HEAD `aa4cf20`, detached y limpio antes de esta ronda. No es el canónico. Aprobaciones técnicas locales de SDD-013/014 no equivalen a UAT humana aprobada ni activación remota.

## 1. El problema, en el idioma del Operator

El footer blanco ocupa demasiado espacio y el slogan no se percibe centrado bajo el conjunto símbolo+nombre. El invitado encuentra Inicio duplicado y destinos en un orden distinto al deseado. El idioma debe cambiarse con un botón ES/EN visible arriba a la derecha del menú, no con un selector nativo. El texto opcional de salud mantiene un recuadro que debe desaparecer conservando su color y su función opcional. Los correos reales de confirmación y recuperación siguen llegando con apariencia/remitente predeterminados y llevan a producción aunque se solicitaron desde desarrollo. Además el servidor local no está disponible en esta revisión.

Resultado: presentación compacta y ópticamente alineada, navegación clara, consentimiento intacto y acceso que regresa al origen/base solicitados. La marca de correo requiere una operación global separada; no se promete resolverla con un push de frontend.

## 2. Alcance y fuera de alcance

### Fase A propuesta: desarrollo local después de aprobación

Allowlist exacta; solo hunks relativos a los comportamientos de este SDD:

| Archivo | Cambio permitido |
| --- | --- |
| `src/App.tsx` | Inventario/orden guest del menú, suministro del toggle de idioma al encabezado del drawer, envoltorios semánticos mínimos del footer si necesarios. No lógica de entrenamiento ni Auth. |
| `src/components/NavigationMenu.tsx` | Slot de control de idioma en encabezado; preservar portal, foco, Escape/backdrop, cierre y scroll lock. |
| `src/styles.css` | Solo selectores acotados del drawer/idioma, footer y consentimiento opcional de alta. Neutralizar herencias únicamente en esas superficies, no modificar reglas globales de formularios/tokens. |
| `src/components/NavigationMenu.test.tsx` | Orden/posición de slot y regresiones de interacción del drawer. |
| `src/components/GuestApp.test.tsx` | Orden guest y toggle ES/EN único, ausencia de select nativo para idioma. |
| `src/components/AppFlows.test.tsx` | Regresiones de navegación autenticada, footer y persistencia del idioma. |
| `src/components/AccessPanel.test.tsx` | Opcional/required, texto y estado del consentimiento preservados; regresiones de alta sin autorización de salud. |
| `AUNARA_SOT/sdd/2026-10-17-sdd017-revision/README.md` | Recibo futuro de pruebas/revisión y criterios, sin afirmar resultados antes de ejecutar. |
| `AUNARA_SOT/sdd/2026-10-17-sdd017-revision/visual-checks.mjs` | Harness futuro de medición/visual compilado con datos sintéticos, sin llamadas remotas reales. |
| `AUNARA_SOT/sdd/2026-10-17-sdd017-revision/resultados/` | JSON/capturas sanitizados de esa revisión, sin PII ni tokens reales. |

Documentación permitida: este SDD, reporte UAT17, `02-ESTADO-ACTUAL.md`, `PENDIENTES.md`, entrada nueva de `03-HISTORIA-Y-BACKLOG.md`, `handoffs/HANDOFF-2026-10-17.md`, índice de handoffs y, al acreditar un arranque, hunk operativo de `06-RUNBOOK.md`. No reescribir evidencia histórica.

### Fase B: diagnóstico de retorno; no permiso tácito para editar Auth

Reproducir primero desde el origen real: comparar el `redirect_to` solicitado con el enlace recibido y los saltos efectivos (solo evidencia sanitizada), y comprobar allowlist y plantilla remota mediante inspección autorizada. El hook ya solicita origen/base actuales. Si el defecto es configuración, presentar diff exacto y autorización operacional antes de escribir. Si exige modificar `src/hooks/useCloudSync.ts`, `src/lib/publicBase.ts`, callbacks o sus pruebas, **detener y enmendar allowlist** con causa reproducida, criterios y aprobación nueva. La guarda `scripts/auth-email-templates.node-test.mjs` fija hash del hook: una enmienda deberá autorizar únicamente el avance del hash al código revisado y conservar todos los negativos; no saltar/relajar guardas.

### Fase C: operación remota de correo, gate independiente

Reutilizar las dos plantillas ya existentes de SDD-014 y Zoho/noreply reportados. Antes de aplicar SMTP, remitente `Aunara <noreply@aunaratraining.com>`, plantillas o Redirect URLs: identificar proyecto compartido y alcance en producción, baseline privado recuperable, diff propuesto, ventana, rollback, autorización explícita y destinatarios controlados autorizados. Secretos solo en canal/configuración privada segura; nunca chat/repo/log/captura. No cambiar Site URL a localhost ni forzar producción desde plantilla. DNS solo con diff y permiso propios si realmente necesario. Esta fase **no queda autorizada** por aprobar A ni por el standing push documental a dev.

### NO-TOCAR

Canónico dirty `/Users/alejandro/AI Projects/Personal/aunara`, `.env.local`, `AUNARA_SOT/reference/`, bytes/proporciones de `public/brand/`, `src/components/WorkoutPanel.tsx`, editor/rutinas/perfil/onboarding, runtime y contratos cloud de SDD-016/H-03, snapshots/almacenamiento/sync, usuarios/datos/sesiones, RLS/esquema/migraciones, `src/lib/privacy.ts`, versión/fecha legal, `src/components/LegalPanel.tsx`, `ConsentGate.tsx`, semántica/finalidades/estado del consentimiento, tokens globales, dependencias/lockfile/config/workflows/service worker, main y publicación. No borrar cuentas ni almacenamiento para simplificar UAT. Sin rediseño general, nuevo slogan, contratación, daemon/LaunchAgent global ni cambios de firewall/VPN. Auth/hook/plantillas locales permanecen fuera de A.

## 3. Estado real de partida, medido y no supuesto

- `App.tsx:666–693`: se emite `Inicio / rutas`, después otro `Inicio` para guest, luego acceso y ayuda condicional; idioma es `<select>` en `panelContent`. `NavigationMenu.tsx:74–91` agrupa destinos/cuenta/configuración: ordenar un array sin revisar grupos no basta para probar orden visual. El wordmark y botón de cierre están en `navigation-head`.
- `App.tsx:915–927`: footer común usa lockup público con símbolo+wordmark, slogan vigente ES/EN, tres enlaces legales, crédito y atribución condicional. No reemplazar slogan ni crédito.
- `styles.css:475` conserva min-height160/padding36px4vw; `:1131` impone padding34px20px100px en móvil; bloque blanco `:1481–1501` no reinicia ese padding/min-height y añade gaps24/margin12; `:1688` vuelve a imponer padding-bottom100px. Son fuentes de espacio acumulado en CSS, no medición de una captura nueva.
- `styles.css:1492–1494` documenta tinta Aunara10..744 sobre canvas760 y compensación existente. El SVG tiene viewBox760×178 con subimágenes y descriptor; caja centrada no prueba centro del conjunto visible. Preservar activo y medir rasterizado/tinta, no desplazar a ojo ni centrar solo palabra excluyendo símbolo.
- `AccessPanel.tsx:419–454`: alta tiene `create-account-consents`; opcional es label con input y un span. `styles.css:889` aplica a **todo** `.access-login label > span:last-child` altura48/padding/border/background; `:1603–1607` lo vuelve a estilizar. `:1503` limpia contenedor y `:1504` solo da color al label opcional: no neutralizan el span. Riesgo concreto de recuadro persistente; corregir con override más específico solo del opcional, no alterando inputs de email/password ni consentimiento obligatorio.
- `useCloudSync.ts:412/478/509` ya usa `publicBaseUrl(BASE_URL, window.location.origin)` en alta/reenvío/recovery. `src/lib/publicBase.test.ts:6–14` cubre prod/localhost/rollback. No hay evidencia nueva de bug frontend en retorno. Configuración efectiva remota y cadena del enlace real **no inspeccionadas** en esta fase; no atribuir causa final a allowlist por inferencia.
- Servidor5173 sin listener es hallazgo operativo comunicado por coordinación, no causa demostrada. Config git común ausente y timestamps temporales no demuestran quién detuvo el proceso ni por qué. No hay nueva UI ejecutada aquí.
- `package.json: scripts` no declara lint (inventario de scripts leído); typecheck/test/build y directorio sí. `scripts/auth-email-templates.node-test.mjs:19–44/164` fija hash del hook y negativo de consentimiento. No debilitarlo para acomodar cambios.
- Remoto consultado por coordinación con URL explícita: dev `aa4cf20aca79ea3b3c965068642feab178ddfc07`, main `dfffa873a2a29ee1535c49149f92a734c873923d`. `git remote -v` vacío en candidato; no modificar config como parte del SDD.

## 4. Diseño

**Footer:** mantener blanco, todo contenido, identidad y proporciones. Reducir espacio decorativo: propuesta de padding vertical24px escritorio/20px móvil, gaps12px, margen de crédito0; ningún min-height heredado debe imponer vacío. Solo cuando existe control fijo inferior, reservar su altura realmente medida + safe area +12px, nunca100px incondicional al invitado. Slogan centrado bajo tinta de símbolo+wordmark completo, diferencia≤2CSSpx; crédito mantiene sus criterios ópticos previos. Registrar medidas antes/después en la misma variante.

**Guest:** orden único `Inicio → Rutas → Ingresar → Ayuda / instalación` (EN `Home → Routes → Log in → Help / installation`). Inicio lleva al comienzo de home; Rutas lleva a la sección de rutas de esa misma pantalla (`tracks-section` existente), sin crear ruta ni entrenamiento nuevo, sin conceder acceso; Ingresar abre acceso actual. Ayuda conserva comportamiento y condición de instalación actual. No mantener fila combinada Inicio/rutas ni un segundo Inicio. Menú autenticado conserva destinos/acciones/condiciones actuales; no heredar accidentalmente el inventario guest.

**Idioma:** en cabecera del drawer, junto al extremo derecho del lockup y antes de las filas/Inicio; conservar cierre en esa cabecera sin solapamiento. Un botón `ES`/`EN` muestra idioma actual, nombre accesible localizado anuncia cambio al otro; clic/Enter/Space alterna el estado existente, mantiene drawer abierto y foco en control, persiste por mecanismo actual. Sin `<select>` nativo de idioma ni control duplicado abajo. Alcance del control compartido también en autenticado, sin mover idioma a la barra exterior cerrada. Target44×44 mínimo, contraste4.5:1 y foco visible.

**Opcional:** retirar borde/fondo/altura fija/sombra del texto opcional y contenedor de alta cuando generen recuadro; mantener texto teal, saltos naturales, checkbox y foco visibles, color4.5:1. No cambiar required/legal ni valores grant/decline/revoke o tratamiento de salud.

**Servidor:** con orden de restauración vigente, identificar puerto/cwd/versión antes de iniciar, usar copia aislada y receta Vite del handoff16 con envDir de solo lectura, strictPort5173 y sesión acotada. No copiar secretos ni matar procesos ajenos; si ocupado, resolver dueño o parar. Acreditar HTTP local/LAN, UI fresca y fuente servida, informar LAN actual, sesión efímera y Mac despierta; no prometer persistencia indefinida.

## 5. Alternativas descartadas

Cambiar SVG para compensar CSS; centrar solo canvas; rebajar todo padding sin reservar controles fijos; retocar selectores globales de inputs; simular botón que abre select nativo; duplicar estado de idioma; fijar retorno a prod/localhost; atribuir entrega real a preview; activar SMTP compartido por aprobar frontend; crear daemon global para ocultar caída del proceso. Todas aumentan riesgo o incumplen el pedido.

## 6. Riesgo sobre lo que hoy funciona

CSS compartido puede romper formularios/móvil; usar selectores estrechos y comparación antes/después. Cambiar grupos del drawer puede omitir cuenta/logout o foco; regresión autenticada obligatoria. Menor footer puede taparse con barra fija; medir superposición y safe area. Metadatos/config Auth compartidos afectan producción sin deploy; gates B/C no se fusionan con A. Evidencia de correos puede contener tokens/PII; inspección privada y solo resultados sanitizados. SDD015/016 y H-03 no se reabren ni se declaran resueltos aquí.

## 7. Verificación: criterios falsables y matriz

| ID | Aceptación requerida |
| --- | --- |
| C17-01 | Footer blanco con padding/gaps de §4, altura menor que baseline en iguales variantes guest, sin cortes ni espacio100px incondicional; si barra fija, ningún contenido legal/crédito queda tapado. Medidas y captura completa antes/después. |
| C17-02 | Centro horizontal de tinta del lockup completo vs slogan≤2CSSpx; crédito conserva eje vertical y centrado≤2px. Src/bytes/aspect ratios/textos/enlaces/atribuciones iguales al baseline. |
| C17-03 | Guest tiene exactamente una fila por destino en orden §4, ninguna fila Inicio/rutas; Inicio/Rutas realizan destinos distintos descritos, Ingresar y ayuda conservan funciones/condición. |
| C17-04 | Toggle único en cabecera entre lockup y primera fila, nunca select de idioma; ES↔EN funciona por puntero/teclado, sin cerrar drawer ni perder foco, persiste tras reload; sin overflow/solapamiento a320px. |
| C17-05 | Opcional sin border/background/shadow/height fija de recuadro en computed style del span y contenedor; texto legible teal≥4.5:1, checkbox operable y no required; alta sin autorización sigue permitida y salud sigue sin almacenarse sin grant. Inputs email/password, legal obligatorio y errores conservan estilo/función. |
| C17-06 | Drawer portaled: lockup/hamburguesa abren, Escape/backdrop/acciones cierran, retorno/trap de foco y scroll restoration pasan; autenticado conserva todos los destinos, cuenta/privacidad/perfil/logout y entrenamiento. |
| C17-07 | Una restauración acreditada registra versión/cwd/puerto correctos, HTTP200 local/LAN y UI; Safari físico se identifica como pendiente si no disponible. Sin daemon global ni edición env/config/canónico. |
| C17-08 | Diagnóstico identifica solicitud/enlace/saltos/allowlist con resultados y límites; no declara causa sin probar. Tras gate y corrección aprobados, alta/reenvío/recovery vuelven al origen/base desde prod,localhost y LAN autorizados; inválido/usado/expirado no autentica ni permite reset indebido. |
| C17-09 | Tras gate remoto separado, confirmación/reenvío/recovery reales usan From Aunara noreply, plantillas SDD014 correctas, CTA/respaldo mismo destino, SPF/DKIM/DMARC/headers sanitizados y clientes reales según C14-02/04/05/06/07. Sin ese gate: NO EJECUTADO, no PASS. |
| C17-10 | Diff solo allowlist; NO-TOCAR/hashes preservados; suite real/miércoles, tipos, builds/guardas pasan; negativos fallan con defecto inducido y vuelven verdes restaurados. |

Matriz futura (no corrida en esta fase):

- Chromium **y WebKit**, builds `/` y `/aunara/`, ES/EN, anchos320/390/1440; guest y autenticado sintético. Footer completo, drawer abierto/cerrado, alta/formulario opcional, teclado y touch; 24 combinaciones base por estado. Capturas y mediciones de tinta revisadas visualmente, no solo DOM. Safari/iPhone físico para UAT del Operator; bloqueo WebKit impide APPROVED visual.
- Regresiones: cuenta/privacidad/tres documentos, login/crear/reenviar/recuperar simulados, legal requerido/health opcional, perfil/Salir, preferencias/idioma persistentes, edición por día015 y fail-closed remoto016 con matrices existentes sin cambiar runtime. No datos ni envíos reales por harness sintético.
- `npm run typecheck`, `npm test` real y miércoles controlado con mecanismo aislado ya documentado015, `npm run check:exercise-directory`, `npm run test:exercise-directory`, builds ambas bases y guardas existentes, `git diff --check`. Lint N/A por script ausente; no instalar herramienta. No heredar waiver013 ni convertir fallo en éxito con reloj/demora.
- Negativos sobre copias desechables: restaurar padding100→C17-01 rojo; desplazar logo>2px→02 rojo; duplicar Inicio/reordenar→03 rojo; reintroducir select→04 rojo; reintroducir borde por selector global→05 rojo; romper foco/portal→06 rojo. Restaurar y repetir verdes; controles existentes cloud016 y consentimiento permanecen intactos.
- B/C solo con autorización específica: matriz alta/reenvío/recovery × prod/local/LAN con origen registrado; recepción/click/headers en Gmail/Outlook controlados, negativos de token y allowlist seguros. Nunca provocar fallos mutando producción sin autorización. No guardar URL sensible, imagen de bandeja, correo personal ni token en repo.

## 8. Plan de entrega

1. Presentar v0.1 y esperar aprobación explícita de A y decisiones §9. Solo documentación ahora.
2. Restauración operativa autorizada puede verificarse separadamente sin dar por aprobado producto. Baseline sano antes de medir visual.
3. Implementación A por rol acotado; revisión independiente distinta del desarrollador, máximo tres ciclos. Hallazgo fuera de allowlist vuelve al gate.
4. Actualizar SOT/recibo; commit enfocado tras APPROVED técnico; integración/push de producto solo con autoridad aplicable explícita, nunca main/deploy. La orden permanente sí autoriza documentación en dev, sin secretos/dirty ajeno.
5. Diagnóstico B y propuesta operacional C separados; aplicar solo autorización exacta, revisar resultados reales y rollback si falla. No declarar correo/retorno entregados por finalizar A.
6. UAT humana y cierre reservados al Operator; no sustituir con resultados técnicos anteriores.

## 9. Decisiones que necesita el Operator

- **D17-01 pendiente:** aprobar v0.1 para A, incluyendo compactación medible, Rutas como salto a sección existente sin navegación nueva y ubicación del toggle descrita en §4, conforme al pedido del Operator.
- **D17-02 integrada en D17-01:** ubicación del toggle no requiere una pregunta de permiso adicional; la aprobación17A cubre la propuesta concreta.
- **D17-03 gate separado pendiente solo para escrituras:** diagnóstico remoto de solo lectura ya está dentro del pedido y puede ejecutarse con acceso disponible, sin obtener/exponer secretos; no requiere autorización nueva. Cambios globales SMTP/plantillas/Redirect URLs, envíos reales, impacto en producción, ventana/rollback, credencial segura y cuentas/destinatarios controlados sí requieren autorización operacional específica después de la propuesta. No volver a preguntar proveedor/noreply ya reportados.
- **D17-04 condicionada:** si diagnóstico prueba defecto de código de retorno, aprobar enmienda de archivos/guardhash antes de editar. Hoy no se pide permiso indiscriminado sobre Auth.

## 10. Definición de terminado

SPEC: diez secciones y UAT sanitizada registradas; estado **PENDIENTE APROBACIÓN**, sin implementación. A terminado técnicamente solo con C17-01–06/10 y revisión independiente, documentación y entrega enfocada; C17-07 operacional tiene su recibo propio. Pedido global no terminado sin C17-08/09 autorizados y verificados, UAT humana aprobada y cierre del Operator. Nada publicado por este SDD; pendientes remotos no se ocultan con PASS local.
