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
