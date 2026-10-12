// @vitest-environment jsdom

import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useStoredState } from "./useStoredState";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  localStorage.clear();
});

const keys = [
  "repbook-language", "repbook-profile-name", "repbook-favorites",
  "repbook-workout", "repbook-training-tracks", "repbook-active-track",
  "repbook-training-tracks-initialized", "repbook-health-profile", "repbook-weekly-checkins",
];

describe("useStoredState", () => {
  it("preserves JSON format, key and values across remounts", () => {
    localStorage.setItem(keys[0], JSON.stringify("en"));
    const clear = vi.spyOn(Storage.prototype, "clear");
    const remove = vi.spyOn(Storage.prototype, "removeItem");
    const write = vi.spyOn(Storage.prototype, "setItem");
    const first = renderHook(() => useStoredState(keys[0], "es"));
    expect(first.result.current[0]).toBe("en");
    act(() => first.result.current[1]("es"));
    expect(write).toHaveBeenLastCalledWith(keys[0], '"es"');
    first.unmount();
    const second = renderHook(() => useStoredState(keys[0], "fallback"));
    expect(second.result.current[0]).toBe("es");
    expect(clear).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
  });

  it.each(["read", "write", "both"] as const)("keeps all nine consumer states in memory with %s denied", (denied) => {
    const clear = vi.spyOn(Storage.prototype, "clear");
    const remove = vi.spyOn(Storage.prototype, "removeItem");
    if (denied !== "write") vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new DOMException("Blocked", "SecurityError"); });
    if (denied !== "read") vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new DOMException("Blocked", "SecurityError"); });
    for (const key of keys) {
      const hook = renderHook(() => useStoredState(key, { count: 0 }));
      expect(hook.result.current[0]).toEqual({ count: 0 });
      act(() => hook.result.current[1](previous => ({ count: previous.count + 1 })));
      expect(hook.result.current[0]).toEqual({ count: 1 });
      hook.unmount();
      const remount = renderHook(() => useStoredState(key, { count: 0 }));
      expect(remount.result.current[0]).toEqual({ count: 0 });
      remount.unmount();
    }
    expect(clear).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
  });

  it("retains an existing readable value when writes are denied", () => {
    localStorage.setItem(keys[1], JSON.stringify("Saved name"));
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Blocked"); });
    const hook = renderHook(() => useStoredState(keys[1], "Default name"));
    expect(hook.result.current[0]).toBe("Saved name");
    act(() => hook.result.current[1]("Visit name"));
    expect(hook.result.current[0]).toBe("Visit name");
    expect(localStorage.getItem(keys[1])).toBe('"Saved name"');
  });

  it("keeps updates in memory if JSON serialization fails without writing or clearing", () => {
    const write = vi.spyOn(Storage.prototype, "setItem");
    const clear = vi.spyOn(Storage.prototype, "clear");
    const remove = vi.spyOn(Storage.prototype, "removeItem");
    const hook = renderHook(() => useStoredState<object>("repbook-workout", {}));
    write.mockClear();
    const circular: { self?: unknown } = {};
    circular.self = circular;
    act(() => hook.result.current[1](circular));
    expect(hook.result.current[0]).toBe(circular);
    expect(write).not.toHaveBeenCalled();
    expect(clear).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
    act(() => hook.result.current[1]({ recovered: true }));
    expect(write).toHaveBeenCalledWith("repbook-workout", '{"recovered":true}');
  });
});
