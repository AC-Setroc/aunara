# Inventario de tratamiento de datos

| Categoría | Ejemplos | Finalidad | Base/decisión | Ubicación y tercero |
| --- | --- | --- | --- | --- |
| Cuenta | Nombre, correo, credencial cifrada, sesión, idioma | Crear, confirmar y proteger la cuenta | Ejecución del servicio y aceptación de términos/política | Supabase Auth, región São Paulo, Brasil |
| Entrenamiento | Rutas, ejercicios, días, series, repeticiones, cargas, favoritos | Guardar planes y progreso | Servicio solicitado por el usuario | Supabase Database, región São Paulo, Brasil; copia local del dispositivo |
| Salud sensible | Fecha de nacimiento, medidas, composición corporal, limitaciones, síntomas, alergias, preferencias nutricionales, energía, estrés y sueño | Personalizar referencias de entrenamiento, recuperación y nutrición | Autorización separada, expresa, opcional y revocable | Supabase Database, región São Paulo, Brasil; copia local del dispositivo |
| Consentimiento | Tipo, decisión, versión, idioma, origen y fecha | Demostrar la decisión del titular | Cumplimiento y trazabilidad | Supabase Database, región São Paulo, Brasil |
| Búsqueda alimentaria | Texto de alimento consultado | Buscar información pública de alimentos | Solicitud puntual del usuario | USDA FoodData Central; no se adjunta el identificador Repbook |

## Otros proveedores y flujos

- OpenAI Sites entrega los archivos de la aplicación web y controla el acceso
  al sitio publicado. La base personal de Repbook permanece en Supabase.
- El navegador conserva una copia local para continuidad de uso. Al cerrar
  sesión o borrar los datos desde el centro de privacidad, Repbook elimina esa
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
