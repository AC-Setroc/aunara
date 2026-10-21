# SDD-007 — Ejecución, historial, seguimiento y reportería

2026-10-20 · Estado: **Borrador** · v2 (incorporación de reportería, tendencias y gráficas según orden del Operator)
Origen: [Aunara/Antigravity] sobre borrador v1 de [Aunara/Codex]
Entrega 2; depende del cierre local de SDD-006. Requiere diseño/rebaseline y aprobación nuevos.

## 1. El problema, en el idioma del Operator

Una rutina planeada no prueba que se realizó. La persona necesita registrar cada serie, retomar una sesión interrumpida y consultar hechos comparables sin que editar la rutina cambie su historia ni que una sugerencia altere el plan sola.

Además, los registros de series y sesiones no deben quedar como cifras aisladas en un formulario: la persona necesita comprender su evolución real en el tiempo mediante un módulo de reportería completo que muestre historial cronológico, tendencias de rendimiento por ejercicio y por grupo muscular, volumen acumulado, marcas personales y gráficas visuales claras, accesibles y optimizadas para móvil y escritorio.

## 2. Alcance y fuera de alcance

Propuesto:
1. **Ejecución en vivo:** sesión propia con inicio/pausa/reanudar/finalizar, registro por serie, prescripción congelada, precarga explícita de última sesión, timers de trabajo/descanso independientes de la pestaña. Override fechado para mover una sesión, sin modificar plantilla semanal. Captura de esfuerzo/técnica/tolerancia opcional; inferencia clínica/progresión espera matriz aprobada.
2. **Reportería, historial y analítica visual:**
   - **Historial navegable:** visualización cronológica detallada por fecha, sesión y ejercicio, permitiendo contrastar desempeños pasados.
   - **Tendencias y progreso:** evolución de carga máxima levantada, repeticiones efectivas y volumen de carga total ($series \times reps \times peso$) por ejercicio, grupo muscular y periodo (semana/mes/histórico).
   - **Gráficas interactivas y visuales:** curvas de tendencia temporal de cargas y barras de volumen acumulado semanal renderizadas de forma nativa/ligera (SVG accesible con tokens de diseño AC | Setroc: Ink `#12151B`, Slate `#5A6473`, Mist `#DCE0E6`, Paper `#FAFAF8`, Cobalt `#2D5BFF`), sin dependencias externas pesadas ni telemetría invasiva.
   - **Indicadores y marcas (PRs):** detección transparente de récords personales por ejercicio (mejor peso levantado, mayor volumen en una sesión) y consistencia semanal/mensual.

Allowlist **tentativa, no ejecutable** hasta diseño y rebaseline:

- Existentes: `src/App.tsx`, `src/styles.css`, `src/types.ts`, `src/components/WorkoutPanel.tsx`, `src/components/AppFlows.test.tsx`, `src/lib/workoutPrescription.ts`, `src/lib/workoutPrescription.test.ts`, `src/lib/cloudSnapshot.ts`, `src/lib/cloudSnapshot.test.ts`, `src/lib/exercises.test.ts` (solo compatibilidad de historial).
- Nuevos propuestos:
  - Motor de sesiones: `src/lib/workoutSessions.ts`, `src/lib/workoutSessions.test.ts`, `src/lib/sessionTimers.ts`, `src/lib/sessionTimers.test.ts`, `src/components/WorkoutSessionPanel.tsx`, `src/components/WorkoutSessionPanel.test.tsx`.
  - Reportería y analítica visual: `src/lib/workoutAnalytics.ts`, `src/lib/workoutAnalytics.test.ts`, `src/components/ProgressPanel.tsx`, `src/components/ProgressPanel.test.tsx`, `src/components/TrendChart.tsx`, `src/components/TrendChart.test.tsx`.
- Documentación: este SDD, `AUNARA_SOT/02-ESTADO-ACTUAL.md`, `AUNARA_SOT/PENDIENTES.md`, `AUNARA_SOT/03-HISTORIA-Y-BACKLOG.md`, `AUNARA_SOT/sdd/SDD-006-009-plan-entregas.md`, `docs/product/2026-09-18-opengym-adoption-review.md`, `docs/product/2026-09-26-device-uat-matrix.md`, `docs/product/2026-08-25-feedback-work-plan.md`.

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

### Módulo de reportería, tendencias y visualización gráfica
- **Agregación matemática y analítica (`workoutAnalytics.ts`):** funciones puras de cálculo de volumen ($peso \times reps$), tonelaje total por sesión o periodo, mejor marca histórica por ejercicio y métricas derivadas transparentes (ej. fórmula Epley o Brzycki para estimación de fuerza relativa, claramente etiquetada como estimación matemática, no dictamen clínico).
- **Tratamiento honesto de datos:** la falta de registro o semanas de inactividad no se dibujan como ceros que hunden artificialmente la tendencia de fuerza, ni se interpolan datos falsos; los gráficos reflejan vacíos/gaps temporales explícitos. Si un ejercicio tiene menos de 2 registros, se muestra estado vacío / histórico puntual sin forzar una línea de tendencia.
- **Gráficas nativas (`TrendChart.tsx`):** implementación de visualización mediante SVG nativo responsive. Respeta la cuadrícula, tipografía Geist y tokens de diseño AC | Setroc (fondo Paper `#FAFAF8`, trazos Mist `#DCE0E6`, texto/ejes Slate `#5A6473` e Ink `#12151B`, línea de tendencia y barras de realce en Cobalt `#2D5BFF`). Interacción accesible por teclado y tooltips táctiles simples para consultar el valor exacto de cada punto en móvil y escritorio.
- **Vistas en `ProgressPanel.tsx`:**
  - **Apertura por defecto en Resumen (decisión Operator 2026-10-20):** panel general que sintetiza volumen acumulado, sesiones completadas / adherencia semanal, y marcas personales recientes.
  - **Filtro temporal predeterminado y opciones (decisión Operator 2026-10-20):** inicia en 4 semanas (mes) por defecto; incluye selector de rango temporal con opciones: Semana, Mes, Trimestre, Semestre y Año.
  - **Vista detallada por ejercicio:** selector secundario para inspeccionar la curva cronológica de carga y repeticiones de un ejercicio puntual en el periodo seleccionado.

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
| CA07-09 | Módulo de reportería computa volumen, tonelaje y récords fidedignamente solo sobre series marcadas como completadas; series pendientes u omitidas se excluyen del cálculo. |
| CA07-10 | Gráficas de tendencia representan fielmente el historial en el tiempo; semanas o días sin datos muestran gaps honestos sin inventar ceros ni extrapolar progresiones ficticias. |
| CA07-11 | Componente visual `TrendChart` renderiza en SVG conforme a tokens AC \| Setroc y escala fluidamente en pantallas móviles (320px, 390px) y escritorio (1440px) sin desborde horizontal ni clipping en Chromium y WebKit. |

Matriz: typecheck, suite completa, tests directorio, builds `/` y `/aunara/`/artifact; lint sin script registrado N/A. UI local real Chromium/WebKit desktop1440/mobile390, ES/EN, sesión/editor/progreso y vecinos. Negativos: doble guardar, serie pendiente sumada, prescripción mutada, clock/permiso negado, snapshot inválido, cruce de usuario y propuesta sin aprobación; rojo ante defecto y verde restaurado. UAT iPhone Safari/Android Chrome de bloqueo/segundo plano separada y manual; cuentas/sync reales solo por autorización. WebKit o matriz faltante bloquea aprobación.

## 8. Plan de entrega

Tras 006: rebaseline, prototipo de sesión con estados, contrato persistente/versionado y matriz de métricas; Operator aprueba diseño/allowlist exacta. OG-01 primero, herramientas después, progreso solo con registro confiable. Progresión clínica es subgate, no cierre por mocks. Desarrollo→revisor independiente máximo3 iteraciones; luego documentación/commit local solo revisado, cierre Operator y permiso separado para push.

## 9. Decisiones que necesita el Operator

- **Decidido por el Operator (2026-10-20):**
  - Vista inicial: Resumen general de progreso.
  - Ventana por defecto: 4 semanas (mes).
  - Filtros temporales disponibles: Semana, Mes, Trimestre, Semestre y Año.
- **Pendientes antes de código:**
  - Modelo/estados de sesión en vivo (inicio/pausa/reanudar/completar).
  - Política de corrección de sesiones cerradas (¿edición de registros pasados o inmutabilidad estricta?).
  - Conflicto de sincronización y límites de payload.
  - Tolerancia de timer en segundo plano.
  - Validación metodológica con Danny (aprobación de esfuerzo/umbrales/guardas antes de inferir). Sin estas decisiones sigue Borrador.

## 10. Definición de terminado

No listo para implementar. Futuro terminado: contrato/prototipo/alcance aprobados, CA y matriz verdes, revisor independiente APPROVED, commit local/doc y UAT/cierre Operator. Pendientes clínicos/dispositivos explícitos; no push/producción implícitos.
