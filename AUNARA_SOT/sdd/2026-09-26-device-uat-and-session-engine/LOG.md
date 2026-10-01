# Registro de trabajo — UAT multidispositivo y motor de sesiones

| Fecha | Acción | Evidencia / decisión | Resultado |
| --- | --- | --- | --- |
| 2026-09-26 | Se revisó documentación de producto, metodología, arquitectura y contratos actuales de App, WorkoutItem y snapshot. | `docs/product/`, `docs/methodology/`, `src/App.tsx`, `src/types.ts`, `src/lib/cloudSnapshot.ts` | Brecha plan/ejecución constatada; sin cambiar implementación. |
| 2026-09-26 | Se propuso SDD y matriz UAT con gate separado para acceso, motor y metodología. | `SPEC.md`, `docs/product/2026-09-26-device-uat-matrix.md` | Pendiente de aprobación del Operator y pruebas reales. |
| 2026-09-26 | Se abrió la publicación vigente en web, Safari de iPhone 17/iOS 26.5 y Chrome 124 de Pixel API 35. | `https://ac-setroc.github.io/?uat=20260926-*`; observación visual del home público | UAT-00 pasa; UAT-01 a UAT-10 continúan sin ejecutar. |
| 2026-09-26 | Se verificó la línea base con ambos emuladores activos. | `npm run typecheck`; `npm run build`; Vitest con siete archivos repetidos a menor concurrencia y, para los dos restantes, en forma aislada | Tipos y build pasan. Los siete archivos arrancan y pasan; la corrida global sufrió timeouts de workers por presión de memoria, no fallos de aserción. |

Agregar aquí solo hitos con evidencia. No convertir la planificación en
resultado de ejecución.
