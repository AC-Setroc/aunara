// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { StrictMode, type ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const boot = vi.hoisted(() => ({
  render: vi.fn(), createRoot: vi.fn(), loads: 0,
  resolve: (_value: unknown) => {}, reject: (_reason: unknown) => {},
}));
vi.mock("react-dom/client", async importOriginal => {
  const actual = await importOriginal<typeof import("react-dom/client")>();
  return { ...actual, createRoot: (container: HTMLElement) => container.id === "root" ? boot.createRoot(container) : actual.createRoot(container) };
});
const AppFixture = () => <div>Real application fixture</div>;

beforeEach(() => {
  vi.resetModules();
  boot.loads = 0;
  boot.render.mockReset();
  boot.createRoot.mockReset().mockReturnValue({ render: boot.render });
  vi.doMock("./App", async () => {
    boot.loads += 1;
    return await new Promise<{ default: typeof AppFixture }>((resolve, reject) => {
      boot.resolve = value => resolve(value as { default: typeof AppFixture });
      boot.reject = reject;
    });
  });
  document.body.innerHTML = '<div id="root"></div>';
  vi.spyOn(navigator, "language", "get").mockReturnValue("es-CO");
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

async function start() {
  const loading = import("./main");
  // Allow the single dynamic-import factory to start, without settling its deferred result.
  await vi.waitFor(() => expect(boot.loads).toBe(1));
  // Old static bootstrap is stuck on App: settle only to expose the missing loading state.
  if (boot.render.mock.calls.length === 0) boot.resolve({ default: AppFixture });
  await loading;
}
async function fail() {
  boot.reject(new Error("https://private.invalid/#access_token=synthetic-secret"));
  await vi.dynamicImportSettled();
}
function latest() { return boot.render.mock.calls.at(-1)![0] as ReactElement; }

describe("document startup boundary", () => {
  it("renders a nonempty loading state before App resolves, then uses one root and one load", async () => {
    await start();
    const view = render(latest());
    expect(screen.getByRole("status").textContent).toContain("Cargando Aunara");
    boot.resolve({ default: AppFixture });
    await vi.dynamicImportSettled();
    expect(boot.createRoot).toHaveBeenCalledOnce();
    expect(boot.createRoot).toHaveBeenCalledWith(document.getElementById("root"));
    expect(boot.loads).toBe(1);
    expect(latest().type).toBe(StrictMode);
    view.rerender(latest());
    expect(screen.getByText("Real application fixture")).toBeTruthy();
  });

  it("captures get-only import failure without writing, deleting, or reading user storage", async () => {
    const get = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw Error("denied"); });
    const set = vi.spyOn(Storage.prototype, "setItem");
    const remove = vi.spyOn(Storage.prototype, "removeItem");
    await start(); await fail(); render(latest());
    expect(screen.getByRole("alert").textContent).toContain("no permite leer el almacenamiento");
    expect(get).toHaveBeenCalledOnce();
    expect(get).toHaveBeenCalledWith("aunara-startup-read-check");
    expect(set).not.toHaveBeenCalled(); expect(remove).not.toHaveBeenCalled();
    expect(document.body.textContent).not.toMatch(/synthetic-secret|private\.invalid|access_token/);
    expect(screen.queryByText("Real application fixture")).toBeNull();
  });

  it("classifies a throwing localStorage getter safely", async () => {
    vi.spyOn(window, "localStorage", "get").mockImplementation(() => { throw Error("denied getter"); });
    await start(); await fail(); render(latest());
    expect(screen.getByRole("alert").textContent).toContain("no permite leer el almacenamiento");
  });

  it("shows generic load failure when the protected diagnostic read works", async () => {
    const get = vi.spyOn(Storage.prototype, "getItem");
    await start(); await fail(); render(latest());
    expect(screen.getByRole("alert").textContent).toContain("No se pudo cargar Aunara");
    expect(document.body.textContent).not.toMatch(/permisos|almacenamiento|correo|synthetic-secret/);
    expect(get).toHaveBeenCalledWith("aunara-startup-read-check");
  });

  it("uses browser English, switches language only in memory and never reimports", async () => {
    vi.mocked(Object.getOwnPropertyDescriptor(navigator, "language")!.get!).mockReturnValue("en-US");
    const set = vi.spyOn(Storage.prototype, "setItem");
    await start(); await fail();
    const view = render(latest());
    expect(screen.getByRole("alert").textContent).toContain("Aunara could not load");
    fireEvent.click(screen.getByRole("button", { name: "Español" }));
    view.rerender(latest());
    expect(screen.getByRole("alert").textContent).toContain("No se pudo cargar Aunara");
    expect(screen.getByRole("button", { name: "Español" }).getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "English" }));
    view.rerender(latest());
    expect(screen.getByRole("button", { name: "Reload" })).toBeTruthy();
    expect(set).not.toHaveBeenCalled(); expect(boot.loads).toBe(1); expect(boot.createRoot).toHaveBeenCalledOnce();
  });

  it("falls back to Spanish for other browser languages", async () => {
    vi.mocked(Object.getOwnPropertyDescriptor(navigator, "language")!.get!).mockReturnValue("fr-FR");
    await start(); await fail(); render(latest());
    expect(screen.getByRole("button", { name: "Recargar" })).toBeTruthy();
  });

  it("reloads the document without changing or exposing pathname, query or hash", async () => {
    await start(); await fail(); render(latest());
    const reload = vi.fn();
    const location = { reload, pathname: "/aunara/", search: "?test=synthetic", hash: "#synthetic-callback" };
    vi.stubGlobal("window", { location });
    fireEvent.click(screen.getByRole("button", { name: "Recargar" }));
    expect(reload).toHaveBeenCalledOnce();
    expect(location).toEqual({ reload, pathname: "/aunara/", search: "?test=synthetic", hash: "#synthetic-callback" });
    expect(boot.loads).toBe(1); expect(boot.createRoot).toHaveBeenCalledOnce();
  });

  it.each(["get", "set", "both", "remove"])("does not preflight storage or block resolved App (%s)", async deny => {
    const get = vi.spyOn(Storage.prototype, "getItem");
    if (deny === "get" || deny === "both") get.mockImplementation(() => { throw Error("denied"); });
    if (deny === "set" || deny === "both") vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw Error("denied"); });
    if (deny === "remove") vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => { throw Error("denied"); });
    await start(); boot.resolve({ default: AppFixture }); await vi.dynamicImportSettled(); render(latest());
    expect(screen.getByText("Real application fixture")).toBeTruthy();
    expect(get).not.toHaveBeenCalled();
  });
});
