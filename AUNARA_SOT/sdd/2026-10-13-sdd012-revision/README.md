# Evidencia SDD-012 — revisión del candidato `1e7fa15` (2026-10-13)

- `harness/`: guiones del ciclo 2 adaptados a la nueva estructura (selector de idioma dentro del panel, entrada «Ingresar / crear cuenta» en el menú) y `sdd012-checks.mjs` con S12-01…S12-06 medidos por geometría y estilos computados. `lib.mjs` añade `setLanguageViaMenu`.
- `resultados/`: S12 por motor y base (`sdd012-<motor>-<build>.json`, 70/70 × 4), negativos S12-08 (`sdd012-negatives.log`) y matrices del ciclo 2 sobre el build del candidato en `chromium/` y `webkit/` (storage 276, startup 84, Auth 42, privacidad 84, navegación 156, geometría 52; `.json` con filas y `.log` con la salida).
- Recibo y veredicto (**APPROVED técnico**) en `../SDD-012-uat13-menu-perfil-acceso.md` §11; integrado en `dev` como `d381e52`.
