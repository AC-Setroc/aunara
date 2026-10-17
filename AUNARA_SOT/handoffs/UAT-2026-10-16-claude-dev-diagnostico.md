# Diagnóstico de `dev` y UAT automatizada — 2026-10-16

`[AUNARA/claude · modelo no expuesto]` · Base: `dev` `d2ba0aa` (SDD-006 + 011 + 012 + 013 + 014). `main` `dfffa87` (aplicación publicada `1c709a3`). Orden del Operator: «Dame diagnóstico del estado actual en dev. Corré un UAT y si encontrás fallos los listas y al final me das un resumen para que Codex corrija». Evidencia en [`sdd/2026-10-16-uat-dev-revision/`](../sdd/2026-10-16-uat-dev-revision/README.md).

## 1. Qué se probó y cómo

Builds de `d2ba0aa` para `/` y `/aunara/` apuntando al Supabase sintético del harness (sin cuentas, correos ni datos reales), Chromium y WebKit 26 (Playwright, Linux), ES/EN, 1440/390/320. Todo compilado y reproducible; nada manual.

| Bloque | Qué cubre | Chromium | WebKit |
|---|---|---|---|
| Seis matrices del ciclo 2 (adaptador de SDD-013) | almacenamiento denegado 276 · arranque 84 · Auth/recuperación 42 · privacidad/exportación 84 · navegación/modal/legal/standalone 156 · geometría/triserie/flotante/footer 52 | 6/6 verdes | 6/6 verdes |
| `sdd013-checks` con línea base (`d381e52`) | drawer, cabecera, inventarios, foco, consentimiento, footer, modal de borrado vs. base | 393/393 × 2 bases | 393/393 × 2 bases |
| `sdd012-checks` adaptado | portal, barra, idioma en el panel, Salir en perfil, preferencias al instante, reenvío legible | 70/70 × 2 bases | 70/70 × 2 bases |
| Recorrido §2/§2b (`uat16-walkthrough`) | dos dispositivos con la misma cuenta (§2-10), contacto legal nuevo (SDD-014), editor con triserie sin «Plan de series» fijo (§2b-18), inventario del menú, Cuenta / privacidad (§2b-17), perfil con Salir (§2b-13), consola por pantalla | 25/25 | 25/25 |
| Estático | bundle sin `alejandro@ac-setroc.com`, con `admin@aunaratraining.com`; plantillas de correo fuera del cliente; `git diff --check` | OK | — |
| Unitario | suite con fecha real (viernes) 367/25; con reloj en miércoles 2026-10-14: 4 rojos | OK | — |

Puntos del guion cubiertos por bloques: 1 (Auth sintético), 2 (privacidad), 3 (menú), 4 (modal de borrado), 5 (H-02 vía matrices de privacidad/consentimiento), 6 (H-01), 7 (triserie/export/flotante), 8 (almacenamiento denegado, aviso GitHub Pages), 9 (standalone), 10 (dos dispositivos), 11–22 (SDD-012/013).

## 2. Defectos de producto encontrados

Ninguno bloqueante en lo automatizable. Lo que sí quedó medido y conviene corregir, por prioridad:

1. **P1 · Cuatro pruebas fallan solo los miércoles** (`AppFlows.test.tsx` «keeps routine editing separate…», `WorkoutPanel.test.tsx` «removes a member from 2/3 slots…», «chooses exercises before structure…»). Causa: `WorkoutPanel.tsx:139` abre en el día actual si la ruta lo incluye y los fixtures tienen lunes y miércoles con aserciones sobre el lunes. Reproducido con reloj controlado (`harness/wednesday-clock.cjs`): 4 rojos; fecha real viernes 367/367. **Consecuencia:** CI `verify` ejecuta `npm test` en cada push a `main`; un merge un miércoles UTC no despliega. Corrección: fixtures con un solo día o inyectar el reloj en esas pruebas; no tocar `WorkoutPanel`.
2. **P2 · Fila remota inválida ⇒ el cliente pisa el servidor con sus valores locales.** Medido con `validate-row.ts` y el probe de dos dispositivos: si `GET repbook_user_data` devuelve un snapshot que `normalizeRepbookSnapshot` rechaza (por ejemplo `sport: ""` o una triserie con `position ≥ size`), el cliente conserva su estado local (correcto, CL-06) **y además hace `POST` con ese estado local**, reemplazando la fila del servidor. Hoy los clientes escriben filas válidas, así que no se reproduce con uso normal; el riesgo aparece con un cliente viejo en caché (PWA) frente a un esquema nuevo. Candidato a spec junto con H-03: no subir cuando el remoto fue rechazado por esquema, o versionar.
3. **P3 · Test nuevo fuera de CI.** `scripts/auth-email-templates.node-test.mjs` (SDD-014) pasa 10/10 pero no está en `npm test`; CI no lo ejecuta. Requiere orden para tocar `package.json`.
4. **P3 · Aviso legal con contacto nuevo y versión/fecha sin cambio.** La política muestra `admin@aunaratraining.com` con versión 1.0 y vigencia 2026-07-29. Decisión del Operator (v1.0/v1.1), no código.

Observaciones sin acción de código: el menú público muestra dos filas «Inicio» («Inicio / rutas» y «Inicio» ancla), ya anotado por Codex como UX; el inventario con sesión es Inicio / rutas · Biblioteca · Perfil · Entrenamiento de hoy · Sincronizado · Cuenta / privacidad · Ayuda · Salir, sin duplicados.

## 3. Ajustes del harness (no son defectos del producto)

- `sdd012-checks`/`lib`: perfil y cierre se abren por el drawer (`.navigation-row`, `.navigation-close`); la barra ya no tiene indicador de sync (espera fija tras el bootstrap); el `nav` del drawer agrupa filas (`display: block`), así que S12-01 acepta `grid` o `block` con columna y sin overflow; las filas cuentan `button, a[href]`.
- `uat16-walkthrough`: el helper del Supabase sintético reinicia el estado al instalarse, así que el segundo dispositivo recibe la fila explícitamente; los fixtures deben pasar el validador del snapshot (`sport` ausente, `position < size`), de lo contrario se mide el punto 2 de §2 y no la sincronización.
- Primera pasada descartada: los builds no llevaban `VITE_SUPABASE_URL` sintético (app sin nube). Rehecho con las variables del README del harness.

## 4. Lo que esta UAT no prueba

Correo real (confirmación, recuperación, remitente), Safari físico e iPhone, retorno LAN→producción (D-13-4), aceptación visual del drawer/wordmark/footer, SMTP/Zoho y plantillas en el dashboard (SDD-014 gate remoto), PWA instalada en dispositivo. Eso sigue siendo del Operator con Codex en la Mac (guion §2 y §2b).


## 5. Resumen para Codex

1. Spec corta y corrección de las cuatro pruebas dependientes del día (solo tests; `WorkoutPanel` NO-TOCAR). Verificar con `NODE_OPTIONS=--require=<ruta>/wednesday-clock.cjs npm test` y con fecha real.
2. Spec para «remoto rechazado por esquema no se sobrescribe» (puede ir con H-03). Evidencia: `harness/validate-row.ts` + `uat16-walkthrough.mjs` W-01 con un fixture inválido.
3. Pedir al Operator la orden para incluir `scripts/auth-email-templates.node-test.mjs` en `npm test` (o en CI).
4. Versionar en la SOT el harness adaptado a SDD-013 como base del ciclo 3 (ya copiado en `sdd/2026-10-16-uat-dev-revision/harness/`), para no volver a adaptar a mano.
5. Nada de SDD-012/013/014 requiere corrección por esta UAT; la aceptación humana sigue pendiente.
