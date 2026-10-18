# SDD-017 · Fase C — SMTP propio, plantillas y remitente: diff, baseline y reversa (PROPUESTA)

2026-10-17 · `[AUNARA/claude · modelo no expuesto]` · **Nada aplicado.** Autorización del Operator: «Arrancá con C» = preparar diff/reversa; cada escritura remota sigue necesitando su «sí» (SDD-017 §9, SDD-014 gate).

## Hallazgo de DNS (corregido, 17-10)
Primera lectura (consulta `dig +short` TXT) **errónea**: dio vacío por un defecto de esa forma de consulta, y concluí mal que no había TXT/DMARC. Corregida con respuesta completa del servidor autoritativo (`ns49.domaincontrol.com`) y con la captura del panel GoDaddy del Operator (12 registros):
- Presentes: 4 A de GitHub Pages, CNAME `www`, CNAME `_domainconnect`, TXT `@` = `zoho-verification=…` (dominio verificado en Zoho), TXT `_dmarc` = `v=DMARC1; p=quarantine; adkim=r; aspf=r; rua=mailto:dmarc_rua@onsecureserver.net;`, TXT `_github-pages-challenge-ac-setroc`.
- **Faltan: MX, SPF y DKIM.** Con DMARC en `p=quarantine`, enviar sin SPF/DKIM haría que los correos se pongan en cuarentena: **no activar SMTP hasta que SPF y DKIM existan.**

## Pre-requisitos (los hace el Operator; no se adivinan)
1. Dominio `aunaratraining.com` agregado y **verificado en Zoho Mail**, con buzón `noreply@aunaratraining.com`. Confirmar centro de datos (`smtp.zoho.com` / `.eu` / `.in`) y que el plan permite SMTP.
2. DNS en GoDaddy con los valores EXACTOS que muestre Zoho (MX, SPF, DKIM). DMARC ya existe: no se toca. Diff DNS propio y aprobación aparte; **no tocar los cuatro A** ni otros registros. SPF: un único TXT.
3. Contraseña de aplicación de Zoho: se carga solo en el panel de Supabase; nunca en chat, repo ni capturas.

## Baseline (antes de cualquier cambio; privado, fuera del repo)
En Supabase › Authentication › Emails y SMTP Settings: captura/copia de (a) SMTP personalizado = apagado, (b) asunto y HTML actuales de *Confirm sign up* y *Reset password*, (c) Site URL y Redirect URLs (hoy: Site URL `https://aunaratraining.com/` + 3 exactas locales añadidas hoy). Guardar fuera del repo; en el SOT solo «baseline tomado, hora».

## Diff propuesto (solo estos campos)
| Campo Supabase | Antes | Después |
| --- | --- | --- |
| SMTP personalizado | apagado | encendido: host/puerto/TLS de Zoho según su centro de datos, usuario `noreply@aunaratraining.com`, contraseña de aplicación (la carga el Operator) |
| Sender email / name | por defecto (`noreply@mail.app.supabase.io`) | `noreply@aunaratraining.com` / `Aunara` |
| Confirm sign up: asunto + HTML | por defecto | `Confirmá tu cuenta de Aunara / Confirm your Aunara account` + `supabase/templates/confirm-signup.html` |
| Reset password: asunto + HTML | por defecto | `Restablecé tu contraseña de Aunara / Reset your Aunara password` + `supabase/templates/reset-password.html` |
| Site URL, Redirect URLs, otras plantillas, contraseñas, hooks | — | **sin cambio** |

Nota: con SMTP propio Supabase aplica su propio tope por hora (ajustable en Rate Limits); sirve para dejar de depender del límite del SMTP integrado que dio el 429.

## Pruebas (con destinatarios que el Operator autorice; sin tokens ni correos personales en el repo)
Alta, reenvío y recuperación → raw From/asunto, recepción en Gmail/Outlook, SPF/DKIM/DMARC `pass`, HTML con imágenes bloqueadas, y enlace con `redirect_to` del origen que lo pidió (LAN, localhost, prod). Cierra C17-08 y C17-09.

## Reversa
Apagar SMTP personalizado y restaurar remitente, asuntos y HTML del baseline. No tocar MX/otros DNS como reparación. Si no se puede garantizar la reversa, no activar. Las entradas de Redirect URLs de hoy se quitan borrándolas.

## Estado
Esperando: pre-requisitos 1–3 del Operator y su «sí» al diff. Ninguna escritura remota hecha en esta fase.

## Diff DNS propuesto (GoDaddy) — solo añadir, no se modifica ni borra nada existente
Valores para centro de datos `zoho.com`; si es `.eu`/`.in`/otro, usar los que muestre Zoho. El DKIM lo genera Zoho (selector y clave propios): el Operator lo copia desde Zoho, no se inventa.
| Tipo | Nombre | Datos | Prioridad / TTL |
| --- | --- | --- | --- |
| MX | `@` | `mx.zoho.com` | 10 / 1 hora |
| MX | `@` | `mx2.zoho.com` | 20 / 1 hora |
| MX | `@` | `mx3.zoho.com` | 50 / 1 hora |
| TXT | `@` | `v=spf1 include:zoho.com ~all` (un solo SPF; hoy no hay otro) | 1 hora |
| TXT | `<selector>._domainkey` | clave DKIM que muestre Zoho (Mail Admin › Domains › Email Configuration › DKIM) | 1 hora |
Reversa: borrar esas cinco filas. No se tocan los A, `www`, `_domainconnect`, `zoho-verification`, `_dmarc` ni el desafío de GitHub Pages.
Verificación: `dig` MX/TXT y botón «Verify» de Zoho para SPF/DKIM antes de pasar al diff de Supabase.

## Comprobaciones pendientes en Zoho
- «Alias creado»: SMTP se autentica con un **buzón** (usuario), no con un alias. Hay que autenticar con un buzón y tener `noreply@aunaratraining.com` como dirección de envío permitida, o crear `noreply@` como buzón.
- El plan debe permitir SMTP (el plan gratuito de Zoho Mail puede no incluirlo). Confirmar antes de tocar Supabase.

## Registro de ejecución — DNS (17-10, hecho por el Operator con su aprobación)
- Añadidos en GoDaddy: 3 MX Zoho (10/20/50), TXT SPF `v=spf1 include:zoho.com ~all`, TXT DKIM `zoho._domainkey` (selector `zoho`, 2048/1024 bits según Zoho). Verificado por `dig` contra `ns49.domaincontrol.com` y `8.8.8.8` y «DKIM selector is successfully verified» en Zoho. Nada existente se modificó ni borró.
- Zoho: `noreply@aunaratraining.com` es **alias** del buzón `admin@aunaratraining.com`; el SMTP se autentica como el buzón.
- Siguiente: diff de Supabase (SMTP, remitente, 2 plantillas), pendiente de baseline y «sí» del Operator.

## Enmienda 1 (17-10) — el envío pasa de Zoho SMTP a Resend. SUPERA el diff de Supabase de arriba
**Motivo (evidencia del Operator, capturas de Zoho):** plan **Mail Free**: IMAP «no disponible», POP y Forwards «solo planes de pago», pestaña SMTP sin acceso externo → Supabase no puede autenticar SMTP contra Zoho. Decisión del Operator: **Resend** (en lugar de subir a Zoho Mail Lite). Zoho queda solo para **recibir** y para correo humano; MX/SPF/DKIM de Zoho ya aplicados no se tocan.

Fuentes (consultadas 17-10): [Resend + Supabase SMTP](https://resend.com/docs/send-with-supabase-smtp), [Add a domain](https://resend.com/docs/add-a-domain), [precios](https://resend.com/pricing). Plan gratuito: 3 000 correos/mes, 100/día, 3 dominios.

### Pasos y diff (nada aplicado todavía)
1. **Cuenta Resend** (la crea el Operator) y **Add domain** `aunaratraining.com`. Resend muestra en su pestaña *Records* los valores EXACTOS (copiar/pegar tal cual): TXT DKIM (`resend._domainkey`), y para el *Return-Path* (`send` por defecto) un TXT (SPF) más un MX o CNAME. No se adivinan los valores aquí.
2. **DNS en GoDaddy — solo añadir** esas filas. No tocan el MX/SPF raíz de Zoho porque el SPF/MX de Resend va en el subdominio `send`. No tocar los A, `www`, `_domainconnect`, `zoho-verification`, SPF raíz, `zoho._domainkey`, `_dmarc` ni el desafío de GitHub Pages. Si Resend da un CNAME, no activar proxy. Esperar «Verified» en Resend.
3. **Supabase › Authentication › Emails › SMTP Settings:** encendido; sender `noreply@aunaratraining.com` / `Aunara`; host `smtp.resend.com`; puerto `465`; usuario `resend`; contraseña = **API key de Resend** (la crea y la pega el Operator, de preferencia con permiso «Sending access» limitado a este dominio; nunca en chat/repo).
4. **Plantillas:** igual que antes (asuntos y HTML de `supabase/templates/confirm-signup.html` y `reset-password.html`).
5. Site URL, Redirect URLs, otras plantillas, contraseñas y hooks: **sin cambio**.

### DMARC
El `_dmarc` actual (`p=quarantine`, `adkim=r`, `aspf=r`) se conserva. Resend firma DKIM con `d=aunaratraining.com`, así que DMARC alinea por DKIM. Verificar `pass` en cabeceras reales.

### Baseline y reversa
Baseline privado de SMTP/plantillas antes de aplicar (fuera del repo). Reversa: apagar SMTP personalizado y restaurar plantillas del baseline; borrar las filas DNS de Resend; revocar la API key; borrar el dominio en Resend. No tocar MX/SPF/DKIM de Zoho. Quitar de Zoho la contraseña de aplicación `Aunara` que ya no se usa.

### Pruebas (destinatarios autorizados)
Recuperación y alta/reenvío → logs de Auth sin 429, cabeceras raw (From `noreply@aunaratraining.com`, SPF/DKIM/DMARC `pass`), HTML con imágenes bloqueadas y `redirect_to` del origen que lo pidió (LAN, localhost, prod). Cierra C17-08 y C17-09. Tope: 100/día en plan gratuito.
