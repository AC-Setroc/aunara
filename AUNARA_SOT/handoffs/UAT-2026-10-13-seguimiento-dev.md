# UAT dev — seguimiento del Operator

2026-10-13 · `[AUNARA/codex · modelo no expuesto]` · Base ejecutada `41fa9d9` (incluye `588d465`, código SDD-012 `d381e52`).

## Observaciones nuevas, sin parche en caliente

1. **Menú: FALLA de aceptación visual.** El Operator rechaza explícitamente la presentación actual. Captura: tarjeta modal centrada, selector de idioma ancho y tres opciones rectangulares; no satisface la calidad visual esperada. Esto no revoca las pruebas funcionales históricas, pero impide declarar aceptación humana. Volver a Spec para propuesta visual concreta desktop/móvil antes de implementar; preservar destinos, logo/hamburguesa, idioma, privacidad, logout y foco/teclado.
2. **Opcional: sigue pendiente UAT13-05 / D-12-4.** Captura confirma etiqueta en recuadro interno. El Operator reitera quitar ese recuadro y usar otro color; no fue parte del código integrado SDD-012. No marcar como corregido ni pedir que vuelva a reportarlo. Debe entrar en la próxima propuesta visual, conservando checkbox asociado, consentimiento opcional, accesibilidad y contraste.
3. **Correo: recibido reportado; retorno indicado `http://localhost:5173/#`.** Esa URL es destino, no remitente. No se recibieron tokens/enlace completo y no deben solicitarse ni versionarse. Dispositivo donde se abrió y estado posterior pendientes de aclarar. En iPhone localhost refiere al iPhone, no la Mac; para UAT LAN debe retornar al origen LAN. El punto 1 continúa PARCIAL/NO APROBADO: falta confirmar cuenta, acceso y recuperación con retorno correcto; recepción por sí sola no prueba sesión activa.

Operator reportó haber agregado Redirect URLs para localhost/127.0.0.1 y luego el origen LAN. No hubo inspección independiente del dashboard en esta iteración. No modificar Auth/SMTP/DNS por este reporte ni inferir la causa del destino desde una URL abreviada.

Dos capturas originales adjuntas al chat, no copiadas al repo público. No contienen evidencia de cierre del punto 1. Ningún cambio de aplicación, publicación, datos o cuenta. Próximo: aclarar dispositivo/origen usado al registrarse y destino al confirmar; seguir el guion por pasos con evidencia. Cualquier FALLA vuelve a Spec.

## Actualización posterior — confirmación Mac y acceso LAN

- Operator aclara: enlace abierto en **Mac, dev**. Sesión quedó iniciada y pantalla lista para ingresar datos del usuario. Confirmación/retorno Mac: **PASA reportado por Operator**. Punto 1 aún parcial: recuperación no probada; iPhone no probado.
- iPhone reporta que no encuentra servidor aun estando en la misma red. Diagnóstico de lectura: node PID 22318 escucha `*:5173`; interfaz Wi-Fi en0 ahora tiene `192.168.80.26`, distinta de la IP entregada anteriormente `192.168.68.101`. Localhost y nueva IP responden HTTP 200 desde Mac (comprobación con permiso de red). No demuestra acceso desde iPhone ni identifica por qué cambió la IP.
- Nuevo enlace a probar en iPhone: `http://192.168.80.26:5173/`. Operator debe agregar este origen a Redirect URLs antes de probar retorno de correos desde LAN. No se cambió firewall, VPN, router ni Supabase. Conectividad del iPhone pendiente de confirmar por Operator.

## Actualización posterior — iPhone accesible, recuperación vuelve a producción

- Operator confirma acceso iPhone con la nueva IP: **PASA reportado**. La nota anterior de conectividad pendiente queda superada, no borrada.
- Enlace de recuperación termina en prod: **FALLA de retorno UAT a dev**, punto 1 abierto. No se afirma que haya fallado el cambio de contraseña ni se cierra recuperación.
- Lectura fresca de `useCloudSync.ts:477–478`: reset solicita redirectTo mediante `publicBaseUrl(BASE_URL, window.location.origin)`. Con origen LAN actual y base raíz, el destino solicitado debe ser `http://192.168.80.26:5173/`. Esto es evidencia de código, no captura de request ni verificación del dashboard.
- Falta aclarar si se abrió un correo nuevo solicitado desde la IP nueva después de guardar su allowlist, o uno previo. Revisar origen de solicitud, hora del correo y URL autorizada sin exponer tokens/enlace completo. No atribuir automáticamente causa a SMTP o código; sin cambio de Auth ni parche.

## Actualización posterior — solicitud desde iPhone y nueva observación de marca

- Operator aclara que solicitó recuperación desde el servidor dev en iPhone: el supuesto de solicitud en producción no explica el reporte. Sigue **FALLA de retorno**, sin causa raíz confirmada. Falta inspección controlada de redirect solicitado, configuración efectiva y destino del correo sin tokens; no reintentar indefinidamente ni modificar configuración por suposición.
- Captura nueva muestra cabecera móvil con solo símbolo Aunara, sin wordmark. Operator rechaza esa presentación: incluir **wordmark en cabecera móvil** como requerimiento de la próxima propuesta visual. Código fresco `styles.css:1635–1636` oculta brand-lockup y muestra brand-symbol en móvil: comportamiento actual localizado, no fallo de descarga demostrado.
- Orden del Operator: continuar proceso de correcciones y dejar pruebas iPhone para después de concluir lo que debe corregirse. **UAT iPhone diferida por pedido del Operator**; no cerrada. No hay aprobación de un SDD nuevo ni autorización de publicación.
- Proceso activado: Operator SDD Workflow, fase de especificación; propuesta visual de menú/cabecera/consentimiento debe aprobarse antes de código. Retorno de recuperación es frente diagnóstico separado; solo habilitar cambios Auth/SMTP/hooks si evidencia y alcance aprobado los requieren. SDD-007, volumen clínico, H-03, legal y main permanecen fuera.

## Decisión visual del Operator

El Operator autorizó maqueta separada y eligió **A, panel lateral**. Referencia fuente preservada en [propuesta visual](../sdd/2026-10-13-sdd013-propuesta/README.md). Cabecera con wordmark móvil, menú desde borde derecho y opcional sin recuadro; propuesta B descartada. Preparar SDD-013 acotado y esperar aprobación explícita del alcance antes de implementar. Elección no aprueba CTA/hero/copy ficticios ni cambios Auth. UAT iPhone continúa diferida hasta correcciones; recuperación permanece abierta.

## Actualización de entrega — 2026-10-15

`[AUNARA/codex · gpt-6.1-sol]` — SDD-013 v0.1 aprobado el 14Oct e implementado en candidato aislado `/private/tmp/aunara-sdd013-candidate` sobre `549b100`. [Revisión independiente ciclo2 APPROVED técnico](../sdd/2026-10-13-sdd013-revision/review-cycle2.md) y [recibo de entrega](../sdd/2026-10-13-sdd013-revision/delivery-receipt.md): cuatro matrices393/393, Chromium/WebKit y ambas bases,96 superficies visuales; regresiones y N1–N4 rojo/restaurado verde completos. Ocho fuentes/tests entregados idénticos al manifest revisado; no se actualizó el entorno UAT abierto ni el canónico dirty.

La propuesta/preparación visual indicada arriba queda superada como siguiente paso, no se borra el rechazo humano anterior. Menú desde borde derecho, wordmark móvil, consentimiento sin recuadro y footer tienen aceptación técnica, **no UAT humana**. La suite367/25 + Sites1 solo es verde con lunes controlado bajo D-13-6 aprobada expresamente el 15Oct; los cuatro fallos antiguos de fecha real siguen sin corregir, separados de este alcance.

Siguiente: Operator revisa entrega y autoriza por separado integración/actualización del entorno antes de retomar UAT iPhone/Safari real. Recuperación LAN→prod sigue FALLA sin causa raíz confirmada; ningún cambio Auth/Supabase/SMTP/DNS ni envío de correo. Dos filas Inicio son acciones rutas/ancla preservadas, observación UX sin autofix. Un commit local enfocado; sin push, merge, deploy ni cierre del Operator.
