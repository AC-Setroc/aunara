import {
  Apple,
  ArrowDown,
  Bot,
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
  type InstallTarget,
} from "./components/AccessPanel";
import { ExerciseCard } from "./components/ExerciseCard";
import { ExerciseDetail } from "./components/ExerciseDetail";
import { ProfilePanel } from "./components/ProfilePanel";
import { TrainingTracks, type NewTrackInput } from "./components/TrainingTracks";
import { WorkoutPanel } from "./components/WorkoutPanel";
import { useCloudSync } from "./hooks/useCloudSync";
import { useStoredState } from "./hooks/useStoredState";
import { createRepbookSnapshot, type RepbookCloudSnapshot } from "./lib/cloudSnapshot";
import { filterExercises, generateTrackWorkout, removeTrainingTrack, replaceTrackWorkout, titleCase, uniqueSorted } from "./lib/exercises";
import { getInstallGuide, type InstallGuide } from "./lib/install";
import { addWeeklyCheckIn, buildRoutineAnalysis } from "./lib/wellness";
import type { Exercise, HealthProfile, LanguageCode, TrainingTrack, WeeklyCheckIn, WorkoutItem } from "./types";

const PAGE_SIZE = 48;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

const DEFAULT_HEALTH_PROFILE: HealthProfile = {
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
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "it", label: "Italiano" },
  { code: "tr", label: "Türkçe" },
  { code: "ru", label: "Русский" },
  { code: "zh", label: "中文" },
  { code: "hi", label: "हिन्दी" },
  { code: "pl", label: "Polski" },
  { code: "ko", label: "한국어" },
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
  const [installTarget, setInstallTarget] = useState<InstallTarget>(null);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installGuide, setInstallGuide] = useState<InstallGuide>(() => {
    const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
    const standalone = (typeof window.matchMedia === "function"
      && window.matchMedia("(display-mode: standalone)").matches)
      || navigatorWithStandalone.standalone === true;
    return getInstallGuide(navigator.userAgent, standalone);
  });
  const [language, setLanguage] = useStoredState<LanguageCode>("repbook-language", "es");
  const [profileName, setProfileName] = useStoredState<string>("repbook-profile-name", "My profile");
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
    setProfileName("My profile");
    setLanguage("es");
    setFavoriteIds([]);
    setTracks([]);
    setActiveTrackId("");
    setHealthProfile(DEFAULT_HEALTH_PROFILE);
    setCheckIns([]);
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

  const cloud = useCloudSync({
    snapshot: cloudSnapshot,
    onRemoteSnapshot: applyRemoteSnapshot,
    onSignedOut: clearSignedOutProfile,
  });
  const hasAppAccess = !cloud.configured || Boolean(cloud.email);

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
    () => activeTrack ? buildRoutineAnalysis(activeTrack, healthProfile, latestCheckIn) : null,
    [activeTrack, healthProfile, latestCheckIn],
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
    if (!exercises.length || tracksInitialized) return;

    // Existing users already have tracks but not the initialization marker yet.
    if (tracks.length) {
      setTracksInitialized(true);
      return;
    }

    const strengthTrack: TrainingTrack = {
      id: "goal-strength",
      name: "Strength base",
      kind: "goal",
      focus: "strength",
      equipment: "any",
      sessionMinutes: 45,
      daysPerWeek: 2,
      workout: legacyWorkout.length
        ? legacyWorkout
        : generateTrackWorkout(exercises, { focus: "strength", equipment: "any" }),
    };
    const sportTrack: TrainingTrack = {
      id: "sport-beach-volleyball",
      name: "Beach volleyball",
      kind: "sport",
      focus: "beach-volleyball",
      equipment: "bodyweight",
      sessionMinutes: 45,
      daysPerWeek: 2,
      workout: generateTrackWorkout(exercises, { focus: "beach-volleyball", equipment: "bodyweight" }),
    };

    setTracks([strengthTrack, sportTrack]);
    setActiveTrackId(strengthTrack.id);
    setTracksInitialized(true);
  }, [exercises, legacyWorkout, setActiveTrackId, setTracks, setTracksInitialized, tracks.length, tracksInitialized]);

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

  function openAccess(mode: AccessMode, target: InstallTarget = null) {
    setAccessMode(mode);
    setInstallTarget(target);
    setAccessOpen(true);
  }

  return (
    <div className={`app-shell ${hasAppAccess ? "" : "is-guest"}`}>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Repbook home">
          <span className="brand-mark">R/B</span>
          <span><strong>REPBOOK</strong><small>Personal field notes</small></span>
        </a>

        {hasAppAccess ? (
          <nav aria-label="App controls">
            <button className={`sync-trigger is-${cloud.status}`} type="button" onClick={() => openAccess("create")} aria-label="Open account and synchronization">
              <Cloud size={17} />
              <span>{cloud.email ? "Synced" : "Account"}</span>
            </button>
            <button className="device-trigger" type="button" onClick={() => openAccess("create", "android")} aria-label="Android installation instructions">
              <Bot size={18} />
            </button>
            <button className="device-trigger" type="button" onClick={() => openAccess("create", "ios")} aria-label="iPhone installation instructions">
              <Apple size={18} />
            </button>
            <button className="profile-trigger" type="button" onClick={() => setProfileOpen(true)} aria-label="Open profile">
              <UserRound size={17} />
              <span>{profileName.trim() || "My profile"}</span>
            </button>
            <label className="language-select">
              <Languages size={16} />
              <span className="sr-only">Instruction language</span>
              <select value={language} onChange={(event) => setLanguage(event.target.value as LanguageCode)}>
                {LANGUAGE_OPTIONS.map((option) => (
                  <option key={option.code} value={option.code}>{option.label}</option>
                ))}
              </select>
            </label>
            <button className="workout-trigger" type="button" onClick={() => setWorkoutOpen(true)}>
              <Dumbbell size={18} />
              <span>{activeTrack?.name ?? "Today’s workout"}</span>
              <strong>{workout.length}</strong>
            </button>
          </nav>
        ) : (
          <nav className="guest-nav" aria-label="Public controls">
            <a className="guest-home-link" href="#top">Home</a>
            <button className="device-trigger" type="button" onClick={() => openAccess("create", "android")} aria-label="Android installation instructions">
              <Bot size={18} />
            </button>
            <button className="device-trigger" type="button" onClick={() => openAccess("create", "ios")} aria-label="iPhone installation instructions">
              <Apple size={18} />
            </button>
            <label className="language-select">
              <Languages size={16} />
              <span className="sr-only">Instruction language</span>
              <select value={language} onChange={(event) => setLanguage(event.target.value as LanguageCode)}>
                {LANGUAGE_OPTIONS.map((option) => (
                  <option key={option.code} value={option.code}>{option.label}</option>
                ))}
              </select>
            </label>
            <button className="guest-account-button" type="button" onClick={() => openAccess("sign-in")}>Log in</button>
            <button className="guest-account-button is-primary" type="button" onClick={() => openAccess("create")}>Sign up</button>
          </nav>
        )}
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-index" aria-hidden="true">001—1324</div>
          <div className="hero-copy">
            <p className="eyebrow">The movement archive</p>
            <h1 id="hero-title">Train with<br /><em>intention.</em></h1>
            <p className="hero-description">
              Build distinct routines for personal goals and sport performance—without losing either one.
            </p>
          </div>
          <div className="hero-note">
            <span>FIELD NOTE / 01</span>
            <p>Good training is repeatable. Choose fewer movements. Record the work. Return stronger.</p>
            <ArrowDown size={20} />
          </div>
        </section>

        {hasAppAccess && exercises.length > 0 && (
          <TrainingTracks
            tracks={tracks}
            activeTrackId={activeTrack?.id ?? ""}
            onOpen={openTrack}
            onCreate={createTrack}
            onGenerate={generateRoutine}
            onDelete={deleteTrack}
          />
        )}

        {hasAppAccess && <section className="library" aria-labelledby="library-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Browse / filter / build</p>
              <h2 id="library-title">Exercise library</h2>
            </div>
            <p className="result-count">
              <strong>{filtered.length.toLocaleString()}</strong>
              <span>{filtered.length === 1 ? "movement" : "movements"}</span>
            </p>
          </div>

          <div className="filter-station">
            <label className="search-field">
              <Search size={20} />
              <span className="sr-only">Search exercises</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search movement, muscle, equipment…"
              />
              {query && (
                <button type="button" onClick={() => setQuery("")} aria-label="Clear search"><X size={16} /></button>
              )}
            </label>

            <div className="select-row">
              <label>
                <SlidersHorizontal size={16} />
                <span className="sr-only">Body part</span>
                <select value={bodyPart} onChange={(event) => setBodyPart(event.target.value)}>
                  <option value="">All body parts</option>
                  {bodyParts.map((part) => <option key={part} value={part}>{titleCase(part)}</option>)}
                </select>
              </label>
              <label>
                <Dumbbell size={16} />
                <span className="sr-only">Equipment</span>
                <select value={equipment} onChange={(event) => setEquipment(event.target.value)}>
                  <option value="">All equipment</option>
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
                Saved <span>{favoriteIds.length}</span>
              </button>
            </div>
          </div>

          {loadingError ? (
            <div className="status-card error">
              <h3>Library unavailable</h3><p>{loadingError}</p>
            </div>
          ) : exercises.length === 0 ? (
            <div className="loading-grid" aria-label="Loading exercise library">
              {Array.from({ length: 8 }, (_, index) => <span key={index} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="status-card">
              <h3>No movement fits that brief.</h3>
              <p>Try a broader search or remove one of your filters.</p>
              <button type="button" onClick={clearFilters}>Clear all filters</button>
            </div>
          ) : (
            <>
              <div className="exercise-grid">
                {visibleExercises.map((exercise) => (
                  <ExerciseCard
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
                  Load the next {Math.min(PAGE_SIZE, filtered.length - visibleCount)}
                  <ArrowDown size={17} />
                </button>
              )}
            </>
          )}

          {filtersActive && filtered.length > 0 && (
            <button className="reset-filters" type="button" onClick={clearFilters}>Reset filters</button>
          )}
        </section>}
      </main>

      {hasAppAccess && <footer>
        <div><strong>REPBOOK</strong><span>One profile. More than one priority.</span></div>
        <p>Exercise data © Hasan Emir Yıldırım, MIT. Visual media © <a href="https://gymvisual.com/" target="_blank" rel="noreferrer">Gym visual</a>.</p>
      </footer>}

      {hasAppAccess && <button className="mobile-workout" type="button" onClick={() => setWorkoutOpen(true)}>
        <Dumbbell size={19} /> {activeTrack?.name ?? "Today’s workout"} <strong>{workout.length}</strong>
      </button>}

      {hasAppAccess && selectedExercise && (
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

      {hasAppAccess && workoutOpen && activeTrack && routineAnalysis && (
        <>
          <button className="panel-backdrop" type="button" onClick={() => setWorkoutOpen(false)} aria-label="Close workout" />
          <WorkoutPanel
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

      {hasAppAccess && profileOpen && (
        <ProfilePanel
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
          cloud={cloud}
          profileName={profileName}
          installGuide={installGuide}
          onCreateAccount={(input) => {
            setProfileName(input.name);
            void cloud.createAccount(input);
          }}
          onSignIn={(input) => void cloud.signIn(input)}
          onSignOut={cloud.signOut}
          onInstall={installPrompt ? () => {
            installPrompt.prompt().finally(() => setInstallPrompt(null));
          } : null}
          initialMode={accessMode}
          installTarget={installTarget}
          onClose={() => setAccessOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
