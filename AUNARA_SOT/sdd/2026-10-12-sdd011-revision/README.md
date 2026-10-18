# Evidencia SDD-011 — H-01 y H-02 (2026-10-12)

- `harness/lib.mjs`: librería compartida del harness del ciclo 2 de SDD-006, ampliada con Supabase sintético **con estado** (`stateful: true`: recuerda la última fila guardada, atiende `PUT /auth/v1/user` para cambios de consentimiento). Es la misma copia que `../2026-10-12-sdd006-ciclo2-revision/harness/lib.mjs`.
- `harness/h01-negative.mjs`: negativo compilado de H-01 (`BUILD=e4-root` ⇒ `is-syncing` atascado; `BUILD=h01-root` ⇒ `is-synced`).
- `harness/h02-consent-probe.mjs`: S11-06/07/07b/08/08b compilados contra `BUILD=h02-root`, `BROWSER=chromium|webkit`.
- `resultados/h01/`: matrices del ciclo 2 (storage, startup, Auth, privacidad, navegación, geometría) sobre el build del candidato H-01 `96b71c8`, por motor, más `negativo-compilado.log`.
- `resultados/h02/`: probe de consentimiento por motor y, cuando terminen, las matrices del ciclo 2 sobre el build del candidato H-02 `0fd2743`.

Las matrices se corren con la carpeta `harness/` del ciclo 2 de SDD-006 apuntando `../builds/e4-root|e4-aunara` al build del candidato y `../builds/e2-*` al control E2. Recibo y veredicto en `../SDD-011-sync-estado-y-consentimiento-salud.md` §11.
