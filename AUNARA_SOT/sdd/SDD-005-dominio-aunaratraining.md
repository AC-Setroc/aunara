# SDD-005 — Dominio canónico `aunaratraining.com`

Estado: **En revisión del Operator; no aprobado para implementar ni operar**. Fecha: 2026-10-06.
Origen: `[AUNARA/codex · GPT-5]`.

La instrucción del Operator —«Publicá y conectá. La validación de recepción de correos la hacemos más adelante. Estoy resolviendo eso.»— fija el resultado de producto, pero no aprueba automáticamente este diseño técnico ni autoriza cambios de DNS, Pages, Auth o código antes del gate SDD. El commit E2 `86f5451613964e7e455118db160a0f7e543e5221` ya fue publicado en `main`; [Actions 37539918673](https://github.com/AC-Setroc/aunara/actions/runs/37539918673) terminó SUCCESS. El smoke publicado final sigue siendo evidencia separada.

## 1. Problema y resultado deseado

Aunara se publica hoy como proyecto Pages bajo `https://ac-setroc.github.io/aunara/`. Se requiere que `https://aunaratraining.com/` sea el origen canónico en raíz, con `www.aunaratraining.com` redirigido al apex por GitHub Pages, HTTPS obligatorio y callbacks Auth compatibles, sin abrir otro repositorio ni afectar correo, datos, funcionalidades o el sitio funcional durante el corte.

El cambio no es solo DNS: la build de Pages y su guard usan hoy `AUNARA_BASE_PATH=/aunara/`. El artifact del dominio debe usar base `/`; assets, datos, manifest, service worker y callbacks deben resolver en raíz. La recepción de emails, SMTP, remitente y plantillas quedan expresamente diferidos.

## 2. Estado real y evidencia de partida

- DNS público leído el 2026-10-06: apex A `76.223.105.230` y `13.248.243.5`; `www` CNAME al propio apex; NS `ns49.domaincontrol.com` y `ns50.domaincontrol.com`. No se observaron respuestas públicas AAAA, MX, TXT ni CAA en esa consulta. Esto **no** reemplaza el inventario íntegro de la zona autenticada de GoDaddy.
- `.github/workflows/ci.yml` fija `AUNARA_BASE_PATH: /aunara/` tanto para build como para el guard. `vite.config.ts` ya acepta una base absoluta por entorno y no requiere cambiar su lógica.
- `scripts/check-pages-client.mjs` toma `/aunara/` por defecto y su validación actual rechaza `/`; sus tests y `scripts/sw-scope.node-test.mjs` usan fixtures de proyecto. `src/lib/publicBase.test.ts` cubre localhost raíz y Pages `/aunara/`, no el origen raíz nuevo.
- `public/manifest.webmanifest` usa rutas relativas; `public/sw.js` deriva el scope del registro; `src/main.tsx` registra el worker con `import.meta.env.BASE_URL`; `src/hooks/useCloudSync.ts` construye redirects con la base pública. Son comportamientos compatibles por diseño y deben verificarse, no reescribirse.
- La URL Auth vigente de Pages debe preservarse durante y después del corte para rollback. No hay evidencia autenticada todavía de acceso a GitHub Pages Settings, GoDaddy o Supabase en esta fase.

Fuentes primarias consultadas: [dominio personalizado en GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site), [verificación de dominio](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages), [HTTPS en Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https), [A en GoDaddy](https://www.godaddy.com/help/add-an-a-record-19238), [CNAME en GoDaddy](https://www.godaddy.com/help/add-a-cname-record-19236) y [TXT en GoDaddy](https://www.godaddy.com/en-ca/help/add-a-txt-record-19232).

## 3. Alcance y allowlist exacta

### Archivos que una implementación aprobada puede modificar

| Archivo | Cambio permitido |
|---|---|
| `.github/workflows/ci.yml` | Construir y validar el artifact publicado con base `/`; conservar checks y despliegue desde `dist/client/`. |
| `scripts/check-pages-client.mjs` | Aceptar y validar de forma segura tanto `/` como una base de proyecto para despliegue/rollback. |
| `scripts/check-pages-client.node-test.mjs` | Fixtures positivos y negativos de artifact raíz y `/aunara/`. |
| `scripts/sw-scope.node-test.mjs` | Cobertura de scope raíz y de proyecto, incluida fuga de scope. |
| `src/lib/publicBase.test.ts` | Caso explícito `https://aunaratraining.com/` con base `/` y regresión Pages. |
| `README.md` | URL canónica y estado de publicación, sin credenciales ni valores privados. |
| `docs/architecture/0003-pages-from-aunara-repository.md` | Registrar dominio raíz y conservación del mismo repo/workflow. |
| `AUNARA_SOT/README.md` | Puntero canónico actualizado después de evidencia real. |
| `AUNARA_SOT/06-RUNBOOK.md` | Procedimiento operativo/rollback aprobado, sin valores secretos de zona. |
| Este SDD y hunks propios en `02-ESTADO-ACTUAL.md`, `PENDIENTES.md` y una entrada nueva arriba de `03-HISTORIA-Y-BACKLOG.md` | Estado, decisión y evidencia de la fase. |

Operaciones externas, solo después de aprobación: verificación de dominio en la cuenta propietaria GitHub `AC-Setroc` (tipo User en metadata pública), custom domain/HTTPS del repo existente, registros web exactos en GoDaddy y allowlist/Site URL de Auth en el proyecto Supabase existente. No se crea repo, proyecto, cuenta ni proveedor.

### NO-TOCAR

- Sin cambios de lógica en `vite.config.ts`, `public/manifest.webmanifest`, `public/sw.js`, `src/main.tsx`, `src/hooks/useCloudSync.ts` o `src/lib/publicBase.ts` salvo nueva evidencia revisada que pruebe incompatibilidad y una enmienda aprobada.
- No cambiar componentes, contenido, estilos, datasets, schemas, RLS, funciones, transporte del cliente, proveedores, features, cuentas, usuarios ni emails.
- No tocar NS, MX, SPF, DKIM, DMARC, CAA, SRV, subdominios de correo ni ningún TXT ajeno. No borrar registros por no aparecer en `dig`; manda el inventario autenticado de GoDaddy.
- Sin SMTP, remitente, plantillas ni prueba de recepción. Sin secretos, tokens, capturas de credenciales, `.env`, referencias privadas o dirty previo en documentación/commits.
- No añadir `CNAME` al repo: GitHub documenta que un workflow personalizado de Actions no lo necesita y que un archivo previo es ignorado. No usar wildcard DNS.

## 4. Diseño y orden seguro de ejecución

1. **Preflight bloqueante:** con el Operator presente, capturar fuera del repo el inventario completo de la zona GoDaddy (tipo, host, destino y TTL), estado de Pages, SHA desplegado, custom domain/HTTPS y URLs Auth. Comparar antes/después sin publicar valores sensibles. Confirmar accesos administrativos y 2FA; si falta cualquiera, parar.
2. **Propiedad primero:** en Settings de la cuenta propietaria `AC-Setroc` → Pages solicitar verificación de `aunaratraining.com`; añadir en GoDaddy exactamente el nombre TXT y valor emitidos por GitHub, sin inventarlos. Confirmar resolución pública y estado **Verified**; conservar el TXT permanentemente.
3. **Implementación local:** aplicar solo la allowlist, construir con base `/` y mantener pruebas de `/aunara/` para rollback. Revisión independiente antes de publicar. Ninguna operación DNS durante tests.
4. **Auth reversible:** añadir la URL exacta `https://aunaratraining.com/` a Redirect URLs sin quitar `https://ac-setroc.github.io/aunara/` ni otros redirects autorizados. Mantener inicialmente el Site URL vigente; cambiarlo al apex solo tras Pages/TLS estable y verificación del flujo sintético. Sin comodines ni emails reales.
5. **Pages antes de DNS:** configurar en el repo existente el custom domain exacto `aunaratraining.com`. No inferir éxito de un 404 público de API ni afirmar sesión inexistente sin inspección autenticada.
6. **Corte DNS quirúrgico:** reemplazar solo los dos A web actuales del apex por los cuatro A oficiales de Pages: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`. Cambiar solo `www` a CNAME `AC-Setroc.github.io` —no al apex, no a `/aunara/`. No añadir AAAA en esta fase; evita una segunda ruta hasta que se apruebe explícitamente y se usen los cuatro valores oficiales.
7. **Deploy coordinado:** publicar el commit aislado root-base desde `main`, verificar que Actions despliegue únicamente `dist/client/` y conservar SHA/artifact anterior para rollback.
8. **TLS y canónico:** esperar DNS/certificado; activar Enforce HTTPS solo cuando GitHub lo habilite. Verificar apex, `www`→apex y HTTP→HTTPS desde más de un resolver/red. DNS puede tardar hasta 48 h y el certificado hasta 24 h; una sola lectura no cierra el gate.

## 5. PWA, caches y callbacks

En el nuevo origen, manifest `start_url`/`scope`, assets, datos y registro SW deben resolver bajo `/`; el worker no puede escapar de ese origen/scope. El cache con el mismo nombre queda aislado por origen respecto de `ac-setroc.github.io`, por lo que no se borran caches de usuarios ni se manipula el worker legado. La URL Pages anterior puede redirigir al dominio configurado, pero conserva build/allowlist de `/aunara/` suficiente para rollback.

Los callbacks Auth deben usar el origen raíz mediante la base ya existente. Solo un evento Auth verificado puede activar recuperación; signin/signup, link inválido o expirado no deben mostrar recuperación falsa. Esta fase comprueba configuración y callbacks sintéticos/locales; no envía correo, no crea cuentas y no declara recepción real.

## 6. Riesgos, límites y rollback

- **Interrupción web o certificado:** preflight, TTL registrado, corte coordinado, cuatro A completos y CNAME correcto; no dejar A/AAAA/ALIAS/ANAME web conflictivos.
- **Daño a correo:** diff de zona antes/después debe mostrar identidad byte/lógica de todo registro no web; parar ante registro ambiguo. El Operator está resolviendo correo por separado.
- **Takeover:** verificar propiedad antes del corte, conservar el TXT y no retirar custom domain mientras DNS aún apunte a Pages.
- **Rutas `/aunara/` incrustadas:** guard y artifact root negativos; inspección de assets/datos/manifest/SW/callbacks.
- **Auth bloqueado:** conservar redirect anterior y no cambiar Site URL hasta estabilidad; rollback sin depender de correo real.
- **Dirty mezclado:** commit aislado solo con allowlist y docs propias; hashes/diff contra frontera antes de stage.

Rollback: detener deploy; restaurar el commit/artifact previo y workflow `/aunara/`; restaurar exactamente los A web anteriores y `www` del inventario; mantener todos los registros de correo/NS/TXT ajenos intactos y conservar el TXT de verificación para evitar takeover. Retirar el custom domain del repo únicamente después de que DNS ya no apunte a Pages. Restaurar Site URL si cambió, conservando ambos redirects durante estabilización. Documentar hora/TTL/estado sin secretos.

## 7. Criterios de aceptación falsables

| ID | Criterio |
|---|---|
| CA-01 | Cuenta propietaria GitHub muestra `aunaratraining.com` Verified y el TXT exacto sigue resolviendo; no hay wildcard. |
| CA-02 | Apex publica exactamente los cuatro A oficiales, sin A antiguos ni web records conflictivos; `www` es CNAME exacto a `AC-Setroc.github.io`; NS y todos los registros no web coinciden con el inventario previo. |
| CA-03 | Pages del repo existente declara custom domain `aunaratraining.com`, certificado válido y Enforce HTTPS; HTTP y `www` redirigen al apex HTTPS sin loop. |
| CA-04 | Workflow root despliega solo `dist/client/`; artifact no contiene server, fuente, SOT, `.env` ni secretos. Assets/datos/manifest/SW/callbacks no contienen dependencia runtime de `/aunara/`. |
| CA-05 | Home, acceso, manifest y datos cargan sin 404 en raíz; idioma ES/EN y navegación crítica pasan en Chromium/WebKit, 1440/390. No hay errores de consola, mixed content ni overflow nuevo. |
| CA-06 | Manifest y worker quedan en scope `/` del origen nuevo; instalación/actualización simulada no controla otro origen/path. La PWA física iPhone/Android queda UAT humano explícito, no claim automatizado. |
| CA-07 | Auth contiene apex exacto y conserva el redirect Pages previo; callback sintético válido resuelve en raíz y links inválido/expirado/signin/signup no producen recuperación falsa. Cero cuentas o mails reales. |
| CA-08 | La URL `ac-setroc.github.io/aunara/` tiene comportamiento documentado y reversible; build/guard `/aunara/` siguen verdes para rollback. |
| CA-09 | Diff/commit contiene solo la allowlist y docs propias; dirty previo, referencias, producto y operaciones de correo permanecen fuera. |

## 8. Verificación obligatoria

- Typecheck, suite completa vigente, guards de directorio/artifact/SW y `git diff --check`.
- Build de entrega con `AUNARA_BASE_PATH=/` y regresión con `/aunara/`; inspección del artifact y búsqueda de rutas absolutas incorrectas.
- Negativos deterministas: insertar `/aunara/` en asset del fixture raíz, agregar server/source/env, hacer escapar el SW, omitir uno de los cuatro A, conservar A viejo, apuntar `www` al apex o retirar el redirect antiguo deben fallar. Se prueban sobre fixtures/snapshot, nunca mutando DNS/Auth real para provocar fallos.
- UI publicada: Chromium y WebKit, ES/EN, 1440/390, apex/www/HTTP/canónico; home, apertura/cierre de acceso, manifest, datos, SW y callback sintético. Cache deshabilitado y habilitado cuando corresponda.
- DNS/TLS: consultas en al menos dos resolvers/redes y GitHub Pages Settings autenticado después de propagación; registrar hora/TTL. Smoke no sustituye espera de certificado.
- Revisión independiente contra CA-01–09 antes de declarar finalizado. Recepción de correo, SMTP y dispositivo físico continúan pendientes por decisión expresa.

## 9. Accesos, bloqueos y responsabilidades

La implementación requiere al Operator para login/2FA y permisos administrativos en la cuenta GitHub, GoDaddy y Supabase. Codex no solicita ni copia contraseñas, códigos o tokens. El Operator informó que no puede ingresar a GoDaddy desde el navegador de Codex y pidió instrucciones para operar desde su navegador; no se insiste en ese login. No se asume una sesión GitHub autenticada a partir de endpoints públicos. Propagación DNS y emisión TLS son dependencias externas observables.

La publicación ya autorizada de E2 es independiente y no autoriza este corte. Tras aprobación explícita de SDD-005, se implementa localmente, se revisa y recién entonces se coordina la operación con el Operator. Cualquier registro inesperado, conflicto de dominio, falta de acceso o necesidad de tocar un archivo NO-TOCAR devuelve el trabajo al gate.

## 10. Definición de terminado y decisión requerida

Terminado exige CA-01–09 verificadas, deploy root identificado por SHA, inventario DNS antes/después sin cambios no web, HTTPS/canónicos estables, Auth reversible y recibo de revisión independiente. El estado y runbook reflejan evidencia real; no se afirma validación de email ni PWA física.

Decisión requerida: **¿Aprobás SDD-005 con `https://aunaratraining.com/` como apex canónico, `www` redirigido por GitHub Pages y el orden seguro anterior?** Hasta una respuesta explícita, este documento es propuesta y no habilita implementación ni operaciones.
