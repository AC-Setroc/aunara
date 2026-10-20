// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DecimalInput, parseDecimalInput } from "./DecimalInput";

afterEach(() => {
  cleanup();
});

describe("parseDecimalInput", () => {
  it("converts comma to dot and parses valid floats", () => {
    expect(parseDecimalInput("75,5")).toBe(75.5);
    expect(parseDecimalInput("75.5")).toBe(75.5);
    expect(parseDecimalInput("175")).toBe(175);
  });

  it("handles leading zeros and partial trailing separator", () => {
    expect(parseDecimalInput("075,5")).toBe(75.5);
    expect(parseDecimalInput("75,")).toBe(75);
    expect(parseDecimalInput("75.")).toBe(75);
  });

  it("returns null for empty or invalid input", () => {
    expect(parseDecimalInput("")).toBeNull();
    expect(parseDecimalInput(",")).toBeNull();
    expect(parseDecimalInput(".")).toBeNull();
    expect(parseDecimalInput("abc")).toBeNull();
  });
});

describe("DecimalInput component", () => {
  it("allows typing comma and notifies numeric change", () => {
    const handleChange = vi.fn();
    render(<DecimalInput ariaLabel="Peso" value={null} onChange={handleChange} />);
    const input = screen.getByLabelText("Peso") as HTMLInputElement;

    fireEvent.change(input, { target: { value: "7" } });
    expect(handleChange).toHaveBeenCalledWith(7);

    fireEvent.change(input, { target: { value: "7," } });
    // Text retains comma while editing
    expect(input.value).toBe("7,");
    expect(handleChange).toHaveBeenCalledWith(7);

    fireEvent.change(input, { target: { value: "7,5" } });
    expect(input.value).toBe("7,5");
    expect(handleChange).toHaveBeenCalledWith(7.5);
  });

  it("prevents entering multiple commas or dots", () => {
    const handleChange = vi.fn();
    render(<DecimalInput ariaLabel="Peso" value={null} onChange={handleChange} />);
    const input = screen.getByLabelText("Peso") as HTMLInputElement;

    fireEvent.change(input, { target: { value: "7,5,2" } });
    // Second comma is ignored
    expect(input.value).toBe("7,52");
    expect(handleChange).toHaveBeenCalledWith(7.52);
  });
});
