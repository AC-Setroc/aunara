# SDD — UAT multidispositivo y motor de sesiones de Aunara

Versión: 0.1 · 26 de septiembre de 2026\
Estado: **propuesta para aprobación del Operator; sin implementación autorizada**

## 1. Problema y resultado deseado

El producto personal necesita una URL comprobable en web y una sesión UAT
reproducible en emuladores iPhone y Android. En paralelo, la dirección funcional
adoptada tras evaluar OpenGym debe convertirse en contratos propios de Aunara,
sin trasladar código o activos AGPL. Se entregarán dos resultados separados:

1. **UAT del producto existente:** origen web accesible desde los tres entornos,
   matriz local `docs/product/2026-09-26-device-uat-matrix.md` (no incluida en este commit público),
   evidencia y defectos. No presupone que las funciones futuras ya existan.
2. **Motor de sesiones futuro:** modelo planificado/ejecutado, captura por serie,
   continuidad y propuestas explicables, implementado solo después de aprobar
   este SDD y las puertas metodológicas correspondientes.

## 2. Scope autorizado por este documento

**En esta fase de especificación:** únicamente `AUNARA_SOT/sdd/2026-09-26-device-uat-and-session-engine/`,
`docs/product/2026-09-26-device-uat-matrix.md` y enlaces/estado precisos en
`docs/product/README.md`, `docs/product/2026-08-25-feedback-work-plan.md` y
`docs/product/2026-09-18-opengym-adoption-review.md`.

**Alcance propuesto de implementación, sujeto a aprobación y refinamiento de
archivos exactos:**

- Preparar un origen de prueba web alcanzable por navegador de escritorio,
  simulador iOS y emulador Android; documentar URL, versión, fecha y límites de
  red. Validar Safari/Chrome en navegador y, donde corresponda, modo instalado.
- Ejecutar UAT del producto actual, registrar resultados y corregir únicamente
  defectos reproducidos dentro de flujos aprobados mediante SDD acotado o
  enmienda. El UAT no autoriza despliegue público ni cambios de producto.
- Diseñar e implementar progresivamente `WorkoutTemplate`,
  `ScheduledWorkout`, `WorkoutSession`, `ExercisePerformance`,
  `SetPerformance`, `SessionFeedback` y `ProgressionProposal`, con contratos de
  persistencia y migración compatibles con datos anteriores.
- Integrar con UI de entrenamiento, almacenamiento local y sincronización por
  usuario sin alterar su contrato anterior. Candidatos a afectar, no allowlist
  final: `src/types.ts`, `src/App.tsx`, `src/components/WorkoutPanel.tsx`,
  componentes nuevos de sesión, `src/lib/cloudSnapshot.ts`, persistencia
  nueva bajo `src/lib/`, pruebas correspondientes y documentación de producto.
  Si se requiere migración Supabase, configuración, dependencias o despliegue,
  volver al gate con diseño, archivos exactos y reversa antes de actuar.

## 3. NO-TOCAR

- La matriz metodológica v0.1 entregada a Danny, su hash y estado de revisión;
  no reescribirla ni presentarla como aprobada.
- Generador actual de rutinas, dosis, cribado clínico, restricciones, nutrición,
  cuenta, consentimiento, permisos y separación de usuarios, salvo una enmienda
  expresamente aprobada.
- Contrato de datos histórico, sesiones terminadas, rutas existentes, biblioteca
  de 1.324 ejercicios, búsqueda, ES/EN, medios y atribuciones.
- Repositorio de despliegue, producción, secretos, infraestructura, rama principal,
  dependencias y licencias. No copiar código, textos, interfaz, assets ni pruebas
  del proyecto AGPL; no convertir OpenGym en dependencia.
- Funciones diferidas: 1RM, deload automático, importación de historial,
  notificaciones, passkeys, Capacitor, AI coach, marca blanca y entrenador.

## 4. Estado real y evidencia local

| Evidencia | Hecho verificable y consecuencia |
| --- | --- |
| `src/App.tsx` | Maneja `appSection` como estado `home`/`library` y paneles modales; los flujos del UAT son rutas de navegación de UI, no rutas URL profundas. |
| `src/types.ts` | `TrainingTrack.workout` contiene `WorkoutItem`; este tiene `sets`, `reps`, carga y `loadHistory`, sin entidad de sesión/serie ejecutada. |
| `src/App.tsx` + `src/components/WorkoutPanel.tsx` | “Registrar carga de hoy” añade el resumen del ejercicio a la ruta; no equivale a completar cada serie. |
| `src/lib/cloudSnapshot.ts` | Snapshot de usuario `schemaVersion: 1`, con `tracks` y perfil; una expansión requiere lectura compatible y prueba de aislamiento. |
| `src/main.tsx`, `src/lib/install.ts`, `public/manifest.webmanifest` | Existe registro de service worker y guía de instalación por plataforma; eso no prueba instalación ni acceso en emuladores. |
| `README.md`, `package.json`, `vite.config.ts` | Vite local y scripts `typecheck`, `test`, `build`; no se observó en estos archivos una URL de UAT ni configuración de exposición remota. |
| `docs/methodology/2026-08-26-review-status.md` | Matriz v0.1 entregada al entrenador el 26-08-2026; feedback pendiente, sin aprobación clínica/metodológica. |
| `docs/product/2026-09-18-opengym-adoption-review.md` | Capacidades OG-01 a OG-06 adoptadas como dirección, con exclusiones expresas. |

El 26 de septiembre se demostró el acceso al home publicado en Safari de
iPhone 17/iOS 26.5, Chrome 124 de Pixel API 35 y navegador web mediante
`https://ac-setroc.github.io/?uat=20260926-*`. Esta evidencia cubre UAT-00;
los flujos funcionales continúan `No ejecutado` hasta probarlos por separado.

## 5. Diseño propio y fronteras

### 5.1 Separación de plan y ejecución

- `WorkoutTemplate`: identidad y versión de la ruta editable. Cada cambio
  produce una revisión identificable, sin reescribir hechos anteriores.
- `ScheduledWorkout`: fecha local, plantilla/revisión de origen y override
  puntual reversible. Evitar mover en silencio toda la semana base.
- `WorkoutSession`: ID estable, dueño, fecha/zona, estados
  `draft`/`active`/`paused`/`completed`/`abandoned`, instantes de inicio/fin y
  copia de prescripción. Definir explícitamente transición, idempotencia y
  manejo de cambios de zona horaria antes del código.
- `ExercisePerformance`: referencia estable al ejercicio, orden, prescripción
  congelada y notas. `SetPerformance`: ID por serie, objetivo opcional, modo
  `reps`/`time`/`cardio`, resultado observado, estado
  `pending`/`completed`/`skipped` y esfuerzo opcional. Ninguna serie pendiente
  cuenta como realizada. Validar unidades, límites y campos mínimos por modo.
- `SessionFeedback`: técnica, tolerancia, síntomas/alertas y nota, con
  consentimiento y retención aplicables. No inferir diagnósticos del texto libre.
- `ProgressionProposal`: referencia a sesiones comparables, versión de regla,
  cálculo explicable y decisión `pending`/`accepted`/`rejected`; nunca aplicar
  una propuesta pendiente. La regla aprobada, no OpenGym, define umbrales.

La migración debe **leer datos v1 sin pérdida**. `loadHistory` legado conserva
su significado de “carga resumida registrada”; no se fabrican series completadas
ni tiempos a partir de él. Definir si se mantiene lectura dual o migración
reversible, y obtener aprobación separada si toca esquema remoto. Guardar
primero un evento/estado local idempotente y sincronizar sin duplicar por
reintentos; resolver conflictos entre dispositivos con regla visible y pruebas.

### 5.2 Capacidades observadas, implementación independiente

| Bloque | Contrato de Aunara | Condición de entrada |
| --- | --- | --- |
| OG-01 | Sesión y series reales, prescripción congelada; reanudar/finalizar sin perder ni duplicar | Modelo/migración y UAT base aprobados |
| OG-02 | Precarga editable con procedencia, descanso/trabajo por tiempo absoluto, Wake Lock opcional y degradación clara | OG-01; pruebas segundo plano/bloqueo por plataforma |
| OG-03 | RIR **o** RPE opcional por serie, técnica y tolerancia sin automatismo | Definiciones, rangos y copy revisados por Danny y profesional según riesgo |
| OG-04 | Motor puro, determinista, versionado y explicable; sugerencia confirmable; no deload automático | Puerta B y reglas v0.2/v1.0 aprobadas, guardas negativas |
| OG-05 | Historial/adherencia/curvas con origen de cada dato y vacíos explícitos | Calidad y cobertura suficiente de OG-01; 1RM sigue diferido |
| OG-06 | Override fechado reversible; compartir rutina sin salud/historial solo más adelante | Calendario y privacidad aprobados; compartir tras cierre UAT personal |

El diseño se basa en necesidades y contratos escritos aquí. El equipo que
implemente no debe consultar archivos fuente AGPL durante la codificación; un
revisor distinto verificará trazabilidad de decisiones, dependencias y diff.
Observación funcional no otorga licencia de reutilización. Si se propone usar
material de OpenGym, detener el frente y pedir revisión jurídica y nueva
aprobación del Operator.

### 5.3 Acceso UAT y privacidad

Registrar para cada ejecución: commit fuente, build, URL/origen, red, navegador,
modelo/versión de simulador, cuenta de prueba, estado previo, hora y resultado.
Un `localhost` de la máquina anfitriona no es prueba de accesibilidad desde
Android; escoger dirección alcanzable y validar desde cada navegador. HTTPS y
origen seguro son necesarios para evaluar instalación, service worker y Wake
Lock según soporte real; si el túnel o entorno no los ofrece, marcar esas
filas como bloqueadas, nunca aprobadas. Usar cuentas/datos ficticios, evitar
secretos y establecer limpieza por usuario al cerrar UAT. No exponer el entorno
al público ni publicar documentación con credenciales.

## 6. Riesgos y mitigaciones

| Riesgo | Mitigación / señal de fallo |
| --- | --- |
| Licencia AGPL/derivación | Diseño textual independiente; ninguna copia ni dependencia; revisión jurídica si hay duda. Una similitud de código o activos detiene entrega. |
| Mutación de plan/historial legado | Snapshot de prescripción, pruebas de lectura v1 y comparación antes/después; rollback documentado. |
| Doble registro por reconexión o varias pestañas | IDs estables, escritura idempotente y pruebas de reintento/concurrencia. |
| Desfase de temporizador al bloquear pantalla | Guardar timestamps absolutos, comparar al volver y mostrar estado; no depender solo de intervalos activos. |
| Progresión peligrosa por señales insuficientes | Sin propuesta ante datos insuficientes, síntomas, dolor, técnica deficiente o sesión parcial; aceptación explícita. |
| Datos sensibles expuestos en UAT | Datos ficticios, cuentas separadas, origen de acceso limitado y limpieza verificada. |
| Desborde de alcance | OG-04/05/06 son fases posteriores; cualquier cambio a generator, backend o deploy exige enmienda. |

## 7. Criterios de aceptación falsificables

**UAT:**

1. La misma revisión identificada carga en web, Safari iPhone simulado y Chrome
   Android emulado; URL, hora, versiones y capturas/logs constan en la matriz.
2. Cada fila aplicable de la matriz tiene `Pasa`/`Falla`/`Bloqueado` con evidencia;
   ningún `No ejecutado` se describe como aprobado.
3. Cuenta nueva y usuario existente conservan aislamiento, consentimiento,
   rutina, biblioteca y nutrición, sin datos reales en el entorno de prueba.
4. Fallas P0/P1 de flujos críticos se corrigen y revalidan en las tres
   superficies antes de declarar UAT completo.

**Motor, en fases posteriores:**

5. Editar plantilla tras finalizar sesión no cambia prescripción ni series
   históricas; abrir un snapshot v1 no crea ejecuciones ficticias.
6. Cada serie pendiente, completada u omitida mantiene ID y estado tras
   segundo plano/reinicio/sincronización; dos reintentos no crean duplicados.
7. Precarga anterior distingue referencia de resultado actual y admite edición;
   los temporizadores muestran tiempo coherente tras suspensión o bloqueo.
8. Una sesión parcial, técnica deficiente, alerta, dolor o datos insuficientes
   no produce progresión; una propuesta elegible identifica datos/regla y no
   cambia el plan hasta aceptación explícita.
9. Override de fecha no modifica plantilla ni otra fecha y puede revertirse;
   estadísticas siempre enlazan a series reales y explican ausencias.
10. Ningún archivo/paquete/asset de OpenGym está incorporado; una revisión
    independiente registra esa comprobación.

## 8. Matriz de verificación y entrega

| Frente | Verificación requerida | Evidencia de aprobación |
| --- | --- | --- |
| UAT base | `npm run typecheck`, `npm run test`, `npm run build`; ejecución UI real web/iOS/Android según matriz | Comandos, fecha, revisión, capturas y defectos |
| Migración/sesión | Unitarias de transiciones, validación de unidades, v1→nuevo, idempotencia y aislamiento; integración UI | Casos positivos y negativos, diff de datos |
| Herramientas | Segundo plano, bloqueo, retorno, cambio de app, Wake Lock negado y PWA instalada/no instalada | Tiempo esperado vs observado por plataforma |
| Progresión | Tabla metodológica aprobada; tests puros para éxito y guardas negativas | Regla/versionado y sesión origen por resultado |
| Regresión | Cuenta, consentimiento, biblioteca, ES/EN, rutas manual/sugerida, nutrición y sync | Mismo set antes/después, sin regresiones |
| Revisión independiente | Diff contra Scope/NO-TOCAR y revisión clean-room | Aprobación independiente o rechazo con hallazgos |

No hay script `lint` en `package.json` al redactar esta versión. No inventar
resultado de lint; si se agrega uno, requiere alcance y aprobación.

## 9. Orden de implementación y gate

1. Aprobar este SDD y el método de acceso UAT; preparar origen de prueba
   limitado, sin publicar ni desplegar producción.
2. Ejecutar y cerrar UAT del estado actual; separar bugs preexistentes de
   capacidades aún no implementadas.
3. Recibir feedback de Danny; registrar observaciones en el
   [estado de revisión](../../../docs/methodology/2026-08-26-review-status.md), crear
   nueva versión sin tocar la v0.1 y obtener revisiones competentes/Puerta B.
4. Aprobar contrato de datos y migración OG-01; implementar en bloque pequeño,
   revisar independientemente y verificar persistencia/compatibilidad.
5. OG-02 y captura OG-03; probar dispositivos y degradación.
6. OG-04 solo con metodología aprobada. OG-05 después de datos reales; OG-06
   reprogramación antes de compartir/importar.
7. Actualizar matriz UAT, plan de trabajo y SDD con evidencia; revisión
   independiente; crear commit local solo de archivos aprobados. No push/deploy.

## 10. Decisiones, supuestos y preguntas abiertas

- Decidido: la matriz v0.1 sigue congelada; OG-01 no supone OG-04.
- Validado para smoke: el origen HTTPS público actual es accesible desde los
  tres entornos; falta validar datos autenticados y aislamiento.
- Pendiente del Operator: ejecutar los flujos con cuentas ficticias, decidir si
  suma dispositivos físicos y aprobar este SDD.
- Pendiente técnico: contrato de almacenamiento de sesión, conflictos
  multi-dispositivo, retención y reversa sin alterar snapshot v1.
- Pendiente metodológico: definición de RIR/RPE, umbrales y señales de alto;
  ninguna cifra de OpenGym se adopta automáticamente.
- Puerta: **esperar “aprobado” explícito**. Si una decisión cambia Scope,
  NO-TOCAR, esquema, infraestructura o política metodológica, publicar versión
  enmendada y solicitar aprobación de nuevo.
