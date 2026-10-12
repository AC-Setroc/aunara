# Orden — Retomar SDD-006 hasta publicación

2026-10-12 · Emite: Operator, por intermedio de `[AUNARA/claude · modelo no expuesto]`. Destinatario: agente Codex del proyecto Aunara.
Aprobación del Operator: «Dale con tu sugerencia. Dejá todo lo que se ha hecho y todo lo que se va a hacer documentado, para que el agente de Codex pueda retomar en el momento en que se requiera.»

Esta orden no sustituye la aprobación de ningún SDD ni amplía alcances. Fija el orden de trabajo y los límites. Toda decisión de producto, publicación y push sigue reservada al Operator.

## 1. Leer antes de tocar nada

1. `AUNARA_SOT/README.md`, `02-ESTADO-ACTUAL.md`, `PENDIENTES.md`, `03-HISTORIA-Y-BACKLOG.md` y `06-RUNBOOK.md` en la rama `dev`, no en `main`. `dev` es la rama con la SOT al día; `main` solo tiene la documentación hasta el 2026-10-07.
2. `AUNARA_SOT/handoffs/HANDOFF-2026-10-12.md`: qué se hizo en la sesión del 12 de octubre y qué quedó sin verificar.
3. `AUNARA_SOT/sdd/SDD-006-acceso-y-creacion-rutinas.md` y sus enmiendas E2, E3, E4, en ese orden. El estado real de 006 es: E2 REJECTED por CL-07, E3 ciclo 1 REJECTED por CA06-03, E4 aprobada y en desarrollo. Quedan **dos ciclos** del límite de tres aprobado en D-E3-4.
4. `AUNARA_SOT/sdd/SDD-010-compliance-docs-aunara.md`: cerrado; sirve de ejemplo del ciclo Spec → Build → Review → Entrega ejecutado con panel de tres lentes y guardas rotas a propósito.

## 2. Mapa de ramas y dónde vive cada cosa

| Rama o lugar | Contenido | Autoridad |
|---|---|---|
| `main` | Código publicado en `https://aunaratraining.com/`: `1c709a3` + docs `dfffa87`. | Única rama que despliega. Push solo por orden explícita. |
| `dev` | `main` + toda la SOT, SDD-002 a 010 y docs de producto. Sin código nuevo. | Integración documental y, tras APPROVED, de código. |
| `wip/dirty-2026-10-12` | Snapshot `e4baf5f` del working tree de la Mac: SDD-002/003/004 + 006 v1 + E1, 40 archivos de fuente/tests. Verificado en entorno limpio: typecheck, 298 Vitest/24 + Node1, guards 27/27, build raíz allowlist 31. | Evidencia y respaldo. No es base de trabajo ni entrega. |
| `wip/sdd006-e2-candidate-*`, `wip/sdd006-e3-candidate-*`, `wip/sdd006-e4-candidate-*` | Snapshots de los candidatos de `/private/tmp`, si el Operator ejecutó el script del runbook (§Snapshots). Comprobar con `git ls-remote --heads origin 'wip/*'`. | Evidencia y respaldo. |
| `/private/tmp/aunara-sdd006-*` en la Mac | Candidatos E2 (`…e2-candidate.EZJxlS/repo`), E3 (`…e3-candidate.DKIck1/repo`), E4 y todos los recibos de revisión. | Fuente de trabajo de Build/Review de 006 **mientras exista**. Se pierde con un reinicio. |
| `archive/github-pages/main` | Build compilado histórico de agosto. | No tocar. |

## 3. Orden de trabajo

### Paso 1 — Snapshot de los candidatos (Operator, diez minutos, riesgo cero)

Antes de cualquier ciclo nuevo, el Operator ejecuta en su Mac el script `push-candidates.sh` del runbook (§Snapshots del trabajo local). Pushea cada candidato de `/private/tmp` como rama `wip/sdd006-<e2|e3|e4>-candidate-<fecha>` sin tocar los repos candidatos, y copia los recibos a `~/Documents/aunara-evidencias-<fecha>/`. Si el script no encuentra el candidato E4, el agente debe pedir al Operator la ruta exacta y registrarla en SDD-006 E4.

Si el Operator no puede ejecutarlo, el agente lo hace **solo con autorización explícita** y con la misma técnica de índice temporal; nunca `git add .` sobre el canónico ni swaps de árbol.

### Paso 2 — Terminar E4 y la revisión conjunta (ciclo 2 de 3)

- Build únicamente en el candidato E4 derivado de E3 congelado, allowlist exacta de E4 §2: `src/App.tsx`, `src/components/AppFlows.test.tsx`, `src/components/AccessPanel.test.tsx`. Nada más.
- Review completa fresca E2 + E3 + E4 con revisor distinto: CL-01 a CL-09, AR-01 a AR-08, RG-01 a RG-08, matrices y negativos pendientes listados en E3 §7 y E4 §7. No heredar PASS parciales. WebKit obligatorio.
- Si APPROVED: delivery verifica hashes, manifest y árbol; actualiza docs propias; crea **un commit en `dev`** con el candidato integrado E2+E3+E4, etiqueta de origen real. Sin push a `main`.
- Registrar en SDD-006, 02, PENDIENTES y 03 con etiqueta de origen y fecha.

### Paso 3 — Publicación, solo con orden nueva del Operator

Con el commit en `dev` y APPROVED registrado, pedir al Operator una orden de publicación explícita. Entonces: merge a `main` por fast-forward o merge sin reescribir historia, push, verificar Actions verify + deploy SUCCESS, smoke publicado Chromium/WebKit ES/EN 1440/390 en `https://aunaratraining.com/`, y comprobar que el aviso de privacidad ya dice «GitHub Pages» (cierra la frase de estado de `docs/compliance/README.md` §Cambios desde la versión 1.0, pendiente de SDD-010). No retirar rollback `/aunara/`.

### Paso 4 — En paralelo, sin código

- CA-07 de SDD-005: captura de Supabase → Authentication → URL Configuration con Site URL y redirects; cambiar Site URL al apex si aún apunta a Pages. Solo con el Operator en su navegador.
- Feedback de Danny sobre `docs/methodology/workout-rules-matrix-v0.1.md`, pendiente desde el 2026-08-26. Sin él no hay progresión ni reglas clínicas, y SDD-007 no puede arrancar.
- Decisión de versión legal v1.0/v1.1 (SDD-010 §Cambios desde la versión 1.0), dueño Operator con asesoría jurídica.

### Paso 5 — Si E4 falla el ciclo 2

No gastar el tercer ciclo en otro parche sobre el mismo candidato. Volver a Spec: partir la consolidación en dos entregas, primero SDD-002 + E1 + SDD-003 (ambos con PASS técnico propio y frontera congelada en `/private/tmp/aunara-sdd002-boundary.9w72PW`), después SDD-004 + 006. Presentar al Operator como enmienda de E2 con nueva allowlist por hunk.

## 4. NO HACER

- No iniciar SDD-007, 008 ni 009 hasta que 006 esté publicado.
- No publicar nada desde `wip/*`: son snapshots sin revisar.
- No absorber el dirty canónico ni resolver conflictos en el árbol vivo de la Mac.
- No tocar `src/components/LegalPanel.tsx`, `src/lib/privacy.ts`, `LEGAL_VERSION` ni `docs/compliance/` fuera de SDD-002 y SDD-010 ya cerrado.
- No cambiar `ci.yml`, dependencias, Supabase, DNS, Auth ni SMTP sin SDD aprobado.
- No commitear `AUNARA_SOT/reference/` (ya está en `.gitignore` en `dev`) ni capturas, audios o recibos con datos personales.
- No declarar cerrado un gate por simulación: UAT real de cuenta, correo, PWA física y metodología siguen separados.

## 5. Etiquetas y registro

Cada entrada en la SOT lleva `[AUNARA/codex · <modelo o «modelo no expuesto»>]` y fecha. Las entradas de la sesión del 12 de octubre llevan `[AUNARA/claude · modelo no expuesto]`; no se reescriben, se agregan arriba. Commits con un cambio por commit y etiqueta de origen en el cuerpo.
