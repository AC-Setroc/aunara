# Estado actual — Aunara

Fecha: 2026-10-01. Origen: `[AUNARA/codex · GPT-6.1 Sol]`.

## Verificado

- El working tree del repo fuente está en la ruta canónica de Personal. HEAD inicial `d3da8c0`, rama `codex/aunara-rebrand` y cambios documentales previos preservados. El remoto canónico confirmado por el Operator es `AC-Setroc/aunara`.
- Siete referencias se integraron en `reference/` sin alterar bytes. Los SDD previos mantienen su estado pendiente de aprobación; no son cambios de producto implementados.
- El Operator aprobó el 2026-10-01 que el repo público `AC-Setroc/aunara` sirva también Pages desde un artifact cliente. Pages está configurado para Actions en el mismo repo; el cambio técnico aún no se ha publicado. Ver [ADR 0003](../docs/architecture/0003-pages-from-aunara-repository.md).
- En la ruta nueva pasaron `npm run typecheck`, `npm test` (18 archivos/143 pruebas Vitest y una prueba Node), cinco pruebas de artifact/worker, build local `/` y build Pages `/aunara/`; este último pasó el allowlist de 30 archivos y emitió solo una advertencia de tamaño de chunk. Los 44 enlaces locales inspeccionados en la migración resolvieron.
- Revisión independiente **APPROVED** el 2026-10-01: typecheck, 143 pruebas Vitest + Node, cinco guards E2 (incluidas pruebas negativas) y builds `/` y `/aunara/` pasaron. Chrome escritorio/móvil y Safari WebKit escritorio verificaron ES/EN/login bajo `/aunara/`; no se detectaron errores de consola ni desbordamiento en Chrome. Manifest y worker usan scope `/aunara/`, no `/`. Se revisaron 28 enlaces SOT/README sin roturas.
- El Operator autorizó el commit, push y publicación UAT en el repo público existente. Las variables cliente publicables de Supabase están configuradas en Actions; sus valores no se incorporan a documentación.

## Pendiente de verificación/cierre

- Push, ejecución de Actions y smoke de la URL publicada `https://ac-setroc.github.io/aunara/` tras el commit revisado. Instalación/actualización PWA en dispositivos físicos e interacción con el worker antiguo siguen pendientes; la revisión local no declara ese cierre.
- Las referencias y su inventario permanecen locales, fuera de cualquier commit público hasta revisión específica de privacidad y derechos. Supabase debe permitir la nueva URL de callback antes de UAT de cuenta.
- Supabase del proyecto Repbook está pausado. El intento de reanudarlo mostró el límite de dos proyectos gratuitos activos de la organización; registro, login y sync quedan bloqueados hasta que el Operator decida cómo habilitarlo. La allowlist de redirección `/aunara/` tampoco se pudo configurar mientras está pausado.
- Los cambios documentales previos de OpenGym/UAT siguen fuera del alcance de entrega; los SDD trasladados conservan su aprobación pendiente.

## Próxima acción

Entregar el commit local revisado y publicar mediante los gates autorizados; registrar SHA, run y smoke en esta SOT. Ninguna capacidad de OpenGym/UAT se presenta aquí como aprobada o implementada.
