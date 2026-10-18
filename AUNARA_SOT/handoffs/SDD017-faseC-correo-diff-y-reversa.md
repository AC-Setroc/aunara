# SDD-017 · Fase C — SMTP propio, plantillas y remitente: diff, baseline y reversa (PROPUESTA)

2026-10-17 · `[AUNARA/claude · modelo no expuesto]` · **Nada aplicado.** Autorización del Operator: «Arrancá con C» = preparar diff/reversa; cada escritura remota sigue necesitando su «sí» (SDD-017 §9, SDD-014 gate).

## Hallazgo bloqueante (lectura de solo lectura, 17-10)
Consulta DNS al servidor autoritativo (`ns49.domaincontrol.com`, GoDaddy) de `aunaratraining.com`: **sin MX, sin TXT (SPF), sin `_dmarc` y sin DKIM `zoho`**. Solo existen los cuatro A de GitHub Pages. Sin eso, Zoho no verificará el dominio como remitente y los correos de `noreply@aunaratraining.com` fallarían o caerían en spam. El README de SDD-014 daba el buzón noreply como «reportado, no verificado»: esta consulta no lo respalda para este dominio.

## Pre-requisitos (los hace el Operator; no se adivinan)
1. Dominio `aunaratraining.com` agregado y **verificado en Zoho Mail**, con buzón `noreply@aunaratraining.com`. Confirmar centro de datos (`smtp.zoho.com` / `.eu` / `.in`) y que el plan permite SMTP.
2. DNS en GoDaddy con los valores EXACTOS que muestre Zoho (MX, SPF, DKIM, y DMARC sugerido). Diff DNS propio y aprobación aparte; **no tocar los cuatro A** ni otros registros. SPF: un único TXT.
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
