# Harness de revisión SDD-006 (E2+E3+E4) · ciclo 2

Guiones Playwright usados en la revisión independiente del 2026-10-12, corridos completos en Chromium y en WebKit 26.0 (Linux). Todo el tráfico externo se bloquea antes de navegar; Supabase es sintético (`synthetic.supabase.invalid`), sin cuentas, correos ni tokens reales.

Requisitos: Node 22, `playwright` resoluble desde esta carpeta (`npm i playwright` o symlink en `node_modules/`), navegadores instalados (`npx playwright install webkit` en la Mac). Builds del candidato en `../builds/<e4-root|e4-aunara|e2-root|e2-aunara>` generados con:

```
VITE_SUPABASE_URL=https://synthetic.supabase.invalid VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_synthetic_000 AUNARA_BASE_PATH=/ npm run build
```

| Guion | Criterios | Contextos |
|---|---|---|
| `storage-matrix.mjs` | AR-01, AR-02 (E4 vs control E2) | 192 |
| `startup-fallback.mjs` | AR-03, AR-04, AR-05 | 12 × 2 |
| `auth-recovery.mjs` | regresión SDD-004 E2 bajo frontera E3 (0/200 ms, negativos, consumo único) | 42 |
| `privacy-summary.mjs` | RG-01 a RG-06 | 84 |
| `ui-navigation.mjs` | CA06-02/03/04/05/06, SDD-002 aviso y diálogos legales | 12 × 3 |
| `geometry-roundtrip.mjs` | E1/CL-06 round-trip, CA06-06 flotante/badge, F2 pie | 8 + 16 + 16 |
| `negatives.sh` + `neg-check.mjs` | guardas rotas a propósito (red→green) | 6 mutaciones |
| `security-probe.mjs` | lente de seguridad por HTTP: hosts, bloqueos, token en DOM/export, cuerpo del POST, storage tras salir (evidencia H-02) | 1 flujo |

Ejecutar en WebKit: `BROWSER=webkit node <guion>.mjs`. Los resultados se escriben en `../results/*.json`; para no pisar los de otro motor, copiar `harness/` a otra carpeta con su propio `../results/` y enlazar `../builds/` y `../e4/`.

## Dónde queda cada cosa en esta carpeta

- `../RECIBO.md`: veredicto por lente, resultados por criterio, hallazgo H-01 y guion para la mitad WebKit.
- `../resultados/`: JSON por matriz (`rows[]` con `name`, `pass`, `detail`), logs de negativos, RG-01 rojo→verde (`rg01-redgreen.log`) y el probe que aisló H-01 (`h01-debounce-probe.log`).
- `negatives.sh` toma la raíz de trabajo de `AUNARA_REVIEW_ROOT` o de la carpeta padre de `harness/`; espera `e4/` (worktree del candidato con `node_modules`) y `builds/` al lado.
- `ui-navigation.mjs` espera `.sync-trigger.is-synced` entre los dos cambios de idioma del modal de borrado por el hallazgo H-01 del recibo; no es un «tiempo» para ocultar un rojo sino la condición que el paso necesita medir.
