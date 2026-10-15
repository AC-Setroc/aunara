// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AccessPanel } from "./AccessPanel";
import { LegalPanel, type LegalDocument } from "./LegalPanel";
import { useState } from "react";

afterEach(cleanup);

describe("access and installation panel", () => {
  it.each((["en", "es"] as const).flatMap(language => [undefined, false, true].map(profile => ({ language, profile }))))(
    "preserves the optional profile flag $profile and existing category counts ($language)", ({ language, profile }) => {
      const { container } = render(<AccessPanel language={language}
        cloud={{ configured: true, email: "synthetic@example.invalid", status: "synced", healthDataConsent: "declined" }}
        profileName="Synthetic" installGuide="installed" onCreateAccount={vi.fn()} onSignIn={vi.fn()}
        onSignOut={vi.fn()} onInstall={null} onClose={vi.fn()}
        dataSummary={profile === undefined ? undefined : { profile, routes: 2, favorites: 3, checkIns: 1, health: true }} />);
      const items = [...container.querySelectorAll(".privacy-summary li")].map(item => item.textContent);
      expect(items).toEqual(profile === undefined ? [] : [
        ...(profile ? [language === "en" ? "Profile and preferences" : "Perfil y preferencias"] : []),
        language === "en" ? "Routes and prescriptions: 2" : "Rutas y prescripciones: 2",
        language === "en" ? "Favorites: 3" : "Favoritos: 3",
        language === "en" ? "Weekly check-ins: 1" : "Registros semanales: 1",
      ]);
      expect(container.querySelector(".privacy-summary")?.textContent).not.toContain("synthetic@example.invalid");
    });
  it.each(["granted", "declined", "revoked", null] as const)("retains health consent visibility for %s", healthDataConsent => {
    const { container } = render(<AccessPanel
      cloud={{ configured: true, email: "synthetic@example.invalid", status: "synced", healthDataConsent }}
      profileName="Synthetic" installGuide="installed" onCreateAccount={vi.fn()} onSignIn={vi.fn()}
      onSignOut={vi.fn()} onInstall={null} onClose={vi.fn()}
      dataSummary={{ profile: false, routes: 0, favorites: 0, checkIns: 0, health: true }} />);
    expect([...container.querySelectorAll(".privacy-summary li")].map(item => item.textContent))
      .toEqual(healthDataConsent === "granted" ? ["Authorized health context"] : []);
  });
  it("releases deletion controls after an operation error and permits one guarded retry", () => {
    const onDeleteAccount = vi.fn(); const onClose = vi.fn();
    const props = { cloud: { configured: true, email: "synthetic@example.com", status: "synced" as const }, profileName: "Synthetic", installGuide: "installed" as const, onCreateAccount: vi.fn(), onSignIn: vi.fn(), onSignOut: vi.fn(), onInstall: null, onClose, onDeleteAccount };
    const { rerender } = render(<AccessPanel {...props} />);
    const open = () => fireEvent.click(screen.getByRole("button", { name: "Delete account permanently" }));
    const confirm = () => fireEvent.change(screen.getByLabelText("Type DELETE to confirm"), { target: { value: "DELETE" } });
    const submit = () => fireEvent.click(screen.getByRole("button", { name: "Delete my account permanently" }));
    open(); confirm(); submit(); submit();
    expect(onDeleteAccount).toHaveBeenCalledTimes(1);
    rerender(<AccessPanel {...props} cloud={{ ...props.cloud, status: "syncing" }} />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.getByRole("dialog", { name: "Delete account permanently" })).toBeTruthy();
    expect((screen.getByRole("button", { name: "Cancel" }) as HTMLButtonElement).disabled).toBe(true);
    rerender(<AccessPanel {...props} cloud={{ ...props.cloud, status: "error", message: "Synthetic deletion failed" }} />);
    expect((screen.getByRole("button", { name: "Cancel" }) as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog", { name: "Delete account permanently" })).toBeNull();
    open();
    expect((screen.getByLabelText("Type DELETE to confirm") as HTMLInputElement).value).toBe("");
    submit();
    expect(onDeleteAccount).toHaveBeenCalledTimes(1);
    confirm(); submit(); submit();
    expect(onDeleteAccount).toHaveBeenCalledTimes(2);
    rerender(<AccessPanel {...props} cloud={{ ...props.cloud, status: "syncing" }} />);
    rerender(<AccessPanel {...props} cloud={{ ...props.cloud, status: "error" }} />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Delete account permanently" })).toBeNull();
    expect(onClose).not.toHaveBeenCalled();
  });
  it("resets deletion confirmation on cancel, Escape, reopening and language change", () => {
    const onDeleteAccount = vi.fn(); const onClose = vi.fn();
    const props = { cloud: { configured: true, email: "synthetic@example.com", status: "synced" as const }, profileName: "Synthetic", installGuide: "installed" as const, onCreateAccount: vi.fn(), onSignIn: vi.fn(), onSignOut: vi.fn(), onInstall: null, onClose, onDeleteAccount };
    const { rerender } = render(<AccessPanel {...props} language="en" />);
    expect(screen.queryByRole("heading", { name: "One app. Both phones." })).toBeNull();
    const opener = screen.getByRole("button", { name: "Delete account permanently" });
    fireEvent.click(opener);
    fireEvent.change(screen.getByLabelText("Type DELETE to confirm"), { target: { value: "delete" } });
    expect((screen.getByRole("button", { name: "Delete my account permanently" }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(opener);
    fireEvent.click(opener);
    expect((screen.getByLabelText("Type DELETE to confirm") as HTMLInputElement).value).toBe("");
    fireEvent.change(screen.getByLabelText("Type DELETE to confirm"), { target: { value: "DELETE" } });
    rerender(<AccessPanel {...props} language="es" />);
    expect((screen.getByLabelText("Escribí ELIMINAR para confirmar") as HTMLInputElement).value).toBe("");
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(onDeleteAccount).not.toHaveBeenCalled();
  });
  it("lists actual categories only, hides unauthorized health, and blocks deletion while busy", () => {
    const onDeleteAccount = vi.fn();
    render(<AccessPanel cloud={{ configured: true, email: "synthetic@example.com", status: "syncing", healthDataConsent: "revoked" }} profileName="Synthetic" installGuide="installed" onCreateAccount={vi.fn()} onSignIn={vi.fn()} onSignOut={vi.fn()} onInstall={null} onClose={vi.fn()} onDeleteAccount={onDeleteAccount} dataSummary={{ profile: true, routes: 2, favorites: 0, checkIns: 0, health: true }} />);
    expect(screen.getByText("Profile and preferences")).toBeTruthy();
    expect(screen.getByText("Routes and prescriptions: 2")).toBeTruthy();
    expect(screen.queryByText("Authorized health context")).toBeNull();
    expect(screen.queryByText("Favorites: 0")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Delete account permanently" }));
    fireEvent.change(screen.getByLabelText("Type DELETE to confirm"), { target: { value: "DELETE" } });
    fireEvent.click(screen.getByRole("button", { name: "Delete my account permanently" }));
    expect(onDeleteAccount).not.toHaveBeenCalled();
  });
  function access(language: "en" | "es" = "en", status: "local" | "syncing" = "local") {
    const handlers = { onCreateAccount: vi.fn(), onSignIn: vi.fn(), onRequestPasswordReset: vi.fn(), onClearAuthError: vi.fn() };
    const props = { ...handlers, language, cloud: { configured: true, email: null, status }, profileName: "Test guest", installGuide: "desktop" as const, onSignOut: vi.fn(), onInstall: null, onClose: vi.fn() };
    const view = render(<AccessPanel {...props} />);
    return { ...view, ...handlers, props };
  }

  it.each((["en", "es"] as const).flatMap((language) => ["", "guest@example", "guest@ex ample.com", "guest@-example.com", "guest@example.c", "guest@@example.com"].map((email) => ({ language, email }))))("rejects public-email policy case '$email' with accessible $language help and zero auth calls", ({ language, email }) => {
    const handlers = access(language);
    fireEvent.change(screen.getByLabelText(language === "es" ? "Correo electrónico" : "Email address"), { target: { value: email } });
    fireEvent.change(screen.getByLabelText(language === "es" ? "Contraseña" : "Password"), { target: { value: "MiXeD-Password" } });
    fireEvent.click(screen.getByRole("checkbox", { name: language === "es" ? /Acepto los Términos/ : /I accept the Terms/ }));
    fireEvent.submit(screen.getByRole("button", { name: language === "es" ? "Crear mi cuenta" : "Create my account" }).closest("form")!);
    const input = screen.getByLabelText(language === "es" ? "Correo electrónico" : "Email address");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toBe(screen.getByRole("alert").id);
    expect(document.activeElement).toBe(input);
    expect(screen.getByRole("alert").textContent).toContain(language === "es" ? "Ingresá" : "Enter");
    expect(screen.queryByRole("button", { name: language === "es" ? "Recuperar contraseña" : "Recover password" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: language === "es" ? "Ya tengo una cuenta" : "I already have an account" }));
    expect(screen.queryByRole("alert")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: language === "es" ? "Recuperar contraseña" : "Recover password" }));
    fireEvent.submit(screen.getByRole("button", { name: language === "es" ? "Ingresar" : "Sign in" }).closest("form")!);
    expect(handlers.onCreateAccount).not.toHaveBeenCalled();
    expect(handlers.onSignIn).not.toHaveBeenCalled();
    expect(handlers.onRequestPasswordReset).not.toHaveBeenCalled();
  });

  it.each(["Guest+tag@sub.example.com", "  Guest@Example.COM  "])("trims public email %s while preserving local part and password case", (email) => {
    const handlers = access();
    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: email } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: " MiXeD-Password " } });
    fireEvent.click(screen.getByRole("checkbox", { name: /I accept the Terms/ }));
    fireEvent.click(screen.getByRole("button", { name: "Create my account" }));
    expect(handlers.onCreateAccount).toHaveBeenCalledWith(expect.objectContaining({ email: email.trim(), password: " MiXeD-Password " }));
    fireEvent.click(screen.getByRole("button", { name: "I already have an account" }));
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(handlers.onSignIn).toHaveBeenCalledWith({ email: email.trim(), password: " MiXeD-Password " });
  });

  it("clears only on an effective mode change, preserving values and both consents", () => {
    const handlers = access();
    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "Guest@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "MiXeD-Password" } });
    fireEvent.click(screen.getByRole("checkbox", { name: /I accept the Terms/ }));
    fireEvent.click(screen.getByRole("checkbox", { name: /I authorize Aunara/ }));
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));
    expect(handlers.onClearAuthError).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "I already have an account" }));
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));
    expect(handlers.onClearAuthError).toHaveBeenCalledTimes(2);
    expect((screen.getByLabelText("Name") as HTMLInputElement).value).toBe("Test guest");
    expect((screen.getByLabelText("Email address") as HTMLInputElement).value).toBe("Guest@example.com");
    expect((screen.getByLabelText("Password") as HTMLInputElement).value).toBe("MiXeD-Password");
    expect((screen.getByRole("checkbox", { name: /I accept the Terms/ }) as HTMLInputElement).checked).toBe(true);
    expect((screen.getByRole("checkbox", { name: /I authorize Aunara/ }) as HTMLInputElement).checked).toBe(true);
  });

  it.each(["en", "es"] as const)("requests recovery only in login without signup fields (%s)", (language) => {
    const handlers = access(language);
    const recoveryName = language === "es" ? "Recuperar contraseña" : "Recover password";
    fireEvent.change(screen.getByLabelText(language === "es" ? "Correo electrónico" : "Email address"), { target: { value: "  Guest+tag@sub.example.com  " } });
    fireEvent.blur(screen.getByLabelText(language === "es" ? "Correo electrónico" : "Email address"));
    expect(screen.queryByRole("button", { name: recoveryName })).toBeNull();
    expect(handlers.onRequestPasswordReset).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: language === "es" ? "Ya tengo una cuenta" : "I already have an account" }));
    expect(handlers.onRequestPasswordReset).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: recoveryName }));
    expect(handlers.onRequestPasswordReset).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: language === "es" ? "Crear cuenta" : "Create account" }));
    fireEvent.change(screen.getByLabelText(language === "es" ? "Nombre" : "Name"), { target: { value: "" } });
    expect(screen.queryByRole("button", { name: recoveryName })).toBeNull();
    expect(handlers.onRequestPasswordReset).toHaveBeenCalledTimes(1);
    expect(handlers.onRequestPasswordReset).toHaveBeenLastCalledWith("Guest+tag@sub.example.com");
    expect(handlers.onCreateAccount).not.toHaveBeenCalled();
    expect(handlers.onSignIn).not.toHaveBeenCalled();
  });

  it("keeps recovery disabled while any auth operation is pending", () => {
    const handlers = access("en", "syncing");
    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "test@example.com" } });
    expect(screen.queryByRole("button", { name: "Recover password" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "I already have an account" }));
    expect((screen.getByRole("button", { name: "Recover password" }) as HTMLButtonElement).disabled).toBe(true);
    expect(handlers.onRequestPasswordReset).not.toHaveBeenCalled();
  });

  it.each(["es", "en"] as const)("renders typed login credentials as an explicit, non-submit recovery action (%s)", (language) => {
    const handlers = access(language);
    fireEvent.click(screen.getByRole("button", { name: language === "es" ? "Ya tengo una cuenta" : "I already have an account" }));
    handlers.rerender(<AccessPanel {...handlers.props} cloud={{ ...handlers.props.cloud, status: "error", authErrorKind: "credentials", message: "Not parsed" }} />);
    const label = language === "es" ? "recuperá tu contraseña" : "recover your password";
    const action = screen.getByRole("button", { name: label });
    expect(action.getAttribute("type")).toBe("button");
    expect(action.closest("small")?.textContent).toBe(language === "es"
      ? "Tu correo o contraseña no coinciden con los datos registrados. Intentá de nuevo o recuperá tu contraseña"
      : "Your email or password do not match the registered details. Try again or recover your password");
    action.focus();
    expect(document.activeElement).toBe(action);
    fireEvent.click(action);
    expect(handlers.onRequestPasswordReset).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(screen.getByLabelText(language === "es" ? "Correo electrónico" : "Email address"));
    fireEvent.change(screen.getByLabelText(language === "es" ? "Correo electrónico" : "Email address"), { target: { value: " Guest+tag@sub.example.com " } });
    fireEvent.click(action);
    expect(handlers.onRequestPasswordReset).toHaveBeenCalledExactlyOnceWith("Guest+tag@sub.example.com");
    expect(handlers.onSignIn).not.toHaveBeenCalled();
    expect(handlers.onCreateAccount).not.toHaveBeenCalled();
  });

  it("never parses message text into a login action or hides an unrelated success", () => {
    const handlers = access();
    fireEvent.click(screen.getByRole("button", { name: "I already have an account" }));
    handlers.rerender(<AccessPanel {...handlers.props} cloud={{ ...handlers.props.cloud, status: "error", message: "Your email or password do not match the registered details. Try again or recover your password" }} />);
    expect(screen.queryByRole("button", { name: "recover your password" })).toBeNull();
    handlers.rerender(<AccessPanel {...handlers.props} cloud={{ ...handlers.props.cloud, passwordRecoveryState: "requested", message: "Legitimate unrelated success" }} />);
    expect(screen.getByText("Legitimate unrelated success")).toBeTruthy();
  });

  it.each(["", "bad@example", "bad name@example.com", " Guest@Example.COM "])("validates the authoritative conflict recovery email '%s' without login/signup", (email) => {
    const handlers = access();
    handlers.rerender(<AccessPanel {...handlers.props} cloud={{ ...handlers.props.cloud, existingAccountEmail: email || " " }} />);
    const button = screen.getByRole("button", { name: "Recover password" });
    expect(handlers.onRequestPasswordReset).not.toHaveBeenCalled();
    fireEvent.click(button);
    if (email.trim() === "Guest@Example.COM") expect(handlers.onRequestPasswordReset).toHaveBeenCalledExactlyOnceWith("Guest@Example.COM");
    else {
      expect(handlers.onRequestPasswordReset).not.toHaveBeenCalled();
      expect(screen.getByText(/Enter a complete public email/).getAttribute("role")).toBe("alert");
      expect(document.activeElement).toBe(button);
    }
    expect(handlers.onSignIn).not.toHaveBeenCalled();
    expect(handlers.onCreateAccount).not.toHaveBeenCalled();
  });

  it.each(["es", "en"] as const)("keeps processed recovery neutral without a conflict (%s)", (language) => {
    const handlers = access(language);
    handlers.rerender(<AccessPanel {...handlers.props} cloud={{ ...handlers.props.cloud, passwordRecoveryState: "requested" }} />);
    expect(screen.queryByText(language === "es" ? "Cuenta ya registrada" : "Account already registered")).toBeNull();
    expect(screen.getByRole("status").textContent).toBe(language === "es"
      ? "Solicitud de recuperación procesada. Esto no confirma que el correo se haya enviado o entregado. Si recibís las instrucciones, revisá tu bandeja de entrada y spam. Si no llegan, podés intentar nuevamente más tarde."
      : "Recovery request processed. This does not confirm that an email was sent or delivered. If you receive the instructions, check your inbox and spam folder. If they do not arrive, you can try again later.");
    expect(handlers.onRequestPasswordReset).not.toHaveBeenCalled();
  });

  it("preserves required name and eight-character password even on direct submit", () => {
    const handlers = access();
    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "test@example.com" } });
    fireEvent.click(screen.getByRole("checkbox", { name: /I accept the Terms/ }));
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "short" } });
    fireEvent.submit(screen.getByRole("button", { name: "Create my account" }).closest("form")!);
    expect(handlers.onCreateAccount).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "long-test-password" } });
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "   " } });
    fireEvent.submit(screen.getByRole("button", { name: "Create my account" }).closest("form")!);
    expect(handlers.onCreateAccount).not.toHaveBeenCalled();
  });
  it("requires legal acceptance even when health authorization is checked", () => {
    const onCreateAccount = vi.fn();
    render(<AccessPanel
      cloud={{ configured: true, email: null, status: "local" }}
      profileName="" installGuide="desktop" onCreateAccount={onCreateAccount}
      onSignIn={vi.fn()} onSignOut={vi.fn()} onInstall={null} onClose={vi.fn()}
    />);
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Test guest" } });
    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "test-password" } });
    fireEvent.click(screen.getByRole("checkbox", { name: /I authorize Aunara/ }));
    const submit = screen.getByRole("button", { name: "Create my account" }) as HTMLButtonElement;
    expect(submit.disabled).toBe(true);
    fireEvent.submit(submit.closest("form")!);
    expect(onCreateAccount).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("checkbox", { name: /I accept the Terms/ }));
    expect(submit.disabled).toBe(false);
  });

  it("keeps signup values and acceptance when the upper legal layer closes with Escape", () => {
    const onAccessClose = vi.fn();
    function SignupWithLegal() {
      const [document, setDocument] = useState<LegalDocument | null>(null);
      return <>
        <AccessPanel cloud={{ configured: true, email: null, status: "local" }}
          profileName="" installGuide="desktop" onCreateAccount={vi.fn()}
          onSignIn={vi.fn()} onSignOut={vi.fn()} onInstall={null}
          onOpenLegal={setDocument} onClose={onAccessClose} />
        {document && <LegalPanel language="en" document={document} onClose={() => setDocument(null)} />}
      </>;
    }
    render(<SignupWithLegal />);
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Test guest" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "test-password" } });
    fireEvent.click(screen.getByRole("checkbox", { name: /I accept the Terms/ }));
    const opener = screen.getAllByRole("button", { name: "Terms of use" })[0];
    opener.focus();
    fireEvent.click(opener);
    fireEvent.keyDown(screen.getByRole("button", { name: "Close legal document" }), { key: "Escape" });
    expect(onAccessClose).not.toHaveBeenCalled();
    expect(screen.queryByRole("heading", { name: "Terms of use" })).toBeNull();
    expect(window.document.activeElement).toBe(opener);
    expect((screen.getByLabelText("Name") as HTMLInputElement).value).toBe("Test guest");
    expect((screen.getByLabelText("Password") as HTMLInputElement).value).toBe("test-password");
    expect((screen.getByRole("checkbox", { name: /I accept the Terms/ }) as HTMLInputElement).checked).toBe(true);
    expect((screen.getByRole("checkbox", { name: /I authorize Aunara/ }) as HTMLInputElement).checked).toBe(false);
  });

  it("explains how to install Aunara on both Android and iPhone", () => {
    render(<AccessPanel
      cloud={{ configured: false, email: null, status: "local" }}
      profileName="Alejandro"
      installGuide="android"
      onCreateAccount={vi.fn()}
      onSignIn={vi.fn()}
      onSignOut={vi.fn()}
      onInstall={null}
      onClose={vi.fn()}
    />);

    expect(screen.getByText("Android")).toBeTruthy();
    expect(screen.getByText("iPhone")).toBeTruthy();
    expect(screen.getByText("Cloud setup is being prepared.")).toBeTruthy();
  });

  it("creates a password account with the person's name and email", () => {
    const onCreateAccount = vi.fn();
    render(<AccessPanel
      cloud={{ configured: true, email: null, status: "local" }}
      profileName="My profile"
      installGuide="desktop"
      onCreateAccount={onCreateAccount}
      onSignIn={vi.fn()}
      onSignOut={vi.fn()}
      onInstall={null}
      onClose={vi.fn()}
    />);

    const nameInput = screen.getByLabelText("Name") as HTMLInputElement;
    expect(nameInput.value).toBe("");
    expect(nameInput.placeholder).toBe("Your name");

    fireEvent.change(nameInput, {
      target: { value: "Alejandro Y." },
    });
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "alejandro@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "strong-pass-123" },
    });
    fireEvent.click(screen.getByRole("checkbox", { name: /I accept the Terms of use/ }));
    fireEvent.click(screen.getByRole("button", { name: "Create my account" }));

    expect(onCreateAccount).toHaveBeenCalledWith({
      name: "Alejandro Y.",
      email: "alejandro@example.com",
      password: "strong-pass-123",
      acceptedLegal: true,
      healthDataConsent: false,
    });
  });

  it("keeps sensitive health consent separate and optional", () => {
    const onCreateAccount = vi.fn();
    const onOpenLegal = vi.fn();
    render(<AccessPanel
      cloud={{ configured: true, email: null, status: "local" }}
      profileName=""
      installGuide="desktop"
      onCreateAccount={onCreateAccount}
      onSignIn={vi.fn()}
      onSignOut={vi.fn()}
      onInstall={null}
      onOpenLegal={onOpenLegal}
      onClose={vi.fn()}
    />);

    fireEvent.click(screen.getAllByRole("button", { name: "Privacy policy" })[0]);
    expect(onOpenLegal).toHaveBeenCalledWith("privacy");
    fireEvent.click(screen.getAllByRole("button", { name: "Terms of use" })[0]);
    expect(onOpenLegal).toHaveBeenCalledWith("terms");

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Alejandro" } });
    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "alejandro@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "strong-pass-123" } });
    const optional = screen.getByRole("checkbox", { name: /I authorize Aunara to use sensitive health data/ }) as HTMLInputElement;
    expect(optional.required).toBe(false);
    expect(optional.checked).toBe(false);
    expect(optional.closest(".create-account-consents")).toBeTruthy();
    expect((screen.getByRole("button", { name: "Create my account" }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole("checkbox", { name: /I accept the Terms of use/ }));
    fireEvent.click(screen.getByRole("checkbox", { name: /I authorize Aunara to use sensitive health data/ }));
    fireEvent.click(screen.getByRole("button", { name: "Create my account" }));

    expect(onCreateAccount).toHaveBeenCalledWith(expect.objectContaining({
      acceptedLegal: true,
      healthDataConsent: true,
    }));
  });

  it("shows and hides the password without changing its value", () => {
    render(<AccessPanel
      cloud={{ configured: true, email: null, status: "local" }}
      profileName=""
      installGuide="desktop"
      onCreateAccount={vi.fn()}
      onSignIn={vi.fn()}
      onSignOut={vi.fn()}
      onInstall={null}
      onClose={vi.fn()}
    />);

    const password = screen.getByLabelText("Password") as HTMLInputElement;
    fireEvent.change(password, { target: { value: "strong-pass-123" } });
    fireEvent.click(screen.getByRole("button", { name: "Show password" }));

    expect(password.type).toBe("text");
    expect(password.value).toBe("strong-pass-123");

    fireEvent.click(screen.getByRole("button", { name: "Hide password" }));
    expect(password.type).toBe("password");
  });

  it("confirms by email link only and resends only on explicit request", () => {
    const onVerifyAccount = vi.fn();
    const props = {
      cloud: {
        configured: true,
        email: null,
        status: "local",
        pendingVerification: {
          name: "Alejandro Cortés",
          email: "alejandro@example.com",
        },
      },
      profileName: "Alejandro Cortés",
      installGuide: "desktop",
      onCreateAccount: vi.fn(),
      onVerifyAccount,
      onResendVerification: vi.fn(),
      onSignIn: vi.fn(),
      onSignOut: vi.fn(),
      onInstall: null,
      onClose: vi.fn(),
    } as any;
    render(<AccessPanel {...props} />);

    expect(screen.getByText("Alejandro Cortés")).toBeTruthy();
    expect(screen.getByText("alejandro@example.com")).toBeTruthy();
    expect(screen.getByText(/Open the confirmation link in your email/)).toBeTruthy();
    expect(screen.queryByLabelText("Password")).toBeNull();

    expect(screen.queryByLabelText("Six-digit confirmation code")).toBeNull();
    expect(screen.queryByRole("button", { name: "Confirm account" })).toBeNull();
    expect(onVerifyAccount).not.toHaveBeenCalled();
    expect(props.onResendVerification).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Resend confirmation email" }));
    expect(props.onResendVerification).toHaveBeenCalledWith("alejandro@example.com");
  });

  it("warns when the email already has an account and offers sign-in or recovery", () => {
    const onUseExistingAccount = vi.fn();
    const onRequestPasswordReset = vi.fn();
    const { rerender } = render(<AccessPanel
      cloud={{
        configured: true,
        email: null,
        status: "local",
        existingAccountEmail: "alejandro@example.com",
      }}
      profileName="Alejandro Cortés"
      installGuide="desktop"
      onCreateAccount={vi.fn()}
      onUseExistingAccount={onUseExistingAccount}
      onRequestPasswordReset={onRequestPasswordReset}
      onSignIn={vi.fn()}
      onSignOut={vi.fn()}
      onInstall={null}
      onClose={vi.fn()}
    />);

    expect(screen.getByText("This email is already registered. Would you like to recover your password?")).toBeTruthy();
    expect(screen.getByText("alejandro@example.com")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Sign in here" }));
    expect(onUseExistingAccount).toHaveBeenCalledOnce();
    rerender(<AccessPanel
      cloud={{ configured: true, email: null, status: "local" }}
      profileName="Alejandro Cortés"
      installGuide="desktop"
      onCreateAccount={vi.fn()}
      onUseExistingAccount={onUseExistingAccount}
      onRequestPasswordReset={onRequestPasswordReset}
      onSignIn={vi.fn()}
      onSignOut={vi.fn()}
      onInstall={null}
      onClose={vi.fn()}
    />);
    expect((screen.getByLabelText("Email address") as HTMLInputElement).value).toBe("alejandro@example.com");
    expect((screen.getByLabelText("Password") as HTMLInputElement).value).toBe("");
  });

  it("starts password recovery from the existing-account warning", () => {
    const onRequestPasswordReset = vi.fn();
    render(<AccessPanel
      cloud={{
        configured: true,
        email: null,
        status: "local",
        existingAccountEmail: "alejandro@example.com",
      }}
      profileName="Alejandro Cortés"
      installGuide="desktop"
      onCreateAccount={vi.fn()}
      onUseExistingAccount={vi.fn()}
      onRequestPasswordReset={onRequestPasswordReset}
      onSignIn={vi.fn()}
      onSignOut={vi.fn()}
      onInstall={null}
      onClose={vi.fn()}
    />);

    fireEvent.click(screen.getByRole("button", { name: "Recover password" }));
    expect(onRequestPasswordReset).toHaveBeenCalledWith("alejandro@example.com");
  });

  it("sets a new password after the recovery link returns to Aunara", () => {
    const onUpdatePassword = vi.fn();
    render(<AccessPanel
      cloud={{
        configured: true,
        email: "alejandro@example.com",
        status: "local",
        passwordRecoveryState: "ready",
      }}
      profileName="Alejandro Cortés"
      installGuide="desktop"
      onCreateAccount={vi.fn()}
      onUpdatePassword={onUpdatePassword}
      onSignIn={vi.fn()}
      onSignOut={vi.fn()}
      onInstall={null}
      onClose={vi.fn()}
    />);

    fireEvent.change(screen.getByLabelText("New password"), {
      target: { value: "new-strong-pass-123" },
    });
    fireEvent.change(screen.getByLabelText("Confirm new password"), {
      target: { value: "new-strong-pass-123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save new password" }));

    expect(onUpdatePassword).toHaveBeenCalledWith("new-strong-pass-123");
  });

  it("keeps both account choices the same width", () => {
    render(<AccessPanel
      cloud={{ configured: true, email: null, status: "local" }}
      profileName=""
      installGuide="desktop"
      onCreateAccount={vi.fn()}
      onSignIn={vi.fn()}
      onSignOut={vi.fn()}
      onInstall={null}
      onClose={vi.fn()}
    />);

    const mode = screen.getByRole("group", { name: "Account access choice" });
    expect(mode.classList.contains("access-mode")).toBe(true);
    expect(mode.querySelectorAll("button")).toHaveLength(2);
  });

  it("signs in an existing account with email and password", () => {
    const onSignIn = vi.fn();
    render(<AccessPanel
      cloud={{ configured: true, email: null, status: "local" }}
      profileName="Alejandro"
      installGuide="desktop"
      onCreateAccount={vi.fn()}
      onSignIn={onSignIn}
      onSignOut={vi.fn()}
      onInstall={null}
      onClose={vi.fn()}
    />);

    fireEvent.click(screen.getByRole("button", { name: "I already have an account" }));
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "alejandro@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "strong-pass-123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(onSignIn).toHaveBeenCalledWith({
      email: "alejandro@example.com",
      password: "strong-pass-123",
    });
  });

  it("shows the signed-in account and synchronization status", () => {
    const onSignOut = vi.fn();
    render(<AccessPanel
      cloud={{ configured: true, email: "alejandro@example.com", status: "synced" }}
      profileName="Alejandro"
      installGuide="installed"
      onCreateAccount={vi.fn()}
      onSignIn={vi.fn()}
      onSignOut={onSignOut}
      onInstall={null}
      onClose={vi.fn()}
    />);

    expect(screen.getByText("alejandro@example.com")).toBeTruthy();
    expect(screen.getByText("Saved across devices")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));
    expect(onSignOut).toHaveBeenCalledOnce();
  });

  it("provides export, correction, consent revocation, data deletion and account deletion controls", () => {
    const onExportData = vi.fn();
    const onEditData = vi.fn();
    const onChangeHealthConsent = vi.fn();
    const onDeleteData = vi.fn();
    const onDeleteAccount = vi.fn();
    render(<AccessPanel
      cloud={{
        configured: true,
        email: "alejandro@example.com",
        status: "synced",
        healthDataConsent: "granted",
      }}
      profileName="Alejandro"
      installGuide="installed"
      onCreateAccount={vi.fn()}
      onSignIn={vi.fn()}
      onSignOut={vi.fn()}
      onInstall={null}
      onExportData={onExportData}
      onEditData={onEditData}
      onChangeHealthConsent={onChangeHealthConsent}
      onDeleteData={onDeleteData}
      onDeleteAccount={onDeleteAccount}
      onClose={vi.fn()}
    />);

    fireEvent.click(screen.getByRole("button", { name: "Export my data" }));
    fireEvent.click(screen.getByRole("button", { name: "Correct my data" }));
    fireEvent.click(screen.getByRole("button", { name: "Revoke health-data consent" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete my stored data" }));
    expect(screen.queryByLabelText("Type DELETE to confirm")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Delete account permanently" }));
    fireEvent.change(screen.getByLabelText("Type DELETE to confirm"), { target: { value: "DELETE" } });
    fireEvent.click(screen.getByRole("button", { name: "Delete my account permanently" }));

    expect(onExportData).toHaveBeenCalledOnce();
    expect(onEditData).toHaveBeenCalledOnce();
    expect(onChangeHealthConsent).toHaveBeenCalledWith("revoked");
    expect(onDeleteData).toHaveBeenCalledOnce();
    expect(onDeleteAccount).toHaveBeenCalledOnce();
  });
});
