# ADR 0002 — Separación de fuente y publicación

Fecha: 25 de agosto de 2026
Estado: Supersedida el 2026-10-01 por [ADR 0003](./0003-pages-from-aunara-repository.md); se conserva como decisión histórica.

## Contexto

`AC-Setroc/AC-Setroc.github.io` fue creado para publicar la aplicación web, pero
no contenía el proyecto reproducible, las pruebas, las especificaciones ni el
historial de decisiones. Mezclar archivos fuente con la salida compilada haría
más difícil revisar cambios y aumentaría el riesgo de publicar información que
no corresponde al sitio.

## Decisión

- `AC-Setroc/aunara-app` es el repositorio privado canónico para código fuente,
  pruebas, documentación, metodología y prototipos.
- `AC-Setroc/AC-Setroc.github.io` continúa como repositorio público exclusivo de
  publicación.
- Los archivos locales con secretos, dependencias, compilaciones y resultados de
  trabajo permanecen ignorados por Git.
- Todo cambio de producto debe verificarse en el repositorio fuente antes de
  producir una compilación para Pages.
- Los prototipos y borradores metodológicos no se publican como funcionalidad de
  la app hasta su aprobación explícita.

## Flujo previsto

1. Trabajar en una rama `codex/*` del repositorio fuente.
2. Ejecutar tipos, pruebas, generadores y compilación.
3. Revisar el cambio mediante pull request cuando el bootstrap haya terminado.
4. Generar la salida de producción desde una revisión aprobada.
5. Publicar únicamente esa salida en el repositorio de Pages.
6. Verificar el sitio público y conservar referencia al commit fuente.

## Consecuencias

- La fuente y la documentación dejan de depender de una sola copia local.
- Pages permanece pequeño y no expone el repositorio privado.
- El despliegue debe registrar qué commit fuente produjo cada publicación.
- Hace falta completar la automatización fuente → Pages y documentar su reversa
  antes del siguiente lanzamiento productivo.
