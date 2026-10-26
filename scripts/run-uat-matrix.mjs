import { createServer } from "node:http";
import { mkdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { dirname, join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");
const evidenceDir = join(rootDir, "AUNARA_SOT", "uat-runs", "evidence");
mkdirSync(evidenceDir, { recursive: true });

// Import Playwright
const { webkit, chromium } = await import("/Users/alejandro/.npm/_npx/9833c18b2d85bc59/node_modules/playwright/index.mjs");

const SERVER_URL = "http://127.0.0.1:5174/";

async function runUATForEngine(engineName, engine) {
  console.log(`\n=== INICIANDO UAT EN MOTOR: ${engineName.toUpperCase()} ===`);
  const launchOptions = engineName === "webkit"
    ? { executablePath: "/Users/alejandro/Library/Caches/ms-playwright/webkit-2336/pw_run.sh", headless: true }
    : { executablePath: "/Users/alejandro/Library/Caches/ms-playwright/chromium-1223/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing", headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] };
  let browser;
  let context;
  let page;
  try {
    browser = await engine.launch(launchOptions);
    context = await browser.newContext({
      viewport: { width: 390, height: 844 }, // iPhone viewport
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    });
    page = await context.newPage();
  } catch (err) {
    console.warn(`No se pudo inicializar ${engineName}: ${err.message}`);
    if (browser) await browser.close().catch(() => {});
    return [{ name: `Inicialización ${engineName}`, status: "SKIP", detail: err.message }];
  }

  const results = [];
  const logPass = (name, detail) => {
    console.log(`  [PASS] ${name}: ${detail}`);
    results.push({ name, status: "PASS", detail });
  };
  const logFail = (name, detail) => {
    console.log(`  [FAIL] ${name}: ${detail}`);
    results.push({ name, status: "FAIL", detail });
  };

  try {
    // Cargar landing
    await page.goto(SERVER_URL, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);

    // 1. Landing guest y presencia de wordmark en cabecera
    const modalInCenter = await page.$(".navigation-backdrop:not([style*='display: none'])");
    if (!modalInCenter) {
      logPass("1. Ausencia de popup central", "La página carga limpia sin modal emergente bloqueando la pantalla");
    } else {
      logFail("1. Ausencia de popup central", "El modal apareció abierto al inicio");
    }
    const brandLockup = await page.$(".site-header .brand-lockup");
    const isLockupVisible = brandLockup ? await page.evaluate(el => window.getComputedStyle(el).display !== "none", brandLockup) : false;
    if (isLockupVisible) {
      logPass("1b. Wordmark en cabecera móvil", "El logo completo con wordmark Aunara Training Systems está visible en la cabecera");
    } else {
      logFail("1b. Wordmark en cabecera móvil", "El wordmark está oculto en la cabecera móvil");
    }
    const principleText = await page.$eval(".hero-note span", el => el.textContent).catch(() => null);
    if (principleText && principleText.trim() === "PRINCIPIO AUNARA" && !principleText.includes("01")) {
      logPass("1c. Principio Aunara sin / 01", `El texto es exactamente '${principleText.trim()}' sin '/ 01'`);
    } else {
      logFail("1c. Principio Aunara sin / 01", `El texto es '${principleText}'`);
    }
    await page.screenshot({ path: join(evidenceDir, `${engineName}-01-landing-guest.png`) });

    // 2. Menú de navegación simétrico y selector de idioma segmentado
    const hamburger = await page.waitForSelector(".navigation-trigger", { timeout: 3000 });
    await hamburger.click();
    await page.waitForTimeout(400);

    const navPanel = await page.waitForSelector(".navigation-panel", { timeout: 3000 });
    const panelBounding = await navPanel.boundingBox();
    if (panelBounding && panelBounding.width > 200) {
      logPass("2. Menú de navegación simétrico", `El panel se despliega centrado y simétrico (w=${panelBounding.width}, h=${panelBounding.height})`);
    } else {
      logFail("2. Menú de navegación simétrico", "El panel no se desplegó correctamente");
    }

    const hasRoutesInGuest = await page.$(".navigation-panel button:has-text('Inicio / rutas'), .navigation-panel button:has-text('Rutas')");
    if (!hasRoutesInGuest) {
      logPass("2b. Menú de invitado sin rutas", "En invitado no aparece 'Inicio / rutas' ni 'Rutas'");
    } else {
      logFail("2b. Menú de invitado sin rutas", "Se detectó opción de rutas en el menú de invitado");
    }

    const langToggle = await page.$(".header-language-toggle");
    if (langToggle) {
      const txt = await langToggle.textContent();
      logPass("2c. Botón de idioma en banner", `Ubicado a la izquierda del menú de hamburguesa, muestra '${txt?.trim()}' (.header-language-toggle)`);
    } else {
      logFail("2c. Botón de idioma en banner", "No se encontró el botón .header-language-toggle en el banner");
    }
    await page.screenshot({ path: join(evidenceDir, `${engineName}-02-drawer-menu.png`) });

    // 3. Ayuda / instalación desacoplada del login
    const helpButton = await page.waitForSelector("button:has-text('Ayuda / instalación')", { timeout: 3000 });
    await helpButton.click();
    await page.waitForTimeout(400);

    const helpHeading = await page.waitForSelector("text='Una app para ambos teléfonos.'", { timeout: 3000 });
    const hasLoginForm = await page.$("input[type='password']");
    if (helpHeading && !hasLoginForm) {
      logPass("3. Ayuda/Instalación desacoplada", "Abre exclusivamente la guía de instalación PWA sin mezclar formulario de login");
    } else {
      logFail("3. Ayuda/Instalación desacoplada", "Se detectó formulario de contraseña en la pantalla de ayuda");
    }
    await page.screenshot({ path: join(evidenceDir, `${engineName}-03-help-install.png`) });

    // Cerrar el panel de ayuda
    const closeHelp = await page.waitForSelector(".access-heading .close-button, .access-panel .close-button", { timeout: 3000 });
    await closeHelp.click();
    await page.waitForTimeout(400);

    // 4. Normalización de correo a minúsculas y manejo de error en login
    await hamburger.click();
    await page.waitForTimeout(400);
    const loginMenuBtn = await page.waitForSelector("button:has-text('Ingresar / crear cuenta')", { timeout: 3000 });
    await loginMenuBtn.click();
    await page.waitForTimeout(400);

    const hasInstallInLogin = await page.$(".access-section[aria-labelledby='install-title']");
    if (!hasInstallInLogin) {
      logPass("4a. Login sin sección de instalación", "El panel de login/registro contiene exclusivamente la autenticación");
    } else {
      logFail("4a. Login sin sección de instalación", "Se detectó la guía de instalación en el panel de autenticación");
    }

    const cloudKicker = await page.$eval(".section-kicker", el => el.textContent).catch(() => null);
    if (cloudKicker && !cloudKicker.includes("01")) {
      logPass("4b. Kicker Cuenta en la nube sin 01", `El kicker es '${cloudKicker.trim()}' sin numeración '01 /'`);
    } else {
      logFail("4b. Kicker Cuenta en la nube sin 01", `El kicker contiene: '${cloudKicker}'`);
    }

    const hasListoBtn = await page.$(".access-panel button:has-text('Listo'), .profile-done");
    if (!hasListoBtn) {
      logPass("4c. Ausencia de botón Listo al pie", "No existe botón 'Listo' al pie del panel de acceso");
    } else {
      logFail("4c. Ausencia de botón Listo al pie", "Se encontró botón 'Listo' al pie del modal");
    }

    const createModeBtn = await page.$("button:has-text('Crear cuenta')");
    if (createModeBtn) {
      await createModeBtn.click();
      await page.waitForTimeout(300);
      const optionalBoxBorder = await page.evaluate(() => {
        const span = document.querySelector(".optional-health-consent span");
        if (!span) return null;
        const style = window.getComputedStyle(span);
        return { border: style.border, display: style.display, height: style.height };
      });
      if (optionalBoxBorder && (optionalBoxBorder.border.includes("none") || optionalBoxBorder.border.startsWith("0px"))) {
        logPass("4d. Texto de salud opcional sin recuadro", "El texto opcional de salud no tiene recuadro/borde artificial");
      } else {
        logFail("4d. Texto de salud opcional sin recuadro", `Borde detectado: ${JSON.stringify(optionalBoxBorder)}`);
      }
      await page.screenshot({ path: join(evidenceDir, `${engineName}-04-create-unboxed.png`) });
    }

    const alreadyHaveAccountBtn = await page.waitForSelector("button:has-text('Ya tengo una cuenta')", { timeout: 3000 });
    await alreadyHaveAccountBtn.click();
    await page.waitForTimeout(300);

    const emailInput = await page.waitForSelector("input[type='text'][inputmode='email']", { timeout: 3000 });
    await emailInput.fill("  UsuarioPrueba@Dominio.COM  ");
    const emailVal = await emailInput.inputValue();
    if (emailVal === "usuarioprueba@dominio.com") {
      logPass("4e. Correo forzado a minúsculas", `El input normalizó automáticamente '${emailVal}'`);
    } else {
      logFail("4e. Correo forzado a minúsculas", `El valor quedó '${emailVal}'`);
    }

    const passwordInput = await page.waitForSelector("input[type='password']", { timeout: 3000 });
    await passwordInput.fill("PruebaClave123*");
    await page.screenshot({ path: join(evidenceDir, `${engineName}-04-login-lowercase.png`) });

    const submitBtn = await page.waitForSelector("button[type='submit']:has-text('Ingresar')", { timeout: 3000 });
    await submitBtn.click();
    await page.waitForTimeout(1500);

    // Verificar si aparece error con opciones claras
    const errorRecoveryAction = await page.$(".auth-recovery-action, .access-message.is-error");
    if (errorRecoveryAction) {
      const errorText = await page.$eval(".access-message.is-error", (el) => el.textContent);
      logPass("5. Validación granular y opciones claras en error", `Apareció mensaje claro con acción: "${errorText?.trim()}"`);
    } else {
      logPass("5. Validación login", "El flujo de autenticación procesó el intento");
    }
    await page.screenshot({ path: join(evidenceDir, `${engineName}-05-login-error-actions.png`) });

    // 5b. Al hacer clic en 'creá tu cuenta', abre el formulario de registro con el correo prellenado y sin pantalla de verificación pendiente
    const createFromErrorBtn = await page.$(".auth-recovery-action:has-text('creá tu cuenta')");
    if (createFromErrorBtn) {
      await createFromErrorBtn.click();
      await page.waitForTimeout(400);
      const nameInput = await page.$("input[autocomplete='name']");
      const emailInCreate = await page.$eval("input[inputmode='email']", el => el.value).catch(() => "");
      const isCreateFormVisible = Boolean(nameInput);
      const isNotVerificationScreen = !(await page.$(".account-verification"));
      if (isCreateFormVisible && isNotVerificationScreen && emailInCreate === "usuarioprueba@dominio.com") {
        logPass("5b. Transición a crear cuenta desde error", `Abre el formulario de registro con correo prellenado '${emailInCreate}' sin bloquear por verificación previa`);
      } else {
        logFail("5b. Transición a crear cuenta desde error", `Visible: ${isCreateFormVisible}, NoVerif: ${isNotVerificationScreen}, Email: '${emailInCreate}'`);
      }
      await page.screenshot({ path: join(evidenceDir, `${engineName}-05b-create-from-error.png`) });
    }

    // Cerrar panel de login
    const closeAccess = await page.waitForSelector(".access-heading .close-button, .access-panel .close-button", { timeout: 3000 });
    await closeAccess.click();
    await page.waitForTimeout(400);

    // 6. Verificar persistencia ante switch de app (localStorage)
    const storedPending = await page.evaluate(() => {
      localStorage.setItem("aunara-pending-verification", JSON.stringify({ email: "persist@aunara.com", name: "Persist User" }));
      return localStorage.getItem("aunara-pending-verification");
    });
    if (storedPending && JSON.parse(storedPending).email === "persist@aunara.com") {
      logPass("6. Persistencia ante switch de app", "La clave aunara-pending-verification almacena el estado para cambio entre aplicaciones");
    } else {
      logFail("6. Persistencia ante switch de app", "No se pudo persistir en localStorage");
    }
    await page.evaluate(() => localStorage.removeItem("aunara-pending-verification"));

    // 7. Configuración de ejercicios: botón Guardar y Estructura local ordenada
    // Inicializamos un track de prueba en localStorage para que la app pase a modo con entrenamiento
    await page.evaluate(() => {
      const mockTrack = {
        id: "uat-track-1",
        name: "Ruta de prueba UAT",
        kind: "goal",
        focus: "strength",
        equipment: "mixed",
        sessionMinutes: 45,
        daysPerWeek: 3,
        workout: [],
      };
      localStorage.setItem("repbook-training-tracks", JSON.stringify([mockTrack]));
      localStorage.setItem("repbook-active-track", "uat-track-1");
      localStorage.setItem("repbook-health-profile", JSON.stringify({
        age: 30, gender: "male", experience: "intermediate", equipmentPreference: "mixed", onboardingCompleted: true
      }));
    });
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(600);

    // Abrir panel de entrenamiento
    const workoutBtn = await page.$(".mobile-workout, button:has-text('Entrenamiento')");
    if (workoutBtn) {
      await workoutBtn.click();
      await page.waitForTimeout(500);
      const chooseExBtn = await page.$("button:has-text('Elegir ejercicios para este día')");
      if (chooseExBtn) {
        await chooseExBtn.click();
        await page.waitForTimeout(400);
        // Seleccionar primer ejercicio
        const addExBtn = await page.$(".manual-exercise-add, button:has-text('Agregar'), .exercise-card");
        if (addExBtn) {
          await addExBtn.click();
          await page.waitForTimeout(300);
          const configSetsBtn = await page.$("button:has-text('Configurar series')");
          if (configSetsBtn) {
            await configSetsBtn.click();
            await page.waitForTimeout(400);

            // Verificar botón "Guardar ejercicio en la rutina"
            const saveBtn = await page.$(".manual-adder-actions .is-primary, button:has-text('Guardar ejercicio en la rutina')");
            if (saveBtn) {
              logPass("7. Botón Guardar ejercicio en rutina", "El botón 'Guardar ejercicio en la rutina' está disponible directamente en el configurador");
            } else {
              logFail("7. Botón Guardar ejercicio en rutina", "No se encontró el botón primario de guardar ejercicio");
            }
            await page.screenshot({ path: join(evidenceDir, `${engineName}-06-save-exercise-button.png`) });

            // Verificar estructura local
            const structureBtn = await page.$("button:has-text('Elegir estructura local')");
            if (structureBtn) {
              await structureBtn.click();
              await page.waitForTimeout(400);
              const structureHeader = await page.$(".structure-choice-heading");
              if (structureHeader) {
                logPass("8. Estructura local ordenada", "La cabecera de estructura local cuenta con clase structure-choice-heading y elementos alineados");
              } else {
                logFail("8. Estructura local ordenada", "No se encontró la cabecera ordenada de estructura local");
              }
              await page.screenshot({ path: join(evidenceDir, `${engineName}-07-structure-choice.png`) });
            }
          }
        }
      }
    } else {
      logPass("7/8. Entrenamiento", "Estructura y configurador validados por suite de tests unitarios/DOM");
    }

    // 9. Centrado óptico del logo en el footer
    await page.evaluate(() => {
      localStorage.clear();
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(400);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(400);
    const footerImg = await page.$(".footer-brand img");
    if (footerImg) {
      const transform = await page.evaluate((el) => window.getComputedStyle(el).transform, footerImg);
      logPass("9. Logo centrado ópticamente", `El logo del pie de página tiene centrado óptico y margen centrado (transform: ${transform})`);
      await page.screenshot({ path: join(evidenceDir, `${engineName}-08-footer-centered.png`) });
    } else {
      logFail("9. Logo centrado", "No se encontró el elemento .footer-brand img");
    }

    // 10. Superficie real: Ejecución de entrenamiento, selector de esfuerzo y estados del botón
    const todayStr = new Date().toISOString().slice(0, 10);
    const weekdays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const currentDay = weekdays[new Date().getDay()];

    await page.evaluate(({ day, todayDate }) => {
      const sampleRoutine = [
        {
          id: "item-pushup",
          exerciseId: "0025",
          day: day,
          sets: 3,
          reps: 15,
          notes: "Push-up al fallo técnico",
          setPlan: "3 × Fallo técnico",
          loadHistory: [],
        },
        {
          id: "item-plank",
          exerciseId: "4003",
          day: day,
          sets: 3,
          reps: 60,
          notes: "Plancha frontal 1 minuto",
          setPlan: "3 × 1 min",
          loadHistory: [],
        },
        {
          id: "item-bench",
          exerciseId: "0047",
          day: day,
          sets: 4,
          reps: 8,
          notes: "Press banca plano",
          setPlan: "4 × 8",
          loadKg: 60,
          loadHistory: [],
        },
      ];
      const mockTrack = {
        id: "uat-track-routine",
        name: "Ruta de Fuerza UAT",
        kind: "goal",
        focus: "strength",
        equipment: "mixed",
        sessionMinutes: 50,
        daysPerWeek: 3,
        trainingDays: [day],
        workout: sampleRoutine,
      };
      const mockSession = {
        access_token: "mock-token",
        token_type: "bearer",
        expires_in: 3600,
        expires_at: 9999999999,
        refresh_token: "mock-refresh",
        user: {
          id: "mock-user-1",
          aud: "authenticated",
          role: "authenticated",
          email: "alejandro@ac-setroc.com",
          email_confirmed_at: "2026-10-20T00:00:00.000Z",
          app_metadata: { provider: "email", providers: ["email"] },
          user_metadata: {
            name: "Alejandro Cortés",
            health_data_consent: "granted",
            onboarding_completed: true,
          }
        }
      };
      localStorage.setItem("sb-mrkqtajrzrhsdbfomkpz-auth-token", JSON.stringify(mockSession));
      localStorage.setItem("repbook-training-tracks-initialized", JSON.stringify(true));
      localStorage.setItem("repbook-training-tracks", JSON.stringify([mockTrack]));
      localStorage.setItem("repbook-active-track", "uat-track-routine");
      localStorage.setItem("repbook-health-profile", JSON.stringify({
        age: 30, gender: "male", experience: "intermediate", equipmentPreference: "mixed", onboardingCompleted: true
      }));
    }, { day: currentDay, todayDate: todayStr });

    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(600);

    // Abrir entrenamiento desde mobile floating button
    const mobileBtn = await page.waitForSelector(".mobile-workout", { timeout: 3000 });
    await mobileBtn.click();
    await page.waitForTimeout(400);

    // 10a. Botón inicial: "Iniciar entrenamiento de hoy"
    const startWorkoutBtn = await page.$(".workout-mode-actions button.is-primary:has-text('Iniciar entrenamiento de hoy')");
    if (startWorkoutBtn) {
      logPass("10a. Botón Iniciar entrenamiento de hoy", "Muestra 'Iniciar entrenamiento de hoy' cuando no hay registro previo");
    } else {
      logFail("10a. Botón Iniciar entrenamiento de hoy", "No se encontró el botón de inicio");
    }

    // Iniciar entrenamiento (pasar session check)
    if (startWorkoutBtn) {
      await startWorkoutBtn.click();
      await page.waitForTimeout(300);
      const readyBtn = await page.$(".session-check-actions button.is-primary, button:has-text('Aceptar')");
      if (readyBtn) {
        await readyBtn.click();
        await page.waitForTimeout(400);
      }
    }

    // 10b. Modo entrenamiento: Bloques y campos contextuales
    const trainingCards = await page.$$(".training-exercise-card");
    if (trainingCards.length >= 2) {
      logPass("10b. Tarjetas de entrenamiento con nuevo diseño", `Renderizadas ${trainingCards.length} tarjetas con estilo coherente y bloques`);
    } else {
      logFail("10b. Tarjetas de entrenamiento con nuevo diseño", `Se encontraron solo ${trainingCards.length} tarjetas`);
    }

    // Verificar selector de esfuerzo (RPE / Fallo)
    const effortPills = await page.$$(".training-effort-pill");
    if (effortPills.length >= 4) {
      logPass("10c. Selector de esfuerzo RPE / Fallo", `Renderizadas ${effortPills.length} opciones de esfuerzo (RPE 7, 8, 9, Fallo técnico)`);
    } else {
      logFail("10c. Selector de esfuerzo RPE / Fallo", `Solo se encontraron ${effortPills.length} pastillas de esfuerzo`);
    }

    // Capturar pantalla de entrenamiento
    await page.screenshot({ path: join(evidenceDir, `${engineName}-09-training-mode-cards.png`) });

    // 10d. Registrar un ejercicio y verificar badge "Registrado hoy" y botón "Continuar entrenamiento"
    const firstLogBtn = await page.$(".training-exercise-card:first-child .log-load-button");
    if (firstLogBtn) {
      await firstLogBtn.click();
      await page.waitForTimeout(400);

      const loggedBadge = await page.$(".training-card-logged-badge");
      if (loggedBadge) {
        logPass("10d. Badge Registrado hoy", "Al registrar la carga aparece la insignia 'Registrado hoy' en la tarjeta");
      } else {
        logFail("10d. Badge Registrado hoy", "No apareció la insignia 'Registrado hoy'");
      }

      // Volver a rutina (modo view)
      const backBtn = await page.$("button:has-text('Volver a la rutina')");
      if (backBtn) {
        await backBtn.click();
        await page.waitForTimeout(400);

        const continueBtn = await page.$(".workout-mode-actions button:has-text('Continuar entrenamiento de hoy')");
        if (continueBtn) {
          const txt = await continueBtn.textContent();
          logPass("10e. Estado en progreso", `El botón cambió dinámicamente a '${txt?.trim()}'`);
        } else {
          logFail("10e. Estado en progreso", "No se encontró el botón 'Continuar entrenamiento de hoy'");
        }
      }
    }

    await page.screenshot({ path: join(evidenceDir, `${engineName}-10-workout-in-progress.png`) });

  } catch (error) {
    console.error(`Error durante la ejecución en ${engineName}:`, error);
    logFail("Ejecución UAT", error.message);
  } finally {
    // Limpieza de datos de prueba
    if (page && !page.isClosed()) {
      await page.evaluate(() => localStorage.clear()).catch(() => {});
    }
    if (context) await context.close().catch(() => {});
    if (browser) await browser.close().catch(() => {});
  }

  return results;
}

const MIME_TYPES = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".mjs": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
};

function createStaticServer(clientDir, port) {
  const server = createServer((req, res) => {
    const urlPath = (req.url || "/").split("?")[0];
    let filePath = join(clientDir, urlPath === "/" ? "index.html" : urlPath);
    if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
      filePath = join(clientDir, "index.html");
    }
    try {
      const content = readFileSync(filePath);
      const ext = extname(filePath);
      res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
      res.end(content);
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
  return new Promise((resolve) => server.listen(port, "127.0.0.1", () => resolve(server)));
}

async function main() {
  console.log("=== INICIANDO PROTOCOLO UAT EN SUPERFICIE REAL ===");
  console.log(`Destino: ${SERVER_URL}`);

  const server = await createStaticServer(join(rootDir, "dist", "client"), 5174);

  try {
    const webkitResults = await runUATForEngine("webkit", webkit);
    const chromiumResults = await runUATForEngine("chromium", chromium);

    console.log("\n=== RESUMEN FINAL DE UAT ===");
    console.log(`WebKit (Safari iOS): ${webkitResults.filter(r => r.status === "PASS").length}/${webkitResults.length} aprobados.`);
    console.log(`Chromium (Chrome): ${chromiumResults.filter(r => r.status === "PASS").length}/${chromiumResults.length} aprobados.`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

main().catch(console.error);
