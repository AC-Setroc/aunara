# Runbook — Aunara

## Abrir y verificar localmente

1. Trabajar en `~/AI Projects/Personal/aunara` y leer [estado](02-ESTADO-ACTUAL.md) y el [README técnico](../README.md).
2. Con dependencias locales disponibles, `npm run dev` muestra la dirección local de Vite. No copiar ni mostrar `.env.local`.
3. Ejecutar `npm run typecheck`, `npm test` (usa Vitest con dos workers), `npm run build` y `git diff --check`. Si falla alguno, registrar el resultado; no omitirlo ni declarar verificación completa.
4. Para un cambio de interfaz, verificar rutas y tamaños afectados en navegador real, incluido WebKit, y en dispositivos iPhone/Android cuando aplique. La matriz local `docs/product/2026-09-26-device-uat-matrix.md` conserva el alcance aún pendiente; no forma parte del commit público de esta entrega.

## Pages desde el mismo repo — gates

El repo público `AC-Setroc/aunara` contiene la fuente y el workflow; la URL objetivo de Pages es `https://ac-setroc.github.io/aunara/`. Consultar [ADR 0003](../docs/architecture/0003-pages-from-aunara-repository.md). Antes de publicar, confirmar que las variables cliente publicables `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` están configuradas en Actions, sin mostrar sus valores. El build de release usa `AUNARA_BASE_PATH=/aunara/`; `node scripts/check-pages-client.mjs` valida `dist/client/` y crea el fallback `404.html`. El workflow solo sube ese directorio; `dist/server/`, `dist/.openai/`, fuente, SOT y referencias locales quedan fuera del artifact.

No agregar `AUNARA_SOT/reference/` ni otros documentos con datos personales al commit público sin revisión específica. El sitio raíz anterior puede tener un worker con scope `/` que controle también `/aunara/`; verificarlo en navegador antes de UAT/corte. Confirmar redirecciones de Supabase para `/aunara/`, instalar/actualizar la PWA en dispositivos de prueba y hacer smoke real. No retirar la publicación anterior ni limpiar cachés de usuarios por este runbook. Un build local no publica por sí mismo; el push/deploy sigue siendo un gate separado del Operator.

**Bloqueo actual de cuenta:** Supabase Repbook está pausado; el límite de dos proyectos gratuitos activos impide reanudarlo sin decisión del Operator. Registro, login, sincronización y configuración de la allowlist de callback no se declaran verificados ni utilizables para UAT mientras siga pausado. No pausar otros proyectos ni cambiar de plan desde este runbook.
