# SDD-002 — Enmienda 1: almacenamiento denegado y cierre verificable

Versión 0.1 · 2026-10-01 · Estado: **Implementada localmente; revisión técnica PASS, cierre global pendiente**.
Origen: `[AUNARA/codex · GPT-5]`. Complementa [SDD-002](SDD-002-avisos-legales-creditos.md), no sustituye sus criterios.
Aprobación explícita del Operator el 2026-10-01: «Aprobados. Arrancá.», incluidos ambos alcances y el orden almacenamiento → acceso. No autoriza publicación ni operaciones sobre cuentas/correos reales.

## 1. Problema y resultado deseado

Si el navegador impide guardar datos, la aplicación queda en blanco aunque el aviso nuevo soporte el fallo de su propia clave. La persona debe poder seguir usando la visita actual sin que se prometa persistencia ni sincronización inexistentes.
Resultado: tolerar el almacenamiento local denegado, conservar lo que ya funciona y completar la revisión original, sin rebajar pruebas pendientes.

## 2. Alcance y NO-TOCAR

Allowlist **adicional**, efectiva únicamente tras aprobación explícita:

| Archivo exacto | Intervención permitida |
|---|---|
| `src/hooks/useStoredState.ts` | Proteger exclusivamente serialización/escritura del efecto; conservar firma, lectura, claves y estado React en memoria si falla. |
| `src/hooks/useStoredState.test.tsx` (nuevo) | Normal, lectura/escritura denegadas, serialización fallida y continuidad en memoria; no alterar configuración. |
| `src/components/AppFlows.test.tsx` | Integración con denegación global, aviso y regresiones de todos los estados que usan el hook. |
| `AUNARA_SOT/sdd/SDD-002-enmienda-1-almacenamiento-y-cierre.md` | Estado, decisiones y evidencia de la enmienda. |
| `AUNARA_SOT/02-ESTADO-ACTUAL.md` | Solo entrada/hunks de estado y bloqueo/cierre de SDD-002, preservando cambios previos. |
| `AUNARA_SOT/03-HISTORIA-Y-BACKLOG.md` | Una entrada nueva arriba, sin reescribir historia. |
| `AUNARA_SOT/PENDIENTES.md` | Solo pendientes/decisiones/cierre de SDD-002, sin cerrar UAT distinta. |

Se conserva la allowlist original de SDD-002 para correcciones que exija su revisión. Esta enmienda levanta NO-TOCAR del hook **solo** para lo anterior y el gate documental solo para esos tres documentos.
NO-TOCAR: auth/cloud/Supabase; claves, formatos, migraciones, `clear`/borrados; ConsentGate, versión jurídica, salud y lógica de entrenamiento; worker/PWA/Pages/workflows/dependencias; referencias privadas y secretos; cualquier otro archivo.
No editar ni absorber dirty previo en `06-RUNBOOK.md`, SDD-001 Enmienda 2 o `docs/product/`. Los hunks previos de `02`/`PENDIENTES` también se preservan y excluyen de la entrega. SDD-003 no entra a este commit.

## 3. Estado real de partida

- `src/hooks/useStoredState.ts:6-9` protege lectura; `:13-15` escribe sin captura. La fuente del hook es idéntica a HEAD; **no** se ha reproducido todavía el baseline completo en runtime.
- `src/App.tsx:127-135` tiene nueve consumidores: idioma, nombre, favoritos, workout legado, rutas, ruta activa, inicialización, salud y check-ins. Todos quedan sujetos a regresión.
- Búsqueda de `localStorage`, `sessionStorage`, `getItem` y `setItem` en producción `src/`: escrituras directas en este hook y `StorageNotice.tsx:26`, ya protegida. Esto no descarta escrituras de SDK/dependencias.
- Revisión 2 registrada en SDD-002 §8: **REJECTED**. Denegación global de getItem/setItem produjo blanco y `Blocked`; fallo aislado del aviso PASS.
- Evidencia previa registrada: 160 pruebas Vitest + 1 Node de preparación, 4 de directorio, 4 guards con negativos, typecheck, builds raíz/Pages, artifact 31 y ocho combinaciones Chromium/WebKit × 1440/375 × ES/EN PASS. No equivale a nueva aprobación.
- Los 11 archivos de implementación original siguen locales, sin commit. Faltan inventario autenticado y entrenamiento real, además del gate documental.

## 4. Diseño

Envolver la escritura y su serialización en protección acotada dentro del efecto. Ante excepción, no lanzar al render, no resetear valores, no escribir otra clave ni limpiar almacenamiento: `useState` sigue siendo la fuente de la visita.
Con almacenamiento disponible se conserva el comportamiento actual, incluida recarga. Con almacenamiento denegado no se garantiza supervivencia a recarga ni se anuncia éxito cloud.
Antes de corregir: ejecutar baseline de HEAD en copia temporal aislada, sin modificar/swapear el working tree vivo, sin copiar secretos, con idéntica inyección de fallo. Registrar hash y resultado para distinguir causa preexistente de regresión.
Inspeccionar las escrituras directas y el comportamiento del SDK bajo denegación. Si aparece otra dependencia que exige producción fuera de allowlist, parar y pedir enmienda; no añadir capturas globales ni refactors oportunistas.

## 5. Alternativas descartadas

No excluir el bloqueo global de A2; no borrar claves; no desactivar persistencia normal; no reemplazar localStorage por un sistema nuevo; no corregir auth bajo este ítem.
Una captura en el aviso no protege las otras nueve escrituras y por eso no resuelve el problema completo.

## 6. Riesgos y mitigación

- Hook compartido: inventariar y probar todos sus consumidores, no solo idioma.
- Pérdida silenciosa: conservar estado en memoria y documentar límite de recarga, sin falso «guardado» cloud.
- Atribución incorrecta: comparación runtime aislada obligatoria, además de igualdad de fuente.
- Dirty/documentación pública: snapshot inicial, hunks aislados y revisión de contenido; nunca valores personales/tokens.

## 7. Criterios falsables y matriz

- **E1:** Baseline HEAD y corregido se ejecutan con la misma denegación global; recibo identifica hash, entorno y resultado real. Si baseline no se ejecuta, atribución runtime permanece pendiente.
- **E2:** getItem denegado, setItem denegado y ambos denegados no dejan blanco ni excepciones sin capturar. Cambiar estado React conserva el valor durante la visita. Serialización fallida tampoco rompe render.
- **E3:** Persistencia normal y recarga conservan valores; no se invoca `clear`/borrado, no cambia ninguna clave ni formato. Los nueve consumidores conservan sus regresiones y comportamiento permitido bajo denegación.
- **E4:** App completa con denegación global permite navegación, aviso → Entendido, reapertura legal y controles de invitado; recarga vuelve a valores iniciales si no pudo persistir. Sin claim falso de sync.
- **E5:** A1–A9 originales siguen exigidos. Inventario autenticado real sin valores privados, entrenamiento real y revisión del responsable no se reemplazan por mocks ni «N/A».
- **E6:** Diff y commit contienen solo alcance autorizado; todos los hunks dirty previos quedan intactos y fuera del índice.

Matriz fresca: `npm run typecheck`, `npm test`, `npm run test:exercise-directory`, `node --test scripts/check-pages-client.node-test.mjs`, builds `/` y `/aunara/` más guard de artifact, diff-check. Lint N/A: no hay script, no instalarlo.
UI real: Chromium **y WebKit**, 1440×900/375×812, ES/EN, normal y almacenamiento global denegado; app completa y ventanas/aviso/foco/formulario. Repetir matriz original tras corrección, no heredar PASS anteriores.
Negativos: restaurar temporalmente la escritura vulnerable en copia aislada y confirmar test rojo; guard de artifact rechaza archivo arbitrario y luego acepta artifact normal. Registrar evidencia sanitizada, sin contraseñas/correos personales/tokens.

## 8. Entrega y frontera de commit

Después de aprobación: desarrollo acotado → revisión independiente nueva → corrección/revisión si REJECTED. Respetar tope metodológico de tres iteraciones; si se agota sin aceptación, devolver bloqueo al Operator, no declarar cierre.
Actualizar solo hunks autorizados de SDD-002/enmienda, estado, historia y pendientes. Mantener abiertos todos los checks no ejecutados.
Antes del stage: comparar snapshot inicial, diff de implementación revisado y diff documental; revisar índice contra hashes/hunks aprobados. Si no se pueden aislar cambios previos sin riesgo, detener entrega y pedir decisión.
Un commit local de SDD-002 original + corrección + documentación revisada; ninguna inclusión de SDD-003, referencias o dirty ajeno. Sin push, deploy ni operación externa.

## 9. Decisiones y pendientes del Operator

Aprobar o ajustar esta enmienda exacta, incluido el permiso documental mínimo de §2.
Para pruebas reales: sesión/cuenta autorizada y participación manual del Operator donde requiera credenciales. No usar contraseñas de capturas ni enviar correos sin autorización específica. Si falta esa intervención, cierre queda bloqueado; no se elimina la prueba.

## 10. Definición de terminado

Enmienda aprobada explícitamente, E1–E6 y A1–A9 demostrados, matriz fresca PASS con WebKit, revisión independiente APPROVED, documentación mínima al día y commit aislado. Cierra el Operator.
Hoy: **implementación y revisión técnica completas; sin stage, commit, push ni despliegue. No cerrado globalmente**.

### Recibo de la iteración aprobada — 2026-10-01

`[AUNARA/codex · GPT-5]` — Desarrollo limitado al hook protegido, test nuevo y hunk aditivo de AppFlows. Revisión independiente: E1–E4 PASS. HEAD `086e5c4c806f513ab7f5b92e2a203e363d6cfdde` aislado sin env quedó blanco; el mismo HEAD con solo la protección del hook permaneció operativo y sin errores, usando idéntica inyección. Negativo independiente: 3 pruebas FAIL / 1 PASS con escritura vulnerable, después 4 PASS con protección. 167 Vitest + 1 preparación, 4 directorio, 4 guard con negativos, typecheck, builds raíz/Pages, artifact31 y diff-check PASS. UI fresca: 32 combinaciones Chromium/WebKit × escritorio/móvil × ES/EN × normal/global denegado × raíz/Pages PASS.

Veredicto global REJECTED por pruebas reales de usuario/inventario autenticados, login/entrenamiento y revisión del responsable todavía pendientes (E5/A1/A3/A7). E6/A9: allowlist local y ausencia de stage comprobados; entrega/commit aún pendientes. No existe checkpoint retrospectivo completo de los 11 archivos originales; el snapshot actual no demuestra preservación pasada. No se declara lo contrario.

Frontera actual congelada antes de SDD-003 en `/private/tmp/aunara-sdd002-boundary.9w72PW`: 11 archivos originales, hook/tests y fuentes de acceso aún sin cambios de SDD-003. Recibos temporales `/private/tmp/aunara-storage-amendment-receipt.md` y `/private/tmp/aunara-storage-independent-review.md`; no contienen credenciales y no se publican. SDD-003 sigue el orden aprobado sobre esa frontera, sin declarar cerrado SDD-002 ni mezclar su futuro commit.
