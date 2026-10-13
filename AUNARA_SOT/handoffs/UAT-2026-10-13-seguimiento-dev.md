# UAT dev — seguimiento del Operator

2026-10-13 · `[AUNARA/codex · modelo no expuesto]` · Base ejecutada `41fa9d9` (incluye `588d465`, código SDD-012 `d381e52`).

## Observaciones nuevas, sin parche en caliente

1. **Menú: FALLA de aceptación visual.** El Operator rechaza explícitamente la presentación actual. Captura: tarjeta modal centrada, selector de idioma ancho y tres opciones rectangulares; no satisface la calidad visual esperada. Esto no revoca las pruebas funcionales históricas, pero impide declarar aceptación humana. Volver a Spec para propuesta visual concreta desktop/móvil antes de implementar; preservar destinos, logo/hamburguesa, idioma, privacidad, logout y foco/teclado.
2. **Opcional: sigue pendiente UAT13-05 / D-12-4.** Captura confirma etiqueta en recuadro interno. El Operator reitera quitar ese recuadro y usar otro color; no fue parte del código integrado SDD-012. No marcar como corregido ni pedir que vuelva a reportarlo. Debe entrar en la próxima propuesta visual, conservando checkbox asociado, consentimiento opcional, accesibilidad y contraste.
3. **Correo: recibido reportado; retorno indicado `http://localhost:5173/#`.** Esa URL es destino, no remitente. No se recibieron tokens/enlace completo y no deben solicitarse ni versionarse. Dispositivo donde se abrió y estado posterior pendientes de aclarar. En iPhone localhost refiere al iPhone, no la Mac; para UAT LAN debe retornar al origen LAN. El punto 1 continúa PARCIAL/NO APROBADO: falta confirmar cuenta, acceso y recuperación con retorno correcto; recepción por sí sola no prueba sesión activa.

Operator reportó haber agregado Redirect URLs para localhost/127.0.0.1 y luego el origen LAN. No hubo inspección independiente del dashboard en esta iteración. No modificar Auth/SMTP/DNS por este reporte ni inferir la causa del destino desde una URL abreviada.

Dos capturas originales adjuntas al chat, no copiadas al repo público. No contienen evidencia de cierre del punto 1. Ningún cambio de aplicación, publicación, datos o cuenta. Próximo: aclarar dispositivo/origen usado al registrarse y destino al confirmar; seguir el guion por pasos con evidencia. Cualquier FALLA vuelve a Spec.
