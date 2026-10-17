# SDD017A — recibo del harness compilado

`[AUNARA/codex · modelo no expuesto]` · 2026-10-17. Este rol construye el harness; **no emite aprobación técnica ni UAT**. Fases B/C y Safari físico no ejecutadas aquí. La enmienda aprobada omite Rutas para invitados: Inicio → Ingresar → Ayuda/instalación (condicional).

## Aislamiento y reproducción

Desde la raíz del candidato, `BUILD=1 node AUNARA_SOT/sdd/2026-10-17-sdd017-revision/visual-checks.mjs` genera scratch con `git archive 6e3ddaa` limitado a insumos de build; sobrepone únicamente los tres archivos fuente permitidos para candidato. Vite usa directorio de entorno vacío y URL/key públicas sintéticas. No lee/copia `.env`, perfiles de navegador ni storage real; no modifica `dist/` del checkout. `resultados/builds.json` registra directorios temporales y hashes SHA-256 de fuente. Sin instalación ni cambios de dependencias/configuración.

Para la matriz: `BROWSER=chromium BASE=/ node AUNARA_SOT/sdd/2026-10-17-sdd017-revision/visual-checks.mjs`; repetir con `BROWSER=webkit` y `BASE=/aunara/`. Son 12 variantes por motor/base: invitado/autenticado sintético × ES/EN × 320/390/1440. `BUILDS=/ruta/builds.json OUT=/ruta/scratch` permite repetir sin pisar este recibo; `ONLY_TAG=guest-es-390` limita un smoke. Para los seis negativos: `NEGATIVES=1` con el mismo comando; cada defecto se inyecta en una copia compilada desechable, seguido por restauración byte idéntica del HTML y nueva corrida normal. No se muta fuente para provocarlos.

No había DevTools MCP disponible en este rol: fallback explícito a Playwright, Chromium headless1223 y WebKit2336, con contextos frescos, service workers bloqueados y handlers sintéticos versionados de UAT16 reutilizados en memoria. El sandbox macOS denegó MachPort inicialmente; la ejecución de navegador requirió permiso ampliado. Todas las solicitudes no locales se interceptan: solo el host ficticio `synthetic.supabase.invalid` recibe respuestas simuladas; otros hosts se bloquean. No se envía correo ni se usa cuenta real. No ejecutar estas fixtures contra el servidor UAT de entorno real.

## Qué comprueba

Footer completo antes/después: padding/gap/altura/ausencia de reserva100px, **margin-top computado del crédito exactamente0** (móvil/escritorio), color, contenido y enlaces. Solo se reserva barra cuyo `position` computado sea `fixed`; un botón relativo posterior no genera reserva. Tinta del SVG y PNG rasterizados localmente en canvas de tamaño natural, bounds alfa>20, transformados a CSSpx: slogan vs lockup completo (incluye símbolo), crédito horizontal/vertical ≤2px. Las mediciones y bounds quedan en JSON.

Menú: orden exacto guest, inventario autenticado vs baseline; destinos Inicio/acceso, perfil/cuenta/biblioteca/entrenamiento sintéticos; portal a body, trap bidireccional, Escape/cierre/backdrop y retorno de foco/scroll. Toggle único en cabecera, sin select, 44px, no solapamiento, contraste/foco y cambios efectivos por puntero/Enter/Space con persistencia tras reload. Opcional: computed style **del span y contenedor**, sin borde/fondo/sombra, expansión natural de texto (no altura fija), contraste, no required; legal obligatorio bloquea y alta simulada con salud sin marcar envía `declined`. No reemplaza la revisión independiente de privacidad/runtime ni las suites completas.

## Calibración: rojos reales del harness, no defectos de producto

1. Primer smoke usó nombre equivocado de variable pública (`ANON_KEY` en vez de `PUBLISHABLE_KEY`); sin cloud configurado, el perfil sintético habilitaba entrenamiento local y la etiqueta guest era inválida. Se corrigió variable y se reconstruyeron **ambos** builds; no se aceptó esa evidencia.
2. La primera detección de barra tomaba cualquier `.mobile-workout`; era `position:relative`. Se restringió a `fixed`, conforme al SDD, sin cambiar CSS de producto.
3. WebKit con `drawImage(img,0,0)` rasterizaba a tamaño de presentación y producía centro falso (~65px). Se explicitó el destino de tamaño natural en canvas; bounds completos y captura confirmaron el mismo activo visible. No se ajustó tolerancia2px.
4. Inicio usa `#top` del main bajo header: `scrollY=70` no implica destino incorrecto. Se verifica hash y posición efectiva del target (≤2px), no scrollY absoluto0.
5. Capturas/acciones con timeout6s fallaron bajo competencia de navegadores (sin fallo de assertion visual). Se aumentó timeout30s y se repitió; no se ignoraron excepciones ni se convirtieron rojos en PASS.
6. Revisión del harness detectó que la comparación de scroll usaba fallback tautológico y faltaban capturas drawer. Se reemplazó por scroll medido antes de abrir/reabrir vs después de Escape y se incorporaron capturas baseline/candidato de drawer. La matriz definitiva debe incluir estas guardas.
7. **Ciclo1 REJECTED de producto:** persistía `.footer-development-credit { margin-top:12px }` en media≤760, contra §4. El harness tampoco lo medía: se incorporó guarda específica y `margin-red/chromium-root.json` demuestra C17-01 rojo con computed12. El desarrollo corrigió solo ese margen a0; nuevo snapshot ciclo2 `XjXOVn` y hash CSS `644c042d78355136323f782f24db46e9ea7bc217640e179d2b2c509b4d9a6da3`. Las matrices anteriores no se toman como aceptación de esa corrección. El job WebKit previo se detuvo al detectar la necesidad de nuevo snapshot.

El timeout30s de captura auth-en320 también se reprodujo en ciclo1 bajo competencia; el caso completo aislado quedó verde con la misma fuente. Se conserva el JSON fallido en `calibration/chromium-root.json.before-retry.json` y la repetición en `isolated-retry/`. Esto es trazabilidad histórica, **no** la matriz final ciclo2; no se descartó ninguna aserción fallida ni se cambió tolerancia visual.

`resultados/baseline-red/chromium-root.json` contiene el baseline válido probado con criterios actuales: C17-01/03/04/05 rojos; C17-02 ya centrado en baseline. No atribuir al cambio una mejora óptica inexistente.

## Resultados finales

Ciclo2, snapshot `XjXOVn`, fuente congelada con hashes en `resultados/builds.json`: Chromium raíz **250/250**, Chromium `/aunara/` **250/250**, WebKit raíz **250/250**, WebKit `/aunara/` **250/250**. Las cuatro corridas terminaron con exit0, secuenciales y sin navegadores en competencia. Son 48 variantes completas y 1000 comprobaciones del harness; todos los márgenes de crédito computados son0. El centrado máximo medido es0.120px (lockup/slogan),0.025px (crédito horizontal) y1.387px (vertical). Invitado ES390: footer Chromium336.313→208.313px y WebKit336.297→208.297px, sin100px incondicional.

Los negativos de ciclo2 aún están en curso al escribir este estado; no se consideran cerrados por las12 pruebas verdes históricas de ciclo1. No hay aprobación técnica ni UAT emitida por este rol. Los JSON completos son evidencia primaria; se conservarán ocho capturas representativas y el resto en scratch local con inventario para evitar duplicación binaria. La receta genera nuevamente toda la matriz. Las suites completas y regresiones ajenas a la superficie corresponden al recibo del revisor independiente, no se infieren de estas1000 comprobaciones.
