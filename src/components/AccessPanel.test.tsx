// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AccessPanel } from "./AccessPanel";

afterEach(cleanup);

describe("access and installation panel", () => {
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

  it("replaces the signup form with email confirmation and optional code entry", () => {
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

    fireEvent.change(screen.getByLabelText("Six-digit confirmation code"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Confirm account" }));

    expect(onVerifyAccount).toHaveBeenCalledWith({
      email: "alejandro@example.com",
      token: "123456",
    });
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

    expect(screen.getByText("An account is already associated with this email.")).toBeTruthy();
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

    fireEvent.click(screen.getByRole("button", { name: "Recover your password here" }));
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
    fireEvent.change(screen.getByLabelText("Type DELETE to confirm"), { target: { value: "DELETE" } });
    fireEvent.click(screen.getByRole("button", { name: "Delete my account permanently" }));

    expect(onExportData).toHaveBeenCalledOnce();
    expect(onEditData).toHaveBeenCalledOnce();
    expect(onChangeHealthConsent).toHaveBeenCalledWith("revoked");
    expect(onDeleteData).toHaveBeenCalledOnce();
    expect(onDeleteAccount).toHaveBeenCalledOnce();
  });
});
