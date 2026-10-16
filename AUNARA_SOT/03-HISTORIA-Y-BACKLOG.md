# Historia y backlog — Aunara

## 2026-10-16 · Guardas de correo incorporadas al comando test; decisión rectificada

`[AUNARA/codex · modelo no expuesto]` — Operator aclara que «Dejarlo pendiente» fue un clic erróneo y ordena actualizar. Un único cambio en comando test de package.json añade las guardas de plantillas a los Node tests existentes, conservando Vitest/Sites; sin paquetes/lockfile/workflows ni código del producto. No activa SMTP ni aprueba specs015/016. Orden permanente documental registrada en índice SOT. Verificación local fecha real16Oct: npm test371/25 Vitest PASS + Node11/11 (10 guardas de correo y1 Sites), typecheck PASS, diff --check PASS; diff contra999c8f6 confirma lockfile/workflows/src/supabase/public intactos. No se ejecutó build ni nueva UAT: no hay cambio de cliente. Cuatro fixtures de miércoles siguen abiertos bajo SDD-015; esta corrida verde de viernes no los corrige.

## 2026-10-16 · 🟡 Diagnóstico recibido; baseline confirmado y specs de tests/sync pendientes de aprobación

`[AUNARA/codex · modelo no expuesto]` — Leído diagnóstico Claude de dev999c8f6; sin defectos bloqueantes automatizables y sin correcciones a SDD-012/013/014. Reproducción sin alterar código: npm test371/25 + Sites1 PASS en fecha real; NODE_OPTIONS con wednesday-clock367 PASS/4FAIL exactos. Specs separadas015/016, gate explícito antes de fix; guardas de correo en npm test esperan orden. [Base congelada ciclo3](sdd/2026-10-16-uat-dev-revision/CICLO-3-BASE.md): seis archivos ya versionados, checks sintácticos MJS PASS; receta shell con placeholders FALLA y rutas de host no portables, documentadas sin cambios silenciosos. No ejecución nueva Chromium/WebKit ni cierre humano, cambios de runtime o publicación.

## 2026-10-16 · 🟢 UAT automatizada de `dev` completa en dos motores; cuatro hallazgos menores para Codex

`[AUNARA/claude · modelo no expuesto]` — Sobre `d2ba0aa` (SDD-006/011/012/013/014) se corrieron las seis matrices del ciclo 2, los checks de SDD-013 con línea base, los de SDD-012 adaptados al menú lateral y un recorrido del guion de UAT (dos dispositivos, contacto legal, triserie, menú, privacidad), todo verde en Chromium y WebKit. No hay defectos bloqueantes; quedan para Codex las pruebas dependientes del miércoles, la protección del servidor ante filas rechazadas por esquema, el test de plantillas fuera de CI y la versión del aviso legal. [Informe](handoffs/UAT-2026-10-16-claude-dev-diagnostico.md).
## 2026-10-16 · 🟡 Servidor dev SDD-013+014 y UAT consolidada entregados; revisión humana pendiente

`[AUNARA/codex · modelo no expuesto]` — Orden de dejar documentación en repo y servidor/lista: sustituido únicamente el Vite anterior verificado por candidato aislado SDD-014, fuente d2ba0aa. Local/Network5173 HTTP200; UI integrada confirma admin@aunaratraining.com, versión1.0; CI de fuente #37 SUCCESS. [Handoff](handoffs/HANDOFF-2026-10-16.md), [26 casos con expectativas/límites](handoffs/UAT-2026-10-16-dev-checklist.md) y punteros de documentación actualizados. Manifest de fuente117/117 intacto; ningún cambio de producto, paquetes o configuración. No cuenta/correo/datos, SMTP/DNS ni producción. Recuperación LAN→prod y gates remotos conservan estado abierto, UAT del Operator aún no cerrada. Superadas las notas históricas que indicaban servidor antiguo; evidencia previa preservada.

## 2026-10-16 · 🟡 SDD-014 integrado a dev; SMTP, UAT y cierre pendientes

`[AUNARA/codex · gpt-6.1-sol]` — Nueva orden «Sí» aprueba integración/push únicamente a dev. Rebase limpio de `71948e5` a `9c52809` sobre avance documental remoto `35b1f933`; preservadas nota de cuatro tests que fallan los miércoles y actualización del guion UAT SDD-013, sin alterar ese entorno.117 hashes y blobs HEAD intactos respecto al freeze APPROVED LOCAL. Este commit documental acompaña fast-forward normal de dev; main `dfffa873` sin cambios, sin deploy ni activación Auth/SMTP/DNS/correo. Evidencia técnica previa sigue válida por identidad de fuente; no se hereda waiver D-13-6 ni se arreglan tests antiguos. [Recibo](sdd/2026-10-16-sdd014-revision/delivery-receipt.md#integración-autorizada-a-dev--2026-10-16). UAT5173 conserva SDD-013; C14-02/04/05/07 y Gmail/Outlook06, recuperación y cierre humano pendientes. Superada únicamente la prohibición anterior de push dev, no la de publicación.

## 2026-10-16 · 🟡 SDD-014 implementado y APPROVED LOCAL; activación e integración pendientes

`[AUNARA/codex · gpt-6.1-sol]` — Contacto admin y dos plantillas bilingües implementados tras «Dale»; revisión independiente ciclo1 APPROVED LOCAL. C14-01/03/08 y preview06 PASS LOCAL;72 casos Chromium/WebKit raíz/rollback,120 capturas/20 collages, contraste mínimo5.8483:1. Suite real371/25 +Sites1 frente a base367/25 +Sites1, tipos/Node10/directorio4/Node previos28/builds32 PASS sin waiver. Freeze117/117 idéntico antes/después de entrega. [Recibo](sdd/2026-10-16-sdd014-revision/delivery-receipt.md) y [revisión](sdd/2026-10-16-sdd014-revision/review-cycle1.md). Commit local enfocado; sin push, merge, deploy ni activación SMTP/DNS/envíos. Integración a dev exige orden nueva; gate remoto, C14-02/04/05/07, Gmail/Outlook06 y UAT/cierre humano pendientes. Cuatro rojos históricos y recuperación LAN→prod no arreglados. UAT5173 sigue SDD-013/base61610c1; canónico y fuentes NO-TOCAR intactos.

Entradas más recientes arriba; no reescribir entradas previas.

## 2026-10-16 · 🟡 SDD-013 integrado en dev y UAT levantada; correo de marca en Spec, UAT humana pendiente

`[AUNARA/codex · modelo no expuesto]` — Por autorización explícita, `origin/dev` actualizado a `d344eeb`, con la fuente revisada `ccce932` sin diferencias. Main `dfffa873` preservado; CI Verify source #34 SUCCESS, deploy/Pages SKIPPED. Vite iniciado desde candidato aislado usando envDir canónico sin copiar/mostrar `.env.local`: localhost5173 y LAN192.168.1.6:5173 HTTP200; menú lateral y wordmark comprobados en UI integrada. [Recibo](handoffs/UAT-2026-10-16-dev-arranque.md). No se crean cuentas, envían correos ni alteran datos; UAT iPhone/recuperación siguen pendientes. Nuevo pedido de contactos y correos de marca: responsable admin, soporte ES/EN y noreply bajo aunaratraining.com; Operator confirma Zoho y noreply existente. Se especifica antes de tocar Auth/SMTP/DNS o contacto legal; ninguna configuración remota de correo cambiada.

## 2026-10-16 · 🟡 Integración de SDD-013 a dev autorizada; UAT/runtime y cierre humano pendientes

`[AUNARA/codex · gpt-6.1-sol]` — Operator dio «Sí» a integrar/subir `ccce932` a dev y levantar UAT sin producción. Se prepara fast-forward remoto desde `41fa9d9`, sin reescribir historia, con un commit exclusivamente documental encima de la entrega técnica. Ocho SHA256 iguales a `ccce932`/manifest final; revisión APPROVED y evidencia previa conservadas, sin repetir suites pesadas ni declarar verde la suite con fecha real. Preflight main remoto `dfffa873a2a29ee1535c49149f92a734c873923d`, preservado. [Recibo de integración](sdd/2026-10-13-sdd013-revision/delivery-receipt.md#integración-autorizada-a-dev--2026-10-16). Runtime UAT a cargo del frente principal, no acreditado aquí; sin servidor iniciado, canónico/UAT antiguo ni rama dev local de otro worktree modificados. Sin publicación, Auth/SMTP ni cierre humano; cuatro fallos weekday y recuperación pendientes.

## 2026-10-15 · 🟡 SDD-013 implementado y APPROVED técnico; UAT/cierre humano pendientes

`[AUNARA/codex · gpt-6.1-sol]` — Entrega independiente del menú lateral, wordmark móvil, opcional sin recuadro y footer en candidato aislado sobre `549b100`; ocho fuentes/tests iguales por SHA256 al manifest de [revisión final ciclo2](sdd/2026-10-13-sdd013-revision/review-cycle2.md). Cuatro matrices393/393 (12 casos cada una), 96 superficies visuales, seis regresiones276/84/42/84/156/52 por motor,16 negativos/restaurados, tipos/directorio4/guards27/artifact32 por base PASS. Unitarios367/25 + Sites1 y baseline363 + Sites1 **con lunes controlado**, bajo D-13-6 explícitamente aprobada el 15Oct; cuatro fallos antiguos con fecha real continúan rojos y abiertos aparte. [Recibo de entrega](sdd/2026-10-13-sdd013-revision/delivery-receipt.md). Documentación vigente actualizada sin reescribir historia, NO-TOCAR intacto y un commit local enfocado. Canónico dirty y UAT abierta no modificados, sin integración a dev, push ni deploy. Operator conserva cierre/UAT iPhone-Safari; recuperación LAN→prod pendiente sin causa confirmada.

## 2026-10-14 · 🟡 SDD-013 documental terminado; aprobación de alcance pendiente

`[AUNARA/codex · modelo no expuesto]` — Retomado tras interrupción: leído estado fresco, conservada elección A y finalizadas diez secciones del SDD con referencia HTML portable. Revisadas fronteras, gates distintos de acceso, enlaces internos y diff documental sin errores de whitespace. Solo documentación/prototipo separado, ningún archivo de aplicación cambiado. Commit local; no push/deploy. Próximo: Operator aprueba SDD-013, incluida barra solo marca/hamburguesa y conservación de todos los accesos en menú. Recuperación LAN→prod sigue fuera y UAT iPhone diferida.

## 2026-10-13 · 🟡 Dirección A elegida; alcance SDD-013 pendiente de aprobación

`[AUNARA/codex · modelo no expuesto]` — Maqueta aislada desktop/móvil mostró A lateral y B amplia; Operator eligió A. Wordmark móvil visible, destinos agrupados, idioma compacto, opcional sin recuadro y footer centrado/credit horizontal. HTML fuente preservado sin datos personales; no se incorpora a app. [SDD-013](sdd/SDD-013-menu-lateral-identidad.md) sujeto a aprobación explícita antes de desarrollo/revisión independiente. Registro UAT actualizado: confirmación Mac y acceso iPhone PASA reportados; recuperación iPhone vuelve a prod, FALLA; menú rechazado visualmente. UAT iPhone diferida por pedido, no cerrada. Sin código, Auth, push ni publicación.

## 2026-10-13 · 🟡 UAT dev: rechazo visual de menú; confirmación no cerrada

`[AUNARA/codex · modelo no expuesto]` — Operator entrega dos capturas de menú y consentimiento: rechaza menú, recuadro opcional persiste (fuera de SDD-012, D-12-4 abierto). Reporta correo con retorno localhost; falta dispositivo/estado posterior. [Registro](handoffs/UAT-2026-10-13-seguimiento-dev.md). Código intacto, ningún parche ni publicación; aprobación técnica no equivale a aceptación humana.

## 2026-10-13 · 🟢 SDD-012 aprobado técnicamente e integrado en `dev`: menú, cabecera, Salir en perfil, UAT13-22 y UAT13-06

`[AUNARA/claude · modelo no expuesto]` — Por orden del Operator se reprodujeron UAT13-22 y 17 y el menú roto de la captura, y se corrigió lo que era defecto: panel del menú por portal (la cabecera con `backdrop-filter` lo atrapaba), hamburguesa a la derecha con idioma e Ingresar dentro del menú, «Salir» en el perfil, un solo control de experiencia con preferencias al instante y botón de reenvío legible. Candidato aislado `wip/sdd012-candidate-2026-10-13`; S12 70/70 en Chromium y WebKit sobre ambas bases, negativos rojos con control verde y seis matrices del ciclo 2 verdes por motor. Integrado como `d381e52`; `main` sin cambios. UAT13-17 y la alineación visual quedan como decisiones D-12-2/D-12-4. Antes de repetir la UAT: allowlist de redirección de Supabase. [SDD-012](sdd/SDD-012-uat13-menu-perfil-acceso.md) · [evidencia](sdd/2026-10-13-sdd012-revision/README.md).

## 2026-10-13 · 🟡 UAT humana no aprobada: feedback completo registrado, entorno mixto pendiente de confirmar

`[AUNARA/codex · modelo no expuesto]` — Operator entregó observaciones y 13 capturas; se registran 22 ítems, alcance/decisiones diferidas, prioridades y handoff en [resultados](handoffs/UAT-2026-10-13-resultados-operator.md). Confirmación recibida; callbacks llevan a producción, sin prueba de retorno local. Lectura fresca de dev confirma menú/credit/footer/historial y agrupación por día; contraste con capturas exige identificar origen, no desestimar fallos. Capturas con datos personales excluidas del repo público. Sin cambios de aplicación ni publicación; orden explícita de subir contexto a dev.

## 2026-10-12 · 🟡 UAT de dev levantada en Mac; pruebas del Operator pendientes

`[AUNARA/codex · modelo no expuesto]` — Por «Dale», remoto y handoff contrastados; dev coincide, main contiene documentación posterior sin código nuevo. Canónico dirty preservado. Copia aislada con dependencias existentes, Vite localhost/LAN y pantalla inicial visible en navegador integrado (Chrome DevTools no disponible). No cuentas, correos, código, push ni publicación. [Recibo](handoffs/UAT-2026-10-12-mac-arranque.md). Falta ejecutar el guion manual; no se declara cierre de UAT.

## 2026-10-12 · 🟢 SDD-011 H-01 y H-02 APPROVED en ambos motores e integrados en `dev`

`[AUNARA/claude · modelo no expuesto]` — Seis matrices del ciclo 2 sobre el build de cada candidato, Chromium y WebKit, todas verdes (storage 276, startup 84, Auth 42, privacidad 84, navegación 156, geometría 52); probes compilados H-01 (negativo) y H-02 (consentimiento 9/9) verdes. `dev` recibe `8db846e` (H-01) y `13a1264` (H-02, árbol = `0fd2743`); verificado sobre `dev`: typecheck, 359/25 + Node 28, guards 28/28, builds ambas bases allowlist 32. Caveat: Build y Review por el mismo agente por orden del Operator. Sin publicación.

## 2026-10-12 · 🟢 SDD-006 integrado en `dev`; SDD-011 H-01 y H-02 construidos con D-11 aprobadas

`[AUNARA/claude · modelo no expuesto]` — «Dale con el commit integrado y aprobadas D-11-1 a D-11-4». Delivery de 006: `1d4ccc9` en `dev`, árbol técnico igual a `6704681` (43 archivos), typecheck, 348/25 + Node 1, guards 27/27, builds ambas bases allowlist 32, CI verde; sin publicación. SDD-011: H-01 `96b71c8` y H-02 `0fd2743` en candidatos aislados. Build de H-02 corrigió la spec con evidencia (Enmienda 1): reutiliza la regla de privacidad existente, retiene solo campos sensibles, reconoce que el producto ya vacía la salud local al revocar, y cierra dos pérdidas de datos halladas por el probe compilado (fila de cliente viejo valía como «datos»; modo personalizado degradado al re-autorizar). Unitarios 359/25, cinco negativos rojos, probe 9/9 en ambos motores. Hallazgo H-03 (re-bootstrap por cambio de `user`) a PENDIENTES.

## 2026-10-12 · 🟡 SDD-011: H-01 construido en candidato aislado; H-02 especificado con decisiones

`[AUNARA/claude · modelo no expuesto]` — Orden «Corregí vos los hallazgos». H-01: ref propio del efecto de debounce en `useCloudSync.ts`, test rojo (`expected 'syncing' to be 'synced'`) → verde, suite 349/25, typecheck, builds ambas bases allowlist 32, negativo compilado en Chromium y WebKit; candidato `96b71c8` sobre `6704681`, matrices del ciclo 2 repitiéndose sobre su build. H-02: diseño con filtro por consentimiento en el snapshot, preservación de la salud local en bootstrap y revocación = fila con defaults; decisiones D-11-1…D-11-4 al Operator. La propuesta de conservar progreso «anonimizado» para entrenar sugerencias se deja fuera con razones medibles (sin consumidor, finalidad no declarada, reidentificable con pocos usuarios, parte del progreso es sensible).

## 2026-10-12 · 🟢 Ciclo 2 de SDD-006: WebKit instalado y mitad completada; APPROVED técnico E2+E3+E4

`[AUNARA/claude · modelo no expuesto]` — El Operator permitió `playwright.download.prss.microsoft.com` en la red del entorno; se instaló WebKit 26.0 (build 2215) con sus dependencias apt y se corrieron las siete matrices completas en WebKit: 276, 84, 42, 84, 156, 52 y negativos 6/6, todo PASS. Intento 1 de WebKit dejó 5 + 1 timeouts atribuibles al harness (espera satisfecha con estado viejo antes del pintado de React; `isVisible()` instantáneo del flotante); corregido el guion, intento 2 verde y Chromium repetido con el guion final. Lente de seguridad por HTTP agregada. Veredicto del recibo pasa de NO CONCLUYENTE a **APPROVED técnico**, con caveat de un solo revisor. Hallazgo nuevo H-02 (salud sincronizada sin `granted`, preexistente) a PENDIENTES junto a H-01. Sin código en `dev`; commit integrado pendiente de confirmación del Operator.

## 2026-10-12 · 🟡 Ciclo 2 de SDD-006: Chromium verde, WebKit pendiente, NO CONCLUYENTE

`[AUNARA/claude · modelo no expuesto]` — Revisión fresca E2+E3+E4 sobre `6704681` con revisor distinto, Supabase sintético y tráfico externo bloqueado. Chromium: 192 contextos de storage, 84 de arranque, 42 de Auth, 84 de resumen de privacidad, 156/156 de navegación/modal/legal y 52/52 de round-trip/flotante/footer, todos PASS; RG-01 rojo→verde 19/110 → 129/129; seis negativos red→green y cinco negativos del guard CLI rechazados; suite 348/25. Cinco ajustes de harness documentados, cero cambios de producto. WebKit no disponible en el entorno ⇒ veredicto NO CONCLUYENTE, ciclo 2 abierto; recibo con guion WebKit en [`sdd/2026-10-12-sdd006-ciclo2-revision/`](sdd/2026-10-12-sdd006-ciclo2-revision/RECIBO.md). Hallazgo H-01 (debounce de `useCloudSync` deja `syncing`), preexistente en `main`, a PENDIENTES.

## 2026-10-12 · 🟢 Paso 1 de la orden: candidatos E2/E3/E4 respaldados en `wip`

`[AUNARA/claude · modelo no expuesto]` — El Operator corrió `push-candidates.sh` en su Mac: tres ramas `wip/sdd006-<e2|e3|e4>-candidate-2026-10-12` (`19dcb4f`, `85e4415`, `6704681`), padre `1c709a3`, y recibos copiados a `~/Documents/aunara-evidencias-2026-10-12/`. Auditoría sin privados ni secretos. Verificación fresca: E3 309/25; E4 typecheck, 348/25 + Node1, guards 27/27, build raíz 32 assets con chunk `App-*` separado, allowlist 32. El trabajo de once días ya no depende de `/private/tmp`. Siguiente: paso 2 de la orden, E4 ciclo 2 y revisión conjunta.

## 2026-10-12 · 🟡 Diagnóstico prod vs SDD; orden y handoff para retomar SDD-006

`[AUNARA/claude · modelo no expuesto]` — Prod (`main` `dfffa87`, código `1c709a3`) no contiene nada de SDD-002/003/004/006: delta sin publicar +2199/−309 líneas en 40 archivos y 138 tests más que prod, verificado por marcadores (`NavigationMenu`, `StorageNotice`, wordmark, `repetitionCount`, slogan) ausentes en `main` y presentes en `wip`. Cadena de dependencias 002/003/004 → E2 → E3 → E4 con dos ciclos restantes; candidatos solo en `/private/tmp`. El Operator aprobó el plan en cinco pasos: respaldar candidatos, terminar E4 y revisión conjunta, publicar con orden nueva, Auth/Danny/versión legal en paralelo, y si E4 falla volver a Spec partiendo 002+003. Se escriben la [orden](ordenes/ORDEN-2026-10-12-retomar-sdd006.md) para Codex, el [handoff](handoffs/HANDOFF-2026-10-12.md) y el script `push-candidates.sh` en el runbook. Sin cambios a código ni `main`.

## 2026-10-12 · 🟢 SDD-010 cerrado por el Operator; Enmienda 2 aplicada

`[AUNARA/claude · modelo no expuesto]` — El Operator ejecutó el paso 6 del guion en su navegador: producción muestra «Versión 1.0 / vigente desde 2026-07-29» y «OpenAI Sites», prueba de que el SDD no tocó la app. Aprobó la Enmienda 2: la viñeta de GitHub Pages del inventario deja de decir «no pasan por GitHub» y precisa que GitHub no recibe datos de cuenta ni perfil, pero sí IP y agente de usuario de cada visitante, logs no verificados. Guardas en verde. Abiertos por diseño: versión legal v1.0/v1.1 y publicación de SDD-002.

## 2026-10-12 · 🟢 SDD-010 implementado, revisado 3/3 y entregado en `dev`

`[AUNARA/claude · modelo no expuesto]` — Aprobación del Operator (D-10-1/2/4/5 según recomendación; D-10-3 sin cambio, canal diferido al correo propio). Build en worktree aislado, un commit por documento; línea base sin/con cambio medida con `grep` y suite 160/18 + Node1 idéntica. Build detectó contradicción interna del SDD (§4.4 vs CP-01/02) y paró; el Operator eligió acotar los criterios (Enmienda 1). Review con tres lentes en contexto limpio: Correctitud y Regresión APRUEBAN; Seguridad rechazó una frase falsa sobre el texto aceptado, corregida en ciclo 2 y aprobada. Guardas rotas a propósito y restauradas. NO-TOCAR byte a byte: `LegalPanel.tsx`, `privacy.ts`, `LEGAL_VERSION`. Abiertos: cierre del Operator en navegador, Enmienda 2 propuesta, decisión de versión legal, publicación de SDD-002.

## 2026-10-12 · 🟡 SDD-010 especificado: registro de cumplimiento al día, en revisión

`[AUNARA/claude · modelo no expuesto]` — Por orden del Operator se especifica [SDD-010](sdd/SDD-010-compliance-docs-aunara.md): los cinco documentos de `docs/compliance/` siguen diciendo Repbook (11 menciones), OpenAI Sites como hosting y no nombran GitHub Pages, `aunaratraining.com` ni GoDaddy; conteos reproducibles con `grep`. Alcance solo documental, NO-TOCAR sobre `LegalPanel.tsx`, `privacy.ts` y `LEGAL_VERSION`; la decisión de materialidad queda explícitamente fuera. Guardas, línea base, contraprueba y guion de revisión en §7; cinco decisiones cerradas en §9. Sin edición de compliance, código ni publicación.

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
