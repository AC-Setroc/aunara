// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NavigationMenu } from "./NavigationMenu";
afterEach(cleanup);
describe("shared navigation", () => {
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
    const { container } = render(<div className="site-header"><NavigationMenu language="es" entries={[{ label: "Inicio / rutas", action }]} controls={<nav aria-label="Controles"><button type="button">Mi perfil</button></nav>} panelContent={<label>Idioma<select defaultValue="es"><option value="es">ES</option><option value="en">EN</option></select></label>} /></div>);
    const row = container.querySelector(".shared-navigation")!;
    expect(row.firstElementChild).toBe(screen.getByRole("button", { name: "Navegación de Aunara" }));
    expect(row.lastElementChild).toBe(screen.getByRole("button", { name: "Abrir navegación" }));
    expect(row.contains(screen.getByRole("button", { name: "Mi perfil" }))).toBe(true);
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Abrir navegación" }));
    const dialog = screen.getByRole("dialog", { name: "Navegación" });
    expect(container.querySelector(".site-header")!.contains(dialog)).toBe(false);
    expect(dialog.querySelector("select")).toBeTruthy();
    expect(dialog.querySelector("select")!.compareDocumentPosition(dialog.querySelector("nav")!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    fireEvent.change(dialog.querySelector("select")!, { target: { value: "en" } });
    expect(screen.getByRole("dialog", { name: "Navegación" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Inicio / rutas" }));
    expect(action).toHaveBeenCalledOnce();
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

