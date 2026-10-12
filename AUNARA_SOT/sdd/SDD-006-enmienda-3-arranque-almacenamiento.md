# SDD-006 — Enmienda 3: arranque y lectura de almacenamiento

2026-10-11 · v0.1 · Estado: **Implementado en candidato aislado; revisión independiente pendiente**.
Origen: `[AUNARA/codex · modelo no expuesto]`.
Casa canónica: `/Users/alejandro/AI Projects/Personal/aunara`.

Complementa [SDD-006 + E1](SDD-006-acceso-y-creacion-rutinas.md) y [E2](SDD-006-enmienda-2-consolidacion-local.md). Durante la preparación inicial solo estaba autorizado escribir esta spec, no implementar; no se editaron fuente/tests/config/dependencias en esa fase. La aprobación posterior y su alcance se registran a continuación. Actualmente el desarrollo aislado está cerrado y la revisión independiente sigue pendiente; sin stage, commit, push ni publicación.

Registro posterior de aprobación: 2026-10-11, `[AUNARA/codex · modelo no expuesto]`. El Operator respondió «Dale» a la solicitud explícita de aprobar conducta y alcance para implementar y repetir revisión completa. D-E3-1–4 quedan aprobadas; se autoriza el bloqueo honesto get-only y la excepción CL-07 únicamente definida aquí, main/test aislados y delta de chunks medido. El párrafo previo documenta la fase de preparación, no el estado actual. Sin autorización de publicación ni cierre real UAT.

Aclaración de recibo, sin ampliación de alcance: los58 hashes de referencia E1 incluyen `src/main.tsx`, cuya edición está autorizada explícitamente en la allowlist E3. En candidato se exigen57 iguales más la única excepción main documentada/hash E3; los41 archivos/175 hunks técnicos seleccionados E2 permanecen íntegros. Los58 hashes de fuente **canónica** sí permanecen todos iguales. Nunca interpretar «58 intactos» como prohibición de la edición main que esta misma enmienda autoriza, ni como permiso para otra diferencia.

## 1. Problema y resultado deseado

Si el navegador permite escribir y borrar almacenamiento, pero impide leerlo, la persona encuentra una pantalla completamente vacía: la aplicación falla antes de poder mostrar su interfaz. No hay explicación ni acción de recuperación. El candidato de consolidación E2 fue rechazado por ese caso.

Se recomienda la intervención mínima: aislar la carga de la aplicación y, si esa carga falla, mostrar un **bloqueo de arranque honesto**, accesible y bilingüe, con recarga real. No se propone fingir que la aplicación, la cuenta o la sincronización están disponibles. Cuando el arranque sí funciona, todos los comportamientos actuales continúan intactos, incluidos los casos de almacenamiento sin escritura o totalmente denegado que ya montan la aplicación.

**Decisión de producto aprobada el 2026-10-11:** este diseño elimina el blanco, pero **no permite usar App/Auth en el caso get-only que hace fallar el SDK**. El Operator aceptó el bloqueo explicado y reversible, en lugar de continuidad pública/local en ese caso. §6 delimita la excepción aprobada de CL-07. No se habilita un nuevo modo público; una exigencia futura de continuidad funcional get-only requiere nueva especificación.

## 2. Alcance exacto, excepciones y NO-TOCAR

### Allowlist aprobada el 2026-10-11

| Archivo exacto | Único delta nuevo permitido |
| --- | --- |
| `src/main.tsx` | Sustituir la importación estática de App por una frontera de importación dinámica; un solo root y un solo intento por documento; estado mínimo de carga y fallo de arranque, clasificación protegida y recarga real. Mantener StrictMode, import de estilos, destino root y bloque de registro de worker sin cambiar sus condiciones, URL, scope ni lógica. |
| `src/main.test.tsx` (nuevo, comprobar ausencia antes de crearlo) | Pruebas de esa frontera: resolución/rechazo, clasificación sin lectura insegura ni fuga de errores/URL, UI/idioma/recarga, root único e intento único. No sustituye cold load compilado con SDK real. |

No se autoriza crear helper/componente adicional, editar CSS o configurar chunks para lograr este diseño. Si son indispensables, detener y pedir una enmienda exacta. La implementación se realiza en una nueva copia aislada derivada del candidato E2 congelado, **no en la fuente canónica**.

Documentación propia futura por main/delivery: este SDD; `AUNARA_SOT/sdd/SDD-006-enmienda-2-consolidacion-local.md`; `AUNARA_SOT/sdd/SDD-006-acceso-y-creacion-rutinas.md`; `AUNARA_SOT/02-ESTADO-ACTUAL.md`, `AUNARA_SOT/PENDIENTES.md`, `AUNARA_SOT/03-HISTORIA-Y-BACKLOG.md`. Solo decisión, excepciones, recibos y estado del delta. La selección documental restante de E2 sigue vigente, sin incorporación automática de borradores/dirty. En esta fase spec el agente asignado solo escribe **este documento**; los otros tienen dueño distinto.

Excepciones solicitadas frente a E2: **edición nueva de bootstrap y test nuevo**, no mera inclusión de bytes históricos; cambio de ubicación del App en el grafo compilado y posible cantidad de assets generados conforme §4; comportamiento de bloqueo explícito en la carga fallida conforme §7. No se levanta la exclusión de cliente/hooks/dependencias. Los 41 archivos/175 objetos-hunks técnicos y 58 hashes E1 de E2 se preservan; el nuevo manifest registra el delta E3 por separado.

### NO-TOCAR

- `src/lib/supabaseClient.ts` y su test, `src/hooks/useCloudSync.ts` y su test, `src/hooks/useStoredState.ts` y su test, `src/lib/cloudStore.ts` y su test: byte por byte respecto del candidato E2. No adapter nuevo, cambios de persistSession/autoRefreshToken/detectSessionInUrl, storage/Auth fallback ni retención alternativa. El buffer efímero de recuperación permanece idéntico y nunca almacena sesión/token/URL.
- `src/App.tsx`, todos sus componentes, estilos, contratos, validadores, datos legacy, perfil, consentimiento, preferencias, rutas, notas, IDs, historial, conteo por lado y wellness: ninguna corrección adicional. Todas las correcciones aprobadas anteriores se conservan.
- `package.json`, lockfiles, `node_modules`, `vite.config.ts`, tsconfig, configuración de tests, `index.html`, scripts y guardas Pages/worker, `.openai`, workflows, `public/sw.js`, manifest/PWA, activos/dataset/metodología y referencias privadas.
- Repo canónico: fuente/tests/activos/config/deps/entornos e índice preservados; documentos concurrentes solo por su dueño. Nada de swap/reset, absorción del dirty, instalación de herramientas o modificación del sistema para conseguir PASS.
- `.env*`, cuentas/tokens/correos/backend reales, Supabase/RLS/tablas/permisos, DNS/HTTPS/Auth settings/SMTP/plantillas, push/merge/release/deploy/producción y SDD-007–009.
- Prohibidos: monkeypatch global de Storage/localStorage; borrar o modificar datos/flag debug; vendoring/edición del SDK; degradar silenciosamente Auth en el caso normal; `configured=false` para saltar gates; catch que convierta un fallo en una falsa App operativa; parsear/mostrar/loguear callback/token/error crudo; loops de reimportación o reintentos automáticos infinitos.

## 3. Estado real y evidencia

Inspección read-only 2026-10-11: HEAD `1c709a3f6d09b940a01e39eb55a2a49b74de712f`; dirty anterior amplio. Se leyeron AGENTS, metodología Personal completa, SOT/estado/pendientes/historia, SDD-006/E1/E2, reporte independiente E2 y fuentes relevantes. No se ejecutaron nuevas pruebas de implementación ni experimento/prototipo funcional en esta fase.

| Evidencia local | Hecho y límite |
| --- | --- |
| `src/main.tsx:1–10` | Importa App estáticamente y solo después llama createRoot/render. Una excepción del grafo importado sucede antes del montaje. |
| `src/lib/supabaseClient.ts:1,8–16,58–59` | Importación estática del SDK y cliente único; configuración Auth existente; observador de recuperación instalado antes de React. |
| `node_modules/@supabase/auth-js/dist/module/lib/locks.js:19–22` | Evaluación top-level del flag `supabase.gotrue-js.locks.debug`, con getItem sin captura después del guard. |
| `node_modules/@supabase/auth-js/dist/module/lib/helpers.js:32–63` | El guard captura acceso al getter, prueba setItem/removeItem, pero no prueba getItem. Get-only puede pasar ese guard y fallar después. |
| `src/hooks/useCloudSync.ts:1,19,102,610`; `src/App.tsx:212–216` | El import directo del SDK en el hook es **type-only**, no una segunda frontera runtime. El hook usa el singleton; configured controla gates de acceso/consentimiento/onboarding. Volverlo false no es una corrección neutral. |
| Búsqueda `rg 'supabase-js|supabaseClient' src` | Único import runtime directo del SDK encontrado en `supabaseClient.ts`; los otros imports del paquete son de tipos. Confinar **todo App** detrás de la frontera evita propagar cambios por sus consumidores. Esta conclusión se limita a src inspeccionado, no prueba un build nuevo. |
| `scripts/check-pages-client.mjs:36–37,64–67`; `scripts/prepare-sites-dist.mjs:36–42`; `vite.config.ts` | Guard admite assets generados con patrón existente; preparador mueve la salida completa cliente. No hace falta asumir una edición de guard/config para un chunk dinámico. Cantidad/nombres reales aún no medidos. |
| `public/sw.js:27–59`; `src/main.tsx:12–21` | Worker actual sirve/cacha GET dentro de scope y registro depende de load. La frontera async no debe mover el registro después de un load que pudo ocurrir: conservar bloque independiente del await/import. No es autorización de nueva estrategia offline. |

Reporte `/private/tmp/aunara-sdd006-e2-review.md`: cold load get-only falla Chromium/WebKit × raíz/rollback, root sin hijos/body vacío; normal/set-only/both montan. Auth fixtures sintéticas y tráfico externo bloqueado. Versiones instaladas/lock coinciden en 2.110.8. No se ejecutó comparación runtime HEAD: **no se atribuye regresión introducida por E2**.

Candidato congelado: `/private/tmp/aunara-sdd006-e2-candidate.EZJxlS/repo`; 41 archivos/175 hunks, 58 hashes E1. Evidencia de fallo: `/private/tmp/aunara-sdd006-e2-storage-candidate.json`; preservación: `/private/tmp/aunara-sdd006-e2-review-preservation.json`. Sus PASS parciales son antecedentes, no aceptación del futuro candidato E3.

## 4. Diseño propuesto y alternativas

### Frontera mínima

1. La entrada conserva imports estáticos únicamente seguros e independientes del grafo App/SDK (React, render y estilos). App se importa dinámicamente una vez. No usar React.lazy que deje el rechazo sin un estado explícito, ni importar App/SDK estáticamente desde el test/helper de arranque.
2. Crear una sola raíz y estado inicial no vacío de carga en ES/EN; iniciar la carga sin timer artificial. La resolución sustituye ese estado por el App real bajo StrictMode. La inicialización actual del singleton y su observador se evalúan al importar App **antes** de renderizar App; no moverlos ni duplicarlos.
3. Capturar únicamente el rechazo de esa carga. Un fallo de render, una operación Auth, una lectura de datos o un error de negocio posterior no se convierte en fallo de almacenamiento por este catch.
4. Tras rechazo, una comprobación de lectura protegida, sin escritura/remoción y sin inspeccionar contenido de usuario, puede distinguir si el getter/getItem está bloqueado en ese momento. Usar una clave diagnóstica propia sin datos; jamás leer/copiar tokens ni tratar la excepción importada como una URL/credencial. Si la comprobación también falla, el texto informa el hecho observado: no pudo iniciarse Aunara y el navegador no permite leer almacenamiento. No inferir que cualquier rechazo fue causado necesariamente por Storage. Si la lectura funciona, mostrar fallo de carga de arranque, sin adjudicarlo a almacenamiento ni inventar error de cuenta/correo/configuración.
5. El bloqueo tiene título/texto claro, rol accesible, selector ES/EN en memoria y botón Recargar/Reload. Inicialización de idioma con idioma del navegador (fallback ES) sin depender de almacenamiento; selector no persiste. Copy propuesta: «No se pudo iniciar Aunara. Este navegador no permite leer el almacenamiento. Revisá los permisos del sitio y recargá. No borres tus datos para intentar resolverlo.» / equivalente inglés. Otro origen: «No se pudo cargar Aunara. Recargá para volver a intentar.» No prometer preservación remota, disponibilidad offline ni éxito después de recargar.
6. Recargar usa reload real del documento, conserva pathname/query/hash y no consume/reescribe enlaces de recuperación. No reimportar el módulo rechazado en el mismo documento ni crear clientes/subscriptions adicionales; el caché de módulos fallidos hace ese reintento inadecuado. No copiar URL/hash a DOM/logs/estado. La matriz verifica un callback sintético intacto antes de recuperar lectura y completar recuperación tras recarga.
7. Usar elementos/estilos ya existentes sin modificar CSS. Mantener el registro worker fuera de la continuación async y exactamente con condiciones/base/scope anteriores. No instalar, borrar o alterar caches para simular un resultado favorable.

### Assets y condición exacta Pages

La frontera dinámica probablemente cambia la salida en chunks; no se afirma su número sin build. El guard actual admite assets generados y no fija31 como constante. **31 sigue siendo el conteo de E2 y la condición si la salida no cambia.** D-E3-3 solicita permitir únicamente el delta de assets generado por esta frontera: después del primer build autorizado, registrar inventario completo/hash/relación entry→App→dependencias en ambas bases y derivar el nuevo conteo exacto de31 más/menos los assets reemplazados/añadidos. Todo archivo estático aprobado debe permanecer idéntico. El revisor comprueba URLs/referencias/imports transitivos dentro de base, existencia y HTTP exitoso de cada asset requerido, y guard vigente con negativos. No aceptar «más archivos» sin atribución, ajustar assertions a ciegas, abrir categorías o editar guard/config. Si el guard real rechaza una necesidad legítima, volver al Operator con rutas y ampliación exacta antes de tocarlo. Sin aprobar D-E3-3, cualquier conteo distinto de31 bloquea entrega.

Alternativas descartadas para esta propuesta: adapter en createClient (demasiado tarde para excepción import-time); preflight que impida importar ante toda lectura fallida (cambiaría controles both/set-only que hoy funcionan); tocar paquete/upgrade (más superficie y no hay corrección upstream comprobada aquí); bypass/vendor de locks; monkeypatch/borrado; capturar errores y montar App con null client/configured=false (nueva semántica/gates). Modo público/local alternativo permanece **fuera de alcance**, no supuesto aprobado.

## 5. Riesgos y mitigaciones

- Bloqueo explicado no equivale a continuidad funcional: D-E3-1 explícita; sin su aprobación no implementación ni excepción de CL-07.
- Import async cambia timing de Auth y load: singleton/observador intactos; matriz SDK real0/200ms antes/después del montaje y worker registrado independientemente. Nunca demorar respuesta para ocultar rojo.
- UI de fallback puede filtrar token/error o falsear causa: sin errores crudos/URL; clasificación por comprobación protegida y negativo de rechazo no-Storage.
- Chunks nuevos pueden fallar en rollback/cache: inventario transitivo por base y cold/warm load compilado con guard vigente. No afirmar PWA física/offline completa por esos controles.
- Correcciones anteriores pueden quedar absorbidas o perderse: manifest E3 separado, hashes E2/E1 y canónico, revisión completa fresca de todos los hunks/documentos. No aceptar un build parcial.

## 6. Criterios falsables de aceptación

| ID | Obligatorio |
| --- | --- |
| AR-01 | Get-only desde cold load SDK real produce estado de bloqueo no vacío, específico con lectura denegada comprobada, selector ES/EN y recarga accesibles; no monta App ni aparenta Auth operativo; no error/import rejection sin manejar. Sin aprobación D-E3-1, este resultado NO cuenta como continuidad CL-07. |
| AR-02 | Normal/set-only/both/getter denegado/remove-only siguen el resultado de E2 medido en control fresco: App o bloqueo solo si realmente rechaza la carga, sin bloqueo preventivo nuevo. Cualquier cambio de resultado respecto de E2 requiere explicación/decisión; no se presume que todas las variantes no medidas antes montan. |
| AR-03 | Una vez permitida lectura y recargado documento, App normal monta y conserva flujos/datos persistidos; no se escribió/borró storage para corregir, no se consumió callback ni se mostró información sensible. |
| AR-04 | Rechazo de import por causa no-Storage con lectura disponible muestra fallo de carga honesto, no permisos/correo/cuenta ni falsa App; no catch general de errores posteriores. |
| AR-05 | Exactamente una raíz, un intento de import por documento, un cliente y observador mínimo de recuperación por cliente; cero subscriptions adicionales/no cleanup previo alterado. SDK recovery0/200ms antes/después del montaje conserva retorno correcto. |
| AR-06 | Delta nuevo solo main/test y docs propias; 41/175 E2,58 E1 y NO-TOCAR canónico intactos, manifest completo y revisión semántica/auditoría documental frescas. |
| AR-07 | Builds/guard/inventario transitivo cumplen §4;31 exacto si no cambia salida, o nuevo conteo exacto atribuido bajo D-E3-3; sin cambios de config/deps/guard/PWA. |
| AR-08 | Matriz completa siguiente y CL-01–09 de E2 reciben evidencia fresca por criterio, revisión independiente y entrega local sin cierre global ni publicación. Criterios pendientes/incompletos no son PASS heredado. |

Excepción propuesta **solo a CL-07**: para carga de App rechazada antes del montaje por lectura denegada, sustituir continuidad funcional por AR-01/03/04. No se relajan guards/privacidad/aislamiento/datos ni ninguna otra denegación que permite montar App. Todos los consumidores de almacenamiento siguen verificándose cuando App sí monta. No presentar esta excepción como «fix del SDK» ni como App utilizable bajo get-only.

## 7. Matriz de verificación fresca y negativos

| Nivel | Casos obligatorios |
| --- | --- |
| Automatizados | Tipos, suite completa, directorio check/test, guards Pages/worker, builds `/` y `/aunara/`, diff-check. Baseline fresco E2=298 Vitest/24+Node1; E3 añade test, registrar conteo exacto y explicar toda variación.302/25 histórico incluía4tests ignored y no es baseline limpio. Lint N/A por ausencia de script; no instalar. |
| Cold load Storage | Chromium/WebKit × ES/EN × ambas bases ×1440/390/320; SDK real con Auth sintética: none/normal, get-only, set-only, get+set, getter localStorage que arroja, remove-only, get+remove y todos los métodos denegados. Contexto nuevo por variante; distinguir lectura de escritura. Control E2 fresco por variante y candidato E3; texto/root/errores/red/cliente/estado y capturas. Misma excepción se inyecta antes de navegar, no después del import. |
| Arranque/fallback | Resolución/rechazo de carga, UI transitoria sin blanco sostenido, fallo no-Storage (asset requerido denegado), selección idioma/teclado/foco/recarga y URL intacta. Al permitir lectura y reload verificar salida a App real. No cambiar foco vía script para PASS. No imprimir hash/callback/error bruto. |
| Auth normal | SDK/hooks reales HTTP sintético0/200ms antes/después del montaje, ambos motores/idiomas/bases/anchos; login/logout/cambio de usuario, persistSession y recarga, refresh, recovery y señal mínima deduplicada, sin pérdida/duplicación de eventos ni fuga entre usuarios. Mantener observador premount y single request. |
| Persistencia/regresión completa E2 | Todos los consumidores de useStoredState, aviso/reconocimiento/recarga/storage denegado operativo; acceso validación/create/error/recovery neutral/pending/429/transporte/confirmación por enlace/reenvío; consentimiento/onboarding/perfil/objetivos/deporte/wellness; navegación/inventario público-privado/cambio usuario y stripping. Borrado completo24 combinaciones con palabra errónea/cancel/Escape/error/reopen/idioma, foco natural asentado. Completar pendientes de E2, no heredar sus PASS parciales. |
| UI/datos completos E2 | Chromium/WebKit ES/EN ambas bases1440/390/320; footer375/1051/1050/1049, scroll/altura460, legal/foco/formulario, menú, instalación prompt/ausente/cancelado/standalone, flotante/badge y capturas inspeccionadas. Legacy/nuevo/triserie8/fallo/20porlado, standard/special/otros días y rutas, editar/guardar/export JSON real sintético/recarga, IDs/notas/history/primaryGoal y enum inválido. |
| Assets/worker | Cold y warm online, resolución de chunks y referencias transitivas bajo ambas bases, registro worker/load sin carreras nuevas; scopes/nombres/lógica congelados. Sin afirmar dispositivos/offline completos. Allowlist y delta exactos §4 con negativos reales PNG arbitrario, archivo servidor/fuera de base, symlink y guardas vigentes. |
| Negativos red→green | En copia disposable quitar frontera dinámica para reproducir blanco get-only y test rojo; romper captura/clasificación/recarga/duplicar inicialización para rojo verificable y restaurar verde. Todos los negativos E2: protección escritura/generación/buffer recovery/falsa existencia/cuarto objetivo/deporte/nota/history/targets compartidos/enum/privado invitado/borrado/standalone/flotante. Completar `shared-targets`, `guest-private`, `float-overlap` en UI real: sus anteriores mutaciones no probadas NO cuentan. Completar negativos artifact/CLI pendientes. No debilitar assertions/producto vivo. |
| Auditoría independiente | Semántica completa de41archivos/175hunks E2 + delta E3, manifest/hash/provenance, documentación/enlaces/privacidad/atribución y exclusiones. Los11docs E2 no son automáticamente aprobados por hashes; revisar contenido. Cada CL/AR mapeado a evidencia; matriz no completada o WebKit ausente ⇒ rechazo. |

Tráfico externo bloqueado **antes** de navegar; únicamente URL/clave/usuarios/tokens sintéticos. No enviar solicitudes reales, crear cuentas, mandar correos ni copiar env privados. Un error de harness se diagnostica sin modificar producto/SDK/sistema ni agregar demora Auth. Las pruebas denegadas pueden alterar Storage solo dentro del contexto disposable de prueba, no como solución de producción.

## 8. Plan de entrega y límite

1. Gate de especificación completado: D-E3-1–4 aprobadas el 2026-10-11; preparación histórica sin implementación preservada. Desarrollo aislado cerrado; no declarar aceptación hasta completar revisión.
2. Tras aprobación, integrador único congela recibo de canónico/E2, crea candidato derivado aislado y añade solo main/test; manifest E3 separado. Si hace falta otro archivo/config/dependencia, detener y volver al Operator.
3. Revisor distinto ejecuta **toda** matriz E2/E3, completa pendientes anteriores y auditoría; no acepta por recibos históricos. Máximo **tres ciclos futuros acotados** desarrollo→revisión para E3; no reinicio ilimitado de E2/CI3. Rechazo persistente o nuevo alcance devuelve decisión al Operator.
4. Solo tras aceptación técnica independiente completa, delivery verifica hashes/árbol/manifest, actualiza docs propias y crea único commit local integrado E2+E3. No incorporar dirty ajeno ni stage canónico durante spec/revisión. La separación técnica/global aprobada en E2 permanece, con la excepción CL-07 únicamente si aprobada aquí.
5. Reportar SHA/base/ubicación/manifest/checks/NO-TOCAR y pendientes. UAT real, cierre humano y permiso de push/publicación siguen separados.

## 9. Decisiones del Operator y preguntas

- **D-E3-1 aprobada 2026-10-11:** bloqueo honesto get-only sin App/Auth, con excepción explícita de continuidad CL-07. No autoriza modo público nuevo.
- **D-E3-2 aprobada 2026-10-11:** allowlist exacta main + main.test y estados/copy/clasificación/recarga §4, sin tocar cliente/hooks/deps/config. URL de recuperación y conducta normal preservadas.
- **D-E3-3 aprobada 2026-10-11:** únicamente delta generado de chunks con inventario/count exactos medidos, guard vigente y controles de base/negativos; no ampliar guard sin nuevo gate.
- **D-E3-4 aprobada 2026-10-11:** hasta tres ciclos acotados, revisión completa fresca E2/E3 y entrega técnica local conjunta después de aceptación, sin UAT/global/push implícitos.
- Incertidumbres verificatorias: cantidad/forma de chunks, timing real con worker/load y recuperación, variantes Storage no cubiertas previamente y retorno tras levantar bloqueo. No se conocen por una inspección de fuente; se verifican después de aprobación y un fallo no autoriza ampliar alcance.

## 10. Definición de terminado y recibo de spec

Spec: **aprobada** el 2026-10-11. La preparación inicial creó únicamente este documento; ese antecedente no acredita aceptación técnica. Desarrollo posterior solo en candidato main/test; revisión y entrega aún pendientes. Trabajo declarado sin commit por gate de aceptación; producción e infraestructura intactas.

Entrega técnica futura: aprobación explícita; todos AR y CL aplicables verdes con excepción CL-07 aprobada si corresponde; candidato completo reproducible con bytes E2/E1 intactos y delta E3 exacto; revisión independiente, documentación/auditoría/manifests y commit local coherentes. Una matriz parcial, un mensaje de bloqueo no aprobado o un build con assets inexplicados no termina el trabajo.

Producto/global: solo el Operator cierra tras UAT/cuentas/correo/sync/borrado/entrenamiento reales, Safari/iPhone/Android/PWA/teclado físicos, responsable/editorial/metodología y restantes gates originales. Nada de esta propuesta les atribuye PASS ni autorización de publicación.
