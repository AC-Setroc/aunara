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
  loadKg?: number | null;
  loadNote?: string;
  notes?: string;
  loadHistory?: WorkoutLoadEntry[];
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
  dayLabels?: Partial<Record<Weekday, string>>;
}

export type MetabolicSex = "unspecified" | "female" | "male";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "very-active";
export type TrainingExperience = "beginner" | "intermediate" | "advanced";
export type DietaryPattern = "omnivore" | "vegetarian" | "vegan" | "pescatarian" | "other";

export interface HealthProfile {
  onboardingCompleted?: boolean;
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
  preferredIngredients?: string[];
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
