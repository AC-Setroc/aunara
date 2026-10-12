# Historia y backlog — Aunara

Entradas más recientes arriba; no reescribir entradas previas.

## 2026-10-12 · 🟢 `AUNARA_SOT/reference/` excluido por `.gitignore` en `dev`

`[AUNARA/claude · modelo no expuesto]` — Orden explícita del Operator: «agregá la línea al .gitignore y pusheá a dev». Una línea, sin archivos rastreados afectados; verificado con `git check-ignore`. Cierra el riesgo de publicar las siete referencias con un `git add -A`. Sin cambios a código, `main` ni Pages.

## 2026-10-12 · 🟡 Dirty local versionado en `wip`; SOT y SDD 002–009 llegan al repo en `dev`

`[AUNARA/claude · modelo no expuesto]` — Revisión integral de repo y SOT: estado técnico de `main` reproducido (160/18 + Node1, guards 26, build raíz, allowlist 30) y Actions 9/10 SUCCESS por API. Detectado un mes de SDD y código sin versionar, pasajes obsoletos (Supabase «pausado» en la versión commiteada, `/aunara/` como objetivo, ADR 0003 «pendiente») y `reference/` fuera de `.gitignore`. El Operator publicó el snapshot `e4baf5f3eb4b7cd7178e6efa9e7eee6039ab8884` en `origin/wip/dirty-2026-10-12` con un script de índice temporal que no toca su rama ni su índice; auditoría sin privados; verificación fresca 298/24 + Node1, guards 27, build raíz y allowlist 31 PASS. `dev` creada desde `main` con solo documentación: SOT, 16 SDD/enmiendas/borradores y `docs/product/`. El código queda en `wip` por los gates E2/E3/E4; los candidatos E2/E3/E4 no están en git. Correcciones documentales propias en runbook, índice de producto, ADR 0003, índice SOT y encabezados de SDD-006/plan. Sin cambios a `main`, Pages, Auth, código ni dependencias.

## 2026-10-12 · 🟡 E4 aprobada; reparación mínima y revisión completa pendientes

`[AUNARA/codex · modelo no expuesto]` — «Sí» del Operator aprueba D-E4-1 después de presentar alcance exacto. Se inicia desarrollo único en nueva copia aislada, App+AppFlows.test+AccessPanel.test, sin cambiar renderer ni guardar/exportar datos. TDD/repro válido y revisión independente posterior completa; es ciclo2 de3, no reinicio de contador. Fuente/índice canónicos intactos, documentación owned main. Sin commit/push/deploy ni cuentas/correos reales; UAT/global pendientes separados.

## 2026-10-12 · 🟡 E4 mínima preparada; scope pendiente y repro válido confirmado

`[AUNARA/codex · modelo no expuesto]` — Ante gate fuera de E3, se prepara E4 con App y dos tests, no renderer ni contrato de datos. Perfil/preferencias significativos del snapshot deben enumerarse sin depender de onboarding completado; defaults vacíos no inventan categoría. Reviewer repitió8casos con snapshot válido y sin legacy tras detectar enum inválido incidental en fixture histórico; export/bootstrap reales sintéticos confirman datos omitidos. Recibo anterior preservado y superado por addendum válido. Solo nueva spec y estados documentales, sin código/commit/push/deploy. Dos ciclos restantes; revisión completa futura y UAT real pendientes, solicitud explícita de aprobación del nuevo scope.

## 2026-10-12 · 🟡 Revisión conjunta E3 REJECTED; perfil parcial requiere alcance acotado

`[AUNARA/codex · modelo no expuesto]` — Arranque protegido y subconjuntos runtime pasan; auditoría completa41/175+2E3/12docs/27enlaces conserva provenance/NO-TOCAR. Rechazo ciclo1 por resumen que omite perfil/preferencias guardados si onboarding incompleto; UI8/8 ambos motores/bases/idiomas. No defecto nuevo del bootstrap E3 confirmado; no comparación runtimeHEAD para atribuir regresión. Legacy del fixture no tiene ownership demostrado: no se lo declara dato propio ni se cambia export/migración. Ampliación de resumen se prepara solo como spec; fuente/índice/HEAD canónicos intactos. Sin stage/commit/push/deploy/cuentas/correo; matrices/negativos restantes incompletos y cierre global pendiente, evidencia en recibo E3.

## 2026-10-12 · 🟡 Revisión E3 retomada; aceptación y entrega pendientes

`[AUNARA/codex · modelo no expuesto]` — Retoma solicitada por el Operator tras interrupción por límite de uso. No rechazo de producto ni nuevo ciclo de desarrollo: main/test candidatos coinciden con manifest al comprobarlos frescos; índice canónico vacío. Revisor independiente y auditor semántico existentes reactivados para completar matrices/auditoría aprobadas. Sin source nuevo, staging, commit, push, deploy ni acceso a cuentas/correos reales. Se mantiene gate de aceptación antes de entrega técnica y cierre global separado.

## 2026-10-11 · 🟡 E3 aprobada e iniciada; revisión y entrega pendientes

`[AUNARA/codex · modelo no expuesto]` — «Dale» responde a aprobación de conducta y alcance de E3; D-E3-1–4 aprobadas, incluido bloqueo honesto sin App/Auth si get-only rechaza carga y excepción exacta CL-07. Desarrollo único sobre copia aislada desde E2, solo main/test; frontend existente y cliente/hooks/config/deps/datos intactos. TDD y UI compilada ambos motores/idiomas/bases/móvil-escritorio, revisión completa futura sin heredar PASS anteriores. Sin commit/push/deploy ni cuentas/correos reales; cierre UAT reservado al Operator.

## 2026-10-11 · 🟡 Enmienda 3 preparada; conducta de bloqueo requiere aprobación

`[AUNARA/codex · modelo no expuesto]` — «Sí» autoriza preparar una enmienda para el bloqueo de arranque, no código. Spec E3 propone aislar importación de App en entrada y test nuevo, preservar cliente/hooks/datos y mostrar estado bloqueado bilingüe con recarga real si falla antes de React. Eliminar pantalla vacía no equivale a continuar App/Auth: excepción CL-07 explícita pendiente del Operator. Chunks se inventariarán después del build autorizado; no promesa falsa de31 ni edición implícita de guards/config. Revisión futura completa E2/E3 sin PASS heredado. Solo documentación; sin prototipos/source/tests/stage/commit/push/deploy, E2Rejected conserva su evidencia.

## 2026-10-11 · 🟡 Consolidación aislada creada; revisión REJECTED, nueva frontera pendiente

`[AUNARA/codex · modelo no expuesto]` — E2 aprobada produjo candidato41 archivos/175 hunks sobre HEAD1c709a3, con8specs+3entradas documentales acotadas. Revisor confirmó pantalla vacía antes de React cuando getItem falla pero set/remove funcionan: SDK auth-js2.110.8 evalúa lectura debug top-level; Chromium/WebKit y ambas bases reproducen. No se atribuye regresión a E2 sin runtimeHEAD. Checks298/24+Node1 y matrices particulares pasan;302/25 histórico incluía4tests de outputignored, aclarado sin borrar historia. Revisión global y matrices restantes no completadas tras gate.170hashes canónicos/índice y fuente candidata preservados. Sin stage/commit/push/deploy ni arreglo fuera de alcance; trabajo sin commit declarado, decisión Operator pendiente. Recibo en SDD-006 E2 y `/private/tmp/aunara-sdd006-e2-review.md`.

## 2026-10-11 · 🟡 SDD-006 E2 aprobada; integración y revisión pendientes

`[AUNARA/codex · modelo no expuesto]` — El Operator respondió «Dale» a la solicitud explícita de aprobación de la Enmienda 2 y de la separación entre entrega técnica y cierre UAT. Autorizados D-CL1–4 con exclusiones documentales por defecto. Integración temporal sobre HEAD exacto y manifest por hunk; no absorber dirty ni editar nueva funcionalidad. Revisión independiente fresca y commit local siguen pendientes; sin stage/push/deploy canónicos ni cierre real de cuentas/correo/dispositivos/metodología.

## 2026-10-10 · 🟡 SDD-006 + E1 verificados localmente; entrega aislada pendiente

`[AUNARA/codex · modelo no expuesto]` — Iteración adicional aprobada terminó los dos ajustes: acceso móvil sin tapar contenido y conteo total/por lado persistente. Revisión independiente PASS técnico acotado;302/25+Node1 y tipos/directorio/builds/guards verdes, E1 compilado8/8 y float24/24=120 geometrías con ambos motores/idiomas/bases. Legacy, notas, historial y otros días/rutas preservados; main miró escritorio/móvil. No defectos restantes confirmados. Entrega bloqueada: aplicación de delta original aHEAD13conflictos, tres vías11; no hay build aislado verificado ni se absorbió trabajo previo. Decisión de frontera/integración vuelve al Operator. Sin staging/commit/push/deploy; trabajo local sin commit declarado. Auth/teclado/dispositivos/correo real y cierre humano pendientes separados. Evidencia/recibos en SDD-006, siguientes SDD sin iniciar.

## 2026-10-10 · 🟡 Continuidad SDD-006 puntual y Enmienda1 autorizadas

`[AUNARA/codex · modelo no expuesto]` — «Sí» del Operator aprueba la solicitud conjunta posterior a CI3: corregir superposición del acceso móvil y conteo total/por lado. Una iteración adicional, no autorización ilimitada ni publicación. Se retoma desarrollo único/revisión independiente, manteniendo NO-TOCAR y dirty previo. Fixture contractual: press8/fallo técnico/escalador20 por lado; cargas, descansos y rondas no se inventan.

## 2026-10-10 · 🔴 SDD-006 CI3 REJECTED; gate de continuidad

`[AUNARA/codex · GPT-5]` — Tres ciclos de implementación/revisión; corregidos bloqueo de reintento de borrado, reducción de grupo, retorno rápido y menú320. Revisión final confirma flotante sobre tarjeta inicial en viewport móvil real de ambos motores. No se declara terminado ni se autoriza un cuarto ciclo automáticamente. Automatizados293/25 + Node1 y matrices UI24/recuperación24/ingreso4/instalación20 PASS particulares; builds/guards PASS. Fixture del Operator: press8, flexiones a fallo técnico, escalador20 por lado; extensión explícita de conteo espera aprobación, sin inventar rondas/carga/descanso. NO-TOCAR y dirty previo preservados; sin staging/commit/push/deploy. Ver recibo CI3 de SDD-006. Aislamiento construible y round-trip/export mixto completo pendientes.

## 2026-10-10 · 🟡 SDD-006 aprobado e iniciado; revisión/entrega pendientes

`[AUNARA/codex · GPT-5]` — Aprobación explícita recibida: «Dale. Arrancá.» después de presentar alcance e inglés del slogan. Se conserva frontera local con copia/hashes, incluidos cambios anteriores; no se los absorbe como cambios nuevos. Baseline 282 Vitest/23 + Node1 PASS tras permitir cachés de herramientas. Desarrollo acotado autorizado, sin push/deploy, cuentas reales, correo, backend ni cambios clínicos. Los SDD-007–009 continúan como borradores sujetos a gates propios.

## 2026-10-10 · 🟡 Specs de cuatro entregas UAT; aprobación de SDD-006 pendiente

`[AUNARA/codex · GPT-5]` — Por solicitud del Operator se documenta el [plan SDD-006–009](sdd/SDD-006-009-plan-entregas.md), con creación de rutinas antes de seguimiento, luego nutrición/recursos propios y finalmente entrenador por invitación. Decisiones recibidas: «Tu propósito marca el camino.» y logo/hamburguesa abren el mismo menú. El alcance de la primera entrega se presenta para aprobación; los siguientes son borradores condicionados, no código implementado. Feedback de cinco audios transcrito localmente y ocho capturas revisadas en el turno anterior; grabaciones/capturas con información personal permanecen fuera del repositorio público. Cambios previos locales preservados; sin código, cuentas, correos, DNS ni deploy en esta iteración.

## 2026-10-07 · 🟡 SDD-005 publicado; web canónica aprobada, Auth/PWA pendientes

`[AUNARA/codex · GPT-5]` — `1c709a3` publicado a `main`; Actions 37636074747 verify/deploy SUCCESS. DNS quedó en cuatro A Pages, `www` a GitHub y TXT de propiedad preservado. Pages muestra DNS check successful y Enforce HTTPS activo; HTTP apex, HTTPS `www` y Pages `/aunara/` redirigen al apex HTTPS con certificado válido. Revisión independiente del publicado: 8/8 Chromium/WebKit 1440/390 ES/EN y recursos raíz HTTP 200. No se publicó dirty canónico ni se tocó correo. Cierre global parcial: redirect apex Auth confirmado solo verbalmente; falta captura/Site URL, auth real y PWA física/offline WebKit.

## 2026-10-06 · 🟡 SDD-005 preparación local APPROVED; DNS/Auth/TLS pendientes

`[AUNARA/codex · GPT-5]` — Delta aislado de cinco archivos técnicos y diez documentales sobre `ef82f9a`, sin dirty previo ni correo/usuarios. Revisión independiente **APPROVED solo prepublicación**: typecheck, 160 pruebas/18 + Node, directorio4, guards26, builds raíz/rollback y artifact30 PASS; UI Chromium/WebKit96/96 y negativos PASS. Propiedad/custom domain ya existen, pero DNS continúa WebsiteBuilder, Auth no incluye apex y HTTPS sigue no disponible. No hubo push, deploy ni operación externa; corte DNS/Auth/TLS y smoke publicado permanecen pendientes.

## 2026-10-06 · E2 publicada; dominio propuesto y operación manual pendiente

`[AUNARA/codex · GPT-5]` — Por orden «Publicá y conectá» se publicó solo E2 `86f5451` a main: [Actions 37539918673](https://github.com/AC-Setroc/aunara/actions/runs/37539918673) SUCCESS, HTTP200 y smoke publicado Chromium/WebKit ES/EN 1440/390 8/8 PASS. No se publicaron los cambios previos de SDD-002/003/004. SDD-005 queda En revisión: apex, www, base raíz, HTTPS, propiedad TXT y Auth reversible; no se cambiaron DNS/Pages/Auth/SMTP. Operator no pudo iniciar sesión en GoDaddy desde Codex y pidió instrucciones para su navegador. Correos reales diferidos expresamente; ningún registro de correo intervenido.

## 2026-10-06 · SDD-005 de dominio preparado; operación espera aprobación

`[AUNARA/codex · GPT-5]` — Se especificó `https://aunaratraining.com/` como apex canónico y `www` redirigido por GitHub Pages, con verificación de propiedad previa, build raíz, corte DNS quirúrgico, HTTPS, Auth reversible y rollback que preserva correo/NS/TXT/dirty. Documento **En revisión del Operator**: la orden general de publicar/conectar no sustituye el gate de este diseño. No se modificaron código, workflow, DNS, Pages, Auth, SMTP ni entorno. E2 `86f5451` fue publicado aparte en `main`; Actions 37539918673 terminó SUCCESS y su smoke final permanece evidencia separada.

## 2026-10-02 · SDD-004 E2 aprobada técnicamente; delivery local aislado

`[AUNARA/codex · GPT-5]` — El evento Auth verificado podía preceder al montaje de UI en WebKit inmediato; E2 conserva identidad mínima efímera hasta consumo, sin sesión/token/URL ni persistencia. Revisión independiente APPROVED: 281 pruebas/23 + Node1, tipos/directorio/guards/builds, UI 96/96, orden natural 32/32, premount 32/32 y regresión 16/16. Árbol HEAD+solo E2: typecheck, 159 pruebas/18 + Node1, directorio4, guards5, builds raíz/Pages y artifact30 PASS. Delta exacto de cuatro archivos más docs propias, sin absorber dirty previo ni operar cuentas/correos/backend/dominio. UAT real, mail, DNS/SMTP, metodología y fatiga/Health siguen abiertos; sin push/publicación.

## 2026-10-02 · Enmienda 2 de SDD-004 aprobada; fix acotado iniciado

`[AUNARA/codex · GPT-5]` — Operator: «Sí.» Activa cuatro archivos de recuperación y sus tests, sin DNS/SMTP/usuarios/correos ni publicación. Frontera nueva `/private/tmp/aunara-sdd004-e2-boundary.28JW8N` captura fuente/config/assets previos sin env ni git; dirty anterior preservado. Un frente developer, revisión independiente después; no se declaran corregidos ni cerrados los casos rápidos antes de evidencia real aislada.

## 2026-10-02 · Enmienda 2 de SDD-004 propuesta; implementación espera aprobación

`[AUNARA/codex · GPT-5]` — Especificación acotada de retorno de recuperación preparada y leída completa: cuatro archivos de cliente/hook/tests, evento verificado retenido solo en memoria, invalidación por signout/cambio de usuario y cero inferencia desde URL/sesión. Hipótesis temporal queda separada del fallo observado. Matriz inmediata/demorada Chromium/WebKit y negativos definidos; ningún código nuevo ni cambio de SMTP/DNS. Enmienda enlazada desde SDD/pendientes, diff-check PASS. Cierre y commit bloqueados tras review REJECTED; se solicita decisión del Operator, sin declarar terminado ni publicar.

## 2026-10-02 · SDD-004 revisión final: UI verificada, cierre bloqueado por recuperación rápida preexistente

`[AUNARA/codex · GPT-5]` — Corrección óptica crédito aprobada técnicamente24/24, sin alterar logos; editor16/16, perfil/agenda80/80 y automatizados261/22+Node1/tipos/directorio/guards/builds/artifact31 PASS. Revisión independiente final REJECTED por CA03: WebKit callback con `/user` inmediato no muestra formulario,200ms pasa; frontera y actual iguales, Chromium pasa ambos. No se atribuye regresión ni se sustituye caso rojo por demora. Negativos completos rojos/restaurados98/98 y hashes/NO-TOCAR conservados. Se prepara enmienda mínima para decisión, porque hook/cliente estaban excluidos; cero fix fuera de alcance, operaciones reales, commit/push/publicación. Recibo y comparación en `/private/tmp/aunara-sdd004-independent-review.md` y `/private/tmp/aunara-sdd004-callback-compare.json`. Dominio informado permanece decisión, no conexión verificada.

## 2026-10-02 · SDD-004 revisión 1: corrección óptica y cobertura final pendientes

`[AUNARA/codex · GPT-5]` — Revisión independiente REJECTED: el centro del crédito visible difiere ~2.216px, sobre tolerancia de 2px, en 24 variantes. 261 pruebas/22 archivos + Node1, tipos, directorio4, guards4, builds raíz/Pages y artifact31 PASS; grupos, prescripción e historial pasan 16 casos de interacción. Negativos completos rojos y restauración 98/98 verde. El primer harness WebKit Pages no garantizó interceptación de tráfico: solo inputs sintéticos, evidencia invalidada; contexto nuevo con interceptación completa completó 24 footers/16 interacciones. Quedan escenarios específicos de acceso, objetivos/propuesta y consentimiento para verificación real simulada, además del fix CSS local. Recibo `/private/tmp/aunara-sdd004-independent-review.md`; sin cierre, commit ni publicación.

## 2026-10-02 · Reanudación de SDD-004 y dominio propio informado

`[AUNARA/codex · GPT-5]` — Operator solicita terminar el trabajo interrumpido e informa `aunaratraining.com` en GoDaddy. Desarrollo retomado desde fuente existente, sin rehacer cambios; typecheck fresco PASS. El dominio se registra como decisión de identidad, no como conexión verificada ni autorización de DNS/SMTP. Revisión independiente y entrega siguen pendientes; no se publica ni se envían correos reales.

## 2026-10-02 · SDD-004 E1 aprobada: expectativas ES/EN del acceso público

`[AUNARA/codex · GPT-5]` — Operator aprobó explícitamente añadir `GuestApp.test.tsx` solo para actualizar dos expectativas de etiqueta Español/English→ES/EN tras encontrar rojo por el cambio aprobado. No se omitieron pruebas ni se amplió comportamiento; desarrollo continúa dentro de allowlist enmendada.

## 2026-10-02 · SDD-004 aprobado; desarrollo acotado iniciado

`[AUNARA/codex · GPT-5]` — Operator: «Aprobado.» Activa UI/perfil/editor y confirmación por enlace, preservando las dependencias de ausencia autoritativa, metodología, SMTP/dominio y fatiga/Health. Frontera previa congelada en `/private/tmp/aunara-sdd004-boundary.MRgmpl`, sin secretos/referencias privadas. Un único dueño de implementación por solapamientos; revisión independiente después. Sin publicación, cuentas ni correos reales; no se cierra trabajo anterior.

## 2026-10-02 · UAT ampliada especificada; implementación pendiente de aprobación

`[AUNARA/codex · GPT-5]` — SDD-004 preparado por GPT-6.1 Sol y revisado documentalmente: presentación centrada, acceso coherente con enlace, perfil multiobjetivo/deporte y editor/propuesta por día. Solo especificación y hunks propios de estado/pendientes/bitácora; no código/tests/config ni operación Auth. Código fresco confirma edición parcial de perfil y distribución finita por día, no seis repetidos cada día. Revisado §5.5 externo actualizado de fatiga y documentación oficial HealthKit/Health Connect/SMTP. Operator eligió esperar dominio propio Aunara para remitente, no usar ac-setroc. Dependencias de ausencia autoritativa/metodología y gates previos permanecen abiertos; sin commit/push/publicación.

## 2026-10-02 · Enmiendas implementadas localmente; verificación WebKit bloquea cierre

`[AUNARA/codex · GPT-5]` — Slogan elegido, armonía óptica y recuperación contextual implementados en siete archivos permitidos; logos/proporciones y NO-TOCAR conservados. Revisión independiente: 238 pruebas + preparador, tipos, directorio4, guardas4, builds raíz/Pages/artifact31 y negativos PASS. UI raíz Chromium/WebKit y Pages Chromium PASS; WebKit compilado detenido por Tab omitiendo todos los botones. Diagnóstico posterior confirma Option-Tab llega al control y no localiza defecto específico del producto; no se altera app/sistema ni se rebaja criterio. Recibo `/private/tmp/aunara-uat-amendments-independent-review.md`: REJECTED por evidencia incompleta. UAT real/correos pendientes; sin commit/push/publicación.

## 2026-10-02 · Armonía y recuperación contextual aprobadas; desarrollo acotado

`[AUNARA/codex · GPT-5]` — Operator: «Aprobado con la primera propuesta de slogan.» Se activan Enmienda 2 de SDD-002 y Enmienda 1 de SDD-003, con ES «Entrená para la vida que querés vivir.» / EN «Train for the life you want to live.». Frontera inicial congelada antes de código para preservar dirty y permitir comparar hunks. Un frente de desarrollo por solapamiento de estilos/tests; después revisión independiente computador/móvil ES/EN Chromium/WebKit. Aprobación no incluye backend, envíos, cuentas ni push/publicación; pendientes de UAT real originales siguen abiertos.

## 2026-10-02 · UAT de footer/acceso diagnosticado; enmiendas pendientes de aprobación

`[AUNARA/codex · GPT-5]` — Capturas del Operator muestran bloques logo/texto sin eje común; solicita armonía, alternativas de slogan y recuperación contextual/copy accionable. Revisión visual exigida tanto computador como móvil. Fuente confirma alineación flex-start y recuperación incondicional en formulario; reset exitoso asigna conflicto de cuenta sin evidencia. Diagnóstico read-only agrega cero cuentas actuales para el correo de prueba y logs de recuperación HTTP200, consistente con respuesta neutral de Supabase cuando no encuentra cuenta, no con entrega probada. Se preparan dos enmiendas separadas para aprobación; no se cambió código, SMTP, cuentas ni correos, y no hay commit/push/publicación de estos ajustes.

## 2026-10-01 · Acceso técnicamente verificado; cierre pendiente de cuentas reales

`[AUNARA/codex · GPT-5]` — Revisión independiente SDD-003: technical PASS, global REJECTED únicamente por UAT real pendiente, sin defecto técnico encontrado. Checks frescos: 221 Vitest + 11 Node, tipos, builds raíz/Pages, artifact31 y diff-check; UI simulada 8/8 Chromium/WebKit móvil/escritorio ES/EN y guardas negativas PASS. Se inspeccionaron capturas vacías y se confirmó preview compilado HTTP200 en `http://127.0.0.1:4193/aunara/`. Delta de seis archivos conserva SDD-002/almacenamiento y dirty ajeno. No se enviaron correos, usaron credenciales de capturas ni mutaron cuentas. Cierre requiere intervención autorizada de Operator en auth/sync reales; cambios locales declarados sin commit, push o publicación.

## 2026-10-01 · Acceso implementado localmente, revisión independiente y UAT real pendientes

`[AUNARA/codex · GPT-5]` — SDD-003 desarrollado en seis archivos dentro de alcance, conservando frontera de almacenamiento y avisos. Recuperación explícita visible en ambos modos, validación de correo, copy de errores ES/EN y protección contra errores tardíos; solo callback nuevo en App. Desarrollo: 221 Vitest + 11 Node, tipos, builds raíz/Pages, allowlist31 y negativo de generación PASS. Revisor independiente iniciado con Chromium/WebKit escritorio/móvil ES/EN y pruebas frescas; no equivale aún a aprobación. Auth real sigue requiriendo intervención autorizada; sin cuentas/correos reales, stage, commit, push o publicación.

## 2026-10-01 · Almacenamiento técnicamente verificado, acceso en desarrollo

`[AUNARA/codex · GPT-5]` — Enmienda 1 implementada en hook/test/AppFlows y revisada de forma independiente: 167 pruebas + Node, guards/builds y 32 combinaciones Chromium/WebKit PASS. Baseline HEAD aislado falló blanco; el mismo HEAD con solo la protección funcionó, y el negativo de regresión volvió rojo sin ella. No se cierra SDD-002: falta cobertura real autenticada/entrenamiento y revisión del responsable. Se congeló la frontera temporal previa a SDD-003 para preservar la separación aprobada. Sin stage, commit, push, correos ni cuentas modificadas.

## 2026-10-01 · Almacenamiento y acceso aprobados, implementación local pendiente de cierre

`[AUNARA/codex · GPT-5]` — El Operator aprobó Enmienda 1 de SDD-002 y SDD-003, incluidos los hunks documentales mínimos y el orden almacenamiento → acceso. La revisión de los avisos/modales/crédito pasó UI Chromium/WebKit en ES/EN y móvil/escritorio, pero no cerró almacenamiento global denegado ni auth real. Se inicia protección del hook compartido sin borrar/migrar datos y después corrección de acceso; no se publicará sin orden separada. Los cambios previos de producto/operación y las referencias privadas se preservan fuera del commit de estos ítems. Ver [Enmienda 1](sdd/SDD-002-enmienda-1-almacenamiento-y-cierre.md) y [SDD-003](sdd/SDD-003-acceso-y-recuperacion.md).

## 2026-10-01 · Revisión aprobada y entrega local

`[AUNARA/codex · GPT-6.1 Sol]` — Revisión independiente **APPROVED**: typecheck, 18 archivos/143 pruebas Vitest + Node, cinco guards E2 con negativos, builds `/` y `/aunara/` y allowlist de 30 archivos pasaron. Smoke local Chrome escritorio/móvil y Safari WebKit escritorio ES/EN/login pasó; manifest/worker acotados a `/aunara/`. El Operator autorizó commit, push y publicación UAT desde el repo público existente. La entrega conserva cambios previos de producto y referencias locales fuera del commit; no declara deploy, instalación física PWA ni autenticación/sync real completos. Supabase sigue pausado y requiere decisión del Operator. Ver [estado](02-ESTADO-ACTUAL.md).

## 2026-10-01 · Pages desde Aunara, desarrollo local

`[AUNARA/codex · GPT-6.1 Sol]` — El Operator aprobó la Enmienda 2 y la visibilidad pública del repo existente `AC-Setroc/aunara`. Se prepararon base `/aunara/`, paths de datos/marca/callbacks, PWA acotada y workflow con artifact `dist/client/`; la revisión y publicación aún no están cerradas. Las siete referencias y su inventario siguen locales y fuera del commit público. Supabase Repbook permanece pausado por límite del plan gratuito, de modo que registro/login/sync y allowlist de callback están bloqueados. Ver [estado](02-ESTADO-ACTUAL.md) y [pendientes](PENDIENTES.md).

## 2026-09-30 · Casa canónica local en implementación

`[AUNARA/codex · GPT-6.1 Sol]` — El repositorio fuente fue trasladado a `Personal/aunara`; se incorporaron las siete referencias intactas y los SDD en `AUNARA_SOT/sdd/`. Pasaron typecheck, 141 pruebas Vitest + una prueba Node, build y 44 enlaces locales. Esta entrada registra trabajo local, no aceptación final; falta revisión independiente y smoke de dispositivos. Evidencia y gates pendientes: [estado](02-ESTADO-ACTUAL.md), [SDD-001](sdd/SDD-001-casa-canonica.md) y [pendientes](PENDIENTES.md). No hubo cambio de producto ni publicación.
