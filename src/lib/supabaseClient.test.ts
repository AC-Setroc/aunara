import { describe, expect, it, vi } from "vitest";
import { passwordRecoverySignalFor, type supabaseClient } from "./supabaseClient";

function fixture() {
  let emit: (event: string, session: any) => void = () => {};
  const client = { auth: { onAuthStateChange: vi.fn((callback) => {
    emit = callback;
    return { data: { subscription: { unsubscribe: vi.fn() } } };
  }) } } as unknown as NonNullable<typeof supabaseClient>;
  const signal = passwordRecoverySignalFor(client);
  const user = { id: "fixture-1", email: "fixture@example.invalid" };
  return { signal, user, client, emit: (event: string, session: any) => emit(event, session) };
}

describe("verified in-memory password recovery signal", () => {
  it("buffers only minimal verified identity until a matching consumer, once", () => {
    const { signal, emit, user, client } = fixture();
    emit("PASSWORD_RECOVERY", { user, access_token: "synthetic-never-retained" });
    expect(passwordRecoverySignalFor(client)).toBe(signal);
    expect(signal.consume(user)).toEqual(user);
    expect(signal.consume(user)).toBeNull();
    emit("PASSWORD_RECOVERY", { user });
    expect(signal.consume(user)).toBeNull();
  });
  it.each(["INITIAL_SESSION", "SIGNED_IN", "TOKEN_REFRESHED", "USER_UPDATED"])("does not infer recovery from %s", (event) => {
    const { signal, emit, user } = fixture();
    emit(event, { user });
    expect(signal.consume(user)).toBeNull();
  });
  it("preserves pending recovery across ordinary events for the same user", () => {
    const { signal, emit, user } = fixture();
    emit("PASSWORD_RECOVERY", { user });
    emit("SIGNED_IN", { user });
    expect(signal.consume(user)).toEqual(user);
  });
  it.each(["SIGNED_OUT", "INITIAL_SESSION", "SIGNED_IN"])("clears on %s with a changed or absent user", (event) => {
    const { signal, emit, user } = fixture();
    emit("PASSWORD_RECOVERY", { user });
    emit(event, event === "SIGNED_OUT" ? null : { user: { id: "fixture-2" } });
    expect(signal.consume(user)).toBeNull();
  });
  it("rejects missing identity and mismatched consumers; permits a later independent return", () => {
    const { signal, emit, user } = fixture();
    emit("PASSWORD_RECOVERY", null);
    expect(signal.consume(user)).toBeNull();
    emit("PASSWORD_RECOVERY", { user });
    expect(signal.consume({ id: "fixture-2" })).toBeNull();
    expect(signal.consume(user)).toBeNull();
    emit("SIGNED_OUT", null);
    emit("PASSWORD_RECOVERY", { user });
    expect(signal.consume(user)).toEqual(user);
  });
});
