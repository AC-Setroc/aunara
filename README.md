# Aunara

A local-first personal exercise library and workout planner. Aunara uses the 1,324-record [hasaneyldrm/exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset). It keeps data on the device by default and can privately sync each person's profile through Supabase when configured.

## Run locally

```bash
npm install
npm run dev
```

Then open the local address printed by Vite.

## What is included

- Search across movement names, muscles, and equipment
- Filters for body part, equipment, and saved exercises
- Instructions in 10 languages
- A persistent favorites list
- Separate goal and sport tracks that can be active at the same time
- Track cards open their routine directly and can be removed with confirmation
- Suggested routines for strength, muscle gain, fitness, endurance, mobility, beach volleyball, running, cycling, mountain biking, swimming, tennis/padel, and soccer
- All-equipment, mixed, or bodyweight-only routines with equipment-aware movement replacements
- Animated demonstrations and step-by-step instructions from both the library and routine panel
- A persistent personal profile summary with weekly load, tracks, and saved exercises
- A personal health context and weekly check-ins for routine guidance
- Separate email-and-password accounts for private cross-device sync
- Installable app support for Android and iPhone
- Persistent workouts with editable sets and reps for every track
- Responsive layouts for phone and desktop

## Dataset and media terms

The dataset structure and instruction text are MIT-licensed. The thumbnail and GIF media are owned by Gym Visual, require attribution, and are subject to separate reuse terms. This project keeps the attribution visible and loads those assets from the source repository at a pinned commit. Review `public/DATASET_LICENSE` and `public/DATASET_NOTICE.md` before distributing the app.
