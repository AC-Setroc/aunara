# Runbook — Aunara

## SDD-005 — preparación del dominio, corte pendiente

`[AUNARA/codex · GPT-5]` — Dominio canónico aprobado: `https://aunaratraining.com/`, mismo repo `AC-Setroc/aunara`, artifact exclusivo `dist/client/`, base `/`. Este apartado sustituye la URL/base de publicación de las secciones históricas siguientes **solo una vez verificado el corte**; no declara el dominio operativo. Snapshot inicial del Operator: ocho registros GoDaddy, una entrada administrada A `@ → WebsiteBuilder Site`, `www` al apex, seis registros no web que se preservan. GitHub muestra Verified/custom domain; Enforce HTTPS aún no disponible. Supabase Aunara dispone de configuración URL capturada por el Operator; no extrapolar el bloqueo histórico Repbook de abajo a este estado.

1. Guardar fuera del repo la zona íntegra antes/después y las URLs Auth vigentes. Si cambió algún registro respecto de la captura inicial, reevaluar antes de operar; el correo se gestiona separadamente.
2. Supabase → Authentication → URL Configuration: añadir exactamente `https://aunaratraining.com/` en Redirect URLs y conservar tanto `https://ac-setroc.github.io/aunara/` como el redirect histórico ya autorizado. Mantener Site URL anterior hasta estabilidad TLS y smoke sintético. Sin wildcard, cuentas ni emails reales.
3. Gate local cumplido: revisión independiente **APPROVED prepublicación** de root build, regresión `/aunara/`, guards negativos y UI Chromium/WebKit ES/EN 1440/390 (96/96). Esto no valida DNS/Auth/TLS reales. Conservar SHA previo `ef82f9af20d55e101bc78e71a410306cd5f4dec8` y publicación [37540550290](https://github.com/AC-Setroc/aunara/actions/runs/37540550290).
4. GoDaddy: editar solo el A administrado `@` a `185.199.108.153`; añadir tres A `@`: `185.199.109.153`, `185.199.110.153`, `185.199.111.153`. TTL 1 hora. Si GoDaddy impide reemplazar el destino WebsiteBuilder, parar y resolver la asociación web sin tocar otros registros.
5. Editar solo CNAME `www` a `ac-setroc.github.io`. Conservar NS, SOA, `_domainconnect`, DMARC y TXT de verificación idénticos; ningún AAAA/wildcard/registro de correo añadido o eliminado.
6. Coordinar el push autorizado de la versión raíz con el corte. Registrar SHA/run Actions y verificar artifact cliente. El custom domain ya está configurado; no retirarlo ni añadir archivo CNAME.
7. Verificar cuatro A y CNAME desde dos resolvers, certificado válido y redirecciones www/HTTP al apex HTTPS. Activar Enforce HTTPS solo cuando Pages lo permita. DNS/certificado pueden tardar: no declarar aceptación mientras falte evidencia.
8. Tras TLS/smoke estable, cambiar Site URL al apex HTTPS, conservando redirects previos. Documentar la captura posterior y comprobar callbacks sintéticos válidos/invalidos/expirados sin enviar correo.

Rollback quirúrgico: restaurar build/workflow de `ef82f9a` con base `/aunara/` y exactamente la entrada web WebsiteBuilder/`www` del inventario inicial; no modificar correo, NS ni TXT de verificación. Quitar custom domain solo cuando DNS ya no apunte a Pages; restaurar Site URL previo si cambió. Conservar ambos redirects durante estabilización. No borrar cachés ni datos de usuarios.

Referencias y aceptación completa: [SDD-005](sdd/SDD-005-dominio-aunaratraining.md). La recepción de correos y PWA física siguen pendientes por decisión del Operator.

## Abrir y verificar localmente

1. Trabajar en `~/AI Projects/Personal/aunara` y leer [estado](02-ESTADO-ACTUAL.md) y el [README técnico](../README.md).
2. Con dependencias locales disponibles, `npm run dev` muestra la dirección local de Vite. No copiar ni mostrar `.env.local`.
3. Ejecutar `npm run typecheck`, `npm test` (usa Vitest con dos workers), `npm run build` y `git diff --check`. Si falla alguno, registrar el resultado; no omitirlo ni declarar verificación completa.
4. Para un cambio de interfaz, verificar rutas y tamaños afectados en navegador real, incluido WebKit, y en dispositivos iPhone/Android cuando aplique. La matriz local `docs/product/2026-09-26-device-uat-matrix.md` conserva el alcance aún pendiente; no forma parte del commit público de esta entrega.

## Pages desde el mismo repo — gates

El repo público `AC-Setroc/aunara` contiene la fuente y el workflow; la URL objetivo de Pages es `https://ac-setroc.github.io/aunara/`. Consultar [ADR 0003](../docs/architecture/0003-pages-from-aunara-repository.md). Antes de publicar, confirmar que las variables cliente publicables `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` están configuradas en Actions, sin mostrar sus valores. El build de release usa `AUNARA_BASE_PATH=/aunara/`; `node scripts/check-pages-client.mjs` valida `dist/client/` y crea el fallback `404.html`. El workflow solo sube ese directorio; `dist/server/`, `dist/.openai/`, fuente, SOT y referencias locales quedan fuera del artifact.

No agregar `AUNARA_SOT/reference/` ni otros documentos con datos personales al commit público sin revisión específica. El sitio raíz anterior puede tener un worker con scope `/` que controle también `/aunara/`; verificarlo en navegador antes de UAT/corte. Confirmar redirecciones de Supabase para `/aunara/`, instalar/actualizar la PWA en dispositivos de prueba y hacer smoke real. No retirar la publicación anterior ni limpiar cachés de usuarios por este runbook. Un build local no publica por sí mismo; el push/deploy sigue siendo un gate separado del Operator.

**Bloqueo actual de cuenta:** Supabase Repbook está pausado; el límite de dos proyectos gratuitos activos impide reanudarlo sin decisión del Operator. Registro, login, sincronización y configuración de la allowlist de callback no se declaran verificados ni utilizables para UAT mientras siga pausado. No pausar otros proyectos ni cambiar de plan desde este runbook.

## Última publicación verificada — 2026-10-01

Fuente `fc885680ca354210e3a5d36c6c3ab605d51ccac5`, push autorizado a `main`; [Actions 36910796612](https://github.com/AC-Setroc/aunara/actions/runs/36910796612) con verify/deploy SUCCESS. [Pages](https://ac-setroc.github.io/aunara/) y dataset HTTP 200; smoke Chrome ES→EN→ES y login abierto/cerrado PASS, sin errores/advertencias de consola. Manifest publicado resuelve inicio y scope a `/aunara/`. La publicación no cierra autenticación/sync reales, callbacks Supabase, instalación física PWA ni convivencia con el worker legado.
