# Propuesta para aprobación — home autenticado y seguridad metodológica

Fecha: 25 de agosto de 2026
Estado: **Propuesta; no implementada**

## 1. Decisión de producto que no cambia

Aunara debe servir primero a la persona que entrena de manera independiente y,
en una etapa posterior, permitirle vincularse con un entrenador. El flujo del
entrenador será:

1. el usuario crea y controla su cuenta;
2. el entrenador envía una invitación;
3. el usuario revisa qué relación y datos autoriza;
4. el usuario acepta o rechaza;
5. el usuario puede retirarse del grupo y revocar el acceso.

El entrenador no será un requisito para usar Aunara y la futura modalidad de
marca blanca no reemplazará la identidad ni el control de datos del usuario.

## 2. Problemas que esta propuesta resuelve

### Home autenticado

El home actual comunica la marca, pero no deja suficientemente claro cuál es la
siguiente acción útil. También compiten en la misma pantalla rutas, catálogo,
perfil y mensajes de producto.

### Seguridad metodológica

La aplicación puede producir una rutina que parezca una prescripción precisa,
aunque su motor actual es un conjunto de reglas generales. Esto es especialmente
delicado para principiantes, personas con síntomas o limitaciones y usuarios que
no saben escoger carga, esfuerzo o progresión.

## 3. Principios de diseño

1. **Una siguiente acción dominante.** El home responde “¿qué me corresponde
   ahora?” antes de presentar navegación secundaria.
2. **Propuesta, no diagnóstico.** Aunara organiza y propone un punto de partida;
   no diagnostica, rehabilita ni sustituye criterio profesional.
3. **Transparencia accionable.** Cada propuesta explica qué datos y reglas la
   produjeron, sus límites y qué puede editarse.
4. **Autonomía con frenos sensatos.** El usuario conserva el control, pero la app
   no normaliza dolor, síntomas de alarma ni métodos avanzados para principiantes.
5. **Privacidad por defecto.** El modo personal funciona sin entrenador. Una
   futura invitación no amplía el acceso hasta que el usuario la acepte.

## 4. Nueva arquitectura del home autenticado

El contenido principal cambia según el estado real de la persona:

| Estado | Acción principal | Información secundaria |
| --- | --- | --- |
| Perfil inicial incompleto | Completar mi punto de partida | Qué falta y por qué se solicita |
| Perfil completo, sin ruta | Revisar mi propuesta inicial | Objetivo, disponibilidad y límites usados |
| Propuesta pendiente | Aceptar, editar o descartar | Razones, cautelas y cambios permitidos |
| Día con entrenamiento | Iniciar entrenamiento de hoy | Duración, foco, preparación y estado previo |
| Día de descanso | Ver próxima sesión | Recuperación y resumen de la semana |
| Sin ruta activa | Crear una ruta | Manual o sugerida |
| Invitación de entrenador pendiente | Revisar invitación | Identidad, alcance y datos solicitados; nunca bloquea el modo personal |

### Estructura móvil propuesta

```text
┌────────────────────────────────┐
│ Aunara                 Perfil  │
│ Buenos días, Alejandro         │
│                                │
│ TU SIGUIENTE PASO              │
│ [ Iniciar entrenamiento ]      │
│ Tren inferior · 55 min         │
│                                │
│ Antes de empezar               │
│ Energía · molestias · cambios  │
│                                │
│ Esta semana                    │
│ 2 de 5 sesiones · próxima: M   │
│                                │
│ Recuperación / progreso breve  │
└────────────────────────────────┘
  Hoy       Plan      Progreso   Más
```

En escritorio se conserva la misma jerarquía en dos columnas: acción y contexto
a la izquierda; semana, recuperación y progreso a la derecha. El catálogo de
ejercicios y la administración de rutas viven en secciones propias, no como el
contenido dominante del home.

## 5. Flujo de propuesta inicial

Después de completar los datos requeridos, el siguiente paso obligatorio es una
vista de revisión, no la creación silenciosa de una ruta:

1. **Resumen de contexto:** objetivo, experiencia, tiempo, frecuencia, equipo y
   restricciones estructuradas usadas.
2. **Propuesta visible completa:** días, ejercicios, volumen inicial, descansos
   y orientación para seleccionar esfuerzo/carga.
3. **Por qué se propuso:** reglas aplicadas y datos que no pudieron evaluarse.
4. **Decisión:** `Aceptar y activar`, `Editar antes de activar` o `Descartar`.
5. **Confirmación:** la ruta solo queda activa después de una decisión expresa.

Una ruta creada manualmente no debe mostrar “por qué esta sugerencia” ni cargar
ejercicios automáticamente.

## 6. Marco de seguridad metodológica

### 6.1 Qué puede automatizar Aunara

- filtrar por equipo realmente disponible;
- adaptar la selección a objetivo, experiencia, días y duración;
- excluir ejercicios mediante restricciones **estructuradas y revisadas**;
- distribuir trabajo y recuperación con reglas conservadoras;
- explicar la propuesta y permitir editarla antes de activarla;
- sugerir progresiones graduales basadas en ejecución registrada, esfuerzo y
  recuperación, una vez que esas reglas sean validadas.

### 6.2 Qué no debe afirmar ni automatizar

- interpretar clínicamente texto libre sobre lesiones o enfermedades;
- diagnosticar, tratar, rehabilitar o indicar que una persona está “apta”;
- convertir IMC u otra medida aislada en diagnóstico;
- recomendar automáticamente técnicas avanzadas como drop sets, rest-pause,
  series al fallo o complejos a principiantes;
- aumentar carga si hay dolor, síntomas de alarma, deterioro técnico o mala
  recuperación;
- presentar cantidades generadas como una prescripción individual de salud.

### 6.3 Controles antes de proponer una rutina

1. **Disponibilidad y experiencia:** objetivo, días, minutos, equipo y nivel.
2. **Preparación para actividad:** incorporar un cuestionario de cribado basado
   en una herramienta reconocida y licenciable, como PAR-Q+, sin copiar ni
   modificar formularios protegidos sin validar sus condiciones de uso.
3. **Restricciones estructuradas:** zona, movimiento que agrava, lado, estado,
   profesional que orienta y fecha de revisión.
4. **Texto libre:** se conserva como nota privada y se muestra para revisión,
   pero no se interpreta como regla médica.
5. **Ruta alternativa:** si la persona no autoriza datos sensibles, Aunara sigue
   permitiendo una ruta básica y no personalizada por salud.

Si el cribado indica que se necesita valoración, la app no concluye un
diagnóstico: pausa la personalización sensible, explica el motivo y orienta a
consultar un profesional cualificado.

### 6.4 Controles dentro de la rutina

- empezar con una dosis conservadora para principiantes;
- mostrar una guía de esfuerzo percibido y repeticiones en reserva, sin convertir
  la primera sesión en una prueba máxima;
- enseñar criterios de técnica y una regla visible para detener el ejercicio si
  aparece dolor agudo, mareo, falta de aire inusual u otro síntoma preocupante;
- separar `carga de referencia` de `carga realizada hoy`;
- progresar una sola variable por vez cuando el desempeño y la recuperación lo
  justifiquen;
- exigir elección manual y explicación para técnicas especiales;
- mantener historial y permitir reducir, sustituir o saltar sin penalización.

Las cifras concretas de volumen, esfuerzo, descansos y progresión deben quedar
en una tabla metodológica versionada y ser revisadas con un profesional de
entrenamiento antes de implementarse.

### 6.5 Transparencia de la recomendación

Cada propuesta debe declarar:

- “Generada con reglas de Aunara; no con tu cuenta de ChatGPT”.
- los datos usados;
- las restricciones aplicadas;
- los datos ignorados o no interpretables;
- la versión del conjunto de reglas;
- la fecha de generación;
- que el usuario puede editar, descartar o pedir revisión profesional.

## 7. Evidencia de referencia

Esta propuesta usa las fuentes como marco, no como sustituto de una revisión
profesional del producto:

- [OMS — guías sobre actividad física y conducta sedentaria](https://www.who.int/publications/i/item/9789240015128)
- [ACSM 2026 — posición sobre prescripción de entrenamiento de resistencia](https://pubmed.ncbi.nlm.nih.gov/41843416/)
- [PAR-Q+ y ePARmed-X+ — sitio oficial](https://eparmedx.com/)

Los lineamientos coinciden en individualizar según salud, capacidad, experiencia
y objetivos; progresar gradualmente; y derivar cuando el cribado lo requiera.

## 8. Criterios de aceptación antes de implementar

- [ ] Se aprueba la jerarquía del home y sus estados.
- [ ] Se aprueba el flujo de aceptar, editar o descartar la propuesta inicial.
- [ ] Un entrenador revisa la taxonomía y las reglas de rutina.
- [ ] Un profesional competente revisa el cribado y los mensajes de derivación.
- [ ] Se versiona una matriz de reglas con objetivo, nivel, volumen, intensidad,
      recuperación, progresión, regresión y exclusiones.
- [ ] Se define qué restricciones son estructuradas y cuáles quedan solo como
      notas no interpretadas.
- [ ] UX writing revisa todos los mensajes para evitar diagnóstico, alarma o
      falsa precisión.
- [ ] La revisión incluye móvil, escritorio, modo personal y futura invitación,
      sin implementar todavía el portal del entrenador.

## 9. Decisiones solicitadas al aprobar esta propuesta

1. Confirmar que el home se centre en la siguiente acción y no en el catálogo.
2. Confirmar que toda propuesta inicial necesite aceptación expresa.
3. Confirmar que técnicas avanzadas nunca se asignen automáticamente a un
   principiante.
4. Aprobar que el texto libre de salud no se interprete automáticamente.
5. Definir quién hará la revisión metodológica profesional previa a código.
