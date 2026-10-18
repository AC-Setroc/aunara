# UAT17 — resultados del Operator (sanitizado)

2026-10-17 · `[AUNARA/codex · modelo no expuesto]` · **UAT NO APROBADA; correcciones propuestas, no implementadas.**

Este registro conserva el contenido funcional del reporte del Operator sin imágenes originales, correos personales, encabezados crudos, URLs de autenticación ni tokens. No da por aprobados otros casos del guion de28 por no mencionarse aquí. Las aprobaciones locales013/014 y el verde015/016 no sustituyen aceptación humana.

| ID | Resultado reportado / siguiente acción |
| --- | --- |
| U17-01 | Footer blanco demasiado alto. Compactar sin ocultar contenido ni taparlo con controles fijos. |
| U17-02 | Slogan debe centrarse ópticamente bajo símbolo+wordmark completos, no solo canvas/palabra. |
| U17-03 | Guest: Inicio primero, luego Rutas, luego Ingresar, luego Ayuda/instalación; no Inicio duplicado. |
| U17-04 | Idioma con botón toggle ES/EN arriba derecha, entre wordmark e Inicio; no select nativo. Ubicación exacta propuesta en cabecera del drawer pendiente de aprobación. |
| U17-05 | Opcional de salud sin recuadro y conservando texto de color; no cambiar consentimiento ni obligatoriedad. |
| U17-06 | Confirmación y recuperación reales siguen Supabase default y retornan a producción. Objetivo: Aunara noreply de Zoho, templates014 existentes y regreso al origen solicitante. Falla abierta, causa final no acreditada; no correo activado por git. |
| U17-07 | Servidor5173 sin listener según diagnóstico de coordinación de esta ronda. Restauración/verificación pendiente de recibo actual; la causa de la caída no está probada. |

[SDD-017](../sdd/SDD-017-uat17-presentacion-y-retorno.md) propone alcance local y gates independientes de retorno/correo global. No se cambió Supabase, remitente, SMTP, plantillas remotas, DNS, cuentas ni datos en esta ronda documental. Main/producción no publicados; ningún PASS real de correo/retorno/Safari físico nuevo.
