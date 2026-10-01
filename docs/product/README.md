# Producto Aunara — índice de decisiones y avance

Estado del índice: 27 de agosto de 2026.

Este directorio concentra las decisiones de producto que deben aprobarse antes
de convertirse en cambios de la aplicación. Su propósito es mantener separados:

- el problema y la experiencia que se quieren resolver;
- los límites metodológicos y de seguridad;
- el plan de ejecución y sus dependencias;
- la implementación técnica, que comienza solo después de la aprobación.

## Documentos activos

- [Propuesta de home y seguridad metodológica](./2026-08-25-home-and-methodological-safety-proposal.md)
- [Plan de trabajo derivado del feedback](./2026-08-25-feedback-work-plan.md)
- [Planes nutricionales Simple y por Macros](./2026-08-27-dual-nutrition-plans.md)

## Decisiones ya fijadas

1. Aunara conserva dos modalidades: uso personal independiente y uso vinculado
   a un entrenador.
2. Toda persona crea y controla su propia cuenta.
3. Un entrenador no crea la identidad del usuario: le envía una invitación para
   unirse a su grupo de entrenados.
4. Aceptar una invitación debe ser voluntario, informado, revocable y limitado a
   los datos que el usuario consienta compartir.
5. La modalidad entrenador y marca blanca queda para una etapa posterior. No
   bloquea el cierre del producto personal.
6. Las propuestas actuales de rutina se generan con reglas locales y datos del
   catálogo; no usan la cuenta personal de ChatGPT del usuario.
7. La dirección visual del nuevo home fue aceptada el 26 de agosto de 2026; la
   implementación espera el cierre de accesibilidad/copy y la puerta
   metodológica.
8. La matriz metodológica v0.1 fue entregada al entrenador y permanece en
   revisión. No se implementarán reglas médicas mientras se espera su feedback.
9. Nutrición ofrece un modo Simple y otro por Macros. La primera versión por
   macros usa mantenimiento estimado y no aplica déficits o superávits ocultos.

## Estado de repositorios

Desde la decisión del Operator del 2026-10-01, el repo público `AC-Setroc/aunara`
contiene fuente y workflow de Pages. El artifact de publicación contiene solo
`dist/client/` y apunta a `https://ac-setroc.github.io/aunara/`, pendiente de
despliegue y smoke. La raíz publicada antes desde `AC-Setroc/AC-Setroc.github.io`
es histórica; no se retira sin autorización separada. Ver [ADR 0003](../architecture/0003-pages-from-aunara-repository.md).

## Regla de actualización

Al completar una fase del plan, se debe actualizar primero su estado y evidencia
en el plan de trabajo. Una tarea solo pasa a `Completada` cuando cumple sus
criterios de aceptación y fue verificada en la experiencia correspondiente.
