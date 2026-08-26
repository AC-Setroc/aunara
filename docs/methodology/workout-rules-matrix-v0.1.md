# Matriz metodológica de rutinas — v0.1

Fecha: 25 de agosto de 2026
Estado: **Borrador para revisión; no implementado**
Alcance propuesto: personas adultas que usan Aunara para actividad física general
y entrenamiento de fuerza no clínico.

## 1. Propósito y límites

Esta matriz convierte decisiones metodológicas en reglas observables. Busca que
una propuesta de rutina sea explicable, conservadora y editable. No determina
aptitud médica, no interpreta diagnósticos y no sustituye nutrición clínica,
medicina, fisioterapia o rehabilitación.

Quedan fuera de esta versión hasta revisión específica:

- menores de 18 años;
- embarazo o posparto;
- rehabilitación de lesiones o posoperatorios;
- enfermedades diagnosticadas que requieren prescripción individual;
- preparación competitiva avanzada;
- protocolos para dolor persistente;
- nutrición terapéutica.

## 2. Niveles de decisión

| Nivel | Significado | Ejemplo |
| --- | --- | --- |
| Automático | Regla determinista validada y auditable | Filtrar un ejercicio que requiere barra cuando el usuario eligió “sin equipo” |
| Propuesta | Aunara ofrece una opción; el usuario debe revisarla | Distribución inicial de días y movimientos |
| Manual informado | La app explica, pero no lo asigna | Drop set o rest-pause |
| Revisión profesional | La app no decide por sí sola | Respuesta positiva en un cribado que exige evaluación |

## 3. Matriz de reglas de producto

### 3.1 Elegibilidad, consentimiento y cribado

| ID | Condición / entrada | Acción propuesta del sistema | Mensaje o evidencia visible | Nivel | Validación pendiente |
| --- | --- | --- | --- | --- | --- |
| ELG-01 | Edad menor de 18 | No generar rutina con esta matriz | Esta versión está diseñada para adultos | Revisión profesional | Legal y metodología |
| ELG-02 | Usuario no autoriza datos sensibles | Mantener ruta básica sin usar salud, medidas, limitaciones, síntomas ni bienestar | Indicar exactamente qué datos no se usan | Automático | Privacidad |
| ELG-03 | Datos mínimos incompletos | No generar propuesta; mostrar faltantes: objetivo, experiencia, días, tiempo y equipo | “Completá tu punto de partida” | Automático | Producto |
| SCR-01 | Inicio de una nueva ruta sugerida | Ofrecer cribado de preparación basado en una herramienta reconocida; validar licencia antes de reproducir preguntas | Explicar finalidad y límites | Propuesta | Profesional y legal |
| SCR-02 | Resultado del cribado indica consulta | No personalizar intensidad ni progresión; orientar a profesional cualificado y conservar acceso a contenido educativo básico | No afirmar diagnóstico ni “no apto” | Revisión profesional | Profesional y legal |
| SCR-03 | Nota libre de lesión/condición | Guardar y mostrar la nota; no convertirla automáticamente en exclusión clínica | “Esta nota no fue interpretada por Aunara” | Manual informado | UX writing |
| SCR-04 | Restricción estructurada vigente | Aplicar únicamente exclusiones o sustituciones aprobadas para esa etiqueta | Mostrar etiqueta, ejercicios afectados y alternativa | Automático | Entrenador/profesional |
| SCR-05 | Restricción estructurada vencida o sin fecha | Pedir confirmación antes de reutilizarla en una nueva ruta | No asumir que continúa igual | Propuesta | Profesional |

### 3.2 Selección y distribución de ejercicios

| ID | Condición / entrada | Acción propuesta del sistema | Mensaje o evidencia visible | Nivel | Validación pendiente |
| --- | --- | --- | --- | --- | --- |
| SEL-01 | Equipo “sin equipo” | Incluir solo movimientos ejecutables sin objeto, máquina, apoyo externo ni punto de suspensión | Mostrar “sin equipo real” | Automático | Auditoría del catálogo |
| SEL-02 | Ejercicio de autocarga que requiere barra/banco/cajón | Clasificarlo por el equipo requerido, no solo por fuente de resistencia | Ej.: dominada requiere barra | Automático | Auditoría del catálogo |
| SEL-03 | Equipo mixto | Usar equipo declarado y alternativas sin equipo; nunca asumir acceso a maquinaria no declarada | Enumerar equipo considerado | Automático | Catálogo |
| SEL-04 | Ruta sugerida | Priorizar patrones básicos, técnica comprensible y variedad suficiente sin complejidad innecesaria | Explicar selección por patrón y objetivo | Propuesta | Entrenador |
| SEL-05 | Sustitución por restricción o equipo | Mantener patrón/objetivo cuando sea posible y declarar el motivo | “Sustituido por equipo/restricción” | Propuesta | Entrenador |
| SEL-06 | Días disponibles | Distribuir trabajo y recuperación; evitar repetir de forma automática un mismo grupo exigente en días consecutivos | Mostrar calendario antes de aceptar | Propuesta | Entrenador |
| SEL-07 | Duración solicitada insuficiente | Reducir cantidad de movimientos antes que ocultar descansos o apurar técnica | Explicar qué se priorizó | Propuesta | Entrenador |

### 3.3 Dosis inicial por experiencia

Los rangos siguientes son **guardas propuestas**, no cifras aprobadas para código.
El revisor debe convertirlas en una tabla por objetivo y patrón.

| ID | Condición / entrada | Guarda propuesta | Automatización | Validación pendiente |
| --- | --- | --- | --- | --- |
| DOS-01 | Principiante o regreso tras pausa | Comenzar por el extremo bajo de volumen; evitar pruebas máximas y fallo voluntario | Propuesta | Entrenador/profesional |
| DOS-02 | Principiante | No asignar técnicas especiales; enseñar selección de carga con repeticiones técnicamente sólidas en reserva | Automático | Entrenador |
| DOS-03 | Intermedio | Permitir mayor variación solo si hay historial suficiente de sesiones, técnica y recuperación | Propuesta | Entrenador |
| DOS-04 | Avanzado | Mantener configuración avanzada como elección explícita; nunca inferir nivel solo por cargas altas | Manual informado | Entrenador |
| DOS-05 | Objetivo fuerza | La versión final puede priorizar cargas relativamente altas y series múltiples, pero debe progresar hacia ellas y no asumir 1RM en el inicio | Propuesta | Entrenador |
| DOS-06 | Objetivo hipertrofia | Controlar volumen semanal por grupo y distribuirlo; no saltar directamente a un umbral alto sin tolerancia demostrada | Propuesta | Entrenador |
| DOS-07 | Condición general | Priorizar adherencia, patrones principales y cobertura equilibrada sobre sofisticación | Propuesta | Entrenador |
| DOS-08 | Movilidad | No usar dolor como objetivo ni forzar rangos; ofrecer alternativas de rango tolerable | Propuesta | Profesional |
| DOS-09 | Deporte | Separar trabajo general de fuerza y complemento deportivo; no sustituir práctica técnica del deporte | Propuesta | Entrenador deportivo |

### 3.4 Esfuerzo, carga y progresión

| ID | Señal | Acción propuesta | Bloqueo / control | Validación pendiente |
| --- | --- | --- | --- | --- |
| PRG-01 | Primera exposición a un ejercicio | Pedir una carga conservadora y registrar ejecución/esfuerzo; no calcular un máximo | No sugerir 1RM | Entrenador |
| PRG-02 | Se completó el rango con técnica estable y margen objetivo en dos exposiciones comparables | Sugerir —no aplicar— un aumento pequeño dentro de un rango aprobado | Confirmación del usuario | Entrenador |
| PRG-03 | No se completa el mínimo de repeticiones o se deteriora técnica | Mantener o reducir carga/volumen; no compensar añadiendo series | Explicar regresión | Entrenador |
| PRG-04 | Dolor agudo, mareo, dolor torácico, falta de aire inusual u otra señal definida por revisión profesional | Detener la sesión y mostrar orientación prudente de atención | Sin progresión automática | Profesional/legal |
| PRG-05 | Energía/sueño/estrés desfavorables sin señal de alarma | Ofrecer mantener, reducir volumen o realizar alternativa; no cancelar ni penalizar automáticamente | Decisión del usuario | Entrenador |
| PRG-06 | Sesión omitida | Reprogramar o continuar; no duplicar dosis automáticamente | Sin castigo | Entrenador |
| PRG-07 | Carga registrada | Separar carga planeada/de referencia de la realizada en cada sesión | Historial auditable | Producto |
| PRG-08 | Sin historial suficiente | No afirmar tendencia ni recomendar progresión individual | Mostrar falta de evidencia | Automático | Producto |

La magnitud final de un incremento debe ser aprobada y versionada. Como punto de
discusión, la literatura histórica de ACSM menciona incrementos de 2–10 % cuando
se excede consistentemente el objetivo de repeticiones; Aunara no debe convertir
ese rango amplio en una regla única sin distinguir ejercicio, experiencia y
contexto.

### 3.5 Técnicas y estructuras especiales

| ID | Técnica / estructura | Regla propuesta | Explicación obligatoria | Elegibilidad inicial |
| --- | --- | --- | --- | --- |
| TEC-01 | Superserie, biserie, triserie, serie gigante | El usuario selecciona estructura y ejercicios; Aunara valida compatibilidad básica y tiempo | Orden, descanso y objetivo | Manual informado |
| TEC-02 | Preagotamiento / postagotamiento | No sugerir por defecto; advertir que altera fatiga y rendimiento del ejercicio principal | Qué se fatiga primero y por qué | Intermedio/avanzado, por revisar |
| TEC-03 | Circuito | Definir estaciones, duración/repeticiones y recuperación; no ocultar transiciones | Cómo completar una ronda | Según ejercicios, por revisar |
| TEC-04 | Contraste / complex training | No incluir en propuesta inicial; requiere criterio sobre emparejamiento, carga y velocidad | Propósito y ejecución explosiva | Avanzado/profesional |
| TEC-05 | Rest-pause / myo-reps / cluster | No asignar automáticamente; definir cada bloque de trabajo y descanso | Fatiga acumulada y criterio de finalización | Intermedio/avanzado, por revisar |
| TEC-06 | Drop set | No asignar automáticamente; cada reducción de carga debe quedar explícita | Cantidad de descargas y fin técnico | Intermedio/avanzado, por revisar |
| TEC-07 | Fallo muscular | No usar como requisito general; distinguir fallo técnico y voluntario | Cómo detener una serie segura | Revisión profesional |
| TEC-08 | Tempo, pausa, isometría o énfasis excéntrico | Mostrar notación en lenguaje natural y tiempo exacto | Ejemplo animado antes de usar | Manual informado |
| TEC-09 | Configuración personalizada | Permitir bloques ordenados, pero validar que no queden sin carga, duración, descanso o fin definidos | Resumen de la serie completa | Manual informado |

La posición de ACSM publicada en 2026 señala que la constancia y una programación
adecuada importan más que la complejidad, y que técnicas avanzadas o entrenar al
fallo no mejoran consistentemente los resultados para el adulto sano promedio.
Eso respalda mantenerlas como herramientas explícitas, no como automatismos.

### 3.6 Revisión, aceptación y transparencia

| ID | Regla | Criterio observable |
| --- | --- | --- |
| TRN-01 | Una propuesta no se activa sola | Existen acciones separadas: aceptar, editar y descartar |
| TRN-02 | Explicación antes de aceptar | Se muestran datos usados, datos ignorados, restricciones, reglas, fecha y versión |
| TRN-03 | Diferenciar manual y sugerida | La ruta manual no muestra “por qué esta sugerencia” ni precarga ejercicios |
| TRN-04 | Identificar el motor | Copy visible: reglas de Aunara; no usa la cuenta de ChatGPT del usuario |
| TRN-05 | Registrar edición humana | La explicación distingue propuesta original y cambios del usuario/entrenador |
| TRN-06 | No usar lenguaje clínico | Evitar diagnóstico, “peso ideal”, “apto/no apto”, curación o tratamiento |
| TRN-07 | Mostrar incertidumbre | No afirmar precisión individual cuando faltan historial o datos |
| TRN-08 | Versionar | Rutina conserva la versión de matriz que la generó |

## 4. Matriz de restricciones estructuradas por diseñar

Cada restricción automatizable necesita, como mínimo:

| Campo | Ejemplo no clínico | Uso permitido |
| --- | --- | --- |
| Zona | Rodilla derecha | Identificar movimientos relacionados, no diagnosticar |
| Acción o rango que molesta | Flexión profunda | Evitar/sustituir solo según reglas revisadas |
| Intensidad reportada | Leve/moderada/alta | Decidir si se pausa personalización según regla aprobada |
| Estado | Actual/en revisión/resuelta | Evitar reutilizar una restricción vencida |
| Orientación profesional | “Evitar impacto por 4 semanas” | Mostrar la nota; automatizar solo si existe una etiqueta validada equivalente |
| Fecha de revisión | 2026-09-20 | Solicitar reconfirmación |
| Texto libre | Contexto adicional | Guardar y mostrar; no interpretar clínicamente |

Antes de construir exclusiones deben definirse etiquetas estables para patrones,
articulaciones, impacto, apoyo, rango, estabilidad y equipo, y revisarse cada
relación ejercicio–etiqueta.

## 5. Casos mínimos para validar la matriz

1. Principiante, tres días, equipo mixto, sin datos sensibles.
2. Principiante, cinco días: mantener frecuencia elegida pero reducir dosis y
   complejidad, sin técnicas avanzadas.
3. Usuario que declara “sin equipo”: excluir dominadas, fondos con banco y toda
   variante que necesite apoyo u objeto.
4. Restricción estructurada activa y nota libre adicional: aplicar solo la regla
   estructurada y declarar que la nota no fue interpretada.
5. Cribado que requiere consulta: no producir una falsa autorización de inicio.
6. Ruta manual con drop set: explicar y guardar bloques, sin alterar otros
   ejercicios.
7. Dos sesiones satisfactorias: sugerir progresión, nunca aplicarla en silencio.
8. Dolor/síntoma durante sesión: detener el flujo de progresión y mostrar la
   orientación aprobada.
9. Invitación de entrenador: la metodología personal no cambia hasta aceptar
   permisos y una propuesta concreta.

## 6. Fuentes marco

- [World Health Organization — Guidelines on physical activity and sedentary behaviour](https://www.who.int/publications/i/item/9789240015128)
- [American College of Sports Medicine 2026 — Resistance Training Prescription for Muscle Function, Hypertrophy, and Physical Performance](https://pubmed.ncbi.nlm.nih.gov/41843416/)
- [ACSM 2011 — Quantity and quality of exercise for apparently healthy adults](https://pubmed.ncbi.nlm.nih.gov/21694556/)
- [PAR-Q+ and ePARmed-X+ — official implementation resources](https://eparmedx.com/)

Las fuentes orientan el marco general. La matriz operativa final requiere revisión
profesional, validación de licencias y adaptación al alcance legal del producto.

## 7. Firmas requeridas para pasar a v1.0

| Revisión | Nombre | Credencial/rol | Fecha | Resultado |
| --- | --- | --- | --- | --- |
| Programación de entrenamiento | Pendiente | Entrenador cualificado | — | Pendiente |
| Cribado y derivación | Pendiente | Profesional competente | — | Pendiente |
| Privacidad y lenguaje legal | Pendiente | Revisión jurídica Colombia | — | Pendiente |
| Producto y UX | Alejandro Cortés | Propietario de producto | — | Pendiente |

## 8. Decisiones que deben tomarse en la revisión

1. Poblaciones admitidas y excluidas en el primer lanzamiento.
2. Herramienta de cribado y condiciones de licencia.
3. Tabla cuantitativa por objetivo, experiencia y patrón.
4. Definición operativa de esfuerzo, técnica aceptable y fin de serie.
5. Rangos exactos y condiciones de progresión/regresión.
6. Señales que detienen una sesión y copy de orientación.
7. Taxonomía de restricciones automatizables.
8. Elegibilidad de cada técnica especial.
