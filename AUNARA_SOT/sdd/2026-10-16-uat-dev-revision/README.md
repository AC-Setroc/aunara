# Evidencia — diagnóstico y UAT automatizada sobre `dev` `d2ba0aa` (2026-10-16)

`[AUNARA/claude · modelo no expuesto]`. Informe y veredicto en [`handoffs/UAT-2026-10-16-claude-dev-diagnostico.md`](../../handoffs/UAT-2026-10-16-claude-dev-diagnostico.md).

- `harness/`: `uat16-walkthrough.mjs` (recorrido del guion §2/§2b no cubierto por las matrices: dos dispositivos con la misma cuenta, contacto legal, editor con triserie, inventario del menú, Cuenta / privacidad, consola por pantalla); `sdd012-checks.mjs` y `lib.mjs` adaptados a la estructura de SDD-013 (selectores: perfil y cierre dentro del drawer, filas con enlaces, sin indicador de sync en la barra); `run-engine.sh` (cadena por motor); `validate-row.ts` (pasa una fila remota por el validador del snapshot); `wednesday-clock.cjs` (reloj controlado para reproducir los cuatro fallos del miércoles).
- `resultados/<motor>/`: seis matrices históricas (adaptador desechable de `sdd013-checks.mjs` con `REGRESSIONS=1`), `sdd012-*` (70 aserciones por base), `sdd013-*-baseline` (393 casos por base, con el build de `d381e52` como línea base del modal de borrado) y `uat16-*` (recorrido, 25 aserciones).
- Builds: `dev` `d2ba0aa` con `VITE_SUPABASE_URL=https://synthetic.supabase.invalid`, bases `/` y `/aunara/`; control E2 `19dcb4f` para la matriz de almacenamiento. Supabase sintético en ruta; sin cuentas, correos ni datos reales.
