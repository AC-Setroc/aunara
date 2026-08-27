export type LanguageCode =
  | "en"
  | "es"
  | "it"
  | "tr"
  | "ru"
  | "zh"
  | "hi"
  | "pl"
  | "ko"
  | "fr";

export interface Exercise {
  id: string;
  name: string;
  category: string;
  body_part: string;
  equipment: string;
  instructions: Record<LanguageCode, string>;
  instruction_steps: Record<LanguageCode, string[]>;
  muscle_group: string;
  secondary_muscles: string[];
  target: string;
  media_id: string;
  image: string;
  gif_url: string;
  attribution: string;
  created_at: string;
}

export interface WorkoutItem {
  id?: string;
  exerciseId: string;
  sets: number;
  reps: number;
  day?: Weekday;
  setPlan?: string;
  prescriptionMode?: WorkoutPrescriptionMode;
  specialPrescription?: SpecialWorkoutPrescription;
  structure?: WorkoutStructure;
  loadKg?: number | null;
  loadNote?: string;
  notes?: string;
  loadHistory?: WorkoutLoadEntry[];
}

export type WorkoutPrescriptionMode = "standard" | "special";

export type WorkoutStructureType =
  | "single"
  | "superset"
  | "biset"
  | "triset"
  | "giant-set"
  | "pre-exhaustion"
  | "post-exhaustion"
  | "circuit"
  | "contrast-complex";

export interface WorkoutStructure {
  id: string;
  type: WorkoutStructureType;
  position: number;
  size: number;
}

export type SpecialTechniqueKind =
  | "rest-pause"
  | "drop-set"
  | "cluster"
  | "myo-reps"
  | "paused-reps"
  | "tempo"
  | "eccentric"
  | "isometric"
  | "partials"
  | "amrap"
  | "pyramid"
  | "top-set-backoff"
  | "custom";

export type WorkTargetType = "reps" | "technical-failure" | "amrap" | "time";
export type WorkLoadType = "reference-percent" | "same" | "kg" | "bodyweight";

export interface WorkoutWorkBlock {
  id: string;
  type: "work";
  target: WorkTargetType;
  value?: number;
  loadType: WorkLoadType;
  loadValue?: number;
  tempo?: string;
  note?: string;
}

export interface WorkoutRestBlock {
  id: string;
  type: "rest";
  seconds: number;
}

export type WorkoutTechniqueBlock = WorkoutWorkBlock | WorkoutRestBlock;

export interface SpecialWorkoutPrescription {
  technique: SpecialTechniqueKind;
  rounds: number;
  restBetweenRoundsSeconds: number;
  blocks: WorkoutTechniqueBlock[];
}

export type Weekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface WorkoutLoadEntry {
  id: string;
  date: string;
  loadKg: number | null;
  loadNote?: string;
  setPlan: string;
}

export type TrackKind = "goal" | "sport";

export type TrackFocus =
  | "strength"
  | "weight-loss"
  | "muscle-gain"
  | "general-fitness"
  | "endurance"
  | "mobility"
  | "beach-volleyball"
  | "running"
  | "cycling"
  | "mountain-biking"
  | "swimming"
  | "tennis-padel"
  | "soccer";

export type EquipmentPreference = "any" | "mixed" | "bodyweight";
export type TrackCreationMode = "suggested" | "manual";
export type MovementRestriction =
  | "impact"
  | "deep-knee-flexion"
  | "hip-hinge"
  | "overhead"
  | "push"
  | "pull"
  | "rotation"
  | "single-leg-balance";

export type LimitationArea =
  | "knee"
  | "hip"
  | "lower-back"
  | "shoulder"
  | "elbow-wrist"
  | "ankle-foot"
  | "neck"
  | "other";

export interface ExerciseReadinessScreen {
  confirmed: boolean;
  chestPain: boolean;
  dizzinessOrFainting: boolean;
  medicallySupervisedOnly: boolean;
  musculoskeletalConcern: boolean;
  reviewedAt?: string;
}

export interface TrainingLimitation {
  id: string;
  area: LimitationArea;
  side: "left" | "right" | "both" | "not-applicable";
  status: "recent" | "recovering" | "stable";
  restrictedMovements: MovementRestriction[];
  professionalGuidance: string;
  professionalReview: "not-reviewed" | "cleared-with-restrictions" | "cleared";
  reviewDate?: string;
}

export interface RoutineAdaptation {
  excludedExerciseId: string;
  replacementExerciseId: string | null;
  restrictions: MovementRestriction[];
}

export interface TrainingTrack {
  id: string;
  name: string;
  kind: TrackKind;
  focus: TrackFocus;
  equipment: EquipmentPreference;
  sessionMinutes: number;
  daysPerWeek: number;
  workout: WorkoutItem[];
  creationMode?: TrackCreationMode;
  trainingDays?: Weekday[];
  dayLabels?: Partial<Record<Weekday, string>>;
  adaptations?: RoutineAdaptation[];
}

export type MetabolicSex = "unspecified" | "female" | "male";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "very-active";
export type TrainingExperience = "beginner" | "intermediate" | "advanced";
export type DietaryPattern = "omnivore" | "vegetarian" | "vegan" | "pescatarian" | "other";
export type NutritionPlanMode = "simple" | "macros";
export type MacroMealsPerDay = 3 | 4 | 5;
export type HealthDataConsentStatus = "granted" | "declined" | "revoked";

export interface HealthProfile {
  onboardingCompleted?: boolean;
  healthDataMode?: "personalized" | "basic";
  initialRoutineDecision?: "accepted" | "rejected";
  primaryGoal?: TrackFocus;
  equipmentPreference?: EquipmentPreference;
  trainingDaysPerWeek?: number;
  sessionMinutes?: number;
  birthDate?: string;
  ageYears: number | null;
  metabolicSex: MetabolicSex;
  heightCm: number | null;
  currentWeightKg: number | null;
  targetWeightKg: number | null;
  waistCm: number | null;
  bodyFatPercent?: number | null;
  musclePercent?: number | null;
  visceralFatLevel?: number | null;
  activityLevel: ActivityLevel;
  experience: TrainingExperience;
  dietaryPattern: DietaryPattern;
  allergies: string;
  healthNotes: string;
  nutritionPlanMode?: NutritionPlanMode;
  macroMealsPerDay?: MacroMealsPerDay;
  preferredIngredients?: string[];
  readinessScreen?: ExerciseReadinessScreen;
  limitations?: TrainingLimitation[];
}

export interface WeeklyCheckIn {
  id: string;
  date: string;
  weightKg: number | null;
  sleepHours: number | null;
  energy: number;
  stress: number;
  notes: string;
}
