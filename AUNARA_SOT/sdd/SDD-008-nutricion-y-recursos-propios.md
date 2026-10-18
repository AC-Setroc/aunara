# SDD-008 — Nutrición y recursos propios

2026-10-10 · Estado: **Borrador** · v1
Origen: [Aunara/Codex · modelo no expuesto en este agente]
Entrega 3; tras 007, con dos subgates independientes: nutrición y medios.

## 1. El problema, en el idioma del Operator

La persona necesita distinguir su plan alimentario de lo realmente registrado, comprender estimaciones y conservar sus preferencias. La biblioteca debe explicar movimientos en ambos idiomas y avanzar hacia animaciones propias/licenciadas sin confundir atribución con permiso ni imágenes con validación clínica.

## 2. Alcance y fuera de alcance

Propuesto: revisar creación Simple/Macros, registro de ingesta y seguimiento propio con fuentes/unidades/cobertura; prototipo y contrato antes de implementar. Recursos: inventario de derechos, piloto de animación por ID estable y reemplazo gradual aprobado. No autoriza fabricar masivamente modelos/animaciones.

Allowlist **tentativa**, a fijar por subgate después del rebaseline:

- Nutrición existentes: `src/App.tsx`, `src/styles.css`, `src/types.ts`, `src/components/ProfilePanel.tsx`, `src/components/ProfilePanel.test.tsx`, `src/lib/nutritionPlanning.ts`, `src/lib/nutritionPlanning.test.ts`, `src/lib/foodData.ts`, `src/lib/foodData.test.ts`, `src/lib/cloudSnapshot.ts`, `src/lib/cloudSnapshot.test.ts`.
- Nutrición nuevos propuestos: `src/lib/nutritionLogs.ts`, `src/lib/nutritionLogs.test.ts`, `src/components/NutritionPanel.tsx`, `src/components/NutritionPanel.test.tsx`.
- Medios: `src/components/ExerciseDetail.tsx`, `src/components/ExerciseCard.tsx`, `src/lib/exercises.ts`, `src/lib/exercises.test.ts`, `public/data/exercise-directory/owned-media.json`, `public/data/exercise-directory/en-es.json`, `public/data/exercise-directory/name-overrides.es.json`, `public/data/exercise-directory/taxonomy.es.json`. Rutas exactas de archivos propios nuevos se incorporan solo tras aprobar piloto y formato; hoy ninguna carpeta completa queda habilitada.
- Documentación: este SDD, `AUNARA_SOT/02-ESTADO-ACTUAL.md`, `AUNARA_SOT/PENDIENTES.md`, `AUNARA_SOT/03-HISTORIA-Y-BACKLOG.md`, `docs/product/2026-08-27-dual-nutrition-plans.md`, `docs/compliance/media-rights.md`, `docs/architecture/0001-bilingual-exercise-directory.md`, `docs/product/2026-08-25-feedback-work-plan.md`.

**NO-TOCAR:** fuente dataset/IDs legacy, medios de terceros por copia o edición; marca, referencias inmutables, matrices clínicas congeladas; Auth/correo/DNS/producción, `.env*`, `supabase/`, hooks/transportes, workflows/dependencias. No dieta terapéutica, diagnóstico, déficit/superávit automático por objetivo, castigar descanso con menos comida, datos Health, OCR clínico ni compras/licencias externas sin autorización. Ningún modelo corporal, alcance/resolución de animación o producción en lote se asume aprobado.

## 3. Estado real de partida, medido y no supuesto

HEAD `1c709a3`, código local sucio no equivale a UAT/publicación.

- `docs/product/2026-08-27-dual-nutrition-plans.md:4`: Simple/Macros implementado con UAT/revisión pendientes; no cerrado.
- `src/types.ts:217`, `:246`, `src/App.tsx:79–80`: modo y reparto existentes; `src/lib/cloudSnapshot.ts:47–48` enums validados. No se propone rehacerlos.
- Búsqueda `rg --files src` y contrato `src/lib/cloudSnapshot.ts:10–20`: no módulo `nutritionLogs` ni entidad de ingesta diaria en ese contrato; ausencia acotada al inventario/contrato, no auditoría global de backend.
- `docs/architecture/0001-bilingual-exercise-directory.md:9–29`: índice, traducciones revisadas y registro owned-media por ID; `:36` nombres pendientes.
- `docs/compliance/media-rights.md`, «Decisión para esta etapa»: uso personal/UAT y licencia propia o reemplazo antes de distribución. Es estado documental, no nueva certificación legal.

## 4. Diseño

Nutrición: plan versionado separado de consumo fechado. Cada registro tiene alimento/fuente, unidad/cantidad y estado de calidad; porción sin equivalencia verificada no se presenta como macros exactos. Editar plan no altera registro histórico; duplicado detectado no suma dos veces. Día parcial muestra cobertura parcial. Simple/Macros conserva alimentos/preferencias al alternar; datos insuficientes no producen meta inventada.

Matemática y lenguaje se revisan con profesional: matriz de población elegible, exclusiones, supuestos, unidades, evidencia y aprobación/versionado. No cambiar cálculos existentes «para completar flujo» ni adoptar nuevas fórmulas sin gate. Revocación elimina exactamente información sensible autorizada según contrato; no reaparece desde sync/export. Persistencia nueva y estrategia legacy requieren revisión de contrato, no ampliar servidor tácitamente.

Medios: inventario por archivo/ID con autor, titular, origen, prueba escrita, canales/territorio/plazo/resolución, atribución y restricciones; sin evidencia estado «pendiente/no distribuible». No quitar avisos de un recurso por añadir crédito Aunara.

Piloto: elegir pocos ejercicios explícitos, storyboard/prototipo de técnica, representación corporal/ropa/ángulos, accesibilidad, formato, tamaño/performance y criterio clínico con Danny. Operator aprueba piloto + derechos antes de producir. Registrar versión, ID canónico, póster y estados draft/review/ready; solo ready aprobado se renderiza como propio. Fuente legacy queda referenciada durante transición, su uso sujeto a derechos; fallo de carga usa póster/texto permitido, no descarga opaca de material no autorizado.

ES/EN completos: nombre, músculos, equipo e instrucciones revisados con estado separado del medio. ID no cambia por traducción/animación. Prototipo visual no prueba biomecánica, animación no sustituye instrucción ni aval profesional. Cubrir una muestra no equivale a catálogo completo.

## 5. Alternativas descartadas

Rehacer Simple/Macros; registrar estimación como hecho; dieta clínica desde objetivo; licencia por atribución; copiar GIFs para recolorear; crear modelos masivos antes de aprobar piloto; renombrar IDs; llamar «propio» a material sin cadena de derechos.

## 6. Riesgo sobre lo que hoy funciona

Salud/persistencia y exactitud nutricional: contrato aditivo, fixtures faltantes/parciales y revisión profesional. Derechos: inventario y gate previo, sin dictamen legal aquí. Traducción/técnica: revisión editorial y clínica independiente. Rendimiento/percepción: piloto móvil y modo movimiento reducido antes de lote. Dirty: recibo tras 007, no absorber historias previas.

## 7. Verificación

| ID | Criterio falsable futuro |
| --- | --- |
| CA08-01 | Crear/alternar Simple/Macros preserva preferencias, unidad/fuente visible; faltan datos ⇒ sin meta ficticia. |
| CA08-02 | Plan distinto de ingesta; editar/recargar conserva registros y versión origen; doble envío no duplica; parcial no se presenta como completo. |
| CA08-03 | Porciones sin equivalencia no producen macro exacto; sumas/unidades corresponden a fixture verificado y regla aprobada. |
| CA08-04 | Revocación/usuarios separados impiden reaparición/fuga; export/round-trip legacy conserva campos no afectados. |
| CA08-05 | Cada medio renderizado como propio/licenciado tiene inventario y aprobaciones verificables; pending no se distribuye como ready. |
| CA08-06 | Piloto aprobado funciona con ID/póster/versionado, fallo de carga y movimiento reducido; no copia fuente visual ni altera IDs históricos. |
| CA08-07 | Nombre/músculos/equipo/instrucciones ES/EN aprobados, estados de traducción/medio independientes; no se declara catálogo completo por piloto. |
| CA08-08 | No cambio clínico/infrastructura fuera de gate ni regresión de biblioteca, 006/007 o nutrición vigente. |

Matriz: typecheck, suite completa, directorio y builds raíz/rollback con guard artifact; lint N/A si sigue ausente. Chromium/WebKit desktop1440/mobile390 ES/EN: nutrición, detalle, búsqueda/editor y sesiones vecinas. Negativos: alimento sin fuente/unidad, dato clínico faltante, duplicado, snapshot inválido, medio pending/ID roto, fuga entre cuentas y revocación; guarda rojo/verde. Performance presupuestada en piloto, teclado y movimiento reducido. UAT manual Operator y revisión profesional con datos ficticios; cuentas/cloud/licencias/compras reales solo autorización separada. WebKit faltante bloquea cierre UI.

## 8. Plan de entrega

Rebaseline tras 007; aprobar prototipo/contrato nutricional y matriz clínica. Subgate medios: inventario→piloto→revisión técnica/derechos→allowlist exacta→aprobación; lote futuro requiere nueva decisión. Dos frentes no comparten archivos sin integrador único. Máximo3 ciclos desarrollo/revisor independiente; documentación y commit local por subentrega aprobada; cierre Operator/push separados.

## 9. Decisiones que necesita el Operator

Elegir nivel de registro, fuentes de alimentos, política de correcciones/unidades y revisión nutricional. Elegir ejercicios/modelo/estilo/formatos del piloto y responsable técnico/rights reviewer; aprobar presupuesto/permiso de licencias si aplica. Danny y profesional nutricional no se consideran aprobadores por silencio. Ningún gate queda satisfecho por crear este SDD.

## 10. Definición de terminado

Borrador para diseño. Termina cada subgate con aprobación explícita, CA/matriz/evidencia profesional/derechos pertinentes verdes, revisor independiente APPROVED, docs/commit local y UAT/cierre Operator. Recursos pendientes siguen identificados; no se afirma reemplazo total, dieta clínica ni publicación automática.
