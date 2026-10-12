// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LegalPanel, type LegalDocument } from "./LegalPanel";

afterEach(cleanup);

describe("legal documents", () => {
  it.each([
    ["es", "privacy", "Política de privacidad"],
    ["en", "privacy", "Privacy policy"],
    ["es", "terms", "Términos de uso"],
    ["en", "terms", "Terms of use"],
    ["es", "cookies", "Cookies y almacenamiento"],
    ["en", "cookies", "Cookies and storage"],
  ] as const)("confines focus and isolates Escape for %s/%s", (language, document, title) => {
    const opener = window.document.createElement("button");
    window.document.body.append(opener);
    opener.focus();
    const underlyingEscape = vi.fn();
    const underlyingListener = (event: KeyboardEvent) => {
      if (event.key === "Escape") underlyingEscape();
    };
    window.addEventListener("keydown", underlyingListener);
    const onClose = vi.fn();
    const view = render(<LegalPanel language={language} document={document as LegalDocument} onClose={onClose} />);
    const close = screen.getByRole("button", { name: /Cerrar documento legal|Close legal document/ });
    expect(screen.getByRole("dialog", { name: title }).getAttribute("aria-modal")).toBe("true");
    expect(window.document.activeElement).toBe(close);
    expect(opener.hasAttribute("inert")).toBe(true);
    const forward = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
    fireEvent(close, forward);
    expect(forward.defaultPrevented).toBe(true);
    const last = document === "privacy" ? screen.getByRole("link", { name: "sic.gov.co" }) : close;
    expect(window.document.activeElement).toBe(last);
    fireEvent.keyDown(last, { key: "Tab", shiftKey: true });
    expect(window.document.activeElement).toBe(close);
    fireEvent.keyDown(close, { key: "Tab", shiftKey: true });
    expect(window.document.activeElement).toBe(last);
    fireEvent.keyDown(last, { key: "Tab" });
    expect(window.document.activeElement).toBe(close);
    fireEvent.keyDown(close, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
    expect(underlyingEscape).not.toHaveBeenCalled();
    view.unmount();
    expect(window.document.activeElement).toBe(opener);
    expect(opener.hasAttribute("inert")).toBe(false);
    window.removeEventListener("keydown", underlyingListener);
    opener.remove();
  });

  it("cycles only visible, enabled controls including email links", () => {
    render(<LegalPanel language="en" document="cookies" onClose={vi.fn()} />);
    const panel = screen.getByRole("dialog");
    const close = screen.getByRole("button", { name: "Close legal document" });
    const email = window.document.createElement("a");
    email.href = "mailto:test@example.com";
    email.textContent = "Test email";
    panel.append(email);
    for (const markup of [
      '<button disabled>Disabled</button>', '<input type="hidden">',
      '<button hidden>Hidden</button>', '<button tabindex="-1">Not tabbable</button>',
      '<div style="display:none"><button>Hidden ancestor</button></div>',
      '<button style="visibility:hidden">Invisible</button>',
      '<div aria-hidden="true"><a href="#">Hidden link</a></div>',
      '<fieldset disabled><button>Disabled fieldset</button></fieldset>',
    ]) panel.insertAdjacentHTML("beforeend", markup);
    fireEvent.keyDown(close, { key: "Tab" });
    expect(window.document.activeElement).toBe(email);
    fireEvent.keyDown(email, { key: "Tab" });
    expect(window.document.activeElement).toBe(close);
    fireEvent.keyDown(close, { key: "Tab", shiftKey: true });
    expect(window.document.activeElement).toBe(email);
  });

  it.each(["es", "en"] as const)("describes storage honestly and identifies current hosting (%s)", (language) => {
    const view = render(<LegalPanel language={language} document="cookies" onClose={vi.fn()} />);
    expect(screen.getByText(/localStorage/)).toBeTruthy();
    expect(screen.getByText(/Cache API/)).toBeTruthy();
    expect(screen.getByText(/Supabase/)).toBeTruthy();
    expect(screen.getByText(/aunara-storage-notice-v1/)).toBeTruthy();
    expect(screen.queryByRole("checkbox")).toBeNull();
    view.rerender(<LegalPanel language={language} document="privacy" onClose={vi.fn()} />);
    expect(screen.getByText(/GitHub Pages/)).toBeTruthy();
    expect(screen.queryByText(/OpenAI Sites/)).toBeNull();
    expect(screen.getByText(/1\.0.*2026-07-29/)).toBeTruthy();
  });

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
