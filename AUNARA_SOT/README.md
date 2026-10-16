# Aunara — fuente única de verdad

Casa canónica local: `~/AI Projects/Personal/aunara`, checkout del repositorio público `AC-Setroc/aunara`. La metodología que rige es `~/AI Projects/Personal/metodologia-personal/README.md` (repo separado); este índice organiza el proyecto y no duplica las especificaciones temáticas.

## Autoridad de cada superficie

Orden permanente del Operator, 2026-10-16: cada acción debe dejar la documentación pertinente al día y subida a `dev`, sin recordatorio ni nueva solicitud de permiso para ese push documental. Confirmar el remoto antes del cierre; si falla, declararlo. Esta autorización no aprueba specs/implementaciones pendientes ni publicación a `main`/producción; no permite subir cambios ajenos, secretos o evidencia privada.

- Esta SOT: [estado actual](02-ESTADO-ACTUAL.md), [pendientes](PENDIENTES.md), [historia](03-HISTORIA-Y-BACKLOG.md), [runbook](06-RUNBOOK.md), [SDD](sdd/), `handoffs/` y `ordenes/`.
- [`docs/product/`](../docs/product/): decisiones y planes de producto; [`docs/methodology/`](../docs/methodology/): metodología clínica; [`docs/architecture/`](../docs/architecture/): arquitectura; [`docs/compliance/`](../docs/compliance/): privacidad y cumplimiento.
- [`prototypes/`](../prototypes/): propuestas aisladas. Código, tests y configuración en el repo describen el comportamiento real.
- [`public/brand/`](../public/brand/): activos usados por la aplicación. `reference/` conserva insumos locales inmutables fuera del commit público; ningún PNG se declara maestro de identidad ni se incorpora automáticamente a la UI.
- [ADR 0003](../docs/architecture/0003-pages-from-aunara-repository.md): Pages usa un artifact cliente del mismo repo. [SDD-005](sdd/SDD-005-dominio-aunaratraining.md) publicó `https://aunaratraining.com/` en raíz el 2026-10-07: DNS, HTTPS y smoke APPROVED; Auth real y PWA física siguen pendientes según el estado. `https://ac-setroc.github.io/aunara/` se conserva como antecedente/rollback; la publicación histórica en `https://ac-setroc.github.io/` no se retira aquí.

## Referencias locales

Los siete archivos originales se preservan byte por byte en `reference/`, incluido el PNG duplicado. Su inventario y hashes están en un archivo local dentro de esa carpeta. Ni las referencias ni ese inventario están aprobados para commit público; revisar privacidad y derechos antes de cualquier publicación.
