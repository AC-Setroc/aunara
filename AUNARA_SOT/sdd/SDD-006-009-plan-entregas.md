# Plan de entregas SDD-006 → SDD-009

2026-10-10 · Estado: **SDD-006 PASS técnico local; entrega aislada pendiente; siguientes entregas en borrador**
Origen: [Aunara/Codex · modelo no expuesto en este agente]

## Orden y dependencias

| Entrega | Resultado | Estado actual | Gate antes de código |
| --- | --- | --- | --- |
| [006](SDD-006-acceso-y-creacion-rutinas.md) | Acceso/home, menú, privacidad/instalación, móvil y rutina por miembro; integrar correcciones locales | PASS técnico local; entrega bloqueada | Resolver frontera/integración de dirty previo y verificar aislamiento antes de commit |
| [007](SDD-007-ejecucion-y-seguimiento.md) | Sesiones por serie y seguimiento propio | Borrador | Cierre006, rebaseline, prototipo/contrato persistente/métricas, allowlist exacta; matriz Danny antes de progresión |
| [008](SDD-008-nutricion-y-recursos-propios.md) | Creación/registro nutricional y piloto de recursos propios | Borrador | Cierre007, rebaseline, revisión nutricional; inventario derechos/piloto técnico aprobado antes de medios/lote |
| [009](SDD-009-entrenador-invitaciones.md) | Registro autónomo→invitación→consentimiento y permisos aislados | Borrador | Producto personal/UAT, rebaseline, threat model/matriz permisos/backend exacto y aprobación independiente |

006 no promete funciones007–009. Los borradores posteriores expresan dirección y preguntas, no aprobación ni preparación ejecutable. Aprobar006 no aprueba el resto. Cualquier cambio al alcance vuelve al gate del Operator antes de desarrollo.

## Frontera real y no-regresión

Lectura base: HEAD `1c709a3f6d09b940a01e39eb55a2a49b74de712f`; dirty local extenso con SDD-002/003/004, algunos archivos ya compartidos por estos frentes. Publicación informada: `dfffa87` documental + `1c709a3` dominio/E2; no nueva verificación de producción en esta creación de especificaciones. No llamar publicado ni cerrado a código local existente.

Antes de integrar: recibo con HEAD/status/diff/hashes, propietarios y gates previos. Preservar cambios ajenos; comparar delta nuevo por hunks con frontera. No incorporar archivos completos sucios por comodidad. Si no es aislable, detener y pedir decisión. Rebaseline de cada entrega incluye lo efectivamente aprobado/revisado, no lo simplemente planeado.

Correcciones locales que006 debe integrar sin rehacer: footer/crédito horizontal ES/EN, etiqueta de consentimiento, enlace de confirmación, objetivos1–3/deporte separado/Ninguno, perfil editable, propuesta por día, editor único sin set plan redundante y Agregar ruta. Retorno rápido de recuperación E2 y flujos normales son regresión obligatoria en Chromium/WebKit; rojo no se oculta con demora ni se arregla fuera de allowlist.

## Gates por iteración

1. **Especificación:** evidencia fresca, CA falsables, archivos exactos y NO-TOCAR. Operator aprueba explícitamente; slogan español seleccionado no equivale a alcance aprobado.
2. **Desarrollo:** solo allowlist, ownership sin solapamiento. Shared App/styles/types/contratos tienen integrador único; descubrir necesidad excluida detiene ese frente.
3. **Revisión independiente:** agente no desarrollador, CA→evidencia, diff contra frontera y NO-TOCAR, tests/tipos/build y UI real. Negativos deben poner rojas las guardas. Máximo3 ciclos, luego escalamiento al Operator sin debilitar checks.
4. **Entrega:** solo APPROVED permite documentación/commit local enfocado; no absorber dirty previo. Estado/pendientes/bitácora se actualizan por dueño integrador, no dos agentes sobre misma SOT.
5. **Cierre humano:** UAT y cierre Operator; push, publicación, producción/migraciones y correo son permisos separados.

## Matriz mínima transversal

`npm run typecheck`, `npm test`, checks/tests directorio, build raíz y `/aunara/`, guard de artifact y negativos existentes según runbook. Lint: no script al leer `package.json`, registrar N/A, no fabricar PASS. Chromium **y WebKit** desktop1440/mobile390 ES/EN, extremos320 donde aplique, teclado/foco/scroll/modales y vecinos de cada flujo. WebKit no ejecutado bloquea aprobación UI.

Datos: legacy/nuevo/export/round-trip, IDs/notas/historia, revocación y aislamiento. UI/sync simuladas no prueban cuentas, entrega de correo ni borrado servidor. UAT real cuenta descartable/Safari iPhone/Chrome Android separada por autorización, build/plataforma/fecha/resultado, sin datos clínicos reales.

## Decisiones y bloqueos conocidos

- Español decidido: «Tu propósito marca el camino.». Inglés «Your purpose leads the way.» aprobado por el Operator el 2026-10-10.
- Fixture triserie confirmado: press8/flexiones a fallo técnico/escalador20 por lado. Enmienda mínima de conteo explícito aprobada el 2026-10-10 junto con iteración adicional puntual del flotante; descansos/rondas no se inventan.
- Danny/matriz clínica y revisión nutricional pendientes: no inventar nuevas reglas, progresión ni promesas de seguridad clínica.
- Traducciones pending no son ES completo; priorización/revisión editorial requerida. IDs estables, sin reescribir dataset.
- Derechos de visuales no se resuelven por atribuir; inventario/licencia/piloto antes de producir/reemplazar. Ningún lote/modelo aprobado por esta planificación.
- OpenGym solo referencia funcional; implementación propia clean-room, sin copiar fuente/activos, cualquier reutilización requiere decisión/revisión específica.
- Entrenador requiere consentimiento y enforcement servidor; no UI-only isolation, checker de existencia ni inscripción automática.
- Auth/mail/SMTP/DNS/real accounts/producción fuera del mandato documental. UAT real pendiente no PASS por mocks.

## Recibo de esta fase

La fase documental creó los cuatro SDD y este plan. El 2026-10-10 el Operator aprobó SDD-006, inglés, Enmienda1 y una continuidad puntual tras CI3. Ahora PASS técnico acotado independiente:302/25+Node1, tipos/directorio/builds/guards; E1 compilado8/8 y float24/24=120 geometrías. CI3 visual superado, sin defectos restantes en casos verificados. Entrega bloqueada por aislamiento del trabajo anterior (13 conflictos de aplicación,11 tras tres vías); decisión de frontera/integración del Operator pendiente. No aprobación global ni commit/push/publicación. Los demás permanecen Borrador hasta sus gates de diseño/rebaseline; UAT real/cierre humano separados.
