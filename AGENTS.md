<!-- SOT-POINTER v2 -->
# ⚠️ LEER PRIMERO

1. **Metodología (Personal, no Softnexus):** `~/AI Projects/Personal/metodologia-personal/README.md`
   (repo `AC-Setroc/metodologia-personal`). Si no está clonada:
   `gh repo clone AC-Setroc/metodologia-personal "$HOME/AI Projects/Personal/metodologia-personal"`;
   si está, `git -C "$HOME/AI Projects/Personal/metodologia-personal" pull --ff-only`.
2. **Fuente de verdad del proyecto:** `AUNARA_SOT/`. Antes de tocar código o docs, abrí
   `AUNARA_SOT/README.md`. Si no está ahí, no es oficial. El chat no es fuente de verdad.
<!-- /SOT-POINTER -->

# Aunara — reglas propias

- `AC-Setroc/aunara` es el repo público de fuente y Pages por decisión del Operator del 2026-10-01; Pages recibe solo el artifact de `dist/client/`. SDD-005 aprobado prepara `https://aunaratraining.com/` con base `/`; `/aunara/` se conserva para rollback. Consultar la SOT para el estado operativo del corte.
- `AUNARA_SOT/reference/` conserva insumos locales inmutables, no aprobados para commit público ni activos de UI. Los activos usados por la app están en `public/brand/`.
- `.env.local` y los directorios ignorados se conservan localmente: nunca se versionan ni se copian a documentación.
- Cambios de producto, publicación y push requieren una orden y aprobación explícitas del Operator.
