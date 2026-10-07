# ADR 0003 — Pages desde el mismo repositorio Aunara

Fecha: 1 de octubre de 2026\
Estado: Aceptada por decisión explícita del Operator; implementación local pendiente de revisión y despliegue.

## Contexto y decisión

El Operator aprobó que `AC-Setroc/aunara` sea público y concentre fuente y publicación UAT, sin otro repositorio de despliegue. Esta decisión sustituye [ADR 0002](./0002-source-and-deployment-repositories.md), que permanece como registro histórico. La URL objetivo de project Pages es `https://ac-setroc.github.io/aunara/`; la raíz `https://ac-setroc.github.io/` es una publicación anterior y no se retira aquí.

Actions verifica la fuente y prepara base `/` para el dominio canónico aprobado en SDD-005. Solo un push autorizado a `main`, después de verificación exitosa, puede crear el artifact Pages desde `dist/client/` y desplegarlo. PR y ramas `codex/**` verifican sin desplegar. El artifact excluye `dist/server/`, `dist/.openai/`, documentación, fuente y archivos locales. El repo público, a diferencia del artifact, sí expone todo archivo que se confirme: las referencias locales y cualquier documento con datos personales necesitan revisión y autorización específica antes de agregarse.

## Consecuencias y gates

- El sitio Pages es público; la base raíz `/` afecta HTML, assets, datos, callbacks de cuenta, manifest y service worker. La base anterior `/aunara/` se conserva en pruebas y rollback.
- Las variables cliente publicables de Supabase deben estar disponibles en Actions antes del build de release; no se incorporan claves privadas.
- El worker antiguo con scope `/` puede coexistir e interferir; no se desregistra ni se altera el sitio antiguo sin un plan de corte aprobado.
- El cambio de visibilidad y Settings es externo a este commit técnico. El despliegue y smoke UAT en la URL nueva siguen siendo gates posteriores.

Diseño y pruebas detalladas: [Enmienda 2 de SDD-001](../../AUNARA_SOT/sdd/SDD-001-enmienda-2-pages-en-repo.md).

## Enmienda de dominio — 2026-10-06

`[AUNARA/codex · GPT-5]` — [SDD-005 aprobado](../../AUNARA_SOT/sdd/SDD-005-dominio-aunaratraining.md) fija `https://aunaratraining.com/` como apex canónico y `www`→apex mediante Pages, sin otro repo. La decisión de project Pages de arriba queda como antecedente de rollback. Propiedad verificada y custom domain configurado en GitHub; preparación local, DNS, certificado/HTTPS y retorno Auth se verifican por fases. El origen nuevo aísla su worker/cachés del origen Pages anterior; no se altera el worker legado ni datos de usuarios. Recepción de correo/SMTP quedan diferidos.
