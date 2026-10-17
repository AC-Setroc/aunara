import { ChevronRight, Menu, X } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { tr } from "../lib/i18n";
import type { LanguageCode } from "../types";

interface NavigationMenuProps {
  language: LanguageCode;
  entries: { label: string; action: () => void; icon?: ReactNode; group?: "account" | "settings" | "exit";
    href?: string; ariaLabel?: string; className?: string; active?: boolean; detail?: ReactNode }[];
  /** Persistent controls above the destination list. */
  headerContent?: ReactNode;
  /** Additional settings controls inside the drawer. */
  panelContent?: ReactNode;
}

export function NavigationMenu({ language, entries, headerContent, panelContent }: NavigationMenuProps) {
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
      const controls = [...(panel_.current?.querySelectorAll<HTMLElement>(
        'button, a[href], select, input, textarea, [tabindex]',
      ) ?? [])].filter((element) => element.tabIndex >= 0 && !element.matches(":disabled")
        && !element.closest('[hidden], [inert], [aria-hidden="true"]')
        && getComputedStyle(element).display !== "none" && getComputedStyle(element).visibility !== "hidden");
      if (!controls.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
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
  const renderEntry = (entry: NavigationMenuProps["entries"][number]) => {
    const props = {
      // Explicit sequential focus keeps native WebKit Tab navigation consistent.
      tabIndex: 0,
      className: `navigation-row ${entry.className ?? ""} ${entry.active ? "is-active" : ""}`,
      "aria-label": entry.ariaLabel,
      onClick: () => { close(); entry.action(); },
    };
    const content = <>{entry.icon}<span>{entry.label}</span>{entry.detail}<ChevronRight className="navigation-chevron" size={18} aria-hidden="true" /></>;
    return entry.href
      ? <a key={entry.label} href={entry.href} {...props}>{content}</a>
      : <button key={entry.label} type="button" {...props}>{content}</button>;
  };
  // The panel is portaled to <body>: the sticky header uses backdrop-filter, which makes it the containing block of any
  // position:fixed descendant (SDD-012 S12-01), and the header's own nav styles would otherwise reach the panel.
  const panel = open && createPortal(
    <div className="navigation-backdrop" onClick={(event) => { if (event.target === event.currentTarget) close(); }}>
      <div id="aunara-navigation" className="navigation-panel" ref={panel_} role="dialog" aria-modal="true" aria-label={tr(language, "Navigation", "Navegación")}>
        <div className="navigation-head">
          <img src={`${import.meta.env.BASE_URL}brand/aunara-training-systems.svg`} alt="Aunara Training Systems" />
          {headerContent}
          <button className="navigation-close" type="button" tabIndex={0} aria-label={tr(language, "Close navigation", "Cerrar navegación")} onClick={close}><X size={22} aria-hidden="true" /></button>
        </div>
        <nav aria-label={tr(language, "Destinations", "Destinos")}>
          <div className="navigation-group">{entries.filter((entry) => !entry.group).map(renderEntry)}</div>
          {entries.some((entry) => entry.group === "account") && <div className="navigation-group navigation-section">{entries.filter((entry) => entry.group === "account").map(renderEntry)}</div>}
        </nav>
        <div className="navigation-settings navigation-section">
          {panelContent}
          {entries.filter((entry) => entry.group === "settings").map(renderEntry)}
        </div>
        {entries.some((entry) => entry.group === "exit") && <div className="navigation-exit">{entries.filter((entry) => entry.group === "exit").map(renderEntry)}</div>}
      </div>
    </div>,
    document.body,
  );
  return <div className="shared-navigation">
    <button className="brand" type="button" tabIndex={0} aria-label={tr(language, "Aunara navigation", "Navegación de Aunara")} aria-expanded={open} aria-controls="aunara-navigation" onClick={(event) => toggle(event.currentTarget)}>
      <img className="brand-lockup" src={`${import.meta.env.BASE_URL}brand/aunara-training-systems.svg`} alt="Aunara Training Systems" />
    </button>
    <button className="navigation-trigger" type="button" tabIndex={0} aria-label={tr(language, "Open navigation", "Abrir navegación")} aria-expanded={open} aria-controls="aunara-navigation" onClick={(event) => toggle(event.currentTarget)}><Menu size={22} /></button>
    {panel}
  </div>;
}
