import {
  Activity,
  CalendarDays,
  Droplets,
  Dumbbell,
  Heart,
  Ruler,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserRound,
  Utensils,
  X,
} from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { searchFoodData, type FoodSearchResult } from "../lib/foodData";
import { createWellnessSummary } from "../lib/wellness";
import type { HealthProfile, TrainingTrack, WeeklyCheckIn } from "../types";
import { trackFocusLabel } from "./TrainingTracks";

interface ProfilePanelProps {
  name: string;
  tracks: TrainingTrack[];
  activeTrackId: string;
  favoriteCount: number;
  healthProfile: HealthProfile;
  checkIns: WeeklyCheckIn[];
  onNameChange: (name: string) => void;
  onHealthProfileChange: (profile: HealthProfile) => void;
  onAddCheckIn: (checkIn: WeeklyCheckIn) => void;
  onOpenTrack: (trackId: string) => void;
  onClose: () => void;
}

type ProfileTab = "overview" | "body" | "checkin" | "nutrition";

function optionalNumber(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ProfilePanel({
  name,
  tracks,
  activeTrackId,
  favoriteCount,
  healthProfile,
  checkIns,
  onNameChange,
  onHealthProfileChange,
  onAddCheckIn,
  onOpenTrack,
  onClose,
}: ProfilePanelProps) {
  const [tab, setTab] = useState<ProfileTab>("overview");
  const [foodQuery, setFoodQuery] = useState("");
  const [foodResults, setFoodResults] = useState<FoodSearchResult[]>([]);
  const [foodLoading, setFoodLoading] = useState(false);
  const [foodError, setFoodError] = useState("");
  const [checkInSaved, setCheckInSaved] = useState(false);
  const [checkIn, setCheckIn] = useState<WeeklyCheckIn>(() => ({
    id: today(),
    date: today(),
    weightKg: healthProfile.currentWeightKg,
    sleepHours: null,
    energy: 3,
    stress: 3,
    notes: "",
  }));
  const plannedSessions = tracks.reduce((sum, track) => sum + track.daysPerWeek, 0);
  const wellness = useMemo(() => createWellnessSummary(healthProfile), [healthProfile]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.classList.add("modal-open");
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  function updateHealth<Key extends keyof HealthProfile>(key: Key, value: HealthProfile[Key]) {
    onHealthProfileChange({ ...healthProfile, [key]: value });
  }

  function saveCheckIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const saved = { ...checkIn, id: checkIn.date };
    onAddCheckIn(saved);
    setCheckInSaved(true);
  }

  async function searchFoods(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFoodError("");
    setFoodLoading(true);
    try {
      setFoodResults(await searchFoodData(foodQuery));
    } catch (error) {
      setFoodResults([]);
      setFoodError(error instanceof Error ? error.message : "Food search is unavailable.");
    } finally {
      setFoodLoading(false);
    }
  }

  return (
    <div className="profile-backdrop" role="presentation" onMouseDown={onClose}>
      <aside
        className="profile-panel"
        role="dialog"
        aria-modal="true"
        aria-label="My profile"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="profile-heading">
          <div className="profile-avatar"><UserRound size={28} /></div>
          <div>
            <p className="eyebrow">Private field file / 01</p>
            <h2>My profile</h2>
          </div>
          <button className="close-button inline" type="button" onClick={onClose} aria-label="Close profile"><X size={20} /></button>
        </div>

        <nav className="profile-tabs" aria-label="Profile sections">
          <button type="button" className={tab === "overview" ? "is-active" : ""} onClick={() => setTab("overview")}>Overview</button>
          <button type="button" className={tab === "body" ? "is-active" : ""} onClick={() => setTab("body")}>Body and health</button>
          <button type="button" className={tab === "checkin" ? "is-active" : ""} onClick={() => setTab("checkin")}>Weekly check-in</button>
          <button type="button" className={tab === "nutrition" ? "is-active" : ""} onClick={() => setTab("nutrition")}>Nutrition</button>
        </nav>

        {tab === "overview" && (
          <div className="profile-tab-panel">
            <label className="profile-name-field">
              <span>Profile name</span>
              <input value={name} onChange={(event) => onNameChange(event.target.value)} placeholder="My profile" />
            </label>

            <div className="profile-stats">
              <div><Dumbbell size={18} /><strong>{tracks.length}</strong><span>training tracks</span></div>
              <div><CalendarDays size={18} /><strong>{plannedSessions}</strong><span>weekly sessions</span></div>
              <div><Heart size={18} /><strong>{favoriteCount}</strong><span>saved exercises</span></div>
            </div>

            <div className="health-snapshot">
              <div>
                <p className="section-kicker">Body context</p>
                <strong>{healthProfile.currentWeightKg ? `${healthProfile.currentWeightKg} kg` : "Not set"}</strong>
                <span>{wellness.bmi ? `BMI reference ${wellness.bmi.value}` : "Add height and weight"}</span>
              </div>
              <div>
                <p className="section-kicker">Latest recovery</p>
                <strong>{checkIns[0]?.sleepHours ? `${checkIns[0].sleepHours} h sleep` : "No check-in"}</strong>
                <span>{checkIns[0] ? `Energy ${checkIns[0].energy}/5 · Stress ${checkIns[0].stress}/5` : "Log your week"}</span>
              </div>
              <button type="button" onClick={() => setTab("body")}>Complete health context <Ruler size={15} /></button>
            </div>

            <div className="profile-priorities">
              <p className="section-kicker">Training priorities</p>
              {tracks.length ? tracks.map((track) => (
                <button key={track.id} type="button" onClick={() => onOpenTrack(track.id)}>
                  <span>{track.kind === "sport" ? <Trophy size={16} /> : <Activity size={16} />}</span>
                  <span><strong>{track.name}</strong><small>{trackFocusLabel(track.focus)} · {track.daysPerWeek}× weekly</small></span>
                  <em>{track.id === activeTrackId ? "Active" : "Open"}</em>
                </button>
              )) : <p className="profile-empty">No training tracks yet. Add one from the Training Tracks section.</p>}
            </div>
          </div>
        )}

        {tab === "body" && (
          <div className="profile-tab-panel">
            <div className="profile-section-intro">
              <p className="section-kicker">Body & health context</p>
              <h3>Better inputs. Better explanations.</h3>
              <p>These details add context to routine and nutrition guidance. They do not create a diagnosis or a single “ideal” weight.</p>
            </div>

            <div className="health-form-grid">
              <NumericField label="Age" value={healthProfile.ageYears} unit="years" min={18} max={100} onChange={(value) => updateHealth("ageYears", value)} />
              <label className="health-field">
                <span>Metabolic reference</span>
                <select value={healthProfile.metabolicSex} onChange={(event) => updateHealth("metabolicSex", event.target.value as HealthProfile["metabolicSex"])}>
                  <option value="unspecified">Prefer not to use</option>
                  <option value="female">Female equation</option>
                  <option value="male">Male equation</option>
                </select>
                <small>Only used for energy estimates.</small>
              </label>
              <NumericField label="Height" accessibleLabel="Height in centimeters" value={healthProfile.heightCm} unit="cm" min={100} max={250} onChange={(value) => updateHealth("heightCm", value)} />
              <NumericField label="Current weight" accessibleLabel="Current weight in kilograms" value={healthProfile.currentWeightKg} unit="kg" min={30} max={350} step="0.1" onChange={(value) => updateHealth("currentWeightKg", value)} />
              <NumericField label="Goal weight" accessibleLabel="Goal weight in kilograms" value={healthProfile.targetWeightKg} unit="kg" min={30} max={350} step="0.1" onChange={(value) => updateHealth("targetWeightKg", value)} />
              <NumericField label="Waist" accessibleLabel="Waist circumference in centimeters" value={healthProfile.waistCm} unit="cm" min={40} max={220} step="0.1" onChange={(value) => updateHealth("waistCm", value)} />
              <label className="health-field">
                <span>Daily activity</span>
                <select value={healthProfile.activityLevel} onChange={(event) => updateHealth("activityLevel", event.target.value as HealthProfile["activityLevel"])}>
                  <option value="sedentary">Mostly seated</option>
                  <option value="light">Lightly active</option>
                  <option value="moderate">Moderately active</option>
                  <option value="very-active">Very active</option>
                </select>
              </label>
              <label className="health-field">
                <span>Training experience</span>
                <select value={healthProfile.experience} onChange={(event) => updateHealth("experience", event.target.value as HealthProfile["experience"])}>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </label>
            </div>

            <label className="health-field health-notes">
              <span>Limitations or professional guidance</span>
              <textarea
                value={healthProfile.healthNotes}
                onChange={(event) => updateHealth("healthNotes", event.target.value)}
                placeholder="Example: avoid deep knee flexion; physiotherapist approved low-impact strength."
              />
              <small>Repbook will remind you to review this note; it will not interpret medical conditions.</small>
            </label>

            <div className="reference-card">
              <ShieldCheck size={20} />
              <div>
                <strong>{wellness.bmi ? `${wellness.bmi.value} · ${wellness.bmi.label}` : "Reference appears when height and weight are complete"}</strong>
                <p>BMI is shown only as a general screening reference. Progress also includes performance, recovery, waist trend, and how you feel.</p>
              </div>
            </div>
          </div>
        )}

        {tab === "checkin" && (
          <div className="profile-tab-panel">
            <div className="profile-section-intro">
              <p className="section-kicker">Weekly field note</p>
              <h3>Recovery changes the plan.</h3>
              <p>One calm check-in per week is more useful than reacting to daily fluctuations.</p>
            </div>

            <form className="checkin-form" onSubmit={saveCheckIn}>
              <label className="health-field">
                <span>Date</span>
                <input type="date" value={checkIn.date} onChange={(event) => {
                  setCheckInSaved(false);
                  setCheckIn((current) => ({ ...current, date: event.target.value }));
                }} />
              </label>
              <NumericField label="Weight" accessibleLabel="Check-in weight in kilograms" value={checkIn.weightKg} unit="kg" min={30} max={350} step="0.1" onChange={(value) => {
                setCheckInSaved(false);
                setCheckIn((current) => ({ ...current, weightKg: value }));
              }} />
              <NumericField label="Average sleep" accessibleLabel="Average sleep hours" value={checkIn.sleepHours} unit="hours" min={0} max={14} step="0.1" onChange={(value) => {
                setCheckInSaved(false);
                setCheckIn((current) => ({ ...current, sleepHours: value }));
              }} />
              <RangeField label="Energy" value={checkIn.energy} low="Drained" high="Excellent" onChange={(value) => {
                setCheckInSaved(false);
                setCheckIn((current) => ({ ...current, energy: value }));
              }} />
              <RangeField label="Stress" value={checkIn.stress} low="Low" high="High" onChange={(value) => {
                setCheckInSaved(false);
                setCheckIn((current) => ({ ...current, stress: value }));
              }} />
              <label className="health-field checkin-notes">
                <span>Notes</span>
                <textarea value={checkIn.notes} onChange={(event) => {
                  setCheckInSaved(false);
                  setCheckIn((current) => ({ ...current, notes: event.target.value }));
                }} placeholder="Soreness, match load, travel, pain, or anything that changed the week." />
              </label>
              <button className="save-checkin" type="submit">{checkInSaved ? "Check-in saved" : "Save weekly check-in"}</button>
            </form>

            {checkIns.length > 0 && (
              <div className="checkin-history">
                <p className="section-kicker">Recent notes</p>
                {checkIns.slice(0, 4).map((item) => (
                  <div key={item.id}>
                    <strong>{item.date}</strong>
                    <span>{item.weightKg ? `${item.weightKg} kg` : "No weight"} · {item.sleepHours ? `${item.sleepHours} h sleep` : "No sleep"} · Energy {item.energy}/5</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "nutrition" && (
          <div className="profile-tab-panel">
            <div className="profile-section-intro">
              <p className="section-kicker">Nutrition companion</p>
              <h3>Ranges, not rigid prescriptions.</h3>
              <p>These are planning estimates for an adult. Medical conditions, pregnancy, eating disorders, or prescribed diets require professional guidance.</p>
            </div>

            <div className="nutrition-ranges" aria-label="Nutrition planning ranges">
              <div><Sparkles size={18} /><span>Protein</span><strong>{wellness.proteinGrams ? `${wellness.proteinGrams.min}–${wellness.proteinGrams.max} g` : "Add weight"}</strong><small>daily planning range</small></div>
              <div><Droplets size={18} /><span>Fluids</span><strong>{wellness.hydrationLiters ? `${wellness.hydrationLiters.min}–${wellness.hydrationLiters.max} L` : "Add weight"}</strong><small>starting range; heat and sport add needs</small></div>
              <div><Utensils size={18} /><span>Maintenance</span><strong>{wellness.maintenanceCalories ? `${wellness.maintenanceCalories.min.toLocaleString()}–${wellness.maintenanceCalories.max.toLocaleString()}` : "Add complete body data"}</strong><small>estimated kcal/day, not a prescription</small></div>
            </div>

            <div className="nutrition-preferences">
              <label className="health-field">
                <span>Eating pattern</span>
                <select value={healthProfile.dietaryPattern} onChange={(event) => updateHealth("dietaryPattern", event.target.value as HealthProfile["dietaryPattern"])}>
                  <option value="omnivore">Omnivore</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="pescatarian">Pescatarian</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <label className="health-field">
                <span>Allergies / intolerances</span>
                <input value={healthProfile.allergies} onChange={(event) => updateHealth("allergies", event.target.value)} placeholder="Example: peanuts, lactose" />
              </label>
            </div>

            <form className="food-search" onSubmit={searchFoods}>
              <div>
                <label htmlFor="usda-food-search">Search USDA foods</label>
                <p>Look up ingredients and basic foods in FoodData Central.</p>
              </div>
              <div className="food-search-row">
                <span><Search size={17} /><input id="usda-food-search" value={foodQuery} onChange={(event) => setFoodQuery(event.target.value)} placeholder="Oats, banana, salmon…" /></span>
                <button type="submit" disabled={foodLoading || !foodQuery.trim()}>{foodLoading ? "Searching…" : "Search foods"}</button>
              </div>
            </form>

            {foodError && <p className="food-error">{foodError}</p>}
            {foodResults.length > 0 && (
              <div className="food-results" aria-live="polite">
                {foodResults.map((food) => (
                  <article key={food.id}>
                    <div><strong>{food.name}</strong><small>{food.dataType} · values per {food.serving}</small></div>
                    <dl>
                      <div><dt>kcal</dt><dd>{food.calories ?? "—"}</dd></div>
                      <div><dt>protein</dt><dd>{food.proteinGrams === null ? "—" : `${food.proteinGrams} g`}</dd></div>
                      <div><dt>carbs</dt><dd>{food.carbohydrateGrams === null ? "—" : `${food.carbohydrateGrams} g`}</dd></div>
                      <div><dt>fat</dt><dd>{food.fatGrams === null ? "—" : `${food.fatGrams} g`}</dd></div>
                    </dl>
                  </article>
                ))}
              </div>
            )}

            <p className="profile-note">Food searches are sent to the USDA FoodData Central service. Your personal information stays on this device unless you sign in to your private cloud account.</p>
          </div>
        )}

        <button className="profile-done" type="button" onClick={onClose}>Done</button>
      </aside>
    </div>
  );
}

interface NumericFieldProps {
  label: string;
  accessibleLabel?: string;
  value: number | null;
  unit: string;
  min: number;
  max: number;
  step?: string;
  onChange: (value: number | null) => void;
}

function NumericField({ label, accessibleLabel, value, unit, min, max, step = "1", onChange }: NumericFieldProps) {
  return (
    <label className="health-field numeric-field">
      <span>{label}</span>
      <span className="numeric-input">
        <input
          aria-label={accessibleLabel ?? label}
          type="number"
          inputMode="decimal"
          value={value ?? ""}
          min={min}
          max={max}
          step={step}
          onChange={(event) => onChange(optionalNumber(event.target.value))}
        />
        <small>{unit}</small>
      </span>
    </label>
  );
}

interface RangeFieldProps {
  label: string;
  value: number;
  low: string;
  high: string;
  onChange: (value: number) => void;
}

function RangeField({ label, value, low, high, onChange }: RangeFieldProps) {
  return (
    <label className="health-field range-field">
      <span>{label} <strong>{value}/5</strong></span>
      <input type="range" min="1" max="5" value={value} onChange={(event) => onChange(Number(event.target.value))} />
      <small><i>{low}</i><i>{high}</i></small>
    </label>
  );
}
