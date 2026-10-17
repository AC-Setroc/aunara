# UAT 2026-10-13 — resultados del Operator y clasificación inicial

`[AUNARA/codex · modelo no expuesto]` · Reportado por Alejandro, 2026-10-13 (America/Bogota).

## Resultado y autoridad

**UAT NO APROBADA; publicación no autorizada.** Se registran todas las observaciones recibidas. No son reproducciones independientes de Codex ni causas raíz confirmadas. La revisión técnica anterior sigue siendo evidencia histórica, no sustituye estos resultados humanos.

Orden de esta iteración: procesar el feedback, informar qué queda fuera de la etapa y subir contexto al repo para continuar también con Claude Code. **Cero correcciones de aplicación, configuración, datos, SMTP, Auth, dependencias, workflows o producción.** Correcciones no triviales vuelven a Spec/enmienda y aprobación antes de implementar.

## Entorno: evitar mezclar dev y producción

- Base de UAT preparada: dev remoto `1f6a99e`, copia aislada `/private/tmp/aunara-uat-20261012.SycXHP/repo`, puerto 5173. El commit local posterior `e7d8f09` solo documenta su arranque.
- El Operator confirma que **confirmación y recuperación llevaron a producción**, no a dev; la rutina guardada se conservó. No se conoce qué captura/paso pertenece a cada origen ni en qué punto retornó a localhost. No atribuir todas las observaciones al código de dev ni descartarlas por esto.
- Capturas de footer autenticado y perfil muestran presentación anterior: «Entrená para poder», sin crédito; dev contiene «Tu propósito marca el camino», crédito y NavigationMenu. Es indicio de versión distinta, no prueba concluyente de caché ni causa raíz.
- Próxima reproducción: anotar URL visible, navegador, tamaño, idioma, sesión y build para cada hallazgo; verificar separadamente dev y prod, sin limpiar datos del usuario.
- Cuenta/correos/datos reales: recepción de confirmación reportada por el Operator. Esto **no** cierra entrega de recuperación, remitente de marca ni retorno a dev.

## Registro completo

Leyenda: **Dentro** = obligación de 002/003/004/006 que debe contrastarse en dev; **Cambio** = petición nueva a especificar; **Separado** = decisión/backend/metodología o entrega futura. Prioridad P1 = pérdida aparente, acceso o flujo central; P2 = presentación/usabilidad. Todos abiertos salvo el hecho de recepción reportado.

| ID | Observación del Operator | Clasificación y siguiente comprobación |
|---|---|---|
| UAT13-01 | Slogan desalineado horizontalmente en ES/EN. | P2 Dentro, footer 002/004/006. Revisar alineación óptica del logo, no solo cajas CSS; desktop y móvil. |
| UAT13-02 | «Desarrollado por» y wordmark/logo desalineados. | P2 Dentro. Crédito horizontal con armonía; comprobar ambos idiomas/tamaños. |
| UAT13-03 | Menú sin cambios solicitados. | P1 Dentro, CA06-02. Dev usa logo + hamburguesa y menú compartido; confirmar origen y todas las entradas autenticadas. `src/App.tsx:663–674`, `NavigationMenu.tsx`. |
| UAT13-04 | Correo inexistente recibe mensaje de credenciales incorrectas, no de cuenta inexistente. | Separado: mensaje genérico es el contrato actual de 003 E1; 004 difirió checker autoritativo. No inferir inexistencia de invalid_credentials ni recovery200. Requiere diseño seguro/backend y aprobación; no lookup público automático. |
| UAT13-05 | Opcional ya alineado, pero se pide otro color y quitar recuadro. | P2 Cambio visual. Registrar mejora de alineación reportada; especificar color accesible y vínculo etiqueta/check sin tocar alcance del consentimiento. |
| UAT13-06 | Reenviar confirmación solo visible con hover. | P1 Dentro. Contraste normal/hover/focus, enabled/disabled, teclado, ES/EN, desktop/móvil. Captura muestra botón sin texto visible. |
| UAT13-07 | Correo llega desde Supabase, sin marca Aunara. | Separado SMTP/plantillas/dominio. Confirmación recibida reportada; noreply proveedor presente, no noreply propio. Remitente propio seguía diferido; no alterar proveedor/DNS. |
| UAT13-08 | Propuesta debe decir «Editar», no «Aceptar y editar». | P2 Cambio de texto y semántica: aclarar si edición trabaja borrador sin aceptación/guardado implícito. Dev aún tiene copy anterior (`InitialRoutineProposal.tsx:194`). |
| UAT13-09 | Solo seis movimientos en propuesta, sin días, grupos musculares ni ejercicios por día. | P1 Dentro: distribución visible por día ya exigida en 004/006; dev contiene agrupación (`InitialRoutineProposal.tsx:53–57`). Grupos musculares: detallar presentación deseada. Confirmar URL/build antes de reparar. |
| UAT13-10 | Editor tiene un ejercicio por día pese a activo/intermedio. | P1 Separar generación metodológica de distribución UI. Revisar entradas reales y propuesta; no inventar dosis clínica ni aumentar volumen automáticamente. Reglas/metodología dependen de Danny; no cerrar por solo arreglar agrupación. |
| UAT13-11 | «Iniciar mi rutina de hoy»: control de seguridad sin Iniciar; se piden opciones actuales, texto «Otro», Revisar e Iniciar. | P1 Cambio, ejecución futura SDD-007 y seguridad metodológica. Determinar flujo de revisión y bloqueo de alertas; «Otro» no debe permitir saltar seguridad. No implementación de sesión en esta etapa. |
| UAT13-12 | ¿Dónde queda guardada carga del día? | Consulta/usabilidad. Hoy `WorkoutItem.loadHistory`: fecha, kg, nota y plan, dentro del ejercicio de la ruta. Ver explicación abajo; no es ejecución por serie. |
| UAT13-13 | Footer autenticado sin desarrollado por; privacidad/términos desalineados. | P2 Dentro 002/004/006. Dev footer común (`App.tsx:945–957`) contiene crédito; captura autenticada muestra slogan antiguo. Repro en origen identificado. |
| UAT13-14 | Perfil sin privacidad/preferencias ni eliminar datos. | P1 Separar destinos: contrato 006 sitúa privacidad en **Cuenta / privacidad**, no dentro de Perfil. Preferencias sí deben ser editables en Perfil. Si se pide acceso directo desde Perfil, cambio adicional; ausencia global no cumple. |
| UAT13-15 | Texto de privacidad/términos desaparece al hover. | P2 Dentro. Probar todos los footers/paneles, contraste normal/hover/focus en ES/EN. |
| UAT13-16 | No encuentra eliminar cuenta ni datos. | P1 Dentro CA06-03/04, acciones en Cuenta / privacidad. Repro navegación autenticada; no ejecutar borrado de cuenta personal ni crear UI redundante por suposición. |
| UAT13-17 | No puede agregar ejercicios desde recuadro de cada día. | P1 Dentro flujo manual por día 004/006. Confirmar día activo, CTA y agregar mono/bis/triserie sin cambiar días vecinos. |
| UAT13-18 | «abdominales» filtra grupo completo, no específicos; «sit up» sí. | P2 Aclarar intención. Buscador actual admite nombre/músculo/tipo/equipo: palabra de grupo puede devolver todo el grupo. Necesita especificar sinónimos para ejercicio abdominal concreto; no considerar automáticamente incorrecto el filtro por músculo. |
| UAT13-19 | Series duplicadas en texto fijo y controles. | P2 Dentro: 004/006 excluyen «Plan de series» redundante del editor. Captura muestra presentación vieja; verificar dev y compatibilidad de prescripciones legadas. |
| UAT13-20 | Sin logout. | P1 Dentro CA06-02/03. Dev contiene «Salir» cuando cloud.email existe (`App.tsx:674`). Confirmar sesión y menú/origen; no tomar ausencia en captura de perfil como prueba de ausencia global. |
| UAT13-21 | Confirmación y recuperación retornan prod; rutina conservada. | P1 Entorno Auth separado. `useCloudSync.ts` pide origen actual vía emailRedirectTo/redirectTo; allowlist/Site URL efectivos no comprobados aquí. No afirmar causa sin reinspección. Retorno a dev pendiente; conservación reportada no equivale a persistencia completa. |
| UAT13-22 | Cambiar principiante→intermedio en Resumen, pasar Cuerpo y salud: vuelve a principiante; con Listo sí guarda. Preferencias de entrenamiento no guardan. | P1 Dentro 004 perfil editable/persistencia; tratar cambio entre pestañas y guardado de preferencias como dos reproducciones. Registrar acciones de guardar, cierre/reapertura/recarga/sync y dos navegadores. No atribuir automáticamente a H-03: es riesgo conocido, no causa demostrada. |

## Carga actual: evidencia de código, no verificación de la cuenta

`src/components/WorkoutPanel.tsx:507–521` llama «Registrar carga de hoy» y muestra última carga. `src/App.tsx:486–487` registra fecha UTC `toISOString().slice(0,10)`; `src/lib/exercises.ts:439–453` añade entrada a `loadHistory` sin reemplazar historia. `src/types.ts:125–131` define sus campos. Ruta guardada localmente en `repbook-training-tracks` (`App.tsx:151`) y incluida en snapshot nube (`App.tsx:157` en adelante). Sin comprobar la fila/cuenta del Operator, no se afirma guardado remoto exitoso. Cambiar carga de referencia **no equivale** a pulsar registrar. Historial por sesión/serie, fecha local y navegación de progreso pertenecen al diseño de SDD-007; no hay que reinterpretar legacy como series realizadas.

## Orden propuesto para continuar (sin autorización de código)

1. Confirmar entorno por paso y retorno del correo: repetir casos clave en dev tras login allí; conservar reporte de prod aparte. No publicar para resolver mezcla.
2. Persistencia/preferencias UAT13-22; navegación, cuenta/privacidad/logout UAT13-03/14/16/20. Riesgo alto, evidencia antes de fix.
3. Reenvío/hover/footer UAT13-01/02/06/13/15; cambios visuales 05 aparte. Revisión desktop/móvil ES/EN en Chromium y WebKit, Safari real donde corresponda.
4. Propuesta/editor UAT13-08/09/17/19; generación/dosis 10 separado con Danny. Buscador 18 requiere intención concreta.
5. Entrega futura SDD-007: sesión, Iniciar/Otro, registro/historial; remitente y checker en decisiones independientes.

## Evidencia y privacidad

13 capturas adjuntas revisadas en el chat: footer ES/EN, acceso, error de credenciales, consentimiento, confirmación, correo recibido, propuesta, editor, control de seguridad, footer autenticado, perfil y búsqueda. Contienen correo/nombre/datos corporales. **No subir originales al repo público**, no copiar credenciales, enlaces de confirmación/recuperación, tokens, correos personales ni valores de salud al reporte. Una eventual evidencia pública requiere versión sanitizada y revisión específica. Este documento conserva observaciones sin esos valores.

## Handoff a Code/Codex

Leer este reporte, estado/pendientes y guion de UAT antes de seguir. Mantener APPROVED técnico separado de NO APROBADA humana. No rehacer candidatos ni sobrescribir canónico dirty. No tocar main, reference, .env, archive, legal, H-03, workflows ni dependencias. Preparar alcance/spec tras reproducción; no usar este registro como autorización para implementar todos los pedidos. Publicación requiere orden nueva.
