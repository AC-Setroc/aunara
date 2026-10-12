# SDD-007 — Ejecución, historial y seguimiento

2026-10-10 · Estado: **Borrador** · v1
Origen: [Aunara/Codex · modelo no expuesto en este agente]
Entrega 2; depende del cierre local de SDD-006. Requiere diseño/rebaseline y aprobación nuevos.

## 1. El problema, en el idioma del Operator

Una rutina planeada no prueba que se realizó. La persona necesita registrar cada serie, retomar una sesión interrumpida y consultar hechos comparables sin que editar la rutina cambie su historia ni que una sugerencia altere el plan sola.

## 2. Alcance y fuera de alcance

Propuesto: sesión propia con inicio/pausa/reanudar/finalizar, registro por serie, prescripción congelada, precarga explícita de última sesión, timers de trabajo/descanso, historial y métricas con origen visible. Override fechado para mover una sesión, sin modificar plantilla semanal. Captura de esfuerzo/técnica/tolerancia opcional; inferencia clínica/progresión espera matriz aprobada.

Allowlist **tentativa, no ejecutable** hasta diseño y rebaseline:

- Existentes: `src/App.tsx`, `src/styles.css`, `src/types.ts`, `src/components/WorkoutPanel.tsx`, `src/components/AppFlows.test.tsx`, `src/lib/workoutPrescription.ts`, `src/lib/workoutPrescription.test.ts`, `src/lib/cloudSnapshot.ts`, `src/lib/cloudSnapshot.test.ts`, `src/lib/exercises.test.ts` (solo compatibilidad de historial).
- Nuevos propuestos: `src/lib/workoutSessions.ts`, `src/lib/workoutSessions.test.ts`, `src/lib/sessionTimers.ts`, `src/lib/sessionTimers.test.ts`, `src/components/WorkoutSessionPanel.tsx`, `src/components/WorkoutSessionPanel.test.tsx`, `src/components/ProgressPanel.tsx`, `src/components/ProgressPanel.test.tsx`.
- Documentación: este SDD, `AUNARA_SOT/02-ESTADO-ACTUAL.md`, `AUNARA_SOT/PENDIENTES.md`, `AUNARA_SOT/03-HISTORIA-Y-BACKLOG.md`, `docs/product/2026-09-18-opengym-adoption-review.md`, `docs/product/2026-09-26-device-uat-matrix.md`, `docs/product/2026-08-25-feedback-work-plan.md`.

**NO-TOCAR:** fuentes/activos/textos de OpenGym; fuentes y medios de terceros; Auth/SMTP/DNS/producción, `.env*`, `supabase/`, hooks de sync/almacenamiento, cliente/transportes, workflows, dependencias y matriz clínica v0.1. No reasignar salud a coach, compartir/importar rutinas, app nativa, HealthKit/Health Connect, progresión/deload automáticos ni 1RM en onboarding. Persistencia que exija archivo excluido detiene el frente y requiere enmienda.

## 3. Estado real de partida, medido y no supuesto

HEAD leído `1c709a3`; dirty SDD-002/003/004 preservado. Es código local, no nueva UAT ni producción verificada.

- `src/types.ts:31–46` y `src/components/WorkoutPanel.tsx:507–516`: carga resumida e historial de ítem; no evento de serie completada.
- `src/lib/cloudSnapshot.ts:10–20`: snapshot v1 contiene tracks/perfil/check-ins, no entidad de sesión propia en ese contrato. Búsqueda `Session|SetPerformance` en `src/types.ts` y lectura de la interfaz sustentan esta ausencia acotada.
- `docs/product/2026-09-18-opengym-adoption-review.md`, §§4–7: referencia funcional OG-01…06 y gates metodológicos. Su mención histórica a repo privado es superada por `AUNARA_SOT/README.md`/AGENTS: repo público no otorga automáticamente derechos de copia.
- `docs/methodology/2026-08-26-review-status.md:3`: feedback entrenador pendiente. Los umbrales propuestos en documentos no son regla aprobada.

Al iniciar esta entrega se vuelven a medir HEAD, contrato y estado tras 006; referencias presentes no congelan implementación futura.

## 4. Diseño

Entidades propuestas: plantilla, agenda fechada, sesión, rendimiento por ejercicio, serie y feedback; IDs estables, timestamps/estado y prescripción de origen congelada. Separar plan de ejecución. Serie pendiente/omitida no cuenta como completada; parcial conserva resultado parcial, no se inventan repeticiones.

Precarga muestra sesión/fecha fuente y permite editar; precargar jamás registra éxito. Sesión incompleta se recupera sin duplicar IDs tras recarga; finalización repetida es idempotente. Corrección de sesión cerrada requerirá política explícita de revisión/versionado, no sobrescritura oculta.

Timers derivan de tiempo objetivo absoluto, no solo ticks UI; prueban segundo plano/retorno/cambio horario. Pantalla activa es opcional con degradación si no existe/permiso negado; no prometer continuidad de capacidad del navegador sin UAT real.

Resumen/progreso enlazan serie y sesión origen y definen denominador, unidades y cobertura. Vacío/faltantes no son cero ni tendencia. Evitar comparación de prescripciones incompatibles. Esfuerzo/técnica/dolor son autoinforme; no diagnóstico. Propuestas de progresión, si futura matriz permite, explican versión de regla/evidencia y requieren aceptación; dolor/técnica deteriorada y cobertura insuficiente bloquean propuesta. No adoptar umbrales de OpenGym.

Clean-room: diseñar desde comportamientos/requisitos documentados y modelo Aunara, escribir código/tests propios sin abrir/copiar fuente ni activos externos en desarrollo. Si se solicita reutilizar material, detener, inventariar procedencia/licencia y obtener revisión jurídica/decisión explícita antes de enmendar. No se emite dictamen legal aquí.

Migración aditiva: histórico resumido queda «registro legado», no se convierte en series ficticias. Fixture v1 y nuevo exportan sin perder notas/cargas/IDs; versionado, límites de tamaño, conflictos multi-dispositivo y revocación deben aprobarse en diseño. No habilitar almacenamiento nuevo por suposición.

## 5. Alternativas descartadas

Contar plantilla como ejecución; editar sesiones al cambiar ruta; progreso desde datos incompletos; copiar OpenGym por ser público; timers dependientes de pestaña visible; progresión automática; convertir legacy a series inventadas.

## 6. Riesgo sobre lo que hoy funciona

Pérdida/duplicación por persistencia, crecimiento del snapshot y conflicto de cuentas: contrato/fixtures, límites y estrategia de conflicto revisados antes de código. Cronometría falsa: clock controlado + dispositivos reales. Comparación clínica engañosa: gates de metodología y cobertura. Dirty compartido: frontera de 006 aprobada y recibo nuevo. Todo cambio de transporte/servidor requiere scope nuevo.

## 7. Verificación

| ID | Criterio falsable futuro |
| --- | --- |
| CA07-01 | Sesión congelada conserva plantilla de origen; editar plantilla después deja sesión cerrada idéntica. |
| CA07-02 | Registrar/pausar/recargar/reanudar/finalizar conserva IDs/resultados; doble finalización no duplica; pendiente/omitida no suma. |
| CA07-03 | Targets heterogéneos de 006 se ejecutan independientemente; precarga visible editable no marca realizada. |
| CA07-04 | Timer tras segundo plano/retorno coincide con reloj fuente dentro de tolerancia aprobada; permiso/capacidad negada no bloquea sesión. |
| CA07-05 | Historial/métrica/record enlazan origen y unidad; cobertura insuficiente muestra vacío, no progreso inventado. |
| CA07-06 | Override mueve solo fecha elegida y es reversible; plantilla y otras fechas idénticas. |
| CA07-07 | Legacy export/round-trip preserva historia; cuenta B no lee sesión A; revocación no resucita salud. |
| CA07-08 | No copia externa ni regla clínica no aprobada; propuesta nunca aplica sola y guardas bloquean datos no elegibles. |

Matriz: typecheck, suite completa, tests directorio, builds `/` y `/aunara/`/artifact; lint sin script registrado N/A. UI local real Chromium/WebKit desktop1440/mobile390, ES/EN, sesión/editor/progreso y vecinos. Negativos: doble guardar, serie pendiente sumada, prescripción mutada, clock/permiso negado, snapshot inválido, cruce de usuario y propuesta sin aprobación; rojo ante defecto y verde restaurado. UAT iPhone Safari/Android Chrome de bloqueo/segundo plano separada y manual; cuentas/sync reales solo por autorización. WebKit o matriz faltante bloquea aprobación.

## 8. Plan de entrega

Tras 006: rebaseline, prototipo de sesión con estados, contrato persistente/versionado y matriz de métricas; Operator aprueba diseño/allowlist exacta. OG-01 primero, herramientas después, progreso solo con registro confiable. Progresión clínica es subgate, no cierre por mocks. Desarrollo→revisor independiente máximo3 iteraciones; luego documentación/commit local solo revisado, cierre Operator y permiso separado para push.

## 9. Decisiones que necesita el Operator

Modelo/estados, correcciones de sesiones cerradas, conflicto sync/límites, definición de adherencia/volumen, tolerancia timer y ubicación de progreso. Danny aprueba esfuerzo/umbrales/guardas antes de inferir; decisión jurídica aparte para cualquier reutilización. Sin estas decisiones sigue Borrador.

## 10. Definición de terminado

No listo para implementar. Futuro terminado: contrato/prototipo/alcance aprobados, CA y matriz verdes, revisor independiente APPROVED, commit local/doc y UAT/cierre Operator. Pendientes clínicos/dispositivos explícitos; no push/producción implícitos.
