# SDD-013 — Menú lateral, identidad móvil y detalles de consentimiento/footer

2026-10-13 · v0.1 · Estado: **En revisión del Operator; NO IMPLEMENTAR**.
Origen: `[AUNARA/codex · modelo no expuesto]`. Base técnica: `dev` `41fa9d9`; inspección del worktree aislado `/private/tmp/aunara-uat-20261013-dev` en `de6f165` (diferencias contra base exclusivamente documentales). Regla: Operator SDD Workflow y metodología Personal, máximo tres ciclos, revisión independiente fresca antes de entrega.

## 1. El problema, en el idioma del Operator

El menú vigente funciona técnicamente, pero el Operator rechaza la tarjeta flotante centrada. La cabecera móvil muestra únicamente el símbolo, sin el nombre Aunara. El consentimiento opcional conserva un recuadro que pidió retirar; slogan y crédito deben conservar una alineación óptica cuidada.

El Operator autorizó la maqueta separada y eligió **A, panel lateral**. Esa elección aprueba la dirección visual, no este alcance ni su implementación. Referencia portable: [maqueta `menu-cabecera-v1.html`](2026-10-13-sdd013-propuesta/menu-cabecera-v1.html) y [límites de la referencia](2026-10-13-sdd013-propuesta/README.md). No copiar su aplicación ficticia, scripts, CTA ni copy demostrativo.

## 2. Alcance y fuera de alcance

Allowlist de implementación futura, exclusivamente presentación e interacción accesible de las superficies nombradas:

| Archivo exacto | Frontera permitida |
|---|---|
| `src/components/NavigationMenu.tsx` | Drawer A, agrupación visual de destinos sin cambiar etiquetas/callbacks/condiciones, marca completa, cierre y foco/teclado incluyendo selector. Conservar portal al body. |
| `src/App.tsx` | Solo markup de cabecera/composición de `NavigationMenu`, lista de destinos y control de idioma de `:662–718`; footer común `:938–950` únicamente si requiere wrapper óptico. Trasladar accesos según D-13-2 sin cambiar handlers, props/callbacks, condiciones funcionales ni datos. |
| `src/components/AccessPanel.tsx` | Solo markup/clases de presentación del bloque `:419–459` si CSS no basta; sin cambiar campos, textos legales, estado ni payload. |
| `src/styles.css` | Solo selectores de cabecera/marca, navegación, consentimiento en crear cuenta y footer; separar navegación de reglas compartidas con eliminación de cuenta. No retocar tokens globales ni superficies vecinas. |
| `src/components/NavigationMenu.test.tsx` | Cobertura aditiva de drawer, marca, teclado, selector, cierres y foco. |
| `src/components/GuestApp.test.tsx` | Composición pública, selector y destinos conservados; ajustar estructura solo a decisión aprobada de §9. |
| `src/components/AppFlows.test.tsx` | Navegación autenticada, idioma y footer/atribuciones, manteniendo cobertura previa. |
| `src/components/AccessPanel.test.tsx` | Presentación opcional y regresión de consentimientos/aceptación obligatoria, sin debilitar pruebas. |
| `AUNARA_SOT/sdd/2026-10-13-sdd013-revision/harness/sdd013-checks.mjs` | Harness nuevo compilado, mediciones geométricas, contraste, teclado y negativos; resultados sanitizados en la misma carpeta de revisión. No sobrescribir evidencia histórica. |

Documentación de entrega futura: este SDD, `02-ESTADO-ACTUAL.md`, `PENDIENTES.md`, entrada aditiva de `03-HISTORIA-Y-BACKLOG.md`, seguimiento UAT y recibo nuevo de revisión. En fase actual solo se redacta y registra documentación mediante commit local; no hay permiso para implementación, commit de código, push ni publicación.

### NO-TOCAR

Hooks/cliente Auth, recuperación y SMTP; `useCloudSync.ts`, snapshots, sync, bootstrap, almacenamiento, export, datos/contratos, estado y finalidades de consentimiento; `privacy.ts`, `LegalPanel.tsx`, `ConsentGate.tsx`, textos legales; perfil/preferencias, editor, rutas de entrenamiento, onboarding, propuesta/hero/CTA; `sw.js`, workflows, dependencias/configuración, Supabase/DNS/infra, main y producción. Preservar bytes de todos los activos de `public/brand/`; no usar `AUNARA_SOT/reference/`, agregar paquetes/activos de iconos ni recrear marcas. Se permite reutilizar iconos del paquete Lucide ya instalado dentro de las superficies aprobadas. No nuevas frases de bienvenida, slogans o tono de producto desde la maqueta.

## 3. Estado real de partida, medido y no supuesto

- `NavigationMenu.tsx:48–59`: portal al body y panel con `role="dialog"`/`aria-modal`; `styles.css:85–86`: fondo centrado y tarjeta hasta420px con padding16px. Es el diseño rechazado, no un fallo nuevo de descarga ni geometría demostrado.
- `NavigationMenu.tsx:20–40`: cierre restaura foco, Escape y bloqueo/restauración de scroll; trampa Tab enumera únicamente botones (`:32`), aunque `App.tsx:709–717` añade un select. La nueva trampa debe incluirlo explícitamente.
- `styles.css:85–86` comparte selectores con `.account-deletion-backdrop`: riesgo de daño colateral localizado. `:74` conserva backdrop-filter en header; volver a anidar el drawer en header reintroduciría la causa de SDD-012.
- `NavigationMenu.tsx:62–63` ya contiene lockup y símbolo; `styles.css:1635–1636` oculta el primero y muestra el segundo a≤760px. Lockup actual190px (`:1196`),160px a≤1050 (`:1629`).
- `App.tsx:663–671`: destinos reales Inicio/rutas; biblioteca y perfil según `canUseTraining`; cuenta/privacidad o ingresar/crear cuenta; ayuda/instalación según estado de instalación; Salir con sesión. Conservar esas condiciones, textos ES/EN y acciones. `:675–705` conserva controles de cabecera autenticada/pública.
- `AccessPanel.tsx:419–459`: aceptación legal obligatoria, autorización de salud separada y opcional y nota común. No hay borde propio del label opcional: `.legal-consents` en `styles.css:901` define el recuadro compartido; `:1559–1567` añade fondo/radio; `:1481–1482` alinea check y texto.
- `App.tsx:938–950`: footer común, slogans vigentes ES/EN, acciones legales, crédito y atribuciones condicionales. `styles.css:1471–1479` documenta offsets de tinta; el centrado de canvas no prueba alineación óptica. `AppFlows.test.tsx:356–369` protege marca, crédito y atribuciones, no demuestra armonía visual.
- Activos existentes: lockup `aunara-training-systems.svg`760×178, símbolos normal/reverse294×183, app-icon1024×1024, `ac-setroc-wordmark.png`2464×671. Todos se reutilizan sin editar bytes ni proporciones; src conserva BASE_URL.
- Evidencia histórica SDD-012 permanece válida en su alcance técnico. Sus pruebas no son aceptación de la dirección A ni cierre de UAT humana.

## 4. Diseño

**A — panel desde el borde derecho.** Desktop: drawer370 CSSpx, pegado a right/top/bottom del viewport, altura100dvh, superficie sólida y separador izquierdo discreto; sin tarjeta central ni margen exterior. Móvil≤760px: ancho completo del viewport y altura100dvh, no tarjeta flotante. Mantener backdrop/portal, scroll interior si falta altura, cierre visible y accesible. Transiciones breves solo si no alteran acciones; `prefers-reduced-motion` sin movimiento. El drawer sigue siendo modal en semántica accesible mientras bloquea el fondo: «no modal centrado» describe geometría, no autoriza quitar `aria-modal`.

**Contenido.** Encabezado del drawer con lockup existente y cierre; filas de destinos sin cajitas individuales repetidas, grupos/separadores visuales compatibles con A. Preservar íntegramente labels, callbacks y condiciones actuales, incluso «Perfil»/«Salir» frente a textos ficticios de la maqueta. Idioma en grupo de configuración, select real compacto con opciones ES/EN, etiqueta accesible localizada; no reemplazarlo por botones demostrativos ni duplicar estado. Cambiar idioma deja abierto el menú. No añadir bienvenida ni slogans al drawer.

**Cabecera.** Lockup completo siempre visible:194px desktop,168px a≤760px, proporción original y sin símbolo sustituto. Propuesta por aprobar D-13-2: barra pública y autenticada solo con logo a izquierda y hamburguesa a derecha, ambos abren el mismo menú; hit area de hamburguesa≥44×44px, logo≥44px de alto. Accesos duplicados viven en menú, sin pérdida funcional: conservar destinos existentes y añadir acceso a Entrenamiento de hoy con el handler exacto de `App.tsx:693–696` (`setWorkoutPanelMode("view"); setWorkoutOpen(true)`), bajo la condición actual `hasAppAccess && !onboardingRequired`. Conservar su etiqueta vigente `activeTrack?.name`/traducción y conteo actual. Acceso Cuenta/sincronización conserva `openAccess("create")` de `:677`, diferenciado de Cuenta/privacidad `openAccess("sign-in")`; no intercambiar callbacks. El estado de sync sigue visible en panel de cuenta existente, sin modificar hooks. Inicio público `href="#top"` conserva su acción de ancla en menú si se retira de barra. No duplicar ni eliminar acceso a perfil/biblioteca/home que ya tienen destino equivalente; cuando condiciones de barra y menú difieren, preservar ambas vías de acceso: perfil y secciones de barra usan `hasAppAccess && !onboardingRequired`, no sustituirlas por `canUseTraining` (que incluye consentimiento). No alterar ninguno de esos gates ni el gate de entrenamiento. No ocultar controles unilateralmente antes de aprobar D-13-2.

**Foco y scroll.** Al abrir, foco en cierre; Tab/Shift+Tab recorren todos los elementos visibles, habilitados y enfocables, incluido select, sin escapar al fondo. Escape, cierre y click exterior cierran; selección de destino cierra y ejecuta exactamente una vez la acción existente; retorno al trigger que abrió, antes de entregar foco al panel destino cuando corresponda. Guardar/restaurar overflow previo también al desmontar. No impedir scroll del drawer ni crear handlers globales persistentes al cerrar.

**Opcional.** Retirar el recuadro interno del bloque de consentimientos en crear cuenta (borde/fondo/radio de ese wrapper), no del panel completo. La aceptación obligatoria y la nota siguen en su lugar, sin cambios de copy, asociación, validación o estado. Texto opcional teal existente `--teal-800`, sin aclararlo con opacity; check y texto asociados y alineados al comienzo. Contraste≥4.5:1 sobre su fondo efectivo, estados normal/hover/focus incluidos. No tocar `.legal-consents` fuera de esta superficie.

**Footer.** Logo Aunara sobre slogan, eje óptico local compartido; crédito «Desarrollado por»/«Developed by» y AC Setroc lado a lado y verticalmente centrados. Centro de tinta visible Aunara frente a centro del slogan≤2 CSSpx; centro de tinta visible AC Setroc frente a centro vertical del rótulo≤2 CSSpx; conjunto de crédito centrado en footer≤2px. Medir tinta del activo, no únicamente caja img; registrar bounds y offsets utilizados. Mantener proporciones y todo texto/enlace/atribución, sin forzar alturas que corten EN ni permitir overflow móvil.

## 5. Alternativas descartadas

Dirección B no elegida; no conservar tarjeta modal centrada; no ocultar wordmark móvil; no recrear logos ni deformarlos; no quitar backdrop-filter de cabecera para evitar el portal; no cambiar Auth para resolver un defecto visual; no incorporar hero/CTA/copy de bienvenida de maqueta; no eliminar acciones o pruebas para hacer espacio. Select compacto real conserva contrato de idioma, frente a ES/EN ficticio de demostración.

## 6. Riesgo sobre lo que hoy funciona

1. **Ancho móvil y controles autenticados.** El lockup168px compite con controles existentes. Medir320/390 y ES/EN; resolver composición solo con decisión explícita §9, no ocultar acciones por CSS de manera incidental.
2. **Modalidad accesible y selector.** Layout lateral no elimina obligaciones de foco/teclado/scroll. Pruebas compiladas bidireccionales, selector incluido, cierre por todas las vías y desmontaje; perfil/cuenta/legal continúan operativos al salir del menú.
3. **CSS compartido y consentimientos.** Cambios globales pueden alterar eliminación de cuenta o aceptación obligatoria. Aislar selectores, comparar modal de eliminación con baseline en ambos motores, conservar pruebas de aceptación/payload y negativos del recuadro/contraste.

## 7. Verificación: criterios falsables y matriz

| ID | Criterio binario |
|---|---|
| S13-01 | En1440 drawer ancho370±1px, x=viewportWidth−370±1, y=0±1, bottom=innerHeight±1; en390/320 x=0±1 y ancho=viewportWidth±1, altura viewport±1. Sin tarjeta central/margen exterior; overflow horizontal≤1px. Portal fuera de header y contenido scrollable al reducir altura. |
| S13-02 | Cabecera muestra lockup194±1px en1440 y168±1 en390/320, símbolo sustituto no visible, marca sin corte; logo menor x y hamburguesa mayor x, área hamburguesa≥44×44. No superposición de cajas/hit areas ni pérdida de controles aprobados en §9. |
| S13-03 | Invitado/sesión, instalado/no instalado y acceso habilitado/bloqueado conservan conjuntos de destinos de baseline y, si se aprueba D-13-2, accesos trasladados de barra con labels/acciones/condiciones originales. Entrenamiento abre vista vigente una vez; Cuenta/sincronización mantiene modo create y Cuenta/privacidad modo sign-in, sin perder indicador en cuenta; Inicio público conserva ancla. Logo/hamburguesa acceden a la misma lista; selector ES/EN cambia idioma una vez sin cerrar, sigue localizado y accesible. Ningún copy/CTA/hero inventado aparece. |
| S13-04 | Apertura enfoca cierre; Tab y Shift+Tab contienen foco incluyendo select y destinos; Escape, cierre y backdrop restauran trigger. Cada destino ejecuta su callback una vez. Scroll fondo bloqueado solo abierto; overflow previo y listeners restaurados tras cierre/desmontaje. Reduced motion sin transición de movimiento. |
| S13-05 | Bloque interno de consentimiento no tiene borde/fondo/radio de tarjeta; texto opcional teal y contraste≥4.5:1. Check asociado y separado del obligatorio; opcional inicialmente false/no required, se puede crear sin autorizar salud, no se puede crear sin aceptación legal; payload conserva ambos flags. Textos y enlaces legales idénticos a baseline. |
| S13-06 | Footer cumple medidas ópticas de §4 y revisión visual completa ES/EN; crédito horizontal sin cortes. Logos src/aspect ratio/bytes idénticos; slogan, tres acciones legales y atribuciones condicionales conservados; estados hover/focus contraste≥4.5:1 y overflow≤1px. |
| S13-07 | Modal eliminación de cuenta conserva baseline de geometría/estilos/acciones; cuenta, perfil/logout, legales, entrenamiento/flotante y consentimiento conservan regresiones del ciclo2. Cero archivos/hunks fuera de allowlist/NO-TOCAR. |
| S13-08 | Typecheck, suite completa, directorio, guards y builds raíz/rollback verdes; matriz compilada completa en Chromium y WebKit; negativos N1–N4 rojos y controles restaurados verdes. Ningún PASS global con casilleros no ejecutados. |

Matriz obligatoria sobre build del candidato: Chromium y WebKit × ES/EN ×1440/390/320 ×invitado/sesión ×base`/` y`/aunara/`, con apertura por ambos triggers. Añadir estado sin entrenamiento habilitado y ayuda ya instalada para conjuntos de destinos. Alturas900desktop/844móvil y viewport corto400px para scroll/cierre. No usar cuentas reales ni datos personales; fixtures sintéticos, requests Auth mockeados, sin envío de correo.

- Unitarios por criterio y suite completa (`npm test`), `npm run typecheck`, check/test de directorio y guards existentes de artifact cliente/service-worker; `git diff --check`. No hay script lint en package.json: registrar N/A, no instalar linter.
- Builds con base raíz y `/aunara/`; guard sobre cada artifact y carga correcta de marcas/recursos. No cambiar allowlist de assets para justificar este trabajo: no añade activos de producto.
- Harness nuevo: geometría, visibilidad/hit areas, estilos/contraste, foco incluyendo select, callbacks/conjuntos, scroll y footer. Revisor independiente inspecciona capturas finales de todas las combinaciones de idioma/tamaño/estado además de las cifras.
- Regresiones compiladas del ciclo2: storage/startup/Auth/privacidad/navegación-modal-legal/geometría, ambas bases/motores. Si estructuras cambian, adaptar solo harness nuevo/adaptador en carpeta SDD013; evidencia histórica queda intacta, no suprimir criterios funcionales vigentes.
- Negativos en copia disposable, uno por vez: **N1** restaurar centrado de tarjeta/símbolo móvil ⇒ S13-01/02 rojo; **N2** quitar select del ciclo de foco ⇒ S13-04 rojo; **N3** restaurar borde interno o texto sin contraste ⇒ S13-05 rojo; **N4** aplicar estilo drawer al modal eliminación ⇒ S13-07 rojo. Restaurar exactamente y repetir control verde de cada guard. No modificar fuente entregable para conservar negativos.
- Safari físico/iPhone y correo real no acreditados por Playwright WebKit. UAT iPhone diferida por orden del Operator hasta terminar correcciones; registrar pendiente, no declararla cerrada.

## 8. Plan de entrega

1. Operator resuelve §9 y aprueba explícitamente versión del SDD. Sin aprobación no hay desarrollo.
2. Agente de desarrollo en candidato aislado desde base técnica aprobada; TDD y diff mínimo según allowlist, sin commit/push. Congelar manifest del candidato para revisión.
3. Agente independiente distinto del implementador revisa conjunto, NO-TOCAR, matriz completa y negativos. REJECTED devuelve defectos acotados a desarrollo; máximo tres ciclos totales, revisión fresca tras cada corrección. Fuera de alcance o tope alcanzado: detener y volver al Operator, no autoampliar.
4. Tras APPROVED independiente, entrega documental y único commit local enfocado con recibo/evidencias sanitizadas. Comprobar qué documentos vigentes quedaron superados sin reescribir historia. No absorber cambios documentales concurrentes ajenos al commit aprobado.
5. Reportar resultado, SHA local, checks, NO-TOCAR y pendientes. Ningún merge/push/deploy/producción sin orden expresa posterior. El Operator hace UAT y cierra.

## 9. Decisiones, supuestos y pendientes del Operator

- **D-13-1 — A elegida, alcance aún no aprobado.** Se toma únicamente dirección drawer/identidad/opcional/footer. Aprobar este SDD no cierra SDD-012 UAT ni autoriza publicación.
- **D-13-2 — Barra simple, propuesta explícita por aprobar junto al SDD.** Recomendada: pública y autenticada solo marca + hamburguesa como A; accesos actuales trasladados a menú según §4, conservando todos los handlers, destinos, etiquetas y condiciones, incluido entrenamiento. Estado sync permanece en panel de cuenta existente. La elección A NO autoriza por sí sola este traslado ni una retirada funcional. Alternativa: conservar todos los controles de barra y revisar composición responsive antes de implementar. El Operator debe elegir/confirmar expresamente; silencio no aprueba ninguna opción. Si elige conservarlos, revisar este SDD y sus criterios antes del gate de desarrollo.
- **D-13-3 — Opcional sin recuadro.** Retirar envoltorio interno compartido visualmente, no checkbox, panel ni aceptación obligatoria; mantener íntegro copy legal y usar teal existente accesible. Esta delimitación debe quedar aprobada con el SDD.
- **D-13-4 — Recuperación LAN→producción.** Pendiente diagnóstico separado: Operator confirma solicitud desde dev en iPhone y llegada a producción; causa raíz no demostrada. `useCloudSync.ts:478` solicita destino derivado de BASE_URL/origin, no demuestra request real ni configuración efectiva. No parche Auth/SMTP/infra bajo SDD013.
- **D-13-5 — UAT iPhone diferida.** Retomar solo al concluir correcciones por pedido del Operator. No usar UAT diferida para omitir Chromium/WebKit técnicos ni declararla PASS.

## 10. Definición de terminado

D-13-2 resuelta, SDD explícitamente aprobado, S13-01…08 verdes con revisión independiente y evidencia reproducible, NO-TOCAR intacto, documentación de entrega al día y un commit local acotado. Aceptación humana/UAT iPhone y recuperación siguen pendientes hasta evidencia y cierre del Operator. Estado actual: **solo especificación; sin implementación ni aprobación técnica/humana del candidato**.
