# SDD-013 — entrega técnica local

2026-10-15 · `[AUNARA/codex · gpt-6.1-sol]` · Rol entrega, separado del constructor/revisor. **Implementado y APPROVED técnico; pendiente cierre del Operator.**

## Autoridad y fuente entregada

[SDD-013 v0.1 + D-13-6](../SDD-013-menu-lateral-identidad.md), [revisión final independiente ciclo2](review-cycle2.md), [desarrollo](development-receipt.md) y [verificaciones independientes](main-checks.md). Base `549b100`; candidato `/private/tmp/aunara-sdd013-candidate`, no carpeta canónica. Se entrega en una rama local descriptiva con un único commit enfocado, consultable mediante `git log -1`; ningún push/merge/deploy. No se modifica el canónico dirty ni `/private/tmp/aunara-uat-20261013-dev`.

Los ocho SHA256 se comprueban antes y después de la actualización documental contra el manifest final de review-cycle2, no contra freezes históricos. Fuente de producto/test inmutable durante entrega:

```text
ca707430b3f93e7d902980c744a60d07380156091f173b52901266e828e1f806 src/App.tsx
b112d7de04e8641d5b09c7c6bc616cb08725587c7f2c9312f65a830007902a9a src/components/AccessPanel.tsx
987eea12053402208e504bcebf5f19f17248d56672a1c652ea288dbc6a45a850 src/components/NavigationMenu.tsx
d1be8e7592e43384c234b90da32032765b19eb6c4a45fe86331c2f2534f34590 src/styles.css
3b165fbab4105d8a31d19d8a75f36bf043377b8319a850d1aaaf598244f1fc8a src/components/AccessPanel.test.tsx
30804d8c82f8f67fcedfa7e6f174bf1bb07b2022e567af08e5f9bace8ef01080 src/components/AppFlows.test.tsx
8565542a581d3e9f32fe39981e63816bffbd45b16a482d62e0ba60788fcbbcc0 src/components/GuestApp.test.tsx
a575a7ec9cda7b8395acd71518018134cbf17b412cc0e989527597dd5db47fff src/components/NavigationMenu.test.tsx
```

## Evidencia aceptada (no se repiten corridas verdes sin cambios de fuente)

- Matriz actual: cuatro JSON en `resultados/cycle2/accepted-chromium-{root,aunara}` y `final-webkit-{root,aunara}`, **393/393 PASS y12 casos completos cada uno**;96 superficies revisadas visualmente,16 láminas más capturas directas. ES/EN,1440/390/320, invitado/sesión, ambos disparadores y estados adicionales.
- Seis regresiones completas por motor sobre ambas bases: storage276, startup84, Auth42, privacidad84, navegación156, geometría52, todas PASS. Rutas exactas y calibraciones en revisión final; intentos abortados no cuentan como aceptación.
- N1–N4 ambos motores:16 registros rojo/restaurado aceptados; restauración exacta por hash en `resultados/cycle2/negatives-{chromium,webkit}-final/negatives.json`.
- Tipos, directorio4/4, guards Pages/SW27/27, builds raíz/rollback y guard artifact32/32 por base PASS; lint N/A, no instalado.
- Comparación lunes controlada: freeze final367/367 Vitest,25 archivos + Sites1/1; baseline363/363 + Sites1/1. **No es suite normal verde con fecha real.** El 14Oct baseline359 PASS/4 FAIL y candidato fallan las mismas cuatro aserciones antiguas dependientes de lunes: edición de rutina AppFlows y tres WorkoutPanel. D-13-6 aprobada explícitamente el15Oct («Aprobar excepción acotada») acepta solo esta evidencia comparativa; no corrige editor/tests ni exceptúa cualquier otro fallo.

## Auditoría de entrega

Comprobaciones frescas de bajo costo: APPROVED vigente, parseo de cuatro matrices y16 controles, ocho hashes, sintaxis del harness, enlaces documentales de entrega, `git diff --check`, allowlist exacta y NO-TOCAR contra549b100. Evidencia nueva limitada a esta carpeta de revisión; ninguna modificación de harness/evidencia histórica de otros SDD.

Auditoría de contenido: capturas generadas por el harness con fixtures sintéticos/intercepción de red, no originales del Operator. Email de fixture `fixture@example.invalid` y contraseña demostrativa `Synthetic-Password-2026` pertenecen a requests mockeados; no son credenciales reales. Los JSON/logs no incorporan secretos reales, enlaces con tokens ni datos personales de usuarios. No se versionan dependencias, artifacts compilados, `.env`, referencias privadas ni directorios temporales. Se conservan fallos/calibraciones como antecedentes, sin acreditarlos como PASS.

NO-TOCAR intacto: Auth/hooks/lib/storage, recuperación/mail/SMTP/DNS/Supabase, textos legales, perfil/editor/entrenamiento, propuesta/hero, service worker/workflows/dependencias/configuración y bytes `public/brand`. No cambios en main/producción ni preview. La entrega añade únicamente documentación de estado/pendientes/historia/seguimiento/plan y este recibo a la implementación/evidencia ya revisadas.

## Pendiente del Operator

UAT visual y Safari/iPhone físico diferidos; cierre humano no concedido. Dos filas Inicio mantienen rutas y ancla distintas por contrato; observación UX, no eliminación unilateral. Autorizar integración/actualización de entorno por orden separada. Diagnosticar retorno de recuperación LAN→producción sin causa aún confirmada. Corregir aparte las cuatro pruebas dependientes del día con su propia especificación/aprobación. Publicación requiere nueva autorización expresa.
