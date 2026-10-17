# UAT en Mac — entorno iniciado, validación manual pendiente

2026-10-12 · `[AUNARA/codex · modelo no expuesto]`.

- Autorización: «Dale» para continuar desde el handoff de Claude; sin cambios de aplicación ni publicación.
- Remoto verificado: `dev` = `1f6a99e6705e51c47f038f917642e18df319fcd2`; `main` = `dfffa873a2a29ee1535c49149f92a734c873923d`. El delta de main sobre `1c709a3` contiene solo cinco documentos de evidencia del dominio, ningún cambio de aplicación.
- La carpeta canónica permanece en `codex/aunara-rebrand`, HEAD `1c709a3`, con cambios anteriores y archivos no versionados. No coincide con el checkout limpio del handoff. Se preservó íntegra: sin checkout, stash, reset, pull ni edición allí.
- Copia aislada de dev: `/private/tmp/aunara-uat-20261012.SycXHP/repo`. Se clonó el repo existente; no se creó ningún repo remoto. Metodología actualizada con fast-forward (sin novedades).
- Lockfiles idénticos; dependencias existentes reutilizadas mediante enlace local a node_modules. Vite usa envDir de la carpeta canónica: no se copió ni mostró `.env.local`. Sin instalación ni cambios de dependencias.
- Servidor activo en puerto 5173, host de LAN. Mac: `http://localhost:5173/`; Wi-Fi: `http://192.168.68.101:5173/`; segunda interfaz anunciada: `http://192.168.40.2:5173/`. La conectividad desde iPhone no fue comprobada.
- Navegador integrado abierto: título Aunara, menú, ES/EN, Ingresar, aviso de almacenamiento, hero y slogan «Tu propósito marca el camino.» presentes. Comprobación visual de pantalla inicial, no revisión responsive completa. Chrome DevTools no pudo iniciar porque Google Chrome no está instalado en la ruta esperada; se usó el navegador integrado como alternativa.
- No se crearon cuentas, enviaron correos, modificaron datos, autenticación, DNS ni SMTP. Supabase real se usa al entrar con una cuenta: usar cuenta de prueba, no rutina personal.
- Guion vigente: [UAT manual](UAT-2026-10-12-dev-checklist.md). Sus diez escenarios siguen NO PROBADOS por el Operator en esta sesión. Safari/iPhone, consentimiento en UI, correo, dos dispositivos y PWA siguen abiertos. HTTP de LAN no habilita service worker; no adjudicar allí resultados de instalación/offline.
- No se repitieron suites automatizadas ya acreditadas por Claude ni se declararon PASS heredados como verificación nueva. Sin merge, push ni publicación. Este recibo y las tres notas SOT se conservan en commit documental local, no en origin/dev.

Próximo paso: Operator ejecuta el guion con una cuenta de prueba y registra PASA/FALLA/NO PROBADO. Un fallo se documenta; no se corrige durante UAT sin alcance aprobado. H-03, versión legal y SDD-007/008/009 siguen fuera.
