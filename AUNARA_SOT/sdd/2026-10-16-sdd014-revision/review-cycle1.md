# SDD-014 — revisión independiente, ciclo 1

2026-10-16 · `[AUNARA/codex · gpt-6.1-sol]` · **APPROVED LOCAL**

Veredicto exclusivo sobre el desarrollo local aprobado «Dale», base `61610c1`, rama `wip/sdd014-local-2026-10-16`, checkout `/private/tmp/aunara-sdd014-candidate`. No es aprobación global, activación de correo ni cierre humano. Sin hallazgos bloqueantes locales. Revisor distinto del implementador; no se corrigió ninguna fuente.

## Autoridad, alcance y congelación

Leídos AGENTS, metodología Personal completa (actualización del principal ya realizada el 16Oct), SOT README, SDD-014 completo y recibo del desarrollador. Aplicadas skills operator-sdd-workflow y browser-testing-with-devtools para revisión independiente y límites de navegador. Playwright existente, perfiles temporales aislados; ninguna sesión real.

Congelación recibida: `source-sha256.json`, `2026-10-16T06:26:55.818Z`. Todos sus hashes se comprobaron antes/después de las matrices; auditoría independiente en `reviewer-source-audit.json`. Comparación byte a byte de los archivos tracked del manifest contra base: solo los cinco permitidos difieren (privacidad, test legal y tres documentos compliance). El diff de privacidad cambia exclusivamente EMAIL; los demás contratos y activos hasheados permanecen iguales. Los cuatro artefactos nuevos son los tres templates/README y la guarda Node autorizados. SDD dirty preexistente del principal preservado; sin edición de SDD-013 ni evidencia histórica. Nada en canónico/UAT5173.

## Matriz de criterios y fases

| Criterio | Veredicto de esta fase | Evidencia |
| --- | --- | --- |
| C14-01 | PASS LOCAL | 48 casos legales: privacy/terms × ES/EN × 320/390/1440 × Chromium/WebKit × raíz/rollback; admin presente, contacto anterior/soporte ausentes, versión/fecha presentes y sin checkbox nuevo. Nombre confirmado en privacy; términos conservan su texto baseline sin nombre añadido. Hash normalizado de privacy y byte a byte de LegalPanel/useCloudSync protegen nombre/fecha/versión/consentimientos. |
| C14-02 | NO EJECUTADO REMOTO | No envíos ni headers recibidos. N2 es exclusivamente fixture estático. |
| C14-03 | PASS LOCAL | 24 previews: ambos mensajes × 320/390/1440 × Chromium/WebKit × imágenes on/off. Marca textual, ES/EN fijos, CTA único y backup idéntico a URL sintética `.invalid`; tres mailtos con roles separados. Sin recurso externo ni dependencia de imagen (0 imágenes). |
| C14-04 | NO EJECUTADO REMOTO | Destinos placeholders/negativos locales comprobados; ningún enlace real ejecutado ni retorno prod/LAN acreditado. |
| C14-05 | NO EJECUTADO REMOTO | Sin tokens reales, sesiones ni recuperación/alta reales. |
| C14-06 | PASS PREVIEW LOCAL; Gmail/Outlook NO EJECUTADOS | Legibilidad, CTA/contactos y wrapping revisados visualmente. Sin overflow horizontal en todos los casos. Contraste computado de p/h1/h2/a con fondo efectivo mínimo 5.8483:1, superior a4.5. No acredita comportamiento de clientes de correo. |
| C14-07 | NO EJECUTADO REMOTO | No SMTP/DNS, autenticación de dominio ni tracking efectivo inspeccionados. |
| C14-08 | PASS LOCAL | Alcance, hashes, suite real, typecheck, guardas/negativos y builds descritos abajo. No se hereda excepción D-13-6. |

Las filas remotas siguen pendientes del gate operacional explícito; conforme al encabezado aprobado del SDD no bloquean este veredicto local ni quedan eliminadas de la definición final.

## Corridas frescas del revisor

Desde raíz del candidato, salvo la invocación de archivo desde copia sin Git:

| Comando | Resultado | Recibo |
| --- | --- | --- |
| `npm test` | 25 archivos, 371/371 Vitest + Sites1/1; cero skips | `reviewer-full-suite-real.log` |
| `npm run typecheck` | PASS, cero diagnósticos | `reviewer-typecheck.log` |
| `node --test scripts/auth-email-templates.node-test.mjs` | 10/10 | `reviewer-guards.log` |
| `node reviewer-audit.mjs` (archivo en esta carpeta) | Freeze/base PASS; mismas guardas10/10 en copia sin `.git`, cwd `/private/tmp` | `reviewer-source-audit.json`, `reviewer-archive-guards.log` |
| `AUNARA_BASE_PATH=/aunara/ npm run build` y misma variable para `node scripts/check-pages-client.mjs` | PASS;32 archivos | `reviewer-build-rollback.log`, `reviewer-artifact-rollback.log` |
| `npm run build` y `node scripts/check-pages-client.mjs` | PASS;32 archivos; raíz restaurada al final | `reviewer-build-root.log`, `reviewer-artifact-root.log` |
| `git diff --check` | PASS | inspección final del revisor |

Build incluye comprobación del directorio y TypeScript. Lint N/A: no existe script, no se instaló nada. Regresión concentrada cubierta también por suite fresca completa; el recibo de desarrollo conserva 138/138 focused, directorio4/4, guardas anteriores28/28 y base367/367+Sites1/1. No se repitió baseline costosa porque fuentes base/recibos se mantienen válidos. Reloj real: viernes16Oct Bogotá, TZ unset y NODE_OPTIONS ausente (`reviewer-source-audit.json`); sin preload/reloj alterno. Los cuatro rojos históricos no se reprodujeron; no se declaran arreglados ni se aplica waiver SDD-013.

## Negativos y materialidad de guardas

N1 rechaza constante anterior y mailto de soporte cruzado; N2 rechaza From Supabase y From support en fixture; N3 rechaza host fijo incorrecto y backup divergente; N4 rechaza versión1.1 y consentimiento forzado. Cada mutación usa copias desechables leídas nuevamente; exige cambio efectivo, fallo esperado, restauración de la copia con `validateAll` verde y hashes originales idénticos. Revisado el árbol HTML: validaciones se aplican a enlaces/atributos/nodos visibles reales, no solo presencia de tokens. Invocación fresca10/10 en archivo sin historia Git confirma que shallow/archive no requieren base descargada. Estas guardas no prueban autenticación/SMTP real.

## Superficie real e inspección visual

Reproducir (con loader existente indicado por el principal): `node --loader /private/tmp/aunara-sdd013-runtime.lDUUmv/loader.mjs AUNARA_SOT/sdd/2026-10-16-sdd014-revision/reviewer-ui.mjs /` después del build raíz; igual `/aunara/` después del build rollback. El servidor usa puerto dinámico propio, nunca5173; perfiles sin service worker y todas las solicitudes no-locales abortadas. Copias derivadas del HTML sustituyen únicamente ConfirmationURL por fixture largo `.invalid`, nunca se hace click ni petición Auth. Servidor/navegadores propios cerrados.

Apertura legal mediante drawer real: cerrar propuesta inicial baseline, logo → selector real de idioma → cerrar drawer → burger → cuenta → enlaces legales → cerrar documento. Sin selectores del menú anterior, sin login, usuario/email/password ni cambios de app persistidos fuera del contexto efímero. Dos capturas por estado legal (apertura y contacto tras scroll real).

Resultados: `reviewer-ui-root.json`48/48 y `reviewer-ui-rollback.json`24/24 =72 casos únicos; `reviewer-shots/`120 PNG. `reviewer-shot-index.json` lista todos. Se inspeccionaron visualmente los veinte `reviewer-collage-01.jpg` a `reviewer-collage-20.jpg`, que incluyen las120 capturas finales, no solo DOM. Correspondencia:01–04 emails,05–12 rollback legal,13–20 raíz legal. Copy/CTA y contactos legibles, botones envuelven a320, backup largo no desborda, admin separado. El documento legal largo conserva scroll vertical esperado; no hay corte horizontal ni cambio de layout fuente.

Las calibraciones del harness (propuesta inicial y nombre no presente en términos baseline) no requirieron arreglos de producto. Ninguna aserción de producto se debilitó. No se ejecutaron las matrices históricas grandes SDD-013 porque todo ese código está intacto y esta revisión cubre las superficies afectadas.

## Handoff

Puede avanzar a entrega local enfocada/documentación por el rol correspondiente. No se hizo stage, commit, push, merge ni deploy desde revisión. Pendientes: gate remoto C14-02/04/05/07, Gmail/Outlook C14-06 y UAT/cierre del Operator. No se inspeccionaron credenciales, cuentas de correo, usuarios reales, SMTP/DNS ni secretos.
