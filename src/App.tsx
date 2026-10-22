import {
  ArrowDown,
  BookOpen,
  Cloud,
  CloudOff,
  Dumbbell,
  Heart,
  House,
  Languages,
  Search,
  SlidersHorizontal,
  UserRound,
  X,
} from "lucide-react";
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
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
import { StorageNotice } from "./components/StorageNotice";
import { NavigationMenu } from "./components/NavigationMenu";
import { OnboardingPanel, profileGoals } from "./components/OnboardingPanel";
import { ProfilePanel } from "./components/ProfilePanel";
import { TrainingTracks, type NewTrackInput } from "./components/TrainingTracks";
import { WorkoutPanel } from "./components/WorkoutPanel";
import { useCloudSync } from "./hooks/useCloudSync";
import { useStoredState } from "./hooks/useStoredState";
import { createRepbookSnapshot, type RepbookCloudSnapshot } from "./lib/cloudSnapshot";
import {
  adjustWorkoutPrescription,
  equipmentOptionsForBodyPart,
  exerciseTaxonomyLabel,
  isExerciseNamePending,
  filterExercises,
  generateAdaptiveTrackWorkout,
  isEquipmentFreeExercise,
  logWorkoutLoad,
  removeTrainingTrack,
  removeWorkoutItem,
  replaceTrackWorkout,
  uniqueSorted,
  updateWorkoutItem,
  WEEKDAYS,
} from "./lib/exercises";
import { getInstallGuide, type InstallGuide } from "./lib/install";
import { tr } from "./lib/i18n";
import { isValidManualPrescription, workoutStructureSlotCount } from "./lib/workoutPrescription";
import { buildPersonalDataExport, stripSensitiveHealthData } from "./lib/privacy";
import { addWeeklyCheckIn, assessExerciseReadiness, buildRoutineAnalysis } from "./lib/wellness";
import type { EquipmentPreference, Exercise, HealthDataConsentStatus, HealthProfile, LanguageCode, TrainingTrack, Weekday, WeeklyCheckIn, WorkoutItem, WorkoutStructure, WorkoutStructureType } from "./types";

const PAGE_SIZE = 48;
type WorkoutPanelMode = "view" | "edit" | "training";
type AppSection = "home" | "library" | "routes";
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

function hasProfileSummary(snapshot: RepbookCloudSnapshot): boolean {
  const profile = snapshot.healthProfile;
  const name = snapshot.profileName.trim();
  // Presence is content-based, not a claim about writing history or remote sync.
  // Omitted optional preferences are equivalent to the initial App defaults.
  return profile.onboardingCompleted === true
    || (name !== "" && name !== "Mi perfil")
    || (profile.primaryGoal ?? DEFAULT_HEALTH_PROFILE.primaryGoal) !== DEFAULT_HEALTH_PROFILE.primaryGoal
    || (profile.goals?.length ?? 0) > 0
    || profile.sport != null
    || (profile.equipmentPreference ?? DEFAULT_HEALTH_PROFILE.equipmentPreference) !== DEFAULT_HEALTH_PROFILE.equipmentPreference
    || (profile.trainingDaysPerWeek ?? DEFAULT_HEALTH_PROFILE.trainingDaysPerWeek) !== DEFAULT_HEALTH_PROFILE.trainingDaysPerWeek
    || (profile.sessionMinutes ?? DEFAULT_HEALTH_PROFILE.sessionMinutes) !== DEFAULT_HEALTH_PROFILE.sessionMinutes
    || (profile.experience ?? DEFAULT_HEALTH_PROFILE.experience) !== DEFAULT_HEALTH_PROFILE.experience;
}
const LANGUAGE_OPTIONS: { code: LanguageCode; label: string }[] = [
  { code: "es", label: "ES" },
  { code: "en", label: "EN" },
];

function isFirstLoginStored(): boolean {
  try {
    return localStorage.getItem("aunara-is-first-login") === "true";
  } catch {
    return false;
  }
}

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
  const [accessOpen, setAccessOpen] = useState(() => {
    try {
      return Boolean(localStorage.getItem("aunara-pending-verification"));
    } catch {
      return false;
    }
  });
  const [legalDocument, setLegalDocument] = useState<LegalDocument | null>(null);
  const legalTriggerRef = useRef<HTMLElement | null>(null);
  const [initialProposal, setInitialProposal] = useState<TrainingTrack | null>(null);
  const [trackProposal, setTrackProposal] = useState<TrainingTrack | null>(null);
  const [accessMode, setAccessMode] = useState<AccessMode>(() => {
    try {
      if (localStorage.getItem("aunara-pending-verification")) return "create";
      return "sign-in";
    } catch {
      return "sign-in";
    }
  });
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

  const navigateToSection = useCallback((section: AppSection) => {
    setAppSection(section);
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    if (typeof window !== "undefined") {
      try {
        window.history.pushState({ aunara: true, section, overlay: null }, "");
      } catch {
        // Ignore
      }
    }
  }, []);

  const showWorkout = useCallback((mode: WorkoutPanelMode = "view") => {
    setWorkoutPanelMode(mode);
    if (typeof window !== "undefined") {
      try {
        window.history.pushState({ aunara: true, section: appSection, overlay: "workout" }, "");
      } catch {
        // Ignore
      }
    }
    setWorkoutOpen(true);
  }, [appSection]);

  const closeWorkout = useCallback(() => {
    setWorkoutOpen(false);
    if (typeof window !== "undefined" && window.history.state?.overlay === "workout") {
      try {
        window.history.back();
      } catch {
        // Ignore
      }
    }
  }, []);

  const showProfile = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        window.history.pushState({ aunara: true, section: appSection, overlay: "profile" }, "");
      } catch {
        // Ignore
      }
    }
    setProfileOpen(true);
  }, [appSection]);

  const closeProfile = useCallback(() => {
    setProfileOpen(false);
    if (typeof window !== "undefined" && window.history.state?.overlay === "profile") {
      try {
        window.history.back();
      } catch {
        // Ignore
      }
    }
  }, []);

  const showAccess = useCallback((mode: AccessMode) => {
    setAccessMode(mode);
    if (typeof window !== "undefined") {
      try {
        window.history.pushState({ aunara: true, section: appSection, overlay: "access" }, "");
      } catch {
        // Ignore
      }
    }
    setAccessOpen(true);
  }, [appSection]);

  const closeAccess = useCallback(() => {
    setAccessOpen(false);
    if (typeof window !== "undefined" && window.history.state?.overlay === "access") {
      try {
        window.history.back();
      } catch {
        // Ignore
      }
    }
  }, []);

  const showLegal = useCallback((doc: LegalDocument) => {
    if (typeof window !== "undefined") {
      try {
        window.history.pushState({ aunara: true, section: appSection, overlay: "legal" }, "");
      } catch {
        // Ignore
      }
    }
    setLegalDocument(doc);
  }, [appSection]);

  const closeLegal = useCallback(() => {
    setLegalDocument(null);
    if (typeof window !== "undefined" && window.history.state?.overlay === "legal") {
      try {
        window.history.back();
      } catch {
        // Ignore
      }
    }
  }, []);

  const showExercise = useCallback((exercise: Exercise, origin: ExerciseOrigin) => {
    setSelectedExerciseOrigin(origin);
    if (typeof window !== "undefined") {
      try {
        window.history.pushState({ aunara: true, section: appSection, overlay: "exercise" }, "");
      } catch {
        // Ignore
      }
    }
    setSelectedExercise(exercise);
  }, [appSection]);

  const closeSelectedExercise = useCallback(() => {
    setSelectedExercise(null);
    if (typeof window !== "undefined" && window.history.state?.overlay === "exercise") {
      try {
        window.history.back();
      } catch {
        // Ignore
      }
    }
  }, []);

  const showAssignment = useCallback((exercise: Exercise) => {
    if (typeof window !== "undefined") {
      try {
        window.history.pushState({ aunara: true, section: appSection, overlay: "assignment" }, "");
      } catch {
        // Ignore
      }
    }
    setAssignmentExercise(exercise);
  }, [appSection]);

  const closeAssignmentExercise = useCallback(() => {
    setAssignmentExercise(null);
    if (typeof window !== "undefined" && window.history.state?.overlay === "assignment") {
      try {
        window.history.back();
      } catch {
        // Ignore
      }
    }
  }, []);

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
    setProfileName("");
    setLanguage("es");
    setFavoriteIds([]);
    setTracks([]);
    setActiveTrackId("");
    setHealthProfile(DEFAULT_HEALTH_PROFILE);
    setCheckIns([]);
    setTracksInitialized(false);
    try {
      localStorage.removeItem("repbook-health-profile");
      localStorage.removeItem("repbook-training-tracks");
      localStorage.removeItem("repbook-active-track");
      localStorage.removeItem("repbook-favorites");
      localStorage.removeItem("repbook-favorite-exercises");
      localStorage.removeItem("repbook-weekly-checkins");
      localStorage.removeItem("repbook-training-tracks-initialized");
      localStorage.removeItem("repbook-profile-name");
      localStorage.removeItem("repbook-workout");
      localStorage.removeItem("aunara-pending-verification");
      localStorage.removeItem("aunara-active-screen");
      localStorage.removeItem("aunara-is-first-login");
      localStorage.removeItem("aunara-sync-disabled");
    } catch {
      // Ignore storage errors
    }
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

  const lastAuthUser = useRef<string | null>(null);
  useEffect(() => {
    if (!cloud.email) {
      lastAuthUser.current = null;
      return;
    }
    if (lastAuthUser.current && lastAuthUser.current !== cloud.email) {
      clearSignedOutProfile();
    }
    lastAuthUser.current = cloud.email;
  }, [cloud.email, clearSignedOutProfile]);

  useEffect(() => {
    if (cloud.passwordRecoveryState !== "ready") return;
    setAccessMode("sign-in");
    setAccessOpen(true);
  }, [cloud.passwordRecoveryState]);

  useEffect(() => {
    if (!cloud.pendingVerification) return;
    setAccessMode("create");
    setAccessOpen(true);
  }, [cloud.pendingVerification]);
  const hasAppAccess = !cloud.configured || Boolean(cloud.email);
  const consentRequired = cloud.configured
    && Boolean(cloud.email)
    && cloud.healthDataConsent == null;
  const onboardingRequired = cloud.configured
    && Boolean(cloud.email)
    && (
      cloud.onboardingCompleted === false
      || (healthProfile.onboardingCompleted !== true && cloud.onboardingCompleted !== true)
      || isFirstLoginStored()
    );
  const canUseTraining = hasAppAccess && !onboardingRequired && !consentRequired;
  const previousEmail = useRef(cloud.email);
  useEffect(() => {
    if (previousEmail.current !== cloud.email) {
      // A recovery callback can supply the new session and recovery readiness
      // together. Its password form has priority over the normal home landing.
      setAccessOpen(cloud.passwordRecoveryState === "ready");
      setProfileOpen(false);
      setWorkoutOpen(false);
      setSelectedExercise(null);
      setAssignmentExercise(null);
      setAppSection("home");
      previousEmail.current = cloud.email;
    }
  }, [cloud.email, cloud.passwordRecoveryState]);

  useEffect(() => {
    if (cloud.pendingVerification && !cloud.email) {
      setAccessMode("create");
      setAccessOpen(true);
    }
  }, [cloud.pendingVerification, cloud.email]);

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
    try {
      const saved = localStorage.getItem("aunara-active-screen");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.appSection === "home" || parsed.appSection === "library" || parsed.appSection === "routes") {
          setAppSection(parsed.appSection);
        }
        if (typeof parsed.profileOpen === "boolean") setProfileOpen(parsed.profileOpen);
        if (typeof parsed.workoutOpen === "boolean") setWorkoutOpen(parsed.workoutOpen);
        if (parsed.workoutPanelMode === "view" || parsed.workoutPanelMode === "edit" || parsed.workoutPanelMode === "training") {
          setWorkoutPanelMode(parsed.workoutPanelMode);
        }
        if (typeof parsed.activeTrackId === "string" && parsed.activeTrackId) {
          setActiveTrackId(parsed.activeTrackId);
        }
        if (typeof parsed.accessOpen === "boolean") setAccessOpen(parsed.accessOpen);
        if (parsed.accessMode === "create" || parsed.accessMode === "sign-in" || parsed.accessMode === "help") {
          setAccessMode(parsed.accessMode);
        }
        if (parsed.selectedExerciseId) {
          const ex = exercises.find((item) => item.id === parsed.selectedExerciseId);
          if (ex) setSelectedExercise(ex);
        }
      }
    } catch {
      // Ignore
    }
  }, [exercises, setActiveTrackId]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.history) return;

    if (window.location.hash && window.location.hash.includes("access_token")) {
      try {
        window.history.replaceState({ aunara: true, guard: true }, "", window.location.pathname + window.location.search);
      } catch {
        // Ignore
      }
    }

    if (!window.history.state?.aunara) {
      try {
        window.history.replaceState({ aunara: true, guard: true }, "");
        window.history.pushState({ aunara: true, section: appSection, overlay: null }, "");
      } catch {
        // Ignore
      }
    }

    const handlePopState = (event: PopStateEvent) => {
      if (!event.state || event.state.guard) {
        try {
          window.history.pushState({ aunara: true, section: "home", overlay: null }, "");
        } catch {
          // Ignore
        }
        setLegalDocument(null);
        setAssignmentExercise(null);
        setSelectedExercise(null);
        setWorkoutOpen(false);
        setProfileOpen(false);
        setAccessOpen(false);
        setAppSection("home");
        return;
      }

      const state = event.state as {
        aunara?: boolean;
        section?: AppSection;
        overlay?: string | null;
      };

      if (state.aunara) {
        if (state.overlay !== "legal") setLegalDocument(null);
        if (state.overlay !== "assignment") setAssignmentExercise(null);
        if (state.overlay !== "exercise") setSelectedExercise(null);
        if (state.overlay !== "workout") setWorkoutOpen(false);
        if (state.overlay !== "profile") setProfileOpen(false);
        if (state.overlay !== "access") setAccessOpen(false);
        if (state.section) setAppSection(state.section);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const activeScreenRef = useRef({
    appSection,
    profileOpen,
    workoutOpen,
    workoutPanelMode,
    activeTrackId,
    accessOpen,
    accessMode,
    selectedExerciseId: selectedExercise?.id ?? null,
  });
  useEffect(() => {
    activeScreenRef.current = {
      appSection,
      profileOpen,
      workoutOpen,
      workoutPanelMode,
      activeTrackId,
      accessOpen,
      accessMode,
      selectedExerciseId: selectedExercise?.id ?? null,
    };
  }, [appSection, profileOpen, workoutOpen, workoutPanelMode, activeTrackId, accessOpen, accessMode, selectedExercise]);

  useEffect(() => {
    const handleSave = () => {
      try {
        localStorage.setItem("aunara-active-screen", JSON.stringify(activeScreenRef.current));
      } catch {
        // Ignore
      }
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        handleSave();
      }
    };
    window.addEventListener("pagehide", handleSave);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("pagehide", handleSave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
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
  const workoutIds = useMemo(() => new Set(tracks.flatMap((track) => (track.workout ?? []).map((item) => item.exerciseId))), [tracks]);
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

    const primaryFocus = profileGoals(healthProfile)[0];
    if (!primaryFocus) return;
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
      { ...initialTrack, dailyExerciseCount: 5 },
      healthProfile.limitations ?? [],
    );
    setInitialProposal({
      ...initialTrack,
      workout: generated.workout,
      adaptations: generated.adaptations,
    });
  }, [canUseTraining, exercises, healthProfile.equipmentPreference, healthProfile.goals, healthProfile.initialRoutineDecision, healthProfile.limitations, healthProfile.primaryGoal, healthProfile.sessionMinutes, healthProfile.trainingDaysPerWeek, initialProposal, language, legacyWorkout, setHealthProfile, setTracksInitialized, tracks.length, tracksInitialized]);

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
      const trainingDays = track.trainingDays?.includes(day)
        ? track.trainingDays
        : [...(track.trainingDays ?? []), day];
      return { ...track, trainingDays, workout: [...track.workout, buildWorkoutItem(exerciseId, day)] };
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

  function appendWorkoutStructure(type: WorkoutStructureType, exerciseIds: string[], day: Weekday, prescriptions: Partial<WorkoutItem>[] = []) {
    if (!activeTrack || exerciseIds.length !== workoutStructureSlotCount(type) || prescriptions.length !== exerciseIds.length || !prescriptions.every(isValidManualPrescription)) return;
    const structureId = typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `structure-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const additions = exerciseIds.map((exerciseId, position) => ({ ...buildWorkoutItem(exerciseId, day, {
      id: structureId,
      type,
      position,
      size: exerciseIds.length,
    }), ...prescriptions[position], setPlan: `${prescriptions[position]?.sets ?? 3} × ${prescriptions[position]?.reps ?? 10}` }));
    setTracks((current) => current.map((track) => {
      if (track.id !== activeTrack.id) return track;
      const trainingDays = track.trainingDays?.includes(day)
        ? track.trainingDays
        : [...(track.trainingDays ?? []), day];
      return {
        ...track,
        trainingDays,
        workout: [...track.workout, ...additions],
      };
    }));
  }

  function addToWorkout(exerciseId: string) {
    const exercise = exerciseMap.get(exerciseId);
    if (exercise) showAssignment(exercise);
  }

  function removeExerciseFromTrack(trackId: string, itemId: string) {
    setTracks((current) => current.map((track) => track.id === trackId
      ? { ...track, workout: removeWorkoutItem(track.workout, itemId) }
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
    showWorkout("view");
  }

  function generateRoutine(trackId: string) {
    const track = tracks.find((candidate) => candidate.id === trackId);
    if (!track) return;
    const generated = generateAdaptiveTrackWorkout(exercises, track, healthProfile.limitations ?? []);
    setTracks((current) => current.map((candidate) => candidate.id === trackId
      ? { ...candidate, workout: generated.workout, adaptations: generated.adaptations }
      : candidate));
    selectTrack(trackId);
    showWorkout("view");
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
    showWorkout("edit");
  }

  function acceptTrackProposal(openForEditing: boolean) {
    if (!trackProposal) return;
    if (readinessAssessment.level === "professional-review" || readinessAssessment.level === "setup") return;
    setTracks((current) => [...current, trackProposal]);
    setActiveTrackId(trackProposal.id);
    setTrackProposal(null);
    if (openForEditing) {
      showWorkout("edit");
    }
  }

  function rejectTrackProposal() {
    if (!trackProposal) return;
    const blankTrack: TrainingTrack = {
      ...trackProposal,
      workout: [],
      creationMode: "manual",
      adaptations: [],
    };
    setTracks((current) => [...current, blankTrack]);
    setActiveTrackId(blankTrack.id);
    setTrackProposal(null);
    showWorkout("edit");
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
      showWorkout("edit");
    }
  }

  function rejectInitialProposal() {
    if (!initialProposal) return;
    const blankTrack: TrainingTrack = {
      ...initialProposal,
      workout: [],
      creationMode: "manual",
      adaptations: [],
    };
    setTracks([blankTrack]);
    setActiveTrackId(blankTrack.id);
    setHealthProfile((current) => ({ ...current, initialRoutineDecision: "rejected" }));
    setTracksInitialized(true);
    setInitialProposal(null);
    showWorkout("edit");
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
    closeWorkout();
  }

  function openExerciseFromWorkout(exercise: Exercise) {
    showExercise(exercise, "workout");
  }

  function openExercise(exercise: Exercise, origin: ExerciseOrigin) {
    showExercise(exercise, origin);
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
    showAccess(mode);
  }

  function updateHealthProfile(profile: HealthProfile) {
    try {
      localStorage.removeItem("aunara-is-first-login");
    } catch {
      // Ignore
    }
    setHealthProfile(profile);
    if (profile.onboardingCompleted) {
      void cloud.completeOnboarding();
    }
    const refreshProposal = (proposal: TrainingTrack | null): TrainingTrack | null => {
      if (!proposal || proposal.creationMode === "manual") return proposal;
      const generated = generateAdaptiveTrackWorkout(exercises, { ...proposal, dailyExerciseCount: 5 }, profile.limitations ?? []);
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
    <div className={`app-shell ${hasAppAccess ? "" : "is-guest"}`} onClickCapture={(event) => {
      // Safari may activate a button without focusing it; remember legal openers.
      if (!legalDocument && event.target instanceof Element) {
        legalTriggerRef.current = event.target.closest<HTMLElement>("button, a");
      }
    }}>
      <header className="site-header">
        <NavigationMenu
          language={language}
          onToggleLanguage={() => setLanguage(language === "es" ? "en" : "es")}
          entries={[
            ...(appSection !== "home" ? [
              {
                label: tr(language, "Home", "Inicio"),
                action: () => {
                  navigateToSection("home");
                },
              },
            ] : []),
            ...(canUseTraining ? [
              { label: tr(language, "Profile", "Perfil"), action: () => showProfile() },
              {
                label: tr(language, "Exercise library", "Biblioteca de ejercicios"),
                action: () => {
                  navigateToSection("library");
                },
              },
              {
                label: tr(language, "Routes", "Rutas"),
                action: () => {
                  navigateToSection("routes");
                },
              },
            ] : []),
            { label: cloud.email ? tr(language, "Account / privacy", "Cuenta / privacidad") : tr(language, "Login / create account", "Ingresar / crear cuenta"), action: () => showAccess("sign-in") },
            ...(installGuide !== "installed" ? [{ label: tr(language, "Help / installation", "Ayuda / instalación"), action: () => showAccess("help") }] : []),
            ...(cloud.email ? [{ label: tr(language, "Sign out", "Salir"), action: () => { void cloud.signOut(); } }] : []),
          ]}
          controls={
            cloud.email ? (
              <button
                className={`header-sync-trigger ${cloud.healthDataConsent === "granted" && !cloud.syncDisabled && cloud.status !== "error" ? "is-synced" : "is-disconnected"}`}
                type="button"
                onClick={() => showAccess("sign-in")}
                aria-label={tr(language, "Open account and synchronization", "Abrir cuenta y sincronización")}
              >
                {cloud.healthDataConsent === "granted" && !cloud.syncDisabled && cloud.status !== "error" ? <Cloud size={20} /> : <CloudOff size={20} />}
              </button>
            ) : null
          }
        />
      </header>

      <StorageNotice language={language} onLearnMore={() => showLegal("cookies")} />

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
            <span>{tr(language, "AUNARA PRINCIPLE", "PRINCIPIO AUNARA")}</span>
            <p>{tr(language, "Understand what you do and why. Review every proposal, adjust it to your context, and keep your history under your control.", "Entendé lo que hacés y por qué. Revisá cada propuesta, ajustala a tu contexto y mantené tu historia bajo tu control.")}</p>
            {hasAppAccess && <ArrowDown size={20} />}
            {canUseTraining && (
              <button
                type="button"
                className="hero-routes-cta"
                onClick={() => {
                  navigateToSection("routes");
                }}
              >
                {tr(language, "Go to training routes", "Ir a rutas de entrenamiento")}
              </button>
            )}
          </div>
        </section>}

        {appSection === "routes" && canUseTraining && exercises.length > 0 && (
          <TrainingTracks
            language={language}
            tracks={tracks}
            activeTrackId={activeTrack?.id ?? ""}
            onOpen={openTrack}
            onCreate={createTrack}
            onGenerate={generateRoutine}
            onDelete={deleteTrack}
            onEdit={editTrack}
            checkIns={checkIns}
            onAddCheckIn={saveWeeklyCheckIn}
            healthDataConsent={cloud.healthDataConsent === "granted"}
            onRequestHealthConsent={() => {
              if (cloud.email) {
                void cloud.recordHealthConsent("granted", "privacy-center");
              } else {
                showAccess("create");
              }
            }}
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
                  {bodyParts.map((part) => <option key={part} value={part}>{exerciseTaxonomyLabel(part, language)}</option>)}
                </select>
              </label>
              <label>
                <Dumbbell size={16} />
                <span className="sr-only">{tr(language, "Equipment", "Equipo")}</span>
                <select value={equipment} onChange={(event) => setEquipment(event.target.value)}>
                  <option value="">{tr(language, "All equipment", "Todo el equipo")}</option>
                  {equipmentOptions.map((item) => <option key={item} value={item}>{exerciseTaxonomyLabel(item, language)}</option>)}
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

          {language === "es" && exercises.some((exercise) => isExerciseNamePending(exercise, language)) && <details className="translation-review-list">
            <summary>{exercises.filter((exercise) => isExerciseNamePending(exercise, language)).length} nombres con traducción pendiente · lista de revisión</summary>
            <p>Se muestra el nombre inglés original. La biblioteca no tiene cobertura editorial completa en español.</p>
            <ol>{exercises.filter((exercise) => isExerciseNamePending(exercise, language)).map((exercise) => <li key={exercise.id}>#{exercise.id} · {exercise.name}</li>)}</ol>
          </details>}
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
          onOpenPrivacy={() => showLegal("privacy")}
        />
      )}

      {onboardingRequired && !consentRequired && (
        <OnboardingPanel
          language={language}
          name={profileName}
          profile={healthProfile}
          healthDataConsent={cloud.healthDataConsent === "granted"}
          onRequestHealthConsent={() => {
            if (cloud.email) {
              void cloud.recordHealthConsent("granted", "privacy-center");
            } else {
              showAccess("create");
            }
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
          onReviewHealth={() => showProfile()}
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
          onReject={rejectTrackProposal}
          onReviewHealth={() => showProfile()}
        />
      )}

      <footer>
        <div className="footer-brand"><img src={`${import.meta.env.BASE_URL}brand/aunara-training-systems.svg`} alt="Aunara Training Systems" /><span>{tr(language, "Your purpose leads the way.", "Tu propósito marca el camino.")}</span></div>
        <div className="footer-legal">
          <button type="button" onClick={() => showLegal("privacy")}>{tr(language, "Privacy policy", "Política de privacidad")}</button>
          <button type="button" onClick={() => showLegal("terms")}>{tr(language, "Terms of use", "Términos de uso")}</button>
          <button type="button" onClick={() => showLegal("cookies")}>{tr(language, "Cookies and storage", "Cookies y almacenamiento")}</button>
        </div>
        <p className="sr-only">{tr(language, "Exercise data", "Datos de ejercicios")} © Hasan Emir Yıldırım, MIT. {tr(language, "Visual media", "Material visual")} © <a href="https://gymvisual.com/" target="_blank" rel="noreferrer">Gym visual</a>.</p>
        <div className="footer-development-credit">
          <span>{tr(language, "Developed by", "Desarrollado por")}</span>
          <img src={`${import.meta.env.BASE_URL}brand/ac-setroc-wordmark.png`} alt="AC Setroc" width="2464" height="671" />
        </div>
      </footer>

      {canUseTraining && <button className="mobile-workout" type="button" onClick={() => {
        showWorkout("view");
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
          onClose={closeSelectedExercise}
          onToggleFavorite={() => toggleFavorite(selectedExercise.id)}
          onAdd={() => addToWorkout(selectedExercise.id)}
        />
      )}

      {canUseTraining && assignmentExercise && (
        <ExerciseAssignmentDialog
          language={language}
          exercise={assignmentExercise}
          tracks={tracks}
          onClose={closeAssignmentExercise}
          onAdd={(trackId, day) => appendExerciseToTrack(trackId, assignmentExercise.id, day)}
          onRemove={removeExerciseFromTrack}
        />
      )}

      {canUseTraining && workoutOpen && activeTrack && routineAnalysis && (
        <>
          <button className="panel-backdrop" type="button" onClick={closeWorkout} aria-label={tr(language, "Close workout", "Cerrar entrenamiento")} />
          <WorkoutPanel
            language={language}
            items={workout}
            exerciseMap={exerciseMap}
            exercises={exercises}
            track={activeTrack}
            initialMode={workoutPanelMode}
            onClose={closeWorkout}
            onUpdate={updateWorkout}
            onUpdateItem={updateWorkoutItemFields}
            onSetDayLabel={setTrainingDayLabel}
            onAddExercise={(exerciseId, day) => appendWorkoutExercise(exerciseId, true, day)}
            onAddStructure={appendWorkoutStructure}
            onLogLoad={logCurrentWorkoutLoad}
            onRemove={(itemId) => updateActiveWorkout((current) => removeWorkoutItem(current, itemId))}
            onSwap={swapWorkoutExercise}
            onClear={() => updateActiveWorkout(() => [])}
            onGenerate={() => generateRoutine(activeTrack.id)}
            onOpenExercise={openExerciseFromWorkout}
            analysis={routineAnalysis}
            onOpenProfile={() => {
              closeWorkout();
              showProfile();
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
          onSignOut={cloud.email ? () => { void cloud.signOut(); } : undefined}
          onAddCheckIn={saveWeeklyCheckIn}
          onOpenTrack={(trackId) => {
            closeProfile();
            openTrack(trackId);
          }}
          onClose={closeProfile}
          onRequestHealthConsent={() => {
            if (cloud.email) {
              void cloud.recordHealthConsent("granted", "privacy-center");
            } else {
              closeProfile();
              showAccess("create");
            }
          }}
        />
      )}

      {accessOpen && (
        <AccessPanel
          language={language}
          cloud={cloud}
          profileName={cloud.email ? profileName : "Mi perfil"}
          installGuide={installGuide}
          dataSummary={{ profile: hasProfileSummary(cloudSnapshot), routes: tracks.length, favorites: favoriteIds.length, checkIns: checkIns.length, health: healthProfile.healthDataMode === "personalized" }}
          onCreateAccount={(input) => {
            clearSignedOutProfile();
            setProfileName(input.name);
            void cloud.createAccount(input);
          }}
          onVerifyAccount={(input) => void cloud.verifyAccount(input)}
          onResendVerification={(email) => void cloud.resendVerification(email)}
          onUseExistingAccount={cloud.clearExistingAccount}
          onClearPendingVerification={cloud.clearPendingVerification}
          onClearAuthError={cloud.clearAuthError}
          onRequestPasswordReset={(email) => void cloud.requestPasswordReset(email)}
          onUpdatePassword={(password) => void cloud.updatePassword(password)}
          onSignIn={(input) => void cloud.signIn(input)}
          onSignOut={cloud.signOut}
          onOpenLegal={showLegal}
          onExportData={exportPersonalData}
          onEditData={() => {
            closeAccess();
            if (healthProfile.onboardingCompleted) showProfile();
          }}
          onChangeHealthConsent={changeHealthConsent}
          onDeleteData={() => void cloud.deleteStoredData()}
          onResumeSync={() => void cloud.resumeSync()}
          onDeleteAccount={() => {
            void cloud.deleteAccount();
          }}
          onInstall={installPrompt ? () => {
            installPrompt.prompt().finally(() => setInstallPrompt(null));
          } : null}
          initialMode={accessMode}
          onClose={closeAccess}
        />
      )}

      {legalDocument && (
        <LegalPanel
          language={language}
          document={legalDocument}
          returnFocusTo={legalTriggerRef.current}
          onClose={closeLegal}
        />
      )}
    </div>
  );
}

export default App;
