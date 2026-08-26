import { readFile, rename, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { buildBilingualExerciseDirectory } from "./lib/bilingual-exercise-directory.mjs";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const sourcePath = `${projectRoot}public/data/exercises.json`;
const overridesPath = `${projectRoot}public/data/exercise-directory/name-overrides.es.json`;
const taxonomyPath = `${projectRoot}public/data/exercise-directory/taxonomy.es.json`;
const ownedMediaPath = `${projectRoot}public/data/exercise-directory/owned-media.json`;
const outputPath = `${projectRoot}public/data/exercise-directory/en-es.json`;

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

const [exercises, nameOverrides, taxonomyTranslations, ownedMediaByExerciseId] = await Promise.all([
  readJson(sourcePath),
  readJson(overridesPath),
  readJson(taxonomyPath),
  readJson(ownedMediaPath),
]);

const directory = buildBilingualExerciseDirectory({
  exercises,
  nameOverrides,
  taxonomyTranslations,
  ownedMediaByExerciseId,
  source: {
    repository: "hasaneyldrm/exercises-dataset",
    url: "https://github.com/hasaneyldrm/exercises-dataset",
    license: "MIT",
    dataPath: "/data/exercises.json",
  },
});
const serialized = `${JSON.stringify(directory, null, 2)}\n`;

if (process.argv.includes("--check")) {
  const current = await readFile(outputPath, "utf8").catch(() => "");
  if (current !== serialized) {
    throw new Error("The bilingual exercise directory is out of date. Run npm run build:exercise-directory.");
  }
} else {
  const temporaryPath = `${outputPath}.tmp`;
  await writeFile(temporaryPath, serialized, "utf8");
  await rename(temporaryPath, outputPath);
  console.log(`Built ${directory.exercises.length} bilingual exercise directory entries.`);
  console.log(`Curated Spanish names: ${directory.translationSummary.curated}. Pending review: ${directory.translationSummary.pending}.`);
}
