import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";

const directoryModule = await import("./lib/bilingual-exercise-directory.mjs").catch(() => null);

const exercise = {
  id: "0001",
  name: "barbell deadlift",
  category: "upper legs",
  body_part: "upper legs",
  equipment: "barbell",
  target: "glutes",
  muscle_group: "hamstrings",
  secondary_muscles: ["lower back"],
  media_id: "media-1",
  image: "images/0001.jpg",
  gif_url: "videos/0001.gif",
  attribution: "Legacy attribution",
};

const taxonomyTranslations = {
  "upper legs": "Muslos",
  barbell: "Barra",
  glutes: "Glúteos",
  hamstrings: "Isquiotibiales",
  "lower back": "Zona lumbar",
};

test("exposes a pure bilingual-directory builder", () => {
  assert.equal(typeof directoryModule?.buildBilingualExerciseDirectory, "function");
});

test("builds stable bilingual entries with translation and owned-media status", () => {
  assert.ok(directoryModule);
  const directory = directoryModule.buildBilingualExerciseDirectory({
    exercises: [exercise, { ...exercise, id: "0002", name: "unreviewed movement" }],
    nameOverrides: { "barbell deadlift": "Peso muerto con barra" },
    taxonomyTranslations,
    ownedMediaByExerciseId: {
      "0001": {
        status: "ready",
        animation: "animations/0001-v1.webm",
        poster: "posters/0001-v1.webp",
        version: 1,
      },
    },
    source: { repository: "hasaneyldrm/exercises-dataset", license: "MIT" },
  });

  assert.equal(directory.schemaVersion, 1);
  assert.equal(directory.exercises.length, 2);
  assert.deepEqual(directory.languages, ["en", "es"]);
  assert.equal(directory.translationSummary.curated, 1);
  assert.equal(directory.translationSummary.pending, 1);

  const curated = directory.exercises[0];
  assert.equal(curated.id, "0001");
  assert.deepEqual(curated.name, { en: "Barbell Deadlift", es: "Peso muerto con barra" });
  assert.deepEqual(curated.nameTranslation, { status: "curated", source: "aunara-override" });
  assert.equal(curated.taxonomy.equipment.es, "Barra");
  assert.ok(curated.searchAliases.es.includes("peso muerto con barra"));
  assert.deepEqual(curated.ownedMedia, {
    status: "ready",
    animation: "animations/0001-v1.webm",
    poster: "posters/0001-v1.webp",
    version: 1,
  });

  const pending = directory.exercises[1];
  assert.equal(pending.name.es, "Unreviewed Movement");
  assert.deepEqual(pending.nameTranslation, { status: "pending", source: "english-fallback" });
});

test("rejects untranslated taxonomy terms instead of silently mixing languages", () => {
  assert.ok(directoryModule);
  assert.throws(() => directoryModule.buildBilingualExerciseDirectory({
    exercises: [{ ...exercise, equipment: "unknown machine" }],
    nameOverrides: {},
    taxonomyTranslations,
    ownedMediaByExerciseId: {},
    source: { repository: "hasaneyldrm/exercises-dataset", license: "MIT" },
  }), /Missing Spanish taxonomy translation: unknown machine/);
});

test("covers every source exercise and every taxonomy term in the real dataset", async () => {
  assert.ok(directoryModule);
  const projectRoot = fileURLToPath(new URL("../", import.meta.url));
  const readJson = async (relativePath) => JSON.parse(await readFile(`${projectRoot}${relativePath}`, "utf8"));
  const [exercises, nameOverrides, realTaxonomyTranslations, ownedMediaByExerciseId] = await Promise.all([
    readJson("public/data/exercises.json"),
    readJson("public/data/exercise-directory/name-overrides.es.json"),
    readJson("public/data/exercise-directory/taxonomy.es.json"),
    readJson("public/data/exercise-directory/owned-media.json"),
  ]);
  const directory = directoryModule.buildBilingualExerciseDirectory({
    exercises,
    nameOverrides,
    taxonomyTranslations: realTaxonomyTranslations,
    ownedMediaByExerciseId,
    source: { repository: "hasaneyldrm/exercises-dataset", license: "MIT" },
  });

  assert.equal(directory.exercises.length, exercises.length);
  assert.equal(new Set(directory.exercises.map((entry) => entry.id)).size, exercises.length);
  assert.equal(directory.translationSummary.curated + directory.translationSummary.pending, exercises.length);
  assert.ok(directory.exercises.every((entry) => entry.taxonomy.equipment.es.length > 0));
  assert.ok(directory.exercises.every((entry) => entry.ownedMedia.status === "not-started"));
});
