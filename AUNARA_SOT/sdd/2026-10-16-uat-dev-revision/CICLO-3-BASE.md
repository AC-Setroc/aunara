# Base versionada para ciclo 3 — inventario y límites

2026-10-16 · `[AUNARA/codex · modelo no expuesto]` · base `999c8f6`.

## Qué queda preservado

El harness adaptado a SDD-013 **ya está en Git**, junto con sus resultados Chromium/WebKit, en `999c8f6`. Esta orden no lo duplica ni reescribe. El [diagnóstico](../../handoffs/UAT-2026-10-16-claude-dev-diagnostico.md) acredita la corrida previa; no equivale a haberla repetido en Mac.

| Archivo bajo harness/ | SHA-256 de la base |
|---|---|
| lib.mjs | c6c2b50787e56622cbc5ffef808ce1068f4178323f4b0174091430e74bf05989 |
| run-engine.sh | 130054304651c6bdd43ae573705958b888b58095d9f16a4655f78677632e5eac |
| sdd012-checks.mjs | 71dfa117a5f4fceb12233aea1b1d56d5fa3afa535baee8461bee887c2979ef55 |
| uat16-walkthrough.mjs | a013b14bc5d9ae536965fd91ad8da72a326119c401335efdf6d849044158ee2d |
| validate-row.ts | 149b3c8eedd20fe51ab7b68381b0785401e23fb5fd451cf162be6b150e15340f |
| wednesday-clock.cjs | b679affb97bed5a9ab80a159a3c15b0225cb3905ca3106d81c60e49f8dd92d20 |

Adaptaciones preservadas: perfil/cierre por drawer, filas button/enlace, idioma en menú y ausencia de indicador de sincronización en cabecera. Mantener el reinicio del helper sintético presente: el segundo dispositivo recibe explícitamente la fila. Fixture válido no lleva sport vacío y cada position es menor que size. Usar inválidos solo para el caso negativo identificado, no para declarar rota la sincronización normal.

## Preparación necesaria antes de ejecutar ciclo 3 en otro host

Snapshot histórico versionado **no significa runner autocontenido/portable**. Inspección local sin cambiarlo:

- `node --check` de lib.mjs, sdd012-checks.mjs y uat16-walkthrough.mjs: PASS.
- `bash -n harness/run-engine.sh`: FALLA en línea2 por placeholders literales `S=<scratch>; U=<scratch>/u16`. Es receta del scratch histórico, no ejecutable tal cual. No es defecto de Aunara ni contradice las corridas previas desde aquel scratch.
- lib.mjs importa ./server.mjs, ausente en esta carpeta. Servidor versionado en `../2026-10-12-sdd006-ciclo2-revision/harness/server.mjs` (ruta desde carpeta de evidencia); el adaptador debe resolverlo en una copia desechable.
- sdd013-checks.mjs vive en `../2026-10-13-sdd013-revision/harness/`, y su adaptador de regresión depende de los harness históricos de 006/012. No cambiar esos originales para una corrida.
- validate-row.ts tiene import absoluto `/home/user/aunara/src/lib/cloudSnapshot`; requiere adaptación de ruta en scratch y runner TS disponible. No procesar filas reales ni publicar payloads privados.
- Crear builds sintéticos para `/` y `/aunara/` con `VITE_SUPABASE_URL=https://synthetic.supabase.invalid` y clave publicable sintética; además controles E2 y d381e52 si la matriz los requiere. No usar el envDir real del servidor UAT humano para estos builds.
- Las pruebas esperan ../builds/ y ../results/; preparar layout, Playwright/motores existentes y puertos libres en scratch, no instalar dependencias/cambiar el repo por suposición. No asumir `/opt/pw-browsers` en Mac.

Una futura corrida registra adaptador exacto, hashes de entrada/salida, builds/SHA, motores, comandos, fallos del harness y resultados. No debe presentarse «ciclo3 PASS» antes de ejecutarlo. Parametrizar/versionar un runner portable sería trabajo adicional acotado con aprobación; esta entrega solo inventaría y congela la base pedida.

## Reproducción local de las cuatro pruebas (baseline, antes del fix)

Desde `/private/tmp/aunara-sdd014-candidate`, HEAD999c8f6, sin editar fuente:

```bash
npm test
NODE_OPTIONS=--require=/private/tmp/aunara-sdd014-candidate/AUNARA_SOT/sdd/2026-10-16-uat-dev-revision/harness/wednesday-clock.cjs npm test
```

- Fecha real de sesión, viernes16Oct:371/371 Vitest en25 archivos + Sites1/1 PASS.
- Miércoles controlado14Oct12:00Z:367 PASS y **4 FAIL**, exactamente los casos AppFlows/WorkoutPanel del diagnóstico; exit1, Node Sites no corre por el encadenamiento &&. AppFlows busca un campo del lunes estando en miércoles; los otros tres reciben wednesday en vez de monday. Son fixtures dependientes del día, no cambio de producto.
- No se aplicó waiver, skip, cambio de aserciones ni fix. SDD-015 propone selección explícita del lunes solo en esos casos; espera aprobación. SDD-016 trata separado el remoto inválido. Incluir guardas de correo en npm test requiere orden aparte; package.json sigue intacto.
