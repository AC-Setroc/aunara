import { Menu, X } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { tr } from "../lib/i18n";
import type { LanguageCode } from "../types";

interface NavigationMenuProps {
  language: LanguageCode;
  entries: { label: string; action: () => void }[];
  /** Header controls rendered between the logo and the hamburger (the hamburger stays the last control). */
  controls?: ReactNode;
  /** Controls that live inside the menu panel, before the destinations. */
  panelContent?: ReactNode;
  /** Single click toggle for language in header banner. */
  onToggleLanguage?: () => void;
}

export function NavigationMenu({ language, entries, controls, panelContent, onToggleLanguage }: NavigationMenuProps) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const panel_ = useRef<HTMLDivElement>(null);
  function close() {
    setOpen(false);
    trigger.current?.focus();
  }
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel_.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); close(); }
      if (event.key !== "Tab") return;
      const buttons = panel_.current?.querySelectorAll<HTMLButtonElement>("button");
      if (!buttons?.length) return;
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", keydown);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", keydown); };
  }, [open]);
  const toggle = (button: HTMLButtonElement) => {
    trigger.current = button;
    setOpen((value) => !value);
  };
  // The panel is portaled to <body>: the sticky header uses backdrop-filter, which makes it the containing block of any
  // position:fixed descendant (SDD-012 S12-01), and the header's own nav styles would otherwise reach the panel.
  const panel = open && createPortal(
    <div className="navigation-backdrop" onClick={(event) => { if (event.target === event.currentTarget) close(); }}>
      <div id="aunara-navigation" className="navigation-panel" ref={panel_} role="dialog" aria-modal="true" aria-label={tr(language, "Navigation", "Navegación")}>
        <button type="button" aria-label={tr(language, "Close navigation", "Cerrar navegación")} onClick={close}><X size={20} /></button>
        {panelContent}
        <nav aria-label={tr(language, "Destinations", "Destinos")}>
          {entries.map((entry) => <button key={entry.label} type="button" onClick={() => { close(); entry.action(); }}>{entry.label}</button>)}
        </nav>
      </div>
    </div>,
    document.body,
  );
  return <div className="shared-navigation">
    <button className="brand" type="button" aria-label={tr(language, "Aunara navigation", "Navegación de Aunara")} aria-expanded={open} aria-controls="aunara-navigation" onClick={(event) => toggle(event.currentTarget)}>
      <div className="brand-lockup-wrapper">
        <img className="brand-lockup" src={`${import.meta.env.BASE_URL}brand/aunara-training-systems.svg`} alt="Aunara Training Systems" />
        <span className="brand-version-tag">{tr(language, "test version 0.0.1", "versión de prueba 0.0.1")}</span>
      </div>
      <img className="brand-symbol" src={`${import.meta.env.BASE_URL}brand/aunara-symbol.svg`} alt="" aria-hidden="true" />
    </button>
    {controls}
    {onToggleLanguage && (
      <button
        className="header-language-toggle"
        type="button"
        onClick={onToggleLanguage}
        aria-label={tr(language, "Switch to Spanish", "Cambiar a inglés")}
      >
        {language.toUpperCase()}
      </button>
    )}
    <button className="navigation-trigger" type="button" aria-label={tr(language, "Open navigation", "Abrir navegación")} aria-expanded={open} aria-controls="aunara-navigation" onClick={(event) => toggle(event.currentTarget)}><Menu size={22} /></button>
    {panel}
  </div>;
}
