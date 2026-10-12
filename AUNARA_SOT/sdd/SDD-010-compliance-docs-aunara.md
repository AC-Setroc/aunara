# SDD-010 — Registro de cumplimiento al día: marca, hosting y dominio

2026-10-12 · v0.1 · Estado: **Aprobado por el Operator; implementado en worktree aislado, revisión independiente pendiente**.
Origen: `[AUNARA/claude · modelo no expuesto]`.
Casa canónica: `/Users/alejandro/AI Projects/Personal/aunara`. Rama de trabajo documental: `dev`.

Solo documentación. No cambia la aplicación, el texto legal que ve la persona, la versión jurídica, el backend ni ningún proveedor. Un SDD aprobado habilita editar los cinco archivos de `docs/compliance/` y los hunks propios de la SOT; nada más.

## 1. El problema, en el idioma del Operator

El registro interno de privacidad y cumplimiento describe un producto que ya no existe: se llama Repbook, lo aloja OpenAI Sites y no tiene dominio propio. Desde el 8 de agosto la app se llama Aunara, desde el 1 de octubre se sirve desde GitHub Pages y desde el 7 de octubre vive en `https://aunaratraining.com/`. Si mañana hay que responder una solicitud de un titular, atender un incidente o mostrarle el registro a un abogado, el documento que se abre está desactualizado en tres hechos básicos.

Resultado buscado: que `docs/compliance/` describa el sistema real a la fecha, con los mismos controles y límites que ya declara, y que deje por escrito, sin resolverla, la pregunta de si el cambio de hosting y dominio obliga a una nueva versión del aviso de privacidad. Esa decisión es jurídica y queda fuera de este SDD.

## 2. Alcance, allowlist y NO-TOCAR

### Allowlist, efectiva solo tras aprobación explícita

| Archivo exacto | Cambio permitido |
|---|---|
| `docs/compliance/README.md` | Título y menciones de marca a Aunara; fecha de estado del registro; sección nueva «Cambios desde la versión 1.0» que enumere rebrand, hosting y dominio como hechos con fecha y deje la decisión de versión como pendiente explícito; pendientes actualizados (contratos del proveedor de hosting ahora nombrado); nota del canal de privacidad con actualización diferida según D-10-3. |
| `docs/compliance/data-processing-inventory.md` | Fila/viñeta de hosting: GitHub Pages en lugar de OpenAI Sites, sin afirmar control de acceso; dominio `aunaratraining.com` con GoDaddy como registrador/DNS; menciones de marca; almacenamiento del navegador (claves `repbook-*`, sesión Supabase, Cache API) según inventario observado en SDD-002. |
| `docs/compliance/retention-and-rights.md` | Menciones de marca únicamente. Plazos, canal y acciones intactos. |
| `docs/compliance/media-rights.md` | Menciones de marca únicamente. Decisión y fuentes intactas. |
| `docs/compliance/incident-response.md` | «Proveedor de hosting» pasa a nombrar GitHub Pages y GoDaddy en contactos mínimos. Procedimiento intacto. |
| Este SDD | Estado, decisiones, evidencia y log. |
| `AUNARA_SOT/02-ESTADO-ACTUAL.md`, `AUNARA_SOT/PENDIENTES.md`, `AUNARA_SOT/03-HISTORIA-Y-BACKLOG.md` | Solo hunks propios de SDD-010; no reescribir entradas previas. |

### NO-TOCAR

- `src/components/LegalPanel.tsx`, `src/lib/privacy.ts` y cualquier texto legal visible en la app. La corrección «OpenAI Sites → GitHub Pages» del texto en pantalla ya está especificada y aprobada en SDD-002 §4; vive sin publicar en `wip/dirty-2026-10-12`. Este SDD no la duplica ni la publica.
- `LEGAL_VERSION = "1.0"` y `PRIVACY_EFFECTIVE_DATE = "2026-07-29"` (`src/lib/privacy.ts:4–5`). Decidir si el cambio de hosting/dominio es material y exige v1.1 con nueva aceptación es decisión del Operator con asesoría jurídica; el SDD la registra como pendiente, no la toma.
- Controles declarados en `README.md:21–33`, plazos de `retention-and-rights.md:30–36`, procedimiento de `incident-response.md:9–27` y decisión de `media-rights.md:21–30`. Solo cambian hechos descriptivos, no compromisos.
- `public/DATASET_NOTICE.md`, `public/DATASET_LICENSE`, atribuciones, `README.md` raíz, `docs/product/`, `docs/architecture/`, código, tests, workflows, `.env*`, Supabase, DNS, Auth, SMTP.
- No afirmar cumplimiento jurídico, no declarar «sin cookies», no inventar plazos de respaldo de GitHub o GoDaddy, no copiar valores de capturas ni datos de titulares.

## 3. Estado de partida, medido y no supuesto

Lectura fresca 2026-10-12 sobre `dev` = `main` `dfffa87` + documentación, en este entorno.

| Evidencia | Hecho y límite |
|---|---|
| `grep -rn -E 'Repbook' docs/compliance` → **11** resultados en 4 archivos (`README.md:1,6,42`; `data-processing-inventory.md:9,14,16`; `retention-and-rights.md:7,10`; `media-rights.md:10,19,27`) | La marca anterior sigue siendo la única en el registro. |
| `grep -rn -E 'Aunara' docs/compliance` → **0** | La marca vigente no aparece. |
| `grep -rn -E 'OpenAI Sites' docs/compliance` → **1** (`data-processing-inventory.md:13–14`: «entrega los archivos de la aplicación web y controla el acceso al sitio publicado») | Proveedor incorrecto desde `fc88568` (2026-10-01). La frase «controla el acceso» no aplica a Pages: el sitio es público sin control de acceso. |
| `grep -rn -E 'GitHub Pages\|github\.io\|aunaratraining' docs/compliance` → **0** | Hosting y dominio reales ausentes. |
| `docs/compliance/README.md:3` «versión personal de UAT, 29 de julio de 2026»; `:15` «versión 1.0, vigentes desde 2026-07-29» | Coincide con `src/lib/privacy.ts:4–5`. Ninguna versión nueva se emitió con el rebrand (`4a17378`, 2026-08-08) ni con el cambio de hosting. |
| `docs/compliance/README.md:17–19` | El propio registro exige aviso nuevo ante cambio material. El SDD no decide si lo hubo; lo deja visible. |
| `src/components/LegalPanel.tsx:72–73` en `main` | El aviso publicado hoy en `aunaratraining.com` dice «OpenAI Sites» en ES y EN. Discrepancia conocida; corrección aprobada en SDD-002, sin publicar (`git diff main e4baf5f -- src/components/LegalPanel.tsx` muestra el reemplazo). |
| `src/components/LegalPanel.tsx:51–52` | La app ya dice «Aunara» desde `4a17378`. `grep -rn 'Repbook' src --include='*.tsx'` sin identificadores internos → **0** en UI. |
| `incident-response.md:33` «proveedor de hosting» sin nombre; `README.md:49–50` ídem | Pendientes genéricos que hoy tienen nombre: GitHub (Pages) y GoDaddy (dominio/DNS). |
| SDD-002 §8, inventario observado 2026-10-01 | Claves `repbook-*` en `localStorage`, cache `aunara-project-shell-v1`, patrón `sb-<ref>-auth-token`; sin cookies observadas en visita invitada. Es el único inventario de navegador existente; no cubre sesión autenticada. |
| Proveedores reales: Supabase proyecto `Aunara` `ACTIVE_HEALTHY` región `sa-east-1` (conector, 2026-10-12); GitHub Pages con custom domain y Enforce HTTPS (SDD-005 §12); GoDaddy como zona DNS (SDD-005 §2) | El inventario debe nombrar los tres. GoDaddy no recibe datos de la aplicación por diseño; sus logs de resolución DNS no se auditaron y no se afirma nada sobre ellos. |

Búsqueda negativa: `grep -rn -E 'analytics\|gtag\|pixel\|document\.cookie' src public/sw.js index.html` → 0 (ya registrado en SDD-002 §3). No autoriza escribir «sin cookies» como hecho absoluto.

## 4. Diseño

1. **Marca.** Reemplazar «Repbook» por «Aunara» en los cinco documentos. Donde el término nombre identificadores técnicos (`repbook_user_data`, claves `repbook-*`) se conserva literal y se aclara que es nombre interno heredado, no marca visible.
2. **Hosting.** En el inventario, sustituir la viñeta de OpenAI Sites por: «GitHub Pages entrega los archivos estáticos de la aplicación desde el repositorio público `AC-Setroc/aunara`; el sitio es público y no aplica control de acceso. Los datos personales no pasan por GitHub: viajan del navegador a Supabase.» Añadir: «El dominio `aunaratraining.com` está registrado en GoDaddy, que presta solo la zona DNS; la aplicación no le envía datos personales.» No afirmar plazos de logs ni respaldos de GitHub o GoDaddy.
3. **Almacenamiento del navegador.** Añadir al inventario una viñeta con lo observado en SDD-002: claves locales de preferencias/estado, sesión de Supabase y Cache API del service worker; cero cookies observadas en visita invitada; sesión autenticada aún no inventariada. Es descripción, no promesa.
4. **Estado y cambios.** En `README.md`, fecha de estado 2026-10-12 y sección «Cambios desde la versión 1.0» con tres filas: rebrand (2026-08-08, `4a17378`), hosting GitHub Pages (2026-10-01, `fc88568`), dominio `aunaratraining.com` (2026-10-07, `1c709a3`). Cada fila dice qué cambió y que la versión jurídica no se modificó. Cierra con el pendiente: «Decidir, con asesoría jurídica, si estos cambios son materiales en los términos del propio registro (§Responsable) y exigen v1.1 y nueva aceptación. Hasta entonces el texto en la app sigue en v1.0 y la corrección de hosting en pantalla depende de SDD-002.»
5. **Contactos e incidentes.** Nombrar GitHub y GoDaddy donde hoy dice «proveedor de hosting». Nada más cambia en el procedimiento.
6. **Lo que el SDD deja escrito y no resuelve:** la versión legal, la publicación de SDD-002, la revisión jurídica completa y la licencia de Gym Visual. Siguen como pendientes con su redacción actual.

## 5. Alternativas descartadas

- **Hacer el reemplazo de marca con buscar-y-reemplazar global en todo el repo.** Es la obvia y no sirve: tocaría identificadores técnicos (`repbook_user_data`, tipos `RepbookCloudSnapshot`) y rompería datos existentes. El alcance es `docs/compliance/` y solo texto descriptivo.
- **Corregir de paso el «OpenAI Sites» en `LegalPanel.tsx`.** Ya está hecho en SDD-002 y esperando su gate. Duplicarlo crea dos deltas para el mismo hunk en un archivo que hoy está dirty.
- **Subir `LEGAL_VERSION` a 1.1 en este SDD.** Fuerza reconsentimiento a todas las cuentas sin decisión del Operator ni criterio jurídico; SDD-002 ya lo excluyó explícitamente por la misma razón.
- **Declarar «Aunara no usa cookies».** La evidencia es una búsqueda de código y una visita invitada; no cubre sesión autenticada ni infraestructura. Se describe lo observado y su límite.
- **Dejar el registro como está hasta la revisión jurídica.** Mantiene un documento falso en tres hechos mientras hay cuentas reales en UAT. La revisión jurídica necesita un registro que describa el sistema actual como insumo, no al revés.

## 6. Riesgo sobre lo que hoy funciona

| Riesgo | Mitigación y señal de rechazo |
|---|---|
| Reemplazo de marca toca un identificador técnico citado en docs | Los únicos identificadores son `repbook-*`/`repbook_user_data`; se preservan literales y se marcan como heredados. Review: `grep -n 'repbook' docs/compliance` solo en contexto de identificador. |
| Afirmar un hecho sobre GitHub o GoDaddy sin fuente | Solo se escribe lo que SDD-005 y el workflow demuestran: Pages sirve `dist/client/`, dominio con HTTPS, GoDaddy = DNS. Cualquier plazo, región o contrato queda como «no verificado». |
| Documentar el cambio de hosting puede leerse como decisión implícita sobre la versión legal | La sección «Cambios desde la versión 1.0» dice textualmente que la decisión está pendiente y de quién es. |
| Hunks compartidos de SOT (02/PENDIENTES/03) pisan entradas ajenas | Solo hunks propios con etiqueta de origen; diff por archivo contra `dev` antes de commit. |
| Alguien toma el registro actualizado como «cumplimiento resuelto» | `README.md` conserva la frase «No sustituye una revisión jurídica» y la lista de pendientes previos a lanzamiento comercial. |

No toca dinero, arqueo ni aislamiento de datos. No requiere decisión escrita adicional más allá de la aprobación de §9.

## 7. Verificación: criterios falsables, guardas, línea base, contraprueba y guion

### Criterios

| ID | Criterio binario |
|---|---|
| CP-01 | Fuera de la sección «Cambios desde la versión 1.0» del README, `Repbook` aparece 0 veces en `docs/compliance/` (comando de la Enmienda 1). Dentro de esa sección puede aparecer como hecho histórico. Identificadores técnicos en backticks (`repbook-*`) se citan en minúscula con la aclaración «nombre interno heredado». |
| CP-02 | Fuera de la sección «Cambios desde la versión 1.0», `OpenAI` aparece 0 veces (mismo comando). `grep -rn 'GitHub Pages' docs/compliance` devuelve ≥ 2 (inventario y contactos). `grep -rn 'aunaratraining.com' docs/compliance` devuelve ≥ 1. `grep -rn 'GoDaddy' docs/compliance` devuelve ≥ 2 (inventario y contactos). |
| CP-03 | `README.md` de compliance contiene la sección «Cambios desde la versión 1.0» con las tres filas fechadas y SHA, y una línea que dice que la versión jurídica sigue en 1.0 y que la decisión de materialidad está pendiente. |
| CP-04 | La viñeta de hosting del inventario no contiene «controla el acceso» ni ninguna afirmación de plazo, región o respaldo de GitHub/GoDaddy. |
| CP-05 | El inventario describe almacenamiento del navegador con los tres mecanismos (claves locales, sesión Supabase, Cache API) y la frase que limita la evidencia a visita invitada. |
| CP-06 | `git diff dev -- src public .github package.json package-lock.json README.md docs/product docs/architecture docs/methodology` está vacío. `src/components/LegalPanel.tsx` y `src/lib/privacy.ts` conservan hash idéntico a `dev`. |
| CP-07 | Controles (`README.md` §Controles), plazos (`retention-and-rights.md` §Canales) y procedimiento (`incident-response.md` §Respuesta) son textualmente iguales a `dev`, salvo sustitución de marca o nombre de proveedor. |
| CP-08 | Todos los enlaces relativos de `docs/compliance/` resuelven; `git diff --check` limpio. |

### Guardas

No existe lint de documentación en el repo y este SDD no añade código. Las guardas son comandos que Review ejecuta sobre el árbol candidato.

| Guarda | Qué protege | Cómo se rompe a propósito | Qué se ve al romperla |
|---|---|---|---|
| Conteo de `Repbook` fuera de la sección histórica (comando Enmienda 1) | Marca vigente | En copia disposable, reinsertar «Repbook» en `media-rights.md:10` | Conteo pasa de 0 a 1 → CP-01 REJECTED |
| Conteo de `OpenAI` fuera de la sección histórica (mismo comando) | Hosting real | Reinsertar la viñeta original de `data-processing-inventory.md:13` | Conteo 0 → 1 → CP-02 REJECTED |
| `grep -rn 'controla el acceso' docs/compliance` | No prometer control de acceso inexistente | Dejar la frase original | Conteo 1 → CP-04 REJECTED |
| `git diff --stat dev -- src public .github` | Que el SDD no toque la app | Aplicar el hunk de SDD-002 en `LegalPanel.tsx` dentro del candidato | diff no vacío → CP-06 REJECTED |
| `grep -c 'Cambios desde la versión 1.0' docs/compliance/README.md` | Que la decisión pendiente quede escrita | Omitir la sección | 0 → CP-03 REJECTED |

### Línea base

| Métrica | Sin el cambio (`dev` hoy) | Con el cambio (esperado) |
|---|---:|---:|
| `Repbook` fuera de la sección histórica | 11 | 0 |
| `Repbook` total (incluye histórica) | 11 | 1 |
| `Aunara` | 0 | ≥ 8 |
| `OpenAI` fuera de la sección histórica | 1 | 0 |
| `OpenAI` total (incluye histórica) | 1 | 2 |
| `GitHub Pages` | 0 | ≥ 2 |
| `aunaratraining.com` | 0 | ≥ 1 |
| `GoDaddy` | 0 | ≥ 2 |
| Archivos fuera de allowlist en `git diff --name-only dev` | 0 | 0 |

No hay suite de tests afectada: `npm test` debe dar el mismo conteo antes y después (160/18 + Node1 en `dev`); una diferencia indica que se tocó código.

### Contraprueba

- `src/components/LegalPanel.tsx:72–73` en `dev` sigue diciendo «OpenAI Sites». Es esperado: no es alcance de este SDD; lo corrige SDD-002.
- `public/DATASET_NOTICE.md` y la atribución a Gym Visual en el pie de la app no cambian.
- `docs/product/README.md` y `README.md` raíz no cambian.
- `AUNARA_SOT/02-ESTADO-ACTUAL.md`: todas las entradas con etiqueta `[AUNARA/codex …]` quedan byte a byte iguales; solo se agregan hunks `[AUNARA/claude …]` de SDD-010.
- Caso vacío: ningún documento nuevo se crea en `docs/compliance/`; siguen siendo cinco archivos.

### Guion de revisión

Sesión: Review, sobre el árbol candidato en la Mac o en un clon de `dev`.

1. `git diff --name-only dev` → debe listar exactamente: los cinco `docs/compliance/*.md`, `AUNARA_SOT/sdd/SDD-010-compliance-docs-aunara.md` y, si hay hunks propios, `02-ESTADO-ACTUAL.md`, `PENDIENTES.md`, `03-HISTORIA-Y-BACKLOG.md`. **No debe** aparecer nada bajo `src/`, `public/`, `.github/` ni `docs/product/`.
2. Correr las seis líneas de grep de la tabla «Línea base» y comparar con la columna «Con el cambio».
3. Abrir `docs/compliance/README.md` → título «Aunara — registro de privacidad y cumplimiento»; estado fechado 2026-10-12; sección «Cambios desde la versión 1.0» con tres filas; frase de decisión pendiente. **No debe** decir que la versión cambió ni que el cumplimiento está resuelto.
4. Abrir `data-processing-inventory.md` → viñeta de GitHub Pages sin «controla el acceso»; viñeta de GoDaddy limitada a DNS; viñeta de almacenamiento del navegador con la limitación a visita invitada. **No debe** haber plazos de respaldo ni regiones de GitHub/GoDaddy.
5. Abrir `incident-response.md` → contactos mínimos nombran Supabase, GitHub y GoDaddy. Los seis pasos del procedimiento idénticos a `dev`.
6. Navegador, una sola comprobación: `https://aunaratraining.com/` → pie → «Privacidad» → el párrafo de proveedores **sigue diciendo** «OpenAI Sites». Es la prueba de que este SDD no publicó nada en la app. Si dijera «GitHub Pages», alguien publicó SDD-002 fuera de este alcance: registrar, no aprobar por eso.
7. `git diff --check` limpio y enlaces relativos de `docs/compliance/` resueltos.

## 8. Plan de entrega

1. Operator aprueba o ajusta este SDD y las decisiones de §9. Sin aprobación, nada se edita.
2. Un solo agente edita los cinco documentos en un worktree sobre `dev`; sin tocar código ni el dirty de la Mac.
3. Revisor distinto ejecuta §7 completo. Máximo tres ciclos; rechazo persistente vuelve al Operator.
4. Tras APPROVED: hunks propios de SOT, un commit en `dev` con etiqueta de origen. `dev` no publica; `main` sigue intacto.
5. Lo que queda abierto y así se documenta: decisión de versión legal, publicación de SDD-002, revisión jurídica, licencia de medios.

## 9. Decisiones que necesita el Operator

- **D-10-1 — Alcance:** aprobar los cinco archivos y el diseño de §4, con NO-TOCAR de §2. Opciones: aprobar / aprobar sin la viñeta de almacenamiento del navegador / rechazar.
- **D-10-2 — Nombre de marca en el registro:** «Aunara» a secas (como el texto legal en pantalla, `LegalPanel.tsx:51`) o «Aunara — Training Systems» (como el manifest). Recomendación: «Aunara», para coincidir con lo que el titular lee al aceptar.
- **D-10-3 — Responsable y canal:** confirmar que siguen siendo Alejandro Cortés Burgos y `alejandro@ac-setroc.com` (`privacy.ts:6–7`). Si cambió la estructura comercial, es cambio material y este SDD se detiene hasta nueva instrucción.
- **D-10-4 — Versión legal:** confirmar que la decisión de materialidad (v1.0 vs v1.1 con nueva aceptación) queda fuera y se registra como pendiente con dueño «Operator + asesoría jurídica». Opciones: fuera (recomendado) / abrir SDD aparte ahora.
- **D-10-5 — Orden respecto de SDD-002:** este SDD no depende de publicar SDD-002. Confirmar que se puede ejecutar antes. Opciones: independiente (recomendado) / esperar a SDD-002.

### Enmienda 1 — alcance de CP-01/CP-02 · 2026-10-12

`[AUNARA/claude · modelo no expuesto]` — Build detectó una contradicción interna: §4.4 exige una sección «Cambios desde la versión 1.0» que nombre el rebrand y el cambio de hosting, y CP-01/CP-02 exigían cero menciones de `Repbook` y `OpenAI` en todo `docs/compliance/`. Se presentaron dos salidas: (a) acotar los criterios a texto fuera de esa sección; (b) reescribir la sección sin nombres propios. El Operator eligió **(a)**: «Dale con (a).» Las tablas de criterios, guardas y línea base quedan corregidas arriba; los documentos no cambian por esta enmienda. Comando de la guarda: `{ awk '/^## Cambios desde la versión 1.0/{skip=1;next} /^## /{skip=0} !skip' docs/compliance/README.md; cat docs/compliance/data-processing-inventory.md docs/compliance/retention-and-rights.md docs/compliance/media-rights.md docs/compliance/incident-response.md; } | grep -c -E '<patrón>'`. Línea 39 del README («todavía nombra OpenAI Sites») describe estado actual, no historia; se añade al pendiente de SDD-002 la instrucción de actualizarla al publicar.

### Aprobación — 2026-10-12

`[AUNARA/claude · modelo no expuesto]` — El Operator respondió: «3. Por ahora es así. Cuando el correo propio esté activo, se actualiza. El resto aprobado.» Quedan cerradas: D-10-1 aprobar completo; D-10-2 «Aunara»; D-10-3 responsable y canal sin cambio, con actualización diferida al correo del dominio propio; D-10-4 versión legal fuera; D-10-5 independiente de SDD-002.

### Recibo de Build — 2026-10-12

`[AUNARA/claude · modelo no expuesto]` — Worktree `build/sdd-010` sobre `dev` `449ea9a`. Cinco documentos editados, un commit por archivo. Línea base sin cambios: Repbook 11, Aunara 0, OpenAI 1, GitHub Pages 0, `aunaratraining.com` 0, GoDaddy 0, «controla el acceso» 1; `npm test` 160/18 + Node1. Con cambios: ver recibo de verificación en la bitácora de entrega; hashes de `LegalPanel.tsx`, `privacy.ts`, `DATASET_NOTICE.md` y `README.md` raíz iguales a la base. Guardas rotas a propósito en copia disposable y restauradas. Sin push; revisión independiente pendiente.

### Recibo de Review, ciclo 1, y rework — 2026-10-12

`[AUNARA/claude · modelo no expuesto]` — Panel de tres lentes con contexto limpio sobre `813d542`: Correctitud **APRUEBA** (CP-01 a CP-08 con comando literal; paso 6 del guion NO CONCLUYENTE por falta de red al dominio desde el entorno de revisión; proxy: `LegalPanel.tsx` idéntico a `dev` y aún dice «OpenAI Sites»); Regresión **APRUEBA** (suite 160/18 + Node1 igual a la base, NO-TOCAR byte a byte, seis archivos exactos, compromisos intactos salvo marca/proveedor); Seguridad y datos **RECHAZA** por una frase: «ni el texto aceptado por los titulares» era falsa, `4a17378` cambió 18 líneas del aviso en pantalla, y prejuzgaba D-10-4. Rework ciclo 2: la frase pasa a «el texto en pantalla cambió solo en la marca (fila 1) y conserva la versión 1.0»; columna «Fecha» pasa a «Fecha de publicación» (el commit `1c709a3` es del 06, la publicación del 07); contactos de incidentes escriben «GitHub Pages» literal para que CP-02 cuente inventario y contactos; §10 y allowlist del README actualizados. Observación sobre el objetivo, elevada al Operator como posible Enmienda 2: «los datos personales no pasan por GitHub» (§4.2) es impreciso, GitHub recibe IP y agente de usuario del visitante como cualquier servidor web; no se cambia sin aprobación.

## 10. Definición de terminado

**Especificación:** lista cuando refleja estado medido, allowlist, NO-TOCAR, criterios binarios y decisiones cerradas, y queda en revisión del Operator. Aprobada el 2026-10-12; implementación en worktree aislado, ver recibos abajo.

**Entrega documental:** D-10-1 a D-10-5 resueltas; CP-01 a CP-08 verdes con evidencia de Review; guardas rojas al romperlas y verdes restauradas; contraprueba y guion cumplidos; commit en `dev` con hunks propios de SOT.

**Lo que esto no cierra:** la versión del aviso en la app, la publicación de SDD-002, la revisión jurídica colombiana y la licencia de Gym Visual. Ninguno se declara resuelto por tener el registro al día.

Registro de preparación (2026-10-12): lectura de los cinco documentos de compliance, `LegalPanel.tsx`, `privacy.ts`, SDD-002 y SDD-005; conteos con `grep` reproducibles; no se editó ningún archivo fuera de este SDD y los hunks propios de SOT.
