import type {
  LanguageCode,
  SpecialTechniqueKind,
  SpecialWorkoutPrescription,
  WorkoutStructureType,
  WorkoutTechniqueBlock,
  WorkoutWorkBlock,
} from "../types";

export interface LocalizedOption<T extends string> {
  value: T;
  label: [string, string];
  description?: [string, string];
}

export const WORKOUT_STRUCTURE_OPTIONS: LocalizedOption<WorkoutStructureType>[] = [
  { value: "single", label: ["Single set", "Monoserie"] },
  { value: "superset", label: ["Superset", "Superserie"] },
  { value: "biset", label: ["Bi-set", "Biserie"] },
  { value: "triset", label: ["Tri-set", "Triserie"] },
  { value: "giant-set", label: ["Giant set", "Serie gigante"] },
  { value: "pre-exhaustion", label: ["Pre-exhaustion", "Preagotamiento"] },
  { value: "post-exhaustion", label: ["Post-exhaustion", "Postagotamiento"] },
  { value: "circuit", label: ["Circuit", "Circuito"] },
  { value: "contrast-complex", label: ["Contrast / complex", "Contraste / complex training"] },
];

export const SPECIAL_TECHNIQUE_OPTIONS: LocalizedOption<SpecialTechniqueKind>[] = [
  {
    value: "rest-pause",
    label: ["Rest-pause", "Rest-pause"],
    description: [
      "Breaks one demanding set into mini-sets separated by very short rests.",
      "Divide una serie exigente en bloques de trabajo separados por descansos muy cortos.",
    ],
  },
  {
    value: "drop-set",
    label: ["Drop set", "Drop set"],
    description: [
      "Continue the set after reducing the load one or more times.",
      "Continúa la serie reduciendo la carga una o más veces y con poca o ninguna pausa.",
    ],
  },
  {
    value: "cluster",
    label: ["Cluster set", "Cluster set"],
    description: [
      "Adds brief planned rests between small groups of repetitions.",
      "Agrega descansos breves y planificados entre pequeños grupos de repeticiones.",
    ],
  },
  {
    value: "myo-reps",
    label: ["Myo-reps", "Myo-reps"],
    description: [
      "Uses an activation set followed by short-rest mini-sets.",
      "Combina una serie de activación con miniseries posteriores y descansos cortos.",
    ],
  },
  {
    value: "paused-reps",
    label: ["Paused repetitions", "Repeticiones pausadas"],
    description: [
      "Holds a deliberate pause at a defined point of each repetition.",
      "Incluye una pausa deliberada en un punto definido de cada repetición.",
    ],
  },
  {
    value: "tempo",
    label: ["Controlled tempo", "Tempo controlado"],
    description: [
      "Defines the duration of the eccentric, pause and concentric phases.",
      "Define la duración de las fases excéntrica, pausa y concéntrica del movimiento.",
    ],
  },
  {
    value: "eccentric",
    label: ["Eccentric emphasis", "Énfasis excéntrico"],
    description: [
      "Lengthens or overloads the lowering phase of the movement.",
      "Prolonga o enfatiza la fase de descenso del movimiento.",
    ],
  },
  {
    value: "isometric",
    label: ["Isometric hold", "Isometría"],
    description: [
      "Maintains a fixed position for a defined time.",
      "Mantiene una posición fija durante un tiempo definido.",
    ],
  },
  {
    value: "partials",
    label: ["Partial repetitions", "Repeticiones parciales / 21"],
    description: [
      "Uses one or more selected portions of the movement range.",
      "Trabaja una o varias secciones específicas del rango de movimiento.",
    ],
  },
  {
    value: "amrap",
    label: ["AMRAP", "AMRAP"],
    description: [
      "Completes as many technically sound repetitions as possible.",
      "Realiza tantas repeticiones técnicamente correctas como sea posible.",
    ],
  },
  {
    value: "pyramid",
    label: ["Pyramid", "Pirámide"],
    description: [
      "Changes load and repetitions progressively across stages.",
      "Modifica progresivamente la carga y las repeticiones entre etapas.",
    ],
  },
  {
    value: "top-set-backoff",
    label: ["Top set + back-off", "Top set + back-off"],
    description: [
      "Starts with a demanding reference set, followed by lighter work sets.",
      "Comienza con una serie principal exigente y continúa con series de menor carga.",
    ],
  },
  {
    value: "custom",
    label: ["Custom sequence", "Secuencia personalizada"],
    description: [
      "Builds an ordered combination of work and rest blocks from scratch.",
      "Permite combinar libremente bloques de trabajo y descanso en el orden necesario.",
    ],
  },
];

const STRUCTURE_SLOT_COUNTS: Record<WorkoutStructureType, number> = {
  single: 1,
  superset: 2,
  biset: 2,
  triset: 3,
  "giant-set": 4,
  "pre-exhaustion": 2,
  "post-exhaustion": 2,
  circuit: 4,
  "contrast-complex": 2,
};

export function workoutStructureSlotCount(type: WorkoutStructureType | string): number {
  return STRUCTURE_SLOT_COUNTS[type as WorkoutStructureType] ?? 1;
}

function work(
  id: string,
  target: WorkoutWorkBlock["target"],
  value: number | undefined,
  loadType: WorkoutWorkBlock["loadType"] = "reference-percent",
  loadValue = 100,
  tempo?: string,
  note?: string,
): WorkoutWorkBlock {
  return { id, type: "work", target, value, loadType, loadValue, tempo, note };
}

function rest(id: string, seconds: number): WorkoutTechniqueBlock {
  return { id, type: "rest", seconds };
}

function presetBlocks(technique: SpecialTechniqueKind): WorkoutTechniqueBlock[] {
  switch (technique) {
    case "rest-pause":
      return [work("work-1", "reps", 8, "reference-percent", 90), rest("rest-1", 10), work("work-2", "technical-failure", undefined, "same")];
    case "drop-set":
      return [work("work-1", "reps", 8), work("work-2", "reps", 8, "reference-percent", 50), work("work-3", "reps", 8, "reference-percent", 25)];
    case "cluster":
      return [work("work-1", "reps", 3), rest("rest-1", 20), work("work-2", "reps", 3, "same")];
    case "myo-reps":
      return [work("work-1", "reps", 12), rest("rest-1", 20), work("work-2", "reps", 5, "same")];
    case "paused-reps":
      return [work("work-1", "reps", 8, "reference-percent", 100, "2-2-1")];
    case "tempo":
      return [work("work-1", "reps", 8, "reference-percent", 100, "3-1-1")];
    case "eccentric":
      return [work("work-1", "reps", 6, "reference-percent", 100, "5-0-1")];
    case "isometric":
      return [work("work-1", "time", 30, "bodyweight", undefined)];
    case "partials":
      return [work("work-1", "reps", 7), work("work-2", "reps", 7, "same"), work("work-3", "reps", 7, "same")];
    case "amrap":
      return [work("work-1", "amrap", undefined)];
    case "pyramid":
      return [work("work-1", "reps", 12, "reference-percent", 70), work("work-2", "reps", 10, "reference-percent", 80), work("work-3", "reps", 8, "reference-percent", 90)];
    case "top-set-backoff":
      return [work("work-1", "reps", 6), work("work-2", "reps", 8, "reference-percent", 85), work("work-3", "reps", 8, "reference-percent", 85)];
    case "custom":
      return [work("work-1", "reps", 8)];
  }
}

export function createSpecialPrescription(technique: SpecialTechniqueKind | string): SpecialWorkoutPrescription {
  const selected = SPECIAL_TECHNIQUE_OPTIONS.some((option) => option.value === technique)
    ? technique as SpecialTechniqueKind
    : "custom";
  return {
    technique: selected,
    rounds: 3,
    restBetweenRoundsSeconds: 90,
    blocks: presetBlocks(selected),
  };
}

export function localizedOptionLabel<T extends string>(
  option: LocalizedOption<T>,
  language: LanguageCode,
): string {
  return language === "es" ? option.label[1] : option.label[0];
}

export function techniqueLabel(technique: SpecialTechniqueKind, language: LanguageCode): string {
  const option = SPECIAL_TECHNIQUE_OPTIONS.find((candidate) => candidate.value === technique);
  return option ? localizedOptionLabel(option, language) : technique;
}
