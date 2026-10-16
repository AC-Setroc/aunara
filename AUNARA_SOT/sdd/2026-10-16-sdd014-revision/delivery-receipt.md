# SDD-014 — entrega local

## Integración autorizada a dev — 2026-10-16

`[AUNARA/codex · gpt-6.1-sol]` — Operator respondió **«Sí»** a integrar/subir SDD-014 a dev manteniendo SMTP pendiente. Esta autorización propia supera solo la prohibición histórica de push dev registrada abajo; no autoriza main, publicación, operación Auth/SMTP/DNS/envíos ni actualizar entorno UAT.

Preflight remoto real: `origin/dev` `35b1f93363bd7e477515d49a49c4075558dad25d`, `main` `dfffa873a2a29ee1535c49149f92a734c873923d`. Desde base `61610c1`, el avance remoto contenía únicamente una nota de tests de miércoles en `PENDIENTES.md` y diez líneas del guion `handoffs/UAT-2026-10-12-dev-checklist.md` para SDD-013. Rebase privado normal, limpio y sin conflictos: entrega local original `71948e55c8d4e0992e7bbf7ea1d95135999d42cd` corresponde ahora a `9c528092b5ade4e5821b24f4c53bb8412d20beda`. Ambas aportaciones remotas conservadas; ningún archivo de producto cambia con integración.

El commit documental portador de este registro acompaña el avance fast-forward normal a `refs/heads/dev`; no force-push ni movimiento de la rama dev local de otro worktree. Reproducir verificación fuente con `node AUNARA_SOT/sdd/2026-10-16-sdd014-revision/delivery-audit.mjs --head`:117/117 hashes y blobs HEAD coinciden con freeze; manifest original intacto. Diff frente a entrega aprobada fuera de SOT vacío, fuente/docs vigentes sin errores de whitespace; advertencias de logs crudos documentadas abajo preservadas, no check global inventado. Evidencia de revisión sigue vigente por identidad exacta de fuente; no nuevas suites caras ni acceso a servicios/cuentas/envs.

UAT5173 y canónico intactos, siguen SDD-013/base61610c1; este push no actualiza ese proceso. SMTP y plantillas globales **no activados**. Gate remoto D14-04/05, C14-02/04/05/07, Gmail/Outlook06 y UAT/cierre humano pendientes; cuatro tests de miércoles y recuperación LAN→prod sin reparar. Sin cambio de workflows/deps, PR, deploy ni main. SHA efectivo remoto se confirma tras push y se entrega al Operator; este registro queda ligado al commit portador, no a un SHA autorreferente.

## Antecedente: entrega local sin push

2026-10-16 · `[AUNARA/codex · gpt-6.1-sol]` · **APPROVED LOCAL ciclo1; sin activación remota ni cierre del Operator.**

Checkout aislado `/private/tmp/aunara-sdd014-candidate`, rama persistente `wip/sdd014-local-2026-10-16`, base `61610c1`. Entrega tras [revisión independiente](review-cycle1.md), no implementación ni aprobación propia por este rol. El commit que incorpora este recibo es la frontera local de entrega; consultar `git log -1` en esa rama. Ningún push, merge, cambio a dev/main ni despliegue autorizado o ejecutado.

## Contenido y verificación

- Cinco tracked de implementación: exclusivamente EMAIL en privacy, test LegalPanel y tres documentos de contacto compliance. Cuatro nuevos: dos HTML, README de plantillas y guarda Node. Más SDD/estado/pendientes/entrada aditiva de historia y carpeta de evidencia SDD-014 permitida. Sin evidencia histórica SDD-013 absorbida.
- Freeze `2026-10-16T06:26:55.818Z`:117/117 hashes idénticos antes/después de documentación y commit, manifest byte a byte conservado (SHA256 `12ff41305825c61f54c7416474c11b94bee438faf2e6ddec2e61b31ef5417344`). `delivery-audit.mjs --head` comprueba también los117 blobs en HEAD; resultado en `delivery-source-audit.json`.
- Evidencia inmutable del revisor: suite real371/371 en25 archivos +Sites1/1, base367/367 +Sites1/1; tipos PASS; nuevas guardas10/10; archivo sin Git10/10; previas28/28 +directorio4/4; builds raíz/rollback y guards artifact32 PASS. Lint N/A, sin instalar. No repetidas corridas costosas porque no cambió fuente. Cuatro rojos históricos dependientes del día no reparados; ningún waiver D-13-6 heredado ni reloj alterado.
- JSON revisados:48 casos raíz +24 rollback =72;120 capturas y20 collages propios revisados, Chromium/WebKit320/390/1440, ES/EN, correo con/sin imágenes. Contraste mínimo5.8483:1. No nuevos servidores desde entrega; el revisor cerró los suyos.
- Auditoría de material sensible acotada a artefactos entregados: sin credenciales/JWT reales ni destinatarios de prueba reales; URLs `.invalid` sintéticas, no tokens reales. Contactos business/nombre legal ya aprobados se conservan. Sin cuentas, Auth API, Supabase/Zoho, DNS, envíos, datos, envs ni canónico/UAT inspeccionados o modificados. `git diff --check` PASS. Al incorporar evidencia nueva, `git diff --cached --check` detectó líneas vacías finales en siete logs crudos y espacios de contexto en `tracked-implementation.diff`; se conservan íntegros, no son fuente de producto. Comprobación staged excluyendo solo `*.log` y ese `.diff`: PASS; no se presenta el check staged completo como verde.

## Estado y pendientes

Advertencias de whitespace de evidencia preservadas: `directory-check.log:4`, `focused-regression.log:9`, `green-contact.log:9`, `red-contact.log:768`, `reviewer-typecheck.log:4`, `typecheck.log:4` (línea vacía final); `tracked-implementation.diff:7,11,15,29,38,52,63,72,97` (espacios de contexto). Todos bajo esta carpeta. Corrección de precisión del conteo: seis logs, no siete. El helper de entrega ajustó solo su buffer de lectura Git tras ENOBUFS de un dataset grande; no alteró fuente ni manifest.

C14-01/03/08 y preview C14-06 PASS LOCAL. C14-02/04/05/07 y Gmail/Outlook C14-06 **NO EJECUTADOS**: gate remoto explícito, ambientes afectados, permisos/capacidades Zoho, rollback seguro y destinatarios autorizados. Zoho/noreply existentes son hechos reportados, no configuración inspeccionada. Si requiere DNS/ampliación/proveedor, volver al gate correspondiente.

Contacto de privacidad admin; soporte ES soporte/EN support. Nombre, versión1.0, fecha y consentimientos intactos, sin cambiar hook/Auth/editor/layout/brand/deps/workflows. UAT5173 sigue sirviendo SDD-013/base61610c1, **no SDD-014**. Nueva orden para integración a dev/push; activación remota y UAT/cierre humano separados. Recuperación LAN→prod y cuatro defectos históricos siguen abiertos. Historia de SPEC preservada con sus solicitudes originales marcadas superadas, D14-03 resuelta «Dale»; no aprobación global.
