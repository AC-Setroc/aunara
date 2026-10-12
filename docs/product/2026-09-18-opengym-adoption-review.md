# Evaluación de OpenGym y decisiones de adopción para Aunara

Fecha: 18 de septiembre de 2026  
Estado: **Evaluación completada; adopciones incorporadas al plan, sin copiar código**

Especificación ejecutable propuesta: [SDD de UAT y motor de sesiones](../../AUNARA_SOT/sdd/2026-09-26-device-uat-and-session-engine/SPEC.md).
La adopción de una dirección funcional no autoriza implementación antes del
gate del Operator ni sustituye revisión jurídica o metodológica.

## 1. Fuente revisada

- Repositorio: [alexpcosta/opengym](https://github.com/alexpcosta/opengym)
- Commit revisado: [`678bf5bf10446e8997a77d43e89c9b2721d8d0fc`](https://github.com/alexpcosta/opengym/commit/678bf5bf10446e8997a77d43e89c9b2721d8d0fc)
- Origen: fork de [DuarteSantos8/openGym](https://github.com/DuarteSantos8/openGym)
- Licencia: [GNU AGPL v3.0](https://github.com/alexpcosta/opengym/blob/main/LICENSE)
- Catálogo de ejercicios: el mismo dataset de 1.324 ejercicios usado por Aunara.

OpenGym se revisó como referencia funcional y arquitectónica. No se incorporó
código, diseño visual, textos, iconos ni otros activos del repositorio.

## 2. Decisión de licencia

La AGPL exige ofrecer el código fuente correspondiente a quienes interactúan
con una versión modificada a través de una red. La explicación oficial de GNU
está en [Licenses](https://www.gnu.org/licenses/) y
[Why the GNU Affero GPL](https://www.gnu.org/licenses/why-affero-gpl.html).

Por eso, mientras Aunara conserve su repositorio fuente privado:

1. no se copiarán módulos ni fragmentos de OpenGym;
2. sí se pueden evaluar sus comportamientos visibles y principios generales;
3. las funciones seleccionadas se diseñarán e implementarán desde cero;
4. cada implementación usará el modelo de datos, metodología, marca y pruebas
   propios de Aunara;
5. cualquier excepción futura requiere una decisión explícita sobre licenciar
   Aunara bajo términos compatibles y una revisión jurídica específica.

## 3. Qué ya tiene Aunara y cuál es la brecha

Aunara ya permite crear rutas por días, iniciar el entrenamiento del día,
registrar una carga resumida por ejercicio, usar estructuras y técnicas
especiales, revisar limitaciones y conservar historial básico. La brecha está
en que el registro productivo aún no representa cada serie realizada como un
evento independiente ni construye sobre ese historial una experiencia completa
de sesión, progreso y continuidad.

OpenGym demuestra una solución coherente para esa capa: separa el plan de lo
realmente ejecutado, precarga la última sesión, registra cada serie, maneja
ejercicios por repeticiones, tiempo o cardio, conserva el objetivo original de
la sesión y deriva las sugerencias futuras del historial. Esa dirección sirve a
Aunara, pero sus reglas concretas no se adoptan automáticamente.

## 4. Decisiones por capacidad

| Capacidad observada | Decisión para Aunara | Prioridad | Condición |
| --- | --- | --- | --- |
| Sesión guiada y registro por serie | **Adoptar** con implementación propia | Crítica | Modelo de sesión aprobado y migración del historial actual |
| Precargar cargas/repeticiones de la última sesión | **Adoptar** | Alta | Mostrar origen y permitir cambiar antes de registrar |
| Separar objetivo planificado de resultado ejecutado | **Adoptar** como principio estructural | Crítica | El historial terminado permanece inmutable |
| Temporizador de descanso y de trabajo | **Adoptar** | Alta | Debe seguir correcto al cambiar de app o bloquear pantalla |
| Mantener pantalla activa durante una sesión | **Adoptar** como opción | Media | Degradación segura cuando el dispositivo no lo permita |
| Reprogramar un día sin modificar la plantilla semanal | **Adoptar** | Alta | Override fechado, reversible y visible |
| RIR o RPE opcional por serie | **Adoptar captura; no automatizar todavía** | Crítica metodológica | Definición y rangos aprobados por entrenador |
| Progresión lineal/doble/por tiempo con explicación | **Adoptar el patrón explicable, no sus umbrales** | Crítica metodológica | Puerta metodológica y confirmación del usuario |
| Deload automático | **No adoptar como acción automática** | — | Solo podrá sugerirse con motivo y aceptación explícita |
| Estimación de 1RM | **Diferir y hacer opcional** | Media | Nunca en onboarding; solo con historial elegible y límites aprobados |
| Historial, curvas, récords y mapa de actividad | **Adoptar después del nuevo registro** | Alta | Datos por serie consistentes y suficiente cobertura |
| Mapa muscular | **Explorar después** | Media | Taxonomía biomecánica, copy de incertidumbre y arte propio/licenciado |
| Ejercicios personalizados | **Adoptar después del UAT personal** | Media | Identidad estable, búsqueda y exportación |
| Compartir/importar una rutina sin compartir salud o historial | **Adoptar después del UAT personal** | Media | Formato Aunara versionado, validación y merge no destructivo |
| Importar historial de otras apps | **Diferir** | Baja | Mapeo bilingüe y deduplicación suficientemente confiables |
| Notificaciones de descanso y entrenamiento | **Diferir** | Media | Consentimiento, preferencias y comportamiento PWA verificados |
| Passkeys | **No cambiar ahora** | — | Supabase email/contraseña sigue siendo el acceso vigente |
| Backend JSON autohospedado | **No adoptar** | — | Aunara mantiene Supabase y aislamiento por usuario |
| App nativa con Capacitor | **Reevaluar tras UAT de PWA** | Futura | No precede la validación de producto y dispositivos |
| AI Coach que modifica planes | **No adoptar ahora** | — | Contradice la puerta metodológica y el control humano todavía pendiente |

## 5. Modelo propio propuesto

La primera implementación debe agregar entidades separadas en lugar de seguir
escribiendo sobre la definición de la rutina:

- `WorkoutTemplate`: la ruta planificada y editable;
- `ScheduledWorkout`: qué plantilla corresponde a una fecha, incluido un cambio
  excepcional de día;
- `WorkoutSession`: inicio, fin, estado, duración y chequeo previo;
- `ExercisePerformance`: ejercicio ejecutado y copia de la prescripción usada;
- `SetPerformance`: carga, repeticiones o tiempo, completada/omitida y esfuerzo;
- `SessionFeedback`: técnica, molestia/dolor, energía y nota posterior;
- `ProgressionProposal`: cambio sugerido, evidencia, versión de regla y decisión
  del usuario.

Principios obligatorios:

1. editar una plantilla no reescribe sesiones terminadas;
2. una serie no marcada no cuenta como realizada;
3. Aunara registra hechos antes de inferir progreso;
4. una sugerencia nunca cambia el plan sin aceptación;
5. dolor, síntomas o deterioro técnico bloquean la progresión automática;
6. cada número sugerido explica de qué sesiones y regla proviene;
7. una regla nueva puede recalcular propuestas, pero no alterar el historial;
8. los perfiles anteriores deben abrir sin migración destructiva.

## 6. Bloques adoptados

### OG-01 — Sesión real y registro por serie

Incluye inicio/pausa/reanudación/finalización, prescripción congelada, series
realizadas, carga, repeticiones, tiempo y notas. Es la base de todo lo demás.

### OG-02 — Herramientas durante el entrenamiento

Incluye precarga de la sesión anterior, descanso, trabajo cronometrado, opción
de mantener la pantalla activa y recuperación de una sesión interrumpida.

### OG-03 — Esfuerzo, técnica y tolerancia

Incluye RIR o RPE opcional, calidad técnica autoinformada, dolor/molestia y
motivo de omisión. La captura puede implementarse con la sesión; su uso para
progresar espera aprobación metodológica.

### OG-04 — Progresión explicable

Un motor puro y probado lee sesiones comparables y genera una propuesta con
motivo. Aunara agregará sus propias guardas: dos exposiciones satisfactorias,
técnica, esfuerzo, síntomas, recuperación y aprobación del usuario.

### OG-05 — Historial y progreso

Incluye calendario de actividad, adherencia, carga/volumen, curvas por ejercicio
y récords identificando la serie de origen. El peso corporal permanece separado
del rendimiento. El 1RM estimado será opcional y no formará parte del diagnóstico
inicial.

### OG-06 — Flexibilidad del plan

Incluye mover una sesión específica sin cambiar la semana base y, después del
cierre personal, compartir rutinas mediante un archivo sin salud, medidas,
credenciales ni historial.

## 7. Secuencia recomendada

1. Cerrar el UAT de nutrición Simple/Macros.
2. Recibir el feedback del entrenador y producir la matriz metodológica v0.2.
3. Aprobar copy/accesibilidad del home y las puertas A y B existentes.
4. Implementar OG-01 y la persistencia compatible con datos anteriores.
5. Añadir OG-02 y OG-03, con pruebas móviles de pausa, segundo plano y retorno.
6. Implementar OG-04 solo con reglas metodológicas aprobadas.
7. Construir OG-05 sobre datos reales y explicables.
8. Añadir OG-06 y las funciones diferidas sin bloquear el producto personal.

## 8. Evidencia revisada

- [README y lista de funciones](https://github.com/alexpcosta/opengym#features)
- [Motor de progresión](https://github.com/alexpcosta/opengym/blob/main/frontend/src/lib/progression.js)
- [Pruebas del motor de progresión](https://github.com/alexpcosta/opengym/blob/main/frontend/src/lib/progression.test.js)
- [Historial y modos de registro](https://github.com/alexpcosta/opengym/blob/main/frontend/src/lib/history.js)
- [Esfuerzo RIR/RPE](https://github.com/alexpcosta/opengym/blob/main/frontend/src/lib/effort.js)
- [Estimación de 1RM](https://github.com/alexpcosta/opengym/blob/main/frontend/src/lib/onerm.js)
- [Compartir planes](https://github.com/alexpcosta/opengym/blob/main/frontend/src/lib/plan-share.js)
- [Temporizador](https://github.com/alexpcosta/opengym/blob/main/frontend/src/components/RestTimer.jsx)
- [Wake Lock](https://github.com/alexpcosta/opengym/blob/main/frontend/src/lib/wakelock.js)
- [Changelog](https://github.com/alexpcosta/opengym/blob/main/CHANGELOG.md)
