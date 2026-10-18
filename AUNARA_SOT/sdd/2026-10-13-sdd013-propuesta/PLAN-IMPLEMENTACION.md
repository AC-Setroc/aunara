# SDD-013 — plan de implementación aprobado

> Actualización 2026-10-15 · `[AUNARA/codex · gpt-6.1-sol]`: ejecutado y [APPROVED técnico independiente](../2026-10-13-sdd013-revision/review-cycle2.md); [recibo de entrega](../2026-10-13-sdd013-revision/delivery-receipt.md). Casillas acreditan ejecución técnica/documental, no cierre humano. Unitarios/suite completa PASS exclusivamente con lunes controlado bajo D-13-6 aprobada el 15Oct; cuatro fallos antiguos de fecha real siguen abiertos. Focal final140/140 (cuatro archivos), suite367/25 + Sites1; se usó `--configLoader runner` cuando el cache compartido impedía el arranque. Los comandos de abajo describen el plan; las invocaciones y caveats efectivos constan en los recibos.
>
> Ejecución mediante roles separados de Operator SDD Workflow; no commits de desarrollo parciales ni publicación. Referencia vinculante: SDD-013 v0.1, aprobado 2026-10-14. Este plan no amplía su allowlist.

**Goal:** llevar dirección A a aplicación real sin perder destinos/contratos.
**Architecture:** NavigationMenu conserva portal/modal accesible; App compone destinos y selector reales. CSS exclusivo evita afectar borrado y resto de la app. Activos existentes, sin recreación.
**Tech Stack:** React/TypeScript, Vite/Vitest y harness Playwright existente para Chromium/WebKit.

## 1. Navegación y cabecera

- [x] Escribir reproducciones en NavigationMenu.test/GuestApp.test/AppFlows.test: fila solo marca/hamburguesa; destinos trasladados bajo gates originales; Tab incluye select y retorno al disparador. Ejemplo central de regresión:
  ```tsx
  fireEvent.click(screen.getByRole("button", { name: "Abrir navegación" }));
  const dialog = screen.getByRole("dialog", { name: "Navegación" });
  expect(dialog.querySelector("select")).not.toBeNull();
  fireEvent.keyDown(dialog.querySelector("select")!, { key: "Tab", shiftKey: true });
  // El control previo pertenece al dialog, no al fondo.
  expect(dialog.contains(document.activeElement)).toBe(true);
  ```
- [x] Correr foco con `node_modules/.bin/vitest run src/components/NavigationMenu.test.tsx src/components/GuestApp.test.tsx src/components/AppFlows.test.tsx --maxWorkers=2`; preservar recibo RED antes de producción, no solo fallo por dependencia.
- [x] Modificar únicamente NavigationMenu/App fronteras SDD. Entrenamiento conserva `setWorkoutPanelMode("view"); setWorkoutOpen(true)` y `hasAppAccess && !onboardingRequired`. Cuenta/sync conserva `openAccess("create")`, privacidad `openAccess("sign-in")`; preservar los gates de perfil/secciones aunque difieran de canUseTraining.
- [x] Panel right:0/top:0/bottom:0 desktop370; móvil fullviewport. Marca194desktop/168móvil, botón44. Trap visible/enabled incluye select; backdrop/Escape y cierre restauran foco y overflow.
- [x] Repetir focal verde tras implementación y anotar conteos, sin debilitar cobertura anterior.

## 2. Consentimiento y footer

- [x] Tests AccessPanel/AppFlows conservan payload de opcional false y aceptación legal requerida; verificar textos/atribuciones exactos. Agregar aserciones de presentación sin usar copy ficticio.
- [x] Estilos exclusivos .legal-consents en crear cuenta: sin borde/fondo/radio interno; opcional --teal-800, contraste4.5; label/check juntos. No tocar lógica Auth.
- [x] Footer centra tinta/label y crédito horizontal conforme S13-06; reutilizar offsets de activos reales sin modificar PNG/SVG. No hero/CTA/copy nuevo.
- [x] Repetir focal y suite completa con `npm test`; guardar recibo, no reiterar suite sin cambios.

## 3. Compilado y revisión independiente

- [x] `npm run typecheck`, `npm run test:exercise-directory`, guards de scripts según runbook, builds `AUNARA_BASE_PATH=/ npm run build` y `AUNARA_BASE_PATH=/aunara/ npm run build`, guard artifact en ambas. Lint N/A, no instalar.
- [x] Harness nuevo exacto permitido `AUNARA_SOT/sdd/2026-10-13-sdd013-revision/harness/sdd013-checks.mjs`, reutilizar pruebas reales existentes mediante import/adaptador sin editar historia. Matriz completa SDD: ambos motores/idiomas/tamaños/bases/estados, foco y capturas visuales.
- [x] N1–N4 en copias descartables, un cambio por vez; volver rojo y control restaurado verde. No tocar candidato revisado con mutaciones.
- [x] Revisor distinto del constructor clasifica todos S13-01…08; casillero no ejecutado impide APPROVED. Máximo3 ciclos. Si nueva frontera requerida, detener y volver a aprobación.

## 4. Entrega

- [x] Delivery independiente verifica manifest/hashes/NO-TOCAR, actualiza SDD/estado/pendientes/historia y recibo, un commit local solo tras APPROVED. No modificar árbol canónico ni UAT abierta.
- [x] Handoff indica qué faltó (Safari/iPhone real y recuperación separados). No push/deploy; nueva orden del Operator para integrar/publicar.
