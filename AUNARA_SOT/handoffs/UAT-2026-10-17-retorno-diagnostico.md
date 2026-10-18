# SDD-017 · Fase B — diagnóstico del retorno de correo (U17-06)

2026-10-17 · `[AUNARA/claude · modelo no expuesto]` · Evidencia sanitizada: sin tokens, sin correos personales. Proyecto Auth compartido (afecta producción).

## Autorizaciones usadas (todas del Operator, en chat)
1. Diagnóstico de solo lectura (ya dentro de SDD-017 §9).
2. «Sí» a un envío real de recuperación a una cuenta propia del Operator, pedido desde la LAN.
3. «Sí» a añadir al panel de Supabase (lo hizo el Operator a mano) tres entradas exactas de Redirect URLs.
No se tocó SMTP, plantillas, Site URL, DNS, cuentas ni datos. No se abrió ningún enlace con token.

## Hallazgos
| # | Observación | Evidencia |
| --- | --- | --- |
| 1 | El cliente pide el retorno correcto. | `useCloudSync.ts:412,478,509` + `publicBase.ts`; en el navegador, `POST /auth/v1/recover?redirect_to=http://192.168.80.19:5173/`. |
| 2 | Aun así el correo real llegó con `redirect_to=https://aunaratraining.com/` (Site URL). | Enlace pegado por el Operator (token omitido aquí). |
| 3 | La allowlist ya tenía `http://192.168.80.19:5173/**`, `http://localhost:5173/**`, `http://127.0.0.1:5173/**`, más entradas exactas de producción/Pages. | Captura del panel aportada por el Operator. |
| 4 | ~~Causa: el patrón `…/**` no cubre la raíz exacta~~ **Hipótesis descartada por la prueba de abajo (ver «Corrección»).** | — |

## Corrección aplicada (solo configuración, aditiva)
Entradas exactas añadidas por el Operator en Authentication › URL Configuration › Redirect URLs: `http://192.168.80.19:5173/`, `http://localhost:5173/`, `http://127.0.0.1:5173/`.
Reversa: borrar esas tres entradas. Site URL intacto (`https://aunaratraining.com/`).

## Verificación
- Segunda recuperación pedida tras añadir las entradas (misma `redirect_to` LAN): el correo no llegó. **Causa probada con los logs de Auth del proyecto (solo lectura):** `POST /recover` → **429 `over_email_send_rate_limit`** (2026-10-17 23:59 UTC). Es el límite del SMTP integrado de Supabase, no un fallo de la allowlist ni del código.
- Primer envío (23:44 UTC): `mail.send` tipo `recovery`, remitente **`noreply@mail.app.supabase.io`** (por defecto, sin marca) y enlace con `redirect_to` de producción, por el hallazgo 4.
- La corrección de allowlist **no ha podido verificarse aún** con un correo real: el límite impide nuevos envíos hasta que se libere la cuota.
- **C17-08 (retorno) queda ABIERTO** hasta ver un correo con `redirect_to` LAN. C17-09 (remitente Zoho/plantillas, Fase C) NO EJECUTADO.

## Pendiente
Operator: confirmar si llegó el segundo correo (host y `redirect_to`, sin token). El límite del SMTP integrado seguirá bloqueando pruebas repetidas; la Fase C (SMTP propio de Zoho, plantillas y remitente de marca) lo elimina y requiere su autorización separada, con baseline, diff y rollback.

## Corrección (18-10, 01:00 UTC) — la hipótesis del patrón `/**` era errónea
Tras añadir las tres entradas exactas (`http://192.168.80.19:5173/`, `http://localhost:5173/`, `http://127.0.0.1:5173/`; confirmado en captura con barra final) y pasar el envío por Resend, el correo de recuperación pedido desde la LAN **siguió trayendo `redirect_to=https://aunaratraining.com/`**.
Prueba sin correos ni cambios: `GET /auth/v1/verify` con token inválido y `redirect_to=<X>`; la cabecera `Location` muestra qué URL validó Supabase.
| `redirect_to` probado | `Location` |
| --- | --- |
| `http://localhost:5173/` | `http://localhost:5173/` ✅ |
| `http://127.0.0.1:5173/` | `http://127.0.0.1:5173/` ✅ |
| `https://aunaratraining.com/` | `https://aunaratraining.com/` ✅ |
| `http://192.168.80.19:5173/` (exacta y también cubierta por `/**`) | `https://aunaratraining.com/` ❌ |
| `http://192.168.80.19:5173/x`, `http://192.168.80.26:5173/x` | `https://aunaratraining.com/` ❌ |
**Conclusión:** el proyecto honra `localhost` y `127.0.0.1` pero **descarta las IP de LAN** (192.168.x.x) aunque estén en la lista, con cualquier forma de entrada. Causa no probada (sospecha: Supabase no acepta hosts de red privada como destino). No es código ni formato de entrada. Mi afirmación anterior de «causa casi probada» fue un error de diagnóstico; se corrige aquí.

## Estado de C17-08 / C17-09 tras Resend (18-10)
- **C17-09 marca ✅:** el correo real de recuperación llegó de `noreply@aunaratraining.com`, asunto `Restablecé tu contraseña de Aunara / Reset your Aunara password`, plantilla de marca con acentos correctos (captura del Operator, iPhone, modo oscuro). La solicitud devolvió 200, sin 429. **Pendiente:** cabeceras SPF/DKIM/DMARC en «Mostrar original»; logo en la plantilla (decisión pendiente: hoy marca en texto).
- **C17-08 retorno:** `localhost` y `127.0.0.1` ✅, producción ✅, **LAN ❌**. Para probar desde el iPhone, el alta/recuperación debe pedirse en el Mac por `http://localhost:5173/`; iniciar sesión con contraseña en el iPhone no necesita correo. Alternativa a evaluar aparte: un nombre de host en lugar de IP (requiere permitir el host en Vite).
