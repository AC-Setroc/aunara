# SDD-012 — UAT13: menú de navegación, cabecera, perfil y reenvío de confirmación

2026-10-13 · v0.1 · Estado: **especificado por orden del Operator («reproducí 22 y 17 y corregí lo que se debe corregir» + tres pedidos sobre el menú); Build en candidato aislado**.
Origen: `[AUNARA/claude · modelo no expuesto]`. Base: `dev` `bfb97a1` (SDD-006 + SDD-011 integrados). Insumos: [resultados UAT13 del Operator](../handoffs/UAT-2026-10-13-resultados-operator.md) y [reproducciones sobre `dev`](2026-10-13-uat13-reproducciones/README.md).

## 1. El problema, en el idioma del Operator

1. **El menú está roto.** Al tocar el logo o la hamburguesa, el panel aparece como una tira de cajitas en una fila con scroll horizontal, recortado dentro de la barra superior (captura del Operator; reproducido en `dev` a 1440 y 390). Dos causas en CSS: la barra tiene `backdrop-filter`, que según la especificación de CSS convierte a ese elemento en el contenedor de todo `position: fixed` descendiente, así que el fondo del menú queda atrapado dentro de los 78 px de la barra; y la regla `.site-header nav { display: flex }` pisa el `display: grid` del panel porque tiene la misma especificidad y está después en el archivo.
2. **La cabecera está cargada.** El Operator pide: hamburguesa a la derecha; el selector de idioma y el botón Ingresar/registrar dentro del menú, no en la barra.
3. **«Salir» solo está en el menú.** Debe estar también en el perfil.
4. **UAT13-22, perfil que «vuelve a principiante».** Hay dos controles «Experiencia entrenando»: uno en Resumen (borrador que solo persiste al pulsar «Guardar preferencias de entrenamiento») y otro en Cuerpo y salud (persiste al instante). Cambiar en uno no se refleja en el otro, y «Listo» con cambios sin guardar los descarta. Reproducido paso a paso.
5. **UAT13-06, reenviar confirmación invisible.** Texto blanco sobre fondo blanco hasta el hover. Preexistente en `main` desde julio.
6. **UAT13-17** queda **fuera**: el flujo de agregar por día existe (selector de día del armador) y funciona; lo pedido es un acceso desde el recuadro de cada día, que es diseño nuevo (D-12-2).

## 2. Alcance, allowlist y NO-TOCAR

| Archivo exacto | Cambio permitido |
|---|---|
| `src/components/NavigationMenu.tsx` | Renderizar el fondo y el panel fuera de la cabecera (portal al `body`); hamburguesa como último control de la barra; contenido adicional dentro del panel: selector de idioma y entrada de cuenta, recibidos por props. Foco, Escape, trampa de Tab y `aria-*` se conservan. |
| `src/App.tsx` | Cabecera: quitar `.language-select` y `.guest-account-button` de la barra y pasarlos al menú; hamburguesa al extremo derecho; pasar `onSignOut` al perfil. Sin cambios de secciones, datos ni sync. |
| `src/components/ProfilePanel.tsx` | Un solo control de experiencia y una sola semántica de guardado para las preferencias (ver §4); botón «Salir» cuando hay sesión. |
| `src/styles.css` | Panel del menú: `display: grid` con especificidad suficiente; posición de la hamburguesa; color de texto de `.account-verification .verification-resend`. |
| Tests | `NavigationMenu.test.tsx`, `AppFlows.test.tsx`, `GuestApp.test.tsx`, `ProfilePanel.test.tsx`, `AccessPanel.test.tsx` (aditivos o ajustados a la nueva estructura, nunca eliminando cobertura). |

### NO-TOCAR

`useCloudSync.ts`, `cloudSnapshot.ts`, `privacy.ts`, `LegalPanel.tsx`, textos legales, `WorkoutPanel.tsx`/`TrainingTracks.tsx` (UAT13-17 es D-12-2), onboarding, propuesta inicial (UAT13-08/09/10/11 son otra entrega), `sw.js`, workflows, dependencias, Supabase.

## 3. Estado de partida, medido

- Menú: `#aunara-navigation` a 1440: `{x: 510, y: -52, w: 420, h: 186}`, `nav` computado `display: flex; flex-direction: row`, `scrollWidth 621 > clientWidth 372`; a 390: `{x: 16, y: -53}`. Capturas `2026-10-13-uat13-reproducciones/uat13-menu-*.png` coinciden con la del Operator. Causas: `styles.css:65–78` (`backdrop-filter` + `position: sticky`) y `styles.css:113` vs `:86`.
- Cabecera actual: logo + hamburguesa a la **izquierda** (`.shared-navigation`), luego `nav` con Sincronizado/Cuenta, Mi perfil, Inicio/Ejercicios, selector de idioma y Entrenamiento de hoy (sesión), o Inicio, idioma e Ingresar (invitado). `App.tsx:662–725`.
- Perfil: `ProfilePanel.tsx:81` borrador `preferences`; `:217` control de experiencia en Resumen; `:310` segundo control en Cuerpo y salud con `updateHealth` inmediato; `:706` «Listo» = `onClose` sin aplicar borrador. Medición: `inicial beginner → cambiar en Resumen: pantalla intermediate, guardado beginner → Cuerpo y salud muestra beginner → volver: Resumen intermediate (borrador) → Guardar: guardado intermediate → cambiar en Cuerpo a advanced: guardado advanced, Resumen sigue intermediate → cambiar en Resumen y Listo: se pierde`.
- Reenviar: `.account-verification .verification-resend` color `rgb(255,255,255)` sobre `rgb(255,255,255)`; `styles.css:868`, presente en `main:851`.
- Salir: solo como entrada del menú (`App.tsx:672`); `ProfilePanel` no recibe `onSignOut`.

## 4. Diseño

1. **Menú (defecto).** `NavigationMenu` monta el fondo y el panel con `createPortal(…, document.body)`: queda fuera del contenedor con `backdrop-filter` y fuera del alcance de `.site-header nav`. Además `.navigation-panel nav` se declara con especificidad que no dependa del orden (`.navigation-backdrop .navigation-panel nav`). Comportamiento de teclado y foco idéntico; los tests existentes siguen válidos porque consultan por rol.
2. **Cabecera.** Orden en la barra: logo (izquierda, sigue abriendo el menú) · controles de la sección (Sincronizado/Cuenta, Mi perfil, Inicio/Ejercicios, Entrenamiento de hoy en sesión; Inicio en invitado) · **hamburguesa como último control, a la derecha**. El selector de idioma y el botón Ingresar salen de la barra y viven dentro del panel del menú: el selector como control real (cambia el idioma sin cerrar el menú) y la cuenta como entrada («Ingresar / crear cuenta» en invitado, «Cuenta / privacidad» con sesión), que ya existía. La entrada «Idioma / configuración», que solo enfocaba el selector, desaparece porque el selector ya está en el panel. Decisión D-12-1 sobre qué queda en la barra.
3. **Salir en el perfil.** `ProfilePanel` recibe `onSignOut?: () => void` y muestra «Salir» junto a «Listo» cuando hay sesión; al pulsarlo cierra el perfil y llama al mismo `signOut` del menú. Invitado no lo ve.
4. **Preferencias (UAT13-22).** Un solo control de experiencia, en Preferencias de entrenamiento. Las preferencias dejan de ser borrador: cada cambio válido se aplica al instante con `onHealthProfileChange`, igual que el resto del perfil; un valor fuera de rango (días 1–7, minutos 15–180) no se aplica y se muestra el aviso existente. El botón «Guardar preferencias de entrenamiento» desaparece y su nota («no cambia tus rutas existentes») se conserva como texto. «Listo» no puede perder nada porque no hay borrador. Si `healthProfile` cambia desde afuera (sync, Cuerpo y salud), el control refleja el dato actual. Decisión D-12-3.
5. **Reenviar (UAT13-06).** `.account-verification .verification-resend { color: var(--teal-800); }` junto al fondo blanco ya existente; hover conserva el fondo azul con texto blanco.

## 5. Alternativas descartadas

- Quitar `backdrop-filter` de la cabecera: arregla el menú pero cambia la estética aprobada de la barra; el portal resuelve la causa sin tocar el estilo.
- Aumentar la especificidad solo con `!important`: oculta el conflicto y no resuelve el contenedor de `position: fixed`.
- Conservar los dos controles de experiencia «sincronizados»: dos fuentes de verdad para un dato; el defecto reaparecería con cualquier campo nuevo.
- Añadir «Salir» también a la barra: el Operator pidió descargar la barra, no cargarla.

## 6. Riesgo sobre lo que hoy funciona

- Portal: el panel ya no es descendiente DOM de `.shared-navigation`; cualquier test o estilo que dependa de esa jerarquía cambia. Verificado con los tests por rol y con la matriz de navegación del ciclo 2 (156 filas), que consulta `#aunara-navigation` por id.
- Cabecera: quitar el selector de idioma de la barra mueve una acción frecuente a un clic más (abrir menú). Es la decisión explícita del Operator; se mide que el cambio de idioma dentro del menú funciona en ES/EN y en ambos anchos.
- Preferencias sin botón de guardar: cada cambio dispara un guardado con debounce a la nube (H-01 ya cubre el revert rápido); se mide que no hay guardados extra por abrir/cerrar el perfil.

## 7. Verificación: criterios falsables

| ID | Criterio binario |
|---|---|
| S12-01 | Menú abierto por logo y por hamburguesa, 1440/390, ES/EN, Chromium y WebKit: `#aunara-navigation` íntegramente dentro del viewport (`y ≥ 0`, `bottom ≤ innerHeight`), `nav` computado `display: grid`, todas las entradas con el mismo `x` y `scrollWidth === clientWidth`. Negativo: eliminar el portal ⇒ `y < 0` o `scrollWidth > clientWidth`. |
| S12-02 | En la barra, la hamburguesa es el control con mayor `x` y el logo el de menor `x`, en sesión e invitado, 1440/390. |
| S12-03 | La barra no contiene `.language-select` ni `.guest-account-button`. El panel contiene un `select` de idioma que al cambiar a EN deja el menú abierto y traduce sus entradas; contiene «Ingresar / crear cuenta» (invitado) o «Cuenta / privacidad» (sesión) que abren el panel de acceso. No existe la entrada «Idioma / configuración». |
| S12-04 | Con sesión, el perfil muestra «Salir»; al pulsarlo se cierra el perfil y se emite `POST /auth/v1/logout`; sin sesión no se muestra. El «Salir» del menú sigue funcionando. |
| S12-05 | En el perfil hay exactamente un control «Experiencia entrenando». Cambiarlo persiste al instante (`repbook-health-profile.experience` cambia) y Cuerpo y salud no ofrece otro. Cambiar días a 0 no persiste y muestra aviso. «Listo» tras un cambio conserva el valor. No existe «Guardar preferencias de entrenamiento». Negativo: restaurar el borrador ⇒ la primera aserción falla. |
| S12-06 | En estado «confirmación pendiente», el botón «Reenviar correo de confirmación» tiene `color ≠ backgroundColor` y contraste ≥ 4.5:1 sin hover; con hover sigue legible. Negativo: quitar la regla ⇒ color = fondo. |
| S12-07 | Suite unitaria completa verde (añadiendo tests por criterio), typecheck, guards, builds `/` y `/aunara/` con allowlist 32; matrices del ciclo 2 (storage, startup, Auth, privacidad, navegación, geometría) verdes en Chromium y WebKit sobre el build del candidato, con los guiones ajustados solo donde cambió la estructura (selector de idioma dentro del menú). |
| S12-08 | Negativos de S12-01/05/06 en copia disposable, uno por vez, restaurados; control verde. |

## 8. Plan de entrega

1. Build en worktree aislado desde `bfb97a1`, rama `wip/sdd012-candidate-2026-10-13`, TDD por criterio.
2. Revisión con el harness del ciclo 2 más probes nuevos (`uat13-*`), ambos motores.
3. Con APPROVED: commit en `dev`; publicación solo con orden nueva. UAT del Operator sobre `dev` con la allowlist de redirección de Supabase ya corregida.

## 9. Decisiones del Operator

- **D-12-1 — Qué queda en la barra:** supuesto de Build: logo a la izquierda; en sesión, Sincronizado/Cuenta, Mi perfil, Inicio/Ejercicios y Entrenamiento de hoy; en invitado, Inicio; hamburguesa a la derecha. Idioma e Ingresar solo en el menú, como pidió el Operator el 2026-10-13. Si quiere menos controles en la barra, se ajusta sin cambiar el resto.
- **D-12-2 — Agregar ejercicios desde el recuadro de cada día (UAT13-17):** fuera de este SDD; hoy se agrega eligiendo el día en el armador. Diseñar como cambio propio del editor si se confirma.
- **D-12-3 — Preferencias sin botón de guardar:** supuesto de Build; alternativa: conservar el botón y bloquear «Listo» con cambios sin guardar. Recomendado aplicar al instante, por consistencia con todo el resto del perfil.
- **D-12-4 — UAT13-01/02/05 (alineación del slogan y crédito, color del opcional):** fuera; requieren una decisión visual concreta (medida o referencia), no un criterio falsable derivable de lo reportado.

## 10. Definición de terminado

S12-01…S12-08 verdes con evidencia versionada en `2026-10-13-sdd012-revision/`, commit en `dev`, SOT al día. UAT del Operator y publicación siguen siendo decisiones suyas.
