# SDD-004 — Correcciones UAT: presentación, perfil y construcción de rutas

Estado: **Aprobado; implementación local, cierre bloqueado por CA03**. Fecha: 2026-10-02.
Origen de especificación: `[AUNARA/codex · GPT-6.1 Sol]`. Revisión documental del coordinador: `[AUNARA/codex · GPT-5]`. Repo canónico: `/Users/alejandro/AI Projects/Personal/aunara`.

Este documento especifica un nuevo delta sobre el checkout local con cambios previos sin commit. No certifica ni cierra SDD-002/003. Sustituye únicamente la propuesta de disposición del footer de SDD-002 Enmienda 2 una vez aprobado; no borra decisiones, evidencias ni historia anteriores. El mandato inicial fue especificación: cero implementación, tests, configuración, operaciones, stage, commit o push.

Aprobación del Operator 2026-10-02: «Aprobado.» Activa la fase UI/perfil/editor, confirmación por enlace y contrato aditivo descritos aquí. Conserva explícitamente las dependencias separadas de D-03/D-05/D-06/D-07: no checker de cuentas, nueva metodología, SMTP/dominio ni fatiga/Health por esta aprobación. No autoriza publicación ni cuentas/correos reales. Frontera previa a código: `/private/tmp/aunara-sdd004-boundary.MRgmpl`; no contiene secretos ni referencias privadas. Documentación general conserva hunks previos.

## 1. El problema, en el idioma del Operator

El pie todavía no comunica la jerarquía pedida. El acceso ofrece confirmar mediante un código que el correo observado no incluye. La persona puede dar datos iniciales pero no corregir después todas sus preferencias de entrenamiento. La propuesta muestra movimientos sin una agenda por día suficientemente clara; la construcción manual empieza por la estructura, obliga a buscar después dónde entrenar y mezcla resúmenes de series con la configuración real.

Resultado buscado: presentación centrada y armónica, confirmación coherente con el correo realmente recibido, objetivos y deporte separados, perfil editable después del alta, propuestas revisables por día y un editor progresivo que permita mezclar estructuras locales sin perder datos ni historia. La identificación de correo inexistente y el remitente de marca son requisitos con dependencias operativas/de seguridad separadas, no promesas resolubles solo con interfaz.

## 2. Alcance y fuera de alcance

### Alcance propuesto tras aprobación explícita

| Frente | Allowlist exacta de archivos | Límite de los cambios |
|---|---|---|
| Presentación y acceso | `src/App.tsx`, `src/styles.css`, `src/components/AccessPanel.tsx`, `src/components/AccessPanel.test.tsx`, `src/components/AppFlows.test.tsx` | Footer, etiquetas ES/EN en ambos selectores, disposición del consentimiento opcional y confirmación por enlace; conservar callbacks/retorno/reenvío y recuperación existente. No introducir consulta de existencia. |
| Perfil y objetivos | `src/components/OnboardingPanel.tsx`, `src/components/OnboardingPanel.test.tsx`, `src/components/OnboardingApp.test.tsx`, `src/components/ProfilePanel.tsx`, nuevo `src/components/ProfilePanel.test.tsx`, `src/types.ts`, `src/lib/cloudSnapshot.ts`, `src/lib/cloudSnapshot.test.ts`, `src/lib/privacy.ts`, `src/lib/privacy.test.ts`, `src/lib/wellness.ts`, `src/lib/wellness.test.ts`, `src/App.tsx` | Campos aditivos, adaptación compatible de objetivos/deporte y controles editables; actualizar lectores y validación solo por esos campos, sin alterar cálculos clínicos/nutricionales ni consentimiento. |
| Propuesta y editor | `src/components/InitialRoutineProposal.tsx`, nuevo `src/components/InitialRoutineProposal.test.tsx`, `src/components/TrainingTracks.tsx`, nuevo `src/components/TrainingTracks.test.tsx`, `src/components/WorkoutPanel.tsx`, nuevo `src/components/WorkoutPanel.test.tsx`, `src/components/ExerciseAssignmentDialog.tsx`, nuevo `src/components/ExerciseAssignmentDialog.test.tsx`, `src/lib/workoutPrescription.ts`, `src/lib/workoutPrescription.test.ts`, `src/lib/exercises.ts`, `src/lib/exercises.test.ts`, `src/types.ts`, `src/App.tsx`, `src/components/AppFlows.test.tsx`, `src/styles.css` | Agenda visible, editor día primero, estructuras/series/técnicas locales. Cambios de generación quedan condicionados a reglas metodológicas aprobadas en §9; mostrar la distribución actual no habilita inventar otra. |
| Documentación del delta | Este SDD, `AUNARA_SOT/02-ESTADO-ACTUAL.md`, `AUNARA_SOT/PENDIENTES.md`, nueva entrada en `AUNARA_SOT/03-HISTORIA-Y-BACKLOG.md` | Solo estado/pendientes/entrada propios de SDD-004; no reescribir entradas históricas. |

La allowlist es por comportamiento y por archivo: que `App.tsx` o `styles.css` estén incluidos no permite refactors generales. Antes de crear un test nuevo se verifica que no exista. Cualquier necesidad de otro archivo, cambio de contrato incompatible o dependencia nueva vuelve al gate de enmienda.

### NO-TOCAR

- Preservar todos los cambios sucios anteriores, incluidos SDD-002/003, avisos/almacenamiento, rutas de recuperación, documentación OpenGym/UAT y referencias privadas. Congelar una frontera de diff previa al desarrollo; no absorberlos en esta entrega.
- Sin cambios en `src/hooks/useCloudSync.ts`, `src/hooks/useStoredState.ts`, `src/lib/cloudStore.ts`, `src/lib/supabaseClient.ts`, sus tests, `supabase/`, `.env*`, settings/Auth/SMTP/proveedores/DNS, usuarios, contraseñas, permisos, secretos o datos del servidor. No enviar correo ni crear/borrar cuentas.
- Sin cambios en scripts/guards, package manifests/lockfile, Vite/TS/CI, Pages/PWA/worker, `public/brand/` ni bytes, proporciones o derechos de logos. ATS es referencia read-only, no superficie intervenida.
- No alterar consentimientos legales, exportación/borrado de cuenta, aislamiento usuario/nube, formatos históricos de carga, favoritos, biblioteca/medios, gates de preparación, nutrición o reglas clínicas. No expandir datos sensibles cuando se deniega o revoca consentimiento.
- No implementar fatiga, HealthKit/Health Connect, ingestión de dispositivos, nuevo motor de sesiones ni el borrador integral externo. No convertir tareas pendientes anteriores en cerradas.
- No stage/commit/push/deploy en especificación. Entrega local futura solo después de revisión independiente; publicación exige orden separada.

## 3. Estado real de partida, medido y no supuesto

Inspección fresca read-only del 2026-10-02; esta fase no corrió la UI ni tests. La UAT relatada por el Operator es evidencia observada, no una corrida nueva de este agente.

- Footer en `src/App.tsx:898–910`: marca+slogan, políticas y crédito; etiqueta y logo de crédito son nodos separados. `src/styles.css:435–443` mantiene layout flex horizontal base; `1435–1459` ajusta color/centrado de bloques pero el crédito sigue en columna. La nueva disposición vertical todavía no está implementada.
- Selectores autenticado/público en `src/App.tsx:651–660` y `672–681`, alimentados por `LANGUAGE_OPTIONS` en `:91`. Se cambia texto visible, no códigos persistidos ni idiomas de biblioteca.
- Consentimiento opcional en `src/components/AccessPanel.tsx:435–455`; CSS `src/styles.css:879` usa `flex-wrap`, susceptible a separar checkbox/texto. No cambiar obligatoriedad ni estado inicial.
- Confirmación `AccessPanel.tsx:345–381` pide enlace o seis dígitos, con input/botón y reenvío. `useCloudSync.ts:368` usa `verifyOtp`; `:390` usa `resend`. El correo observado por el Operator trae enlace, no código. No se inspeccionó ni modificó plantilla desplegada en esta fase.
- `useCloudSync.ts:60–84` clasifica `invalid_credentials` como credenciales; `:470` llama `signInWithPassword`. Búsqueda acotada en `src/hooks/useCloudSync.ts`, `src/components/AccessPanel.tsx`, `src/lib/supabaseClient.ts` no encuentra contrato autorizado que distinga ausencia de contraseña errónea. Una consulta diagnóstica anterior sobre un correo concreto no constituye tal contrato de producto.
- Onboarding `OnboardingPanel.tsx:153–173` ofrece un solo `primaryGoal` mezclado con deportes. `src/types.ts:216–245` conserva `primaryGoal?: TrackFocus` y no declara un campo de deporte separado.
- El perfil **ya es editable parcialmente**, no está bloqueado por completo: `ProfilePanel.tsx:199–201` nombre; `:245–306` fecha/edad, sexo metabólico, medidas, actividad, experiencia, readiness/limitaciones y notas; `:412–511` nutrición; `:139–143` registro semanal. Se buscó `primaryGoal`, `equipmentPreference`, `trainingDaysPerWeek`, `sessionMinutes` y controles de deporte en todo `ProfilePanel.tsx` mediante búsqueda textual: no hay editor para esas preferencias iniciales. Agregar los faltantes, no reemplazar los existentes.
- Propuesta `InitialRoutineProposal.tsx:77–104` muestra frecuencia/minutos y una lista plana de movimientos/prescripción; `:149–184` conserva gates y aceptar/editar/rechazar. `App.tsx:312–339` crea primera ruta desde `primaryGoal` y días iniciales; `:479–530` conserva rutas manuales vacías y propuestas pendientes hasta aceptación.
- Generador `src/lib/exercises.ts:246–295`: selección finita de presets (mixto limitado a seis en `:268`) y asignación por módulo a días (`:280–288`). **No duplica hoy los mismos seis en cada día**: reparte la lista. No afirmar un defecto distinto al encontrado ni corregirlo duplicando. La suficiencia/balance por día necesita reglas aprobadas, no una inferencia clínica del agente.
- Editor `WorkoutPanel.tsx:125–140` filtra solo el día en modo entrenamiento; edición mantiene todos los ítems. `:431–460` presenta día y salida «Plan de series»; `:477–490` muestra editor especial o `setPlan` en entrenamiento. `AddExerciseComposer` `:716–756` pide estructura antes del día. Ya hay bloques ordenados/técnicas/descansos (`:915–1033`), estructura por ítem (`src/types.ts:31–46`), días/historia, por lo que el cambio debe reutilizarlos.
- Snapshot `src/lib/cloudSnapshot.ts:8–18` tiene `schemaVersion: 1`; validador de perfil en `:147–181`. `src/lib/privacy.ts:16–49` retiene campos no sensibles vía spread y limpia datos sensibles al revocar. Los cambios aditivos deben probar ese contrato, no tocar transporte/tabla.
- Referencia ATS leída solo en `src/plataforma/componentes/PieDePagina.astro:96–110,188–214`: etiqueta y logo en fila centrada `display:flex`, `align-items:center`, separación local; logo de ancho 7rem, altura automática. No copiar variables ni estilos ajenos.
- `package.json` ofrece `typecheck`, `test`, `build`, `check:exercise-directory`, `test:exercise-directory`; no tiene comando lint declarado. No instalar tooling para simular un check.

## 4. Diseño

### 4.1 Jerarquía visual y lenguaje

Footer vertical centrado: arriba Aunara y slogan aprobado; en un bloque intermedio políticas centradas; abajo crédito en una **fila horizontal** «Desarrollado por» + AC Setroc, como la relación etiqueta/marca de ATS. Distancias según jerarquía visual, no tres bloques obligatoriamente equidistantes. Atribuciones de datos/media autenticadas continúan visibles sin empujar el crédito a otra columna. Centrar tinta/lockup ópticamente conservando bytes y relación de aspecto. En 320px el crédito debe seguir horizontal legible; si no cabe, ajustar separación/tamaño dentro del bloque, no recortar ni deformar.

Ambos selectores muestran `ES` y `EN` para los respectivos códigos; mantener etiqueta accesible «Idioma/Language» y opciones existentes fuera del alcance. Checkbox de salud y su frase forman una fila integrada, permitiendo que la frase envuelva en su propia columna. Clic/teclado mantiene el mismo toggle y no concede consentimiento por texto o layout.

### 4.2 Acceso: interfaz segura versus dependencia bloqueada

Con señal **autoritativa de ausencia**, el requisito ES es exactamente: «Este correo no está registrado en Aunara. ¿Querés crear una cuenta?», con «Crear una cuenta» y «Corregir correo». EN propuesto: “This email isn’t registered with Aunara. Would you like to create an account?” con “Create an account” / “Correct email”. La señal debe pertenecer al correo/intento actual; cambiar correo limpia el estado. `invalid_credentials` por sí solo jamás activa esta copy. Mientras no exista contrato aprobado, mantener fallo genérico accionable y opciones neutrales, sin afirmar ausencia.

Un checker requeriría diseño de servidor separado con protección frente a enumeración, abuso, acceso/retención y límites. No se autoriza por aprobar este SDD: no heurística cliente, cache local, listado público de usuarios, service key pública ni solicitudes automáticas nuevas. La ausencia queda **bloqueada**, no «resuelta» por copy.

Recomendación: confirmar por enlace, consistente con correo observado. Retirar en ese estado el input de código y botón vacío «Confirmar cuenta»; conservar explicación para abrir el enlace, reenvío explícito y retorno/redirect que funcionan. No eliminar hook/contrato OTP como cleanup, ni alterar reset password. Si se elige OTP, esperar primero validación operativa de plantilla que entregue un token de seis dígitos y autorización de ese frente; no mostrar controles de un mecanismo no disponible.

Marca de correo es frente operativo separado: plantilla con identidad Aunara, logos aprobados y copy consistente; futura marca blanca significa identidad parametrizable por marca autorizada, no simplemente fondo blanco ni habilitación multitenant en este alcance. Remitente `noreply` del dominio elegido por el Operator mediante SMTP/proveedor autenticado. El correo actual ya usa noreply de Supabase: el problema es identidad de dominio/marca, no agregar la palabra noreply. **Decisión explícita del Operator, 2026-10-02: esperar al dominio propio de Aunara; no usar ni configurar ahora SMTP/From de ac-setroc.** Remitente de marca pendiente de ese dominio. Solo propuesta de contenido offline, condicionada a elegibilidad real del proveedor; sin desplegar plantillas. No elegir proveedor/plan ni cambiar DNS/SMTP/templates desde este SDD. Capacidad del plan/proyecto sin verificar; no afirmar que está bloqueada por Free.

### 4.3 Perfil compatible y objetivos

Objetivos generales: Fuerza, Pérdida de peso, Ganancia muscular, Condición física general, Resistencia y Movilidad; selección de **1 a 3 únicos**. Deporte va en pregunta posterior opcional con «Ninguno», conservando deportes ya representados por `TrackFocus`. No confundir fuerza con deporte.

Contrato aditivo propuesto en `HealthProfile`: `goals?: GeneralGoal[]` (subconjunto no deportivo de `TrackFocus`) y `sport?: SportFocus | null`. `null` expresa Ninguno; `undefined` permite lectura legacy. Mantener `primaryGoal` por compatibilidad: el primer objetivo elegido alimenta lectores antiguos; un legacy deportivo se presenta como deporte y objetivo general pendiente de elección, sin inventar su intención ni reescribir almacenamiento al abrir. Un legacy general se presenta como selección única. No borrar `primaryGoal`, datos desconocidos, rutas ni historia. No activar generación hasta tener selección válida; perfil legacy sigue utilizable y no impone repetir alta. Cambiar preferencias no cambia silenciosamente ninguna ruta recurrente: ofrecer nueva propuesta/revisión explícita cuando corresponda.

Perfil permite editar los mismos campos no sensibles del alta: objetivos, deporte, equipo, días y minutos, además de experiencia. Permanecen disponibles sin permiso de salud; salud/cuerpo y check-ins continúan sujetos al consentimiento existente. Guardar valores válidos (1–3 objetivos, días 1–7, minutos 15–180) y conservar campos no editados. No desbloquear información sensible desde la nueva sección.

`schemaVersion:1` se conserva como extensión opcional compatible, previa prueba de round-trip y lectura de snapshot antiguo/nuevo; si el contrato real no permite esto, parar y enmendar, no cambiar versión/servidor automáticamente. Validador rechaza cuarto objetivo, duplicados, deporte dentro de `goals`, enums inválidos y valores no finitos; permite snapshot legacy sin campos. Exportar el mismo snapshot preserva nuevos campos; stripping mantiene preferencias no sensibles pero limpia exactamente lo sensible como antes. Auditar usos reales de `primaryGoal` (incluido wellness) para separar deporte sin alterar cálculo existente.

### 4.4 Propuesta por día y construcción progresiva

Antes de aceptar se ve cada día seleccionado con su nombre/etiqueta, ejercicios, series/repeticiones o secuencia especial, descansos configurados y vista previa de cada ejercicio. Un día vacío se muestra «Sin ejercicios asignados», no se oculta ni se presenta la semana como completa. Las tres salidas aceptar/aceptar y editar/rechazar se conservan y no guardan ruta al rechazar. No extender un mismo bloque plano a todos los días. Presentar distribución existente es separable de mejorar generación: balance, volumen y recuperación se basan exclusivamente en metodología/presets aprobados por Danny/Operator. Si no hay cobertura suficiente para un objetivo/deporte, declarar propuesta no disponible o requerir revisión, no rellenar con receta inventada. Matriz concreta de días/patrones/volumen se aprueba antes de alterar el generador.

Manual: **día → ejercicio(s) → series/repeticiones → estructura local → técnica si aplica**. Día elegido visible desde el inicio; después elegir ejercicio(s) desde biblioteca/previews, configurar prescripción y solo entonces seleccionar single/biserie/triserie/circuito/estructura existente. Una biserie requiere sus dos miembros completos antes de guardar; no existe una estructura global que convierta toda la ruta. Técnica especial es de ítem/bloque: rest-pause, drop set o fallo muestran únicamente sus controles pertinentes (secuencia de trabajo, reps o fallo técnico, cargas/porcentajes compatibles, descansos, rondas), reutilizando `SpecialWorkoutPrescription`, sin recomendar fallo obligatorio.

Abrir editor muestra solo el día activo; cambiar día cambia panel, no datos. Dentro de cada día coexisten single y grupos estructurados. Eliminar una estructura o mover un ítem debe confirmar efectos sobre sus miembros, mantener IDs/historia y no afectar otro día. La tarjeta para crear se llama exactamente **«Agregar ruta»** en ES (“Add route” en EN).

Eliminar presentación redundante «Set plan/Plan de series» en edición y reemplazarla por controles reales, con una fuente de prescripción: `sets/reps` para estándar, `specialPrescription` para especial; `setPlan` sigue siendo compatibilidad/resumen histórico, no un segundo editor contradictorio. Antes de normalizar un `setPlan` legacy libre, conservarlo como nota original visible sin perder contenido; no parsear texto ambiguo ni transformar registros antiguos. Cambiar a estándar no borra configuración especial guardada; volver a especial recupera la secuencia. No reescribir `loadHistory[].setPlan`, notas, cargas ni técnicas históricas.

### 4.5 Revisión conceptual de fatiga y dispositivos — no implementación

Se revisó read-only §5.5 actualizado el 2026-10-02 del borrador externo `/Users/alejandro/.codex/.chatgpt-projects/g-p-695cec08af5081918b0c036e4ca4090b/outputs/SDD-borrador-flujo-integral.md`. Orientación razonable como propuesta: declaración actual y fechada, contexto no diagnóstico; descanso/reducción/reevaluación con aceptación explícita; datos faltantes desconocidos, rutina planeada distinta de ejecución real. No penalizar descanso, no compensar con máximos/fallo ni recorte de comidas, no modificar plan recurrente automáticamente. Síntomas/gates de seguridad tienen prioridad. Reducciones numéricas, balance y nutrición requieren reglas aprobadas; no son receta universal. Esto no aprueba el borrador ni integra fatiga aquí.

Futuro HealthKit/Health Connect: aplicación nativa/compañera o puente específico, no promesa de acceso desde navegador/PWA. Lectura granular opt-in, permisos revocables por categoría, procedencia/fecha y cobertura visibles; ausencia ≠ cero ni denegación comprobada. Datos de sueño/actividad contextualizan, no prueban objetivamente fatiga ni diagnostican enfermedad. Sin subida automática de datos crudos a nube; nuevas bases legales, almacenamiento y permisos requieren SDD independiente. Referencias oficiales aportadas por el frente principal: [capacidad HealthKit](https://developer.apple.com/documentation/xcode/configuring-healthkit-access), [sleepAnalysis](https://developer.apple.com/documentation/HealthKit/HKCategoryTypeIdentifier/sleepAnalysis), [SleepSessionRecord/READ_SLEEP](https://developer.android.com/health-and-fitness/health-connect/experiences/sleep).

## 5. Alternativas descartadas

- Layout de tres columnas o bloques equidistantes: no expresa jerarquía solicitada. Crédito apilado: contradice referencia horizontal.
- Interpretar `invalid_credentials` o reset HTTP200 como cuenta ausente/existente: señal insuficiente y riesgo de enumeración. Consultar Admin API desde navegador: inseguro.
- Código OTP por costumbre sin token en correo, o confirmación vacía: flujo imposible para el usuario. Cambiar SMTP silenciosamente: operación no autorizada.
- Mezclar deportes con objetivos, borrar legacy o recrear perfil/rutas para migrar: pérdida de intención/datos.
- Repetir seis ejercicios en todos los días, inventar balance clínico o adaptar rutas automáticamente al guardar perfil: no autorizado.
- Estructura global, dos editores contradictorios de series o parseo destructivo de notas históricas: regresión y pérdida de trazabilidad.
- Conectar Health desde web sin puente nativo o convertir sueño en diagnóstico de fatiga: capacidad/interpretación no sustentadas.

## 6. Riesgo sobre lo que hoy funciona

Principal riesgo: archivos compartidos ya sucios. Mitigación: recibo de frontera previo, hunks mínimos, revisión independiente de delta y NO-TOCAR, separar entrega nueva de cambios previos. CSS solo por selectores afectados, ninguna regla global de inputs/labels que perjudique otros paneles.

Riesgos de contratos: lectores legacy y validación/exportación pueden divergir; fixtures completos antiguos/nuevos, round-trip, consentimiento denegado/revocado y usuarios aislados son bloqueantes. No cambiar transporte para resolver un fallo.

Riesgos de datos: editar día/grupo/prescripción puede borrar historial o contaminar otro grupo; pruebas con dos días y varias estructuras, secuencias especiales y notas libres. Riesgo clínico: generación multiobjetivo sin reglas; esa rama se bloquea hasta aprobación metodológica. Riesgo auth: enumeración y solicitudes involuntarias; ausencia queda separada de fase UI y red real bloqueada en pruebas simuladas.

## 7. Verificación: criterios de aceptación falsables

| ID | Criterio y evidencia exigida |
|---|---|
| CA-01 | Desktop y móvil muestran marca/slogan arriba, políticas centradas en medio y crédito horizontal abajo, no tres columnas/equidistancia forzada. Sin overflow a 320/390/1440px; logos conservan aspect ratio y bytes. Capturas y medición de posición/tinta; copy ES/EN. |
| CA-02 | Ambos selectores muestran ES/EN y cambian idioma sin perder navegación/datos. Texto opcional de salud queda junto al checkbox, clic y Space togglean solo este consentimiento; permanece opcional y desmarcado inicialmente. |
| CA-03 | Confirmación por enlace no muestra código/botón vacío; reenvío es solo explícito y retorno funciona en `/` y `/aunara/`. Recuperación/login vigentes no regresan. UAT real requiere autorización; mocks no prueban entrega. |
| CA-04 | Contraseña errónea, rate limit, red caída, reset HTTP200 y correo cambiado jamás generan afirmación de ausencia. Copy requerida solo con contrato autoritativo aprobado y respuesta ligada al intento; hasta entonces dependencia declarada bloqueada. Cero requests nuevos de existencia. |
| CA-05 | Objetivos aceptan 1/2/3 únicos, rechazan 0/4 y duplicados; no incluyen deportes. Deporte es posterior/opcional, Ninguno válido. Controles ES/EN accesibles por teclado. |
| CA-06 | Perfil ya creado edita objetivos/deporte/equipo/días/minutos y conserva nombre, salud, notas, nutrición, check-ins y rutas. Sin consentimiento edita solo preferencias no sensibles; revocar no resucita salud. Guardar/recargar conserva valores y no regenera ruta sin aceptar. |
| CA-07 | Snapshots legacy general/deportivo y nuevos sobreviven lectura/exportación/round-trip sin borrar `primaryGoal`, campos desconocidos, IDs ni historia; datos nuevos inválidos son rechazados. Transporte/versionado/servidor permanecen iguales. |
| CA-08 | Propuesta muestra días reales, ejercicios/prescripciones/previews de cada día antes de aceptar. Rechazar no crea ruta; aceptar/editar conservan gates. Fixtures metodológicos aprobados verifican distribución/balance; sin reglas no se declara generación mejorada. |
| CA-09 | Manual recorre día→ejercicio→series/reps→estructura→técnica. Cambiar grupo/técnica afecta solo selección; single y biserie coexisten en mismo día y otro día no cambia. Grupo incompleto no guarda. Editor inicial no muestra todos los días. ES contiene «Agregar ruta». |
| CA-10 | Una sola configuración de prescripción visible, estándar y especial editables y coherentes; cambio de modo conserva secuencia. Nota legacy libre e historial de carga/series permanecen byte-equivalentes cuando no se editan; no hay pérdida al mover día/guardar/recargar. |
| CA-11 | Diff no altera archivos/comportamientos NO-TOCAR ni dirty previo. No se implementa fatiga/Health, no hay cuentas/correos/SMTP/settings/secretos nuevos. SDD-002/003 siguen con sus gates abiertos. |

Matriz futura obligatoria: `npm run typecheck`, `npm test`, `npm run check:exercise-directory`, `npm run test:exercise-directory`, `npm run build`, build con base `/aunara/` conforme runbook existente; guard de artifact y negativos existentes sin modificarlos. Lint: no script actual, registrar no aplicable, no fingir PASS ni instalar dependencias.

UI real independiente: Chromium **y WebKit**, desktop 1440px y móvil 390px (footer adicional 320px), ES/EN, base `/` y `/aunara/`, guest/acceso y perfil/rutas con fixture aislado; auth/sync real solo cuando esté autorizado. Verificar foco, Tab/Shift-Tab, Enter/Space/Escape, scroll, modales/previews y controles próximos. Si WebKit omite botones por preferencia nativa, confirmar navegación adecuada con Option-Tab y registrar gate de ambiente/preferencia; no modificar sistema/browser sin autorización ni sustituir teclado por clic o rebajar aserciones. Sin evidencia completa: REJECTED, no cierre.

Negativos de guardas en copia/fixture aislado: introducir cuarto objetivo/deporte en goals, quitar agrupación por día, forzar ausencia desde credenciales inválidas, alterar grupo vecino, borrar nota/history al cambiar formato y romper vínculo checkbox. Cada check debe ponerse rojo ante el defecto deliberado y verde al restaurar el mismo estado. No ejecutar mutaciones negativas sobre datos reales. Máximo tres iteraciones desarrollo→revisión; fallo persistente vuelve al Operator, no se suprime test.

## 8. Plan de entrega

1. Operator aprueba explícitamente este SDD y decisiones §9. No iniciar implementación por silencio. Las dependencias operativas excluidas siguen excluidas aunque se apruebe la fase UI.
2. Congelar diff/estado de archivos existentes. Frente desarrollo UI/acceso y frente perfil/rutas pueden separarse solo con ownership sin solapamiento; `App.tsx`, `styles.css`, tipos/tests compartidos tienen un único dueño integrador acotado.
3. Implementar solo allowlist aprobada; si balance/metodología o contrato requieren ampliar scope, detener esa rama y enmendar. No ocultar dependencia bajo «frontend listo».
4. Revisor independiente no implementador verifica todos los criterios, matriz, negativos, NO-TOCAR y delta. Rechazo vuelve al desarrollo; hasta tres ciclos.
5. Tras APPROVED, documentar solo estado propio, pendiente y nueva bitácora; commit local enfocado del delta revisado, sin absorber cambios sucios ajenos. Si no puede aislarse, detener entrega y pedir decisión. UAT final/cierre del Operator, publicación por autorización separada.

En este turno se entrega únicamente el SDD para decisión; no se crea commit. No se corrieron checks de implementación ni UAT nueva porque no hay cambio aprobado.

## 9. Decisiones que necesita el Operator

- **D-01 — Fase UI/perfil/editor:** aprobar alcance y disposición vertical con crédito horizontal. Slogan previo se conserva. No cierra enmiendas previas.
- **D-02 — Confirmación:** recomendado enlace solamente; alternativa OTP requiere frente operativo específico y correo con token probado antes de habilitar UI.
- **D-03 — Ausencia de cuenta:** aceptar requisito bloqueado hasta SDD separado de checker servidor, con decisión explícita de privacidad/anti-enumeración. Aprobar esta fase no autoriza backend ni solicitudes nuevas. Fuentes oficiales: [errores Auth](https://supabase.com/docs/guides/auth/debugging/error-codes).
- **D-04 — Objetivos/compatibilidad:** aprobar campos aditivos, límite 1–3 y correspondencia legacy descrita, manteniendo perfiles antiguos sin re-onboarding forzado; confirmar deportes actuales y Ninguno.
- **D-05 — Generación balanceada:** aportar/aprobar matriz concreta de reglas Danny (días/patrones/series, combinación/prioridad de objetivos y deporte, equipo/restricciones). Sin ella se puede revisar distribución actual, no declarar nueva rutina equilibrada. Esta dependencia no se infiere del visto bueno visual.
- **D-06 — Correo de marca, decisión parcial registrada:** Operator eligió el 2026-10-02 **esperar al dominio propio de Aunara**, sin SMTP/From ac-setroc ahora. Proveedor, identidad/plantillas y recursos/plan requieren autorización operacional futura; propuesta de contenido offline no autoriza despliegue. Referencias [SMTP](https://supabase.com/docs/guides/auth/auth-smtp), [templates enlace/token](https://supabase.com/docs/guides/auth/auth-email-templates), [restricciones de personalización Free](https://supabase.com/changelog/46599-changes-to-email-template-customisation-on-free-tier). Elegibilidad concreta no verificada; no asegurar que cambiar logo basta para cambiar remitente.
- **D-07 — Fatiga/Health:** solo revisión conceptual registrada; implementación fuera de este SDD. Futuro alcance y permisos nativos requieren otro SDD aprobado.

## 10. Definición de terminado

### Revisión final de la fase UI — 2026-10-02

Revisión independiente **REJECTED por CA03**, no por la corrección visual: WebKit no presenta recuperación con respuesta sintética inmediata de `/user`; con 200ms sí. La comparación con la frontera previa reproduce ambos resultados; Chromium pasa ambas variantes. Se demuestra preexistencia, no se atribuye regresión a SDD-004 ni se confirma todavía la hipótesis de evento temprano. Una corrida con demora no sustituye el caso rojo.

Resto verificado: 261 pruebas/22 archivos + Node1, tipos, directorio4, guards4, builds raíz/Pages y artifact31; negativos rojos y restauración98/98. UI independiente: footer24/24, editor16/16, perfil/agenda80/80; acceso16/16 solo con demora explícita. Crédito óptico corregido con delta máximo0,0272px y tolerancia2px conservada. Los 24 archivos de fuente permitidos y NO-TOCAR fueron auditados contra la frontera; ninguna operación real de cuentas/correos/DNS/SMTP. Recibo `/private/tmp/aunara-sdd004-independent-review.md`, comparación `/private/tmp/aunara-sdd004-callback-compare.json`.

Corregir el retorno rápido requiere la [Enmienda 2 propuesta](SDD-004-enmienda-2-retorno-recuperacion.md) y aprobación explícita porque hook/cliente son NO-TOCAR. No se crea commit ni publicación tras revisión rechazada, no se cierran SDD-002/003 ni sus UAT reales. La implementación local queda preservada; dominio informado no modifica ese gate.

### Continuidad y dominio informado — 2026-10-02

El Operator solicita terminar el proceso interrumpido e informa el dominio `aunaratraining.com` en GoDaddy. Se conserva el alcance aprobado de esta fase; el dominio elimina la espera por su elección, pero no prueba DNS, HTTPS ni envío de correo. Conexión web/URLs Auth y configuración de proveedor/SMTP/plantillas requieren frente operativo separado y aprobación previa; no se cambian en SDD-004.

### Enmienda mínima E1 — expectativa del selector público

2026-10-02 · **Aprobada por el Operator: «Aprobado»** en respuesta a la solicitud explícita de E1. La corrida de desarrollo encontró una expectativa en `src/components/GuestApp.test.tsx` que exige las opciones «Español/English» y queda roja al aplicar ES/EN aprobados en CA-02. Se añade únicamente ese test a la allowlist para cambiar sus dos expectativas de texto visible del selector a ES/EN, conservando sus aserciones de acceso invitado y comportamiento. Sin cambios a componentes, datos ni infraestructura adicionales; suite completa debe pasar sin omitir el test. Su frontera inicial ya está incluida en `/private/tmp/aunara-sdd004-boundary.MRgmpl`.

Esta **especificación** está lista cuando refleja evidencia fresca, decisiones, allowlist y NO-TOCAR, y queda **En revisión del Operator**. No equivale a implementación ni UAT aprobada.

La fase de producto futura termina solo con CA aplicables verdes, revisión independiente APPROVED, matriz Chromium/WebKit completa, contrato/datos conservados, documentación propia actualizada y cierre explícito del Operator. CA dependientes (ausencia autoritativa, SMTP/marca y generación sin reglas) se mantienen pendientes identificadas, no PASS por simulación ni «todo frontend resuelto». No declarar cerrado el conjunto hasta resolver o separar formalmente esas dependencias con aprobación. Nada se publica sin orden específica; lo no verificado se declara.
