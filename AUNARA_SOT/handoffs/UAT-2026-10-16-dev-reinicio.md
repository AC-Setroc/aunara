# UAT — servidor actualizado y limpieza de cuentas autorizada

2026-10-16 · `[AUNARA/codex · modelo no expuesto]`.

## Autoridad y alcance

Operator: «Levantá servidor y borrá todas las cuentas de usuario (excepto alejandro@ac-setroc.com) para arrancar UAT». Esta orden supera el NO-TOCAR previo **solo** para actualizar el servidor humano y eliminar las otras cuentas del proyecto Aunara. Dev comparte Supabase con producción: la limpieza también afecta sus cuentas reales. No autoriza publicar código, cambiar SMTP/Redirect URLs/DNS, borrar el almacenamiento local de navegadores ni modificar datos de la cuenta preservada.

## Servidor vigente

- Carpeta aislada `/private/tmp/aunara-sdd015-016-candidate`, arranque HEAD26e7dbc, código aprobado c48664b (SDD015/016). Commits documentales posteriores no cambian fuente.
- Local <http://localhost:5173/>; LAN recomendada en0 <http://192.168.80.19:5173/>. Vite también imprime192.168.40.3 por otra interfaz; para iPhone usar la LAN en0 y misma Wi-Fi.
- Escucha0.0.0.0:5173/strictPort; PID84518, sesión61492, identificadores efímeros. Mantener Mac despierta. El proceso anterior PID1148 se verificó por comando/cwd en SDD014 antes de detenerlo; ningún otro Node se detuvo.
- Vite lee envDir canónico en `/Users/alejandro/AI Projects/Personal/aunara`, sin copiar/mostrar claves ni modificar el canónico dirty. Se verificó solo hostname del proyecto: Aunara sa-east-1, coincidente con conector. No se instalaron dependencias ni se cambió configuración.
- HTTP200 en Local/LAN desde Mac. Módulo servido useCloudSync contiene validateRepbookSnapshot y mensaje de bloqueo016. UI real integrada cargó marca, menú, slogan/footer como invitado; pestaña conservada. Captura local `/private/tmp/aunara-uat-20261016-sdd016-running.jpg` sin datos de cuenta.
- No se afirma consola limpia: Vite emitió dos avisos de optimización sobre imports JSON bajo public; el arranque y la UI completaron. No se parchearon imports durante UAT. No se verificó conexión física iPhone en esta orden.

Receta de reinicio: API createServer de Vite descrita en el handoff original, ahora desde esta carpeta aislada, mismo envDir/base `/`/host0.0.0.0/puerto5173. Confirmar IP real al reiniciar, no asumir que permanece.

## Limpieza de cuentas — ejecutada y verificada

- Proyecto exacto Aunara, contrastado contra configuración del servidor. Antes:4 cuentas;1 excepción exacta preservada y3 objetivos resueltos por UUID/correo. No se publica el inventario personal ni UUID de las cuentas eliminadas.
- Lectura previa de FK: identidades, sesiones, tokens y tablas personales con cascadas esperadas; ninguna trigger DELETE propia;0 objetos Storage y0 filas SCIM de objetivos. Tablas públicas de aplicación: repbook_user_data y repbook_consent_events.
- Borrado SQL transaccional por los **tres UUID previamente inspeccionados**, doble exclusión de la cuenta protegida y guardas de cardinalidad4/1/3, sin DELETE amplio por wildcard. Se eliminaron refresh tokens/sesiones objetivos antes de auth.users; cascada borró3 snapshots y6 eventos de consentimiento asociados. No se modificaron políticas, tablas ni funciones.
- Comprobación dentro de transacción: cuenta preservada, su snapshot y consentimientos iguales antes/después mediante huellas calculadas solo en servidor, sin exponer payload/credenciales/huellas de autenticación. Si discrepaban, rollback obligatorio.
- Primer intento devolvió error del conector «Invalid or expired requestState»; lectura posterior confirmó4/3/3/6 sin cambio, antes de reintentar la misma operación. Segundo intento exitoso. Lectura final independiente:1 cuenta total, solo la excepción;0 otros usuarios, snapshots, consentimientos, sesiones o refresh tokens. No se declara éxito del primer intento.
- Borrado no reversible desde la app. No se exportaron copias con credenciales ni datos personales; recuperación desde backups del proveedor no inspeccionada ni garantizada. Los JWT ya emitidos pueden seguir vigentes hasta expirar; no se cambió política de expiración. Usar ventana privada/nuevo contexto UAT: datos locales de navegadores existentes **no se borraron** y podrían seguir visibles.

## Próximas comprobaciones

1. Operator permite `http://192.168.80.19:5173/**` en Supabase Redirect URLs si aún no está; no sustituir Site URL con IP privada. Configuración remota no alterada aquí.
2. Seguir [lista28 casos](UAT-2026-10-16-dev-checklist.md) con cuenta nueva de prueba y datos ficticios. No compartir contraseñas ni enlaces/tokens en evidencias públicas.
3. Recuperación LAN→prod sigue FALLA previa; nueva IP/servidor no acreditan solución. SMTP/plantillas de marca no activados. HTTP LAN no acredita PWA/offline.

Fuentes oficiales consultadas para límites de borrado y sesiones: [User Management](https://supabase.com/docs/guides/auth/managing-user-data) y [deleteUser](https://supabase.com/docs/reference/javascript/auth-admin-deleteuser). Se usó SQL de datos autenticado del conector; no se invocó la función de autoborrado ni se obtuvieron claves service_role.
