# Aunara — fuente única de verdad

Casa canónica local: `~/AI Projects/Personal/aunara`, checkout del repositorio público `AC-Setroc/aunara`. La metodología que rige es `~/AI Projects/Personal/metodologia-personal/README.md` (repo separado); este índice organiza el proyecto y no duplica las especificaciones temáticas.

## Autoridad de cada superficie

- Esta SOT: [estado actual](02-ESTADO-ACTUAL.md), [pendientes](PENDIENTES.md), [historia](03-HISTORIA-Y-BACKLOG.md), [runbook](06-RUNBOOK.md), [SDD](sdd/), `handoffs/` y `ordenes/`.
- [`docs/product/`](../docs/product/): decisiones y planes de producto; [`docs/methodology/`](../docs/methodology/): metodología clínica; [`docs/architecture/`](../docs/architecture/): arquitectura; [`docs/compliance/`](../docs/compliance/): privacidad y cumplimiento.
- [`prototypes/`](../prototypes/): propuestas aisladas. Código, tests y configuración en el repo describen el comportamiento real.
- [`public/brand/`](../public/brand/): activos usados por la aplicación. `reference/` conserva insumos locales inmutables fuera del commit público; ningún PNG se declara maestro de identidad ni se incorpora automáticamente a la UI.
- [ADR 0003](../docs/architecture/0003-pages-from-aunara-repository.md): Pages usa un artifact cliente del mismo repo. [SDD-005 aprobado](sdd/SDD-005-dominio-aunaratraining.md) prepara `https://aunaratraining.com/` en raíz; el corte DNS/HTTPS/Auth debe constar como verificado en el estado antes de considerar esa URL operativa. `https://ac-setroc.github.io/aunara/` se conserva como antecedente/rollback; la publicación histórica en `https://ac-setroc.github.io/` no se retira aquí.

## Referencias locales

Los siete archivos originales se preservan byte por byte en `reference/`, incluido el PNG duplicado. Su inventario y hashes están en un archivo local dentro de esa carpeta. Ni las referencias ni ese inventario están aprobados para commit público; revisar privacidad y derechos antes de cualquier publicación.
