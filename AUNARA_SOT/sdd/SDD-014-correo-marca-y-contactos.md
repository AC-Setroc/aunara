# SDD-014 — Correo de marca y contactos de Aunara

2026-10-16 · v0.1 · **Desarrollo local implementado y APPROVED LOCAL, ciclo 1. Sin activación remota, UAT ni cierre del Operator.**

Actualización de entrega 16Oct: nueva orden explícita **«Sí»** autoriza integración/push únicamente a `dev`, conservando SMTP pendiente. Rebase limpio de entrega `71948e5` a `9c52809` sobre remoto documental `35b1f933`, con117 hashes revisados intactos. [Recibo de integración](2026-10-16-sdd014-revision/delivery-receipt.md#integración-autorizada-a-dev--2026-10-16). Esta orden supera las prohibiciones/pedidos de autorización de push dev en los antecedentes siguientes, no autoriza activar correo, cambiar UAT5173 ni publicar main/producción. Desarrollo y revisión siguen APPROVED LOCAL, no cierre global.

Aprobación explícita: «Dale» ante la pregunta de aprobar el desarrollo local con contactos, Zoho como proveedor reportado y dos plantillas inicialmente bilingües, manteniendo activación remota aparte. D14-03 resuelta a favor de ese alcance. Se conservan las formulaciones de propuesta siguientes como historia; no autorizan SMTP/DNS, envíos reales, push ni publicación. Desarrollo en `/private/tmp/aunara-sdd014-candidate`, desde `61610c1`, separado del worktree que sirve UAT SDD-013.

La revisión de esta entrega emitió APPROVED **local**, no aprobación global del pedido operativo: C14-01/03/08 y la parte de preview de C14-06 PASS LOCAL; C14-02/04/05/07 y clientes de correo reales de C14-06 permanecen NO EJECUTADOS hasta su gate remoto. Los controles estáticos/fixtures de enlaces o headers no se presentan como envío, token validado ni autenticación DNS reales. Esta separación aplica las fases ya previstas en §8/§10, no elimina esos criterios de la definición final de terminado.

`[AUNARA/codex · gpt-6.1-sol]` — Pedido del Operator: responsable `admin@aunaratraining.com`; soporte ES `soporte@aunaratraining.com`, EN `support@aunaratraining.com`; confirmación de cuenta y recuperación desde `noreply@aunaratraining.com`, con dos plantillas de marca. Confirmación posterior: **Zoho; noreply ya existe**. Son hechos reportados por el Operator, no comprobaciones de acceso SMTP, entrega ni configuración efectiva.

Este documento es un frente nuevo, separado de SDD-013. La aprobación técnica de su fuente `ccce932`, integración/push autorizado exclusivamente a dev y UAT pendiente no aprueban este SDD ni cambios de Auth/SMTP/producción. Se consultaron AGENTS, metodología Personal y SOT; el frente principal actualizó la metodología en este turno con resultado «Already up to date» y este frente la leyó íntegra. El número 014 y este archivo estaban libres en la búsqueda previa de `AUNARA_SOT/`.

## 1. El problema, en el idioma del Operator

Las personas deben reconocer que las instrucciones de acceso vienen de Aunara y distinguir dónde pedir ayuda o ejercer derechos de privacidad. Tener creadas las direcciones no cambia por sí solo el remitente de los mensajes automáticos ni su apariencia. Hoy el contacto configurado en el producto sigue siendo el anterior.

Resultado deseado: privacidad por admin; soporte diferenciado ES/EN; confirmación de cuenta (incluido reenvío) y recuperación con remitente exacto noreply del dominio propio y dos mensajes claros con identidad Aunara, sin alterar cómo se autentica una persona ni sus datos o autorizaciones.

## 2. Alcance y fuera de alcance

**Fase actual:** entrega local tras implementación y [revisión independiente APPROVED LOCAL](2026-10-16-sdd014-revision/review-cycle1.md). La fase original de solo SPEC quedó superada por «Dale» para desarrollo local; no hubo conexión a cuentas, correos reales ni cambios remotos. La aplicación remota requiere otro gate explícito.

Allowlist aprobada y aplicada para implementación local:

| Archivo exacto | Cambio permitido |
| --- | --- |
| `src/lib/privacy.ts` | Exclusivamente valor de `DATA_CONTROLLER_EMAIL` a `admin@aunaratraining.com`. |
| `src/components/LegalPanel.test.tsx` | Actualizar aserción del contacto y ampliar comprobación ES/EN, conservando los demás controles. |
| `docs/compliance/README.md` | Contacto vigente, decisión del 16Oct y actualización acotada del estado de ese canal; no resolver otros pendientes jurídicos. |
| `docs/compliance/retention-and-rights.md` | Reemplazar únicamente canal de solicitudes. |
| `docs/compliance/incident-response.md` | Reemplazar únicamente contacto del mismo responsable. |
| `supabase/templates/confirm-signup.html` | Nuevo artefacto local de plantilla de confirmación/reenvío. |
| `supabase/templates/reset-password.html` | Nuevo artefacto local separado de recuperación. |
| `supabase/templates/README.md` | Asuntos, copy de texto simple equivalente, soporte ES/EN, instrucciones y límites de aplicación/rollback sin credenciales. |
| `scripts/auth-email-templates.node-test.mjs` | Nuevos controles locales de contenido, enlaces y negativos; ejecución directa sin cambiar dependencias/scripts existentes. |
| `AUNARA_SOT/sdd/2026-10-16-sdd014-revision/README.md` | Nuevo recibo de revisión, matriz y evidencia sanitizada; capturas/resultados bajo esa carpeta sin tokens ni destinatarios identificables. |

Documentación de esta entrega: este SDD, `AUNARA_SOT/02-ESTADO-ACTUAL.md`, `AUNARA_SOT/PENDIENTES.md`, entrada aditiva en `AUNARA_SOT/03-HISTORIA-Y-BACKLOG.md` y [recibo local](2026-10-16-sdd014-revision/delivery-receipt.md). La prohibición original durante desarrollo de tocar esos documentos queda superada solo para esta entrega prevista; evidencia SDD-013 intacta. Colisiones o nuevos archivos fuera de allowlist vuelven al gate.

**Operación futura separada:** inspección autorizada de capacidades y estado efectivo de Zoho/Supabase; propuesta exacta de parámetros y cambios, seguida de autorización explícita para aplicar remitente/SMTP y las dos plantillas. Cambios DNS, si realmente hacen falta, se presentan uno por uno al Operator con baseline/rollback; no quedan autorizados por aprobar el desarrollo local.

### NO-TOCAR

- `src/hooks/useCloudSync.ts` y sus tests, cliente Auth, contratos, sesiones, callbacks, verificación, recovery/bootstrap, URL de retorno y políticas de contraseña. Se pueden ejecutar sus pruebas, no editar su comportamiento.
- `DATA_CONTROLLER_NAME`, `LEGAL_VERSION = "1.0"`, fecha `2026-07-29`, textos/finalidades/consentimientos y nueva aceptación/v1.1; `LegalPanel.tsx` consume la constante sin requerir edición. No cambio de responsable jurídico por cambiar su canal.
- Datos personales/salud, metadatos de autorización, almacenamiento, sincronización, RLS, migraciones, funciones de cuenta, usuarios reales y backups.
- Menú, cabecera/footer, perfiles, editor, rutinas, recomendaciones, entrenamiento, onboarding y toda implementación/evidencia SDD-013. Cuatro fallos antiguos dependientes del día permanecen fuera de este trabajo.
- Bytes/proporciones de `public/brand/`, tokens globales/CSS, `AUNARA_SOT/reference/`, dependencias, workflows, service worker, build, main/producción y despliegues. Sin crear proveedores, contratar planes, nuevo gasto, ZeptoMail ni cambiar MX.
- Sin formularios de soporte, nuevo panel, tickets, marketing, tracking, nuevas notificaciones u otras plantillas Auth (magic link, invitación, cambio de correo, etc.). Sin Send Email Hook ni localización nueva en el contrato de la app.
- Secretos nunca en código, docs, commits, capturas o chat. No enviar a cuentas/destinatarios reales sin aprobación específica de pruebas y direcciones controladas.

## 3. Estado real de partida, medido y no supuesto

Inspección de candidato aislado `/private/tmp/aunara-sdd013-candidate`, HEAD observado `d344eeb` después de entrega documental SDD-013; la fuente visual aprobada sigue referenciada por `ccce932`. No es el checkout canónico. Los documentos de estado pueden avanzar por el frente SDD-013 sin cambiar este alcance.

- `src/lib/privacy.ts:4–7`: versión 1.0, fecha vigente, mismo responsable y correo `alejandro@ac-setroc.com`. `src/components/LegalPanel.tsx:117–122` lo muestra en privacidad ES/EN; `:233–237` también en consultas de términos. Cambiar la constante actualizará ambas superficies; no sustituirla globalmente por soporte.
- `src/components/LegalPanel.test.tsx:90–98` exige el correo anterior. `docs/compliance/README.md:13–20`, `retention-and-rights.md:25` e `incident-response.md:29–32` también lo conservan; README registra que esperaba al dominio propio. Referencias históricas de decisiones/SOT no se reemplazan masivamente.
- `src/hooks/useCloudSync.ts:366–381`: signup llama Supabase y **sí guarda `language` en `options.data`**, junto con nombre y decisiones de aceptación/salud; conserva `emailRedirectTo` construido con base/origen actual. Test `src/hooks/useCloudSync.test.tsx:492–519` comprueba idioma ES y payload.
- `useCloudSync.ts:437–447` reenvía tipo signup; `:461–479` pide recuperación con `redirectTo` del origen/base actual. No envían locale nuevo en esas llamadas; tests `:556–569` y `:592–610` protegen los argumentos. La presencia de idioma en altas nuevas no demuestra localización correcta de cuentas antiguas, idioma actualizado o selección automática de plantilla de recovery.
- `src/styles.css:1–16`: teal `#063f43`, tinta `#102421`, azul `#164edf`, arena `#f5f1ea`, familia Avenir Next con fallbacks. `public/brand/` contiene lockup `aunara-training-systems.svg`, símbolos, icono y wordmark AC Setroc. Son recursos existentes, no licencia para recrearlos ni alterar los bytes.
- Búsqueda `rg` de `smtp`, `ConfirmationURL` y nuevas direcciones en `supabase/`, `src/`, `docs/`, `scripts/`: sin configuración/plantillas de marca versionadas identificadas en esos lugares. Inventario `supabase/`: dos migraciones y función delete-my-account. Esta ausencia local **no acredita** la configuración remota: no se inspeccionaron paneles, credenciales, DNS ni plan de Supabase/Zoho.
- `package.json` ofrece typecheck, test, build y checks del directorio; no tiene script lint. No instalar herramientas para cubrir ese vacío.
- `AUNARA_SOT/PENDIENTES.md` registra recuperación LAN→producción como falla abierta sin causa confirmada; este diseño de correo no la resuelve. También registra cuatro pruebas dependientes del día, aceptadas comparativamente solo para SDD-013 bajo D-13-6; suite normal no se presume verde.

Fuentes oficiales consultadas el 16Oct (documentación general, no inspección de la cuenta):

- [Supabase SMTP](https://supabase.com/docs/guides/auth/auth-smtp): envío propio mediante SMTP compatible y credenciales; proteger enlaces frente a tracking y autenticar dominio. Configuración efectiva pendiente.
- [Supabase Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates): plantillas Go y variables Auth; preservar verificación/retorno con `{{ .ConfirmationURL }}`; `.Data` proviene de metadatos del usuario, no es autoridad de permisos. No garantiza traducción automática.
- [Zoho SMTP](https://www.zoho.com/mail/help/zoho-smtp.html): servidor depende de cuenta y centro de datos; exige autenticación y remitente autorizado; con 2FA puede requerir contraseña específica de aplicación. No fijar host/puerto/capacidad del plan hasta verificar la cuenta.

## 4. Diseño

### 4.1 Direcciones y responsabilidad

| Uso | Dirección |
| --- | --- |
| Responsable / solicitudes de privacidad | `admin@aunaratraining.com` |
| Ayuda en español | `soporte@aunaratraining.com` |
| Help in English | `support@aunaratraining.com` |
| From automático para ambos flujos | `noreply@aunaratraining.com`, nombre visible propuesto `Aunara` |

El footer de ambos correos muestra soporte ES/EN como enlaces mailto, identificados por idioma; contacto de privacidad admin identificado aparte. No pedir contraseñas/tokens por correo ni sugerir responder al noreply. No prometer un Reply-To localizado: si la configuración global lo requiere, se somete a decisión operacional explícita; los contactos visibles no dependen de ello.

### 4.2 Envío: reutilizar Zoho existente, condicionado a verificación

Recomendación: SMTP de la cuenta Zoho ya existente **si** sus permisos, plan, límites, región y autorización From resultan compatibles con Supabase Auth. El Operator ya confirmó existencia de noreply; falta verificar capacidad de envío autenticado, no crear otra cuenta por defecto. Los parámetros se obtienen de la cuenta; autenticación y credencial específica cuando corresponda se cargan solo por canal seguro en la configuración privada del servicio.

Antes de activación: inventario sanitizado del estado SMTP/plantillas y capacidad de reversión sin exponer secretos; comprobar dominio y alineación SPF/DKIM/DMARC, TLS, límites y tracking desactivado para enlaces Auth. No duplicar registros SPF ni reemplazar MX/otros remitentes. Si requiere cambio DNS, presentar diff concreto y esperar autorización; no endurecer DMARC ni romper correo existente para lograr el PASS. Si Zoho no cumple, detener y pedir decisión entre mantener pendiente o evaluar proveedor transaccional; ninguna contratación automática.

**Frontera crítica:** SMTP y plantillas son globales al proyecto Auth, no a una rama Git. Si dev y producción comparten proyecto, aplicar desde un trabajo de dev también afecta producción. Identificar primero el proyecto/ambientes alcanzados y obtener autorización remota separada, ventana, control antes/después y rollback; push a dev no es autorización SMTP de producción.

### 4.3 Dos mensajes, un propósito por mensaje

Propuesta de asuntos bilingües para fase inicial:

- Confirmación: `Confirmá tu cuenta de Aunara / Confirm your Aunara account`.
- Recuperación: `Restablecé tu contraseña de Aunara / Reset your Aunara password`.

Cada mensaje contiene marca, título/instrucción breve ES y EN, **un único CTA primario bilingüe** y enlace de respaldo al mismo destino. Confirmación explica que el paso verifica la cuenta; recuperación explica que permite elegir una contraseña nueva y que, si no se pidió, se puede ignorar y contactar soporte. No afirmar duración del token sin verificarla, no incluir contraseñas/datos de salud ni mensajes promocionales/slogans nuevos.

CTA y respaldo conservan `{{ .ConfirmationURL }}` sin reconstruir URL con SiteURL ni forzar producción. Sin acortadores, tracking, reescritura del proveedor o dominio propio de click que interfiera con Auth. Preservar el flujo actual de confirmación/recovery, no sustituirlo por magic link ni diseñar nuevo consumo de token. Cuenta confirmada y recuperación usan mensajes distintos; reenvío usa confirmación.

**Idioma:** se recomienda contenido bilingüe fijo inicialmente: funciona sin modificar hook/metadatos ni inferir idioma para correos sin sesión. Alternativa condicional por `.Data.language` exige decisión explícita, casos legacy/unknown y fallback bilingüe; nunca usar metadatos para autorizar. Este SDD no añade localización automática ni nuevos datos.

### 4.4 Identidad de marca robusta en correo

No se rediseña Aunara. Reutilizar teal/azul/arena/tinta y nombre/lockup existentes con proporción intacta; estructura sencilla compatible con correo, tablas de presentación y estilos inline, anchos fluidos, tipografía de sistema con fallback. Texto/clicks siempre legibles sin imágenes. Contraste mínimo 4.5:1 en copy/CTA; alt significativo y nombre Aunara visible aunque el cliente bloquee imágenes. No depender de SVG remoto si el cliente no lo soporta: fallback textual suficiente, sin crear/modificar activos de marca en este alcance. Si se requiere raster nuevo, volver al gate.

Registrar equivalente de texto simple. Verificar si el servicio realmente genera/permite parte MIME plain-text antes de prometerla; un texto de respaldo documentado no prueba multipart entregado. Nada de imágenes de tracking, webfonts obligatorias ni recursos con datos personales en URL.

## 5. Alternativas descartadas

- Cambiar solo el logo o nombre visible manteniendo From de Supabase: no cumple remitente exacto.
- Suponer que crear noreply configura SMTP o que Zoho funciona en cualquier host/plan: requiere comprobación de la cuenta.
- Contratar proveedor o ZeptoMail sin necesidad verificada y decisión: gasto/infra fuera de autoridad actual.
- Localización automática nueva en hook, Edge Function/Send Email Hook o uso de metadatos como permisos: amplía arquitectura y riesgo sin necesidad del pedido.
- Redirección fija a producción o cambiar SiteURL para resolver el retorno LAN: oculta un problema abierto y altera Auth.
- Rehacer identidad, usar referencias locales privadas, marketing o nueva versión legal: fuera de alcance.

## 6. Riesgo sobre lo que hoy funciona

1. **Entrega y dominio:** credenciales/host erróneos o SPF duplicado pueden bloquear mensajes o correo existente. Capacidad verificada, baseline/rollback y gate remoto; no tocar MX.
2. **Enlaces sensibles:** tracking, escáneres y URLs incorrectas pueden consumir/romper enlaces. Mantener variable Auth, no reescritura, probar validez/error sin cambiar contratos. Si aparece incompatibilidad real, detener y especificar por separado.
3. **Producción compartida:** una plantilla global se activa inmediatamente aunque no exista deploy de frontend. Separar aprobación local de activación remota; pruebas antes/después con destinatarios autorizados.
4. **Privacidad:** SMTP agrega tránsito/procesamiento por Zoho. Revisar inventario/condiciones/región reales antes de activar; si obliga a cambiar avisos/proveedores fuera de allowlist, volver al gate con enmienda, sin decidir materialidad ni v1.1 automáticamente.
5. **Regresión de consentimiento:** cambiar canal no debe modificar responsable, versión ni recabar nueva aceptación. Diff/negativos y regresiones existentes; no reescribir documentación histórica.
6. **Render/idioma:** diferencias Outlook/Gmail, móvil e imágenes bloqueadas. Texto bilingüe, diseño conservador y revisión en clientes reales; preview de navegador no acredita bandeja de entrada.
7. **Baseline rojo:** D-13-6 no es excepción heredable. Si la suite real sigue fallando, reportar defectos y pedir decisión propia para SDD-014 antes de aceptación técnica; no alterar reloj/tests de editor ni declarar PASS global.

## 7. Verificación: criterios falsables y matriz

| ID | Criterio de aceptación |
| --- | --- |
| C14-01 | Privacidad y consultas de términos ES/EN muestran admin; docs vigentes permitidas coinciden. Nombre, versión 1.0, fecha, aceptación y autorización de salud idénticos a baseline. |
| C14-02 | Alta, reenvío y recuperación recibidos en direcciones controladas expresamente autorizadas muestran raw `From: Aunara <noreply@aunaratraining.com>` (sin From de Supabase), asuntos correctos y la plantilla correspondiente. UI de solicitud no se usa como prueba de entrega. |
| C14-03 | En ambas plantillas se ve Aunara, copy ES/EN, un CTA primario, respaldo idéntico y soporte ES/EN correcto, con admin separado. Sin secretos, datos de salud, promoción ni caducidad inventada. |
| C14-04 | CTA/respaldo ejecutan verificación y recuperación legítimas; recuperación permite establecer nueva contraseña según flujo existente, no otro modo Auth. Conservar retorno solicitado en prod y origen Mac/LAN autorizados. Falla LAN abierta no queda cerrada por apariencia/remitente. |
| C14-05 | Tokens inválidos, usados/expirados no permiten confirmar/restablecer indebidamente y muestran manejo existente; no eliminar validación, reutilizar sesiones ni cambiar permisos/consentimiento para pasar. Registrar el vencimiento real comprobado, no inventarlo. |
| C14-06 | En Gmail y Outlook reales, móvil y escritorio, imágenes habilitadas/bloqueadas, copy/CTA/contactos legibles, sin cortes ni scroll horizontal a320/390px, contraste≥4.5:1. Preview local Chromium/WebKit ES/EN pasa, sin considerarlo sustituto de clientes reales. |
| C14-07 | Comprobación autorizada de headers/DNS acredita autenticación de dominio y alineación DMARC con SPF/DKIM válidos según configuración; tracking de enlaces desactivado. MX y correo Zoho existente preservados, sin SPF duplicado. Sin asumir inbox universal por un envío. |
| C14-08 | Diff limitado a allowlist, guardas negativas detectan desviaciones y controles restaurados pasan; typecheck, tests aplicables y builds completos con evidencia. No PASS global con comprobaciones pendientes ni excepción SDD-013 trasladada. |

Matriz planificada originalmente, **no ejecutada en fase SPEC**; ejecución local acreditada en [desarrollo](2026-10-16-sdd014-revision/README.md) y [revisión](2026-10-16-sdd014-revision/review-cycle1.md). Parte remota NO EJECUTADA:

- `npm run typecheck`, `npm test`, `npm run check:exercise-directory`, `npm run test:exercise-directory`, `npm run build`, `git diff --check`; lint N/A por ausencia de script. Comparar baseline/candidato con fecha real y registrar cada rojo; aprobación de cualquier tratamiento comparativo requiere decisión nueva.
- `node --test scripts/auth-email-templates.node-test.mjs`: estructura/copy, asuntos documentados, contactos, CTA/backup y placeholders. Pruebas existentes de `privacy`, `LegalPanel`, `useCloudSync`, `AccessPanel` y flujos de cuenta conservadas sin debilitar cobertura.
- Chromium y WebKit sobre build: privacidad/términos ES/EN a1440/390/320; versiones/consentimientos y apertura/cierre conservados. Previews locales de ambos mensajes con URL sintética no funcional, imágenes bloqueadas y fallback; revisar capturas completas. No datos ni enlaces reales en artefactos públicos.
- Con autorización separada de cuentas, envíos y configuración: alta/reenviar/recovery × destinos controlados Gmail/Outlook; recepción, headers sanitizados, spam, click válido y negativos. Retornos prod y Mac/LAN actuales con allowlist efectiva verificada; no forzar host desde plantilla. Si requiere cambio de Redirect URLs, diagnóstico y autorización aparte.
- Negativos aislados, uno por vez, nunca enviando tokens falsos a usuarios: **N1** correo contacto viejo/soporte cruzado ⇒ C14-01/03 rojo; **N2** From distinto en fixture de header ⇒ C14-02 rojo; **N3** CTA con host incorrecto/URL fija o backup divergente ⇒ C14-04 rojo; **N4** modificación de versión/consentimiento ⇒ C14-01/08 rojo. Restaurar y repetir controles verdes; no mutar producción para provocar un fallo.
- Recibo distingue estático, preview, remoto y UAT humana: PASS/FAIL/NO EJECUTADO por criterio. Capturas sin tokens/credenciales/direcciones personales; raw headers se inspeccionan privadamente y solo se guarda extracto sanitizado.

## 8. Plan de entrega

1. Operator resuelve §9 y aprueba explícitamente esta versión. Hasta entonces no implementar ni tocar infraestructura.
2. Desarrollo local en frente aislado: contacto mínimo, dos plantillas, copy y guardas; sin conexión remota ni envíos. Verificación proporcional, revisión independiente por agente distinto del implementador; máximo tres ciclos y vuelta al Operator si hay regresión/scope nuevo.
3. Entrega local tras APPROVED independiente: documentación vigente al día y commit enfocado con solo archivos revisados. No absorber dirty ajeno ni cambios SDD-013; registrar SHA, pruebas y pendientes. Push solo con orden explícita propia; no heredarlo del push de SDD-013.
4. Gate operacional: identificar proyecto/ambientes y capacidades reales; presentar cambios exactos, impacto prod, rollback, credencial por vía segura y destinatarios controlados. Si SMTP/plan/proveedores o documentación requieren ampliar scope, enmendar y pedir aprobación.
5. Solo tras autorización explícita remota y de pruebas, aplicar y comprobar antes/después SMTP/From/plantillas; DNS únicamente con permiso específico si necesario. Conservar valores anteriores de forma privada recuperable; ante fallo revertir cambios autorizados al baseline y registrar resultado, sin nueva contratación ni cambios laterales.
6. Revisión independiente de recibos de entrega real y UAT del Operator; cierre humano separado del APPROVED local. No publicar frontend a main/producción por este procedimiento sin orden adicional.

## 9. Decisiones que necesita el Operator

| ID | Decisión / estado |
| --- | --- |
| D14-01 | **Resuelto por pedido 16Oct:** admin responsable/contacto, soporte ES y EN, noreply remitente, dos plantillas de marca. No cambia identidad jurídica. |
| D14-02 | **Resuelto por respuesta posterior:** proveedor Zoho y noreply existente. Plan, centro de datos, SMTP habilitado, credencial y permisos From **no verificados**. Se recomienda reutilizarlo solo si resulta compatible, sin gasto nuevo. |
| D14-03 | **Resuelta por «Dale», 16Oct:** SDD v0.1 aprobado para desarrollo local, diseño conservador y contenido bilingüe fijo inicial, sin selección automática nueva. Superada la solicitud original pendiente. Condicional por metadatos exige decisión distinta. |
| D14-04 | **Pendiente antes de operación:** proyecto Auth/ambientes afectados, autorización remota separada, ventana/rollback, acceso seguro, comprobación de proveedores, direcciones de prueba y permiso de envíos/alta/recovery. No enviar contraseñas al chat. |
| D14-05 | **Pendiente si aparece:** autorización específica de diff DNS; alternativa si Zoho incompatible; ampliación de textos/inventario por nuevo procesamiento; no tomar estas decisiones por defecto. |
| D14-06 | **No activada en este ciclo:** suite real candidato371/371 en25 archivos +Sites1/1; base367/367 +Sites1/1, sin waiver ni reloj alterado. Los cuatro rojos históricos no se arreglaron; si reaparecen requieren decisión propia, no D-13-6. |

No se vuelve a preguntar si noreply existe ni cuál es el proveedor: ya contestado. No afirmar que están configurados los servicios por esa respuesta.

## 10. Definición de terminado

**SPEC terminado y aprobado:** diez secciones completas; estado original «En revisión del Operator» superado por «Dale» para desarrollo local, no operación remota.

**Desarrollo local implementado y APPROVED LOCAL:** C14-01/03/08 y preview06 PASS LOCAL; fuentes117/117 congeladas preservadas, documentación/entrega enfocadas. No equivale a correo activado, UAT ni cierre humano. C14-02/04/05/07 y Gmail/Outlook06 siguen NO EJECUTADOS.

**Pedido operativo terminado (futuro):** autorización remota y de envíos documentadas; ambas clases de correo más reenvío entregados y verificados desde noreply con marca/contactos; dominios/enlaces/retornos correctos y negativos seguros; clientes reales revisados; responsable/consentimientos/datos y correo existente preservados; Operator realiza UAT y cierra. Si falta cualquiera, registrar pendiente sin afirmar que “ya llega” o que la recuperación LAN está resuelta.

Recibo histórico de SPEC: entonces solo nuevo SDD, sin implementación ni cambios remotos. Superado por desarrollo/revisión/entrega y posterior integración a dev con orden propia «Sí», no heredada de SDD-013. Sin deploy ni activación SDD-014. UAT5173 sigue SDD-013/base61610c1, no este producto SDD-014.
