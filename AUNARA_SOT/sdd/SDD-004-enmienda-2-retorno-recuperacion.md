# SDD-004 — Enmienda 2: retorno de recuperación sin carrera de montaje

Estado: **Implementada; revisión técnica independiente APPROVED; publicada por orden del Operator**. Actualización: 2026-10-06.
Origen: `[AUNARA/codex · GPT-5]`. Enmienda de `SDD-004-uat-perfil-y-rutinas.md`, documento local previo no incluido en el commit aislado de E2.

Esta enmienda nace de la revisión independiente rechazada por CA-03. Durante la propuesta, `src/hooks/useCloudSync.ts` y `src/lib/supabaseClient.ts` permanecieron **NO-TOCAR**; la aprobación registrada abajo permite únicamente la excepción acotada de esta allowlist.

Aprobación explícita del Operator el 2026-10-02: **«Sí.»** en respuesta a la solicitud de esta enmienda. Activa únicamente los cuatro archivos de la allowlist para el retorno de recuperación; no autoriza cuentas/correos reales, DNS/SMTP, publicación ni cambios ajenos. Frontera previa a implementación: `/private/tmp/aunara-sdd004-e2-boundary.28JW8N`, sin env/secretos ni git. El dirty previo queda preservado y no se absorbe en la entrega.

## 1. Problema y resultado deseado

Al volver desde un enlace válido de recuperación, la pantalla para elegir una contraseña nueva no siempre aparece en WebKit cuando la respuesta simulada de `/user` es inmediata. El mismo caso funciona al introducir 200 ms artificiales, y Chromium funciona con 0 y 200 ms. Una demora de prueba no es una solución ni evidencia de confiabilidad.

Resultado buscado: un evento `PASSWORD_RECOVERY` verificado por el cliente Auth permanece disponible hasta que la UI pueda consumirlo, haya ocurrido antes o después del montaje de React, sin deducir recuperación desde la URL ni desde una sesión almacenada y sin capturar, persistir o publicar tokens.

## 2. Alcance, allowlist y NO-TOCAR

### Allowlist aprobada

| Archivo exacto | Cambio permitido |
|---|---|
| `src/lib/supabaseClient.ts` | Añadir el puente mínimo en memoria que retenga y entregue la señal verificada de recuperación desde la frontera más temprana que controla la app. No cambiar opciones de `createClient`, transporte ni proveedor. |
| `src/lib/supabaseClient.test.ts` **nuevo; hoy no existe** | Probar evento antes/después del consumidor, consumo único y exclusión de eventos ordinarios y material sensible. |
| `src/hooks/useCloudSync.ts` | Consumir la señal verificada retenida y conservar la escucha vigente para eventos posteriores. No modificar otros flujos de auth, sync o almacenamiento. |
| `src/hooks/useCloudSync.test.tsx` **existente** | Cubrir recuperación antes/después de montar, resolución rápida de sesión y negativos de falsa recuperación. |

Documentación de desarrollo/entrega: este archivo; únicamente hunks propios en `AUNARA_SOT/02-ESTADO-ACTUAL.md`, `AUNARA_SOT/PENDIENTES.md` y una entrada nueva arriba de `AUNARA_SOT/03-HISTORIA-Y-BACKLOG.md`. Esos tres registros son responsabilidad del frente principal/delivery; este agente de especificación no los modifica.

### NO-TOCAR

- Ningún componente visual, copy, CSS, `App.tsx`, `AccessPanel`, callbacks públicos ni comportamiento ya aprobado de SDD-004 fuera del retorno de recuperación.
- No cambiar SMTP, DNS, dominio, URLs Auth/redirect, plantillas, proveedor, configuración Supabase, esquema, tablas, RLS, funciones, transporte del cliente, secretos, cuentas, correos ni datos.
- No inferir recuperación por parámetros/hash de URL, por `getSession()` ni por la mera presencia de una sesión persistida. Solo el evento Auth verificado habilita el estado de recuperación.
- No guardar el objeto `Session`, access token, refresh token, hash, query string ni URL de callback. La frontera puede conservar únicamente una señal efímera de recuperación y el dato mínimo ya utilizado por la UI; nunca almacenamiento persistente, logs o evidencia con valores reales.
- No alterar signin, signup, confirmación/reenvío, recuperación solicitada, actualización de contraseña, signout, refresh, bootstrap remoto, sync, cloud store, consentimientos, perfil, rutinas o aislamiento por usuario.
- Sin dependencias, package/lockfile, Vite/TS/CI, worker/Pages, guards ni assets. Sin cuentas o emails reales en pruebas.
- Preservar todo el dirty previo y las fronteras existentes. No stage, commit, push, deploy ni operación externa antes de revisión y entrega autorizadas.

## 3. Estado real de partida

La revisión independiente registró en `/private/tmp/aunara-sdd004-independent-review.md` y `/private/tmp/aunara-sdd004-callback-compare.json` ocho comparaciones con la misma navegación y datos sintéticos:

| Motor | Frontera | 0 ms | 200 ms |
|---|---|---:|---:|
| Chromium | previa y actual | PASS | PASS |
| WebKit | previa y actual | FAIL | PASS |

En los fallos WebKit la llamada simulada a `/user` sí ocurre, pero `.password-recovery` no aparece dentro de 30 s. El comportamiento es idéntico antes y después del delta SDD-004: es una condición preexistente, no una regresión atribuible a ese desarrollo. Los otros checks reportados —261 pruebas, tipos, directorio, guards, builds, negativos, footer 24/24, editor 16/16, perfil/agenda 80/80 y auth con 200 ms 16/16— pasan, pero no sustituyen el caso inmediato.

Código fresco: `src/lib/supabaseClient.ts:8–15` crea el singleton al importar el módulo con `detectSessionInUrl:true`. El efecto de `src/hooks/useCloudSync.ts:169–190` llama `getSession()` y registra `onAuthStateChange`; solo `PASSWORD_RECOVERY` en `:179–183` activa la UI. La prueba existente `src/hooks/useCloudSync.test.tsx:424–439` emite el evento después del montaje. No existe `src/lib/supabaseClient.test.ts`.

**Causa observada:** la señal de recuperación no llega al consumidor UI en el caso WebKit inmediato. **Hipótesis todavía no demostrada:** el evento puede emitirse antes de que el efecto de React registre su listener. El orden temporal de creación del singleton, parsing de callback y montaje hace plausible esa carrera, pero la evidencia disponible no identifica de forma concluyente el punto interno donde se pierde. La implementación debe validar la hipótesis; si no puede reproducirla con un evento anterior al montaje, vuelve al gate y no inventa otro mecanismo.

Hashes al redactar, solo para fijar la frontera de lectura: `useCloudSync.ts` `4ad71c0a…`, su test `30bb5ff8…`, `supabaseClient.ts` `18cc96f3…`. El working tree contiene muchos cambios previos y debe preservarse.

## 4. Diseño propuesto

### Frontera segura

El cliente singleton es la primera frontera de Auth controlada por la app. Tras crearlo, registrar allí una escucha mínima y única que reconozca exclusivamente `PASSWORD_RECOVERY`. La frontera mantiene una señal efímera hasta que un consumidor de UI se suscribe y confirma su consumo. Si el evento ocurre después, se entrega por la misma interfaz. La señal debe ser idempotente frente a doble entrega y no debe desaparecer solo porque `getSession()` resuelva primero.

El puente no expone ni retiene `Session` o tokens. Puede conservar únicamente el identificador mínimo del usuario del evento para vincularlo a la sesión verificada actual y el email que la UI vigente ya muestra; si falta email, no se inventa. Una señal de otro usuario nunca habilita recuperación; signout, callback rechazado o cambio de usuario invalidan señales pendientes. Una vez consumida se limpia de memoria. Unmount/remount no debe reactivar un evento ya consumido ni perder uno aún pendiente válido.

`useCloudSync` conserva la gestión actual de usuario/sesión y consume ese puente para establecer `passwordRecoveryState="ready"`. El evento recibido por su listener después del montaje sigue funcionando. Resolver `getSession()` con una sesión normal jamás habilita recuperación ni pisa un estado `ready` ya confirmado.

### Alternativas evaluadas y descartadas

1. **Añadir 200 ms, reintento o espera en UI:** hace pasar el harness por temporización y conserva la carrera; descartado.
2. **Reordenar solo `onAuthStateChange` antes de `getSession()` dentro del efecto:** reduce una ventana interna, pero no cubre un evento emitido entre el import del singleton y el montaje; insuficiente como diseño único.
3. **Detectar `type=recovery`, tokens o hash en la URL:** duplica parsing sensible, puede filtrar material y no prueba que Auth haya validado el callback; prohibido.
4. **Tratar cualquier sesión de `getSession()` como recuperación:** produce recuperación falsa en signin/signup, refresh o sesión persistida; prohibido.
5. **Persistir la señal en local/session storage:** amplía superficie sensible y puede revivir estados obsoletos entre pestañas o visitas; innecesario.
6. **Recrear el cliente dentro del hook o cambiar transporte/configuración:** arriesga sesiones, refresh, listeners y sync; fuera de alcance.

## 5. Riesgos y mitigaciones

- **Evento duplicado:** consumo idempotente y prueba de una sola transición visible.
- **Evento perdido antes del montaje:** prueba explícita que emite recuperación antes de crear el hook y exige `ready` sin latencia artificial.
- **Recuperación falsa:** negativos para `INITIAL_SESSION`, `SIGNED_IN`, `SIGNED_OUT`, refresh, sesión almacenada, signup/signin y links inválidos/expirados.
- **Retención sensible:** API mínima sin sesión/token/URL, memoria solamente y limpieza al consumir; inspección de logs/evidencia.
- **Interferencia con bootstrap/sync:** conservar listener y `getSession()` actuales salvo el hunk indispensable; suites y UI cercanas completas.
- **Dirty mezclado:** comparar contra la frontera/hashes recibidos y entregar solo hunks de los cuatro archivos permitidos más documentación propia.

## 6. Criterios de aceptación falsables

| ID | Criterio |
|---|---|
| E2-CA01 | WebKit y Chromium muestran recuperación con respuesta `/user` de 0 ms y 200 ms, tanto en frontera raíz como Pages, sin sleeps usados para decidir el estado. |
| E2-CA02 | El evento verificado emitido **antes** del montaje y el emitido **después** producen `ready`; `getSession()` rápido/lento no lo borra. Un evento se consume una sola vez. |
| E2-CA03 | Sesión existente, signin, signup, refresh y eventos no recovery nunca muestran recuperación. Link inválido o expirado vuelve a error/ingreso seguro; signout/cambio de usuario invalidan señales pendientes y no habilitan recuperación de otra cuenta. |
| E2-CA04 | El puente no almacena ni expone sesión, tokens, hash, URL o parámetros de callback; no usa almacenamiento persistente ni escribe valores sensibles en consola/evidencia. |
| E2-CA05 | Confirmación por enlace, reenvío explícito, login, signup, recuperación solicitada, actualización de contraseña, auth callback existente, sync y signout conservan sus resultados previos. |
| E2-CA06 | Los únicos cambios de producción/prueba están en los cuatro archivos allowlisted. Opciones/configuración/transporte del cliente, componentes, backend y datos quedan intactos; todos los archivos NO-TOCAR conservan sus bytes frente a la frontera aplicable. |
| E2-CA07 | Checks completos y negativos pasan; la revisión independiente deja de depender del caso demorado y reproduce verde el caso WebKit inmediato. |

## 7. Matriz de verificación obligatoria

- Automatizados frescos: typecheck, suite completa, directorio y guards existentes con sus negativos, builds raíz y `AUNARA_BASE_PATH=/aunara/`, allowlist del artifact y `git diff --check`. Lint es N/A mientras no exista script; no instalarlo.
- Unitarias de `supabaseClient.test.ts`: recuperación antes/después del consumidor, una sola entrega, remount/cleanup y descarte de eventos ordinarios; assertions de que la interfaz no contiene sesión/token/URL. Aislar módulos para no depender de estado entre tests.
- Unitarias de `useCloudSync.test.tsx`: evento antes/después de mount, `getSession()` 0/200 ms y orden invertido, evento duplicado, sesión normal, invalid/expired/signin/signup sin recovery falsa y regresión del caso actual de cambio de contraseña.
- UI independiente real: Chromium y WebKit; ES/EN; 1440 y 390; base `/` y `/aunara/`; `/user` a 0 y 200 ms; evento antes y después del montaje. El caso 0 ms debe pasar por comportamiento, no por espera añadida.
- Negativos: link inválido, expirado, callback de signin/signup, sesión almacenada y evento ordinario no muestran `.password-recovery`; eliminar el buffer o consumirlo antes del montaje debe volver roja la prueba correspondiente y restaurarlo debe dejarla verde.
- Tráfico totalmente interceptado antes de navegar, service worker bloqueado en fixture y solo datos `.invalid`; mocks no son UAT real ni prueba de entrega de correo. UAT real sigue pendiente con autorización separada.

## 8. Entrega y aislamiento

Después de aprobación: desarrollo en los cuatro archivos exactos; revisión independiente contra esta enmienda y la frontera preexistente. Si aprueba, el frente principal actualiza estado, pendientes, una nueva entrada de bitácora y el estado/evidencia de esta enmienda. Commit local únicamente cuando pueda aislarse del dirty problemático; no absorber SDD-002/003/004 previo, OpenGym/UAT, referencias privadas ni otros cambios. Sin push/publicación hasta orden separada.

El dominio informado `aunaratraining.com` queda registrado como contexto, no como autorización ni parte técnica de este fix. DNS, HTTPS, URLs Auth, SMTP, remitente y plantillas permanecen en un frente operativo separado.

## 9. Decisiones aprobadas y límites conservados

El Operator respondió **«Sí.»** y aprobó:

1. La excepción mínima a NO-TOCAR para los cuatro archivos de la allowlist.
2. El contrato de señal efímera verificada, en memoria y consumible, sin URL/session/token como fuente de verdad.
3. La matriz obligatoria 0/200 ms y evento antes/después de montaje en ambos motores, bases, idiomas y tamaños.

La aprobación no se extiende a otro archivo, persistencia, cambio de cliente/configuración o mecanismo basado en URL; cualquiera de esas necesidades exige una nueva enmienda.

## 10. Definición de terminado

E2-CA01–07 pasaron sin latencia artificial usada para decidir estado y la revisión independiente emitió APPROVED. El commit local se aísla sobre HEAD sin absorber el dirty anterior; cierre global, UAT real y publicación siguen reservados al Operator. La corrida de 200 ms, por sí sola, nunca fue usada para cerrar CA-03.

## 11. Implementación y revisión — 2026-10-02

La causa confirmada fue la entrega del evento Auth verificado antes de que la UI instalara su listener en WebKit inmediato. El cliente conserva solo identidad mínima en memoria y el hook consume/invalida la señal por usuario; no retiene sesión, token, hash, URL ni usa persistencia. Los únicos archivos de producto/prueba del delta contra `/private/tmp/aunara-sdd004-e2-boundary.28JW8N` son los cuatro allowlisted.

Revisión independiente **APPROVED**: 281 pruebas en 23 archivos + Node1, tipos, directorio4, guards6, builds raíz/Pages y artifact31 PASS. UI compilada: matriz96/96, orden natural32/32, evento forzado antes del montaje32/32 y regresión cercana16/16 en Chromium/WebKit, ES/EN, 1440/390 y raíz/Pages. Los negativos sin buffer y con consumo anticipado quedaron rojos y la restauración71/71 verde. Recibo `/private/tmp/aunara-sdd004-e2-independent-review.md`.

Verificación adicional del commit aislado sobre HEAD `086e5c4`: typecheck, 159 pruebas en 18 archivos + Node1, directorio4, guards5, builds raíz/Pages y artifact30 PASS. Esta cuenta menor es esperada: excluye deliberadamente los tests y cambios previos aún sucios. UAT real de cuenta/correo, dominio `aunaratraining.com`, DNS/HTTPS, URLs Auth, SMTP/remitente, metodología y fatiga/Health permanecen abiertos y fuera de esta entrega. El dominio fue informado como registrado en GoDaddy por el Operator; este trabajo no lo registró ni configuró.

## 12. Publicación autorizada — 2026-10-06

`[AUNARA/codex · GPT-5]` — Operator: «Publicá y conectá. La validación de recepción de correos la hacemos más adelante. Estoy resolviendo eso.» Se publicó únicamente el commit revisado `86f5451613964e7e455118db160a0f7e543e5221` a `main` del repo existente, desde un clon temporal limpio y tras pull; ningún dirty previo fue incluido. [Actions 37539918673](https://github.com/AC-Setroc/aunara/actions/runs/37539918673) completó SUCCESS. [Pages actual](https://ac-setroc.github.io/aunara/) devolvió HTTP200 tras el despliegue. La revisión de navegador publicada se registra en la SOT al terminar; HTTP200 solo no constituye UAT de cuenta. Correos reales aplazados expresamente. La conexión del dominio es el frente separado SDD-005, sin cambios DNS/SMTP/Auth realizados aquí.
