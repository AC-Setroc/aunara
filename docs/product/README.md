# Producto Aunara — índice de decisiones y avance

Estado del índice: 25 de agosto de 2026.

Este directorio concentra las decisiones de producto que deben aprobarse antes
de convertirse en cambios de la aplicación. Su propósito es mantener separados:

- el problema y la experiencia que se quieren resolver;
- los límites metodológicos y de seguridad;
- el plan de ejecución y sus dependencias;
- la implementación técnica, que comienza solo después de la aprobación.

## Documentos activos

- [Propuesta de home y seguridad metodológica](./2026-08-25-home-and-methodological-safety-proposal.md)
- [Plan de trabajo derivado del feedback](./2026-08-25-feedback-work-plan.md)

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

## Estado de repositorios

- La aplicación pública se despliega desde `AC-Setroc/AC-Setroc.github.io`.
- Ese repositorio contiene la compilación publicada, no el proyecto fuente ni
  la documentación completa.
- `AC-Setroc/aunara-app` es el repositorio fuente privado aprobado.
- El proyecto local está conectado a ese remoto; la verificación continua y el
  flujo reproducible hacia Pages se completan durante el bootstrap.
- GitHub Pages se mantiene como repositorio de despliegue y no como fuente.

## Regla de actualización

Al completar una fase del plan, se debe actualizar primero su estado y evidencia
en el plan de trabajo. Una tarea solo pasa a `Completada` cuando cumple sus
criterios de aceptación y fue verificada en la experiencia correspondiente.
