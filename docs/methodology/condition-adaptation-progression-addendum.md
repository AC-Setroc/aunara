# Anexo para la próxima revisión — condiciones, adaptación y progreso

Fecha: 26 de agosto de 2026
Estado: **Insumo para v0.2; no implementado**

## 1. Hallazgo principal

Aunara no debe seleccionar una lista de ejercicios únicamente a partir del
nombre de una condición médica. Una condición puede modificar:

- la elegibilidad para una sugerencia automatizada;
- la necesidad de revisión profesional;
- modalidad, intensidad, volumen, descanso y progresión;
- demandas de los ejercicios que pueden aceptarse;
- preparación, seguimiento y criterios para detener la sesión.

Solo después de aplicar esas decisiones se seleccionan ejercicios compatibles
con el objetivo, el equipo, la experiencia y las restricciones aprobadas.

## 2. Estado actual del producto

| Tema | Capacidad actual | Límite identificado |
| --- | --- | --- |
| Condiciones médicas | Cribado general de dolor/presión torácica, mareo, supervisión médica y preocupación musculoesquelética | No registra ni aplica perfiles específicos como hipertensión |
| Lesiones/molestias | Área, lado, estado, valoración profesional y ocho restricciones de movimiento | La detección depende de palabras del ejercicio; no modela carga, rango o demanda articular |
| Experiencia | El perfil registra principiante, intermedio o avanzado | La dosificación generada aún no cambia realmente por experiencia |
| Recuperación | Sueño, energía y estrés producen orientación visible | No ajustan automáticamente una sesión dentro de límites metodológicos |
| Progreso | Guarda carga, plan y fecha por ejercicio | No interpreta esfuerzo, técnica, dolor o tolerancia para sugerir progresión |

Por tanto, la app no debe comunicar que una rutina actual está adaptada a
hipertensión ni que realiza rehabilitación de una lesión.

## 3. Modelo propuesto para condiciones médicas

### 3.1 Datos sensibles, opcionales y estructurados

Cuando el usuario lo autorice, el perfil puede registrar:

- condición informada por el usuario;
- estado: controlada, en revisión o desconocida;
- indicación de entrenar con supervisión;
- instrucciones profesionales concretas;
- fecha y vigencia de la revisión;
- señales o efectos relevantes que el usuario deba vigilar.

El sistema no diagnostica, valida recetas ni interpreta nombres de medicamentos.
El acceso de un futuro entrenador requiere consentimiento granular adicional.

### 3.2 Decisión antes de seleccionar ejercicios

| Estado | Resultado permitido |
| --- | --- |
| Síntoma de alarma o supervisión indicada | Pausar sugerencia y orientar a valoración profesional |
| Condición diagnosticada sin estado/revisión suficiente | No afirmar adaptación específica; solicitar revisión |
| Condición estable con orientación profesional vigente | Aplicar únicamente un perfil metodológico revisado |
| Sin autorización de salud | Generar ruta básica sin afirmar adaptación clínica |

El flujo puede basarse en una herramienta de cribado reconocida, como PAR-Q+,
solo después de revisar licencia, versión oficial y traducción autorizada.

## 4. Hipertensión como primer caso de trabajo

La hipertensión afecta principalmente la dosificación, la vigilancia y la forma
de ejecutar; no crea por sí sola una lista universal de ejercicios.

### 4.1 Perfil propuesto, sujeto a revisión profesional

Para una persona adulta que informa hipertensión estable y autorización para
entrenar, la matriz debería evaluar:

- predominio de actividad aeróbica moderada y progresiva;
- resistencia dinámica moderada como complemento;
- calentamiento y vuelta a la calma suficientes;
- respiración continua y educación para evitar contención involuntaria;
- aumento gradual de frecuencia/duración antes de exigir mayor intensidad;
- transiciones de posición prudentes cuando se reporten mareos;
- respuesta a síntomas y a instrucciones profesionales individuales.

No se deben asignar automáticamente:

- pruebas máximas o estimación inicial de 1RM;
- series al fallo;
- rest-pause, drop sets, clusters o complejos exigentes;
- incrementos bruscos de carga o intensidad;
- isometrías exigentes sin validación específica;
- ejercicios cuya ejecución dependa de una maniobra prolongada de contención de
  la respiración.

La app no debe diagnosticar con una medición aislada ni inventar umbrales para
autorizar o cancelar entrenamiento. Los umbrales operativos, si se incorporan,
deben provenir de revisión clínica y quedar versionados.

### 4.2 Fuentes marco

- [AHA/ACC — 2025 High Blood Pressure Guideline](https://professional.heart.org/en/science-news/2025-high-blood-pressure-guideline/top-things-to-know)
- [ACSM — Exercise for the Prevention and Treatment of Hypertension](https://acsm.org/exercise-for-the-prevention-and-treatment-of-hypertension/)
- [PAR-Q+ y ePARmed-X+ — recursos oficiales](https://eparmedx.com/)

Estas fuentes apoyan actividad moderada, combinación de ejercicio aeróbico y de
resistencia cuando corresponda, progresión y cribado. No sustituyen el diseño y
la aprobación de reglas específicas para Aunara.

## 5. Lesiones y molestias

### 5.1 Qué puede automatizarse

- bloquear una sugerencia ante una limitación reciente o no revisada;
- excluir demandas de movimiento que el usuario o un profesional identificaron;
- mostrar qué ejercicio fue excluido, por qué y cuál lo reemplazó;
- conservar fecha, estado y vigencia de la restricción;
- permitir reducir rango, impacto, carga, estabilidad o complejidad cuando
  exista una regla previamente revisada.

### 5.2 Qué no puede automatizarse

- interpretar un diagnóstico o nota libre;
- concluir que una articulación está rehabilitada;
- convertir dolor en una recomendación de “trabajarlo” o ignorarlo;
- inferir una autorización profesional;
- sustituir ejercicios solo porque entrenan el mismo músculo.

### 5.3 Taxonomía requerida por ejercicio

Cada movimiento debe recibir etiquetas revisadas de:

- articulaciones y patrones principales;
- rango de movimiento y posibilidad de limitarlo;
- impacto;
- carga axial;
- demanda de estabilidad y equilibrio;
- unilateralidad;
- trabajo sobre la cabeza;
- necesidad de bracing/contención;
- equipo y puntos de apoyo;
- regresiones y alternativas equivalentes.

La clasificación actual por coincidencia de palabras debe considerarse temporal.
La sustitución final debe comparar patrón, objetivo y demandas, no únicamente
músculo o nombre.

## 6. Adaptación y acondicionamiento

La experiencia declarada no es suficiente. La fase debe considerar práctica
reciente, consistencia, tiempo sin entrenar, tolerancia y recuperación.

| Fase | Propósito | Guardas propuestas |
| --- | --- | --- |
| Familiarización | Aprender técnica y conocer tolerancia | Bajo volumen, carga conservadora, sin fallo ni técnicas avanzadas |
| Base de acondicionamiento | Sostener frecuencia y dominar patrones | Progresar primero consistencia y ejecución |
| Progresión | Mejorar capacidad específica | Cambiar una variable por vez y confirmar cada sugerencia |
| Mantenimiento | Conservar capacidad con disponibilidad limitada | Volumen mínimo efectivo validado, sin penalización |
| Reacondicionamiento | Volver tras pausa, enfermedad o cambio relevante | Reducir dosis y revalidar técnica/tolerancia |

La duración y los rangos cuantitativos de cada fase quedan pendientes del
feedback del entrenador y de revisión profesional cuando exista una condición.

## 7. Progreso, mantenimiento y regresión

### 7.1 Datos mínimos por ejercicio y sesión

- series, repeticiones y carga realmente ejecutadas;
- esfuerzo percibido o repeticiones en reserva;
- calidad técnica autoinformada o validada por entrenador;
- dolor/molestia y momento en que apareció;
- motivo de una serie omitida o incompleta;
- duración y finalización de la sesión;
- recuperación posterior relevante.

### 7.2 Regla general de progreso

Aunara puede **sugerir**, nunca aplicar silenciosamente, una progresión cuando:

1. se completa el rango previsto en exposiciones comparables;
2. la técnica permanece estable;
3. existe el margen de esfuerzo esperado;
4. no aparece dolor o señal de alarma;
5. la recuperación permite sostener el cambio.

La progresión cambia una sola variable prioritaria: repeticiones, carga, series,
duración o complejidad. Los rangos exactos deben ser aprobados y versionados.

### 7.3 Mantenimiento o regresión

- Mantener si se cumple parcialmente el plan pero no existe margen consistente.
- Reducir carga, volumen, rango o complejidad si se deteriora la técnica.
- Sustituir o detener ante dolor o síntomas según la regla aprobada.
- Reacondicionar después de una pausa relevante; no retomar automáticamente la
  última carga completa.
- Una sesión omitida no se compensa duplicando trabajo.

### 7.4 Cómo se comunica el progreso

El progreso no se limita al peso corporal. Debe mostrar por separado:

- adherencia y regularidad;
- rendimiento y cargas;
- técnica y tolerancia;
- recuperación y bienestar;
- movilidad o capacidad específica cuando corresponda;
- medidas corporales voluntarias en ventanas prudentes, no como exigencia
  semanal.

## 8. Decisiones pendientes antes de v0.2

1. Feedback completo del entrenador sobre la v0.1.
2. Revisor competente para hipertensión y criterios de derivación.
3. Alcance de condiciones admitidas en el primer lanzamiento.
4. Instrumento de cribado y licencia.
5. Taxonomía biomecánica del directorio de ejercicios.
6. Rangos cuantitativos por fase, objetivo y experiencia.
7. Definición operativa de esfuerzo, técnica aceptable y dolor.
8. Datos mínimos para progreso y política de sugerencias.

Hasta resolver estas decisiones, ninguna condición médica debe cambiar
automáticamente el generador productivo.
