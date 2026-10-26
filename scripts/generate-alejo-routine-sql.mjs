import { readFileSync, writeFileSync } from "fs";

const exercises = JSON.parse(readFileSync("public/data/exercises.json", "utf8"));
const exMap = new Map(exercises.map(e => [e.id, e]));

function verifyEx(id, label) {
  if (!exMap.has(id)) {
    throw new Error(`Exercise ID ${id} (${label}) not found in public/data/exercises.json`);
  }
}

// Build items helper
let itemCounter = 1;
function makeItem({ exerciseId, day, sets, reps, repetitionCount = "total", structureId, structureType = "circuit", position = 0, size = 3, notes = "", setPlan = undefined }) {
  verifyEx(exerciseId, notes);
  return {
    id: `alejo-item-${itemCounter++}`,
    exerciseId,
    day,
    sets,
    reps,
    repetitionCount,
    setPlan: setPlan || undefined,
    structure: structureId ? {
      id: structureId,
      type: structureType,
      position,
      size
    } : undefined,
    notes: notes || undefined
  };
}

const workout = [];

// ==========================================
// LUNES (Pecho, hombro y tríceps)
// ==========================================
// Bloque A: 3 series
// 1. Press de banco inclinado: 8 reps
// 2. Push-up: al fallo
// 3. Escaladores: 30 reps
workout.push(
  makeItem({ exerciseId: "0047", day: "monday", sets: 3, reps: 8, structureId: "mon-block-a", structureType: "circuit", position: 0, size: 3, notes: "Press de banco inclinado" }),
  makeItem({ exerciseId: "0662", day: "monday", sets: 3, reps: 0, setPlan: "3 × Fallo técnico", structureId: "mon-block-a", structureType: "circuit", position: 1, size: 3, notes: "Push-up al fallo técnico" }),
  makeItem({ exerciseId: "0630", day: "monday", sets: 3, reps: 30, structureId: "mon-block-a", structureType: "circuit", position: 2, size: 3, notes: "Escaladores" })
);

// Bloque B: 3 series
// 1. Press de banco plano: 8 reps
// 2. Acordeones en colchoneta: 25 reps
// 3. Abrir y cerrar piernas adelante y atrás: 15 reps (#4011)
workout.push(
  makeItem({ exerciseId: "0025", day: "monday", sets: 3, reps: 8, structureId: "mon-block-b", structureType: "circuit", position: 0, size: 3, notes: "Press de banca plano con barra" }),
  makeItem({ exerciseId: "0871", day: "monday", sets: 3, reps: 25, structureId: "mon-block-b", structureType: "circuit", position: 1, size: 3, notes: "Acordeones en colchoneta" }),
  makeItem({ exerciseId: "4011", day: "monday", sets: 3, reps: 15, structureId: "mon-block-b", structureType: "circuit", position: 2, size: 3, notes: "Plancha dinámica: Tijera y salto al frente" })
);

// Bloque C: 3 series
// 1. Peck Deck: 8–12 reps
// 2. Plancha Superman: 20 reps (#4007)
// 3. Militares: 20 reps
workout.push(
  makeItem({ exerciseId: "0596", day: "monday", sets: 3, reps: 10, structureId: "mon-block-c", structureType: "circuit", position: 0, size: 3, notes: "Peck Deck (8–12 reps)" }),
  makeItem({ exerciseId: "4007", day: "monday", sets: 3, reps: 20, structureId: "mon-block-c", structureType: "circuit", position: 1, size: 3, notes: "Plancha Superman en colchoneta" }),
  makeItem({ exerciseId: "3224", day: "monday", sets: 3, reps: 20, structureId: "mon-block-c", structureType: "circuit", position: 2, size: 3, notes: "Militares (jumping jacks)" })
);

// Bloque D: 3 series
// 1. Press militar: 8 reps
// 2. Vuelos laterales sentado: 8 reps
// 3. Burpees completos: 10 reps
workout.push(
  makeItem({ exerciseId: "1456", day: "monday", sets: 3, reps: 8, structureId: "mon-block-d", structureType: "circuit", position: 0, size: 3, notes: "Press militar con barra" }),
  makeItem({ exerciseId: "0396", day: "monday", sets: 3, reps: 8, structureId: "mon-block-d", structureType: "circuit", position: 1, size: 3, notes: "Vuelos laterales sentado con mancuernas" }),
  makeItem({ exerciseId: "1160", day: "monday", sets: 3, reps: 10, structureId: "mon-block-d", structureType: "circuit", position: 2, size: 3, notes: "Burpees completos" })
);

// Bloque E: 3 series
// 1. Fondos: 15 reps (mín 8)
// 2. Extensión de tríceps con cuerda: 8 reps
// 3. Rodillo abdominal: 15 reps
workout.push(
  makeItem({ exerciseId: "0251", day: "monday", sets: 3, reps: 15, structureId: "mon-block-e", structureType: "circuit", position: 0, size: 3, notes: "Fondos (15 reps — mín 8)" }),
  makeItem({ exerciseId: "0200", day: "monday", sets: 3, reps: 8, structureId: "mon-block-e", structureType: "circuit", position: 1, size: 3, notes: "Extensión de tríceps en polea con cuerda" }),
  makeItem({ exerciseId: "0857", day: "monday", sets: 3, reps: 15, structureId: "mon-block-e", structureType: "circuit", position: 2, size: 3, notes: "Rodillo abdominal en colchoneta" })
);


// ==========================================
// MARTES (Pierna y core)
// ==========================================
// Bloque A: 3 series
// 1. Sentadilla en Smith: 8 reps
// 2. En el step: elevación de rodilla alternada hasta 30 reps (#4010)
workout.push(
  makeItem({ exerciseId: "3281", day: "tuesday", sets: 3, reps: 8, structureId: "tue-block-a", structureType: "biset", position: 0, size: 2, notes: "Sentadilla en Smith" }),
  makeItem({ exerciseId: "4010", day: "tuesday", sets: 3, reps: 30, repetitionCount: "total", structureId: "tue-block-a", structureType: "biset", position: 1, size: 2, notes: "Subida al step con elevación de rodilla alternada (30 reps)" })
);

// Bloque B: 3 series
// 1. Tijera desplazada: 10 pasos ida + 10 regreso
// 2. En colchoneta abrir y cerrar piernas adelante y atrás (#4011): 15 reps
workout.push(
  makeItem({ exerciseId: "1460", day: "tuesday", sets: 3, reps: 20, structureId: "tue-block-b", structureType: "biset", position: 0, size: 2, notes: "Tijera desplazada (10 pasos ida + 10 regreso)" }),
  makeItem({ exerciseId: "4011", day: "tuesday", sets: 3, reps: 15, structureId: "tue-block-b", structureType: "biset", position: 1, size: 2, notes: "Plancha dinámica: Tijera y salto al frente (15 reps)" })
);

// Bloque C: 3 series
// 1. Sentadilla sumo en Hack: 8 reps con buen peso
// 2. En el step: subo, subo, bajo, bajo (15 derecha + 15 izquierda)
workout.push(
  makeItem({ exerciseId: "0755", day: "tuesday", sets: 3, reps: 8, structureId: "tue-block-c", structureType: "biset", position: 0, size: 2, notes: "Sentadilla sumo en Hack con buen peso" }),
  makeItem({ exerciseId: "3672", day: "tuesday", sets: 3, reps: 30, structureId: "tue-block-c", structureType: "biset", position: 1, size: 2, notes: "En el step: subo subo bajo bajo (15 der + 15 izq)" })
);

// Bloque D: 3 series
// 1. Extensión de cuádriceps — Drop set: max peso 6 reps -> mitad 8 reps -> mitad 8 reps + 10s sostener arriba
// 2. Skipping en el puesto: 30 segundos (#4002)
workout.push(
  makeItem({ exerciseId: "0585", day: "tuesday", sets: 3, reps: 22, structureId: "tue-block-d", structureType: "biset", position: 0, size: 2, notes: "Drop set: máx peso 6 reps -> mitad 8 reps -> mitad 8 reps + sostener 10s arriba" }),
  makeItem({ exerciseId: "4002", day: "tuesday", sets: 3, reps: 30, structureId: "tue-block-d", structureType: "biset", position: 1, size: 2, notes: "Skipping en el puesto (30 segundos)" })
);

// Bloque E: 3 series
// 1. Máquina de aductor: 12–15 reps con buen peso
// 2. Militares: 20 reps
// 3. Pantorrilla: 10 reps
// 4. Plancha: 1 minuto (#4003)
workout.push(
  makeItem({ exerciseId: "1712", day: "tuesday", sets: 3, reps: 15, structureId: "tue-block-e", structureType: "circuit", position: 0, size: 4, notes: "Máquina de aductor (12–15 reps con buen peso)" }),
  makeItem({ exerciseId: "3224", day: "tuesday", sets: 3, reps: 20, structureId: "tue-block-e", structureType: "circuit", position: 1, size: 4, notes: "Militares (jumping jacks)" }),
  makeItem({ exerciseId: "1373", day: "tuesday", sets: 3, reps: 10, structureId: "tue-block-e", structureType: "circuit", position: 2, size: 4, notes: "Pantorrilla de pie (10 reps)" }),
  makeItem({ exerciseId: "4003", day: "tuesday", sets: 3, reps: 60, structureId: "tue-block-e", structureType: "circuit", position: 3, size: 4, notes: "Plancha frontal estática (1 minuto)" })
);


// ==========================================
// MIÉRCOLES (Espalda, bíceps y core)
// ==========================================
// Bloque A: 3 series
// 1. Jalón polea frontal agarre cerrado en V: 8 reps
// 2. Militares: 20 reps
// 3. Planchas Spiderman (#4006): 20 reps
workout.push(
  makeItem({ exerciseId: "0150", day: "wednesday", sets: 3, reps: 8, structureId: "wed-block-a", structureType: "circuit", position: 0, size: 3, notes: "Jalón polea frontal agarre cerrado en V" }),
  makeItem({ exerciseId: "3224", day: "wednesday", sets: 3, reps: 20, structureId: "wed-block-a", structureType: "circuit", position: 1, size: 3, notes: "Militares (20 reps)" }),
  makeItem({ exerciseId: "4006", day: "wednesday", sets: 3, reps: 20, structureId: "wed-block-a", structureType: "circuit", position: 2, size: 3, notes: "Plancha Spiderman en colchoneta (20 reps)" })
);

// Bloque B: 3 series
// 1. Remo en máquina Hammer: 8 reps con buen peso
// 2. Planchas Spiderman (#4006): 20 reps
// 3. Plancha antebrazos abrir y cerrar piernas (#4005): 20 reps
workout.push(
  makeItem({ exerciseId: "0571", day: "wednesday", sets: 3, reps: 8, structureId: "wed-block-b", structureType: "circuit", position: 0, size: 3, notes: "Remo en máquina Hammer con buen peso" }),
  makeItem({ exerciseId: "4006", day: "wednesday", sets: 3, reps: 20, structureId: "wed-block-b", structureType: "circuit", position: 1, size: 3, notes: "Plancha Spiderman en colchoneta (20 reps)" }),
  makeItem({ exerciseId: "4005", day: "wednesday", sets: 3, reps: 20, structureId: "wed-block-b", structureType: "circuit", position: 2, size: 3, notes: "Plancha antebrazos abrir y cerrar piernas (20 reps)" })
);

// Bloque C: 3 series
// 1. Remo pullover: 8 reps
// 2. Plancha subir y bajar pelvis (#4008): 20 reps
// 3. Plancha dinámica tijera y salto al frente (#4011): 15 reps
workout.push(
  makeItem({ exerciseId: "1316", day: "wednesday", sets: 3, reps: 8, structureId: "wed-block-c", structureType: "circuit", position: 0, size: 3, notes: "Remo pullover (8 reps)" }),
  makeItem({ exerciseId: "4008", day: "wednesday", sets: 3, reps: 20, structureId: "wed-block-c", structureType: "circuit", position: 1, size: 3, notes: "Plancha subir y bajar pelvis / delfín (20 reps)" }),
  makeItem({ exerciseId: "4011", day: "wednesday", sets: 3, reps: 15, structureId: "wed-block-c", structureType: "circuit", position: 2, size: 3, notes: "Plancha dinámica tijera y salto al frente (15 reps)" })
);

// Bloque D: 3 series
// 1. En polea Pull Face (#4001): 8 reps
// 2. Acordeones en colchoneta: 25 reps
// 3. Escaladores en plancha: 30 reps
workout.push(
  makeItem({ exerciseId: "4001", day: "wednesday", sets: 3, reps: 8, structureId: "wed-block-d", structureType: "circuit", position: 0, size: 3, notes: "Pull Face en polea con cuerda (8 reps)" }),
  makeItem({ exerciseId: "0871", day: "wednesday", sets: 3, reps: 25, structureId: "wed-block-d", structureType: "circuit", position: 1, size: 3, notes: "Acordeones en colchoneta (25 reps)" }),
  makeItem({ exerciseId: "0630", day: "wednesday", sets: 3, reps: 30, structureId: "wed-block-d", structureType: "circuit", position: 2, size: 3, notes: "Escaladores en posición de plancha (30 reps)" })
);

// Bloque E: 7 series
// 1. En polea curl de bíceps: 8 reps con buen peso
workout.push(
  makeItem({ exerciseId: "0868", day: "wednesday", sets: 7, reps: 8, structureId: "wed-block-e", structureType: "single", position: 0, size: 1, notes: "Curl de bíceps en polea con buen peso (7 series × 8 reps)" })
);

// Bloque F: 3 series
// 1. Curl martillo simultáneo: 8 reps
// 2. Boca arriba piernas extendidas tocar pies: 20 reps (en la #20 sostener 10s)
workout.push(
  makeItem({ exerciseId: "1648", day: "wednesday", sets: 3, reps: 8, structureId: "wed-block-f", structureType: "biset", position: 0, size: 2, notes: "Curl martillo ambos brazos simultáneamente (8 reps)" }),
  makeItem({ exerciseId: "0507", day: "wednesday", sets: 3, reps: 20, structureId: "wed-block-f", structureType: "biset", position: 1, size: 2, notes: "Piernas extendidas arriba tocar pies (20 reps; en la #20 sostener 10s)" })
);

// Bloque G: 2 series
// 1. Curl martillo cruzado alternado: 8 reps
// 2. Rodillo abdominal: 10 reps
workout.push(
  makeItem({ exerciseId: "0298", day: "wednesday", sets: 2, reps: 8, structureId: "wed-block-g", structureType: "biset", position: 0, size: 2, notes: "Curl martillo cruzado alternado (8 reps)" }),
  makeItem({ exerciseId: "0857", day: "wednesday", sets: 2, reps: 10, structureId: "wed-block-g", structureType: "biset", position: 1, size: 2, notes: "Rodillo abdominal en colchoneta (10 reps)" })
);

// Bloque H: 3 series
// 1. 21 de bíceps con barra: 7 abajo mitad, 7 mitad arriba, 7 completas
// 2. Lumbares en colchoneta: 25 reps
// 3. Skipping en el puesto (#4002): 30 segundos
workout.push(
  makeItem({ exerciseId: "0047", day: "wednesday", sets: 3, reps: 21, structureId: "wed-block-h", structureType: "circuit", position: 0, size: 3, notes: "21 de bíceps con barra (7 abajo-mitad + 7 mitad-arriba + 7 completas)" }),
  makeItem({ exerciseId: "1352", day: "wednesday", sets: 3, reps: 25, structureId: "wed-block-h", structureType: "circuit", position: 1, size: 3, notes: "Lumbares acostado boca abajo en colchoneta (25 reps)" }),
  makeItem({ exerciseId: "4002", day: "wednesday", sets: 3, reps: 30, structureId: "wed-block-h", structureType: "circuit", position: 2, size: 3, notes: "Skipping en el puesto (30 segundos)" })
);


// ==========================================
// JUEVES (Pierna posterior, glúteo y core)
// ==========================================
// Bloque A: 3 series
// 1. Tijera búlgara: 8 reps por cada pierna
// 2. Plancha Spiderman (#4006): 20 reps
// 3. Plancha sobre antebrazos abrir y cerrar piernas (#4005): 20 reps
workout.push(
  makeItem({ exerciseId: "1001", day: "thursday", sets: 3, reps: 8, repetitionCount: "per-side", structureId: "thu-block-a", structureType: "circuit", position: 0, size: 3, notes: "Tijera búlgara (8 reps por pierna)" }),
  makeItem({ exerciseId: "4006", day: "thursday", sets: 3, reps: 20, structureId: "thu-block-a", structureType: "circuit", position: 1, size: 3, notes: "Plancha Spiderman (20 reps)" }),
  makeItem({ exerciseId: "4005", day: "thursday", sets: 3, reps: 20, structureId: "thu-block-a", structureType: "circuit", position: 2, size: 3, notes: "Plancha sobre antebrazos abrir y cerrar piernas (20 reps)" })
);

// Bloque B: 3 series
// 1. Hip thrust: 8 reps
// 2. Plancha (#4003): 1 minuto
// 3. Escaladores: 30 reps
workout.push(
  makeItem({ exerciseId: "3236", day: "thursday", sets: 3, reps: 8, structureId: "thu-block-b", structureType: "circuit", position: 0, size: 3, notes: "Hip thrust (8 reps)" }),
  makeItem({ exerciseId: "4003", day: "thursday", sets: 3, reps: 60, structureId: "thu-block-b", structureType: "circuit", position: 1, size: 3, notes: "Plancha frontal estática (1 minuto)" }),
  makeItem({ exerciseId: "0630", day: "thursday", sets: 3, reps: 30, structureId: "thu-block-b", structureType: "circuit", position: 2, size: 3, notes: "Escaladores (30 reps)" })
);

// Bloque C: 3 series
// 1. Peso muerto con barra: 8 reps
// 2. Plancha con subida y bajada de pelvis (#4008): 20 reps
// 3. Skipping en el puesto (#4002): 30 segundos
workout.push(
  makeItem({ exerciseId: "0032", day: "thursday", sets: 3, reps: 8, structureId: "thu-block-c", structureType: "circuit", position: 0, size: 3, notes: "Peso muerto con barra (8 reps)" }),
  makeItem({ exerciseId: "4008", day: "thursday", sets: 3, reps: 20, structureId: "thu-block-c", structureType: "circuit", position: 1, size: 3, notes: "Plancha con subida y bajada de pelvis (20 reps)" }),
  makeItem({ exerciseId: "4002", day: "thursday", sets: 3, reps: 30, structureId: "thu-block-c", structureType: "circuit", position: 2, size: 3, notes: "Skipping en el puesto (30 segundos)" })
);

// Bloque D: 3 series
// 1. Curl femoral acostado: 5 reps una pierna + 5 con otra + ambas al fallo
// 2. Manos tocan pies arriba: 20 reps (sostener 10s en la #20)
// 3. Recogiendo moneditas (#4009): 5 veces ida y vuelta
workout.push(
  makeItem({ exerciseId: "0586", day: "thursday", sets: 3, reps: 15, structureId: "thu-block-d", structureType: "circuit", position: 0, size: 3, notes: "Curl femoral acostado (5 pierna der + 5 izq + ambas al fallo)" }),
  makeItem({ exerciseId: "0507", day: "thursday", sets: 3, reps: 20, structureId: "thu-block-d", structureType: "circuit", position: 1, size: 3, notes: "Abdominal piernas extendidas arriba manos tocan pies (20 reps; sostener 10s)" }),
  makeItem({ exerciseId: "4009", day: "thursday", sets: 3, reps: 5, structureId: "thu-block-d", structureType: "circuit", position: 2, size: 3, notes: "Recogiendo moneditas / carrera de agilidad con toque de suelo (5 veces ida y vuelta)" })
);

// Bloque E: 3 series
// 1. Máquina de abductor: 8–12 reps
// 2. Acordeones en colchoneta: 25 reps
// 3. Tocar con mano pie contrario en plancha: 30 reps
workout.push(
  makeItem({ exerciseId: "1427", day: "thursday", sets: 3, reps: 10, structureId: "thu-block-e", structureType: "circuit", position: 0, size: 3, notes: "Máquina de abductor (8–12 reps)" }),
  makeItem({ exerciseId: "0871", day: "thursday", sets: 3, reps: 25, structureId: "thu-block-e", structureType: "circuit", position: 1, size: 3, notes: "Acordeones en colchoneta (25 reps)" }),
  makeItem({ exerciseId: "0664", day: "thursday", sets: 3, reps: 30, repetitionCount: "total", structureId: "thu-block-e", structureType: "circuit", position: 2, size: 3, notes: "En plancha tocar mano con pie contrario alternadamente (30 reps)" })
);

// Bloque F: 3 series
// 1. Pantorrilla: 10 reps
workout.push(
  makeItem({ exerciseId: "1373", day: "thursday", sets: 3, reps: 10, structureId: "thu-block-f", structureType: "single", position: 0, size: 1, notes: "Pantorrilla (10 reps)" })
);


// ==========================================
// VIERNES (Torso, hombro y brazo)
// ==========================================
// Bloque A: 3 series
// 1. Press inclinado con mancuernas: 8 reps
// 2. Plancha Superman (#4007): 20 reps
// 3. En plancha abrir y cerrar piernas (#4004): 20 reps
workout.push(
  makeItem({ exerciseId: "0314", day: "friday", sets: 3, reps: 8, structureId: "fri-block-a", structureType: "circuit", position: 0, size: 3, notes: "Press con mancuernas en banco inclinado (8 reps)" }),
  makeItem({ exerciseId: "4007", day: "friday", sets: 3, reps: 20, structureId: "fri-block-a", structureType: "circuit", position: 1, size: 3, notes: "Plancha Superman (20 reps)" }),
  makeItem({ exerciseId: "4004", day: "friday", sets: 3, reps: 20, structureId: "fri-block-a", structureType: "circuit", position: 2, size: 3, notes: "Saltos de tijera en plancha alta (20 reps)" })
);

// Bloque B: 3 series
// 1. Press de banco plano con mancuernas: 8 reps
// 2. Burpees: 10 reps
workout.push(
  makeItem({ exerciseId: "0289", day: "friday", sets: 3, reps: 8, structureId: "fri-block-b", structureType: "biset", position: 0, size: 2, notes: "Press de banca plano con mancuernas (8 reps)" }),
  makeItem({ exerciseId: "1160", day: "friday", sets: 3, reps: 10, structureId: "fri-block-b", structureType: "biset", position: 1, size: 2, notes: "Burpees (10 reps)" })
);

// Bloque C: 3 series
// 1. Trapecio con mancuernas encogimiento: 8 reps con buen peso
// 2. Militares: 20 reps
// 3. Elevación de piernas en colchoneta: 20 reps (en la #20 sostener a 45° por 10s)
workout.push(
  makeItem({ exerciseId: "0406", day: "friday", sets: 3, reps: 8, structureId: "fri-block-c", structureType: "circuit", position: 0, size: 3, notes: "Trapecio con mancuernas — encogimiento de hombros (8 reps con buen peso)" }),
  makeItem({ exerciseId: "3224", day: "friday", sets: 3, reps: 20, structureId: "fri-block-c", structureType: "circuit", position: 1, size: 3, notes: "Militares (20 reps)" }),
  makeItem({ exerciseId: "0870", day: "friday", sets: 3, reps: 20, structureId: "fri-block-c", structureType: "circuit", position: 2, size: 3, notes: "Elevación de piernas en colchoneta (20 reps; en la #20 sostener a 45° durante 10s)" })
);

// Bloque D: 3 series
// 1. Elevación lateral polea: 8 reps por brazo
// 2. Recogiendo moneditas (#4009): 5 veces ida y vuelta
// 3. Exprimidas: 30 reps (en la #30 sostener 10s)
workout.push(
  makeItem({ exerciseId: "0215", day: "friday", sets: 3, reps: 8, repetitionCount: "per-side", structureId: "fri-block-d", structureType: "circuit", position: 0, size: 3, notes: "Elevación lateral de hombros en polea agarre individual (8 reps por brazo)" }),
  makeItem({ exerciseId: "4009", day: "friday", sets: 3, reps: 5, structureId: "fri-block-d", structureType: "circuit", position: 1, size: 3, notes: "Recogiendo moneditas (5 veces ida y vuelta)" }),
  makeItem({ exerciseId: "0871", day: "friday", sets: 3, reps: 30, structureId: "fri-block-d", structureType: "circuit", position: 2, size: 3, notes: "Exprimidas en colchoneta (30 reps; en la #30 sostener arriba 10s)" })
);

// Bloque E: 3 series
// 1. Elevación frontal de hombros polea agarre invertido: 8 reps
// 2. Skipping en el puesto (#4002): 30 segundos
// 3. Bicicletas abdominales: 30 reps
workout.push(
  makeItem({ exerciseId: "0041", day: "friday", sets: 3, reps: 8, structureId: "fri-block-e", structureType: "circuit", position: 0, size: 3, notes: "Elevación frontal de hombros en polea/barra agarre invertido (8 reps)" }),
  makeItem({ exerciseId: "4002", day: "friday", sets: 3, reps: 30, structureId: "fri-block-e", structureType: "circuit", position: 1, size: 3, notes: "Skipping en el puesto (30 segundos)" }),
  makeItem({ exerciseId: "0003", day: "friday", sets: 3, reps: 30, structureId: "fri-block-e", structureType: "circuit", position: 2, size: 3, notes: "Bicicletas abdominales en colchoneta (30 reps)" })
);

// Bloque F: 3 series
// 1. Flexores del carpo sentado: 8 reps
// 2. Extensores del carpo agarre invertido: 8 reps
// 3. Lumbares en colchoneta: 30 reps
workout.push(
  makeItem({ exerciseId: "1412", day: "friday", sets: 3, reps: 8, structureId: "fri-block-f", structureType: "circuit", position: 0, size: 3, notes: "Flexores del carpo: sentado en el banco (8 reps)" }),
  makeItem({ exerciseId: "1411", day: "friday", sets: 3, reps: 8, structureId: "fri-block-f", structureType: "circuit", position: 1, size: 3, notes: "Extensores del carpo: agarre invertido (8 reps)" }),
  makeItem({ exerciseId: "1352", day: "friday", sets: 3, reps: 30, structureId: "fri-block-f", structureType: "circuit", position: 2, size: 3, notes: "Lumbares acostado boca abajo en colchoneta (30 reps)" })
);

// Bloque G (Opcional): 3 series
// 1. Reverse Flight: 8 reps
// 2. Remo individual: 8 reps por brazo
workout.push(
  makeItem({ exerciseId: "0602", day: "friday", sets: 3, reps: 8, structureId: "fri-block-g", structureType: "biset", position: 0, size: 2, notes: "Reverse Flight / Vuelos posteriores (8 reps)" }),
  makeItem({ exerciseId: "0292", day: "friday", sets: 3, reps: 8, repetitionCount: "per-side", structureId: "fri-block-g", structureType: "biset", position: 1, size: 2, notes: "Remo individual con mancuerna (8 reps por brazo)" })
);


// ==========================================
// SÁBADO (Pierna y acondicionamiento)
// ==========================================
// Bloque A: 3 series
// 1. Sentadilla en Smith: 8 reps
// 2. En el step: elevación de rodilla alternada hasta 30 reps (#4010)
workout.push(
  makeItem({ exerciseId: "3281", day: "saturday", sets: 3, reps: 8, structureId: "sat-block-a", structureType: "biset", position: 0, size: 2, notes: "Sentadilla en Smith" }),
  makeItem({ exerciseId: "4010", day: "saturday", sets: 3, reps: 30, repetitionCount: "total", structureId: "sat-block-a", structureType: "biset", position: 1, size: 2, notes: "En el step: elevación de rodilla alternada hasta 30 reps" })
);

// Bloque B: 3 series
// 1. Tijera desplazada: 10 pasos ida + 10 regreso
// 2. Plancha dinámica tijera y salto al frente (#4011): 15 reps
workout.push(
  makeItem({ exerciseId: "1460", day: "saturday", sets: 3, reps: 20, structureId: "sat-block-b", structureType: "biset", position: 0, size: 2, notes: "Tijera desplazada (10 pasos ida + 10 regreso)" }),
  makeItem({ exerciseId: "4011", day: "saturday", sets: 3, reps: 15, structureId: "sat-block-b", structureType: "biset", position: 1, size: 2, notes: "Plancha dinámica: Tijera y salto al frente (15 reps)" })
);

// Bloque C: 3 series
// 1. Sentadilla sumo en Hack: 8 reps con buen peso
// 2. En el step: subo subo bajo bajo (15 derecha + 15 izquierda)
workout.push(
  makeItem({ exerciseId: "0755", day: "saturday", sets: 3, reps: 8, structureId: "sat-block-c", structureType: "biset", position: 0, size: 2, notes: "Sentadilla sumo en Hack con buen peso" }),
  makeItem({ exerciseId: "3672", day: "saturday", sets: 3, reps: 30, structureId: "sat-block-c", structureType: "biset", position: 1, size: 2, notes: "En el step: subo subo bajo bajo (15 der + 15 izq)" })
);

// Bloque D: 3 series
// 1. Extensión de cuádriceps — Drop set
// 2. Skipping en el puesto (#4002): 30 segundos
workout.push(
  makeItem({ exerciseId: "0585", day: "saturday", sets: 3, reps: 22, structureId: "sat-block-d", structureType: "biset", position: 0, size: 2, notes: "Drop set: máx peso 6 reps -> mitad 8 reps -> mitad 8 reps + sostener 10s arriba" }),
  makeItem({ exerciseId: "4002", day: "saturday", sets: 3, reps: 30, structureId: "sat-block-d", structureType: "biset", position: 1, size: 2, notes: "Skipping en el puesto (30 segundos)" })
);

// Bloque E: 3 series
// 1. Máquina de aductor: 12–15 reps con buen peso
// 2. Militares: 20 reps
// 3. Pantorrilla: 10 reps
// 4. Plancha (#4003): 1 minuto
workout.push(
  makeItem({ exerciseId: "1712", day: "saturday", sets: 3, reps: 15, structureId: "sat-block-e", structureType: "circuit", position: 0, size: 4, notes: "Máquina de aductor (12–15 reps con buen peso)" }),
  makeItem({ exerciseId: "3224", day: "saturday", sets: 3, reps: 20, structureId: "sat-block-e", structureType: "circuit", position: 1, size: 4, notes: "Militares (20 reps)" }),
  makeItem({ exerciseId: "1373", day: "saturday", sets: 3, reps: 10, structureId: "sat-block-e", structureType: "circuit", position: 2, size: 4, notes: "Pantorrilla (10 reps)" }),
  makeItem({ exerciseId: "4003", day: "saturday", sets: 3, reps: 60, structureId: "sat-block-e", structureType: "circuit", position: 3, size: 4, notes: "Plancha frontal estática (1 minuto)" })
);

const track = {
  id: "track-rutina-principal",
  name: "Rutina Principal",
  kind: "goal",
  focus: "strength",
  equipment: "mixed",
  sessionMinutes: 60,
  daysPerWeek: 6,
  trainingDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
  dayLabels: {
    monday: "Lunes: Pecho, hombro y tríceps",
    tuesday: "Martes: Pierna y core",
    wednesday: "Miércoles: Espalda, bíceps y core",
    thursday: "Jueves: Pierna posterior, glúteo y core",
    friday: "Viernes: Torso, hombro y brazo",
    saturday: "Sábado: Pierna y acondicionamiento"
  },
  workout
};

console.log(`Generated Rutina Principal with ${track.workout.length} items across 6 days.`);

// Output full SQL script
const trackJsonEscaped = JSON.stringify(track).replace(/'/g, "''");

const sqlScript = `-- ====================================================================
-- MONTAJE DE «RUTINA PRINCIPAL» PARA ALEJANDRO CORTÉS BURGOS
-- Cuenta: alejandro@ac-setroc.com
-- ====================================================================

DO $$
DECLARE
  v_user_id uuid;
  v_track jsonb := '${trackJsonEscaped}'::jsonb;
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

  -- 2. Obtener el payload actual si existe
  SELECT payload INTO v_current_payload FROM public.repbook_user_data WHERE user_id = v_user_id;

  IF v_current_payload IS NULL THEN
    -- Crear payload inicial completo
    v_new_payload := jsonb_build_object(
      'schemaVersion', 1,
      'profileName', 'Alejo',
      'language', 'es',
      'favoriteIds', jsonb_build_array(),
      'tracks', jsonb_build_array(v_track),
      'activeTrackId', v_track->>'id',
      'tracksInitialized', true,
      'checkIns', jsonb_build_array(),
      'healthProfile', jsonb_build_object(
        'onboardingCompleted', true,
        'initialRoutineDecision', 'accepted',
        'healthDataMode', 'basic',
        'ageYears', 34,
        'metabolicSex', 'male',
        'heightCm', 178,
        'currentWeightKg', 76,
        'activityLevel', 'very-active',
        'experience', 'advanced',
        'dietaryPattern', 'omnivore',
        'allergies', '',
        'healthNotes', ''
      )
    );
  ELSE
    -- Filtrar tracks existentes para reemplazar 'track-rutina-principal' si ya existía
    v_existing_tracks := COALESCE(v_current_payload->'tracks', '[]'::jsonb);
    FOR t IN SELECT * FROM jsonb_array_elements(v_existing_tracks)
    LOOP
      IF t->>'id' <> 'track-rutina-principal' AND t->>'name' <> 'Rutina Principal' THEN
        v_filtered_tracks := v_filtered_tracks || jsonb_build_array(t);
      END IF;
    END LOOP;
    
    -- Agregar el track nuevo al principio
    v_filtered_tracks := jsonb_build_array(v_track) || v_filtered_tracks;

    -- Actualizar payload conservando datos de salud, favoritos y check-ins existentes, pero fijando decisión de rutina aceptada
    v_new_payload := v_current_payload || jsonb_build_object(
      'tracks', v_filtered_tracks,
      'activeTrackId', 'track-rutina-principal',
      'tracksInitialized', true,
      'language', 'es',
      'healthProfile', COALESCE(v_current_payload->'healthProfile', '{}'::jsonb) || jsonb_build_object(
        'onboardingCompleted', true,
        'initialRoutineDecision', 'accepted'
      )
    );
  END IF;

  -- 3. Guardar en repbook_user_data
  INSERT INTO public.repbook_user_data (user_id, payload)
  VALUES (v_user_id, v_new_payload)
  ON CONFLICT (user_id) 
  DO UPDATE SET payload = EXCLUDED.payload;

  RAISE NOTICE 'Rutina Principal montada con éxito para alejandro@ac-setroc.com (6 días, % ejercicios).', jsonb_array_length(v_track->'workout');
END $$;
`;

writeFileSync("supabase/montar-rutina-principal-alejo.sql", sqlScript, "utf8");
writeFileSync("/Users/alejandro/.gemini/antigravity/brain/4756c9d2-ffe2-464b-af7f-c7f1bd15f51c/montar-rutina-principal-alejo.sql", sqlScript, "utf8");
console.log("SQL script written to supabase/montar-rutina-principal-alejo.sql");
