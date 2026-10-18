// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NavigationMenu } from "./NavigationMenu";
afterEach(cleanup);
describe("shared navigation", () => {
  it("keeps the language slot in the portaled header before destinations and in the focus trap", () => {
    render(<NavigationMenu language="en" entries={[{ label: "Home", action: vi.fn() }]}
      headerContent={<button type="button" tabIndex={0}>EN</button>} />);
    fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));
    const dialog = screen.getByRole("dialog");
    const language = screen.getByRole("button", { name: "EN" });
    expect(dialog.querySelector(".navigation-head")?.children[1]).toBe(language);
    expect(language.compareDocumentPosition(dialog.querySelector("nav")!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(document.activeElement).toBe(language);
    fireEvent.keyDown(language, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Home" }));
    fireEvent.keyDown(document.activeElement!, { key: "Tab" });
    expect(document.activeElement).toBe(language);
    fireEvent.keyDown(language, { key: "Escape" });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Open navigation" }));
  });
  it("shares one destination list and restores the trigger focus on Escape and selection", () => {
    const action = vi.fn();
    render(<NavigationMenu language="en" entries={[{ label: "Home", action }]} />);
    const logo = screen.getByRole("button", { name: "Aunara navigation" });
    const hamburger = screen.getByRole("button", { name: "Open navigation" });
    expect(logo.getAttribute("aria-controls")).toBe(hamburger.getAttribute("aria-controls"));
    fireEvent.click(logo);
    expect(logo.getAttribute("aria-expanded")).toBe("true");
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Close navigation" }));
    fireEvent.keyDown(document.activeElement!, { key: "Escape" });
    expect(document.activeElement).toBe(logo);
    fireEvent.click(hamburger);
    fireEvent.click(screen.getByRole("button", { name: "Home" }));
    expect(action).toHaveBeenCalledOnce();
    expect(document.activeElement).toBe(hamburger);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

describe("header row and menu panel (SDD-012)", () => {
  it("keeps the logo first and the hamburger last, renders the panel outside the header row and places extra controls inside it", () => {
    const action = vi.fn();
    const { container } = render(<div className="site-header"><NavigationMenu language="es" entries={[{ label: "Inicio / rutas", action }]} panelContent={<label>Idioma<select defaultValue="es"><option value="es">ES</option><option value="en">EN</option></select></label>} /></div>);
    const row = container.querySelector(".shared-navigation")!;
    expect(row.firstElementChild).toBe(screen.getByRole("button", { name: "Navegación de Aunara" }));
    expect(row.lastElementChild).toBe(screen.getByRole("button", { name: "Abrir navegación" }));
    expect(row.children).toHaveLength(2);
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Abrir navegación" }));
    const dialog = screen.getByRole("dialog", { name: "Navegación" });
    expect(container.querySelector(".site-header")!.contains(dialog)).toBe(false);
    expect(dialog.querySelector("select")).toBeTruthy();
    expect(dialog.querySelector("nav")!.compareDocumentPosition(dialog.querySelector("select")!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(dialog.querySelector('img[alt="Aunara Training Systems"]')).toBeTruthy();
    fireEvent.change(dialog.querySelector("select")!, { target: { value: "en" } });
    expect(screen.getByRole("dialog", { name: "Navegación" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Inicio / rutas" }));
    expect(action).toHaveBeenCalledOnce();
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

describe("drawer focus and cleanup (SDD-013)", () => {
  it("makes triggers and every generated drawer control explicitly tabbable in WebKit", () => {
    render(<NavigationMenu language="en" entries={[
      { label: "Destination", action: vi.fn() },
      { label: "Anchor", href: "#top", action: vi.fn() },
      { label: "Account", group: "account", action: vi.fn() },
      { label: "Help", group: "settings", action: vi.fn() },
      { label: "Exit", group: "exit", action: vi.fn() },
    ]} />);
    const triggers = [...document.querySelectorAll(".shared-navigation button")];
    fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));
    const controls = [...screen.getByRole("dialog").querySelectorAll("button, a")];
    expect(controls).toHaveLength(6);
    for (const control of [...triggers, ...controls]) expect(control.getAttribute("tabindex")).toBe("0");
  });
  it("wraps both ways through the real selector, skipping disabled and hidden controls", () => {
    render(<NavigationMenu language="en" entries={[{ label: "Home", action: vi.fn() }]}
      panelContent={<><button disabled>Disabled</button><button hidden>Hidden</button><label>Language<select defaultValue="en"><option>en</option></select></label></>} />);
    fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));
    const close = screen.getByRole("button", { name: "Close navigation" });
    const select = screen.getByLabelText("Language");
    fireEvent.keyDown(close, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(select);
    fireEvent.keyDown(select, { key: "Tab" });
    expect(document.activeElement).toBe(close);
  });
  it("restores prior scroll and the opener on backdrop/close, and cleans up on unmount", () => {
    document.body.style.overflow = "scroll";
    const view = render(<NavigationMenu language="en" entries={[]} />);
    const opener = screen.getByRole("button", { name: "Aunara navigation" });
    fireEvent.click(opener);
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.click(document.querySelector(".navigation-backdrop")!);
    expect(document.activeElement).toBe(opener);
    expect(document.body.style.overflow).toBe("scroll");
    fireEvent.click(opener);
    fireEvent.click(screen.getByRole("button", { name: "Close navigation" }));
    expect(document.activeElement).toBe(opener);
    fireEvent.click(opener);
    view.unmount();
    expect(document.body.style.overflow).toBe("scroll");
    document.body.style.overflow = "";
  });
  it("turns the logo into a home button when a home action is given, leaving the menu to the hamburger", () => {
    const onHome = vi.fn();
    render(<NavigationMenu language="en" entries={[{ label: "Library", action: vi.fn() }]} onHome={onHome} />);
    const logo = screen.getByRole("button", { name: "Go to home" });
    expect(logo.getAttribute("aria-expanded")).toBeNull();
    fireEvent.click(logo);
    expect(onHome).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog", { name: "Navigation" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));
    expect(screen.getByRole("dialog", { name: "Navigation" })).toBeTruthy();
  });
});
