# Runbook — Aunara

## UAT dev vigente — 2026-10-16

Usar [lista UAT28 casos con expectativas](handoffs/UAT-2026-10-16-dev-checklist.md) y [handoff/receta histórica aislada](handoffs/HANDOFF-2026-10-16.md). Objetivo actual código devc48664b (SDD-013…016); servidor humano5173 todavía anterior, requiere orden de actualización y verificación de versión/direcciones antes de comenzar. Última LAN192.168.1.6:5173, no reinspeccionada en la actualización de lista. No ejecutar la receta genérica de abajo en el canónico dirty. SMTP/plantillas remotas no activados; retorno LAN→prod abierto. FALLA vuelve a Spec, sin hotpatch/publicación. Punto28 es probe sintético técnico ya acreditado, nunca corromper filas reales para probarlo.

## SDD-005 — dominio publicado; seguimiento Auth/PWA

`[AUNARA/codex · GPT-5]` — Dominio canónico operativo: `https://aunaratraining.com/`, mismo repo `AC-Setroc/aunara`, artifact exclusivo `dist/client/`, base `/`. Publicación `1c709a3`, Actions 37636074747 SUCCESS. Los cuatro A Pages, `www` a GitHub, TXT de propiedad, certificado y Enforce HTTPS quedaron verificados; registros no web se preservan. Las secciones históricas bajo `/aunara/` quedan como antecedente/rollback, no URL canónica actual.

1. Guardar fuera del repo la zona íntegra antes/después y las URLs Auth vigentes. Si cambió algún registro respecto de la captura inicial, reevaluar antes de operar; el correo se gestiona separadamente.
2. Supabase → Authentication → URL Configuration: el Operator confirmó verbalmente que añadió `https://aunaratraining.com/`; falta capturar/reinspeccionar que conserve `https://ac-setroc.github.io/aunara/` y el redirect histórico, y cambiar Site URL al apex si aún apunta a Pages. Sin wildcard, cuentas ni emails reales.
3. Gate local cumplido: revisión independiente **APPROVED prepublicación** de root build, regresión `/aunara/`, guards negativos y UI Chromium/WebKit ES/EN 1440/390 (96/96). Esto no valida DNS/Auth/TLS reales. Conservar SHA previo `ef82f9af20d55e101bc78e71a410306cd5f4dec8` y publicación [37540550290](https://github.com/AC-Setroc/aunara/actions/runs/37540550290).
4. GoDaddy: editar solo el A administrado `@` a `185.199.108.153`; añadir tres A `@`: `185.199.109.153`, `185.199.110.153`, `185.199.111.153`. TTL 1 hora. Si GoDaddy impide reemplazar el destino WebsiteBuilder, parar y resolver la asociación web sin tocar otros registros.
5. Editar solo CNAME `www` a `ac-setroc.github.io`. Conservar NS, SOA, `_domainconnect`, DMARC y TXT de verificación idénticos; ningún AAAA/wildcard/registro de correo añadido o eliminado.
6. Coordinar el push autorizado de la versión raíz con el corte. Registrar SHA/run Actions y verificar artifact cliente. El custom domain ya está configurado; no retirarlo ni añadir archivo CNAME.
7. Cerrado 2026-10-07: Cloudflare/Google resolvieron cuatro A Pages y TXT preservado; GitHub muestra DNS check successful y Enforce HTTPS activo. HTTP apex, HTTPS `www` y Pages `/aunara/` redirigen 301 al apex HTTPS sin loop; certificado válido.
8. Smoke publicado cerrado: revisión independiente 8/8 Chromium/WebKit ES/EN 1440/390 y recursos raíz HTTP 200. Pendiente separado: reinspeccionar URL Configuration/Site URL Auth; correo, PWA física y offline WebKit real siguen como UAT separados.

Rollback quirúrgico: restaurar build/workflow de `ef82f9a` con base `/aunara/` y exactamente la entrada web WebsiteBuilder/`www` del inventario inicial; no modificar correo, NS ni TXT de verificación. Quitar custom domain solo cuando DNS ya no apunte a Pages; restaurar Site URL previo si cambió. Conservar ambos redirects durante estabilización. No borrar cachés ni datos de usuarios.

Referencias y aceptación completa: [SDD-005](sdd/SDD-005-dominio-aunaratraining.md). La recepción de correos y PWA física siguen pendientes por decisión del Operator.

## Abrir y verificar localmente

1. Trabajar en `~/AI Projects/Personal/aunara` y leer [estado](02-ESTADO-ACTUAL.md) y el [README técnico](../README.md).
2. Con dependencias locales disponibles, `npm run dev` muestra la dirección local de Vite. No copiar ni mostrar `.env.local`.
3. Ejecutar `npm run typecheck`, `npm test` (usa Vitest con dos workers), `npm run build` y `git diff --check`. Si falla alguno, registrar el resultado; no omitirlo ni declarar verificación completa.
4. Para un cambio de interfaz, verificar rutas y tamaños afectados en navegador real, incluido WebKit, y en dispositivos iPhone/Android cuando aplique. La matriz local `docs/product/2026-09-26-device-uat-matrix.md` conserva el alcance aún pendiente; no forma parte del commit público de esta entrega.

## Pages desde el mismo repo — gates

El repo público `AC-Setroc/aunara` contiene la fuente y el workflow. La URL canónica es `https://aunaratraining.com/` desde el 2026-10-07 ([SDD-005](sdd/SDD-005-dominio-aunaratraining.md)); `https://ac-setroc.github.io/aunara/` redirige 301 al apex y se conserva como rollback. Consultar [ADR 0003](../docs/architecture/0003-pages-from-aunara-repository.md). Antes de publicar, confirmar que las variables cliente publicables `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` están configuradas en Actions, sin mostrar sus valores. El build de release usa `AUNARA_BASE_PATH=/` desde `1c709a3`; el build de rollback usa `AUNARA_BASE_PATH=/aunara/`. `node scripts/check-pages-client.mjs` valida `dist/client/` y crea el fallback `404.html`. El workflow solo sube ese directorio; `dist/server/`, `dist/.openai/`, fuente, SOT y referencias locales quedan fuera del artifact.

No agregar `AUNARA_SOT/reference/` ni otros documentos con datos personales al commit público sin revisión específica. El sitio raíz anterior puede tener un worker con scope `/` que controle también `/aunara/`; verificarlo en navegador antes de UAT/corte. Confirmar redirecciones de Supabase para `/aunara/`, instalar/actualizar la PWA en dispositivos de prueba y hacer smoke real. No retirar la publicación anterior ni limpiar cachés de usuarios por este runbook. Un build local no publica por sí mismo; el push/deploy sigue siendo un gate separado del Operator.

**Estado actual de cuenta (2026-10-01):** por autorización del Operator, `mindally-test` está pausado y el proyecto existente ahora se llama Aunara, con estado `ACTIVE_HEALTHY` y consulta `select 1` correcta. Site URL y redirect exacto de Pages `https://ac-setroc.github.io/aunara/` quedaron guardados y verificados tras recargar; el redirect anterior se conservó por compatibilidad. Confirmación, recuperación, login y sync reales requieren UAT con correos nuevos; no se enviaron correos de prueba desde esta configuración. No pausar otros proyectos ni cambiar de plan desde este runbook.

## Ramas — 2026-10-12

`[AUNARA/claude · modelo no expuesto]` — Inventario de ramas remotas y su autoridad:

| Rama | Uso | CI |
|---|---|---|
| `main` | Única rama que publica a Pages. Push solo por orden explícita del Operator. | verify + deploy |
| `dev` | Integración documental y, cuando el Operator lo decida, de código aprobado. Base: `main` + SOT/SDD/docs del snapshot. | ninguna |
| `wip/dirty-2026-10-12` | Snapshot sin revisar del working tree de la Mac (`e4baf5f3eb4b7cd7178e6efa9e7eee6039ab8884`). Evidencia y respaldo; no es base de trabajo ni entrega. | ninguna |
| `wip/sdd006-e2-candidate-2026-10-12` (`19dcb4f`), `wip/sdd006-e3-candidate-2026-10-12` (`85e4415`), `wip/sdd006-e4-candidate-2026-10-12` (`6704681`) | Candidatos E2/E3/E4 de SDD-006 sobre `1c709a3`. E4 = revisión ciclo 2 APPROVED técnico (Chromium + WebKit). Evidencia y respaldo; la integración a `dev` es un commit aparte por orden. | ninguna |
| `wip/sdd011-h01-candidate-2026-10-12` (`96b71c8`), `wip/sdd011-h02-candidate-2026-10-12` (`0fd2743`) | Candidatos H-01/H-02 de SDD-011 sobre `6704681`. APPROVED e integrados en `dev` (`8db846e`, `13a1264`). Evidencia y respaldo. | ninguna |
| `wip/sdd012-candidate-2026-10-13` (`1e7fa15`) | Candidato de SDD-012 sobre `bfb97a1` (menú por portal, cabecera, Salir en perfil, UAT13-22/06). APPROVED técnico e integrado en `dev` (`d381e52`). Evidencia y respaldo. | ninguna |
| `archive/github-pages/main` | Build compilado histórico (ago-2026) con base `/`, historia independiente. No tocar. | ninguna |

## Snapshots del trabajo local — 2026-10-12

`[AUNARA/claude · modelo no expuesto]` — Dos scripts para la Mac del Operator. Ambos arman el commit con un índice temporal (`GIT_INDEX_FILE`), excluyen `AUNARA_SOT/reference/` y entornos, muestran el delta y piden `SI` antes de pushear; no modifican rama ni índice de ningún repo. El remoto es público: revisar el preview antes de confirmar.

**`~/push-dirty.sh`** (ya ejecutado el 2026-10-12 → `wip/dirty-2026-10-12`): snapshot del working tree canónico `~/AI Projects/Personal/aunara`. Para refrescarlo, cambiar `BRANCH` a una fecha nueva. Una copia quedó en la raíz del snapshot por accidente; no versionarla en `dev` ni `main`.

**`~/push-candidates.sh`** (paso 1 de la [orden vigente](ordenes/ORDEN-2026-10-12-retomar-sdd006.md)): copia los recibos de `/private/tmp/aunara-*` a `~/Documents/aunara-evidencias-<fecha>/` (local, no se publica) y pushea cada candidato `/private/tmp/aunara-sdd006-*candidate*/repo` como `wip/sdd006-<e2|e3|e4>-candidate-<fecha>`. Crear el archivo con `cat > ~/push-candidates.sh <<'FIN'` … `FIN` y correrlo con `bash ~/push-candidates.sh`.

```bash
#!/usr/bin/env bash
# Respalda los candidatos de SDD-006 que viven en /private/tmp de la Mac:
# 1) copia recibos/evidencias a ~/Documents (local, no se publica);
# 2) pushea el working tree de cada candidato como rama wip/ con índice temporal,
#    sin tocar los repos candidatos ni el canónico. Repo público: revisar el preview.
set -euo pipefail
REMOTE="https://github.com/AC-Setroc/aunara.git"
DATE="$(date +%Y-%m-%d)"
EVID="$HOME/Documents/aunara-evidencias-$DATE"

echo "== 1. Copia local de recibos y evidencias (sin repos, .git ni node_modules) =="
mkdir -p "$EVID"
rsync -a --exclude 'repo' --exclude 'node_modules' --exclude '.git' /private/tmp/aunara-* "$EVID/" 2>/dev/null || true
echo "   copiado a $EVID: $(find "$EVID" -type f | wc -l | tr -d ' ') archivos"

echo "== 2. Candidatos en /private/tmp/aunara-sdd006-*candidate*/repo =="
found=0
for repo in /private/tmp/aunara-sdd006-*candidate*/repo; do
  [ -d "$repo/.git" ] || continue
  found=1
  name="$(basename "$(dirname "$repo")")"
  tag="$(echo "$name" | sed -E 's/^aunara-sdd006-([a-z0-9]+)-candidate.*/\1/')"
  BRANCH="wip/sdd006-$tag-candidate-$DATE"
  echo; echo "-- $name  →  origin/$BRANCH"
  (
    cd "$repo"
    echo "   HEAD: $(git log -1 --format='%h %s' | cut -c1-90)"
    export GIT_INDEX_FILE; GIT_INDEX_FILE="$(mktemp)"
    git read-tree HEAD
    git add -A -- . ':(exclude)AUNARA_SOT/reference' ':(exclude)**/.env' ':(exclude)**/.env.*' ':(exclude,glob)**/*.local'
    echo "   delta del working tree sobre HEAD:"; git diff --cached --stat HEAD | tail -n 3 | sed 's/^/     /'
    echo "   binarios (debería ser solo el wordmark o nada):"; git diff --cached --numstat HEAD | awk '$1=="-" && $2=="-" {print "     " $3}'
    TREE="$(git write-tree)"
    COMMIT="$(git commit-tree "$TREE" -p HEAD -m "wip: snapshot candidato $tag de SDD-006 ($DATE)

Working tree de $repo sobre $(git rev-parse --short HEAD). Sin revisar; evidencia y respaldo.

[AUNARA/operator · snapshot manual]")"
    rm -f "$GIT_INDEX_FILE"; unset GIT_INDEX_FILE
    read -r -p "   ¿Pushear $tag a origin/$BRANCH? (escribí SI) " ok </dev/tty
    [ "$ok" = "SI" ] || { echo "   omitido"; exit 0; }
    git push "$REMOTE" "$COMMIT:refs/heads/$BRANCH"
    echo "   OK $COMMIT"
  ) || echo "   ERROR en $name; sigo con el siguiente"
done
[ "$found" = 1 ] || echo "   (no se encontró ningún candidato: avisar al agente con la ruta real)"
echo; echo "Listo. Ramas remotas wip/:"; git -C "$HOME/AI Projects/Personal/aunara" ls-remote --heads "$REMOTE" 'wip/*'
```

## Última publicación verificada — 2026-10-01

Fuente `fc885680ca354210e3a5d36c6c3ab605d51ccac5`, push autorizado a `main`; [Actions 36910796612](https://github.com/AC-Setroc/aunara/actions/runs/36910796612) con verify/deploy SUCCESS. [Pages](https://ac-setroc.github.io/aunara/) y dataset HTTP 200; smoke Chrome ES→EN→ES y login abierto/cerrado PASS, sin errores/advertencias de consola. Manifest publicado resuelve inicio y scope a `/aunara/`. La publicación no cierra autenticación/sync reales, callbacks Supabase, instalación física PWA ni convivencia con el worker legado.
