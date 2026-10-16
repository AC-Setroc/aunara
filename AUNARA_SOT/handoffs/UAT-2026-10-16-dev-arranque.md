# UAT dev — arranque del candidato SDD-013 integrado

2026-10-16 · `[AUNARA/codex · modelo no expuesto]`.

## Versión y autoridad

Operator autorizó integrar/subir la entrega `ccce932` a dev y levantarla para UAT, sin tocar producción. `origin/dev` confirmado en `d344eebf6730e26ae2a282d22debb4f2bd7b1c63`; fuente, activos, dependencias y workflows idénticos a la entrega revisada. Main remoto permanece `dfffa873a2a29ee1535c49149f92a734c873923d`. [Revisión técnica](../sdd/2026-10-13-sdd013-revision/review-cycle2.md) y [entrega/integración](../sdd/2026-10-13-sdd013-revision/delivery-receipt.md). CI [Verify source #34](https://github.com/AC-Setroc/aunara/actions/runs/38859775887) SUCCESS; upload Pages y deploy SKIPPED. Esto no acredita UAT humana ni corrige la dependencia del día exceptuada por D-13-6.

## Entorno aislado y direcciones

- Carpeta servida: `/private/tmp/aunara-sdd013-candidate`, no la canónica dirty ni el worktree UAT anterior. Rama local de entrega `wip/sdd013-reviewed-delivery-2026-10-15`.
- Configuración existente leída mediante Vite `envDir` desde `/Users/alejandro/AI Projects/Personal/aunara`; no se copió, mostró ni versionó `.env.local`. Dependencias locales existentes, sin instalar ni cambiar paquetes.
- Local: `http://localhost:5173/`.
- Network, impreso por Vite: `http://192.168.1.6:5173/`. La IP anterior `192.168.80.26` no es la dirección actual de esta corrida.
- Servidor escucha `0.0.0.0:5173`, strictPort; iniciador Node mediante API `createServer` de Vite, base `/`. Sesión de terminal actual59769 (identificador efímero, no garantía de supervivencia tras cerrar/reiniciar Mac).
- HTTP200 comprobado por curl en ambos orígenes desde Mac. No equivale a acceso físico desde iPhone.

## Verificado en UI y límites

Navegador integrado abierto a localhost: muestra Aunara Training Systems, slogan vigente y crédito; hamburguesa abre menú lateral completo con marca, Inicio/rutas, Inicio ancla, Ingresar/crear cuenta, selector ES/EN y Ayuda/instalación. Captura local `/private/tmp/aunara-uat-20261016-menu.jpg`, sin datos personales, no captura original del Operator. Pestaña marcada para conservar como entrega.

No se ingresaron credenciales, crearon cuentas, enviaron correos, aceptaron términos ni modificaron datos. No se afirma consola limpia ni se repiten aquí las matrices técnicas completas ya aprobadas. No se comprobó Safari físico/iPhone, envío/recepción real, recuperación o sincronización real. No se cambió Supabase, SMTP, DNS ni configuración del sistema.

## Próximo paso

Operator agrega `http://192.168.1.6:5173/**` a Supabase Redirect URLs antes de probar correos desde iPhone, si aún no está. No reemplazar Site URL con una IP privada. Misma Wi-Fi, Mac despierta y servidor activo. HTTP LAN no prueba PWA/offline ni service worker. Seguir [guion](UAT-2026-10-12-dev-checklist.md) y [seguimiento](UAT-2026-10-13-seguimiento-dev.md); todo FALLA vuelve a Spec, no hotpatch.

Nuevo pedido de correo de marca se registra en SDD-014; proveedor Zoho y cuenta noreply reportados por Operator. Sin configuración remota aplicada. Retorno de recuperación LAN→producción continúa abierto: no se atribuye a SMTP ni se declara solucionado por cambiar plantilla.
