import { type InputHTMLAttributes, useEffect, useState } from "react";

type NumberInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> & {
  value: number | undefined;
  onValue: (value: number) => void;
};

/**
 * Number field that keeps its own text, so it can be emptied and retyped without a "0" being forced
 * into it (`Number("")` is 0). Only a valid number is reported; leaving it empty restores the last one.
 */
export function NumberInput({ value, onValue, onBlur, ...rest }: NumberInputProps) {
  const [text, setText] = useState(value === undefined ? "" : String(value));
  useEffect(() => {
    setText((current) => current !== "" && Number(current) !== value ? String(value ?? "") : current);
  }, [value]);
  return (
    <input
      {...rest}
      type="number"
      value={text}
      onChange={(event) => {
        const next = event.target.value.replace(/^0+(?=\d)/, "");
        setText(next);
        const parsed = Number(next);
        if (next !== "" && Number.isFinite(parsed)) onValue(parsed);
      }}
      onBlur={(event) => {
        setText(value === undefined ? "" : String(value));
        onBlur?.(event);
      }}
    />
  );
}
