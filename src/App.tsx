import {
  ArrowDown,
  Cloud,
  Dumbbell,
  Heart,
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
import { ExerciseDetail } from "./components/ExerciseDetail";
import { OnboardingPanel } from "./components/OnboardingPanel";
import { ProfilePanel } from "./components/ProfilePanel";
import { TrainingTracks, type NewTrackInput } from "./components/TrainingTracks";
import { WorkoutPanel } from "./components/WorkoutPanel";
import { useCloudSync } from "./hooks/useCloudSync";
import { useStoredState } from "./hooks/useStoredState";
import { createRepbookSnapshot, type RepbookCloudSnapshot } from "./lib/cloudSnapshot";
import { filterExercises, generateTrackWorkout, removeTrainingTrack, replaceTrackWorkout, titleCase, uniqueSorted } from "./lib/exercises";
import { getInstallGuide, type InstallGuide } from "./lib/install";
import { tr } from "./lib/i18n";
import { addWeeklyCheckIn, buildRoutineAnalysis } from "./lib/wellness";
import type { Exercise, HealthProfile, LanguageCode, TrainingTrack, WeeklyCheckIn, WorkoutItem } from "./types";

const PAGE_SIZE = 48;

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
  allergies: "",
  healthNotes: "",
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
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [workoutOpen, setWorkoutOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [accessOpen, setAccessOpen] = useState(false);
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
  }), [
    activeTrackId,
    checkIns,
    favoriteIds,
    healthProfile,
    language,
    profileName,
    tracks,
  ]);

  const applyRemoteSnapshot = useCallback((snapshot: RepbookCloudSnapshot) => {
    setProfileName(snapshot.profileName);
    setLanguage(snapshot.language);
    setFavoriteIds(snapshot.favoriteIds);
    setTracks(snapshot.tracks);
    setActiveTrackId(snapshot.activeTrackId);
    setHealthProfile(snapshot.healthProfile);
    setCheckIns(snapshot.checkIns);
    setTracksInitialized(true);
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
  const hasAppAccess = !cloud.configured || Boolean(cloud.email);
  const onboardingRequired = cloud.configured
    && Boolean(cloud.email)
    && healthProfile.onboardingCompleted !== true;
  const canUseTraining = hasAppAccess && !onboardingRequired;

  useEffect(() => {
    if (language !== "en" && language !== "es") setLanguage("es");
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
    fetch("/data/exercises.json", { signal: controller.signal })
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
  const workoutIds = useMemo(() => new Set(workout.map((item) => item.exerciseId)), [workout]);
  const exerciseMap = useMemo(() => new Map(exercises.map((exercise) => [exercise.id, exercise])), [exercises]);
  const bodyParts = useMemo(() => uniqueSorted(exercises, "body_part"), [exercises]);
  const equipmentOptions = useMemo(() => uniqueSorted(exercises, "equipment"), [exercises]);
  const routineAnalysis = useMemo(
    () => activeTrack ? buildRoutineAnalysis(activeTrack, healthProfile, latestCheckIn, language) : null,
    [activeTrack, healthProfile, language, latestCheckIn],
  );

  const filtered = useMemo(
    () => filterExercises(exercises, {
      query: deferredQuery,
      bodyPart,
      equipment,
      favoritesOnly,
      favoriteIds: favorites,
    }),
    [bodyPart, deferredQuery, equipment, exercises, favorites, favoritesOnly],
  );
  const visibleExercises = filtered.slice(0, visibleCount);
  const filtersActive = Boolean(query || bodyPart || equipment || favoritesOnly);

  useEffect(() => {
    if (!canUseTraining || !exercises.length || tracksInitialized) return;

    // Existing users already have tracks but not the initialization marker yet.
    if (tracks.length) {
      setTracksInitialized(true);
      return;
    }

    const primaryFocus = healthProfile.primaryGoal ?? "strength";
    const strengthTrack: TrainingTrack = {
      id: `goal-${primaryFocus}`,
      name: tr(language, "My first route", "Mi primera ruta"),
      kind: ["beach-volleyball", "running", "cycling", "mountain-biking", "swimming", "tennis-padel", "soccer"].includes(primaryFocus) ? "sport" : "goal",
      focus: primaryFocus,
      equipment: healthProfile.equipmentPreference ?? "mixed",
      sessionMinutes: healthProfile.sessionMinutes ?? 45,
      daysPerWeek: healthProfile.trainingDaysPerWeek ?? 3,
      workout: legacyWorkout.length
        ? legacyWorkout
        : generateTrackWorkout(exercises, {
          focus: primaryFocus,
          equipment: healthProfile.equipmentPreference ?? "mixed",
        }),
    };

    setTracks([strengthTrack]);
    setActiveTrackId(strengthTrack.id);
    setTracksInitialized(true);
  }, [canUseTraining, exercises, healthProfile.equipmentPreference, healthProfile.primaryGoal, healthProfile.sessionMinutes, healthProfile.trainingDaysPerWeek, language, legacyWorkout, setActiveTrackId, setTracks, setTracksInitialized, tracks.length, tracksInitialized]);

  useEffect(() => {
    if (tracks.length && !tracks.some((track) => track.id === activeTrackId)) {
      setActiveTrackId(tracks[0].id);
    }
  }, [activeTrackId, setActiveTrackId, tracks]);

  useEffect(() => {
    if (!activeTrack) return;
    setEquipment(activeTrack.equipment === "bodyweight" ? "body weight" : "");
  }, [activeTrack?.equipment, activeTrack?.id]);

  useEffect(() => setVisibleCount(PAGE_SIZE), [deferredQuery, bodyPart, equipment, favoritesOnly]);

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

  function addToWorkout(exerciseId: string) {
    updateActiveWorkout((current) => current.some((item) => item.exerciseId === exerciseId)
      ? current
      : [...current, { exerciseId, sets: 3, reps: 10 }]);
  }

  function updateWorkout(exerciseId: string, field: "sets" | "reps", delta: number) {
    updateActiveWorkout((current) => current.map((item) => {
      if (item.exerciseId !== exerciseId) return item;
      const maximum = field === "sets" ? 12 : 100;
      return { ...item, [field]: Math.min(maximum, Math.max(1, item[field] + delta)) };
    }));
  }

  function swapWorkoutExercise(exerciseId: string, replacementId: string) {
    updateActiveWorkout((current) => current.map((item) => item.exerciseId === exerciseId
      ? { ...item, exerciseId: replacementId }
      : item));
  }

  function selectTrack(trackId: string) {
    const track = tracks.find((candidate) => candidate.id === trackId);
    if (!track) return;
    setActiveTrackId(trackId);
    setEquipment(track.equipment === "bodyweight" ? "body weight" : "");
  }

  function openTrack(trackId: string) {
    selectTrack(trackId);
    setWorkoutOpen(true);
  }

  function generateRoutine(trackId: string) {
    const track = tracks.find((candidate) => candidate.id === trackId);
    if (!track) return;
    const suggestions = generateTrackWorkout(exercises, track);
    setTracks((current) => replaceTrackWorkout(current, trackId, suggestions));
    selectTrack(trackId);
    setWorkoutOpen(true);
  }

  function createTrack(input: NewTrackInput) {
    const id = typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `track-${Date.now()}`;
    const track: TrainingTrack = {
      id,
      ...input,
      workout: generateTrackWorkout(exercises, input),
    };
    setTracks((current) => [...current, track]);
    setActiveTrackId(id);
    setEquipment(track.equipment === "bodyweight" ? "body weight" : "");
  }

  function deleteTrack(trackId: string) {
    const result = removeTrainingTrack(tracks, activeTrackId, trackId);
    setTracks(result.tracks);
    setActiveTrackId(result.activeTrackId);
    setWorkoutOpen(false);
  }

  function openExerciseFromWorkout(exercise: Exercise) {
    setWorkoutOpen(false);
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
    setFavoritesOnly(false);
  }

  function openAccess(mode: AccessMode) {
    setAccessMode(mode);
    setAccessOpen(true);
  }

  return (
    <div className={`app-shell ${hasAppAccess ? "" : "is-guest"}`}>
      <header className="site-header">
        <a className="brand" href="#top" aria-label={tr(language, "Repbook home", "Inicio de Repbook")}>
          <span className="brand-mark">R/B</span>
          <span><strong>REPBOOK</strong><small>{tr(language, "Personal field notes", "Bitácora personal")}</small></span>
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
            <label className="language-select">
              <Languages size={16} />
              <span className="sr-only">{tr(language, "Language", "Idioma")}</span>
              <select value={language} onChange={(event) => setLanguage(event.target.value as LanguageCode)}>
                {LANGUAGE_OPTIONS.map((option) => (
                  <option key={option.code} value={option.code}>{option.label}</option>
                ))}
              </select>
            </label>
            {!onboardingRequired && <button className="workout-trigger" type="button" onClick={() => setWorkoutOpen(true)}>
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
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-index" aria-hidden="true">001—1324</div>
          <div className="hero-copy">
            <p className="eyebrow">{tr(language, "The movement archive", "El archivo de movimiento")}</p>
            <h1 id="hero-title">{tr(language, "Train with", "Entrená con")}<br /><em>{tr(language, "intention.", "intención.")}</em></h1>
            <p className="hero-description">
              {tr(language, "Build distinct routines for personal goals and sport performance—without losing either one.", "Creá rutinas distintas para tus metas personales y tu rendimiento deportivo, sin dejar ninguna de lado.")}
            </p>
          </div>
          <div className="hero-note">
            <span>{tr(language, "FIELD NOTE / 01", "NOTA DE CAMPO / 01")}</span>
            <p>{tr(language, "Good training is repeatable. Choose fewer movements. Record the work. Return stronger.", "Un buen entrenamiento se puede repetir. Elegí menos movimientos, registrá el trabajo y volvé más fuerte.")}</p>
            <ArrowDown size={20} />
          </div>
        </section>

        {canUseTraining && exercises.length > 0 && (
          <TrainingTracks
            language={language}
            tracks={tracks}
            activeTrackId={activeTrack?.id ?? ""}
            onOpen={openTrack}
            onCreate={createTrack}
            onGenerate={generateRoutine}
            onDelete={deleteTrack}
          />
        )}

        {canUseTraining && <section className="library" aria-labelledby="library-title">
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
                    onOpen={() => setSelectedExercise(exercise)}
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

      {onboardingRequired && (
        <OnboardingPanel
          language={language}
          name={profileName}
          profile={healthProfile}
          onComplete={setHealthProfile}
        />
      )}

      {canUseTraining && <footer>
        <div><strong>REPBOOK</strong><span>{tr(language, "One profile. More than one priority.", "Un perfil. Más de una prioridad.")}</span></div>
        <p>Exercise data © Hasan Emir Yıldırım, MIT. Visual media © <a href="https://gymvisual.com/" target="_blank" rel="noreferrer">Gym visual</a>.</p>
      </footer>}

      {canUseTraining && <button className="mobile-workout" type="button" onClick={() => setWorkoutOpen(true)}>
        <Dumbbell size={19} /> {activeTrack?.name ?? tr(language, "Today’s workout", "Entrenamiento de hoy")} <strong>{workout.length}</strong>
      </button>}

      {canUseTraining && selectedExercise && (
        <ExerciseDetail
          exercise={selectedExercise}
          language={language}
          isFavorite={favorites.has(selectedExercise.id)}
          inWorkout={workoutIds.has(selectedExercise.id)}
          onClose={() => setSelectedExercise(null)}
          onToggleFavorite={() => toggleFavorite(selectedExercise.id)}
          onAdd={() => addToWorkout(selectedExercise.id)}
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
            onClose={() => setWorkoutOpen(false)}
            onUpdate={updateWorkout}
            onRemove={(exerciseId) => updateActiveWorkout((current) => current.filter((item) => item.exerciseId !== exerciseId))}
            onSwap={swapWorkoutExercise}
            onClear={() => updateActiveWorkout(() => [])}
            onGenerate={() => generateRoutine(activeTrack.id)}
            onOpenExercise={openExerciseFromWorkout}
            analysis={routineAnalysis}
            onOpenProfile={() => {
              setWorkoutOpen(false);
              setProfileOpen(true);
            }}
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
          onNameChange={setProfileName}
          onHealthProfileChange={setHealthProfile}
          onAddCheckIn={saveWeeklyCheckIn}
          onOpenTrack={(trackId) => {
            setProfileOpen(false);
            openTrack(trackId);
          }}
          onClose={() => setProfileOpen(false)}
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
          onSignIn={(input) => void cloud.signIn(input)}
          onSignOut={cloud.signOut}
          onInstall={installPrompt ? () => {
            installPrompt.prompt().finally(() => setInstallPrompt(null));
          } : null}
          initialMode={accessMode}
          onClose={() => setAccessOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
