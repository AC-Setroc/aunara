// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AccessPanel } from "./AccessPanel";

afterEach(cleanup);

describe("access and installation panel", () => {
  it("explains how to install Repbook on both Android and iPhone", () => {
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
    fireEvent.click(screen.getByRole("button", { name: "Create my account" }));

    expect(onCreateAccount).toHaveBeenCalledWith({
      name: "Alejandro Y.",
      email: "alejandro@example.com",
      password: "strong-pass-123",
    });
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

  it("replaces the signup form with six-digit account verification", () => {
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
});
