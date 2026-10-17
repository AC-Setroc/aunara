# SDD-003 — Acceso claro y recuperación de contraseña

Versión 0.1 · 2026-10-01 · Estado: **Implementado localmente; revisión técnica independiente PASS, cierre bloqueado por UAT real**.
Origen: `[AUNARA/codex · GPT-5]`. Frente separado de [SDD-002](SDD-002-avisos-legales-creditos.md).
Aprobación explícita del Operator el 2026-10-01: «Aprobados. Arrancá.», incluidos ambos alcances y el orden almacenamiento → acceso. No autoriza publicación ni operaciones sobre cuentas/correos reales.

## 1. Problema y resultado deseado

Al cambiar entre crear cuenta e ingresar quedan errores de la acción anterior. Algunos errores aparecen en inglés aun usando español. Un correo con dominio incompleto llega al proveedor y falla; recuperar contraseña solo aparece después de detectar una cuenta existente.
Resultado: cada modo ofrece orientación actual, validación comprensible en el idioma elegido y una recuperación voluntaria visible, sin alterar cuentas ni consentimientos.

## 2. Alcance y NO-TOCAR

Allowlist propuesta, **solo tras aprobación explícita**:

| Archivo exacto | Intervención permitida |
|---|---|
| `src/components/AccessPanel.tsx` | Validación de correo ES/EN, limpieza de error al cambiar modo, acción visible de recuperación en ambos modos; preservar ramas y valores existentes. Helpers locales, sin archivo nuevo. |
| `src/hooks/useCloudSync.ts` | Clasificar/traducir solo errores de acceso; limpieza explícita de error auth; impedir respuestas obsoletas de restaurarlo. Mantener contratos/calls de servidor. |
| `src/App.tsx` | Únicamente conectar callback de limpieza de error de acceso al panel. |
| `src/components/AccessPanel.test.tsx` | Validación, cambios de modo, recuperación voluntaria y regresiones de ramas/consentimientos. |
| `src/hooks/useCloudSync.test.tsx` | Errores auth ES/EN, provenance, carreras, normalización, llamadas y estados existentes. |
| `src/components/AppFlows.test.tsx` | Integración acotada del callback y regresiones cercanas. |
| `AUNARA_SOT/sdd/SDD-003-acceso-y-recuperacion.md` | Estado, decisiones, evidencia y log del ítem. |
| `AUNARA_SOT/02-ESTADO-ACTUAL.md` | Solo hunks de estado/bloqueos de SDD-003. |
| `AUNARA_SOT/03-HISTORIA-Y-BACKLOG.md` | Nueva entrada arriba; no reescribir previas. |
| `AUNARA_SOT/PENDIENTES.md` | Solo ítem/decisiones de SDD-003. |

NO-TOCAR: `supabase/`, `src/lib/supabaseClient.ts`, URL/redirects, proveedor/backend, tablas/RLS, permisos/usuarios/correos reales, sync/bootstrap/cloudStore, datos de cuenta o entrenamiento, limpieza al salir, borrado/exportación, ConsentGate, versión/legal y salud.
Conservar signup, confirmación por link/código, reenvío, aviso de cuenta existente con su correo visible, recuperación ya implementada y éxito posterior; no esconder esas ramas para simplificar.
No CSS/rediseño, dependencias, nuevos archivos de producción, worker/Pages/PWA, referencias o secretos. Preservar dirty preexistente y SDD-002; no editar `06-RUNBOOK.md`, SDD-001 Enmienda 2 ni producto ajeno. Todo archivo no listado sigue fuera.

## 3. Estado real de partida

- `AccessPanel.tsx:357-358`: botones únicamente llaman `setMode`; el mensaje proviene de `cloud.message`, compartido entre operaciones.
- `AccessPanel.tsx:153-172,368`: trim al enviar y `type="email"`, sin helper de formato de dominio público. La validación HTML no exige un dominio con punto.
- `AccessPanel.tsx:66,305`: callback de reset existe, pero acción visible solo en rama `existingAccountEmail`; búsqueda de `onRequestPasswordReset` en el componente no encuentra acción en formulario normal.
- `useCloudSync.ts:248,294,319,349,370,398`: signup, verify, resend, reset, update y sign-in presentan `error.message` crudo. `:174,199` también usa errores cloud, **fuera de la traducción de este alcance**.
- `useCloudSync.ts:330-333`: limpiar cuenta existente borra mensaje sin distinguir origen; no reutilizarlo como limpieza genérica de modo.
- `App.tsx:1013-1014`: ya conecta cuenta existente y recuperación. Tests actuales cubren esos flujos con cliente simulado; no demuestran auth real.

## 4. Diseño y fronteras

Separar internamente provenance del mensaje de acceso/error de sync, éxito y verificación. Cambio efectivo de modo limpia **solo** error auth anterior y validación local; no resetear correo/nombre, consentimientos, mensajes de éxito o estados de confirmación/recuperación.
Conservar estado de operación pendiente y no convertir `syncing` en un falso éxito. Una respuesta auth tardía del modo anterior no vuelve a pintar el error viejo: usar invalidación/generación acotada si es necesaria; no reescribir el sistema cloud ni descartar sesiones legítimas.
Helper local para correo: trim, parte local/dominio no vacíos, sin espacios internos, dominio público con etiquetas y TLD completo. Definir casos aceptados/rechazados en tests (incluido subdominio y `+`); no bajar a minúsculas toda la parte local ni normalizar contraseñas.
`usuario@example` se rechaza como **política de correo público de Aunara**, no como afirmación de invalidez universal RFC. Helper/clientes no prueban existencia ni propiedad del correo. Mensaje asociado al campo, `aria-invalid`/descripción y anuncio accesible ES/EN; no depender de un popup del navegador en otro idioma.
Acción «Recuperar contraseña / Recover password» en crear e ingresar, de tipo botón. Usa correo validado/trim; no exige nombre, password ni checkboxes de signup, y no dispara signup/login. Vacío/incompleto muestra ayuda y no hace llamada.
Solo clic explícito solicita reset, una llamada por acción aceptada; deshabilitar duplicados pendientes. Escribir correo o cambiar modo nunca envía. Mantener recuperación desde cuenta existente y ruta `PASSWORD_RECOVERY` → nueva contraseña.
Mapear códigos/casos conocidos de auth a copy ES/EN y fallback seguro, sin mostrar error técnico crudo ni inferir existencia de cuentas. Respuesta de reset debe ser neutral: solicitud procesada, no promesa comprobada de entrega de email.

## 5. Alternativas descartadas

No borrar todo `cloud.message`, usar `clearExistingAccount` indiscriminadamente, traducir por reemplazos arbitrarios de strings ni esconder errores reales. No quitar validación, inventar envío automático ni cambiar reglas del proveedor.
No refactorizar sync ni resolver almacenamiento global en este SDD: lo cubre la enmienda de SDD-002.

## 6. Riesgos y mitigación

- Mensaje compartido: pruebas distinguen error auth de sync, éxito y pendingVerification.
- Carrera asíncrona: promesas diferidas reproducen fallo antiguo tras nuevo modo; no toca sesión/datos válidos.
- Validación excesiva: corpus explícito de correos públicos válidos y casos negativos, normalización mínima.
- Recuperación accidental/enumeración: acción explícita, anti-duplicados y copy neutral; ningún correo real en automatizados.
- Dirty solapado en App/tests: delta nuevo contra snapshot revisado de SDD-002, sin absorber su implementación ni documentos previos.

## 7. Criterios falsables y matriz

Enmienda aprobada 2026-10-02: [recuperación contextual](SDD-003-enmienda-1-recuperacion-contextual.md) supera únicamente la exigencia de A4/§2/§4 de recuperar visible en create normal. Login conserva recuperación; create la ofrece solo en conflicto detectado por signup. Los criterios y recibos siguientes se conservan como historia de la versión original; las otras garantías siguen vigentes.

- **A1:** Error de signup no aparece al pasar a ingreso, ni viceversa. Error tardío del modo anterior no reaparece; email/nombre/consentimientos no cambian por esta limpieza.
- **A2:** Sync-error, éxito, verificación pendiente y recuperación no se borran al limpiar error auth. Sesión legítima y datos permanecen intactos.
- **A3:** Vacío, espacios internos y dominio incompleto se rechazan con mensaje accesible ES/EN, sin llamada auth. Correo público válido con trim, subdominio o `+` llega correcto; contraseña intacta.
- **A4:** Recuperación visible en ambos modos; clic con correo válido realiza exactamente un reset y cero signup/login. Sin password/aceptación sigue disponible. Sin clic, cero resets al cambiar modo o escribir; pendiente impide duplicado.
- **A5:** Errores conocidos y desconocidos de signup/sign-in/verify/resend/reset/update tienen copy ES/EN seguro, sin raw técnico ni afirmación de entrega real; sync no se modifica.
- **A6:** Cuenta existente mantiene correo y opciones; confirmación/código/reenvío y cambio de contraseña siguen funcionando. Legal obligatorio, salud opcional/separada y ventanas superpuestas conservan regresiones.
- **A7:** Diff/commit estrictamente permitido, sin env/tokens/capturas con passwords, sin correos enviados ni usuarios modificados sin permiso específico.

Automatizados frescos: typecheck, suite completa `npm test`, directorio, guard Pages con negativos/normal, builds raíz y `/aunara/`, artifact y diff-check. Lint N/A porque no existe script; no añadir dependencias.
UI real Chromium **y WebKit** × 1440×900/375×812 × ES/EN: cambiar modo tras error, validación/foco/anuncio, recuperación visible y conservación legal; interceptar respuestas locales para fallos controlados. Etiquetar mocks como simulación, nunca prueba de auth real.
Negativos de guard: caso inválido demuestra cero requests; quitar limpieza/invalidación en copia aislada vuelve roja su prueba, luego normal PASS. Evidencia solo metadatos sanitizados, sin datos de token/sesión/contraseñas.
UAT real: signup/confirmación, login, solicitud/retorno de recuperación y sync en cuenta/entorno autorizados, con intervención manual del Operator para credenciales y permiso específico para enviar correos. Sin disponibilidad, queda bloqueado; no se omite ni sustituye por mock.

## 8. Entrega y frontera de commit

Frontera confirmada el 2026-10-01: almacenamiento tiene revisión técnica independiente PASS y sigue abierto por cobertura real pendiente. Snapshot anterior a los cambios de este SDD en `/private/tmp/aunara-sdd002-boundary.9w72PW`; solo el delta contra esa copia pertenece a SDD-003 en archivos solapados. No se altera el orden aprobado ni se presenta SDD-002 como cerrado.

Aprobación exacta → desarrollo → revisión independiente → correcciones/revisión nueva hasta APPROVED; tope metodológico de tres iteraciones, después devolver bloqueo si continúa rojo.
Preferir cerrar/aislar SDD-002 antes de implementar este frente solapado. Si se propone otro orden, presentar frontera de hunks y pedir decisión, sin commitear el trabajo ajeno.
Actualizar solo documentación de §2 y registrar pruebas reales frente a simuladas. Snapshot inicial/final y diff del índice prueban exclusión de dirty previo; si no se logra aislar con seguridad, parar.
Commit local enfocado de SDD-003 únicamente, después de revisión; sin push, publicación ni cambios externos.

## 9. Decisiones y pendientes del Operator

Aprobar/ajustar este SDD exacto, política explícita de correo público y doc mínima; confirmar secuencia respecto de SDD-002.
Autorizar separadamente sesión/cuenta y correos reales para UAT. No usar credenciales de capturas ni copiar secretos a evidencia. La aprobación de código no autoriza por sí sola crear usuarios/enviar emails.

## 10. Definición de terminado

A1–A7 demostrados, matriz completa con WebKit y auth real autorizado, revisión independiente APPROVED, documentación actualizada, commit aislado y cierre del Operator. Cualquier prueba pendiente impide declarar terminado.
Registro de partida: la propuesta se preparó sin editar código, configuración, pruebas existentes ni documentos previos. Ese registro no describe el estado de implementación posterior.

## 11. Log de implementación y evidencia

2026-10-01 `[AUNARA/codex · GPT-5]`: desarrollo acotado concluido en los seis archivos de producción/pruebas de §2, comparado con la frontera congelada posterior a almacenamiento. App cambia únicamente la conexión del callback; avisos, modales legales, estilos, hook de almacenamiento, guard y activo de crédito permanecen iguales a esa frontera. Recuperación visible en ambos modos, validación local accesible de correo público, error auth traducido al idioma actual y limpieza/invalidez de errores tardíos implementados. No se descartan éxitos/sesiones legítimos ni se limpian errores de sync por cambiar modo. Recuperación deduplicada con liberación también ante excepción de transporte.

Recibo del desarrollo, no aceptación independiente: typecheck PASS; 221 pruebas Vitest en 20 archivos + preparación Sites 1; directorio 4 y guard/worker 6 PASS; builds raíz/Pages y allowlist de 31 archivos PASS; diff-check PASS. Lint N/A sin script; warning de tamaño de bundle preexistente no intervenido. Copia aislada sin invalidación produjo dos fallas esperadas; fuente intacta pasó esos dos casos. Todas las respuestas de cuenta son simuladas; no demuestran entrega de correo ni autenticación real. Evidencia temporal sanitizada `/private/tmp/aunara-access-dev-receipt.md`.

Revisión independiente Chromium/WebKit y checks frescos en curso. UAT real de signup/confirmación, login, recuperación/retorno y sync sigue pendiente de sesión y acciones autorizadas del Operator. Sin stage, commit, push, publicación ni cambios reales de cuentas/correos.

Resultado posterior de revisión independiente, 2026-10-01 `[AUNARA/codex · GPT-5]`: **technical PASS; global REJECTED únicamente por UAT real pendiente**, sin defecto de implementación encontrado. Ejecución fresca: typecheck; 221 Vitest + Sites1; directorio4/check; guards/worker6; builds raíz/Pages; artifact31 y diff-check PASS. Chromium/WebKit × 1440×900/375×812 × ES/EN: 8/8 recorridos de UI PASS, con fallos de auth explícitamente simulados y todas las peticiones externas bloqueadas. Cubren limpieza en ambos sentidos, respuesta tardía, cambio de idioma, correo inválido sin llamadas, recuperación voluntaria/única, conservación de valores/consentimientos, foco legal superpuesto y ausencia de overflow horizontal. Móvil requiere scroll del panel para llegar a recuperación; se probó su acceso y activación.

Guardas negativas independientes en copia aislada: quitar invalidación → 2 FAIL; quitar limpieza → 1 FAIL; restaurado → 3 PASS. Fuente viva intacta; seis hashes revisados iguales al recibo de desarrollo. Se inspeccionaron capturas de formularios vacíos, no credenciales. Recibo temporal `/private/tmp/aunara-access-independent-review.md`. Preview final `http://127.0.0.1:4193/aunara/`: HTTP 200 y smoke de UI compilada Chromium/WebKit PASS; no es URL pública para celular. Error inicial 404 del servidor preview se corrigió en su arranque, sin tocar fuente.

Siguiente gate: Operator ingresa sus credenciales manualmente y autoriza/ejecuta los recorridos reales de confirmación, login, recuperación/retorno y sync; inventario autenticado y entrenamiento de SDD-002 también continúan pendientes. Las simulaciones no prueban envío/entrega de correo ni funcionamiento real del backend. Hasta completar el gate y recibir APPROVED independiente no se crea commit; quedan cambios locales declarados sin commit, push ni publicación. La versión Pages pública todavía no incluye este trabajo.
