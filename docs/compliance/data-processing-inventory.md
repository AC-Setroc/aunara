# Inventario de tratamiento de datos

| Categoría | Ejemplos | Finalidad | Base/decisión | Ubicación y tercero |
| --- | --- | --- | --- | --- |
| Cuenta | Nombre, correo, credencial cifrada, sesión, idioma | Crear, confirmar y proteger la cuenta | Ejecución del servicio y aceptación de términos/política | Supabase Auth, región São Paulo, Brasil |
| Entrenamiento | Rutas, ejercicios, días, series, repeticiones, cargas, favoritos | Guardar planes y progreso | Servicio solicitado por el usuario | Supabase Database, región São Paulo, Brasil; copia local del dispositivo |
| Salud sensible | Fecha de nacimiento, medidas, composición corporal, limitaciones, síntomas, alergias, preferencias nutricionales, energía, estrés y sueño | Personalizar referencias de entrenamiento, recuperación y nutrición | Autorización separada, expresa, opcional y revocable | Supabase Database, región São Paulo, Brasil; copia local del dispositivo |
| Consentimiento | Tipo, decisión, versión, idioma, origen y fecha | Demostrar la decisión del titular | Cumplimiento y trazabilidad | Supabase Database, región São Paulo, Brasil |
| Búsqueda alimentaria | Texto de alimento consultado | Buscar información pública de alimentos | Solicitud puntual del usuario | USDA FoodData Central; no se adjunta ningún identificador de la cuenta Aunara |

## Otros proveedores y flujos

- GitHub Pages entrega los archivos estáticos de la aplicación web desde el
  repositorio público `AC-Setroc/aunara`. El sitio es público; no existe control
  de acceso en el hosting. Los datos personales no pasan por GitHub: viajan del
  navegador a Supabase. Plazos de logs y respaldos de GitHub no verificados.
- El dominio `aunaratraining.com` está registrado en GoDaddy, que presta la zona
  DNS. La aplicación no le envía datos personales por diseño; sus registros de
  resolución DNS no fueron auditados.
- Almacenamiento del navegador, según inventario observado el 2026-10-01 en una
  visita invitada (SDD-002): claves locales de preferencias y estado con prefijo
  `repbook-` (nombre interno heredado, no marca visible), información de sesión
  que el SDK de Supabase conserva al iniciar sesión, y Cache API del service
  worker para recursos de la aplicación. No se observaron cookies en esa visita.
  La sesión autenticada no fue inventariada; esta descripción no afirma ausencia
  absoluta de cookies.
- El navegador conserva una copia local para continuidad de uso. Al cerrar
  sesión o borrar los datos desde el centro de privacidad, Aunara elimina esa
  copia del dispositivo actual.
- Las sugerencias actuales se generan mediante reglas locales de la aplicación
  y el conjunto de ejercicios; no se envía el perfil del usuario a una cuenta
  personal de ChatGPT para generar cada rutina.

## Verificaciones operativas pendientes

- Conservar copia vigente de los términos y anexos de tratamiento de cada
  proveedor.
- Confirmar el ciclo exacto de eliminación de respaldos y subencargados.
- Revisar contractualmente la transmisión Colombia–Brasil antes del lanzamiento
  comercial.
- Revaluar el inventario antes de habilitar entrenadores, clientes o marca
  blanca, porque implicarán acceso delegado y nuevas finalidades.
