// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LegalPanel } from "./LegalPanel";

afterEach(cleanup);

describe("legal documents", () => {
  it("shows the Colombian privacy information required before collecting data", () => {
    render(<LegalPanel language="es" document="privacy" onClose={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "Política de privacidad" })).toBeTruthy();
    expect(screen.getByText(/Alejandro Cortés Burgos/)).toBeTruthy();
    expect(screen.getByText(/alejandro@ac-setroc\.com/)).toBeTruthy();
    expect(screen.getAllByText(/datos sensibles/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/São Paulo, Brasil/i)).toBeTruthy();
    expect(screen.getByText(/Superintendencia de Industria y Comercio/i)).toBeTruthy();
  });

  it("shows service limits and returns to the previous screen", () => {
    const onClose = vi.fn();
    render(<LegalPanel language="es" document="terms" onClose={onClose} />);

    expect(screen.getByRole("heading", { name: "Términos de uso" })).toBeTruthy();
    expect(screen.getByText(/no sustituye un diagnóstico/i)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Cerrar documento legal" }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
