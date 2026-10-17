# SDD014 — plan y recibo de desarrollo local

`[AUNARA/codex · gpt-6.1-sol]` · 2026-10-16 · Ciclo 1 · Desarrollo; no veredicto independiente.

## Plan de implementación (registrado antes del RED)

**Objetivo:** contacto admin y dos plantillas Auth bilingües locales; ninguna activación remota.
**Arquitectura:** constante existente sin cambios de consumidores; HTML estático de tablas e inline con nombre Aunara textual resistente a bloqueo de imágenes; controles Node sin dependencias nuevas.
**Stack:** TypeScript/React/Vitest existentes, HTML email y Node builtins.

Ejecución inline por este agente de desarrollo; revisión independiente y entrega pertenecen al frente principal. No commits en este rol. La ubicación de este plan es la allowlist aprobada, no se crea otra carpeta de planes.

- [ ] 1. RED contacto: en `src/components/LegalPanel.test.tsx` sustituir solamente la aserción vieja por `/admin@aunaratraining\.com/`; añadir matriz ES/EN × privacy/terms que exige admin y rechaza contacto anterior/soporte, preservando todos los controles existentes. Ejecutar `node_modules/.bin/vitest run src/components/LegalPanel.test.tsx --maxWorkers=2`; esperar FAIL del contacto todavía anterior.
- [ ] 2. RED artefactos: crear `scripts/auth-email-templates.node-test.mjs` con lectura desde raíz derivada de `import.meta.url`, exports de validación para fixtures y pruebas de contacto, invariantes contra base git `61610c1`, estructura HTML, copy bilingüe, asuntos y enlaces. Ejecutar `node --test scripts/auth-email-templates.node-test.mjs`; esperar FAIL por plantillas ausentes y contacto anterior. No escribir HTML antes de ese rojo.
- [ ] 3. GREEN contacto: cambiar exclusivamente `DATA_CONTROLLER_EMAIL = "admin@aunaratraining.com"` en `src/lib/privacy.ts`; sustituir el canal en `retention-and-rights.md` e `incident-response.md`; ajustar solo contacto/estado de canal en `docs/compliance/README.md`. Ejecutar de nuevo la prueba LegalPanel.
- [ ] 4. GREEN correo: crear `supabase/templates/confirm-signup.html` y `reset-password.html`, con copy bilingüe específico, 1 CTA y backup ambos `href="{{ .ConfirmationURL }}"`, soporte ES/EN y admin separados. Tablas fluidas, inline, teal/azul/arena/tinta y fuentes sistema, sin SVG remoto obligatorio, raster nuevo, nombres de usuario, caducidad ni tracking. Crear `supabase/templates/README.md` con asuntos exactos del SDD, copy plain-text, From objetivo (no efectivo), gates y rollback. Ejecutar controles Node; esperar PASS.
- [ ] 5. Negativos desechables: N1 contacto anterior y soporte cruzado; N2 From de fixture distinto; N3 CTA fijo y backup divergente; N4 versión y consentimiento alterados. Crear copias temporales únicamente; exigir que cada validador rechace cada mutación y verificar hashes originales sin cambio. Volver a ejecutar guardas normales verdes.
- [ ] 6. Verificación: `npm run typecheck`; `npm test` con reloj real; regresión concentrada LegalPanel/privacy/useCloudSync/AccessPanel; `npm run check:exercise-directory`; `npm run test:exercise-directory`; tests Node existentes de empaquetado/Pages/SW (32); builds `/` y `/aunara/` con guarda de artifact. Lint N/A (no script). Si fullsuite falla, comparar con base desechable 61610c1 sin reloj alterado y reportar D14-06; no tocar tests antiguos ni heredar excepción D13.
- [ ] 7. Congelar: diff exacto, manifest hashes fuente postbuild y recibo sanitizado aquí. Principal revisa Chromium/WebKit sobre compilado a320/390/1440, ES/EN y previews ambos mensajes con URL `.invalid`, imágenes bloqueadas, contraste y N1–N4. No se afirma preview ni UAT desde este rol.

## Límites y fuentes

Se leyó AGENTS, metodología Personal completa (actualización ya realizada por principal), SOT y SDD014 aprobado «Dale». Skills SDD, writing-plans, TDD, frontend-design y Supabase aplicadas bajo el diseño/allowlist del Operator. Sin cambios de identidad, versión/fecha legal, consentimiento, hooks, auth, marca original, dependencias, workflows, editor ni servicios remotos. El SDD modificado preexistente pertenece al principal y se conserva.

Documentación oficial consultada antes de implementar: [plantillas Supabase](https://supabase.com/docs/guides/auth/auth-email-templates), [SMTP](https://supabase.com/docs/guides/auth/auth-smtp). `ConfirmationURL` incluye la URL de verificación y retorno: se conserva sin reconstruir. `.Data` es metadata, no autoridad ni selección nueva de idioma. El índice changelog.md devolvió error; principal ya revisó el changelog del 16Oct (TLS CBC/HTTP 10Nov, no SMTP); se contrastó también índice web sin ejecutar cambios API.

## Resultados

Pasos 1–6 ejecutados y comprobados; parte local del paso 7 lista para congelación. Sus casillas de planificación se conservan como registro original; la ejecución efectiva se acredita abajo. La revisión Chromium/WebKit y el veredicto independiente pertenecen al principal, no están realizados por el desarrollador.

### Ciclo rojo → verde

| Control | RED antes de implementar | GREEN con el cambio |
| --- | --- | --- |
| LegalPanel | 5 fallos por admin ausente; 10 controles existentes pasan (`red-contact.log`) | 15/15 (`green-contact.log`) |
| Guardas Node nuevas | 8 fallos por contacto anterior/artefactos ausentes; 2 fixtures pasan (`red-guards.log`) | 10/10, sin skips (`green-guards-final.log`) |

La guarda se refinó después del primer verde para eliminar la dependencia de historia Git y leer los negativos desde las copias realmente mutadas; no se flexibilizaron expectativas. Los hashes base y su normalización limitada están documentados en `supabase/templates/README.md`. La invocación desde `/private/tmp` también pasó 10/10 (`green-guards-final-external-cwd.log`); la última corrida en raíz ocurrió tras documentar esos hashes.

Los negativos N1 (contacto anterior/soporte cruzado), N2 (dos From de fixture incorrectos), N3 (CTA fijo/respaldo divergente), N4 (versión/consentimiento alterados) rechazan cada desviación. N1/3/4 leen copias temporales aisladas; se restituyen esas copias y pasa `validateAll`; hashes originales intactos. N2 usa strings sintéticos, **no headers recibidos ni envío**. No se mutó la fuente para los negativos.

### Verificación ejecutada

| Comando exacto desde raíz, salvo donde se indica | Resultado | Evidencia |
| --- | --- | --- |
| `npm run typecheck` | PASS, sin diagnósticos | `typecheck.log` |
| `npm test` | exit 0; 25 archivos, 371/371 Vitest +1/1 Sites; cero skips | `full-suite-real.log` |
| `npm test` en base desechable `61610c1`, `/private/tmp/aunara-sdd014-baseline-6tmZN6` | exit 0; 25 archivos, 367/367 +1/1 Sites | `baseline-suite-real.log` |
| `node_modules/.bin/vitest run src/lib/privacy.test.ts src/hooks/useCloudSync.test.tsx src/components/AccessPanel.test.tsx src/components/LegalPanel.test.tsx --maxWorkers=2` | 138/138 | `focused-regression.log` |
| `npm run check:exercise-directory` | PASS | `directory-check.log` |
| `npm run test:exercise-directory` | 4/4 | `directory-tests.log` |
| `node --test scripts/prepare-sites-dist.node-test.mjs scripts/check-pages-client.node-test.mjs scripts/sw-scope.node-test.mjs` | 28/28; con los 4 del directorio totalizan 32 previos | `existing-node-guards.log` |
| `node --test scripts/auth-email-templates.node-test.mjs` | 10/10 | `green-guards-final.log` |
| `node --test /private/tmp/aunara-sdd014-candidate/scripts/auth-email-templates.node-test.mjs` desde `/private/tmp` | 10/10 | `green-guards-final-external-cwd.log` |
| `npm run build` y `node scripts/check-pages-client.mjs` | PASS raíz `/`, 32 archivos; raíz recompilada al final para dejarla disponible | `build-root.log`, `artifact-root.log`, `build-root-final.log`, `artifact-root-final.log` |
| `AUNARA_BASE_PATH=/aunara/ npm run build` y `AUNARA_BASE_PATH=/aunara/ node scripts/check-pages-client.mjs` | PASS rollback `/aunara/`, 32 archivos | `build-rollback.log`, `artifact-rollback.log` |
| `git diff --check` | PASS | comprobado al congelar |

No hay script lint: N/A, sin instalar herramientas. Dependencias reutilizadas mediante symlinks de las versiones existentes, con caches `.vite`, `.vite-temp` y `.tmp` propios en el candidato; no package/lock/workflow editado. La base desechable reutilizó los mismos paquetes con caches propios.

Reloj real: suite candidato inició a01:22:12 local del viernes 16Oct; base a01:23:43. Muestra Node posterior `2026-10-16T06:23:40.639Z` = `Fri Oct 16 2026 01:23:40 GMT-0500 (Colombia Standard Time)`, Node `v24.15.0`, `TZ` no definido y `NODE_OPTIONS` ausente; sin preload, reloj forzado, skips ni excepción heredada. Véase `runtime-clock.json`. No se produjo baseline rojo en esta corrida, por lo que D14-06 no requirió tratamiento comparativo especial. **Esto no arregla ni cierra los cuatro fallos históricos dependientes del día**; sus fuentes/tests permanecen intactos.

Contraste calculado según luminancia sRGB (`contrast.txt`): blanco/teal11.67:1; blanco/azul6.58:1; azul/arena5.85:1; tinta/arena14.39:1; tinta/blanco16.20:1. Es evidencia de colores, no revisión renderizada en clientes.

### Alcance exacto y huellas

Fuentes/documentos de implementación cambiados (solo los 9 previstos):

1. `src/lib/privacy.ts`: exclusivamente valor de DATA_CONTROLLER_EMAIL.
2. `src/components/LegalPanel.test.tsx`: aserción del contacto y cuatro casos aditivos ES/EN×privacy/terms; no se retiró cobertura.
3. `docs/compliance/README.md`: canal y estado local de ese canal.
4. `docs/compliance/retention-and-rights.md`: únicamente dirección.
5. `docs/compliance/incident-response.md`: únicamente dirección.
6. `supabase/templates/confirm-signup.html`: nuevo correo confirmación/reenvío.
7. `supabase/templates/reset-password.html`: nuevo correo recuperación.
8. `supabase/templates/README.md`: asuntos/plain-text/contactos/gates/rollback locales.
9. `scripts/auth-email-templates.node-test.mjs`: nuevos controles y negativos Node builtins.

Más este recibo y resultados/harness bajo la carpeta permitida. El SDD modificado antes de desarrollo es propiedad del principal; no se editó aquí. No se tocaron `02`, `03`, pendientes, contratos Auth, hooks, editor, consumidores legales, nombre/versión/fecha/consentimientos, activos de marca, dependencias ni configuración. No se tocó el canónico ni UAT5173.

`record-source-state.mjs` genera `source-sha256.json` **después de los builds**, incluyendo guardas/templates/tests finales, todas las fuentes de app y activos, paquetes/config y workflows; también `tracked-implementation.diff`. Reproducir con `node AUNARA_SOT/sdd/2026-10-16-sdd014-revision/record-source-state.mjs`. Los hashes de archivos NO-TOCAR permiten comparar con base. No se autohashea este README ni los logs para evitar recursión; el harness sí queda hasheado.

### Matriz de cierre de este rol

| Criterio | Estado de desarrollo local |
| --- | --- |
| C14-01 | Tests ES/EN y fuente/docs PASS; UI compilada pendiente del revisor |
| C14-03 | Contratos estáticos PASS; preview renderizado pendiente del revisor |
| C14-06 | Colores/estructura locales comprobados; Chromium/WebKit pendiente del revisor. Gmail/Outlook reales NO EJECUTADOS |
| C14-08 | Typecheck, tests, negativos y builds PASS; veredicto independiente pendiente |
| C14-02/04/05/07 | NO EJECUTADOS; fixture From o URL placeholder no acredita operación real |

Entrega a revisión independiente sin autodeclarar APPROVED. Ningún envío, cuenta, SMTP/DNS, secreto, push, deploy o commit realizado. Próxima acción: revisión fresca sobre el compilado raíz y previews con URL `.invalid` a320/390/1440, Chromium y WebKit, seguida de decisión del principal/Operator; operación remota requiere gate propio.
