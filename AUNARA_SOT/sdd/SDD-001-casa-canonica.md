# SDD-001 — Casa canónica de Aunara en Personal

**Estado:** Aprobado por el Operator; revisión independiente APPROVED el 2026-10-01\
**Fecha:** 30 de septiembre de 2026\
**Origen:** `[AUNARA/codex · GPT-5]`

**Registro de entrega (2026-10-01):** el texto original se conserva como especificación histórica. La [Enmienda 2](SDD-001-enmienda-2-pages-en-repo.md) sustituye la separación fuente/Pages: repo público existente `AC-Setroc/aunara`, artifact cliente bajo `/aunara/`. El Operator autorizó commit, push y publicación UAT; referencias e inventario quedan locales y excluidos del commit público. Revisión independiente aprobada; deploy, PWA física y UAT autenticado siguen pendientes según [estado](../02-ESTADO-ACTUAL.md).

## 1. El problema, en el idioma del Operator

Aunara ya tiene una carpeta bajo `~/AI Projects/Personal/`, pero allí solo hay
referencias visuales y un PDF. El repositorio real de la aplicación sigue en
`~/Documents/Codex/2026-07-20/i`, fuera de los ambientes definidos por
`~/AI Projects/METODOLOGIA.md`. Por eso hoy Aunara no tiene metodología de
proyecto aplicada de forma completa, no tiene una SOT propia y obliga a recordar
de memoria qué carpeta contiene código, decisiones, referencias y publicación.

El resultado buscado es una sola casa canónica:

`/Users/alejandro/AI Projects/Personal/aunara`

Esa ruta será el mismo repositorio privado `AC-Setroc/aunara-app`, contendrá el
código y la documentación vigente, tendrá `AUNARA_SOT/` como fuente de verdad y
conservará las referencias actuales sin alterar sus bytes. GitHub Pages seguirá
siendo solo la publicación compilada.

## 2. Alcance, fuera de alcance y NO-TOCAR

### Alcance propuesto después de la aprobación

1. Trasladar el working tree completo de `~/Documents/Codex/2026-07-20/i` a la
   ruta canónica, preservando `.git`, rama, remoto, archivos ignorados, cambios
   no confirmados y configuración local.
2. Integrar los siete archivos que ya existen en la nueva carpeta como
   referencias inmutables bajo `AUNARA_SOT/reference/`, con inventario, origen
   conocido cuando exista y SHA-256 antes/después.
3. Crear `AGENTS.md` y `CLAUDE.md` con el puntero oficial a la metodología
   Personal y a `AUNARA_SOT/`; agregar solo reglas particulares de Aunara.
4. Crear la estructura mínima de gobierno:
   `AUNARA_SOT/README.md`, `02-ESTADO-ACTUAL.md`, `PENDIENTES.md`,
   `03-HISTORIA-Y-BACKLOG.md`, `06-RUNBOOK.md`, `sdd/`, `handoffs/` y
   `ordenes/`.
5. Reubicar los SDD de Aunara que hoy viven bajo `docs/sdd/` a
   `AUNARA_SOT/sdd/`, sin cambiar su estado de aprobación ni su contenido
   sustantivo.
6. Mantener `docs/product/`, `docs/methodology/`, `docs/architecture/`,
   `docs/compliance/`, `prototypes/`, código, pruebas y activos del producto en
   el mismo repositorio, enlazados desde la SOT y sin duplicarlos.
7. Actualizar el mapa `~/AI Projects/METODOLOGIA.md` y la sección de adopción de
   `metodologia-personal/README.md` para registrar Aunara únicamente después de
   verificar la migración.
8. Crear un commit local enfocado para la estructura/gobierno. La publicación o
   push requieren aprobación posterior del Operator.
9. Corregir únicamente las rutas documentales que quedarían rotas al mover
   `docs/sdd/` a `AUNARA_SOT/sdd/`: cuatro enlaces desde
   `docs/product/{README.md,2026-08-25-feedback-work-plan.md,2026-09-18-opengym-adoption-review.md,2026-09-26-device-uat-matrix.md}`
   y los enlaces relativos/una mención de ubicación dentro del SDD movido. No
   cambiar copy, decisiones, estado ni contenido metodológico.

### Fuera de alcance

- Implementar producto, motor de sesiones, nutrición, coach, marca blanca o
  cualquier función de OpenGym.
- Resolver o apropiarse de los cambios documentales que ya estaban sin commit.
- Cambiar el contenido de los PDF/PNG, rediseñar marca o decidir cuáles son
  maestros de identidad.
- Limpiar `node_modules`, `dist`, `work`, `outputs` o `.env.local`; se preservan
  durante el traslado y se evalúan en otra orden.
- Modificar Supabase, GitHub Pages, CI, secretos, usuarios o producción.

### NO-TOCAR

- Código, tests, dependencias, lockfiles, configuración y comportamiento de la
  aplicación.
- El contenido y estado de aprobación de los documentos de producto,
  metodología clínica, privacidad y SDD existentes.
- Excepción mecánica aprobable: solo las rutas de enlace enumeradas en el punto
  9 del alcance pueden ajustarse para que sigan resolviendo después del move.
- El remoto `AC-Setroc/aunara-app`, la historia Git y la rama actual
  `codex/aunara-rebrand`.
- El repositorio `AC-Setroc/AC-Setroc.github.io` y el sitio publicado.
- Los bytes de los siete archivos existentes en la carpeta destino.
- `.env.local` y cualquier secreto: se preservan ignorados y nunca se muestran,
  versionan ni copian a documentación.
- Los cambios no confirmados listados en §3: no se resetean, alteran, stagean ni
  mezclan con el commit de esta migración.

## 3. Estado real de partida, medido

### Metodología

- `~/AI Projects/METODOLOGIA.md` §3 dice que la carpeta decide la metodología y
  que, si un proyecto cambia de ambiente, **se mueve la carpeta**.
- `metodologia-personal/README.md` §§0, 2, 4, 6, 8 y 10 exige una sola SOT por
  proyecto, punteros en `AGENTS.md`/`CLAUDE.md`, estado vivo, pendientes,
  bitácora, SDD previo, handoff y verificación real. La metodología está
  actualizada en `50d996c`; `git pull --ff-only` reportó “Already up to date”.
- `ander-tattoo-studio` demuestra el patrón vigente: repo del proyecto bajo
  `Personal/`, SOT propia dentro del repo, README técnico separado, punteros y
  publicación externa.

### Repositorio fuente actual

- Ruta: `/Users/alejandro/Documents/Codex/2026-07-20/i`.
- Remoto: `https://github.com/AC-Setroc/aunara-app.git`.
- HEAD: `d3da8c0`; rama local `codex/aunara-rebrand` siguiendo `origin/main`.
- El working tree ya contiene cambios previos:
  `docs/product/2026-08-25-feedback-work-plan.md`, `docs/product/README.md` y
  cinco documentos nuevos de OpenGym/UAT/SDD. Se preservan como línea base.
- `.gitignore` excluye `node_modules`, `dist`, `work`, `outputs`, `.DS_Store` y
  `*.local`. Existen `.env.local` y directorios ignorados locales; mover el
  working tree completo los conserva sin convertirlos en archivos versionados.
- El repo ya separa fuente privada y publicación mediante
  `docs/architecture/0002-source-and-deployment-repositories.md`.

### Carpeta destino actual

No tiene `.git`, README ni gobierno. Contiene siete archivos:

| Archivo | Tamaño aproximado | SHA-256 / observación |
|---|---:|---|
| `01-familia-responsive.png` | 934 KB | `91fdf600...` |
| `01-familia-responsive (1).png` | 934 KB | `91fdf600...`; duplicado binario confirmado, no se borra en esta migración |
| `01-familia-responsive (2).png` | 1,2 MB | `9413fda0...` |
| `01-ajuste-optico.png` | 742 KB | `bc9c66b2...` |
| `lockup-aunara-coach.png` | 177 KB | `1d75d5fe...` |
| `lockup-aunara-coach (1).png` | 382 KB | `e9eac383...` |
| `Feedback_App_Entrenamiento_Alejandro.pdf` | 18 KB | `e5b975a3...` |

Los cuatro SVG de `public/brand/` son los activos usados por la aplicación y
no coinciden por formato con estas referencias PNG. La migración no declara
ningún PNG como maestro.

## 4. Diseño

### 4.1 Una sola raíz de proyecto y un solo repositorio

```text
~/AI Projects/Personal/aunara/       # repo AC-Setroc/aunara-app
├── AGENTS.md                        # puntero Personal + reglas propias
├── CLAUDE.md                        # mismo puntero
├── README.md                        # documentación técnica existente
├── AUNARA_SOT/
│   ├── README.md                    # índice y autoridad de cada superficie
│   ├── 02-ESTADO-ACTUAL.md          # foto viva y próxima acción
│   ├── PENDIENTES.md                # decisiones, defectos y diferidos
│   ├── 03-HISTORIA-Y-BACKLOG.md     # bitácora, más nuevo arriba
│   ├── 06-RUNBOOK.md                # levantar, verificar y publicar
│   ├── sdd/
│   ├── handoffs/
│   ├── ordenes/
│   └── reference/
│       ├── feedback/
│       └── brand-review/
├── docs/                            # producto, técnica y cumplimiento
├── prototypes/                      # propuestas aisladas
├── src/ · public/ · scripts/ ...    # aplicación
└── .git/
```

Autoridad:

- `AUNARA_SOT/`: estado, decisiones operativas, pendientes, bitácora y SDD.
- `docs/`: especificaciones temáticas vigentes; la SOT las indexa, no copia.
- código/tests/configuración: comportamiento real de la aplicación.
- `public/brand/`: activos que consume el producto.
- `AUNARA_SOT/reference/`: insumos inmutables, nunca fuente automática de UI.
- `AC-Setroc/AC-Setroc.github.io`: solo build publicado.

### 4.2 Migración física reversible

1. Guardar inventario, hashes y `git status` de origen y destino.
2. Renombrar temporalmente la carpeta destino completa a una ruta hermana con
   fecha; no copiar ni borrar originales.
3. Mover el working tree fuente completo a la ruta canónica mediante un único
   rename de directorio cuando el filesystem lo permita.
4. Crear la SOT y mover desde la carpeta temporal los siete originales a sus
   rutas de referencia, conservando nombres y hashes.
5. Incorporar este SDD y, sin cambiar estados, trasladar los SDD existentes a
   `AUNARA_SOT/sdd/`.
6. Crear punteros y documentos mínimos; actualizar enlaces internos afectados.
7. Verificar Git, hashes, enlaces, comandos y superficies antes de retirar la
   carpeta temporal vacía. Si no queda vacía, detenerse y conservarla.

La ruta anterior no se deja como copia ni symlink permanente: hacerlo crearía
dos puertas de entrada y volvería ambiguo cuál carpeta rige la metodología.

## 5. Alternativas descartadas

1. **Casa documental separada y repo fuente en Documents.** Se descarta porque
   la carpeta del código seguiría fuera de Personal y habría dos autoridades.
2. **Segundo repo para gobierno.** Se descarta: fragmenta SOT, commits, acceso y
   handoffs sin una necesidad real.
3. **Copiar o clonar dejando el working tree viejo.** Se descarta porque deja
   dos copias editables y puede perder los cambios no confirmados/ignorados.
4. **Symlink permanente.** Se descarta como destino final; oculta en vez de
   resolver la ubicación canónica y ya existe una lección documentada sobre
   handoffs apuntando a copias incorrectas.
5. **Borrar duplicados por nombre o hash durante la migración.** Se difiere: el
   objetivo es preservar y clasificar, no depurar insumos.

## 6. Riesgos sobre lo que hoy funciona

| Riesgo | Mitigación / señal de detención |
|---|---|
| Pérdida de cambios sin commit | Mover el working tree entero; comparar status/diff antes y después |
| Secreto expuesto | Confirmar ignore de `.env.local`; nunca leer contenido ni agregarlo a Git |
| Dos fuentes de verdad | No copiar/clonar ni dejar symlink/copia permanente; README y SOT nombran una sola ruta |
| Pérdida de referencias | Hash e inventario pre/post; si difiere, detener y conservar ambas rutas |
| Enlaces absolutos rotos | Buscar la ruta antigua en archivos versionados y corregir solo referencias de documentación aprobadas |
| Publicación accidental | No tocar Pages ni hacer push; migración local primero |
| Mezcla del diff previo | Stage por rutas exactas; revisión independiente compara baseline y diff |
| SDD anterior presentado como aprobado | Conservar literalmente su estado pendiente |

## 7. Verificación y criterios de aceptación falsables

| ID | Criterio |
|---|---|
| A1 | `git -C ~/AI\ Projects/Personal/aunara remote -v`, HEAD, rama y log coinciden con la línea base |
| A2 | `git status --porcelain` y el diff previo coinciden antes/después, salvo rutas de gobierno/migración aprobadas |
| A3 | Los siete originales existen una vez en el inventario canónico y conservan SHA-256; nada se perdió o sobrescribió |
| A4 | `.env.local`, `node_modules`, `dist`, `work` y `outputs` siguen ignorados y no aparecen en `git ls-files` |
| A5 | `AGENTS.md` y `CLAUDE.md` abren con `SOT-POINTER v2` y enlazan metodología + `AUNARA_SOT/` sin copiar reglas globales |
| A6 | SOT contiene índice, estado, pendientes, bitácora y runbook; cada documento distingue verificado, pendiente y propuesta |
| A7 | Producto, metodología clínica, compliance, prototipos y código conservan una única copia editable dentro del repo |
| A8 | `docs/sdd/` ya no compite con `AUNARA_SOT/sdd/`; estados y contenido sustantivo se conservan |
| A8b | Los cuatro enlaces de `docs/product/` y los enlaces internos del SDD trasladado resuelven a archivos existentes; el diff de esas líneas cambia solo rutas |
| A9 | README/SOT explican fuente privada, Pages de despliegue y URL pública sin presentarlas como el mismo repo |
| A10 | `npm run typecheck`, pruebas con concurrencia compatible, `npm run build` y smoke web/iPhone/Android siguen pasando |
| A11 | La ruta antigua no conserva una copia del repo; cualquier staging temporal queda vacío o documentado como bloqueo |
| A12 | `git diff --check` pasa y la revisión independiente no encuentra archivos fuera del scope/NO-TOCAR |

Pruebas negativas obligatorias:

- comprobar que forzar `git add -f .env.local` sería necesario para versionarlo;
  no ejecutar el add;
- buscar la ruta antigua en documentos y confirmar que ninguna instrucción de
  arranque/handoff apunte a ella;
- comparar el inventario contra una lista con un archivo omitido y confirmar
  que la guarda de conteo/hash falla;
- confirmar que Pages no recibió commit, push ni cambio de árbol.

## 8. Plan de entrega y reversa

1. Aprobación explícita de este SDD y de versionar los siete archivos dentro del
   repo privado como referencias.
2. Agente de desarrollo ejecuta solo la migración y gobierno descritos.
3. Agente independiente revisa inventario, NO-TOCAR, Git, docs, comandos y smoke.
4. Si aprueba, agente de entrega actualiza estado/pendientes/bitácora/handoff y
   crea un commit local solo con rutas aprobadas.
5. El Operator verifica desde la ruta nueva. Push del repo de app y cualquier
   actualización del repo de metodología requieren su visto bueno explícito.

Reversa: conservar el mapeo origen→destino y la carpeta temporal hasta concluir
la revisión. Ante fallo, devolver el working tree completo a la ruta anterior y
los siete originales a la carpeta `aunara/`, solo si los destinos están libres;
nunca sobrescribir. Para archivos nuevos versionados, usar commit inverso, no
`reset --hard`. Si aparece una discrepancia, conservar ambas rutas y detenerse.

## 9. Decisiones que necesita el Operator

1. Aprobar que `~/AI Projects/Personal/aunara` sea **la raíz del mismo repo**
   privado `AC-Setroc/aunara-app`, no un segundo repo documental.
2. Aprobar que los siete archivos existentes se versionen en ese repo privado
   como referencias inmutables; los dos PNG idénticos se conservan por ahora.
3. Aprobar que `docs/sdd/` se integre en `AUNARA_SOT/sdd/` y que los demás
   `docs/*` permanezcan donde están, indexados desde la SOT.
4. Autorizar solo la migración local y el commit local. Push/publicación quedan
   para una confirmación posterior.
5. Aprobar la enmienda mecánica del 30-09-2026: ajustar exclusivamente los
   enlaces enumerados en §2.9 para evitar documentación rota al reubicar SDD.

## 10. Definición de terminado

- Hay una única raíz canónica de Aunara bajo Personal y es el repo fuente real.
- La estructura cumple la metodología Personal sin copiarla.
- SOT, README técnico, docs, referencias y Pages tienen autoridades distintas y
  explícitas.
- No se perdió ningún archivo, cambio previo, secreto, historial Git o activo.
- Aplicación y publicación conservan su comportamiento verificado.
- Revisión independiente aprobó todos los criterios y existe un commit local
  enfocado; nada fue pusheado ni desplegado.
