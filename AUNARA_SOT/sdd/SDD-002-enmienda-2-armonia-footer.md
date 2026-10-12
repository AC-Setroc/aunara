# SDD-002 — Enmienda 2: armonía óptica del pie

Versión 0.1 · 2026-10-02 · Estado: **Implementada localmente; cierre bloqueado por evidencia WebKit pendiente**.
Origen: `[AUNARA/codex · GPT-6.1 Sol]`. Complementa [SDD-002](SDD-002-avisos-legales-creditos.md) y su [Enmienda 1](SDD-002-enmienda-1-almacenamiento-y-cierre.md). No cierra sus pendientes.

Aprobación del Operator 2026-10-02: «Aprobado con la primera propuesta de slogan.» Aprueba ambas enmiendas presentadas y el slogan primero del mensaje: ES «Entrená para la vida que querés vivir.» / EN «Train for the life you want to live.». Se activa la allowlist de implementación y hunks documentales de §2; no autoriza push/publicación, cuentas ni correos reales. La exploración anterior se conserva como historia; F3 verifica ahora este par elegido. Frontera inicial de archivos solapados y NO-TOCAR: `/private/tmp/aunara-uat-amendments-boundary.266FLD`.

## 1. Problema y resultado deseado

UAT del Operator del 2026-10-02: «Desarrollado por» y «Entrená para poder» no forman bloques ópticamente alineados/simétricos con sus respectivos logos. Se pide también explorar el slogan, sin seleccionar uno por el Operator.
Resultado: dos bloques de identidad equilibrados, legibles y centrados respecto de la tinta visible de cada marca, tanto en computador como en móvil. Conservar el slogan actual hasta una elección explícita.

## 2. Alcance y NO-TOCAR

Ahora se autoriza **solo crear este documento**. La tabla es la allowlist de una implementación futura, condicionada a aprobación explícita.

| Archivo exacto | Límite de intervención |
|---|---|
| `src/App.tsx` | Exclusivamente markup/clases de `.footer-brand` y `.footer-development-credit`; conservar textos, rutas y alt. Slogan alternativo solo tras elección explícita y registro de su par ES/EN. |
| `src/styles.css` | Solo selectores del pie y sus reglas responsive existentes, incluyendo 1050px/760px. Alineación, separación, ancho y ajuste óptico de los dos bloques; no estilos globales ni otros componentes. |
| `src/components/AppFlows.test.tsx` | Afirmaciones acotadas sobre ambos bloques, copy vigente, assets/base y conservación de acciones legales/atribuciones. No reescribir casos ajenos. |
| `AUNARA_SOT/sdd/SDD-002-enmienda-2-armonia-footer.md` | Aprobación, evidencia y estado de esta enmienda. |
| `AUNARA_SOT/02-ESTADO-ACTUAL.md` | Solo hunk de estado/bloqueo de esta enmienda, sin absorber dirty previo. |
| `AUNARA_SOT/03-HISTORIA-Y-BACKLOG.md` | Una entrada nueva arriba, sin reescribir historia. |
| `AUNARA_SOT/PENDIENTES.md` | Solo ítem de armonía/elección de slogan; mantener abiertos los pendientes globales. |

NO-TOCAR: todos los assets `public/brand/`, especialmente SVG Aunara y PNG AC Setroc: sin recortar, redibujar, reencodear ni modificar bytes; header/marca superior, tokens globales, avisos/StorageNotice, diálogos y copy legal, hook de almacenamiento, auth/cloud, consentimientos, entrenamiento, datos, worker/PWA, guard Pages, config/deps/infra y otros proyectos. Sin URLs/enlaces nuevos. Mantener atribuciones Hasan Emir Yıldırım/MIT/Gym visual y acciones legales intactas. No tocar referencias privadas, secretos ni documentos dirty ajenos (`06-RUNBOOK`, SDD-001, producto). Todo archivo no listado está excluido. La allowlist original no habilita cambios adicionales bajo esta enmienda.

## 3. Estado real de partida

Inspección fresca del 2026-10-02; no es una nueva validación visual ni aceptación de implementación:

- `src/App.tsx:898-910`: pie con bloque Aunara (logo → slogan), acciones legales, crédito (rótulo → PNG) y atribuciones condicionales. ES actual «Entrená para poder.»; EN «Train for what you want to be able to do.».
- `src/styles.css:435-443,1083-1084,1433-1452`: pie flex desktop, block móvil y wrap a 1050px; ambos bloques usan `align-items: flex-start`, logo Aunara 170px y AC Setroc 7rem. El centrado óptico no está implementado en esas reglas.
- `public/brand/aunara-training-systems.svg:1`: canvas 760×178. El canvas no equivale por sí mismo al eje de la tinta; verificar margen interno visible antes de determinar offsets.
- SDD-002 A5 ya protege activo/proporción/base/overflow, pero no exige centrado óptico o armonía entre los bloques. Esta enmienda agrega esos criterios sin sustituir los originales.
- Working tree dirty previo de almacenamiento/acceso/documentación; no existe autorización de commit/publicación ni cierre global de SDD-002/003 por esta propuesta.

## 4. Diseño

Conservar orden semántico y proporciones actuales. Crear dentro de cada bloque un eje local compartido por logo y texto. Los bloques no necesitan tener el mismo ancho, ni deformar sus marcas para aparentarlo. Ajustar únicamente presentación del pie: centrado, separación y ancho de texto; si el logo tiene padding interno asimétrico, corregir ópticamente con wrapper/posicionamiento CSS acotado, sin editar el activo.

Antes de ajustar, medir caja renderizada e identificar el área de tinta visible. Registrar la metodología y el offset efectivo en px por motor/tamaño. Criterio de geometría: diferencia horizontal entre centro de tinta visible y centro del texto ≤2 CSS px, incluidas líneas múltiples. El centrado de la caja `<img>` no constituye evidencia suficiente si hay padding interno. Además, inspección visual de ambos bloques y UAT del Operator: un número PASS no sustituye armonía percibida. No introducir alturas forzadas que corten traducciones.

Computador: ambos bloques equilibrados con separación consistente, sin que acciones legales/atribuciones queden apretadas. Móvil: cada bloque mantiene su eje local y texto legible, con separación clara; no exigir artificialmente la fila desktop. Revisar wrap a 1050 y cambio a block móvil.

### Exploración de slogan — opciones, no decisión

| Opción | ES | EN propuesto |
|---|---|---|
| Vigente | Entrená para poder. | Train for what you want to be able to do. |
| Capacidad cotidiana | Entrená para lo que querés hacer. | Train for what you want to do. |
| Vida cotidiana | Entrená para la vida que querés vivir. | Train for the life you want to live. |
| Posibilidad | Entrená para ampliar tus posibilidades. | Train to expand your possibilities. |

La vigente es breve en ES pero larga en EN; capacidad cotidiana hace más explícito el propósito; vida cotidiana enfatiza el uso fuera del gimnasio; posibilidad es más abstracta. Ninguna alternativa está seleccionada, aprobada o incorporada. El arreglo visual usa copy vigente; elegir una alternativa exige elección explícita del Operator y confirmar ambas traducciones. No hay promesas clínicas/de rendimiento ni rediseño de identidad.

## 5. Alternativas descartadas

No cambiar logos para arreglar layout; no centrar por canvas ignorando tinta; no cambiar header ni otros estilos; no elegir slogan por inferencia; no eliminar crédito/atribuciones o acciones para hacer espacio.

## 6. Riesgos y mitigación

CSS en cascada/responsive puede impactar el pie en otros estados: verificar invitado y autenticado simulado, idioma largo y todos los breakpoints. Padding interno de assets puede falsear el centro: medir tinta y comprobar visualmente. Dirty solapado en App/styles/tests: snapshot de fuente fresca antes de implementar, delta/hunks exactos y revisión independiente; no absorber trabajo previo.

## 7. Criterios falsables y matriz

- **F1:** Ambos bloques cumplen eje de tinta/texto ≤2 CSS px y se inspeccionan visualmente en computador y móvil ES/EN; no basta comparar cajas de imagen. Capturas y medidas muestran logo/texto completos.
- **F2:** 1440×900, 375×812 y 1051/1050/1049×900 (breakpoint intermedio/tablet) no cortan texto, no solapan controles y no tienen overflow horizontal; conservar separación equilibrada y comportamiento de navegación móvil.
- **F3:** Slogan vigente ES/EN permanece byte por byte salvo elección explícita documentada; rótulo «Desarrollado por / Developed by», alt, proporciones, hashes/rutas de activos y ausencia de enlace nuevo permanecen intactos.
- **F4:** Términos/privacidad/cookies siguen abriendo/cerrando con foco correcto; aviso, atribuciones, invitado/login y entrenamiento no cambian. Ningún selector/hunk fuera del pie.
- **F5:** Diff solo allowlist, sin reencode de assets ni absorción de dirty; SDD-002/Enmienda 1 y UAT real global mantienen sus requisitos abiertos.

Revisión independiente fresca: `npm run typecheck`, `npm test`, `npm run test:exercise-directory`, `node --test scripts/check-pages-client.node-test.mjs`, builds raíz y `/aunara/`, guard de artifact y `git diff --check`. Lint N/A porque `package.json` no lo configura; no instalarlo.

UI obligatoria: **Chromium y WebKit** × ES/EN × 1440×900/375×812/1051×900/1050×900/1049×900 × bases `/` y `/aunara/`; capturas sanitizadas de los dos bloques y del pie completo, revisión visual en computador y móvil. Invitado y estado autenticado simulado claramente etiquetado; UAT real pendiente no se sustituye por simulación. Regresiones de diálogos, navegación y acceso cercanos. Registrar errores de consola/red, ejes visibles y overflow. WebKit indisponible bloquea aceptación; Safari real si disponible durante UAT del Operator.

Negativo: en copia aislada restaurar alineación defectuosa y mostrar que la comprobación de ejes rechaza al menos el caso reportado; volver al normal PASS. No modificar fuente viva ni debilitar tolerancia para conseguir verde. Si no reproduce el defecto, revisar método antes de aceptar.

## 8. Entrega y documentación

Gate de aprobación → desarrollo exclusivamente acotado → revisión independiente → entrega; máximo tres iteraciones, regresión bloquea. Futuro permiso documental solo para los hunks de §2, sujeto a aprobación; ahora no se editan los tres documentos generales ni SDD previo. Proponer allí una entrada «armonía del pie en revisión/implementada», decisión de slogan pendiente y evidencia real, sin cerrar auth, inventario autenticado o entrenamiento.
Comparar snapshot/diff inicial/final e índice; stage solo delta revisado. Frontera de commit local de SDD-002/armonía deberá conservar separación respecto de SDD-003 y dirty ajeno; si no puede aislarse, detener entrega. No stage/commit en fase de spec; sin push/deploy.

## 9. Decisiones del Operator

Aprobar/ajustar esta enmienda exacta y los hunks documentales futuros. Elegir, conservar o reformular slogan y confirmar par ES/EN separadamente. Se puede aprobar solo armonía conservando el vigente. No inferir aprobación del copy a partir de aprobación del layout.

## 10. Definición de terminado

Aprobación explícita, F1–F5 y regresiones originales demostrados, matriz fresca completa incluido WebKit y revisión visual computador/móvil, revisión independiente APPROVED, documentación acotada y commit aislado; cierre del Operator. Los pendientes globales originales siguen abiertos hasta su evidencia propia.

Registro inicial de propuesta: solo documento nuevo, sin implementación, ejecución de checks de implementación, stage/commit/push ni publicación. No declaraba arreglo ni verificación visual.

Registro de desarrollo tras aprobación: slogan elegido aplicado; ejes locales del pie corregidos únicamente en CSS, activos sin cambios. Desarrollo declara 238 pruebas Vitest + preparador, tipos, directorio/guardas y builds raíz/Pages PASS. Coordinador inspeccionó capturas ES de computador Chromium y móvil WebKit sin recortes. Recibo local `/private/tmp/aunara-uat-amendments-dev-receipt.md`; revisión independiente aún en curso. No sustituye aceptación del Operator ni pendientes globales; sin commit/push/publicación.

Revisión independiente posterior: REJECTED por matriz obligatoria de acceso WebKit compilado incompleta, no por defecto visual confirmado. Raíz: 40 casos de pie Chromium/WebKit ES/EN y cinco anchos PASS; Pages Chromium diez casos PASS, WebKit primer caso PASS antes del bloqueo de teclado. Negativo de alineación anterior rechazó 20,067px; activos y siete archivos revisados conservan hashes. Checks frescos: 238 Vitest + preparador, tipos, directorio4, guardas4, builds y artifact31 PASS. Recibo `/private/tmp/aunara-uat-amendments-independent-review.md`. Diagnóstico posterior aisló Tab omitiendo todos los botones de WebKit/macOS, mientras Option-Tab alcanza el control; no se cambió app/sistema ni se sustituyó el criterio obligatorio. Sin cierre, commit o publicación; matrices restantes y UAT global abiertos.
