# ADR 0001 — Directorio bilingüe de ejercicios

## Contexto

El dataset fuente tiene 1.324 ejercicios con instrucciones en inglés y español, pero conserva nombres y taxonomías canónicas en inglés. Las rutinas existentes guardan el ID del dataset, por lo que reemplazar esos identificadores rompería datos ya creados. Aunara también necesitará asociar cada movimiento con animaciones propias sin perder temporalmente la referencia al material legado.

## Decisión

Mantener el ID del dataset como identidad estable y generar un índice bilingüe versionado en `public/data/exercise-directory/en-es.json`.

Cada entrada incluye:

- nombre EN/ES y estado de revisión de la traducción;
- taxonomías EN/ES completas;
- alias de búsqueda separados por idioma;
- referencia al contenido instructivo del dataset;
- referencia explícita al material visual legado;
- estado independiente del material propio de Aunara.

Una traducción pendiente usa el nombre inglés como respaldo visible y queda marcada como `pending`. No debe considerarse una traducción terminada. Las traducciones revisadas viven en `name-overrides.es.json`. El generador falla si aparece una taxonomía sin equivalencia española, evitando mezclas silenciosas.

## Flujo de mantenimiento

1. Editar traducciones revisadas en `public/data/exercise-directory/name-overrides.es.json`.
2. Editar nuevas taxonomías en `public/data/exercise-directory/taxonomy.es.json`.
3. Ejecutar `npm run build:exercise-directory`.
4. Ejecutar `npm run test:exercise-directory` y `npm run build`.
5. Cuando una animación propia esté aprobada, registrarla por ID en `public/data/exercise-directory/owned-media.json` con estado `ready`, animación, póster y versión.
6. Regenerar el directorio; conservar `legacyMedia` durante la migración y revisión de derechos.

## Consecuencias

- Las rutinas existentes conservan compatibilidad por ID.
- La interfaz puede buscar en ambos idiomas sin traducir claves internas.
- El avance de traducción y de animación puede medirse por separado.
- Completar los 1.290 nombres pendientes sigue siendo una etapa editorial; el sistema no los presenta como traducciones revisadas.
