# Plan de trabajo vivo — feedback de entrenador y cierre del producto personal

Fecha de creación: 25 de agosto de 2026
Estado general: **Planificación y aprobación**
Fuente: feedback escrito y decisiones posteriores del propietario del producto.

## 1. Cómo se usa este plan

Cada ítem tiene un identificador estable, un entregable y una condición de
cierre. Los estados permitidos son:

- `Pendiente`: no iniciado;
- `En definición`: requiere decisión o diseño;
- `Listo para implementar`: aprobado y sin dependencias abiertas;
- `En implementación`;
- `En UAT`;
- `Completado`: verificado contra sus criterios;
- `Pausado`: decisión explícita, no abandono silencioso.

No se implementa una propuesta visual o metodológica antes de aprobar su puerta
de decisión. El plan debe actualizarse al terminar cada bloque, junto con el
enlace a su evidencia.

## 2. Traducción del feedback a trabajo trazable

| ID | Observación | Decisión de producto | Trabajo resultante | Prioridad | Estado |
| --- | --- | --- | --- | --- | --- |
| FB-01 | La biblioteca de ejercicios es una fortaleza | Conservarla | Crear pruebas de regresión de búsqueda, filtros, detalle e idioma | Alta | Pendiente |
| FB-02 | GIFs e instrucciones facilitan entender el ejercicio | Conservar la experiencia y migrar a material propio | Continuar directorio bilingüe, derechos de medios y animaciones Aunara | Alta | En definición |
| FB-03 | Revisar terminología técnica | Validación editorial con entrenador | Exportar términos, revisar ES/EN, registrar aprobador y versión | Alta | Pendiente |
| FB-04 | El home y la ruta sugerida son confusos | Rediseñar alrededor de la siguiente acción | Aprobar arquitectura, prototipo y estados del home autenticado | Crítica | En definición |
| FB-05 | Una sugerencia directa puede ser riesgosa para principiantes | Reforzar metodología, transparencia y controles | Matriz de reglas, cribado, límites, progresión y revisión profesional | Crítica | En definición |
| FB-06 | El entrenador debería controlar su grupo | Mantener registro autónomo + invitación del entrenador | Diseñar invitación, consentimiento, permisos y salida; implementar después del producto personal | Media/futura | Pausado |
| FB-07 | Validar la experiencia móvil | UAT web instalable ahora; nativa después | Matriz de dispositivos y pruebas de flujos críticos | Alta | Pendiente |
| FB-08 | Definir onboarding | El perfil inicial debe producir una propuesta revisable | Diseñar continuidad perfil → propuesta → aceptar/editar/descartar | Crítica | En definición |

## 3. Fases y puertas de aprobación

### Fase 0 — Gobierno de fuente y documentación

Objetivo: que GitHub tenga una fuente canónica y trazable, separada del sitio
compilado.

| ID | Tarea | Dependencia | Criterio de cierre | Estado |
| --- | --- | --- | --- | --- |
| GOV-01 | Aprobar repositorio fuente privado | Decisión del propietario | Nombre, visibilidad y responsables definidos | Completado |
| GOV-02 | Conectar el proyecto local al repositorio fuente | GOV-01 | Remoto configurado y rama principal creada | Completado |
| GOV-03 | Revisar y organizar cambios locales actuales | GOV-01 | Cambios agrupados, probados y documentados sin incluir secretos | Completado |
| GOV-04 | Publicar código fuente, specs y documentación | GOV-02, GOV-03 | GitHub contiene una versión reproducible y los documentos activos | Completado |
| GOV-05 | Actualizar documentación antigua de Repbook/OpenAI Sites | GOV-04 | Nombre, hosting, estado y fechas coherentes con Aunara/GitHub Pages | Pendiente |
| GOV-06 | Definir relación fuente → GitHub Pages | GOV-04 | Despliegue documentado, verificable y reversible | Pendiente |
| GOV-07 | Proteger la rama principal | GOV-04 | Revisión requerida y verificación obligatoria antes de integrar | Pendiente |

**Estado actual verificado:** `AC-Setroc/AC-Setroc.github.io` conserva la
compilación pública y `AC-Setroc/aunara-app` fue creado como repositorio fuente
privado. El bootstrap y el CI pasaron en una instalación limpia. La protección
de la rama y la automatización de publicación permanecen como tareas separadas.

### Fase 1 — Propuesta de home autenticado

| ID | Tarea | Entregable / criterio de cierre | Estado |
| --- | --- | --- | --- |
| UX-01 | Mapear estados del usuario | Estados nuevos, propuesta pendiente, día de entrenamiento, descanso e invitación | Completado en propuesta |
| UX-02 | Aprobar jerarquía de información | Una acción principal por estado; catálogo y rutas fuera del foco del home | En definición |
| UX-03 | Crear wireframes móvil y escritorio | Flujos completos y responsive, incluidos vacíos/errores | En UAT |
| UX-04 | Prototipo navegable | Onboarding → propuesta → entrenamiento probado sin código productivo | En UAT |
| UX-05 | Revisión de accesibilidad y copy | Idioma completo ES/EN, foco, lectura y estados claros | Pendiente |

**Puerta A:** Alejandro aprueba UX-02 a UX-05 antes de modificar el home.

### Fase 2 — Seguridad metodológica

| ID | Tarea | Entregable / criterio de cierre | Estado |
| --- | --- | --- | --- |
| MET-01 | Documentar el motor actual | Entradas, reglas, exclusiones, salidas y límites auditables | Parcial |
| MET-02 | Diseñar cribado previo | Flujo, licencias, derivación y ruta básica sin salud | En definición |
| MET-03 | Estructurar restricciones | Campos automáticos separados de notas libres no interpretadas | En definición |
| MET-04 | Matriz por objetivo y experiencia | Volumen, esfuerzo, frecuencia, descanso, progresión y regresión versionados | En definición: v0.1 |
| MET-05 | Política de técnicas avanzadas | Elegibilidad, advertencias y prohibición automática en principiantes | En definición |
| MET-06 | Explicación de cada propuesta | Datos usados/ignorados, reglas, versión, fecha y decisiones disponibles | En definición |
| MET-07 | Revisión profesional | Firma de revisión, observaciones resueltas y versión aprobada | Pendiente |
| MET-08 | Copy de seguridad | Mensajes no diagnósticos, criterios de detención y consulta profesional | Pendiente |

**Puerta B:** revisión del entrenador y del profesional competente; aprobación de
MET-02 a MET-08 antes de cambiar el generador de rutinas.

### Fase 3 — Implementación del producto personal

Esta fase comienza solo después de las puertas A y B.

| ID | Tarea | Dependencia | Criterio de cierre | Estado |
| --- | --- | --- | --- | --- |
| DEV-01 | Implementar estados del nuevo home | Puerta A | Pruebas por estado en móvil y escritorio | Pendiente |
| DEV-02 | Implementar revisión de propuesta inicial | Puertas A y B | Aceptar, editar y descartar sin activación silenciosa | Pendiente |
| DEV-03 | Separar ruta manual y sugerida | Puerta A | La manual no explica ni agrega sugerencias | Pendiente |
| DEV-04 | Implementar guardas metodológicas | Puerta B | Reglas y derivaciones coinciden con la matriz aprobada | Pendiente |
| DEV-05 | Mostrar transparencia de reglas | Puerta B | Cada propuesta identifica datos, límites y versión | Pendiente |
| DEV-06 | Completar traducción de interfaz/ejercicios | FB-03 | Sin mezcla involuntaria de idiomas; pendientes visibles y medibles | En curso previo |
| DEV-07 | Proteger funcionalidades existentes | FB-01, FB-02 | Biblioteca, filtros, previews, rutas y cuenta pasan regresión | Pendiente |

### Fase 4 — UAT y salida del producto personal

| ID | Prueba | Cobertura mínima | Criterio de cierre | Estado |
| --- | --- | --- | --- | --- |
| UAT-01 | Cuenta limpia | Registro, correo, login, recuperación y perfil inicial | Sin bloqueo ni datos heredados | Pendiente |
| UAT-02 | Propuesta inicial | Ver, entender, editar, descartar y aceptar | Ninguna ruta se activa sin decisión | Pendiente |
| UAT-03 | Rutina manual | Días, búsqueda, previews, estructuras, técnicas y edición | Sin ejercicios sugeridos de forma oculta | Pendiente |
| UAT-04 | Entrenamiento del día | Inicio, carga realizada, notas, finalización e historial | Plan y registro del día no se confunden | Pendiente |
| UAT-05 | Seguridad | Restricciones, síntomas, ruta básica y derivación | Coincide con metodología aprobada | Pendiente |
| UAT-06 | Móvil | iPhone Safari/PWA y Android Chrome/PWA | Flujos críticos completos y legibles | Pendiente |
| UAT-07 | Escritorio | Safari/Chrome en tamaños acordados | Sin regresiones funcionales | Pendiente |
| UAT-08 | Datos y privacidad | Separación entre usuarios, exportación, revocación y borrado | Evidencia de aislamiento y eliminación | Pendiente |

### Fase 5 — Entrenador y marca blanca (posterior)

Esta fase queda deliberadamente pausada hasta cerrar el UAT personal.

| ID | Alcance futuro | Condición mínima |
| --- | --- | --- |
| COACH-01 | Perfil y espacio del entrenador | Roles y términos específicos aprobados |
| COACH-02 | Invitación del entrenador al usuario | Identidad verificable, expiración y rechazo |
| COACH-03 | Consentimiento granular | Usuario elige qué comparte y puede revocar |
| COACH-04 | Grupo de entrenados | Solo usuarios que aceptaron invitación |
| COACH-05 | Rutinas y seguimiento | Permisos separados para ver, proponer y editar |
| COACH-06 | Auditoría | Registro de accesos y cambios del entrenador |
| COACH-07 | Marca blanca | Límites de marca sin ocultar responsable, privacidad ni control del usuario |

## 4. Secuencia recomendada inmediata

1. Aprobar o ajustar la propuesta de home y seguridad metodológica.
2. Autorizar la creación del repositorio fuente privado.
3. Crear wireframes/prototipo sin tocar la aplicación productiva.
4. Construir la matriz metodológica con el entrenador y revisión competente.
5. Aprobar puertas A y B.
6. Implementar en bloques pequeños: home, propuesta inicial, guardas y
   transparencia.
7. Ejecutar regresión y UAT en dos celulares y escritorio.
8. Cerrar el producto personal y recién entonces reactivar la fase entrenador.

## 5. Registro de avance

| Fecha | Cambio | Evidencia | Responsable |
| --- | --- | --- | --- |
| 2026-08-25 | Feedback convertido en backlog y fases | Este documento | Producto |
| 2026-08-25 | Flujo coach fijado como registro + invitación | Decisión del propietario | Producto |
| 2026-08-25 | Auditoría inicial de GitHub | Sección Fase 0 | Desarrollo |
| 2026-08-25 | Repositorio fuente privado creado y conectado | `AC-Setroc/aunara-app` | Desarrollo |
| 2026-08-25 | Prototipo responsive del home preparado para revisión | `prototypes/authenticated-home-v1/` | Diseño/producto |
| 2026-08-25 | Matriz metodológica v0.1 creada | `docs/methodology/workout-rules-matrix-v0.1.md` | Producto/metodología |
| 2026-08-25 | Fuente publicada y verificada en CI | GitHub Actions `Verify source` | Desarrollo |

## 6. Definición de “terminado” de esta etapa

La etapa personal queda terminada cuando:

- el home y la propuesta inicial fueron aprobados e implementados;
- las reglas metodológicas están versionadas y revisadas;
- el usuario entiende por qué recibió una propuesta y conserva el control;
- el modo manual no genera contenido no solicitado;
- las funciones ya validadas no sufrieron regresiones;
- los flujos críticos pasan UAT en iPhone, Android y escritorio;
- GitHub conserva fuente, documentación, pruebas y un despliegue reproducible;
- los pendientes del entrenador quedan documentados, pero fuera del cierre
  personal.
