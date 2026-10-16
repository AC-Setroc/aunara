# UAT manual sobre `dev` — guion para Codex y el Operator

2026-10-12 · `[AUNARA/claude · modelo no expuesto]` · Base: `dev` = `551152e` (código: SDD-006 E2+E3+E4 `1d4ccc9`, SDD-011 H-01 `8db846e`, H-02 `13a1264`). Todo con APPROVED técnico en Chromium y WebKit; lo que sigue es lo que ningún harness puede acreditar: cuenta, correo, Safari e iPhone reales.

## 1. Entorno de prueba

El Operator no ejecuta terminal. Opciones evaluadas el 2026-10-12:

| Opción | Qué es | Estado |
|---|---|---|
| A. Mac, worktree de `dev` + `npm run dev -- --host` con `.env.local` | Entorno más fiel (Supabase real, service worker en el simulador de Xcode) | **Codex la ejecuta en la Mac**; el Operator no corre procesos que no conoce. Receta abajo. |
| B. Vercel preview `aunara-uat.vercel.app` desde el conector de la sesión | URL https en el iPhone real; proyecto separado, automáticos apagados, `noindex`, borrado al terminar | Viable (acceso GitHub y claves verificados). **No ejecutada**: el Operator prefirió esperar a Codex. Costos si se retoma: tercero fuera del inventario de cumplimiento; agregar `https://aunara-uat.vercel.app/**` a Supabase → Authentication → URL Configuration → Redirect URLs para que vuelvan los correos. |
| C. Artifact de claude.ai | Descartada | Origen, enrutamiento y service worker no se comportan como en Pages; falsos negativos. |

Receta A (Codex, en la Mac, sin tocar la carpeta canónica ni su dirty):

```bash
cd "$HOME/AI Projects/Personal/aunara"
git fetch origin dev
git worktree add "$HOME/aunara-uat" dev
cp .env.local "$HOME/aunara-uat/.env.local"
cd "$HOME/aunara-uat" && npm ci && npm run dev -- --host
```

Simulador de Xcode: `http://localhost:5173`. iPhone real en la misma Wi‑Fi: la dirección «Network» que imprime Vite (sin https no hay service worker: instalación y offline solo en simulador o producción). Build de producción local: `AUNARA_BASE_PATH=/ npm run build && npx serve -s dist/client -l 4173`. Al terminar: `git worktree remove "$HOME/aunara-uat"`. Usa Supabase real: cuentas, correos y datos son reales; usar una cuenta de prueba.

## 2. Guion (marcar PASA / FALLA / NO PROBADO con evidencia: pantalla, pasos, qué se vio)

| # | Qué probar | Qué debe verse | SDD |
|---|---|---|---|
| 1 | Crear cuenta con correo real, recibir y confirmar; ingresar; recuperar contraseña desde el enlace del correo | Formulario de nueva contraseña aparece sin esperas al volver del enlace; sesión queda activa | 003, 004 E2 |
| 2 | Onboarding completo; y onboarding abandonado con solo el nombre o una preferencia | «Cuenta / privacidad» lista «Perfil y preferencias» en ambos casos; vacío total no la lista | 006 E4 |
| 3 | Menú como invitado y con sesión | Invitado sin Biblioteca/Perfil/Salir; con sesión sí; Escape cierra y el foco vuelve al disparador | 006 CA06-02/03 |
| 4 | Modal de borrado | Solo «ELIMINAR» exacto habilita; cambiar idioma resetea el campo; Escape no borra; borrar la cuenta de prueba y verificar en Supabase que desaparece | 006 CA06-04 |
| 5 | Salud y consentimiento | Autorizar, cargar medidas y una nota: la fila en Supabase las tiene. Revocar: fila y perfil local sin ellas, preferencias intactas. **Sin autorización: ¿la pantalla deja escribir datos de salud?** (no verificado por harness) | 011 H-02 |
| 6 | Cambios rápidos | Cambiar idioma dos veces seguidas con el modal de borrado abierto: Cancelar sigue activo | 011 H-01 |
| 7 | Rutina con triserie | 8 reps, fallo técnico y 20 por lado; guardar, editar, exportar JSON, recargar; botón flotante no tapa nada en iPhone | 006 E1 |
| 8 | Aviso de almacenamiento y diálogos legales | Dicen GitHub Pages y versión 1.0; Safari privado o «Bloquear todas las cookies» muestra «No se pudo iniciar Aunara», no pantalla en blanco | 002, 006 E3 |
| 9 | Instalar como PWA (simulador) y abrir en standalone | La sección de instalación se oculta | 006 CA06-05 |
| 10 | Dos dispositivos o navegadores con la misma cuenta | Cambios en uno aparecen en el otro al recargar; nombre y preferencias se mantienen | 003/004 |

Un FALLA no se parchea en la UAT: se registra con evidencia y vuelve a Spec como hallazgo o enmienda.

## 2b. Re-verificación tras SDD-012 (2026-10-13, `dev` ≥ `d381e52`)

Prerrequisito: Supabase → Authentication → URL Configuration → Redirect URLs incluye `http://localhost:5173/**` y el origen LAN que imprime Vite; si no, los enlaces de los correos siguen llevando a producción (UAT13-21) y las capturas mezclan entornos. Verificar que la pantalla dice `dev` por el slogan y el crédito del footer antes de cada punto.

2026-10-16: `dev` ≥ `d344eeb` incluye además SDD-013 (menú lateral desde el borde derecho, wordmark en la cabecera móvil, consentimiento opcional sin recuadro, footer alineado). Los puntos 11 y 12 se leen con esa presentación; los puntos 19–22 la cubren.

| # | Qué probar | Qué debe verse | Decisión que confirma |
|---|---|---|---|
| 11 | Tocar el logo y la hamburguesa, invitado y con sesión, iPhone y escritorio | El menú se abre como panel lateral pegado al borde derecho (ancho completo en móvil), en columna, dentro de la pantalla; la hamburguesa está a la derecha de la barra | S12-01/02, S13-01 |
| 12 | Barra superior | Solo logo y hamburguesa; dentro del menú están Inicio / rutas, Biblioteca, Perfil, Entrenamiento de hoy, Cuenta / sincronización, «Ingresar / crear cuenta» o «Cuenta / privacidad», Ayuda, selector de idioma (cambia ES/EN sin cerrar el menú) y Salir con sesión | D-12-1 superada por D-13-2 |
| 13 | Perfil con sesión | Botón «Salir» junto a «Listo»; al pulsarlo cierra el perfil y cierra la sesión. Como invitado no aparece | S12-04 |
| 14 | Perfil → Preferencias de entrenamiento | Un solo control «Experiencia entrenando»; cambiarlo y pulsar «Listo» lo conserva al reabrir y tras recargar; «Cuerpo y salud» no tiene otro; no existe «Guardar preferencias» | D-12-3, UAT13-22 |
| 15 | Cuenta pendiente de confirmación | «Reenviar correo de confirmación» se lee sin pasar el mouse | UAT13-06 |
| 16 | Footer con sesión iniciada, ES/EN | Muestra «Desarrollado por» con el wordmark; «Privacidad» y «Términos» se leen con y sin hover | UAT13-13/15 (las capturas del 13 eran de producción) |
| 17 | Menú → «Cuenta / privacidad» con sesión | Lista «Perfil y preferencias», permite exportar y tiene «Eliminar cuenta» con el modal de confirmación | UAT13-14/16 |
| 18 | Editor de rutina, un ejercicio con triserie | Un solo bloque de series por ejercicio; no aparece «Plan de series» repetido como texto fijo | UAT13-19 (la captura era de producción) |
| 19 | Cabecera en iPhone (390 y 320 de ancho), ES/EN | Se ve el wordmark completo «Aunara Training Systems», no solo el símbolo; nada se corta ni se superpone | S13-02 |
| 20 | Menú abierto: Tab y Shift+Tab desde el botón de cerrar | El foco recorre cierre, destinos y selector de idioma sin salir al fondo; Escape, cerrar y tocar fuera devuelven el foco al botón que lo abrió | S13-04 |
| 21 | Crear cuenta → bloque de consentimientos | El consentimiento opcional de salud no tiene recuadro propio y su texto se lee en verde oscuro; se puede crear cuenta sin autorizarlo y no sin aceptar los términos | S13-05, UAT13-05 |
| 22 | Footer, ES/EN, escritorio y móvil | Logo Aunara sobre el slogan en el mismo eje; «Desarrollado por» y AC Setroc lado a lado y centrados | S13-06, UAT13-01/02 |

Un FALLA vuelve a Spec como hallazgo, igual que en §2.

## 3. Después de la UAT

- Si todo PASA: el Operator emite la orden de publicación (paso 3 de la [orden](../ordenes/ORDEN-2026-10-12-retomar-sdd006.md)): merge de `dev` a `main`, Actions verify + deploy, smoke en `https://aunaratraining.com/`, y verificar que el aviso ya dice GitHub Pages.
- Decisiones abiertas del Operator: versión legal v1.0/v1.1 (ahora con H-02 como argumento adicional), H-03, CA-07 de Auth, feedback de Danny, dependencias `latest`.
