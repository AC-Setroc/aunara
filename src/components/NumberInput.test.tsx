// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NumberInput } from "./NumberInput";
afterEach(cleanup);
function Harness({ onValue = vi.fn(), start = 3 }: { onValue?: (value: number) => void; start?: number }) {
  const [value, setValue] = useState(start);
  return <NumberInput aria-label="n" min={1} value={value} onValue={(next) => { setValue(next); onValue(next); }} />;
}
describe("NumberInput", () => {
  it("can be emptied and retyped without keeping a leading zero", () => {
    render(<Harness />);
    const input = screen.getByLabelText("n") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "" } });
    expect(input.value).toBe("");
    fireEvent.change(input, { target: { value: "08" } });
    expect(input.value).toBe("8");
  });
  it("does not report an empty field and restores the last valid number on blur", () => {
    const onValue = vi.fn();
    render(<Harness onValue={onValue} />);
    const input = screen.getByLabelText("n") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "" } });
    expect(onValue).not.toHaveBeenCalled();
    fireEvent.blur(input);
    expect(input.value).toBe("3");
  });
  it("follows a value changed from outside while it is not being edited", () => {
    const { rerender } = render(<NumberInput aria-label="n" value={3} onValue={vi.fn()} />);
    rerender(<NumberInput aria-label="n" value={7} onValue={vi.fn()} />);
    expect((screen.getByLabelText("n") as HTMLInputElement).value).toBe("7");
  });
});
