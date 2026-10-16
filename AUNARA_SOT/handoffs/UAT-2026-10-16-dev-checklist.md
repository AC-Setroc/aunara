# UAT vigente — dev con SDD-013 a SDD-016

2026-10-16 · `[AUNARA/codex · modelo no expuesto]`.

## 1. Preparación y alcance

**Fuente objetivo de esta UAT: código `c48664b` en dev, con SDD-015/016 implementados y CI42 SUCCESS; recibo documental `d15c3ea`. El servidor humano5173 NO se actualizó a esa fuente.** Antes de empezar, Codex debe actualizar el servidor mediante una orden de entorno y comprobar qué versión sirve; no aceptar016 desde el servidor anterior ni desde producción. [Recibo técnico016](../sdd/2026-10-16-sdd016-revision/README.md). Los commits posteriores solo documentales no cambian el objetivo. [Recibo y receta de arranque histórica](HANDOFF-2026-10-16.md). Sustituye operativamente el [guion anterior](UAT-2026-10-12-dev-checklist.md), cuyos números 1–22 conserva; añade27–28 sin renumerar evidencia anterior.

- Últimas direcciones reportadas, **no reinspeccionadas en esta actualización documental**: Mac <http://localhost:5173/> e iPhone <http://192.168.1.6:5173/>. Codex confirma ambas al actualizar el servidor; la IP puede cambiar de red. Mantener Mac despierta, servidor abierto y misma Wi-Fi. No tomar estos enlaces históricos como prueba de que la versión actual ya está servida.
- Antes de abrir correos desde iPhone, el Operator comprueba que Redirect URLs permita `http://192.168.1.6:5173/**`; también localhost y 127.0.0.1:5173 para Mac. No reemplazar Site URL con la IP privada. No se ha reinspeccionado la configuración remota. Permitir un origen no demuestra que el retorno esté corregido.
- Dev usa Supabase real: cuenta, correos y datos no están aislados por rama. Usar cuenta desechable propia y datos ficticios; no borrar una cuenta habitual. El Operator introduce credenciales, acepta términos y confirma cualquier borrado irreversible.
- No identificar la versión solo por el slogan: registrar URL, dispositivo, navegador, idioma y fuente indicada arriba. Si el correo cambia el origen, anotarlo antes de continuar: prod no contiene estas entregas.
- Cada caso **manual** empieza **NO PROBADO** en esta nueva corrida. Registrar PASA / FALLA / NO PROBADO / BLOQUEADO con evidencia. El punto28 conserva su PASS técnico previo, no se traslada a aceptación humana.
- HTTP LAN no acredita service worker/PWA/offline: el punto 9 requiere entorno adecuado separado. No publicar para poder probarlo sin orden nueva.

## 2. Cuenta, datos y rutina — puntos originales 1–10

| # | Pasos del Operator | Comportamiento esperado y límite |
|---|---|---|
| 1 | Crear cuenta de prueba; abrir confirmación en el mismo dispositivo; ingresar; pedir recuperación desde dev y abrir el enlace. | Confirmación e ingreso funcionan. Recuperación muestra el formulario de nueva contraseña en el origen dev solicitado, sin espera permanente. **Retorno LAN→prod: FALLA previa abierta**, no reparada por SDD-014. Si cambia a prod, detener ese caso y registrar URL sin query/hash/token. El remitente actual no se evalúa todavía contra noreply. |
| 2 | Completar onboarding; repetir con otro perfil de prueba abandonado tras nombre o preferencia. | Cuenta/privacidad reconoce «Perfil y preferencias» en ambos estados parciales/completos; vacío total no lo lista. No afirmar sincronización antes de terminar y esperar el guardado. |
| 3 | Abrir menú sin sesión; luego con sesión. Cerrar con Escape. | Invitado no ve destinos privados ni Salir; autenticado sí. Cierre restaura el foco al disparador. No confundir «Cuenta/sincronización» con «Cuenta/privacidad»: son destinos distintos. |
| 4 | Abrir eliminación en una cuenta desechable; escribir valor incorrecto y luego ELIMINAR exacto; cambiar idioma; cancelar/Escape. Solo al final, si el Operator lo decide, confirmar borrado real. | Solo texto exacto habilita; cambio de idioma vacía confirmación; cancelar/Escape no borran. Borrado definitivo requiere comprobar también ausencia remota por acceso autorizado, no solo pantalla vacía. Sin esa comprobación, resultado parcial. |
| 5 | Sin autorización de salud, revisar si permite capturar medidas/notas. Después autorizar, cargar datos ficticios, guardar; revocar. | No persistir salud sin autorización. Con autorización se sincroniza; al revocar, salud local/remota se elimina y preferencias no sensibles se conservan. Si permite captura, registrar la conducta exacta como hallazgo; no dar por cerrado solo por el guard remoto. Validación remota autorizada pendiente. |
| 6 | Con confirmación de borrado abierta, cambiar idioma dos veces rápidamente. | Cancelar permanece disponible; no queda sincronización permanente ni botones atrapados. No confirmar borrado en este caso. |
| 7 | Crear triserie: press inclinado 8 reps, segundo ejercicio al fallo técnico, escalador 20 por lado. Guardar, editar, exportar y recargar. | Se conservan estructura, orden y las tres prescripciones distintas en UI/exportación; flotante no tapa campos/botones en iPhone. No se guarda como rutina personal del Operator desde un harness. |
| 8 | Abrir aviso de almacenamiento, privacidad y términos. En perfil/navegador separado, probar almacenamiento denegado. | GitHub Pages y versión legal 1.0; aviso no sustituye consentimiento. Al denegar almacenamiento aparece error de inicio legible, no blanco. No cambiar ajustes del navegador habitual ni borrar su almacenamiento. |
| 9 | En simulador/entorno seguro apropiado, instalar y abrir standalone. | Se oculta ayuda de instalación cuando ya está instalada. **BLOQUEADO para acreditar PWA/offline desde HTTP LAN en iPhone**; no extrapolar desde navegación normal. |
| 10 | Misma cuenta de prueba en dos navegadores/dispositivos. Cambiar nombre/preferencias en uno, esperar guardado y recargar el otro. | Ambos conservan nombre y preferencias. No editar simultáneamente: H-03 de re-bootstrap/remoto gana sigue abierto. No interpretar datos conservados al volver de prod como prueba de retorno correcto. |

## 2b. Revisión de acceso e interfaz — puntos 11–22

Repetir visuales en ES/EN, Mac y Safari iPhone; 320/390 de ancho donde se pueda. WebKit automatizado no equivale a Safari físico.

| # | Pasos | Resultado esperado |
|---|---|---|
| 11 | Abrir por logo; cerrar; abrir por hamburguesa. Invitado y autenticado. | Mismo panel desde borde derecho; lateral en escritorio y ancho completo en móvil, sin recortes ni superposición accidental. |
| 12 | Revisar cabecera y destinos del menú; cambiar idioma dentro. | Cabecera solo marca/hamburguesa. Destinos según sesión: rutas, biblioteca, perfil, hoy, cuenta/sincronización, ingresar o privacidad, ayuda y Salir. ES/EN cambia sin cerrar. Ayuda de instalación es condicional. Dos entradas Inicio preservan acciones distintas (rutas y ancla); registrar opinión UX, no corregir aquí. |
| 13 | Perfil autenticado → Salir; repetir como invitado. | Salir junto a Listo cierra perfil y sesión; como invitado no aparece. Ningún dato se expone tras salir. |
| 14 | Preferencias: cambiar experiencia principiante→intermedio; pasar a Cuerpo y salud y volver; pulsar Listo; reabrir y recargar. | Un solo control de experiencia, sin duplicado en salud; valor no se revierte al cambiar de pestaña y persiste después de Listo/recarga. Sin botón adicional «Guardar preferencias». |
| 15 | Cuenta pendiente de confirmación: observar sin hover; luego con hover/foco. | «Reenviar correo de confirmación» siempre legible y accionable. Reenviar solo si el Operator desea un correo real. |
| 16 | Footer con sesión, ES/EN; hover/foco de privacidad y términos. | Crédito Desarrollado por/Developed by + wordmark visible, enlaces legibles en todos los estados. |
| 17 | Menú → Cuenta/privacidad con sesión; revisar acciones y exportar datos de prueba. | Perfil/preferencias, exportar, corregir, revocar salud y eliminar datos/cuenta accesibles según estado. Exportación corresponde a la cuenta actual. Borrados solo según punto 4; datos de salud según 5. |
| 18 | Editor con triserie y ejercicios simples. | Un solo bloque configurable de series por ejercicio; no «Plan de series» fijo duplicado. Cambiar un valor no altera los de otros ejercicios. |
| 19 | Cabecera móvil ES/EN a320/390. | Wordmark completo Aunara Training Systems, no solo símbolo; logo y hamburguesa legibles, sin corte ni overflow horizontal. |
| 20 | Menú abierto: Tab/Shift+Tab, selector nativo; Escape, botón cerrar y fondo cuando sea visible. | Foco no escapa al fondo y alcanza selector/destinos; cada cierre vuelve al disparador. Scroll del fondo bloqueado mientras esté abierto. |
| 21 | Registro: revisar consentimientos; intentar continuar sin términos; comparar salud marcada/desmarcada. | Opcional de salud sin recuadro propio, texto verde oscuro, alineado. Términos obligatorios; salud no obligatoria. El bloque legal contenedor puede seguir teniendo borde: no confundirlo con el recuadro eliminado del texto opcional. |
| 22 | Footer público y autenticado ES/EN en móvil/escritorio. | Marca y «Tu propósito marca el camino»/traducción en mismo eje; crédito y AC Setroc lado a lado y centrados; enlaces alineados, visibles con hover/foco y sin desbordes. |

## 2c. SDD-014 — contacto y correo de marca

| # | Pasos | Resultado esperado / estado |
|---|---|---|
| 23 | Abrir privacidad y términos, ES/EN. | Contacto admin@aunaratraining.com; mismo responsable, versión1.0 y fecha2026-07-29. Ningún cambio de finalidad, autorización o identidad legal. Contacto ES comprobado en el servidor por Codex; resto UAT pendiente. |
| 24 | Revisar capturas de ambas plantillas en [evidencia local](../sdd/2026-10-16-sdd014-revision/review-cycle1.md). | Marca Aunara/Training Systems, texto ES+EN en cada correo, CTA y respaldo del mismo enlace, ayuda soporte@/support@ y privacidad admin@. Legible sin imágenes y en móvil. Son previews sintéticos, no correos recibidos. No pulsar enlaces de ejemplo. |
| 25 | Tras autorización remota separada: alta, reenvío y recuperación a destinatarios controlados Gmail/Outlook. | **BLOQUEADO: SMTP/plantillas no activados.** Objetivo From Aunara <noreply@aunaratraining.com>, asuntos y marca correctos, recepción/headers/MIME/autenticación de dominio y enlaces reales comprobados. Llegar hoy desde Supabase no refuta la entrega local: activación pendiente. |
| 26 | Tras gate remoto: enlaces válidos, inválidos, usados y expirados; Mac y LAN. | **NO PROBADO / gate remoto.** Retorno al entorno solicitado, errores recuperables y ninguna exposición de tokens. Confirmar caducidad real; no inventar plazos. La falla de recuperación previa sigue separada. |

## 2d. SDD-015/016 — regresión y protección de datos

| # | Pasos / responsable | Resultado esperado y estado |
|---|---|---|
| 27 | Operator: editar una rutina con lunes y miércoles; seleccionar lunes, mover un ejercicio a miércoles, guardar, cerrar/reabrir y recargar. | La edición afecta el ejercicio/día elegido y persiste; no registra carga de una sesión por editar el plan. SDD-015 corrigió solo tests, no cambió la selección inicial del producto: puede abrir en el día actual si está en la ruta. Prueba manual pendiente. Prueba técnica de fecha real/miércoles ya PASS, sin que el Operator cambie el reloj del dispositivo. |
| 28 | Codex: probe sintético de remoto inválido, no manipular la fila real del Operator. Probar sport vacío/posición inválida; editar una preferencia local; luego casos ausente/válido y dos dispositivos. | Remoto inválido:0POST automáticos, fila intacta, datos y edición local conservados, error legible ES/EN; retry solo habilita escritura después de lectura válida/ausente. Ausente/válido: sincronización normal. **PASS técnico ya acreditado** Chromium/WebKit, ambas bases,24casos y repetición independiente24/24; no aceptación de Safari/iPhone real. No pedir al Operator corromper su base para probarlo. [Recibo/probe](../sdd/2026-10-16-sdd016-revision/README.md). |

## 3. Pedidos previos que no se declaran resueltos en esta entrega

Consultar [clasificación de feedback](UAT-2026-10-13-resultados-operator.md) y [pendientes](../PENDIENTES.md). Esta preparación no implementa:

- Rediseño/dosificación de sugerencia por día y grupo muscular, ni reemplazar «Aceptar y editar» por «Editar».
- Preflight con «Otro» libre y botones Revisar/Iniciar; registro/historial de carga ejecutada por día de SDD-007.
- Agregar ejercicios desde la tarjeta de cada día (D-12-2); ampliación/traducción del catálogo por nombres específicos, distinta de filtrar grupo «abdominales».
- Mensaje que confirme existencia de una cuenta: no aprobar enumeración de usuarios como requisito implícito; el error genérico se evalúa aparte.
- H-03, estadísticas desvinculadas, SDD-007/008/009 ni versión legal1.1. **Los cuatro casos dependientes del miércoles sí quedaron corregidos por SDD-015** y pasan con ambos relojes; D-13-6 queda como excepción histórica, no como método de verificación vigente. SDD-016 protege el remoto inválido, pero no resuelve H-03 ni la recuperación LAN→prod.
- Publicación, proveedor SMTP activo o garantía universal de entrega/inbox.

## 4. Registro y cierre

Por caso: `número · PASA/FALLA/NO PROBADO/BLOQUEADO · fecha/hora · URL sin query/hash · fuente · dispositivo/navegador/idioma · pasos · esperado · observado · evidencia sanitizada`.

Capturas con correo personal, salud, tokens o enlaces de acceso quedan fuera del repo público. Versionar solo descripción sanitizada y referencia privada sin secretos. **FALLA vuelve a Spec; no se parchea durante UAT.** No cambiar producción para salvar una prueba. El Operator cierra aceptación; publicar exige una orden nueva. Ningún caso manual nuevo se marca PASA por este documento. El PASS técnico28 se conserva separado de los resultados humanos.
