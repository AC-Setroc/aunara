const states = {
  onboarding: {
    welcome: "Empecemos por vos.",
    copy: "Antes de sugerirte algo, Aunara necesita conocer tu punto de partida.",
    status: "6 MINUTOS",
    title: "Completá tu contexto inicial",
    description: "Objetivo · experiencia · disponibilidad · equipo",
    primary: "Completar mi punto de partida",
    secondary: "Saber por qué pedimos estos datos",
    noteTitle: "Tus datos, tus decisiones",
    noteCopy: "Podés continuar con una ruta básica si no autorizás datos sensibles.",
    transparency: "Aunara todavía no generó una rutina ni interpretó información clínica.",
  },
  proposal: {
    welcome: "Tu punto de partida ya habla.",
    copy: "Prepará una ruta que tenga sentido antes de convertirla en compromiso.",
    status: "REQUIERE TU DECISIÓN",
    title: "Revisá tu propuesta inicial",
    description: "Fuerza · 4 días · 50 min · Equipo mixto",
    primary: "Revisar propuesta",
    secondary: "Ver los datos y reglas utilizados",
    noteTitle: "Nada se activa en silencio",
    noteCopy: "Podés aceptar, editar o descartar la propuesta completa.",
    transparency: "La propuesta usa reglas versionadas. El texto libre de salud no se interpreta médicamente.",
  },
  training: {
    welcome: "Hoy cuenta.",
    copy: "Tu plan se adapta a lo que podés hacer hoy.",
    status: "LISTO PARA HOY",
    title: "Entrená tren inferior",
    description: "6 movimientos · 55 min · Gimnasio",
    primary: "Iniciar entrenamiento",
    secondary: "Ver la sesión antes de empezar",
    noteTitle: "Antes de empezar",
    noteCopy: "Contanos cómo llegás para ajustar la sesión sin cambiar tu propósito.",
    transparency: "Esta sesión viene de tu ruta aceptada. No cambia por un único dato.",
  },
  rest: {
    welcome: "Recuperar también es entrenar.",
    copy: "Hoy no necesitás sumar otra sesión para seguir avanzando.",
    status: "DÍA DE RECUPERACIÓN",
    title: "Prepará tu próxima sesión",
    description: "Mañana · Tren superior · 48 min",
    primary: "Ver próxima sesión",
    secondary: "Registrar cómo me siento",
    noteTitle: "Sin compensaciones",
    noteCopy: "Una sesión omitida no se duplica automáticamente ni se castiga.",
    transparency: "El descanso forma parte de la distribución aprobada de tu semana.",
  },
  invite: {
    welcome: "Seguís teniendo el control.",
    copy: "Tu modo personal continúa mientras decidís si querés vincularte.",
    status: "INVITACIÓN PENDIENTE",
    title: "Revisá la invitación de Heurofit",
    description: "Entrenador: Juan · Acceso solicitado: rutina y progreso",
    primary: "Revisar invitación y permisos",
    secondary: "Ahora no",
    noteTitle: "Aceptar es voluntario",
    noteCopy: "Podés elegir qué compartir, rechazar o retirar el acceso después.",
    transparency: "El entrenador no ve datos privados hasta que aceptes permisos específicos.",
  },
};

const $ = (selector) => document.querySelector(selector);
const dialog = $("#prototype-dialog");

function setState(stateName) {
  const state = states[stateName];
  if (!state) return;

  $("#welcome-title").textContent = state.welcome;
  $("#welcome-copy").textContent = state.copy;
  $("#status-pill").textContent = state.status;
  $("#next-step-title").textContent = state.title;
  $("#next-step-description").textContent = state.description;
  $("#primary-action span").textContent = state.primary;
  $("#secondary-action").textContent = state.secondary;
  $("#context-note strong").textContent = state.noteTitle;
  $("#context-note span").textContent = state.noteCopy;
  $("#transparency-copy").textContent = state.transparency;

  document.querySelectorAll("[data-state]").forEach((button) => {
    const selected = button.dataset.state === stateName;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });

  const isTraining = stateName === "training";
  $("#session-map").hidden = !isTraining;
  $("#readiness-card").hidden = stateName === "onboarding" || stateName === "proposal" || stateName === "invite";
}

document.querySelectorAll("[data-state]").forEach((button) => {
  button.addEventListener("click", () => setState(button.dataset.state));
});

document.querySelectorAll(".energy-scale button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".energy-scale button").forEach((candidate) => candidate.classList.remove("is-selected"));
    button.classList.add("is-selected");
  });
});

function openPrototypeDialog(title, copy) {
  $("#dialog-title").textContent = title;
  $("#dialog-copy").textContent = copy;
  dialog.showModal();
}

$("#primary-action").addEventListener("click", (event) => {
  openPrototypeDialog(event.currentTarget.textContent.trim(), "Este prototipo valida jerarquía y navegación. El flujo real se conectará solo después de aprobar diseño y metodología.");
});

$("#secondary-action").addEventListener("click", (event) => {
  openPrototypeDialog(event.currentTarget.textContent.trim(), "La versión implementada abrirá el detalle correspondiente sin sacar al usuario de su contexto actual.");
});

$("#transparency-button").addEventListener("click", () => {
  openPrototypeDialog("Qué está usando Aunara", "Objetivo, experiencia, días, duración, equipo, restricciones estructuradas y la versión de reglas. Las notas libres no se interpretan clínicamente.");
});

setState("training");
