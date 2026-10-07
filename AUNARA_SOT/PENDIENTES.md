# Pendientes — Aunara

Fecha de corte: 2026-10-01. Origen: `[AUNARA/codex · GPT-6.1 Sol]`.

## Abiertos

- `[AUNARA/codex · GPT-5]` — [SDD-005 de dominio](sdd/SDD-005-dominio-aunaratraining.md) publicado: `1c709a3`, Actions 37636074747 SUCCESS, cuatro A Pages/`www`/TXT preservado, certificado y Enforce HTTPS activos, redirecciones canónicas y smoke Chromium/WebKit8/8 PASS. Pendiente para cierre global: capturar/reinspeccionar Supabase URL Configuration, confirmar ambos redirects previos más apex y cambiar Site URL a `https://aunaratraining.com/` si aún apunta a Pages. Auth/correo reales, PWA física y offline WebKit real continúan fuera; no se repite el corte DNS ya cerrado.

- `[AUNARA/codex · GPT-5]` — [Enmienda 2 de SDD-004](sdd/SDD-004-enmienda-2-retorno-recuperacion.md) técnicamente **APPROVED** y publicada por orden del Operator el 2026-10-06 (`86f5451`, Actions 37539918673 SUCCESS; smoke público 8/8 PASS). Pendientes fuera de E2: UAT real de cuenta, recepción de correos expresamente diferida y cierre del Operator. Dominio `aunaratraining.com`: conexión aún no aplicada, propuesta en SDD-005; no se configuraron DNS/HTTPS/URLs Auth/SMTP/remitente.

- Instalación/actualización PWA en iPhone/Android físicos e interacción con el worker legado siguen pendientes; el smoke publicado en Chrome no equivale a cierre de esos gates.
- Supabase Repbook está pausado por límite de dos proyectos gratuitos activos. El Operator debe decidir si libera capacidad o cambia de plan; no tocar otro proyecto por cuenta de esta orden. Registro/login/sync y allowlist de callback `/aunara/` quedan bloqueados hasta reactivación.
- Revisar privacidad y derechos de los siete archivos en `reference/` y otros documentos locales antes de cualquier commit público. Por defecto permanecen fuera.
- Decidir, fuera de esta migración, si se depuran referencias PNG duplicadas o se declara algún activo maestro. Por ahora se conservan los siete archivos.
- Resolver el [SDD de UAT y motor de sesiones](sdd/2026-09-26-device-uat-and-session-engine/STATUS.md), que sigue esperando aprobación explícita; no se implementa en este trabajo.
- Retirada del sitio raíz anterior requiere decisión separada; no forma parte de la publicación completada.

## Cerrados

- Revisión independiente de migración y Enmienda 2: **APPROVED** el 2026-10-01; automatizados, artifact y smoke local Chrome/WebKit pasaron.
- Publicación autorizada del fuente `fc88568`: [Actions 36910796612](https://github.com/AC-Setroc/aunara/actions/runs/36910796612) verify/deploy SUCCESS. Home y dataset HTTP 200; Chrome publicado ES/EN y apertura/cierre de login PASS, consola sin errores/advertencias. UAT autenticado sigue bloqueado, no cerrado.
