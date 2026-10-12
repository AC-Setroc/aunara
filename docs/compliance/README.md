# Aunara — registro de privacidad y cumplimiento

Estado: versión personal de UAT. Registro actualizado el 2026-10-12 (SDD-010);
política y términos siguen en la versión 1.0 del 2026-07-29.

Este registro acompaña los controles visibles en la aplicación. No sustituye
una revisión jurídica. Antes de ofrecer Aunara comercialmente, aceptar pagos,
habilitar entrenadores o tratar datos de clientes de terceros, un abogado
colombiano debe revisar el producto, los contratos con proveedores y los textos
legales.

## Responsable configurado

- Responsable: Alejandro Cortés Burgos, Colombia.
- Canal de privacidad: alejandro@ac-setroc.com.
- Política y términos: versión 1.0, vigentes desde 2026-07-29.
- El canal de privacidad se mantiene en `alejandro@ac-setroc.com` por decisión del
  Operator del 2026-10-12; se actualizará cuando el correo del dominio propio esté
  activo. Ese cambio requerirá revisar este registro y el aviso en pantalla.

Si la identidad comercial o el responsable cambian, deben actualizarse antes
de recoger nuevas aceptaciones. Un cambio material requiere aviso nuevo y,
cuando corresponda, una nueva aceptación.

## Cambios desde la versión 1.0

Hechos ocurridos después de la fecha de vigencia. Ninguno modificó la versión
jurídica ni el texto aceptado por los titulares.

| Fecha | Cambio | Commit | Versión jurídica |
| --- | --- | --- | --- |
| 2026-08-08 | Marca Repbook → Aunara en la aplicación y sus textos legales | `4a17378` | Sin cambio (1.0) |
| 2026-10-01 | Hosting de la web pública: OpenAI Sites → GitHub Pages, desde el repositorio público `AC-Setroc/aunara` | `fc88568` | Sin cambio (1.0) |
| 2026-10-07 | Dominio propio `https://aunaratraining.com/` (registrador y DNS: GoDaddy); la URL de Pages redirige al dominio | `1c709a3` | Sin cambio (1.0) |

Decisión pendiente, dueño Operator con asesoría jurídica: determinar si estos
cambios son materiales en los términos de la sección anterior y exigen una versión
1.1 con aviso y nueva aceptación. Este registro no la toma. Mientras tanto, el aviso
publicado en la aplicación sigue en 1.0 y todavía nombra OpenAI Sites como
proveedor de hosting; su corrección está especificada y aprobada en
`AUNARA_SOT/sdd/SDD-002-avisos-legales-creditos.md` y no se ha publicado.

## Controles implementados

1. Aviso de privacidad y términos disponibles antes y después del registro.
2. Aceptación obligatoria de términos/política, registrada con versión y fecha.
3. Autorización separada, expresa y facultativa para datos sensibles de salud.
4. Ruta básica funcional sin medidas corporales, lesiones, síntomas, alergias,
   nutrición personalizada ni registros de bienestar.
5. Centro de privacidad para exportar, corregir y borrar datos, retirar o
   conceder la autorización de salud y eliminar permanentemente la cuenta.
6. Separación de datos por usuario mediante políticas de acceso a nivel de fila;
   acceso anónimo bloqueado.
7. Registro auditable de decisiones de autorización.
8. Procedimientos internos de conservación, incidentes, proveedores y medios.

## Marco colombiano considerado

- Ley 1581 de 2012 y su reglamentación compilada en el Decreto 1074 de 2015:
  autorización, información al titular, tratamiento reforzado de datos
  sensibles y derechos de conocer, actualizar, rectificar y suprimir.
- Ley 1480 de 2011: información clara y no engañosa si el servicio llega a
  ofrecerse como producto de consumo.
- Límites profesionales aplicables al contenido: Aunara se presenta como
  herramienta de organización y bienestar, no como diagnóstico, tratamiento,
  prescripción nutricional, fisioterapia ni rehabilitación.

## Pendientes previos a un lanzamiento comercial

- Revisión jurídica colombiana completa.
- Confirmar contratos, anexos de tratamiento y ciclos de respaldo de Supabase,
  GitHub (Pages) y GoDaddy (dominio y DNS). Ninguno fue verificado para este
  registro.
- Decidir, con asesoría jurídica, si los cambios listados en «Cambios desde la
  versión 1.0» exigen una nueva versión del aviso y nueva aceptación.
- Publicar la corrección del proveedor de hosting en el aviso en pantalla
  (SDD-002), para que lo que lee el titular coincida con este inventario, y
  actualizar en ese momento la frase de «Cambios desde la versión 1.0» sobre el
  proveedor de hosting que el aviso en pantalla todavía nombra.
- Activar en Supabase Auth la protección contra contraseñas conocidas como
  filtradas, si el plan contratado ofrece esa función.
- Definir la estructura jurídica/comercial y actualizar al responsable real.
- Obtener una licencia propia y verificable para las imágenes/animaciones de
  Gym Visual, o sustituirlas por material propio/licenciado.
- Redactar condiciones específicas para entrenador, marca blanca, acceso
  delegado y consentimiento del cliente. Esos alcances no forman parte de este
  bloque.

Documentos relacionados:

- [Inventario de tratamiento](./data-processing-inventory.md)
- [Conservación y derechos](./retention-and-rights.md)
- [Respuesta a incidentes](./incident-response.md)
- [Derechos sobre medios](./media-rights.md)
