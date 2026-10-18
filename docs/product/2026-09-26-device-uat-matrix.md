# Matriz UAT — web, iPhone y Android

Fecha: 26 de septiembre de 2026 · Estado: **smoke de acceso ejecutado; flujos funcionales pendientes**  
SDD: [UAT multidispositivo y motor de sesiones](../../AUNARA_SOT/sdd/2026-09-26-device-uat-and-session-engine/SPEC.md)

**Nueva ronda pendiente (decisión del Operator 2026-10-01):** repetir UAT-00 en
`https://ac-setroc.github.io/aunara/` y registrar fecha, build y evidencia por
superficie. La tabla de abajo conserva los resultados históricos de `/` del
26-09; no valida automáticamente el nuevo project site. Registro/login/sync
quedan bloqueados mientras Supabase Repbook esté pausado y falte la allowlist
de callback de `/aunara/`.

## Entorno y regla de evidencia

La aplicación actual es una SPA: la URL principal es `/`; “ruta” en esta
matriz significa navegación visible (sección/panel), no un deep link. El 26 de
septiembre se verificó únicamente el acceso al home público publicado. Eso no
aprueba todavía registro, datos, rutinas, nutrición, sincronización ni PWA.

| Campo | Web escritorio | iPhone simulado | Android emulado |
| --- | --- | --- | --- |
| URL/origen HTTPS y red | `https://ac-setroc.github.io/?uat=20260926-web`, verificada | Mismo origen, verificado | Mismo origen, verificado |
| Commit/build/fecha | Fuente `d3da8c0`; publicación GitHub Pages disponible el 26-09-2026 | Igual | Igual |
| Navegador/versión | Codex in-app browser, home visible | Safari, iOS 26.5 | Chrome 124.0.6367.219, Android API 35 |
| Modelo, SO, viewport/DPR | Escritorio; registrar dimensiones al ejecutar flujo | iPhone 17 simulado | Pixel `MB_Pixel_API35`, 1080 × 2400 |
| Instalación PWA | Comprobar si aplica | Safari y pantalla de inicio | Chrome e instalación |
| Cuenta/datos de prueba | Cuenta ficticia aislada | Cuenta ficticia aislada | Cuenta ficticia aislada |

Precondiciones: instalación/build limpia, catálogo accesible, cuentas ficticias
separadas para aislamiento, consentimiento decidido por tester y origen seguro.
No introducir datos clínicos reales. Registrar cada fila como `Pasa`, `Falla`,
`Bloqueado` o `No ejecutado`, con hora, captura/video/log, ID de defecto y
retest. `Bloqueado` no equivale a `Pasa`. Prioridad P0: acceso, pérdida/fuga de
datos, consentimiento; P1: flujo crítico roto; P2: legibilidad/ajuste menor.

## Matriz ejecutable del producto existente

Repetir cada caso en las tres superficies, salvo indicación explícita. UAT-00
es el único caso ejecutado. El estado inicial de UAT-01 a UAT-10 continúa como
`No ejecutado` en web/iPhone/Android.

| ID | Ruta / flujo | Acción y resultado esperado verificable | Evidencia mínima |
| --- | --- | --- | --- |
| UAT-00 | `/` → home público | Abrir el mismo origen publicado. Debe cargar Aunara en español, mostrar solo navegación pública e ingreso y ajustar el hero sin desborde horizontal. **Resultado 26-09:** pasa en web, iPhone y Android. | Observación visual en las tres superficies; iPhone 17/iOS 26.5 y Pixel API 35/Chrome 124 registrados |
| UAT-01 | `/` → cuenta | Crear cuenta con correo ficticio, verificar si el entorno lo permite, salir/entrar y recuperar contraseña: errores claros y sesión solo del dueño. Sin correo funcional, marcar subpaso bloqueado. | Capturas de estados, correo de prueba, resultado de recuperación sin token visible |
| UAT-02 | `/` → consentimiento → onboarding | Elegir compartir salud o modo básico, completar perfil mínimo. El modo básico no requiere dato sensible; al reabrir conserva la decisión correcta. | Estado antes/después, sin exponer respuestas sensibles |
| UAT-03 | `/` → propuesta inicial | Revisar, editar, descartar y aceptar en cuentas separadas. Ninguna ruta se activa por ver o descartar; aceptar activa solo la elegida. | Lista de rutas antes/después |
| UAT-04 | `/` → inicio → rutas | Crear ruta manual, días y nombre; abrir/editar/eliminar con confirmación. Una ruta manual no agrega ejercicios sugeridos inadvertidamente. | Capturas de día/ruta y confirmación |
| UAT-05 | `/` → biblioteca | Buscar ES/EN, filtrar parte/equipo/favoritos, abrir detalle, instrucciones/medio y añadir a ruta. Conteos y selección coherentes; sin mezcla de idiomas inesperada. | Capturas de query/filtros/detalle |
| UAT-06 | `/` → entrenamiento del día | Abrir ruta, cambiar día, ver prescripción, registrar carga de hoy y nota. La carga resumida aparece en historial del ejercicio; **no** afirmar que hay series ejecutadas. | Prescripción y último registro, persistencia tras recarga |
| UAT-07 | `/` → perfil → nutrición | Revisar Simple/Macros con datos de prueba; valores y explicación se conservan tras recarga; no aplicar déficit/superávit oculto. Revisión nutricional sigue pendiente. | Modalidad, cálculo visible, persistencia |
| UAT-08 | `/` → cuenta / privacidad | Exportar datos propios, cambiar/revocar consentimiento, intentar ver datos de otra cuenta y borrar según flujo. Sin cruce entre usuarios; usar cuentas descartables. | Export de prueba saneado, IDs de cuentas, resultado negativo |
| UAT-09 | `/` → instalación / retorno | Abrir en navegador, instalar cuando sea ofrecido, cerrar/reabrir, usar orientación y teclado. UI legible, foco visible, sin pérdida de estado confirmado. Si instalación no está soportada, registrar motivo. | Modo navegador e instalado, viewport/foco |
| UAT-10 | `/` → conectividad | Interrumpir/red restaurada durante consulta o edición de prueba. La app explica fallo/recuperación y no duplica acciones ni mezcla cuentas; no presumir soporte offline total. | Secuencia, estado antes/después y logs |

## Matriz futura: ejecutar solo cuando cada bloque esté implementado

Estas filas están **fuera del UAT de la versión actual**. Su ausencia hoy no
es defecto. Aplican a web, Safari iPhone y Chrome Android tras el gate SDD.

| ID / bloque | Ruta / flujo | Resultado esperado y prueba negativa |
| --- | --- | --- |
| FUT-01 / OG-01 | Ruta → iniciar sesión → series | Cada serie recibe ID, modo, estado y resultado; editar plantilla luego no cambia sesión cerrada. Serie pendiente no suma. |
| FUT-02 / OG-01 | Sesión → pausa/cierre/reapertura | Recupera estado sin duplicar ni perder series tras refrescar, matar app y reintentar sync. |
| FUT-03 / OG-02 | Serie → última sesión | Precarga muestra fuente y es editable; nunca se marca realizada por precargar. |
| FUT-04 / OG-02 | Sesión → descanso/trabajo | Tiempo coherente tras segundo plano y bloqueo; Wake Lock negado/no disponible muestra degradación, sin bloquear sesión. |
| FUT-05 / OG-03 | Serie → esfuerzo/tolerancia | RIR o RPE, técnica, dolor y omisión son opcionales/claros; nota libre no se interpreta clínicamente. |
| FUT-06 / OG-04 | Historial → propuesta | Casos elegible y no elegibles (parcial, dolor, técnica, pausa, insuficiente): muestra evidencia/regla o motivo de bloqueo; jamás altera plan sin aceptar. |
| FUT-07 / OG-05 | Progreso | Curvas, adherencia y récord enlazan sesión/serie origen; datos insuficientes producen vacío honesto, no tendencia inventada. |
| FUT-08 / OG-06 | Calendario → mover fecha | Override visible/reversible; plantilla semanal y otras fechas permanecen idénticas. |

## Registro de ejecución

Usar una fila por combinación ID × plataforma; no sustituir evidencia por una
afirmación general. Plantilla:

| ID | Plataforma / versión | Fecha-hora | Estado | Evidencia | Defecto / retest | Tester |
| --- | --- | --- | --- | --- | --- | --- |
| UAT-00 | Web — Codex in-app browser | 2026-09-26 | Pasa | Home, idioma e ingreso visibles en HTTPS | — | Codex + Operator por confirmar |
| UAT-00 | iPhone 17 — iOS 26.5 / Safari | 2026-09-26 | Pasa | Home responsive visible; ayuda inicial de Safari cerrada | — | Codex + Operator por confirmar |
| UAT-00 | Pixel API 35 — Chrome 124 | 2026-09-26 | Pasa | Home responsive visible; onboarding inicial de Chrome cerrado | — | Codex + Operator por confirmar |

Antes de cerrar: completar filas reales, triage de fallas P0/P1, retest de
correcciones en las tres superficies y revisión de no regresión. La matriz de
metodología para Danny sigue siendo
[v0.1 congelada](../methodology/workout-rules-matrix-v0.1.md), con
[estado/feedback](../methodology/2026-08-26-review-status.md) y
[anexo de condiciones y progresión](../methodology/condition-adaptation-progression-addendum.md).
