# SDD-007 — Enmienda 1: Registro estructurado serie a serie («Tap-to-Log») y taxonomía de fatiga para analítica BI

2026-10-26 · Estado: **Propuesta para Aprobación del Operator** · v1  
Origen: `[Aunara / Antigravity]` por instrucción directa del Operator («Planteá el spec para esta mejora... NADA DE LO QUE YA FUNCIONA SE DEBE ROMPER O CAMBIAR»).  
Alineación: Enmienda aditiva sobre [SDD-007](SDD-007-ejecucion-y-seguimiento.md).

---

## 1. El problema, en el idioma del Operator

Actualmente, el registro de entrenamiento en la pantalla de ejecución captura un único valor consolidado por ejercicio (`loadKg`, `repsCompleted`, `loadNote` y `effort`). Cuando una persona entrena:
1. Las cargas o repeticiones suelen variar entre series (ej. `8/8/7 reps` o `66/72/72 kg`).
2. Para reflejar esa variación hoy se utiliza el campo de texto libre (`loadNote`).
3. **El conflicto para Business Intelligence (BI):** Cada persona escribe de forma distinta (*«8/8/7»*, *«hice 7 al final»*, *«dificultad en la última»*). Un motor de BI o un algoritmo de sobrecarga progresiva **no puede calcular datos duros** a partir de texto libre sin romperse o requerir procesamiento NLP impredecible.
4. **El conflicto en el gimnasio:** Con fatiga y sudor, el usuario no tiene tiempo ni disposición para redactar comentarios ni llenar formularios engorrosos en cada serie.

Se requiere un sistema **Tap-to-Log** de mínima fricción (1 toque por serie para confirmar) que estructure los datos numéricos de forma atómica y clasifique los motivos de finalización mediante una **taxonomía cerrada de chips**, reservando el texto libre únicamente para notas cualitativas humanas.

---

## 2. Regla Suprema de No Regresión e Invariantes

> **«NADA DE LO QUE YA FUNCIONA SE DEBE ROMPER O CAMBIAR (EXCEPTO LO QUE SE ESTÁ PLANTEANDO).»**

1. **Retrocompatibilidad absoluta (Zero Breaking Changes):**
   * Todo historial previo almacenado en `WorkoutLoadEntry` (que no tenga desglose por serie) sigue siendo 100% válido y legible sin errores ni conversiones destructivas.
   * Si un registro histórico no tiene `setsDetail`, la UI y los cálculos de BI degradan elegantemente usando `loadKg` y `repsCompleted` como hasta ahora.
2. **Invarianza de áreas no intervenidas:**
   * La biblioteca de ejercicios, el catálogo de 94 movimientos, el reproductor de animaciones, el sistema de perfiles, la autenticación y la sincronización con Supabase **quedan completamente intactos**.
3. **Persistencia inmune al segundo plano:**
   * Cada pulsación en el nuevo sistema de series actualiza el estado local de inmediato, garantizando que alternar de app o bloquear la pantalla no borre las series marcadas.

---

## 3. Modelo de Datos Aditivo (TypeScript)

Se incorporan tipos aditivos en `src/types.ts` sin alterar las propiedades existentes:

```typescript
// 1. Taxonomía cerrada de motivos/limitantes al no completar una serie o alcanzar fallo
export type WorkoutLimiterTag =
  | "muscular-failure"    // Fallo muscular concéntrico (el músculo no pudo más)
  | "cardiovascular"      // Fatiga cardiovascular / falta de aire
  | "joint-discomfort"    // Molestia o dolor articular (alerta preventiva para BI)
  | "excessive-load"      // Carga excesiva para la técnica requerida
  | "time-constraint";    // Falta de tiempo (interrupción de la serie)

// 2. Registro atómico por serie individual
export interface WorkoutSetDetail {
  setNumber: number;                     // 1, 2, 3...
  targetReps: number;                    // Reps prescritas (ej. 8)
  actualReps: number | null;             // Reps ejecutadas reales (ej. 7)
  loadKg: number | null;                 // Carga en kg (o null si es peso corporal)
  completed: boolean;                    // true si se marcó con el botón de check
  rpe?: string;                          // "RPE 7" | "RPE 8" | "RPE 9" | "Fallo técnico"
  limiterTag?: WorkoutLimiterTag;        // Chip de taxonomía cerrada (opcional)
}

// 3. Extensión aditiva de WorkoutLoadEntry (Historial acumulativo)
export interface WorkoutLoadEntry {
  id: string;
  date: string;
  loadKg: number | null;                 // Carga máxima de la sesión (mantiene compatibilidad)
  loadNote?: string;                     // Bitácora cualitativa del usuario
  setPlan: string;                       // Plan de series
  effort?: string;                       // Esfuerzo global
  repsCompleted?: number | string | null;// Repeticiones consolidadas
  setsDetail?: WorkoutSetDetail[];       // NUEVO: Array atómico de series para BI
}

// 4. Extensión aditiva de WorkoutItem (Estado de la sesión activa)
export interface WorkoutItem {
  // ... todas las propiedades existentes se conservan idénticas ...
  currentSetsDetail?: WorkoutSetDetail[]; // NUEVO: Estado en vivo de las series de hoy
}
```

---

## 4. Diseño de Interfaz UX en el Gimnasio: *«Tap-to-Log»*

Dentro de `src/components/WorkoutPanel.tsx` (exclusivamente en `mode === "training"`), se reemplaza la cuadrícula de inputs simples por la **tabla interactiva de series**:

### A. Anatomía de la Tarjeta de Ejercicio
```text
┌────────────────────────────────────────────────────────────────────────┐
│ 01   PRESS DE BANCO INCLINADO                       [ Ver técnica ▶ ]  │
│      Pectoral mayor · Barra                                            │
├────────────────────────────────────────────────────────────────────────┤
│ ✦ Indicación: Dificultad para terminar la última serie                 │
│ Objetivo: 3 series × 8 reps                                            │
├────────────────────────────────────────────────────────────────────────┤
│ SERIE   OBJETIVO         CARGA (KG)      REPS REALIZADAS      ESTADO   │
├────────────────────────────────────────────────────────────────────────┤
│   1      8 reps           [  50  ]           [  8  ]           [ ✓ ]   │
│   2      8 reps           [  50  ]           [  8  ]           [ ✓ ]   │
│   3      8 reps           [  50  ]           [  7  ]           [ ✓ ]   │
├────────────────────────────────────────────────────────────────────────┤
│ ¿Qué limitó la última serie? (1 tap):                                  │
│ ( Fatiga muscular )  ( Cardio )  ( Molestia )  ( Carga alta )          │
├────────────────────────────────────────────────────────────────────────┤
│ Esfuerzo de la sesión:                                                 │
│ [ RPE 7 ]  [ RPE 8 ]  [[ RPE 9 ]]  [ Fallo técnico ]                   │
├────────────────────────────────────────────────────────────────────────┤
│ Nota personal (opcional): [ ej. agarre abierto con magnesio          ] │
├────────────────────────────────────────────────────────────────────────┤
│ [ ✓ REGISTRAR EJERCICIO ]                     Última: 50 kg · 8 reps   │
└────────────────────────────────────────────────────────────────────────┘
```

### B. Micro-interacciones de Fricción Cero
1. **Prellenado automático:** Al iniciar la sesión, cada serie muestra precargadas las repeticiones objetivo y la última carga registrada (o `0` si es peso corporal).
2. **1-Tap confirmación:** Si el usuario completó la serie tal como estaba planificada, solo pulsa el botón `[ ✓ ]`. La fila se colorea con tinte de éxito y queda registrada.
3. **Ajuste instantáneo:** Si la carga o las reps cambiaron, toca el número, introduce el valor y pulsa `[ ✓ ]`.
4. **Aparición contextual de tags de fatiga:**
   * Si en alguna serie `actualReps < targetReps`, debajo de la tabla se despliegan automáticamente los chips de limitante para clasificar el motivo con un solo toque.
5. **Cierre del ejercicio:**
   * Al pulsar *«Registrar ejercicio»*, el sistema consolida automáticamente:
     * `loadKg` = $\max(\text{loadKg})$.
     * `repsCompleted` = serie de referencia o promedio ponderado.
     * `setsDetail` = el array completo con el detalle de cada serie.

---

## 5. Contrato de Datos para el Motor BI (Business Intelligence)

El motor analítico (consultas SQL en Supabase, vistas materializadas o módulo interno `workoutAnalytics.ts`) procesa exclusivamente campos estructurados:

| Métrica BI | Fórmula / Algoritmo | Utilidad de Producto |
| :--- | :--- | :--- |
| **Tonelaje de sesión** | $\sum (\text{loadKg}_i \times \text{actualReps}_i)$ | Carga volumétrica real movida por músculo/día. |
| **Tasa de Adherencia** | $\frac{\sum \text{actualReps}}{\sum \text{targetReps}} \times 100$ | Porcentaje de cumplimiento del volumen prescrito. |
| **Fuerza Estimada (e1RM)** | $\max \left( \text{loadKg}_i \times \left(1 + \frac{\text{actualReps}_i}{30}\right) \right)$ | Progresión de fuerza sin necesidad de testear 1RM real. |
| **Curva de Fatiga Intra-Serie** | $\frac{\text{actualReps}_1 - \text{actualReps}_n}{\text{actualReps}_1} \times 100$ | Detectar caídas excesivas de rendimiento entre series. |
| **Índice de Alerta Médica** | `COUNT(limiterTag == 'joint-discomfort')` | Notificar al usuario/coach para desescalar volumen. |

---

## 6. Allowlist Quirúrgica de Archivos

Para asegurar que **NADA** fuera de scope sea afectado, los cambios se limitan a:

1. `src/types.ts`: Incorporación de `WorkoutSetDetail` y `WorkoutLimiterTag`.
2. `src/components/WorkoutPanel.tsx`: Componente de tabla de series en `mode === "training"` y lógica de chips.
3. `src/styles.css`: Estilos visuales con tokens AC | Setroc para la tabla de series y los chips de limitantes.
4. `src/lib/cloudSnapshot.ts`: Aseguramiento de que `setsDetail` se conserve en la reconciliación y guardado en la nube.
5. Pruebas unitarias: `src/components/WorkoutPanel.test.tsx` y pruebas de regresión en `src/components/AppFlows.test.tsx`.

---

## 7. Criterios de Aceptación Falsables (Testing)

* **CA-01 (Retrocompatibilidad):** Cuentas con historial sin `setsDetail` abren el panel de entrenamiento y cargan su historial sin advertencias ni errores en consola.
* **CA-02 (Tap-to-Log):** Tocar `[ ✓ ]` en una serie sin editar sus inputs confirma la serie con los valores prescritos por defecto.
* **CA-03 (Edición granular):** Editar la Serie 3 a `7 reps` y `50 kg` preserva la Serie 1 y Serie 2 con `8 reps` y `50 kg`.
* **CA-04 (Chips de taxonomía):** Al seleccionar un chip de limitante (ej. `muscular-failure`), el tag queda guardado en la serie correspondiente.
* **CA-05 (Consistencia BI):** El botón de registrar guarda en `loadHistory` tanto las propiedades heredadas (`loadKg`, `repsCompleted`) como el array `setsDetail`.
* **CA-06 (Regresión cero):** La suite completa de 390 pruebas continúa pasando en verde (100%).
