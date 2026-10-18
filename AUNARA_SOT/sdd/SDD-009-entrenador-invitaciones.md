# SDD-009 — Entrenador, invitaciones y consentimiento

2026-10-10 · Estado: **Borrador** · v1
Origen: [Aunara/Codex · modelo no expuesto en este agente]
Entrega 4; después del producto personal 006–008 y UAT. Gate de seguridad/backend independiente.

## 1. El problema, en el idioma del Operator

Un entrenador necesita acompañar a su grupo, pero registrarse en Aunara no debe compartir datos ni vincular a nadie automáticamente. La persona acepta una invitación informada, conoce permisos y puede retirarse; el entrenador no obtiene acceso a otras personas ni a salud fuera de autorización.

## 2. Alcance y fuera de alcance

Propuesto: registro autónomo existente, invitación de entrenador, consentimiento específico, relación con permisos mínimos, consulta/gestión limitada, rechazo/caducidad/revocación y auditoría. Roles no inferidos de correo o de estado de login.

Allowlist **tentativa, no aprobada**:

- UI existentes: `src/App.tsx`, `src/styles.css`, `src/types.ts`, `src/components/AppFlows.test.tsx`; nuevos `src/components/CoachPanel.tsx`, `src/components/CoachPanel.test.tsx`, `src/components/CoachInvitationPanel.tsx`, `src/components/CoachInvitationPanel.test.tsx`.
- Contrato puro nuevo: `src/lib/coachPermissions.ts`, `src/lib/coachPermissions.test.ts`.
- **Backend aún sin allowlist**: tablas/RLS/endpoints y pruebas de integración se fijarán por nombre exacto tras threat model y diseño. No autoriza editar `supabase/`, Auth ni servicios hoy.
- Documentación: este SDD, `AUNARA_SOT/02-ESTADO-ACTUAL.md`, `AUNARA_SOT/PENDIENTES.md`, `AUNARA_SOT/03-HISTORIA-Y-BACKLOG.md`, `docs/product/2026-08-25-feedback-work-plan.md`, `docs/compliance/data-processing-inventory.md`, `docs/compliance/retention-and-rights.md`.

**NO-TOCAR:** flujos personales 006–008, login/recuperación/confirmación existentes, datos privados ajenos, `.env*`, producción, DNS/SMTP/correos reales, matrices clínicas congeladas, medios/IDs/marca y dependencias/workflows. Ningún permiso administrativo en cliente, checker de existencia, alta automática de cuentas, link automático por email, exportación colectiva de salud ni acceso retroactivo por defecto. Backend solo tras SDD enmendado/aprobado, nunca por esta lista tentativa.

## 3. Estado real de partida, medido y no supuesto

HEAD leído `1c709a3`, cambios locales pendientes; este turno no audita servicio desplegado.

- `docs/product/2026-08-25-feedback-work-plan.md:33` FB-06: registro autónomo + invitación, después del producto personal; su estado previo Pausado no se cambia a implementado por esta especificación.
- `src/lib/cloudSnapshot.ts:10–20`: snapshot personal sin relación de entrenador en ese contrato.
- `supabase/migrations/202607260001_create_repbook_user_data.sql:12–35`: políticas por `auth.uid() = user_id`; no ampliar esta tabla a lectura de entrenador por comodidad.
- `supabase/migrations/202607290001_add_consent_audit.sql:21–31`: auditoría propia, no consentimiento compartido genérico.
- Búsqueda `rg --files src/components src/lib` no encuentra módulo coach/invitation; esta ausencia se limita al inventario local, no demuestra ausencia en servicio remoto.

## 4. Diseño

Secuencia: persona crea su propia cuenta→entrenador autorizado emite invitación→persona autenticada ve identidad/alcance/datos compartidos/plazo→acepta expresamente→se crea relación activa. Rechazar/ver enlace no vincula. Enlace no autentica ni otorga acceso por sí mismo.

Invitación con ID opaco, expiración y uso único ligado al destinatario definido por contrato aprobado. Estados propuesta: pendiente/aceptada/rechazada/caducada/revocada; respuestas idempotentes. No revelar públicamente si correo existe; entrega de invitaciones (in-app/enlace/correo) requiere decisión, ningún email real ahora.

Matriz propuesta de permisos por acción y categoría: ver rutinas compartidas/ejecución, proponer cambios, y solo si se autoriza información concreta adicional. Perfil de salud/nutrición/check-ins no se incluye automáticamente; exportar/eliminar cuenta, consentimiento global y credenciales jamás son permisos de entrenador. Propuesta cambia rutina solo cuando la persona acepta, sin reescribir sesiones cerradas.

Autorización de cada lectura/escritura en servidor por identidad, relación activa, permiso y recurso; frontend es UX, no perímetro de aislamiento. Aun una URL/ID válido de miembro ajeno falla sin relación. Threat model contempla invitación robada/replay, IDOR, role spoofing, listado enumerador, acceso después de revocar, caché y export.

Revocar/abandonar corta acceso de servidor de inmediato según contrato temporal aprobado, invalida caché de acceso y no borra historial personal. Auditoría mínima guarda decisión/versión/fecha/actor; conservación y efecto sobre copias ya obtenidas se explican sin prometer borrado remoto imposible. Entrenador baja/miembro cambia cuenta: comprobar permisos de nuevo, no sesiones frontend perpetuas.

Datos multiusuario no se colocan indiscriminadamente en snapshot personal ni se sincronizan entre miembros. Contrato/tablas/RLS requieren diseño exacto y migración reversible aprobados; pruebas con usuarios sintéticos y servicio aislado, nunca filas reales de producción.

## 5. Alternativas descartadas

Entrenador registra personas; join por email sin aceptación; compartir salud por estar en grupo; autorización solo de navegador; token como autenticación; abrir RLS personal; cuentas reales para probar seguridad; corregir SMTP dentro de este frente.

## 6. Riesgo sobre lo que hoy funciona

Crítico: fuga multiusuario/escalamiento y consentimiento genérico. Mitigar con matriz por recurso/acción, enforcement servidor y pruebas adversariales antes de aprobar backend. Caché/revocación: contrato explícito y pruebas con relación removida. Migración/producción: ambiente aislado, fixtures y plan de rollback; nunca asumir aprobación de operación a partir de SDD funcional. Dirty: recibo nuevo después de 008.

## 7. Verificación

| ID | Criterio falsable futuro |
| --- | --- |
| CA09-01 | Registro autónomo/ver invitación no crea relación; aceptación informada explícita sí; rechazo no comparte datos. |
| CA09-02 | Invitación vencida/revocada/robada/replay o destinatario incorrecto no permite vínculo; reintento no duplica. |
| CA09-03 | Cada permiso permitido tiene caso positivo; no otorgado y recurso ajeno deniegan en servidor aunque frontend/URL se manipule. |
| CA09-04 | Coach A no lista/lee/escribe/exporta datos de coach B ni usuarios sin relación; rol falsificado no eleva privilegio. |
| CA09-05 | Salud/nutrición no se comparten por aceptación genérica; credenciales/export global/borrado cuenta siempre excluidos. |
| CA09-06 | Revocar abandona relación y bloquea lectura/escritura posterior/caché según contrato; historial personal intacto. |
| CA09-07 | Propuesta exige aceptación y no cambia sesión cerrada; auditoría registra decisión/versiones sin secretos. |
| CA09-08 | Acceso personal, consentimiento global, export/recuperación y flujos006–008 no regresan; no enumeration/email real en pruebas. |

Matriz: typecheck/suite/directorio/builds raíz/rollback/artifact y lint N/A si no existe; pruebas servidor/RLS por identidad/recurso obligatorias en ambiente aislado con schema aprobado. UI real Chromium/WebKit desktop1440/mobile390 ES/EN: invitar/ver/aceptar/rechazar/revocar y vecinos. Negativos IDOR, role spoof, token replay/expirado, permiso faltante, relación revocada y listados enumeradores deben fallar; guarda rojo al romper enforcement y verde al restaurar. UAT real Operator con cuentas autorizadas separada; correos/permisos servicio/operaciones no se ejecutan por mocks. Sin backend/security evidence no hay APPROVED.

## 8. Plan de entrega

Rebaseline después de UAT personal; prototipo/matriz permisos/threat model/contrato servidor y migración/rollback; aprobación explícita y allowlist exacta antes de código. Primero relación/consentimiento/aislamiento, después UI entrenador; nunca UI declarada segura sin enforcement. Máximo3 ciclos con revisor independiente, luego documentación/commit local aislado, UAT/cierre Operator; operación de migración, correo y publicación requieren autorizaciones separadas.

## 9. Decisiones que necesita el Operator

Quién puede ser entrenador; datos/acciones compartibles mínimos; destinatario/expiración/canal; salida/revocación/conservación; escalamiento a revisión de privacidad/jurídica. Aprobar diseño de backend/entorno de prueba y permisos exactos antes de eliminar la restricción `supabase/`. Sin esas decisiones sigue Borrador, no listo para implementar.

## 10. Definición de terminado

CA seguridad/consentimiento/UI verdes, pruebas servidor y negativas reproducibles, revisión independiente APPROVED, documentación/commit local, UAT/cierre Operator. No fuga ni regresión; publicación/migración real/correo solo por orden separada. Crear este documento no levanta pausa operacional ni aprueba backend.
