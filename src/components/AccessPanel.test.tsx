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
      profileName="Alejandro"
      installGuide="desktop"
      onCreateAccount={onCreateAccount}
      onSignIn={vi.fn()}
      onSignOut={vi.fn()}
      onInstall={null}
      onClose={vi.fn()}
    />);

    fireEvent.change(screen.getByLabelText("Name"), {
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
