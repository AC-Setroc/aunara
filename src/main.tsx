import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const root = createRoot(document.getElementById("root")!);
let language: "es" | "en" = navigator.language.toLowerCase().startsWith("en") ? "en" : "es";

root.render(
  <StrictMode>
    <main className="app-shell" lang={language}>
      <section className="access-panel" role="status">
        <h1>{language === "en" ? "Loading Aunara…" : "Cargando Aunara…"}</h1>
      </section>
    </main>
  </StrictMode>,
);

function showStartupFailure(readBlocked: boolean) {
  const english = language === "en";
  root.render(
    <StrictMode>
      <main className="app-shell" lang={language}>
        <section className="access-panel" role="alert" aria-labelledby="startup-title">
          <h1 id="startup-title">{readBlocked
            ? (english ? "Aunara could not start" : "No se pudo iniciar Aunara")
            : (english ? "Aunara could not load" : "No se pudo cargar Aunara")}</h1>
          <p>{readBlocked
            ? (english
              ? "This browser does not allow storage to be read. Check the site permissions and reload. Do not delete your data to try to resolve this."
              : "Este navegador no permite leer el almacenamiento. Revisá los permisos del sitio y recargá. No borres tus datos para intentar resolverlo.")
            : (english ? "Reload to try again." : "Recargá para volver a intentar.")}</p>
          <div className="access-account" role="group" aria-label={english ? "Language" : "Idioma"}>
            <button type="button" lang="es" aria-label="Español" aria-pressed={!english} onClick={() => { language = "es"; showStartupFailure(readBlocked); }}>ES</button>
            <button type="button" lang="en" aria-label="English" aria-pressed={english} onClick={() => { language = "en"; showStartupFailure(readBlocked); }}>EN</button>
          </div>
          <div className="access-account">
            <button type="button" onClick={() => window.location.reload()}>{english ? "Reload" : "Recargar"}</button>
          </div>
        </section>
      </main>
    </StrictMode>,
  );
}

// Only module loading is caught. Rendering and later App/Auth errors are not
// reclassified as storage failures, and a failed module is never retried here.
void import("./App").then(
  ({ default: App }) => root.render(<StrictMode><App /></StrictMode>),
  () => {
    let readBlocked = false;
    try {
      // Read-only diagnostic: never inspect user keys or alter persistent data.
      window.localStorage.getItem("aunara-startup-read-check");
    } catch {
      readBlocked = true;
    }
    showStartupFailure(readBlocked);
  },
);

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, {
      scope: import.meta.env.BASE_URL,
    }).catch(() => {
      // The app remains fully usable online if offline installation is unavailable.
    });
  });
}
