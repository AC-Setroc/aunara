# Especificación — planes nutricionales Simple y por Macros

Fecha: 27 de agosto de 2026
Estado: **Implementado; pendiente de UAT y revisión nutricional**

## Problema

La experiencia existente mezcla referencias de proteína, porciones, ingredientes
y recetas en un solo flujo. Esto sirve a quien quiere orientación práctica, pero
no a quien desea registrar proteína, carbohidratos y grasa con mayor precisión.
Al mismo tiempo, una cifra aparentemente exacta puede confundirse con una
prescripción clínica o con una promesa de resultados.

## Objetivos

1. Permitir que cada adulto elija el nivel de detalle sin perder sus alimentos y
   preferencias actuales.
2. Mantener una ruta simple basada en porciones y grupos alimentarios.
3. Ofrecer una ruta por macros cuyos números sean matemáticamente coherentes y
   cuya base sea visible.
4. Conservar la elección en la cuenta privada y en todos los dispositivos.
5. Explicar qué hace y qué no hace el cálculo.

## Fuera de alcance en esta versión

- No se crean dietas terapéuticas ni se interpretan diagnósticos, embarazo,
  trastornos de la conducta alimentaria o medicamentos.
- No se aplica automáticamente un déficit o superávit por el nombre de una meta.
- No se ajustan los macros por día de entrenamiento, competencia o descanso.
- No se afirma que una porción de intercambio coincide con los macros del
  alimento sin datos nutricionales verificados.
- No se reemplaza la valoración de un profesional de nutrición.

## Experiencia

### Plan nutricional simple

Copy principal: **No quiero complicarme midiendo todo.**

Conserva la experiencia actual:

- rango diario de proteína;
- referencias por comida;
- porciones prácticas de vegetales y carbohidratos;
- selector de alimentos por grupo;
- ideas de comidas con los ingredientes elegidos;
- consulta opcional de nutrientes en USDA FoodData Central.

### Plan nutricional basado en macros

Copy principal: **Quiero mayor precisión para mis objetivos.**

Muestra:

- base energética diaria;
- proteína, carbohidratos y grasa en gramos;
- porcentaje energético aproximado de cada macro;
- rango de proteína usado como referencia;
- reparto uniforme opcional entre 3, 4 o 5 momentos de comida;
- los mismos alimentos e ideas del plan simple.

“Mayor precisión” describe el método de registro, no garantiza mejores
resultados.

## Regla de cálculo v0.1

La función requiere fecha de nacimiento o edad, estatura, peso actual y
referencia metabólica. Si falta uno de esos datos, no inventa una meta.

1. Usa el estimado existente de mantenimiento y toma su punto medio, redondeado
   a 50 kcal.
2. Usa el punto medio del rango de proteína existente. Para adultos físicamente
   activos, ese rango es 1,4–2,0 g/kg/día.
3. Asigna 30 % de la base energética a grasa.
4. Asigna a carbohidratos la energía restante después de proteína y grasa.
5. Convierte proteína y carbohidratos a 4 kcal/g y grasa a 9 kcal/g.
6. Divide los gramos por el número de momentos de comida elegido únicamente como
   referencia; el reparto real puede variar durante el día.

Este cálculo produce un conjunto coherente, pero sigue siendo una estimación de
mantenimiento. Una futura regla para pérdida de grasa, ganancia muscular o
rendimiento necesita revisión nutricional, datos de respuesta y consentimiento
explícito; no se derivará silenciosamente de `primaryGoal`.

## Seguridad y transparencia

- La interfaz identifica la energía como **base estimada de mantenimiento**.
- Explica que no se agregó déficit ni superávit.
- No bloquea al usuario en un único patrón de comidas.
- Al revocar datos de salud se elimina la configuración personalizada y se vuelve
  al modo simple.
- Los datos se sincronizan dentro del perfil protegido existente.

## Criterios de aceptación

- [x] Se puede elegir Simple o Macros sin perder ingredientes.
- [x] La elección y la cantidad de comidas forman parte del perfil sincronizable.
- [x] Perfiles antiguos sin los campos nuevos siguen siendo válidos.
- [x] El modo Macros no muestra números si faltan datos esenciales.
- [x] Los tres macros corresponden a una misma base energética.
- [x] Cambiar 3/4/5 comidas cambia únicamente el reparto, no la meta diaria.
- [x] La interfaz funciona en español e inglés y es responsive.
- [x] Revocar consentimiento reinicia el modo nutricional.
- [ ] Profesional de nutrición revisa lenguaje, alcance y regla matemática.
- [ ] UAT confirma comprensión de “gramos de nutriente” y “mantenimiento”.

## Fuentes marco

- [Dietary Guidelines for Americans 2025–2030](https://odphp.health.gov/our-work/nutrition-physical-activity/dietary-guidelines/current-dietary-guidelines)
- [National Academies — rangos aceptables de distribución de macronutrientes](https://www.nationalacademies.org/read/10872/chapter/7)
- [ISSN — Position Stand: Protein and Exercise](https://pubmed.ncbi.nlm.nih.gov/28642676/)
- [Academy of Nutrition and Dietetics, Dietitians of Canada y ACSM — Nutrition and Athletic Performance](https://pubmed.ncbi.nlm.nih.gov/26891166/)

Las fuentes establecen marcos poblacionales y deportivos; no validan por sí
solas una prescripción individual de Aunara.
