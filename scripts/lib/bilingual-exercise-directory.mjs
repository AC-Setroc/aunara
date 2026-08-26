function titleCase(value) {
  return String(value)
    .split(" ")
    .map((word) => word ? word[0].toUpperCase() + word.slice(1) : word)
    .join(" ");
}

function uniqueAliases(values) {
  return Array.from(new Set(values.map((value) => String(value).trim().toLocaleLowerCase()).filter(Boolean)));
}

function translatedTaxonomy(value, taxonomyTranslations) {
  const spanish = taxonomyTranslations[value];
  if (!spanish) throw new Error(`Missing Spanish taxonomy translation: ${value}`);
  return { key: value, en: titleCase(value), es: spanish };
}

function ownedMediaForExercise(exerciseId, ownedMediaByExerciseId) {
  const ownedMedia = ownedMediaByExerciseId[exerciseId];
  if (!ownedMedia || ownedMedia.status === "not-started") return { status: "not-started" };
  if (
    ownedMedia.status !== "ready"
    || !ownedMedia.animation
    || !ownedMedia.poster
    || !Number.isInteger(ownedMedia.version)
    || ownedMedia.version < 1
  ) {
    throw new Error(`Invalid owned media entry: ${exerciseId}`);
  }
  return {
    status: "ready",
    animation: ownedMedia.animation,
    poster: ownedMedia.poster,
    version: ownedMedia.version,
  };
}

function buildExerciseEntry(exercise, nameOverrides, taxonomyTranslations, ownedMediaByExerciseId) {
  const curatedSpanishName = nameOverrides[exercise.name];
  const englishName = titleCase(exercise.name);
  const spanishName = curatedSpanishName ?? englishName;
  const category = translatedTaxonomy(exercise.category, taxonomyTranslations);
  const bodyPart = translatedTaxonomy(exercise.body_part, taxonomyTranslations);
  const equipment = translatedTaxonomy(exercise.equipment, taxonomyTranslations);
  const target = translatedTaxonomy(exercise.target, taxonomyTranslations);
  const muscleGroup = translatedTaxonomy(exercise.muscle_group, taxonomyTranslations);
  const secondaryMuscles = exercise.secondary_muscles.map((muscle) => (
    translatedTaxonomy(muscle, taxonomyTranslations)
  ));

  return {
    id: exercise.id,
    canonicalKey: exercise.name,
    name: { en: englishName, es: spanishName },
    nameTranslation: curatedSpanishName
      ? { status: "curated", source: "aunara-override" }
      : { status: "pending", source: "english-fallback" },
    taxonomy: { category, bodyPart, equipment, target, muscleGroup, secondaryMuscles },
    searchAliases: {
      en: uniqueAliases([
        exercise.name,
        englishName,
        category.en,
        bodyPart.en,
        equipment.en,
        target.en,
        muscleGroup.en,
        ...secondaryMuscles.map((muscle) => muscle.en),
      ]),
      es: uniqueAliases([
        spanishName,
        category.es,
        bodyPart.es,
        equipment.es,
        target.es,
        muscleGroup.es,
        ...secondaryMuscles.map((muscle) => muscle.es),
      ]),
    },
    contentReference: {
      datasetId: exercise.id,
      languages: ["en", "es"],
    },
    legacyMedia: {
      mediaId: exercise.media_id,
      image: exercise.image,
      animation: exercise.gif_url,
      attribution: exercise.attribution,
    },
    ownedMedia: ownedMediaForExercise(exercise.id, ownedMediaByExerciseId),
  };
}

export function buildBilingualExerciseDirectory({
  exercises,
  nameOverrides,
  taxonomyTranslations,
  ownedMediaByExerciseId = {},
  source,
}) {
  const ids = new Set();
  const entries = exercises.map((exercise) => {
    if (ids.has(exercise.id)) throw new Error(`Duplicate exercise id: ${exercise.id}`);
    ids.add(exercise.id);
    return buildExerciseEntry(exercise, nameOverrides, taxonomyTranslations, ownedMediaByExerciseId);
  });
  for (const exerciseId of Object.keys(ownedMediaByExerciseId)) {
    if (!ids.has(exerciseId)) throw new Error(`Owned media references unknown exercise id: ${exerciseId}`);
  }
  const curated = entries.filter((entry) => entry.nameTranslation.status === "curated").length;

  return {
    schemaVersion: 1,
    source: { ...source, exerciseCount: entries.length },
    languages: ["en", "es"],
    translationSummary: { curated, pending: entries.length - curated },
    exercises: entries,
  };
}
