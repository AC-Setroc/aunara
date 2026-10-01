import {
  ArrowDown,
  BookOpen,
  Cloud,
  Dumbbell,
  Heart,
  House,
  Languages,
  Search,
  SlidersHorizontal,
  UserRound,
  X,
} from "lucide-react";
import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  AccessPanel,
  type AccessMode,
} from "./components/AccessPanel";
import { ExerciseCard } from "./components/ExerciseCard";
import { ExerciseAssignmentDialog } from "./components/ExerciseAssignmentDialog";
import { ExerciseDetail } from "./components/ExerciseDetail";
import { ConsentGate } from "./components/ConsentGate";
import { InitialRoutineProposal } from "./components/InitialRoutineProposal";
import { LegalPanel, type LegalDocument } from "./components/LegalPanel";
import { OnboardingPanel } from "./components/OnboardingPanel";
import { ProfilePanel } from "./components/ProfilePanel";
import { TrainingTracks, type NewTrackInput } from "./components/TrainingTracks";
import { WorkoutPanel } from "./components/WorkoutPanel";
import { useCloudSync } from "./hooks/useCloudSync";
import { useStoredState } from "./hooks/useStoredState";
import { createRepbookSnapshot, type RepbookCloudSnapshot } from "./lib/cloudSnapshot";
import {
  adjustWorkoutPrescription,
  equipmentOptionsForBodyPart,
  filterExercises,
  generateAdaptiveTrackWorkout,
  isEquipmentFreeExercise,
  logWorkoutLoad,
  removeTrainingTrack,
  replaceTrackWorkout,
  titleCase,
  uniqueSorted,
  updateWorkoutItem,
  WEEKDAYS,
} from "./lib/exercises";
import { getInstallGuide, type InstallGuide } from "./lib/install";
import { tr } from "./lib/i18n";
import { buildPersonalDataExport, stripSensitiveHealthData } from "./lib/privacy";
import { addWeeklyCheckIn, assessExerciseReadiness, buildRoutineAnalysis } from "./lib/wellness";
import type { EquipmentPreference, Exercise, HealthDataConsentStatus, HealthProfile, LanguageCode, TrainingTrack, Weekday, WeeklyCheckIn, WorkoutItem, WorkoutStructure, WorkoutStructureType } from "./types";

const PAGE_SIZE = 48;
type WorkoutPanelMode = "view" | "edit" | "training";
type AppSection = "home" | "library";
type ExerciseOrigin = "library" | "proposal" | "workout";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

const DEFAULT_HEALTH_PROFILE: HealthProfile = {
  onboardingCompleted: false,
  primaryGoal: "strength",
  equipmentPreference: "mixed",
  trainingDaysPerWeek: 3,
  sessionMinutes: 45,
  birthDate: "",
  ageYears: null,
  metabolicSex: "unspecified",
  heightCm: null,
  currentWeightKg: null,
  targetWeightKg: null,
  waistCm: null,
  activityLevel: "moderate",
  experience: "beginner",
  dietaryPattern: "omnivore",
  nutritionPlanMode: "simple",
  macroMealsPerDay: 4,
  allergies: "",
  healthNotes: "",
  readinessScreen: {
    confirmed: false,
    chestPain: false,
    dizzinessOrFainting: false,
    medicallySupervisedOnly: false,
    musculoskeletalConcern: false,
  },
  limitations: [],
};
const LANGUAGE_OPTIONS: { code: LanguageCode; label: string }[] = [
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
];

function App() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loadingError, setLoadingError] = useState("");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [bodyPart, setBodyPart] = useState("");
  const [equipment, setEquipment] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [libraryEquipmentPreference, setLibraryEquipmentPreference] = useState<EquipmentPreference>("mixed");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [selectedExerciseOrigin, setSelectedExerciseOrigin] = useState<ExerciseOrigin>("library");
  const [assignmentExercise, setAssignmentExercise] = useState<Exercise | null>(null);
  const [appSection, setAppSection] = useState<AppSection>("home");
  const [workoutOpen, setWorkoutOpen] = useState(false);
  const [workoutPanelMode, setWorkoutPanelMode] = useState<WorkoutPanelMode>("view");
  const [profileOpen, setProfileOpen] = useState(false);
  const [accessOpen, setAccessOpen] = useState(false);
  const [legalDocument, setLegalDocument] = useState<LegalDocument | null>(null);
  const [initialProposal, setInitialProposal] = useState<TrainingTrack | null>(null);
  const [trackProposal, setTrackProposal] = useState<TrainingTrack | null>(null);
  const [accessMode, setAccessMode] = useState<AccessMode>("create");
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installGuide, setInstallGuide] = useState<InstallGuide>(() => {
    const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
    const standalone = (typeof window.matchMedia === "function"
      && window.matchMedia("(display-mode: standalone)").matches)
      || navigatorWithStandalone.standalone === true;
    return getInstallGuide(navigator.userAgent, standalone);
  });
  const [language, setLanguage] = useStoredState<LanguageCode>("repbook-language", "es");
  const [profileName, setProfileName] = useStoredState<string>("repbook-profile-name", "Mi perfil");
  const [favoriteIds, setFavoriteIds] = useStoredState<string[]>("repbook-favorites", []);
  const [legacyWorkout] = useStoredState<WorkoutItem[]>("repbook-workout", []);
  const [tracks, setTracks] = useStoredState<TrainingTrack[]>("repbook-training-tracks", []);
  const [activeTrackId, setActiveTrackId] = useStoredState<string>("repbook-active-track", "");
  const [tracksInitialized, setTracksInitialized] = useStoredState<boolean>("repbook-training-tracks-initialized", false);
  const [healthProfile, setHealthProfile] = useStoredState<HealthProfile>("repbook-health-profile", DEFAULT_HEALTH_PROFILE);
  const [checkIns, setCheckIns] = useStoredState<WeeklyCheckIn[]>("repbook-weekly-checkins", []);

  const cloudSnapshot = useMemo(() => createRepbookSnapshot({
    profileName,
    language,
    favoriteIds,
    tracks,
    activeTrackId,
    healthProfile,
    checkIns,
    tracksInitialized,
  }), [
    activeTrackId,
    checkIns,
    favoriteIds,
    healthProfile,
    language,
    profileName,
    tracks,
    tracksInitialized,
  ]);

  const applyRemoteSnapshot = useCallback((snapshot: RepbookCloudSnapshot) => {
    setProfileName(snapshot.profileName);
    setLanguage(snapshot.language);
    setFavoriteIds(snapshot.favoriteIds);
    setTracks(snapshot.tracks);
    setActiveTrackId(snapshot.activeTrackId);
    setHealthProfile(snapshot.healthProfile);
    setCheckIns(snapshot.checkIns);
    setTracksInitialized(snapshot.tracksInitialized ?? snapshot.tracks.length > 0);
  }, [
    setActiveTrackId,
    setCheckIns,
    setFavoriteIds,
    setHealthProfile,
    setLanguage,
    setProfileName,
    setTracks,
    setTracksInitialized,
  ]);

  const clearSignedOutProfile = useCallback(() => {
    setProfileName("Mi perfil");
    setLanguage("es");
    setFavoriteIds([]);
    setTracks([]);
    setActiveTrackId("");
    setHealthProfile(DEFAULT_HEALTH_PROFILE);
    setCheckIns([]);
    setTracksInitialized(false);
  }, [
    setActiveTrackId,
    setCheckIns,
    setFavoriteIds,
    setHealthProfile,
    setLanguage,
    setProfileName,
    setTracks,
    setTracksInitialized,
  ]);

  const cloud = useCloudSync({
    snapshot: cloudSnapshot,
    onRemoteSnapshot: applyRemoteSnapshot,
    onSignedOut: clearSignedOutProfile,
  });

  useEffect(() => {
    if (cloud.passwordRecoveryState !== "ready") return;
    setAccessMode("sign-in");
    setAccessOpen(true);
  }, [cloud.passwordRecoveryState]);
  const hasAppAccess = !cloud.configured || Boolean(cloud.email);
  const consentRequired = cloud.configured
    && Boolean(cloud.email)
    && cloud.healthDataConsent == null;
  const onboardingRequired = cloud.configured
    && Boolean(cloud.email)
    && healthProfile.onboardingCompleted !== true;
  const canUseTraining = hasAppAccess && !onboardingRequired && !consentRequired;

  useEffect(() => {
    if (language !== "en" && language !== "es") {
      setLanguage("es");
      return;
    }
    document.documentElement.lang = language;
  }, [language, setLanguage]);

  useEffect(() => {
    const captureInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const markInstalled = () => {
      setInstallPrompt(null);
      setInstallGuide("installed");
    };
    window.addEventListener("beforeinstallprompt", captureInstallPrompt);
    window.addEventListener("appinstalled", markInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", captureInstallPrompt);
      window.removeEventListener("appinstalled", markInstalled);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${import.meta.env.BASE_URL}data/exercises.json`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Dataset request failed (${response.status})`);
        return response.json() as Promise<Exercise[]>;
      })
      .then(setExercises)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setLoadingError(error instanceof Error ? error.message : "The exercise library could not be loaded.");
      });
    return () => controller.abort();
  }, []);

  const favorites = useMemo(() => new Set(favoriteIds), [favoriteIds]);
  const activeTrack = tracks.find((track) => track.id === activeTrackId) ?? tracks[0];
  const latestCheckIn = checkIns[0];
  const workout = activeTrack?.workout ?? [];
  const workoutIds = useMemo(() => new Set(tracks.flatMap((track) => track.workout.map((item) => item.exerciseId))), [tracks]);
  const exerciseMap = useMemo(() => new Map(exercises.map((exercise) => [exercise.id, exercise])), [exercises]);
  const preferenceFilteredExercises = useMemo(
    () => libraryEquipmentPreference === "bodyweight" ? exercises.filter(isEquipmentFreeExercise) : exercises,
    [exercises, libraryEquipmentPreference],
  );
  const bodyParts = useMemo(() => uniqueSorted(preferenceFilteredExercises, "body_part"), [preferenceFilteredExercises]);
  const equipmentOptions = useMemo(
    () => equipmentOptionsForBodyPart(preferenceFilteredExercises, bodyPart),
    [bodyPart, preferenceFilteredExercises],
  );
  const routineAnalysis = useMemo(
    () => activeTrack ? buildRoutineAnalysis(activeTrack, healthProfile, latestCheckIn, language) : null,
    [activeTrack, healthProfile, language, latestCheckIn],
  );
  const readinessAssessment = useMemo(
    () => assessExerciseReadiness(healthProfile, language),
    [healthProfile, language],
  );
  const restrictedMovements = useMemo(
    () => Array.from(new Set(
      (healthProfile.limitations ?? []).flatMap((limitation) => limitation.restrictedMovements),
    )),
    [healthProfile.limitations],
  );

  const filtered = useMemo(
    () => filterExercises(exercises, {
      query: deferredQuery,
      bodyPart,
      equipment,
      equipmentPreference: libraryEquipmentPreference,
      favoritesOnly,
      favoriteIds: favorites,
    }),
    [bodyPart, deferredQuery, equipment, exercises, favorites, favoritesOnly, libraryEquipmentPreference],
  );
  const visibleExercises = filtered.slice(0, visibleCount);
  const filtersActive = Boolean(query || bodyPart || equipment || favoritesOnly || libraryEquipmentPreference !== "mixed");

  useEffect(() => {
    if (!canUseTraining || !exercises.length || healthProfile.initialRoutineDecision || initialProposal) return;

    // A pre-existing routine counts as an accepted first route. This avoids
    // interrupting established users while repairing the new-account flow.
    if (tracks.length) {
      setHealthProfile((current) => ({ ...current, initialRoutineDecision: "accepted" }));
      if (!tracksInitialized) setTracksInitialized(true);
      return;
    }

    const primaryFocus = healthProfile.primaryGoal ?? "strength";
    const initialTrack = {
      id: `initial-${primaryFocus}`,
      name: tr(language, "My first route", "Mi primera ruta"),
      kind: ["beach-volleyball", "running", "cycling", "mountain-biking", "swimming", "tennis-padel", "soccer"].includes(primaryFocus) ? "sport" : "goal",
      focus: primaryFocus,
      equipment: healthProfile.equipmentPreference ?? "mixed",
      sessionMinutes: healthProfile.sessionMinutes ?? 45,
      daysPerWeek: healthProfile.trainingDaysPerWeek ?? 3,
      trainingDays: WEEKDAYS.slice(0, healthProfile.trainingDaysPerWeek ?? 3),
      workout: legacyWorkout,
      creationMode: "suggested",
    } satisfies TrainingTrack;
    if (legacyWorkout.length) {
      setInitialProposal(initialTrack);
      return;
    }
    const generated = generateAdaptiveTrackWorkout(
      exercises,
      initialTrack,
      healthProfile.limitations ?? [],
    );
    setInitialProposal({
      ...initialTrack,
      workout: generated.workout,
      adaptations: generated.adaptations,
    });
  }, [canUseTraining, exercises, healthProfile.equipmentPreference, healthProfile.initialRoutineDecision, healthProfile.limitations, healthProfile.primaryGoal, healthProfile.sessionMinutes, healthProfile.trainingDaysPerWeek, initialProposal, language, legacyWorkout, setHealthProfile, setTracksInitialized, tracks.length, tracksInitialized]);

  useEffect(() => {
    if (tracks.length && !tracks.some((track) => track.id === activeTrackId)) {
      setActiveTrackId(tracks[0].id);
    }
  }, [activeTrackId, setActiveTrackId, tracks]);

  useEffect(() => {
    setLibraryEquipmentPreference(healthProfile.equipmentPreference ?? "mixed");
  }, [healthProfile.equipmentPreference]);

  useEffect(() => setVisibleCount(PAGE_SIZE), [deferredQuery, bodyPart, equipment, favoritesOnly, libraryEquipmentPreference]);

  useEffect(() => {
    if (equipment && !equipmentOptions.includes(equipment)) setEquipment("");
  }, [equipment, equipmentOptions]);

  function toggleFavorite(exerciseId: string) {
    setFavoriteIds((current) => current.includes(exerciseId)
      ? current.filter((id) => id !== exerciseId)
      : [...current, exerciseId]);
  }

  function updateActiveWorkout(updater: (current: WorkoutItem[]) => WorkoutItem[]) {
    if (!activeTrack) return;
    setTracks((current) => {
      const track = current.find((candidate) => candidate.id === activeTrack.id);
      return track
        ? replaceTrackWorkout(current, activeTrack.id, updater(track.workout))
        : current;
    });
  }

  function buildWorkoutItem(exerciseId: string, day: Weekday, structure?: WorkoutStructure): WorkoutItem {
    return {
      id: typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `movement-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      exerciseId,
      sets: 3,
      reps: 10,
      day,
      setPlan: "3 × 10",
      prescriptionMode: "standard",
      structure,
      loadKg: null,
      loadHistory: [],
    };
  }

  function appendExerciseToTrack(trackId: string, exerciseId: string, day: Weekday, allowDuplicate = true) {
    setTracks((current) => current.map((track) => {
      if (track.id !== trackId || (!allowDuplicate && track.workout.some((item) => item.exerciseId === exerciseId))) return track;
      return { ...track, workout: [...track.workout, buildWorkoutItem(exerciseId, day)] };
    }));
  }

  function appendWorkoutExercise(exerciseId: string, allowDuplicate = false, day?: Weekday) {
    if (!activeTrack) return;
    appendExerciseToTrack(
      activeTrack.id,
      exerciseId,
      day ?? activeTrack.trainingDays?.[0] ?? "monday",
      allowDuplicate,
    );
  }

  function appendWorkoutStructure(type: WorkoutStructureType, exerciseIds: string[], day: Weekday) {
    if (!activeTrack || !exerciseIds.length) return;
    const structureId = typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `structure-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const additions = exerciseIds.map((exerciseId, position) => buildWorkoutItem(exerciseId, day, {
      id: structureId,
      type,
      position,
      size: exerciseIds.length,
    }));
    updateActiveWorkout((current) => [...current, ...additions]);
  }

  function addToWorkout(exerciseId: string) {
    const exercise = exerciseMap.get(exerciseId);
    if (exercise) setAssignmentExercise(exercise);
  }

  function removeExerciseFromTrack(trackId: string, itemId: string) {
    setTracks((current) => current.map((track) => track.id === trackId
      ? { ...track, workout: track.workout.filter((item) => (item.id ?? item.exerciseId) !== itemId) }
      : track));
  }

  function updateWorkout(itemId: string, field: "sets" | "reps", delta: number) {
    updateActiveWorkout((current) => adjustWorkoutPrescription(current, itemId, field, delta));
  }

  function swapWorkoutExercise(itemId: string, replacementId: string) {
    updateActiveWorkout((current) => current.map((item) => (item.id ?? item.exerciseId) === itemId
      ? { ...item, exerciseId: replacementId }
      : item));
  }

  function updateWorkoutItemFields(itemId: string, changes: Partial<WorkoutItem>) {
    updateActiveWorkout((current) => updateWorkoutItem(current, itemId, changes));
  }

  function setTrainingDayLabel(day: Weekday, label: string) {
    if (!activeTrack) return;
    setTracks((current) => current.map((track) => track.id === activeTrack.id
      ? { ...track, dayLabels: { ...track.dayLabels, [day]: label } }
      : track));
  }

  function logCurrentWorkoutLoad(itemId: string) {
    updateActiveWorkout((current) => logWorkoutLoad(current, itemId, new Date().toISOString().slice(0, 10)));
  }

  function selectTrack(trackId: string) {
    const track = tracks.find((candidate) => candidate.id === trackId);
    if (!track) return;
    setActiveTrackId(trackId);
  }

  function openTrack(trackId: string) {
    selectTrack(trackId);
    setWorkoutPanelMode("view");
    setWorkoutOpen(true);
  }

  function generateRoutine(trackId: string) {
    const track = tracks.find((candidate) => candidate.id === trackId);
    if (!track) return;
    const generated = generateAdaptiveTrackWorkout(exercises, track, healthProfile.limitations ?? []);
    setTracks((current) => current.map((candidate) => candidate.id === trackId
      ? { ...candidate, workout: generated.workout, adaptations: generated.adaptations }
      : candidate));
    selectTrack(trackId);
    setWorkoutPanelMode("view");
    setWorkoutOpen(true);
  }

  function createTrack(input: NewTrackInput) {
    const id = typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `track-${Date.now()}`;
    const baseTrack: TrainingTrack = {
      id,
      ...input,
      workout: [],
    };
    const generated = input.creationMode === "manual"
      ? null
      : generateAdaptiveTrackWorkout(exercises, input, healthProfile.limitations ?? []);
    const track: TrainingTrack = generated
      ? { ...baseTrack, workout: generated.workout, adaptations: generated.adaptations }
      : baseTrack;
    if (input.creationMode === "suggested") {
      setTrackProposal(track);
      return;
    }
    setTracks((current) => [...current, track]);
    setActiveTrackId(id);
    setWorkoutPanelMode("edit");
    setWorkoutOpen(true);
  }

  function acceptTrackProposal(openForEditing: boolean) {
    if (!trackProposal) return;
    if (readinessAssessment.level === "professional-review" || readinessAssessment.level === "setup") return;
    setTracks((current) => [...current, trackProposal]);
    setActiveTrackId(trackProposal.id);
    setTrackProposal(null);
    if (openForEditing) {
      setWorkoutPanelMode("edit");
      setWorkoutOpen(true);
    }
  }

  function acceptInitialProposal(openForEditing: boolean) {
    if (!initialProposal) return;
    if (readinessAssessment.level === "professional-review" || readinessAssessment.level === "setup") return;
    setTracks([initialProposal]);
    setActiveTrackId(initialProposal.id);
    setHealthProfile((current) => ({ ...current, initialRoutineDecision: "accepted" }));
    setTracksInitialized(true);
    setInitialProposal(null);
    if (openForEditing) {
      setWorkoutPanelMode("edit");
      setWorkoutOpen(true);
    }
  }

  function rejectInitialProposal() {
    setHealthProfile((current) => ({ ...current, initialRoutineDecision: "rejected" }));
    setTracksInitialized(true);
    setInitialProposal(null);
  }

  function editTrack(trackId: string, changes: Partial<TrainingTrack>) {
    setTracks((current) => current.map((track) => track.id === trackId
      ? { ...track, ...changes, id: track.id, workout: track.workout }
      : track));
  }

  function deleteTrack(trackId: string) {
    const result = removeTrainingTrack(tracks, activeTrackId, trackId);
    setTracks(result.tracks);
    setActiveTrackId(result.activeTrackId);
    setWorkoutOpen(false);
  }

  function openExerciseFromWorkout(exercise: Exercise) {
    setSelectedExerciseOrigin("workout");
    setSelectedExercise(exercise);
  }

  function openExercise(exercise: Exercise, origin: ExerciseOrigin) {
    setSelectedExerciseOrigin(origin);
    setSelectedExercise(exercise);
  }

  function saveWeeklyCheckIn(checkIn: WeeklyCheckIn) {
    setCheckIns((current) => addWeeklyCheckIn(current, checkIn));
    if (checkIn.weightKg !== null) {
      setHealthProfile((current) => ({ ...current, currentWeightKg: checkIn.weightKg }));
    }
  }

  function clearFilters() {
    setQuery("");
    setBodyPart("");
    setEquipment("");
    setLibraryEquipmentPreference(healthProfile.equipmentPreference ?? "mixed");
    setFavoritesOnly(false);
  }

  function openAccess(mode: AccessMode) {
    setAccessMode(mode);
    setAccessOpen(true);
  }

  function updateHealthProfile(profile: HealthProfile) {
    setHealthProfile(profile);
    const refreshProposal = (proposal: TrainingTrack | null): TrainingTrack | null => {
      if (!proposal || proposal.creationMode === "manual") return proposal;
      const generated = generateAdaptiveTrackWorkout(exercises, proposal, profile.limitations ?? []);
      return {
        ...proposal,
        workout: generated.workout,
        adaptations: generated.adaptations,
      };
    };
    setInitialProposal((current) => refreshProposal(current));
    setTrackProposal((current) => refreshProposal(current));
  }

  function exportPersonalData() {
    if (!cloud.email) return;
    const exported = buildPersonalDataExport({
      email: cloud.email,
      consentStatus: cloud.healthDataConsent ?? null,
      snapshot: cloudSnapshot,
    });
    const blob = new Blob([JSON.stringify(exported, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `aunara-data-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function changeHealthConsent(status: HealthDataConsentStatus) {
    if (status !== "granted") {
      setHealthProfile((current) => stripSensitiveHealthData(current));
      setCheckIns([]);
    } else {
      setHealthProfile((current) => ({ ...current, healthDataMode: "personalized" }));
    }
    void cloud.recordHealthConsent(status);
  }

  return (
    <div className={`app-shell ${hasAppAccess ? "" : "is-guest"}`}>
      <header className="site-header">
        <a className="brand" href="#top" onClick={() => setAppSection("home")} aria-label={tr(language, "Aunara home", "Inicio de Aunara")}>
          <img className="brand-lockup" src={`${import.meta.env.BASE_URL}brand/aunara-training-systems.svg`} alt="Aunara Training Systems" />
          <img className="brand-symbol" src={`${import.meta.env.BASE_URL}brand/aunara-symbol.svg`} alt="" aria-hidden="true" />
        </a>

        {hasAppAccess ? (
          <nav aria-label={tr(language, "App controls", "Controles de la app")}>
            <button className={`sync-trigger is-${cloud.status}`} type="button" onClick={() => openAccess("create")} aria-label={tr(language, "Open account and synchronization", "Abrir cuenta y sincronización")}>
              <Cloud size={17} />
              <span>{cloud.email ? tr(language, "Synced", "Sincronizado") : tr(language, "Account", "Cuenta")}</span>
            </button>
            {!onboardingRequired && <button className="profile-trigger" type="button" onClick={() => setProfileOpen(true)} aria-label={tr(language, "Open profile", "Abrir perfil")}>
              <UserRound size={17} />
              <span>{profileName.trim() || tr(language, "My profile", "Mi perfil")}</span>
            </button>}
            {!onboardingRequired && <div className="section-navigation" aria-label={tr(language, "Main sections", "Secciones principales")}>
              <button className={appSection === "home" ? "is-active" : ""} type="button" onClick={() => setAppSection("home")}>
                <House size={16} /> {tr(language, "Home", "Inicio")}
              </button>
              <button className={appSection === "library" ? "is-active" : ""} type="button" onClick={() => setAppSection("library")}>
                <BookOpen size={16} /> {tr(language, "Exercises", "Ejercicios")}
              </button>
            </div>}
            <label className="language-select">
              <Languages size={16} />
              <span className="sr-only">{tr(language, "Language", "Idioma")}</span>
              <select value={language} onChange={(event) => setLanguage(event.target.value as LanguageCode)}>
                {LANGUAGE_OPTIONS.map((option) => (
                  <option key={option.code} value={option.code}>{option.label}</option>
                ))}
              </select>
            </label>
            {!onboardingRequired && <button className="workout-trigger" type="button" onClick={() => {
              setWorkoutPanelMode("view");
              setWorkoutOpen(true);
            }}>
              <Dumbbell size={18} />
              <span>{activeTrack?.name ?? tr(language, "Today’s workout", "Entrenamiento de hoy")}</span>
              <strong>{workout.length}</strong>
            </button>}
          </nav>
        ) : (
          <nav className="guest-nav" aria-label={tr(language, "Public controls", "Controles públicos")}>
            <a className="guest-home-link" href="#top">{tr(language, "Home", "Inicio")}</a>
            <label className="language-select">
              <Languages size={16} />
              <span className="sr-only">{tr(language, "Language", "Idioma")}</span>
              <select value={language} onChange={(event) => setLanguage(event.target.value as LanguageCode)}>
                {LANGUAGE_OPTIONS.map((option) => (
                  <option key={option.code} value={option.code}>{option.label}</option>
                ))}
              </select>
            </label>
            <button className="guest-account-button is-primary" type="button" onClick={() => openAccess("sign-in")}>{tr(language, "Login", "Ingresar")}</button>
          </nav>
        )}
      </header>

      <main id="top">
        {appSection === "home" && <section className="hero" aria-labelledby="hero-title">
          <div className="hero-index" aria-hidden="true">{tr(language, "STRENGTH · CAPABILITY · PROGRESS", "FUERZA · CAPACIDAD · PROGRESO")}</div>
          <div className="hero-copy">
            <p className="eyebrow">{tr(language, "Training systems for real life", "Sistemas de entrenamiento para la vida real")}</p>
            <h1 id="hero-title">
              {tr(language, "A body ready", "Un cuerpo preparado")}<br />
              <em>{tr(language, "for what matters most.", "para todo lo que te importa.")}</em>
            </h1>
            <p className="hero-description">
              {tr(language, "Bring your training goals together, train with intention, and see how each session builds what your body can do.", "Organizá tus metas, entrená con intención y entendé cómo cada sesión construye lo que tu cuerpo puede hacer.")}
            </p>
          </div>
          <div className="hero-note">
            <span>{tr(language, "AUNARA PRINCIPLE / 01", "PRINCIPIO AUNARA / 01")}</span>
            <p>{tr(language, "Understand what you do and why. Review every proposal, adjust it to your context, and keep your history under your control.", "Entendé lo que hacés y por qué. Revisá cada propuesta, ajustala a tu contexto y mantené tu historia bajo tu control.")}</p>
            {hasAppAccess && <ArrowDown size={20} />}
          </div>
        </section>}

        {appSection === "home" && canUseTraining && exercises.length > 0 && (
          <TrainingTracks
            language={language}
            tracks={tracks}
            activeTrackId={activeTrack?.id ?? ""}
            onOpen={openTrack}
            onCreate={createTrack}
            onGenerate={generateRoutine}
            onDelete={deleteTrack}
            onEdit={editTrack}
          />
        )}

        {appSection === "library" && canUseTraining && <section className="library" aria-labelledby="library-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{tr(language, "Browse / filter / build", "Explorá / filtrá / armá")}</p>
              <h2 id="library-title">{tr(language, "Exercise library", "Biblioteca de ejercicios")}</h2>
            </div>
            <p className="result-count">
              <strong>{filtered.length.toLocaleString()}</strong>
              <span>{filtered.length === 1 ? tr(language, "movement", "movimiento") : tr(language, "movements", "movimientos")}</span>
            </p>
          </div>

          <div className="filter-station">
            <label className="search-field">
              <Search size={20} />
              <span className="sr-only">{tr(language, "Search exercises", "Buscar ejercicios")}</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={tr(language, "Search movement, muscle, equipment…", "Buscá movimiento, músculo o equipo…")}
              />
              {query && (
                <button type="button" onClick={() => setQuery("")} aria-label={tr(language, "Clear search", "Limpiar búsqueda")}><X size={16} /></button>
              )}
            </label>

            <div className="select-row">
              <label>
                <Dumbbell size={16} />
                <span className="sr-only">{tr(language, "Equipment availability", "Disponibilidad de equipo")}</span>
                <select
                  aria-label={tr(language, "Equipment availability", "Disponibilidad de equipo")}
                  value={libraryEquipmentPreference}
                  onChange={(event) => {
                    setLibraryEquipmentPreference(event.target.value as EquipmentPreference);
                    setEquipment("");
                    setBodyPart("");
                  }}
                >
                  <option value="mixed">{tr(language, "Mixed", "Mixto")}</option>
                  <option value="bodyweight">{tr(language, "No equipment", "Sin equipo")}</option>
                  <option value="any">{tr(language, "All equipment", "Todo el equipo")}</option>
                </select>
              </label>
              <label>
                <SlidersHorizontal size={16} />
                <span className="sr-only">{tr(language, "Body part", "Parte del cuerpo")}</span>
                <select value={bodyPart} onChange={(event) => setBodyPart(event.target.value)}>
                  <option value="">{tr(language, "All body parts", "Todas las partes del cuerpo")}</option>
                  {bodyParts.map((part) => <option key={part} value={part}>{titleCase(part)}</option>)}
                </select>
              </label>
              <label>
                <Dumbbell size={16} />
                <span className="sr-only">{tr(language, "Equipment", "Equipo")}</span>
                <select value={equipment} onChange={(event) => setEquipment(event.target.value)}>
                  <option value="">{tr(language, "All equipment", "Todo el equipo")}</option>
                  {equipmentOptions.map((item) => <option key={item} value={item}>{titleCase(item)}</option>)}
                </select>
              </label>
              <button
                className={`favorites-filter ${favoritesOnly ? "is-active" : ""}`}
                type="button"
                onClick={() => setFavoritesOnly((current) => !current)}
                aria-pressed={favoritesOnly}
              >
                <Heart size={16} fill={favoritesOnly ? "currentColor" : "none"} />
                {tr(language, "Saved", "Guardados")} <span>{favoriteIds.length}</span>
              </button>
            </div>
          </div>

          {loadingError ? (
            <div className="status-card error">
              <h3>{tr(language, "Library unavailable", "Biblioteca no disponible")}</h3><p>{loadingError}</p>
            </div>
          ) : exercises.length === 0 ? (
            <div className="loading-grid" aria-label={tr(language, "Loading exercise library", "Cargando biblioteca de ejercicios")}>
              {Array.from({ length: 8 }, (_, index) => <span key={index} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="status-card">
              <h3>{tr(language, "No movement fits that brief.", "Ningún movimiento coincide con esos filtros.")}</h3>
              <p>{tr(language, "Try a broader search or remove one of your filters.", "Probá una búsqueda más amplia o quitá uno de los filtros.")}</p>
              <button type="button" onClick={clearFilters}>{tr(language, "Clear all filters", "Limpiar filtros")}</button>
            </div>
          ) : (
            <>
              <div className="exercise-grid">
                {visibleExercises.map((exercise) => (
                  <ExerciseCard
                    language={language}
                    key={exercise.id}
                    exercise={exercise}
                    isFavorite={favorites.has(exercise.id)}
                    inWorkout={workoutIds.has(exercise.id)}
                    onOpen={() => openExercise(exercise, "library")}
                    onToggleFavorite={() => toggleFavorite(exercise.id)}
                    onAdd={() => addToWorkout(exercise.id)}
                  />
                ))}
              </div>

              {visibleCount < filtered.length && (
                <button className="load-more" type="button" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>
                  {tr(language, "Load the next", "Cargar los siguientes")} {Math.min(PAGE_SIZE, filtered.length - visibleCount)}
                  <ArrowDown size={17} />
                </button>
              )}
            </>
          )}

          {filtersActive && filtered.length > 0 && (
            <button className="reset-filters" type="button" onClick={clearFilters}>{tr(language, "Reset filters", "Restablecer filtros")}</button>
          )}
        </section>}
      </main>

      {consentRequired && (
        <ConsentGate
          language={language}
          onGrant={() => void cloud.recordHealthConsent("granted", "migration-gate")}
          onUseBasic={() => {
            setHealthProfile((current) => stripSensitiveHealthData(current));
            setCheckIns([]);
            void cloud.recordHealthConsent("declined", "migration-gate");
          }}
          onOpenPrivacy={() => setLegalDocument("privacy")}
        />
      )}

      {onboardingRequired && !consentRequired && (
        <OnboardingPanel
          language={language}
          name={profileName}
          profile={healthProfile}
          healthDataConsent={cloud.healthDataConsent === "granted"}
          onRequestHealthConsent={() => {
            setAccessMode("create");
            setAccessOpen(true);
          }}
          onComplete={updateHealthProfile}
        />
      )}

      {canUseTraining && initialProposal && !profileOpen && (
        <InitialRoutineProposal
          language={language}
          track={initialProposal}
          exerciseMap={exerciseMap}
          healthNotes={healthProfile.healthNotes}
          readiness={readinessAssessment}
          onOpenExercise={(exercise) => openExercise(exercise, "proposal")}
          onAccept={() => acceptInitialProposal(false)}
          onEdit={() => acceptInitialProposal(true)}
          onReject={rejectInitialProposal}
          onReviewHealth={() => setProfileOpen(true)}
        />
      )}

      {canUseTraining && trackProposal && !profileOpen && (
        <InitialRoutineProposal
          language={language}
          variant="track"
          track={trackProposal}
          exerciseMap={exerciseMap}
          healthNotes={healthProfile.healthNotes}
          readiness={readinessAssessment}
          onOpenExercise={(exercise) => openExercise(exercise, "proposal")}
          onAccept={() => acceptTrackProposal(false)}
          onEdit={() => acceptTrackProposal(true)}
          onReject={() => setTrackProposal(null)}
          onReviewHealth={() => setProfileOpen(true)}
        />
      )}

      <footer>
        <div className="footer-brand"><img src={`${import.meta.env.BASE_URL}brand/aunara-training-systems.svg`} alt="Aunara Training Systems" /><span>{tr(language, "Train for what you want to be able to do.", "Entrená para poder.")}</span></div>
        <div className="footer-legal">
          <button type="button" onClick={() => setLegalDocument("privacy")}>{tr(language, "Privacy policy", "Política de privacidad")}</button>
          <button type="button" onClick={() => setLegalDocument("terms")}>{tr(language, "Terms of use", "Términos de uso")}</button>
        </div>
        {canUseTraining && <p>{tr(language, "Exercise data", "Datos de ejercicios")} © Hasan Emir Yıldırım, MIT. {tr(language, "Visual media", "Material visual")} © <a href="https://gymvisual.com/" target="_blank" rel="noreferrer">Gym visual</a>.</p>}
      </footer>

      {canUseTraining && <button className="mobile-workout" type="button" onClick={() => {
        setWorkoutPanelMode("view");
        setWorkoutOpen(true);
      }}>
        <Dumbbell size={19} /> {activeTrack?.name ?? tr(language, "Today’s workout", "Entrenamiento de hoy")} <strong>{workout.length}</strong>
      </button>}

      {canUseTraining && selectedExercise && (
        <ExerciseDetail
          exercise={selectedExercise}
          language={language}
          origin={selectedExerciseOrigin}
          isFavorite={favorites.has(selectedExercise.id)}
          inWorkout={workoutIds.has(selectedExercise.id)}
          onClose={() => setSelectedExercise(null)}
          onToggleFavorite={() => toggleFavorite(selectedExercise.id)}
          onAdd={() => addToWorkout(selectedExercise.id)}
        />
      )}

      {canUseTraining && assignmentExercise && (
        <ExerciseAssignmentDialog
          language={language}
          exercise={assignmentExercise}
          tracks={tracks}
          onClose={() => setAssignmentExercise(null)}
          onAdd={(trackId, day) => appendExerciseToTrack(trackId, assignmentExercise.id, day)}
          onRemove={removeExerciseFromTrack}
        />
      )}

      {canUseTraining && workoutOpen && activeTrack && routineAnalysis && (
        <>
          <button className="panel-backdrop" type="button" onClick={() => setWorkoutOpen(false)} aria-label={tr(language, "Close workout", "Cerrar entrenamiento")} />
          <WorkoutPanel
            language={language}
            items={workout}
            exerciseMap={exerciseMap}
            exercises={exercises}
            track={activeTrack}
            initialMode={workoutPanelMode}
            onClose={() => setWorkoutOpen(false)}
            onUpdate={updateWorkout}
            onUpdateItem={updateWorkoutItemFields}
            onSetDayLabel={setTrainingDayLabel}
            onAddExercise={(exerciseId, day) => appendWorkoutExercise(exerciseId, true, day)}
            onAddStructure={appendWorkoutStructure}
            onLogLoad={logCurrentWorkoutLoad}
            onRemove={(itemId) => updateActiveWorkout((current) => current.filter((item) => (item.id ?? item.exerciseId) !== itemId))}
            onSwap={swapWorkoutExercise}
            onClear={() => updateActiveWorkout(() => [])}
            onGenerate={() => generateRoutine(activeTrack.id)}
            onOpenExercise={openExerciseFromWorkout}
            analysis={routineAnalysis}
            onOpenProfile={() => {
              setWorkoutOpen(false);
              setProfileOpen(true);
            }}
            restrictedMovements={restrictedMovements}
          />
        </>
      )}

      {canUseTraining && profileOpen && (
        <ProfilePanel
          language={language}
          name={profileName}
          tracks={tracks}
          activeTrackId={activeTrack?.id ?? ""}
          favoriteCount={favoriteIds.length}
          healthProfile={healthProfile}
          checkIns={checkIns}
          healthDataConsent={cloud.healthDataConsent === "granted"}
          onNameChange={setProfileName}
          onHealthProfileChange={updateHealthProfile}
          onAddCheckIn={saveWeeklyCheckIn}
          onOpenTrack={(trackId) => {
            setProfileOpen(false);
            openTrack(trackId);
          }}
          onClose={() => setProfileOpen(false)}
          onRequestHealthConsent={() => {
            setProfileOpen(false);
            setAccessMode("create");
            setAccessOpen(true);
          }}
        />
      )}

      {accessOpen && (
        <AccessPanel
          language={language}
          cloud={cloud}
          profileName={profileName}
          installGuide={installGuide}
          onCreateAccount={(input) => {
            setProfileName(input.name);
            void cloud.createAccount(input);
          }}
          onVerifyAccount={(input) => void cloud.verifyAccount(input)}
          onResendVerification={(email) => void cloud.resendVerification(email)}
          onUseExistingAccount={cloud.clearExistingAccount}
          onRequestPasswordReset={(email) => void cloud.requestPasswordReset(email)}
          onUpdatePassword={(password) => void cloud.updatePassword(password)}
          onSignIn={(input) => void cloud.signIn(input)}
          onSignOut={cloud.signOut}
          onOpenLegal={setLegalDocument}
          onExportData={exportPersonalData}
          onEditData={() => {
            setAccessOpen(false);
            if (healthProfile.onboardingCompleted) setProfileOpen(true);
          }}
          onChangeHealthConsent={changeHealthConsent}
          onDeleteData={() => void cloud.deleteStoredData()}
          onDeleteAccount={() => {
            void cloud.deleteAccount();
            setAccessOpen(false);
          }}
          onInstall={installPrompt ? () => {
            installPrompt.prompt().finally(() => setInstallPrompt(null));
          } : null}
          initialMode={accessMode}
          onClose={() => setAccessOpen(false)}
        />
      )}

      {legalDocument && (
        <LegalPanel
          language={language}
          document={legalDocument}
          onClose={() => setLegalDocument(null)}
        />
      )}
    </div>
  );
}

export default App;
