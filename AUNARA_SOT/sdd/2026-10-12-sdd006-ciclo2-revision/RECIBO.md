# Recibo de revisión — SDD-006 E2 + E3 + E4, ciclo 2 de 3 · mitad Chromium

Fecha: 2026-10-12 · Revisor: `[AUNARA/claude · modelo no expuesto]`, distinto del agente que construyó E2/E3/E4 (`[AUNARA/codex · modelo no expuesto]`) y sin acceso a `/private/tmp` de la Mac.
Candidato revisado: `wip/sdd006-e4-candidate-2026-10-12` = `6704681`, base `1c709a3`. Control E2: `19dcb4f`. E3: `85e4415`.
Orden que lo manda: [ORDEN-2026-10-12-retomar-sdd006 §3 paso 2](../../ordenes/ORDEN-2026-10-12-retomar-sdd006.md).

## Veredicto

| Lente | Chromium | WebKit | Veredicto del ciclo |
| --- | --- | --- | --- |
| Correctitud (RG-01–06, AR-01–05, CA06-02…06, E1/CL-06) | APRUEBA | NO CORRIDO | **NO CONCLUYENTE** |
| Regresión (storage, Auth 0/200 ms, aviso/legal/footer, geometría, negativos red→green) | APRUEBA, con hallazgo H-01 no bloqueante y preexistente | NO CORRIDO | **NO CONCLUYENTE** |
| Seguridad y datos (tráfico, PII, aislamiento A→B, export sin escrituras) | APRUEBA | NO CORRIDO | **NO CONCLUYENTE** |

**El ciclo 2 no queda APPROVED ni REJECTED desde este entorno.** E3 §7 y E4 §7 dicen «WebKit ausente ⇒ REJECTED»; este entorno solo tiene Chromium (`/opt/pw-browsers`, sin WebKit instalable por red). Tratar la ausencia como rechazo gastaría el ciclo por una limitación del entorno, no del trabajo. Por eso el veredicto es **NO CONCLUYENTE con la mitad Chromium verde**: el ciclo 2 sigue abierto hasta que Codex o el Operator corran la mitad WebKit en la Mac con el mismo harness (§«Cómo completar la mitad WebKit»). Ningún PASS de aquí se hereda a WebKit.

**¿El problema es el trabajo o el objetivo?** Ninguno de los dos en lo medido: el trabajo cumple cada criterio verificable en Chromium y el objetivo de E4 (listar perfil parcial sin depender de onboarding) está bien formulado y falsable. El único rojo real encontrado (H-01) está en `main` publicado, fuera del alcance de E2/E3/E4 y fuera de las allowlists; vuelve a Spec como enmienda futura, no a Build.

## Entorno y reglas aplicadas

- Linux, Node 22, `npm ci` sobre el candidato (dependencias del lockfile). Playwright 1.56.1, **solo Chromium**. Sin red hacia el dominio ni Supabase real.
- Tráfico externo bloqueado antes de navegar (`context.route("**/*")`: todo lo que no es `127.0.0.1` ni `synthetic.supabase.invalid` se aborta y se registra). Supabase 100 % sintético: sesión persistida en `localStorage["sb-synthetic-auth-token"]`, `/auth/v1/user` con 0 o 200 ms, `/rest/v1/repbook_user_data` GET `[]`/fila remota y POST 201. Cero cuentas, correos, tokens o backend reales; únicos correos `*@example.invalid`.
- Builds con `VITE_SUPABASE_URL=https://synthetic.supabase.invalid VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_synthetic_000`, bases `/` y `/aunara/`, servidos por `harness/server.mjs` imitando Pages (404.html como fallback SPA, 404 fuera de base).
- Contextos con `serviceWorkers: "block"` para aislar fixtures (igual que la matriz de SDD-004 E2). Playwright emite un `warning` por eso; el colector de consola lo filtra por patrón y **solo ese** patrón (`lib.mjs` `HARNESS_NOISE`). Línea base de consola: cero mensajes previos al guion en todos los contextos.
- Ningún cambio de producto, SDK, dependencias, configuración ni tiempos para ocultar un rojo. Los únicos ajustes durante la revisión fueron al harness, y cada uno está anotado abajo con su causa.

## Resultados por criterio (Chromium)

Archivos de resultado en `resultados/`. Cada fila JSON lleva `name`, `pass` y `detail` con los valores medidos.

### E3 — arranque y almacenamiento (AR-01…AR-08)

| Criterio | Evidencia | Resultado |
| --- | --- | --- |
| AR-01 get-only bloquea con pantalla honesta | `storage-matrix.json`, variante `get-only`, E4 × `/`,`/aunara/` × ES/EN × 1440/390/320: `[role=alert] h1` = «No se pudo iniciar Aunara» / «Aunara could not start», lectura denegada comprobada en el texto, selector ES/EN y botón Recargar presentes (3 botones), 1 sola `.app-shell`, sin `pageerror`, sin App montada, sin llamadas a `/auth/v1/user`. | 12/12 PASS |
| AR-02 paridad con el control E2 en las demás variantes | Mismo archivo, 8 variantes × 2 builds (E4 y control E2 `19dcb4f`) × 2 bases × 2 idiomas × 3 viewports = 192 contextos por build. Control E2 en `get-only`: **blank** (pantalla vacía, 0 hijos en `#root`) 12/12, reproduce CL-07. Variantes `none`, `set-only`, `get+set`, `getter-throws`, `remove-only`, `get+remove`, `all-denied`: mismo resultado en E4 y E2 (App monta o bloqueo honesto solo cuando el SDK rechaza la carga). | 192/192 PASS (276/276 contando la pasada de control corregida en `storage-matrix-subset.json` 24/24; la pasada inicial clasificó mal el control E2 como `error` por un selector del harness, no por el producto) |
| AR-03 permiso restaurado + recarga monta App | `startup-fallback.json`: bloqueo get-only → se retira la negación → clic en Recargar (detectado por `window.__aunaraMarker`) → `.shared-navigation` + `div.app-shell` presentes y perfil/rutas sembrados conservados; sin escrituras ni borrados de storage por el fallback (claves `repbook-*` byte a byte iguales). | 12/12 PASS |
| AR-04 fallo de import no-Storage muestra «No se pudo cargar Aunara» | Mismo archivo: ruta del chunk `App-*.js` abortada por el harness con lectura disponible → `[role=alert] h1` «No se pudo cargar Aunara» / «Aunara could not load», sin pedir permisos/correo/cuenta, sin App falsa. | 12/12 PASS |
| AR-05 una raíz, un import, un cliente, consola limpia | Mismo archivo: `.app-shell` = 1, `#root.children` = 1, un solo request del chunk `App-*`, un solo `GET /auth/v1/user`, delta de consola vacío tras filtrar el aviso de SW. Recovery 0/200 ms premount cubierto en `auth-recovery.json`. | 12/12 PASS (la pasada previa 72/84 fallaba únicamente por el aviso de Playwright sobre SW; se filtró ese patrón y se repitió completa: **84/84**) |
| AR-06 delta E3 − E2 solo `main.tsx` + test + docs propias | `git diff --name-status 19dcb4f 85e4415`: `A src/main.test.tsx`, `M src/main.tsx` y 7 docs de `AUNARA_SOT/`. Nada más. | PASS |
| AR-07 builds/guard/inventario | Build raíz: 32 assets, `check-pages-client` allowlist 32 PASS; rollback `/aunara/`: allowlist 32 PASS. Comparado contra el build de control E2: los 27 estáticos y el CSS son byte a byte idénticos; la única adición es el chunk `App-*.js` (frontera dinámica). Guards 27/27. Negativos del guard CLI sobre copia del artifact: N1 archivo extra, N2 PNG arbitrario en `brand/`, N3 symlink, N4 HTML con referencia fuera del artifact, N5 artifact raíz validado como `/aunara/` → los cinco **rechazados**; N0 y N6 (normal/restaurado) pasan. | PASS |
| AR-08 evidencia fresca por criterio, sin PASS heredado | Este recibo; cada fila tiene su archivo. Lo que no se corrió está marcado NO CORRIDO. | Parcial: WebKit NO CORRIDO |

### E4 — resumen de perfil y preferencias (RG-01…RG-08)

| Criterio | Evidencia | Resultado |
| --- | --- | --- |
| RG-01 rojo en E3, verde en E4 | `rg01-redgreen.log`: tests de E4 (`AppFlows.test.tsx` + `AccessPanel.test.tsx`) sobre `App.tsx` de E3 (`85e4415`): **19 fallan / 110 pasan** (nombre parcial ES/EN con onboarding false/undefined, cada preferencia por separado, export estable). Restaurado `App.tsx` de E4 (sha `8dc3b2ee…` igual al candidato): **129/129**. UI compilada en `privacy-summary.json`: snapshot válido sin `initialRoutineDecision` inválido, onboarding false/omitido, nombre o preferencia → exactamente una categoría «Perfil y preferencias» / «Profile and preferences». | PASS |
| RG-02 defaults no producen perfil | `privacy-summary.json`: defaults, opcionales omitidos, nombre vacío/espacios/`Mi perfil`, `goals` omitido, idioma/consentimiento/marcadores de rutas solos → `.privacy-summary li` sin categoría de perfil. | PASS |
| RG-03 completado y cada preferencia por separado | Mismo archivo: onboarding true conserva la categoría; nombre parcial solo y cada una de `primaryGoal`, `goals`, `sport`, `equipmentPreference`, `trainingDaysPerWeek`, `sessionMinutes`, `experience` la producen por separado. Sin reescritura de defaults (export posterior idéntico). | PASS |
| RG-04 rutas/favoritos/check-ins/salud | Mismo archivo: 0/n para rutas, favoritos y check-ins; salud con `granted` aparece, con `declined`/`revoked`/`null` no aparece; legacy local sin dueño no suma categoría ni conteo. | PASS |
| RG-05 invitado y A→B | Mismo archivo: invitado sin `.sync-trigger` ni centro privado; sesión A con datos → salida → sesión B con remoto vacío: lista de B vacía, nombre de A ausente del DOM y del export de B; hook/SDK real con sesión sintética, no mock de email. | PASS |
| RG-06 sin escrituras por abrir/cerrar/idioma/recarga | Mismo archivo: export JSON (`j.data`) antes/después iguales salvo timestamp; conteo de `POST /rest/v1/repbook_user_data` sin aumento atribuible al resumen (los POST observados corresponden al sync existente por cambio de idioma, distinguidos por timing); sin `setItem`/`removeItem` nuevos (proxy de storage). | PASS |
| RG-07 delta E4 − E3 en allowlist | `git diff --name-status 85e4415 6704681`: `M src/App.tsx`, `M src/components/AppFlows.test.tsx`, `M src/components/AccessPanel.test.tsx`, `A AUNARA_SOT/sdd/SDD-006-enmienda-4-…md` y 4 docs de SOT. `main.tsx`/`main.test.tsx` idénticos a E3 (hash). | PASS |
| RG-08 todo lo anterior completo y revisión APPROVED | Mitad Chromium completa; WebKit NO CORRIDO. | **NO CONCLUYENTE** |

Totales de `privacy-summary.json`: 84 filas = RG-01…06 × `/`,`/aunara/` × ES/EN. Pasada inicial 72/84; las 12 filas rojas (`RG-03 completado sin nombre`, `RG-05 invitado`, `RG-06 export`) eran del harness (esperaba `.sync-trigger` en una sesión invitada y leía la forma de export equivocada); corregido el guion se repitió **ese subconjunto 12/12** en `privacy-summary-subset.json` sin tocar producto. Suma: 84/84.

Automatizados sobre `6704681` (`rg01-redgreen.log`): typecheck OK; suite completa Vitest **348 pruebas / 25 archivos** + Node 1 (misma línea base registrada en el paso 1; la adición respecto de E3 309/25 es exactamente +39 pruebas en los dos archivos de la allowlist E4).

### E2 — consolidación (CL-01…CL-09) y matrices pendientes

| Criterio | Evidencia | Resultado |
| --- | --- | --- |
| CL-01/CL-02/CL-03 base, manifest, canónico intacto | Tres commits sobre `1c709a3`; E2 = 41 archivos técnicos + 11 docs (coincide con el manifest «41/175»); E3 y E4 deltas exactos (AR-06/RG-07). Sin `.env*`, tokens, capturas ni referencias privadas (auditoría del paso 1). | PASS |
| CL-04 checks frescos y negativos red→green | `negatives.log`: positivo de control GREEN en 4 modos; mutaciones una por vez sobre copia disposable y restauración con `git checkout`: `guest-private` (invitado ve Biblioteca/Perfil) RED, `float-overlap` (flotante fijo tapa «RUTA / 02» y «Actualizar sugerencias») RED, `e3-static-import` (import estático de App ⇒ 0 shells, pantalla vacía en get-only) RED, `e3-classification` (`readBlocked=false` ⇒ texto «No se pudo cargar» en vez de «iniciar») RED, `e3-duplicate-root` (2 `.app-shell`) RED, negativo unitario `shared-targets` (WorkoutPanel) 2 tests rojos. Worktree restaurado: 0 sucios; artifact restaurado con la misma lista de archivos que `e4-root`. | 6/6 RED, controles GREEN · PASS |
| CL-05 UI compilada Chromium: navegación/acceso/modal/instalación/legal/footer/flotante | `ui-navigation.json` + `geometry-roundtrip.json`, ver tablas siguientes. | Ver abajo |
| CL-06 round-trip E1 | `geometry-roundtrip.json`: triserie (`0047`/`0662`/`0630`) con 8 reps, fallo técnico y 20 por lado: render, export y recarga conservan IDs, notas, `primaryGoal`, historial y `repetitionCount` (12 filas); enum inválido remoto se rechaza sin pérdida local (4 filas). `/`,`/aunara/` × ES/EN. | 16/16 PASS |
| CL-07 storage + Auth 0/200 ms | AR-01/AR-02 arriba (192 contextos) y `auth-recovery.json`: PASSWORD_RECOVERY con `/auth/v1/user` a 0 ms y 200 ms, ambas bases, ES/EN, 1440/390 → `.password-recovery` sin esperas fijas; negativos 401 (token inválido/expirado), hash `type=signup` y sin callback → sin formulario; token nunca aparece en el DOM; recarga sin hash no reabre la recuperación (consumo único). | 42/42 PASS |
| CL-08 revisor independiente APPROVED | Este recibo. Independiente sí; APPROVED no, por WebKit. | NO CONCLUYENTE |
| CL-09 árbol del commit = candidato + docs | No aplica todavía: no hay commit de código en `dev` (gate). | PENDIENTE (correcto) |

#### `ui-navigation.json` — CA06-02…06, aviso de almacenamiento y diálogos legales

Contextos: `/`,`/aunara/` × ES/EN × 1440/390/320 = 12, tres bloques por contexto (invitado, sesión, standalone) = 156 filas.

| Fila | Qué mide | Resultado |
| --- | --- | --- |
| SDD-002 aviso de almacenamiento | Aviso visible sin `aunara-storage-notice-v1`; al cerrarlo persiste `"1"` y no reaparece. | 12/12 |
| CA06-02 menú compartido | Hamburguesa en móvil / logo en escritorio abre `#aunara-navigation`; Escape cierra; el foco vuelve al disparador. | 12/12 |
| CA06-02 inventario público (invitado) | Invitado ve «Inicio / rutas», «Ingresar / crear cuenta», «Idioma / configuración», «Ayuda / instalación» y **no** Biblioteca, Perfil ni Salir. | 12/12 |
| CA06-03 invitado sin datos privados | Sin `.sync-trigger`, sin centro de privacidad ni resumen de datos; `.guest-account-button` presente. | 12/12 |
| CA06-06 slogan y sin overflow | «Tu propósito marca el camino.» / «Your purpose leads the way.» según idioma; sin scroll horizontal a 1440/390/320. | 12/12 |
| SDD-002 diálogos Términos / Privacidad / Cookies | Abren como diálogo con versión 1.0, cierran con Escape y devuelven el foco. | 36/36 |
| Consola invitado | Delta de consola vacío tras filtrar el aviso de SW. | 12/12 |
| CA06-02 inventario privado (sesión) | Con sesión sintética el menú agrega Biblioteca de ejercicios, Perfil y Salir. | 12/12 |
| CA06-04 modal de borrado | Botón deshabilitado con campo vacío, con «eliminar» en minúsculas y con la palabra del otro idioma; habilitado solo con «ELIMINAR»/«DELETE» exacto; Escape no borra; reabrir resetea el campo; cambio de idioma resetea la entrada; Cancelar cierra sin llamadas; confirmación válida invoca `delete-my-account` exactamente una vez. | 12/12 |
| CA06-05 instalación visible / standalone | En navegador la sección de instalación y la ayuda están; con `display-mode: standalone` se ocultan. | 24/24 |

Total: **156/156 PASS** (pasada anterior 145/156: las 11 rojas eran el timeout de visibilidad del propio harness descrito en «Ajustes de harness»; corregido con `state: "attached"` y repetida la matriz completa).

#### `geometry-roundtrip.json` — E1 round-trip, CA06-06 flotante/badge, footer

| Fila | Qué mide | Resultado |
| --- | --- | --- |
| E1 round-trip (CL-06) | 8 combinaciones, ver arriba. | 12/12 (render triserie, export, recarga × `/`,`/aunara/` × ES/EN) + enum inválido rechazado 4/4 |
| E1 consola | Delta vacío. | 4/4 |
| CA06-06 flotante/badge/overflow | 390 y 320 × ES/EN × bases: botón `.mobile-workout` presente (≥ 52 px) al final del flujo, cero intersecciones con botones/inputs/links/`.track-card` al inicio, mitad y final del scroll, badge acotado, sin overflow horizontal. | 16/16 |
| Footer | Sin solapamiento ni salto de línea del slogan a 375/1049/1050/1051 px. | 16/16 |

Total: **52/52 PASS**.

## Hallazgos

### H-01 · `useCloudSync` queda en `syncing` si el snapshot vuelve al último guardado dentro de la ventana de debounce (preexistente en `main`, no bloqueante)

- **Dónde:** `src/hooks/useCloudSync.ts`, efecto de guardado con debounce (en `6704681` líneas 289–311; en `main` `1c709a3` líneas 202–224, **bloque idéntico**). El efecto hace `setStatus("syncing")` y programa `save` a 800 ms; si el snapshot cambia de nuevo antes de los 800 ms y el nuevo valor es igual a `lastSavedSnapshot`, el re-run retorna temprano sin restaurar el status ni programar guardado.
- **Repro (Chromium, `harness/` + probe):** sesión sintética sincronizada → abrir cuenta → «Eliminar cuenta permanentemente» → escribir ELIMINAR → cambiar idioma a EN y volver a ES **sin pausa** (dos `selectOption` seguidos). Resultado medido 12 s: clase del botón de cuenta `is-syncing` constante, Cancelar deshabilitado, **1** `POST repbook_user_data` (el bootstrap), ningún guardado. Con 2,5 s entre cambios: `is-synced`, Cancelar habilitado, 3 POST. Se recupera con cualquier cambio posterior del snapshot (tercer cambio de idioma → `is-synced`, 2 POST).
- **Impacto en producto:** mientras dura, todo control condicionado a `cloud.status === "syncing"` queda deshabilitado (Cancelar/Eliminar del modal, Ingresar, Recuperar contraseña, consentimiento). En `main` publicado pasa lo mismo con los botones del panel de cuenta; E2 agrega el modal de borrado como superficie nueva expuesta al mismo estado. No hay pérdida de datos: el snapshot local ya es igual al remoto.
- **Clasificación:** no es criterio de E2/E3/E4 §7 y el archivo está fuera de las tres allowlists. **No cuenta como rechazo** de este ciclo. Va a Spec como enmienda propia (una línea: restaurar `synced` o `local` en el retorno temprano, con test del hook en `useCloudSync.test.tsx`). Registrado en PENDIENTES.
- **Ajuste de harness derivado:** `ui-navigation.mjs` ahora espera `.sync-trigger.is-synced` entre los dos cambios de idioma, para que el paso mida el modal y no esta carrera. Es el único «tiempo» agregado y está comentado en el guion con referencia a este hallazgo.

### Ajustes de harness durante la revisión (ninguno toca producto)

| Síntoma | Causa | Ajuste |
| --- | --- | --- |
| 12 filas rojas de consola en startup/ui/geometría | `warning: Service Worker registration blocked by Playwright`, emitido por el propio `serviceWorkers:"block"` | Filtro por ese patrón exacto en `lib.mjs`; repetidas las tres matrices |
| Control E2 `get-only` clasificado `error` | El harness buscaba `main.app-shell`; el shell es `div.app-shell` | Selector corregido; subconjunto repetido 24/24 |
| RG-03/05/06 timeouts en invitado | Guion esperaba `.sync-trigger` (no existe en invitado) y leía el export sin `.data` | Guion corregido; subconjunto 12/12 |
| Cancelar deshabilitado tras cambio de idioma rápido | H-01 | Espera de `.sync-trigger.is-synced` entre cambios, con `state: "attached"` (la primera versión esperaba visibilidad y el header no cuenta como visible con el modal abierto; 11 timeouts del harness, repetida la matriz completa) |
| Reload no detectado en AR-03 | Service worker servía el chunk de App desde caché | `serviceWorkers:"block"` en todos los contextos |

## Cómo completar la mitad WebKit (Codex u Operator, en la Mac)

```bash
# 1. candidato y dependencias
git fetch origin wip/sdd006-e4-candidate-2026-10-12 wip/sdd006-e2-candidate-2026-10-12
git worktree add /tmp/aunara-review/e4 6704681 && (cd /tmp/aunara-review/e4 && npm ci)
git worktree add /tmp/aunara-review/e2 19dcb4f && (cd /tmp/aunara-review/e2 && npm ci)
# 2. builds sintéticos (cuatro)
export VITE_SUPABASE_URL=https://synthetic.supabase.invalid VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_synthetic_000
for w in e4 e2; do for b in "/:root" "/aunara/:aunara"; do base="${b%%:*}"; name="${b##*:}";
  (cd /tmp/aunara-review/$w && AUNARA_BASE_PATH="$base" npm run build >/dev/null && node scripts/check-pages-client.mjs >/dev/null && mkdir -p ../builds && rm -rf "../builds/$w-$name" && cp -r dist/client "../builds/$w-$name"); done; done
# 3. harness
cp -r AUNARA_SOT/sdd/2026-10-12-sdd006-ciclo2-revision/harness /tmp/aunara-review/harness && mkdir -p /tmp/aunara-review/results
cd /tmp/aunara-review/harness && npm i playwright@1.56.1 && npx playwright install webkit
# 4. matrices en WebKit, una por vez, a archivo
for s in storage-matrix startup-fallback auth-recovery privacy-summary ui-navigation geometry-roundtrip; do BROWSER=webkit node $s.mjs > ../results/$s-webkit.log 2>&1; tail -1 ../results/$s-webkit.log; done
BROWSER=webkit bash negatives.sh > ../results/negatives-webkit.log 2>&1; tail -3 ../results/negatives-webkit.log
```

Criterio de cierre: los seis guiones en `n/n PASS` y `negatives` con 6 RED + controles GREEN. Copiar `results/*-webkit.*` a `resultados/` de esta carpeta y completar la columna WebKit de la tabla de veredicto. Si algo sale rojo en WebKit y no en Chromium, es hallazgo de motor y hay que leer la fila (`detail`) antes de atribuirlo al producto. Dos reintentos máximo por paso; después, NO CONCLUYENTE, no «falla».

## Lo que este recibo no afirma

- No afirma APPROVED del ciclo 2 ni autoriza commit de código a `dev`, merge ni publicación.
- No afirma nada sobre UAT real, cuentas/correos reales, Safari/iPhone/Android físicos ni PWA instalada.
- No cierra H-01: queda en PENDIENTES como enmienda futura fuera de 006.
