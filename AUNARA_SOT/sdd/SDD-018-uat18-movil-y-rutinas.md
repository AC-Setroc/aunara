# SDD-018 — UAT 18-10 en iPhone: formularios, rutinas y editor

2026-10-18 · `[AUNARA/claude · modelo no expuesto]` · **Implementado localmente; sin commit a `main`, sin publicación.**

## Autorización y decisiones del Operator (chat, 18-10)
- «Corregí esto junto con lo anterior para continuar» tras su UAT en iPhone (`http://192.168.80.19:5173/`). Supera el «No todavía» que había dado antes a esta enmienda.
- Rutina sugerida: **4 a 6 ejercicios por día** para nivel intermedio.
- Consentimiento opcional: **azul de marca, atenuado**.
- Para pedir correo de acceso se prueba en `localhost` (la LAN no se acepta como retorno; ver [diagnóstico](../handoffs/UAT-2026-10-17-retorno-diagnostico.md)).

## Hallazgos y resultado
| ID | Hallazgo (UAT) | Resultado |
| --- | --- | --- |
| U18-01 | Fecha de nacimiento fuera del recuadro y distinta a las demás | Corregido (CSS): `input[type=date]` ocupa su caja y alinea a la izquierda. WebKit 390: sin desborde. |
| U18-02 | Rutina sugerida con 1–2 ejercicios por día | Corregido: `generateAdaptiveTrackWorkout(…, { experience })` completa cada día hasta `exercisesPerSession` (intermedio 4–6 según minutos; 60 min = 5), rotando regiones corporales, sin repetir, respetando equipo y restricciones. Sin `experience` el comportamiento anterior no cambia. UI: 4 días × 5 ejercicios. |
| U18-03 | Pestañas Resumen / Cuerpo y salud / Registro semanal desbordadas | Corregido (CSS): 3 columnas iguales en una fila. |
| U18-04 | «Minutos por sesión» conserva el 0 al editar | Corregido: el campo guarda su texto, se puede vaciar y reescribir, quita ceros a la izquierda y restaura el último valor válido al salir vacío. |
| U18-05 | «Enfoque del día» sobrepuesto al texto | Corregido (CSS): etiqueta sobre el campo. |
| U18-06 | Triserie sin botón de confirmación: se bloquea | Corregido: una estructura que necesita más ejercicios añade los huecos y vuelve a elegir ejercicios, con aviso «Triserie necesita 3 ejercicios: faltan 2». Las de menos lugares siguen desactivadas para no perder selecciones. |
| U18-07 | «Editar ruta» solo permite meta, nombre, equipo, minutos y días | Corregido: el formulario de edición tiene el botón «Editar ejercicios» que abre la rutina en modo edición (agregar, reemplazar, quitar). Título «Editar ruta». |
| U18-08 | Opcional de salud no se distingue por color | Corregido: `--optional-consent: #3f5fbf` (5,2:1 sobre arena, 5,8:1 sobre blanco). |
| U18-09 | Botones de la propuesta: «aceptar, rechazar y editar» | Ya existían los tres (`Rechazar propuesta`, `Aceptar y editar`, `Aceptar rutina`); la captura los cortaba bajo el pliegue. En móvil quedan fijos al pie del cuadro. **Si se quiere el rótulo «Editar» a secas, se cambia.** |
| U18-10 | Slogan descentrado | **Sin cambio.** Medida en la captura del Operator (921 px): lockup 292–628 → centro 460,0; slogan 281–636 → 458,5; centro de pantalla 460,5. Diferencias ≤ 2 px. Pendiente: captura anotada de lo que ve descentrado. |
| U18-11 | Nombre «Alejandro» por defecto al crear cuenta | **No reproducido.** El campo está vacío con placeholder; el nombre viene de `autoComplete="name"` de iOS o de un perfil previo. Pendiente de confirmar. |

## Archivos
`src/lib/exercises.ts`, `src/App.tsx`, `src/components/TrainingTracks.tsx`, `src/components/WorkoutPanel.tsx`, `src/styles.css`; pruebas `exercises.test.ts`, `WorkoutPanel.test.tsx`, `TrainingTracks.test.tsx` (nuevo).

## Verificación (18-10)
`tsc -b` limpio; **410/410** pruebas; pruebas nuevas rojo→verde (volumen de rutina, estructura, editar ejercicios, minutos). WebKit 390 con Supabase sintético: fecha, pestañas, enfoque del día, triserie y propuesta (20 movimientos = 4×5). **No verificado:** iPhone físico tras estos cambios, Chromium de esta ronda, harness SDD-017 completo, otros campos numéricos con el mismo patrón (`OnboardingPanel`, `ProfilePanel`), fecha por defecto del selector de iOS.

## Límites
Sin cambios de contratos de datos, Auth, consentimiento ni publicación. Producción y `main` siguen como estaban.
