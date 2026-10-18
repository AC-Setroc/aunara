# SDD-016 — recibo de desarrollo

2026-10-16. `[AUNARA/codex · modelo no expuesto]`. **Implementado y APPROVED técnico; cierre del Operator pendiente.** Ver revisión y entrega al final. Las secciones de desarrollo conservan lo que verificó aquel frente, no sustituyen el veredicto posterior. No es evidencia de producción.

## Base y alcance

Checkout aislado `/private/tmp/aunara-sdd015-016-candidate`, no canónico ni servidor UAT. Fuente base `22ee411` (SDD-015 integrado); durante esta tarea HEAD avanzó a `26d60a9` exclusivamente con documentación aprobada por el principal, sin cambiar la base de fuente.

Implementación limitada a `src/lib/cloudStore.ts`, `src/lib/cloudSnapshot.ts`, `src/hooks/useCloudSync.ts`, sus tres archivos de pruebas y la enmienda mínima de `scripts/auth-email-templates.node-test.mjs` aprobada por el Operator. Este recibo es el único documento escrito por el agente de desarrollo; probe/resultados/verificación y documentación de entrega pertenecen a otros frentes.

## Cambio y fronteras

- La lectura distingue ausencia real de fila de fila existente con `payload: unknown`, incluso null, false, cero, cadena vacía o undefined. Los errores de transporte siguen rechazando la lectura.
- `validateRepbookSnapshot` expone una unión válida/inválida usando exactamente las comprobaciones anteriores. `normalizeRepbookSnapshot` conserva la misma referencia fallback ante rechazo; no cambian schemaVersion, payload ni reglas de validación.
- Cada bootstrap existente cierra la elegibilidad de escritura e invalida el temporizador anterior. Un remoto inválido termina antes de reconciliar, emitir callback remoto, establecer lastSaved o guardar: error ES/EN neutral y copia local intacta.
- Generación, identidad y vigencia del efecto impiden que lecturas o guardados antiguos autoricen escrituras o sustituyan el estado de otro ciclo. Cada retry vuelve a leer; editar localmente o limpiar un error Auth no desbloquea el guardado. La ausencia o una validación posterior correcta sí habilitan el flujo normal.
- No se deshace un POST ya enviado antes del rechazo; su respuesta tardía no puede cambiar las marcas ni el error de una nueva sesión. No se añade cancelación remota, reparación, reset ni nueva API de retry.
- H-03 sigue fuera: dependencias del bootstrap `[client, user]` intactas. Se conserva la política existente de inicializar una cuenta sin fila con el snapshot local; no se introduce una política nueva de asignación de datos entre cuentas.

## RED → GREEN y comprobaciones

Se escribieron primero las pruebas y se ejecutó, antes de editar runtime:

```text
npx vitest run src/hooks/useCloudSync.test.tsx src/lib/cloudStore.test.ts src/lib/cloudSnapshot.test.ts --maxWorkers=2
```

Resultado inicial: **28 FAIL / 97 PASS**, exit 1. Incluye el nuevo contrato de lectura, el nuevo resultado explícito de validación y los casos de gate que terminaban indebidamente en `synced`. Advertencia de alcance de esta evidencia: los mocks del hook ya devolvían la nueva unión de lectura, incompatible con el hook baseline; por tanto esos rojos no sustituyen una reproducción causal HTTP con payload crudo de sport/structure. Esa demostración pertenece al probe independiente baseline/candidato.

Tras la implementación, el mismo comando: **125 PASS / 3 archivos**, exit 0. Se agregaron además dos casos de respuesta tardía del debounce ya enviado (resolve/reject de A con B bloqueado); están incluidos en las corridas globales siguientes.

| Comprobación final de desarrollo | Resultado |
| --- | --- |
| `npm run typecheck` | exit 0 |
| `npm test` con fecha real | 396 Vitest PASS / 25 archivos + 11 Node PASS; exit 0 |
| `NODE_OPTIONS=--require=/private/tmp/aunara-sdd014-candidate/AUNARA_SOT/sdd/2026-10-16-uat-dev-revision/harness/wednesday-clock.cjs npm test` | 396 Vitest PASS / 25 archivos + 11 Node PASS; exit 0 |
| `git diff --check` | exit 0 |

La suite conserva H-01, H-02 y sus aserciones; no se debilitaron mocks, se eliminaron pruebas ni se añadieron skips. Los cambios de fixtures anteriores del hook son exclusivamente la adaptación al nuevo contrato load. SDD-015 y su fixture de miércoles no se editaron.

Cobertura nueva: sport vacío, posición de estructura ≥ tamaño, null/falsy, versión desconocida, shape anidado inválido, remoto válido con la misma referencia del local, ausencia real, transporte, edición local >800 ms, clearAuthError, rebootstrap con temporizador pendiente, retry pendiente/inválido/válido, cuentas A → B → A, lectura tardía de A, bootstrap save tardío y debounce save tardío (éxito/error).

## Transición de guarda SDD-014 aprobada

El hash de `useCloudSync.ts` del script de correo se actualizó a **`8bf75a022a17f17731a2aea59354c806ea884dd2d8a300b06dc19e1e4d9536f1`**, con comentario de procedencia SDD-016. No se modifican hashes de privacidad/LegalPanel ni comprobaciones, negativos o conteos. La negativa `N4 consent mutation` continúa siendo rechazada y pasa como guarda en ambas suites. El revisor debe recalcular este hash y examinar el diff del hook por su cuenta antes de aprobarlo; actualizar el hash no acredita por sí mismo la conservación del contrato.

## Documentación Supabase y pendiente de verificación

Se consultaron [maybeSingle](https://supabase.com/docs/reference/javascript/maybesingle) y [upsert](https://supabase.com/docs/reference/javascript/upsert); cero/una fila se distingue antes de validar su contenido y upsert sigue siendo escritura por `user_id`. El principal confirmó la consulta HTTP del changelog de hoy y que el aviso TLS de noviembre no afecta este cambio de variante de datos. No se modifican SDK, dependencias, Auth, consentimiento, borrado, privacidad, tablas, RLS, migraciones, SMTP/DNS ni cuentas reales.

**No verificado por este agente:** build aislado, HTTP baseline/candidato, Chromium/WebKit, bases `/` y `/aunara/`, ES/EN en navegador y revisión independiente del diff. Son responsabilidad del frente probe y del revisor; este recibo no los da por hechos. No se ejecutó build con configuración real, no se usó servidor UAT, no hubo commit, push ni publicación por parte del agente de desarrollo.

## Revisión independiente y cierre técnico — APPROVED

2026-10-16 · `[AUNARA/codex coordinador/revisor · modelo no expuesto]`. El coordinador **no implementó los siete archivos de fuente/tests/guarda ni el probe**. El agente revisor independiente completó inspección, suites, builds y repetición HTTP, pero se interrumpió por límite de uso antes de escribir su veredicto; el agente de entrega también se interrumpió. No se atribuye aprobación final a esos agentes. Este frente completa revisión/entrega con diff inspeccionado, resultados contrastados y nuevas ejecuciones propias, sin modificar implementación para aprobarla.

| Criterio | Evidencia contrastada al retomar |
|---|---|
| Lectura/validación y fail-closed | Diff de los tres runtime inspeccionado: unión ausente/presente desconocido, mismas reglas y contrato fallback; rechazo antes de callback/reconciliación/save. Generación/identidad y cancelación del temporizador cierran rebootstrap y debounce. Sin nueva política de conflictos ni cambios a H-03. |
| Tests/cobertura | Diff de tres tests inspeccionado: casos nuevos y adaptación de mocks al envelope, sin eliminación de aserciones ni skip. Nueva ejecución propia real396/25 + Node11 PASS; miércoles396/25 + Node11 PASS. Typecheck/diff-check PASS. |
| Negativo causal HTTP y normales | baseline.json24/24 expectativas:16 negativos con3POST y remoto alterado,8normales W-01. candidate.json24/24:16 negativos con0POST, remoto JSON idéntico y local conservado tras edición,8normales W-01. Chromium/WebKit × raíz/rollback × ES/EN. No se confunden los rojos de contrato unitario con la reproducción HTTP. |
| Repetición independiente HTTP | `/private/tmp/sdd016-independent-probe.6uWxW6/candidate.json`,24/24 PASS; SHA256 `7eb023e757e74db7917c2abffeb3d87bd71f0126adb38d097d828bd974167237`. Leído y contrastado por coordinador: tres hashes runtime coinciden con fuente y candidate.json original;16negativos0POST, remoto conservado,8normales verdes. Salida propia del revisor, no sobreescribe recibos del desarrollador. |
| UI | Capturas sintéticas originales en verification.txt inspeccionadas por el frente probe; coordinador inspeccionó Chromium ES y WebKit EN, mensaje completo/legible en Cuenta/privacidad. No cuentas/tokens reales. |
| Build/guardas | Nuevos npm run build sintéticos para `/` y `/aunara/` PASS, allowlist32 cada uno. `node --test scripts/check-pages-client.node-test.mjs scripts/sw-scope.node-test.mjs`:27/27 PASS, incluidos negativos. No hay script lint; no se añadió. |
| Auth/consentimiento y guarda | Callback createAccount y todo el resto del hook hasta EOF byte-idéntico a26d60a9; diff fuera del gate sin cambios de Auth, consentimiento, borrado o redirect. Hash useCloudSync recalculado independientemente `8bf75a…`, coincide con script y ambos probes. Guardas N1–N4 siguen detectando mutaciones y controles normales pasan. Privacidad/LegalPanel/plantillas/package/lock/workflow intactos. |

Incidentes registrados, no ocultados: primera suite miércoles del revisor395PASS/1FAIL por timeout5000ms en WorkoutPanel.test.tsx:54 bajo carga concurrente; segunda corrida con carga reducida396/25+11PASS, sin modificar tiempo/skip/aserciones. Nueva corrida propia al retomar también396/25+11PASS. Primer arranque del probe independiente bloqueado por sandbox (server exit1); repetición con permiso local completó24/24. En el cierre, el build rollback fue correcto pero el primer check de artifact se invocó sin AUNARA_BASE_PATH y buscó `/` erróneamente; al ejecutar `AUNARA_BASE_PATH=/aunara/ node scripts/check-pages-client.mjs` validó32/32, sin cambiar archivos de fuente.

## Entrega y límites

Fuente revisada (SHA256):

```text
27d42eb76759dac7254556ab546a30e19ace4456f505a4ffc9c43ac5d85c12c6 src/lib/cloudStore.ts
7f57636abd85d24c1855d34b8c8f6439af2e2998f3160c1970d65bb618a9a115 src/lib/cloudSnapshot.ts
8bf75a022a17f17731a2aea59354c806ea884dd2d8a300b06dc19e1e4d9536f1 src/hooks/useCloudSync.ts
ade0f71c0fd3e172465ed21defcd328f334cfb6d60e49ec49a3a0cc5f5b5592e src/lib/cloudStore.test.ts
09b283b3b9a33040bd20bba1aeb0c68be090fc00663d4cfee5741e3ec83836ab src/lib/cloudSnapshot.test.ts
ac540cb0b5d1953d6e22d3a517a14c360c89435ca25f8e4c437bbc484f704c9b src/hooks/useCloudSync.test.tsx
03ca7d57635a81f55f592ed10c38f8a3097e75e14125f91210f8c92d4daf49b5 scripts/auth-email-templates.node-test.mjs
```

Commit enfocado016 sobre26d60a9 con esos siete archivos, cinco artefactos de evidencia, SDD016 y tres documentos SOT; push a dev conforme orden permanente. Consultar Git para SHA final. CI de ese commit se verifica después de subir; no se da por verde por las corridas locales. SDD015 ya está integrado y CI#41 SUCCESS. El servidor humano5173 y el canónico dirty **no se actualizaron**: siguen fuera del scope, no usar su fuente anterior para aceptar016. Nada publicado a main, ningún cambio SMTP/DNS/cuentas/DB real. H-03, recuperación LAN→prod, SMTP de marca y UAT humana/Safari físico continúan pendientes. La tabla histórica de hashes base61610c1 de SDD014 no representa el hash nuevo del hook; esta transición aprobada es la referencia vigente sin reescribir evidencia histórica.

Confirmación posterior de entrega: código c48664be62cc49473db529c1ff1f6c7b332199c7 confirmado en origin/dev, [Verify source #42](https://github.com/AC-Setroc/aunara/actions/runs/38956392413) completed/success; main dfffa873a2a29ee1535c49149f92a734c873923d sin cambios. Este recibo posterior se sube en commit solo documental; la aprobación/CI de código se refiere a c48664b y su árbol de implementación idéntico, no anticipa la corrida del commit documental.
