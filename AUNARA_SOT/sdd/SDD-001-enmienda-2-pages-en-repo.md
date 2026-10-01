# Enmienda 2 de SDD-001 — GitHub Pages desde el repo Aunara

Versión: 0.1 · 30 de septiembre de 2026

Estado: **Aprobado por el Operator el 2026-10-01 para implementación técnica y publicación UAT controlada**

**Registro posterior de autorización (2026-10-01):** el Operator aprobó usar el repo existente `AC-Setroc/aunara` como fuente pública y Pages bajo `/aunara/`, incluidos commit, push y publicación UAT controlada; no autorizó retirar la publicación anterior ni modificar otros proyectos. El texto de gates/alternativas más abajo documenta la propuesta previa a esta decisión. Revisión independiente **APPROVED**; commit, push, Actions y smoke público Chrome completados según el registro posterior.

**LOG de revisión/entrega (2026-10-01):** typecheck PASS; 18 archivos/143 pruebas Vitest + Node PASS; cinco guards E2 incluidos negativos PASS; builds `/` y `/aunara/` PASS, artifact cliente allowlist de 30 archivos. Chrome escritorio/móvil ES/EN/login sin errores de consola ni overflow; Safari WebKit escritorio ES/EN/login PASS. Manifest y worker scope `/aunara/`, no raíz. Repo confirmado público y Pages/Actions habilitado; variables cliente publicables configuradas sin registrar valores. Supabase Repbook permanece pausado por límite gratuito: auth/sync real y allowlist callback pendientes de decisión del Operator. No hay cierre de deploy, PWA física ni retirada del sitio legado. Referencias/inventario y cambios previos de producto quedan fuera del commit público.

**LOG de publicación (2026-10-01, posterior a la revisión):** fuente `fc885680ca354210e3a5d36c6c3ab605d51ccac5` pusheado a `main` con autorización del Operator. [Actions run 36910796612](https://github.com/AC-Setroc/aunara/actions/runs/36910796612) verify y deploy SUCCESS. [Pages](https://ac-setroc.github.io/aunara/) y `data/exercises.json` HTTP 200; Chrome publicado ES→EN→ES y apertura/cierre de login PASS, consola sin errores ni advertencias. Manifest publicado `start_url`/`scope` resuelven a `/aunara/`. Deploy y smoke público quedan verificados; autenticación/sync real y allowlist callback siguen bloqueados por Supabase pausado. PWA física, worker legado y retirada del sitio anterior siguen pendientes, sin tocar terceros.

Documento base: [SDD-001 — Casa canónica de Aunara en Personal](./SDD-001-casa-canonica.md)

Origen: `[AUNARA/codex · GPT-5]`

## 1. Propósito, autoridad y gate

El Operator dispone que no se creen repositorios separados de despliegue para Aunara: código, documentación, configuración de publicación y salida compilada deben residir/publicarse desde el repositorio existente de Aunara. El despliegue propuesto es GitHub Pages a partir de un artifact producido por GitHub Actions en el mismo repo que contiene la fuente.

Esta enmienda conserva el resto de SDD-001 salvo los puntos que reemplaza explícitamente abajo. Donde difiera, **esta enmienda sustituye** la decisión de despliegue del SDD-001. No altera la regla de que ni esta enmienda ni el SDD original autorizan implementación: ambos requieren aprobación explícita. El estado permanece “Borrador” hasta aprobación registrada por el Operator.

La instrucción del Operator fija la dirección del producto; queda una comprobación de identidad técnica antes de configurar Actions: el checkout local observado aún tiene `origin=https://github.com/AC-Setroc/aunara-app.git`, mientras esta enmienda identifica el repo objetivo como `AC-Setroc/aunara`. Confirmar si se trata de la URL canónica renombrada, un alias o un remoto aún no actualizado. Esta especificación **no** cambia `origin`, renombra repositorios ni crea repositorios.

## 2. Problema y resultado deseado — reemplaza SDD-001 §1 y §5

La decisión anterior de mantener la aplicación en un repo privado y publicar desde `AC-Setroc/AC-Setroc.github.io` contradice la instrucción actual del Operator. Se quiere una sola base de proyecto: el repo existente de Aunara conserva fuente privada si el plan/configuración de la cuenta lo permite; Actions compila desde ese mismo repo y entrega solo los archivos estáticos necesarios a GitHub Pages mediante el artifact de Pages. No se crea ni se usa otro repositorio como destino de despliegue.

El público objetivo del sitio es Internet. Un repo fuente privado **no** vuelve privado el sitio Pages: GitHub indica que los sitios son públicos en Internet aunque el repo que los publica sea privado cuando el plan permita esa combinación. Pages desde repositorios privados está disponible en ciertos planes de pago; con GitHub Free personal el repo debe ser público. Los sitios Pages realmente privados requieren organización y GitHub Enterprise Cloud. Ver [planes de GitHub](https://docs.github.com/en/get-started/learning-about-github/githubs-plans), [Getting started with Pages](https://docs.github.com/en/pages/getting-started-with-github-pages) y [workflows personalizados de Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

Por tanto, mantener el repo fuente privado está condicionado a la configuración real de la cuenta. Si Pages desde el repo privado no está disponible, el proceso se detiene en el gate de cuenta/plan: no hacer público el repo, no crear otro repo de despliegue y no cambiar de hosting por iniciativa del agente; devolver la decisión al Operator.

## 3. Alcance enmendado y NO-TOCAR — reemplaza SDD-001 §§2 y 8

### Alcance de una futura implementación, solo tras aprobación

1. Configurar Actions en el repo existente de Aunara para ejecutar la verificación de fuente y, únicamente para la rama de producción acordada, construir la app y desplegar a GitHub Pages mediante un Pages artifact.
2. El artifact debe contener **solo** el sitio estático construido, desde `dist/client/` según el comportamiento actual de `npm run build`; no subir el repositorio, documentación, prototipos, source tree, `.env*`, archivos ignorados, `dist/server/` ni `dist/.openai/`.
3. Adaptar la app al project site path `/aunara/` si el repo Pages confirmado es `AC-Setroc/aunara`; validar el slug y URL final en Settings antes de fijarlo. No asumir que la URL raíz actual sigue siendo destino.
4. Hacer base-aware y verificar los paths de assets, manifest, service worker, navegación, fetch de datos, marca, iconos y metadata de compartir que hoy suponen `/`.
5. Documentar y ejecutar un corte reversible desde la publicación actual solo después de tener build y smoke completos en el destino nuevo; el apagado o retirada de la publicación anterior requiere autorización específica del Operator porque afecta una superficie pública externa.
6. Actualizar, en una fase posterior aprobada, el ADR/documentación que se lista en §5; esta enmienda no los cambia.

### Fuera de alcance

- Crear, importar o usar un repositorio adicional para compilar/publicar Aunara.
- Cambiar la visibilidad del repo, plan de GitHub, hosting, dominio, DNS, cuenta, organización, credenciales o secretos.
- Activar Pages, cambiar Settings, actualizar workflow, publicar, cortar tráfico, despublicar el sitio actual, push, merge o release en esta fase documental.
- Modificar producto o contenido funcional fuera de los cambios técnicos mínimos necesarios para servirlo correctamente bajo `/aunara/`.
- Cambiar la arquitectura de datos, almacenamiento local, Supabase, contenido de `public/data/`, copyright/atribución o cualquier regla metodológica.
- Reescribir historia/decisiones aceptadas sin conservar su carácter histórico y motivo de supersesión.

### NO-TOCAR durante la preparación de esta enmienda

- Todo archivo del repo salvo este nuevo documento de enmienda.
- El SDD-001 original y su estado; ADR 0002; README, índices, runbook, matriz UAT, docs de producto, código, pruebas, Vite config, manifest, service worker, workflows, `package.json`, `.gitignore` y lockfiles.
- Remoto `origin`, historia Git, rama, Settings del repo/cuenta, sitio público actual y el repositorio histórico `AC-Setroc/AC-Setroc.github.io`.
- Cambios de trabajo ya existentes en el árbol local; no stage, commit, reset, clean, push ni deploy.

### NO-TOCAR durante implementación futura

Además de lo anterior salvo los archivos que una aprobación posterior agregue expresamente al Scope, no cambiar nombres de repo/remoto, plan/visibilidad, diseño/copy, datos de usuarios, cuentas, contenido de `AUNARA_SOT/reference/`, otros sitios del mismo origen, ni settings compartidos de Actions. El corte de publicación antigua es un permiso externo separado y no queda autorizado por aprobar solo el cambio de subpath/código.

## 4. Estado real medido — reemplaza/añade a SDD-001 §3

El checkout examinado está en `/Users/alejandro/AI Projects/Personal/aunara`, rama `codex/aunara-rebrand`, HEAD `d3da8c0`; `git remote -v` informa `https://github.com/AC-Setroc/aunara-app.git`. La carpeta por lo tanto ya tiene gobierno/código en el estado local, pero la identidad remota configurada no coincide literalmente con `AC-Setroc/aunara`, identificador indicado por el Operator para el destino. Se debe confirmar la identidad exacta antes de habilitar publicación. El árbol observado tenía modificaciones preexistentes en README y documentos de producto, además de archivos nuevos; esta enmienda no los toca.

La base técnica observada evidencia que `/` no es intercambiable con `/aunara/`:

| Evidencia local | Hecho observado | Implicación para project Pages |
|---|---|---|
| `vite.config.ts:4-6` | Configura plugin React y no fija `base` | Vite actualmente compila para raíz; el project site necesita base path `/aunara/` confirmado. |
| `index.html:11-13,18,22,27` | Enlaces al manifest, iconos, OG image y entry module usan rutas que empiezan por `/` | Verificar HTML final de build: referencias publicadas no deben solicitar rutas en la raíz del host. |
| `src/App.tsx:242,622-623,890` | Fetch de ejercicios y dos marcas usan rutas root-relative; encontrar también referencias runtime adicionales antes de implementar | Deben apuntar al path base bajo el project site, sin romper local/dev ni otros recursos públicos. |
| `src/main.tsx:12-17` | Service worker se registra con `/sw.js` | En el sitio de proyecto, el worker debe resolverse dentro de `/aunara/`; verificar scope y control solo de la app. |
| `public/sw.js:1-5,25-34,38-48` | App shell, cache match y ruta fallback se expresan como `/` y worker usa caché `aunara-shell-v2` | Prefijar/derivar rutas de forma coherente; evitar capturar el home del host o borrar caches ajenos; versionar y probar migración del cache. |
| `public/manifest.webmanifest:5-6,12-22` | `start_url`, `scope` e iconos son root-relative `/` | Configurar manifest para `/aunara/` y validar instalación, launch, iconos y scope en móviles. |
| `package.json:6-13` | `npm run build` corre check, `tsc -b`, `vite build` y `scripts/prepare-sites-dist.mjs` | La salida cliente actual queda en `dist/client/`; no desplegar `dist/` entero porque contiene otras salidas. |
| `scripts/prepare-sites-dist.mjs:21-46` | Genera `dist/client`, `dist/server` y `dist/.openai` | Pages artifact debe empacar solo `dist/client`, nunca `server`/OpenAI hosting metadata. |
| `.github/workflows/ci.yml:1-40` | `Verify source` corre en push (`main`, `codex/**`) y pull request a main; tiene `contents: read`, instala con `npm ci`, corre typecheck, test y build | Un job de deploy futuro debe quedar condicionado a éxito y `push` de rama de publicación; elevar permisos solo en el job que los necesita. PR y ramas Codex no despliegan. |
| `public/sw.js:2-5`, `src/main.tsx:12-17`; publicación UAT registrada en `AUNARA_SOT/06-RUNBOOK.md` | El despliegue actual conocido sirve desde `https://ac-setroc.github.io/` y hay worker root-relative/root-scope | El nuevo URL de project site sería previsiblemente `https://ac-setroc.github.io/aunara/`. El worker antiguo de scope `/` en el mismo origin podría interceptar también `/aunara/`; corte/migración debe evaluarse y probarse, no asumir aislamiento por subpath. |

La raíz `https://ac-setroc.github.io/` y el nuevo project site comparten origin, pero difieren en pathname. Cambiar el sitio a `/aunara/` puede dejar links, bookmarks, metadata, PWA ya instalada y el worker raíz apuntando/actuando distinto. Una PWA con scope `/aunara/` no puede sustituir por sí sola un worker preexistente de scope `/`. La solución de convivencia/corte con el sitio raíz necesita inspección y prueba reales; no hay en este SDD autorización para editar el repo histórico ni para desregistrar workers de usuarios.

### Contradicciones documentales conocidas; proponer actualizar después, no editar ahora

1. `docs/architecture/0002-source-and-deployment-repositories.md` (ADR 0002), §Decisión y §§Flujo/Consecuencias, declara `AC-Setroc/AC-Setroc.github.io` como repo exclusivo de publicación. Propuesta: preservar ADR como registro histórico y marcarlo **Supersedido por ADR 0003 / decisión del Operator**, o publicar un nuevo ADR que documente Pages artifact desde el mismo repo. No reescribir silenciosamente un ADR aceptado.
2. `README.md:44-46` dice que Pages está intencionalmente separado; proponer texto que identifique el repo Aunara como fuente y Pages, con artifact únicamente de `dist/client/`.
3. `docs/product/README.md` sección “Estado de repositorios” dice que la app se despliega desde `AC-Setroc/AC-Setroc.github.io` y que Pages no es fuente; proponer actualización y URL base nueva una vez confirmadas.
4. `docs/product/2026-08-25-feedback-work-plan.md`, Fase 0/GOV-06 y su “Estado actual verificado” registran el modelo split source → Pages. Proponer nueva decisión/fecha/evidencia, preservar el estado histórico sin darlo como vigente.
5. `AUNARA_SOT/README.md:11`, `02-ESTADO-ACTUAL.md:9`, `06-RUNBOOK.md` sección Publicación y el original `AUNARA_SOT/sdd/SDD-001-casa-canonica.md` §§1–2, §3, diseño §§4–6, criterios A9/A10 y §§8–10 reiteran el repo de publicación separado. Proponer sustituir los pasajes afectados y dejar enlaces a esta enmienda/ADR nuevo.
6. `docs/product/2026-09-26-device-uat-matrix.md` y `AUNARA_SOT/sdd/2026-09-26-device-uat-and-session-engine/{SPEC,LOG}.md` tienen URL `https://ac-setroc.github.io/`. Proponer no cambiar evidencia histórica de smoke ya corrido; agregar nueva URL/fecha para la siguiente ronda y ejecutar smoke completo en project path.

## 5. Diseño propuesto — reemplaza SDD-001 §§4.1 y 4.2, partes de §§6 y 9

### Repositorio y flujo fuente → publicación

- Un solo repo de Aunara contiene código, docs, CI y workflow de publicación. GitHub Pages obtiene su artifact de Actions dentro de ese mismo repo; no hay rama/repo de Pages usado como destino de contenido.
- Source repo privado si el plan y Settings del owner lo permiten. La web Pages resultante será públicamente accesible, salvo que el Operator buscara deliberadamente un Pages privado y dispusiera de organización + Enterprise Cloud; esto no está solicitado ni supuesto.
- Workflow recomendado: integrar verificación (`npm ci`, directorio bilingüe check, typecheck, tests, build) con job de deploy dependiente de verificación correcta. El deploy job solo corre ante `push` a la rama de producción confirmada; nunca PR, `codex/**`, tags no autorizados o workflows manuales no aprobados. Publica `dist/client/` como Pages artifact y despliega con las Actions oficiales Pages (`configure-pages`, `upload-pages-artifact`, `deploy-pages`) en el environment `github-pages`.
- Permisos mínimos y acotados por job: verificación con lectura; publicación únicamente con `pages: write` e `id-token: write` además de lo requerido por checkout. Restringir environment/branch; conservar SHA de commit y URL publicada como evidencia. Versiones de Actions y modelo de permisos deben pasar revisión de seguridad al implementar.
- No subir como artifact el repositorio completo, `dist/` entero, `dist/server/`, `dist/.openai/`, documentación SOT, prototipos, `.env`, secretos, dependencias o resultados locales. Solo `dist/client/` debe integrar el artifact Pages.
- El hecho de tener Pages en el mismo repo no significa que la publicación incluya el repo ni sus documentos; el artifact de cliente estático es la frontera de exposición.

### Subpath y compatibilidad de Vite/PWA

Suponiendo que el slug vigente confirmado sea `aunara`, el project site apunta a `/<repo>/`, previsiblemente `/aunara/`; publicar en subdirectorio exige una base coherente en cada consumidor.

En implementación habrá que auditar/ajustar, según evidencia del build, al menos:

- `vite.config.ts`: base de compilación `/aunara/` solo para producción Pages, manteniendo el dev server local funcional.
- `index.html`: manifest, touch/favicons, `og.png` y script entry. Confirmar mediante `dist/client/index.html`, no asumir que Vite reescribe todas las variantes de atributo/metadata.
- App runtime y datos estáticos: fetch `/data/exercises.json`, `/brand/*.svg` y cualquier path raíz encontrado para iconos, media o JSON; generar paths con base Vite/URLs relativos apropiados para que `/aunara/...` resuelva.
- `public/manifest.webmanifest`: `start_url`, `scope` y `icons[].src` bajo `/aunara/`; confirmar instalación y launch desde el URL del project site.
- `src/main.tsx` y `public/sw.js`: URL de registro bajo `/aunara/`, scope que no exceda el directorio Aunara, APP_SHELL y navegación/cache/fallback dentro de ese mismo base path. No usar `caches.delete()` que elimine caches de otras apps; versionar la caché propia. Convivencia con el worker histórico de scope `/` se trata como riesgo de cutover aparte.
- Link navegación SPA, deep links (si existen), fetch de JSON `dataPath`, URL sociales y cualquier stylesheet/asset que resuelva relativo a raíz; validar también direct-load/refresh y 404 behavior de Pages.

No se da por demostrado que basta con `base: '/aunara/'`: cada referencia y artefacto emitido debe ser inspeccionado y ejercitado en la URL deployada.

### Reversa/cutover

- Revertir un deploy al artifact/commit anterior de Actions dentro del mismo repo es reversa de build, pero no restaura la URL raíz ni resuelve por sí sola el worker de scope `/`.
- Antes de cambiar el sitio actual, capturar URL, SHA desplegado, build/artifact y estado de PWA en los dispositivos de prueba; nuevo destino debe pasar verificación y smoke.
- El corte/retirada de `AC-Setroc/AC-Setroc.github.io` es una acción pública separada, con decisión explícita del Operator y plan reversible. No hay que borrar el repo ni su historial; debe quedar claro que ya no publica Aunara. Si la reversa afecta PWA instalada/datos de navegador, documentarlo y probarlo.

## 6. Riesgos y mitigaciones — añade/sustituye SDD-001 §6

| Riesgo | Mitigación / gate |
|---|---|
| Repo privado sin elegibilidad Pages según plan | Verificar plan/Settings en la cuenta propietaria. Si no permite Pages desde ese private repo, detenerse; no abrir source ni crear repo alternativo. |
| Confundir privacidad de código y sitio | Tratar sitio Pages como público. Revisar artifact y datos antes de despliegue; no publicar jamás `AUNARA_SOT`, source, env o archivos fuera de cliente. |
| Identidad/slug divergentes (`aunara` vs `aunara-app`) | Confirmar repo existente y URL canónica; sin cambios al remote/config hasta que Operator resuelva la discrepancia. Base path y URL no se fijan en código antes. |
| Paths root-relative rompen en `/aunara/` | Inventario estático de strings `"/…"`, inspección del bundle/HTML/manifest, prueba automatizada de URL y smoke real bajo subpath. |
| PWA no instala o abre la raíz | Test de manifest, icons, start_url, scope, app shell y worker registrados desde `/aunara/` en Safari/iOS y Android Chrome; preservar ruta degradada online. |
| Worker raíz existente intercepta nuevo project site | Confirmar workers en la URL actual y su control de `/aunara/`; acordar corte/retirada con autorización. No afirmar aislamiento por path. |
| Build server u otros archivos se hacen públicos | Artifact allowlist exacta `dist/client/`; test negativo que falle si contiene `server`, `.openai`, source/docs, env o secretos. |
| Deploy desde rama equivocada o PR | Job condicionado a verify+evento push+branch exacto; prueba negativa por PR/`codex/**` no despliega. |
| Ruptura de URL/links bookmark/instalación | Registrar URL actual/nueva, decidir redirects (Pages no ofrece redirect universal fiable de una página raíz a otro repo), versionar cutover y no apagar anterior hasta aceptación. |
| Cuotas/permisos Actions o environment | Confirmar Actions habilitado y permisos Pages/id-token; limitar permisos al job y usar environment protegido acorde a la cuenta. |

## 7. Criterios de aceptación falsables y verificación — reemplaza criterios A9–A10 y agrega

Los criterios originales que no contradigan esta enmienda se conservan. A9/A10 del SDD-001 quedan sustituidos por E2-A9–A18:

| ID | Criterio comprobable |
|---|---|
| E2-A9 | Existe un único repo remoto de Aunara para fuente y Pages; `origin` confirmado por el Operator coincide con el repo existente elegido. Ninguna Action checkout/deploy escribe en otro repositorio. |
| E2-A10 | Antes de publicar, evidencia de repo Settings muestra que Pages puede obtener un artifact de Actions bajo el plan/owner real. Si repo privado no es elegible, release bloqueada y source sigue privado. |
| E2-A11 | Job de verificación pasa check de directorio, typecheck, tests y `npm run build` desde checkout limpio/lockfile; el job de deploy depende de ese éxito y solo corre en push a la rama autorizada. |
| E2-A12 | Artifact Pages contiene exclusivamente el contenido de `dist/client/`; test de inventario no encuentra `dist/server`, `.openai`, docs/SOT, `src`, `.env*`, secretos, `node_modules`, prototipos o herramientas. |
| E2-A13 | El build de producción sirve HTML, JS, CSS, manifest, iconos, marca y datos bajo `/<slug>/` (`/aunara/` si se confirma slug) sin solicitudes inadvertidas a `https://ac-setroc.github.io/<asset>` en raíz. En local/dev y pruebas existentes no hay regresión. |
| E2-A14 | PWA manifest tiene `start_url`, `scope`, `icons[].src` bajo el subpath; registro del worker, app shell, caché, navegación offline/fallback funcionan dentro del subpath y el worker no solicita rutas `/` del host. |
| E2-A15 | Test de instalación/actualización PWA en iPhone Safari/WebKit y Android Chrome confirma URL de arranque y scope; verificar por separado la interacción con el service worker legado antes de declarar corte. |
| E2-A16 | URL final Pages abre `/aunara/` (o slug confirmado), refrescar ruta navegable no da 404, assets no devuelven 404 y flujo smoke UAT-00 corre; pruebas funcionales completas UAT se mantienen separadas del despliegue. |
| E2-A17 | Push de PR y `codex/**` no despliega; fallo en verificación impide deploy. Deploy autorizado deja URL, commit SHA y artifact/run vinculados en SOT/handoff. |
| E2-A18 | Publicación antigua solo se retira tras autorización explícita y después de E2-A10–A17; ruta de reversa/restauración de URL y estado del worker está escrita y probada en alcance seguro. |

Pruebas negativas: (1) inspeccionar artifact y hacer que una fixture de `dist/server` falle el allowlist; (2) provocar fallo de build y confirmar job deploy skipped; (3) ejecutar workflow desde PR/`codex/**` y confirmar ausencia de deployment; (4) comprobar que una URL `/aunara/data/...` resuelve y que la URL host raíz `/data/...` no es dependida por el build project; (5) instalar desde URL vieja/nueva en dispositivo de prueba y verificar qué worker controla cada ruta. No invalidar/desinstalar PWA/datos personales de usuarios reales como prueba.

**Matriz de verificación futura:** CI limpio (directory check, typecheck, tests, build), inspección del artifact, inspección de permisos/jobs Actions, smoke de red/recarga en Pages, auditoría 404/URLs en JS/HTML/CSS/manifest, WebKit escritorio+iPhone, Android Chrome y regresión UAT-00. Lint solo si se incorpora o ya existe un script; no inventar check no presente.

## 8. Runbook y entrega futura — reemplaza SDD-001 §§8–10

1. Confirmar en GitHub la identidad exacta del repo existente (`AC-Setroc/aunara` vs URL de remote local `aunara-app`) y la rama de producción; no renombrar ni ajustar remotes sin permiso.
2. Confirmar owner, tipo de cuenta/plan, Pages habilitado en repo privado, GitHub Actions activo, environment y permisos necesarios. Según docs actuales, GitHub Free personal habilita Pages en repos públicos; algunos planes pagados admiten Pages en repos privados. Un Pages privado en sí requiere org + Enterprise Cloud. La configuración real se verifica en el account/repo, no se infiere por el remoto.
3. Confirmar por escrito que el Operator acepta que el sitio publicado se vea públicamente aunque el source siga privado. Si no acepta, detener; la especificación no promete hosting Pages privado en plan personal.
4. Elegir URL/slug definitivo, confirmar subpath y evaluar worker raíz existente/alcance de cutover antes de tocar código.
5. Tras aprobación del SDD actualizado, implementar job de Actions y cambios base-aware estrictamente en archivos incluidos en el alcance aprobado; no hacer deploy aún.
6. Correr matriz completa local; revisar artifact generado `dist/client/`, paths, privacidad, SW/PWA, URLs e historial. Revisión independiente compara diff con NO-TOCAR.
7. Probar a staging/Pages del mismo repo según posibilidad de cuenta, correr smoke en nuevo URL, y registrar run ID, SHA fuente y artifact.
8. Pedir aprobación del Operator para publicar/cortar. Solo tras confirmación explícita el deploy de Pages hace visible el sitio; la vieja publicación se mantiene hasta pasar aceptación, entonces su retirada recibe aprobación específica.
9. Actualizar documentación contradictoria mediante cambios acotados. ADR 0002 se conserva como histórico supersedido y un ADR nuevo registra la decisión vigente; README, índice, SOT, runbook, plan y UAT apuntan a repo Pages mismo y URL correcta. Datos de pruebas históricas no se reescriben.
10. Reversa: deploy anterior del mismo repo mediante Pages deployment history/artifact; si el problema es el path, restaurar artefacto anterior manteniendo el sitio legacy activo; no revertir repo visibility ni cambiar hosting. Para un worker legado que contamine el subpath, detener nueva instalación/corte y pedir plan de migración; no limpiar caches de usuarios sin consentimiento.

## 9. Decisiones y aprobación explícita solicitada

Se solicita al Operator aprobar o corregir estos puntos, en conjunto o por separado:

1. Que el repo existente `AC-Setroc/aunara` sea la única ubicación remota de código y Pages artifact, sin repositorio de despliegue separado.
2. Que la publicación del sitio sea pública en Internet, mientras el repo fuente se mantiene privado si cuenta/plan lo permite.
3. Que, si se confirma el slug `aunara`, se planifique project Pages en `/aunara/` y se incluya el trabajo base-aware de Vite/PWA descrito aquí.
4. Que la discrepancia entre repo canónico indicado `AC-Setroc/aunara` y `origin` local `AC-Setroc/aunara-app.git` quede como comprobación bloqueante previa a implementar/cambiar Settings, no como autorización implícita de renombrar.
5. Que retirar la publicación vieja desde `AC-Setroc/AC-Setroc.github.io` sea un gate de corte posterior separado, sin crear repo nuevo ni borrar historial.
6. Que documentación/ADR contradictorios solo se actualicen tras aprobación de esta enmienda y dentro de un alcance de implementación explícito.

**Nada de lo anterior autoriza en este turno** cambios al source, workflows, Settings, URLs, worker, cuenta, Git, push, publicación ni repo histórico. Implementación permanece bloqueada hasta respuesta afirmativa inequívoca y SDD vigente aprobado.

## 10. Fuentes técnicas consultadas

- GitHub Docs, [GitHub plans](https://docs.github.com/en/get-started/learning-about-github/githubs-plans): disponibilidad de Pages en planes/privacidad de repo.
- GitHub Docs, [Getting started with GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages): disponibilidad de Pages y publicación desde repositorio.
- GitHub Docs, [Using custom workflows with GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages): publicación con Actions/artifact.
- GitHub Docs, [Deploying your website automatically](https://docs.github.com/en/get-started/start-your-journey/deploying-your-website-automatically): permisos, environment, artifact y deploy-pages.
