# Plantillas Auth de Aunara — artefactos locales

`[AUNARA/codex · gpt-6.1-sol]` · SDD-014 · 2026-10-16

Estado: **NO ACTIVADO**. Estos archivos no configuran Supabase ni Zoho por estar en Git. No se verificó SMTP, recepción, parte MIME de texto simple, headers efectivos ni DNS. Zoho y noreply existente son hechos reportados por el Operator, no inspecciones de la cuenta.

## Propósito y asuntos exactos

| Tipo de plantilla Supabase | Archivo | Asunto bilingüe |
| --- | --- | --- |
| Confirm sign up (también reenvío) | `confirm-signup.html` | Confirmá tu cuenta de Aunara / Confirm your Aunara account |
| Reset password | `reset-password.html` | Restablecé tu contraseña de Aunara / Reset your Aunara password |

Remitente **objetivo**, no header observado: `Aunara <noreply@aunaratraining.com>`. El HTML no determina From, y no se añade un header falso dentro del cuerpo. La comprobación de From del script usa únicamente fixtures sintéticos. No se promete Reply-To por idioma: no responder al noreply para pedir ayuda.

Ambas piezas contienen español e inglés fijos; no selección por `.Data.language`, hooks nuevos ni cambios a signup/recovery. CTA y respaldo mantienen literalmente `{{ .ConfirmationURL }}`; no usar SiteURL, un destino fijo, acortadores, dominios de click ni tracking. No cerrar por esto la falla abierta LAN→producción.

Identidad: mismos colores teal `#063f43`, azul `#164edf`, arena `#f5f1ea`, tinta `#102421`; nombre Aunara y descriptor TRAINING SYSTEMS existentes en texto, no un logo redibujado. Sin dependencia de imágenes remotas, SVG o webfonts: bloquear imágenes no elimina marca, instrucciones ni acciones. No se modificó ningún activo original. Fuente sistema, tablas de presentación e inline; el botón puede envolver su texto sin ancho fijo.

Ayuda en español: `soporte@aunaratraining.com`. Help in English: `support@aunaratraining.com`. Privacidad / Privacy: `admin@aunaratraining.com`, separado de soporte. Nunca solicitar contraseñas, enlaces ni tokens de acceso por correo.

## Texto simple equivalente — confirmación

Copy de respaldo documentado; **no demuestra** que el servicio genere o entregue multipart/alternative. Antes de activación, verificar soporte efectivo de plain-text y revisar el MIME recibido con autorización; no introducir otro hook para resolverlo dentro de este alcance.

```text
Aunara
TRAINING SYSTEMS

Confirmá tu cuenta
Usá el enlace para verificar tu cuenta de Aunara y completar el registro.

Confirm your account
Use the link to verify your account with Aunara and complete sign-up.

Confirmar cuenta / Confirm account:
{{ .ConfirmationURL }}

Si no creaste esta cuenta, podés ignorar este mensaje o contactar a soporte.
No compartas contraseñas ni enlaces de acceso por correo.
If you did not create this account, you can ignore this message or contact support.
Do not share passwords or links to your account by email.

Ayuda / Help
Español: soporte@aunaratraining.com
English: support@aunaratraining.com
Privacidad / Privacy: admin@aunaratraining.com
```

## Texto simple equivalente — recuperación

```text
Aunara
TRAINING SYSTEMS

Restablecé tu contraseña
Recibimos una solicitud de recuperación de tu cuenta de Aunara.
Usá el enlace para elegir una contraseña nueva.

Reset your password
We received a request to recover your Aunara account.
Use the link to choose a new password.

Restablecer contraseña / Reset password:
{{ .ConfirmationURL }}

Si no pediste este cambio, podés ignorar este mensaje o contactar a soporte.
No compartas contraseñas ni enlaces de acceso por correo.
If you did not request this change, you can ignore this message or contact support.
Do not share passwords or links to your account by email.

Ayuda / Help
Español: soporte@aunaratraining.com
English: support@aunaratraining.com
Privacidad / Privacy: admin@aunaratraining.com
```

## Verificación local reproducible

Desde raíz: `node --test scripts/auth-email-templates.node-test.mjs`. No instala ni modifica paquetes. Lee fuentes reales, compara privacidad/Auth con hashes SHA-256 de base `61610c1` y analiza estructura/enlaces de ambos HTML. No necesita historial Git; resuelve archivos desde `import.meta.url`, también si se invoca desde otro directorio. Los negativos se ejecutan sobre copias desechables, nunca sobre la fuente ni servicios.

Invariantes auditables (SHA-256 de bytes UTF-8 de base `61610c1`; pueden contrastarse con `git show 61610c1:ruta | shasum -a 256` cuando se dispone de historia):

| Fuente protegida | Hash base |
| --- | --- |
| `src/lib/privacy.ts` | `2c7ed232f740e5e7932cc81a4f4ba87a01e3c549ba1972b8150be7872817dc25` |
| `src/hooks/useCloudSync.ts` | `c977db60872384df136bef879a4bdf95af336bd9d90201ef52c2d1623e572afd` |
| `src/components/LegalPanel.tsx` | `142e3355e457312224759f6b9ec17f7e942ff9c09a4b18fd739283d22d0207f9` |

Para privacidad se normaliza **solo** el valor nuevo de `DATA_CONTROLLER_EMAIL` al anterior antes de calcular el hash: cualquier otra diferencia falla, incluidos nombre, fecha, versión y manejo de datos. Auth/consentimiento y el componente legal se comparan byte por byte. No se actualizan estos hashes para tolerar un cambio fuera de alcance.

Preview: reemplazar las tres apariciones de `{{ .ConfirmationURL }}` en una copia con una URL sintética larga de `example.invalid`, sin tokens reales y sin hacer click; Chromium y WebKit a320/390/1440. Revisar copy ES/EN, legibilidad, scroll horizontal, botón, backup y contactos; repetir con imágenes bloqueadas. Contraste texto/CTA ≥4.5:1. Preview no sustituye Gmail/Outlook recibidos ni prueba validez de tokens.

## Gate antes de cualquier aplicación remota

1. Aprobación local independiente y decisión D14-06 si la suite real tiene rojos de baseline. No heredar excepción SDD-013.
2. Identificar proyecto Auth y todos los ambientes afectados: SMTP y plantillas son globales; no existe aislamiento por rama. Obtener autorización explícita remota, ventana y destinatarios controlados. Push no concede esa autorización.
3. Inventariar de forma privada y recuperable configuración anterior, asuntos y HTML, sin publicar credenciales ni tokens. Verificar capacidad/plan/región Zoho, permisos From, host/puerto/TLS y credencial por canal seguro; no adivinarlos ni contratar nada.
4. Revisar procesamiento/proveedores y necesidad de avisos. Si requiere ampliar documentación, identidad, contrato o versión legal, parar y enmendar SDD con aprobación.
5. Presentar diff operativo exacto antes de aplicar. Comprobar SPF/DKIM/DMARC y alineación, tracking desactivado; preservar MX, correo existente y registros SPF sin duplicarlos. Cualquier DNS requiere autorización específica aparte.
6. Solo con permiso: aplicar estos dos HTML/asuntos al tipo correcto y remitente objetivo; no activar otras plantillas/seguridad, alterar SiteURL/Redirect URLs, hooks, política de contraseña o contrato Auth.
7. Pruebas autorizadas de alta, reenvío y recuperación hacia Gmail/Outlook controlados: raw From y asunto, recepción, HTML y MIME, móvil/escritorio, imágenes habilitadas/bloqueadas, links válidos/inválidos/usados/expirados y retornos actuales prod/Mac/LAN. Caducidad se mide, no se inventa. Headers sanitizados en recibo; nunca tokens ni destinatarios personales. Sin asumir inbox universal.

## Rollback futuro (solo con autorización remota)

Antes de aplicar, conservar baseline privado verificable de SMTP/remitente, asuntos y contenido de ambas plantillas, proyecto/alcance y hora. Si falla entrega, enlaces, identidad o autenticación de dominio, detener las pruebas y restaurar **únicamente** campos autorizados a esos valores previos. Validar recepción/flujo anterior con destinatarios autorizados y registrar resultado. No modificar MX ni otros registros como reparación oportunista; DNS solo según su diff/rollback previamente aprobado. Si no puede garantizarse reversión, no activar.

El rollback local consiste en retirar este diff aprobado de una copia de trabajo, no revertir cambios ajenos ni el trabajo SDD-013. Ningún rollback se ha ejecutado en infraestructura.

Fuentes oficiales consultadas el 16Oct: [Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates), [SMTP](https://supabase.com/docs/guides/auth/auth-smtp), [Zoho SMTP](https://www.zoho.com/mail/help/zoho-smtp.html). Las fuentes describen capacidades generales, no prueban la configuración de esta cuenta.
