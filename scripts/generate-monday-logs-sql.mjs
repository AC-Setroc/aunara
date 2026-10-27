import { readFileSync, writeFileSync } from "fs";

// Load the generator
const genSource = readFileSync("scripts/generate-alejo-routine-sql.mjs", "utf8");

const mondayLogs = {
  "alejo-item-1": {
    loadKg: 50,
    repsCompleted: 7,
    effort: "RPE 9",
    loadNote: "Series: 8, 8, 7 reps @ 50 kg. Dificultad para terminar la última serie"
  },
  "alejo-item-2": {
    loadKg: null,
    repsCompleted: 8,
    effort: "Fallo técnico",
    loadNote: "Series al fallo técnico: 14, 8, 8 reps"
  },
  "alejo-item-3": {
    loadKg: null,
    repsCompleted: 30,
    effort: "RPE 7",
    loadNote: "30 reps (15 por lado)"
  },
  "alejo-item-4": {
    loadKg: 60,
    repsCompleted: 8,
    effort: "RPE 9",
    loadNote: "Series: 8, 8, 8 reps @ 60 kg. Dificultad para terminar la última serie"
  },
  "alejo-item-5": {
    loadKg: null,
    repsCompleted: 20,
    effort: "RPE 8",
    loadNote: "Series: 25, 20, 20 reps. Agotamiento en la última serie"
  },
  "alejo-item-6": {
    loadKg: null,
    repsCompleted: 15,
    effort: "RPE 7",
    loadNote: "15 reps completas"
  },
  "alejo-item-7": {
    loadKg: 72,
    repsCompleted: 8,
    effort: "RPE 9",
    loadNote: "Series: 12 reps @ 66 kg, 8 reps @ 72 kg, 8 reps @ 72 kg. Dificultad para terminar la última serie"
  },
  "alejo-item-8": {
    loadKg: null,
    repsCompleted: 20,
    effort: "RPE 7",
    loadNote: "10 reps por lado (20 reps total)"
  },
  "alejo-item-9": {
    loadKg: null,
    repsCompleted: 20,
    effort: "RPE 7",
    loadNote: "Series: 30, 20, 20 reps"
  },
  "alejo-item-10": {
    notes: "Press militar con mancuernas",
    loadKg: 16,
    repsCompleted: 8,
    effort: "RPE 9",
    loadNote: "Mancuernas de 16 kg por lado (8/8/8 reps). Dificultad en las últimas repeticiones"
  },
  "alejo-item-11": {
    loadKg: 8,
    repsCompleted: 8,
    effort: "RPE 9",
    loadNote: "Mancuernas de 8 kg por lado. Dificultad/agotamiento en las reps finales"
  },
  "alejo-item-12": {
    loadKg: null,
    repsCompleted: 0,
    effort: undefined,
    loadNote: "0 reps. Mucha carga acumulada en los bloques anteriores para los burpees"
  },
  "alejo-item-13": {
    reps: 8,
    notes: "Fondos en paralelas (8 reps)",
    loadKg: null,
    repsCompleted: 3,
    effort: "Fallo técnico",
    loadNote: "Series: 6, 3 reps. Fatiga muy alta en tríceps/pectoral"
  },
  "alejo-item-14": {
    loadKg: 23,
    repsCompleted: 8,
    effort: "RPE 9",
    loadNote: "23 kg en polea con cuerda (8, 8 reps). Dificultad en las últimas reps"
  },
  "alejo-item-15": {
    loadKg: null,
    repsCompleted: 10,
    effort: "RPE 8",
    loadNote: "Series: 10, 10 reps"
  }
};

// Also read current SQL file to extract the exact v_track
const sqlFile = readFileSync("supabase/montar-rutina-principal-alejo.sql", "utf8");
const trackMatch = sqlFile.match(/v_track jsonb := '({.*?})'::jsonb;/s);
if (!trackMatch) {
  throw new Error("Could not find v_track in SQL file");
}
const track = JSON.parse(trackMatch[1]);

// Inject logs into Monday workout items
const date = "2026-10-26";
track.workout = track.workout.map((item) => {
  const log = mondayLogs[item.id];
  if (!log) return item;

  const updatedItem = { ...item };
  if (log.notes) updatedItem.notes = log.notes;
  if (log.reps !== undefined) updatedItem.reps = log.reps;

  updatedItem.loadKg = log.loadKg ?? null;
  updatedItem.repsCompleted = log.repsCompleted;
  updatedItem.effort = log.effort;
  updatedItem.loadNote = log.loadNote;

  const historyEntry = {
    id: `${item.id}-${date}-0`,
    date,
    loadKg: log.loadKg ?? null,
    repsCompleted: log.repsCompleted,
    effort: log.effort,
    setPlan: item.setPlan ?? `${item.sets} × ${item.reps}`,
    loadNote: log.loadNote,
  };

  updatedItem.loadHistory = [historyEntry];
  return updatedItem;
});

const updatedTrackJson = JSON.stringify(track);

const injectSql = `-- ====================================================================
-- REGISTRO DE CARGAS DEL LUNES 2026-10-26 PARA ALEJANDRO CORTÉS BURGOS
-- Cuenta: alejandro@ac-setroc.com (Actualización con 15 registros de carga)
-- ====================================================================

DO $$
DECLARE
  v_user_id uuid;
  v_track jsonb := '${updatedTrackJson.replace(/'/g, "''")}'::jsonb;
  v_current_payload jsonb;
  v_new_payload jsonb;
  v_existing_tracks jsonb;
  v_filtered_tracks jsonb := '[]'::jsonb;
  t jsonb;
BEGIN
  -- 1. Obtener el ID del usuario
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'alejandro@ac-setroc.com';
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario alejandro@ac-setroc.com no encontrado en auth.users';
  END IF;

  -- 2. Obtener el payload actual
  SELECT payload INTO v_current_payload FROM public.repbook_user_data WHERE user_id = v_user_id;

  IF v_current_payload IS NULL THEN
    RAISE EXCEPTION 'No se encontró payload previo en repbook_user_data para alejandro@ac-setroc.com';
  END IF;

  -- Filtrar tracks existentes para reemplazar 'track-rutina-principal'
  v_existing_tracks := COALESCE(v_current_payload->'tracks', '[]'::jsonb);
  FOR t IN SELECT * FROM jsonb_array_elements(v_existing_tracks)
  LOOP
    IF t->>'id' <> 'track-rutina-principal' AND t->>'name' <> 'Rutina Principal' THEN
      v_filtered_tracks := v_filtered_tracks || jsonb_build_array(t);
    END IF;
  END LOOP;
  
  -- Agregar el track con las cargas al principio
  v_filtered_tracks := jsonb_build_array(v_track) || v_filtered_tracks;

  -- Actualizar payload conservando datos de salud, favoritos y check-ins existentes
  v_new_payload := v_current_payload || jsonb_build_object(
    'tracks', v_filtered_tracks,
    'activeTrackId', 'track-rutina-principal',
    'tracksInitialized', true,
    'language', 'es'
  );

  -- 3. Guardar en repbook_user_data
  UPDATE public.repbook_user_data
  SET payload = v_new_payload
  WHERE user_id = v_user_id;

  RAISE NOTICE 'Cargas del lunes guardadas con éxito para alejandro@ac-setroc.com (15 ejercicios registrados hoy).';
END $$;
`;

writeFileSync("supabase/registrar-cargas-lunes-alejo.sql", injectSql, "utf8");
console.log("Script successfully generated: supabase/registrar-cargas-lunes-alejo.sql");
