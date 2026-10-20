import { useEffect, useState } from "react";

export interface DecimalInputProps {
  ariaLabel?: string;
  value?: number | null;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  id?: string;
}

export function parseDecimalInput(raw: string): number | null {
  const clean = raw.replace(",", ".").replace(/^0+(?=\d)/, "").trim();
  if (!clean || clean === "." || clean.endsWith(".")) {
    if (clean && clean !== ".") {
      const base = parseFloat(clean);
      return Number.isFinite(base) ? base : null;
    }
    return null;
  }
  const parsed = Number(clean);
  return Number.isFinite(parsed) ? parsed : null;
}

export function DecimalInput({
  ariaLabel,
  value,
  onChange,
  min,
  max,
  required,
  placeholder,
  className,
  id,
}: DecimalInputProps) {
  const [text, setText] = useState(() => (value != null && Number.isFinite(value) ? String(value) : ""));

  useEffect(() => {
    const currentNum = parseDecimalInput(text);
    if (currentNum !== value) {
      setText(value != null && Number.isFinite(value) ? String(value) : "");
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits, comma and dot
    const filtered = e.target.value.replace(/[^0-9.,]/g, "");
    // Ensure at most one decimal separator (comma or dot), stripping extra separators
    let seenSeparator = false;
    let sanitized = "";
    for (const char of filtered) {
      if (char === "." || char === ",") {
        if (!seenSeparator) {
          sanitized += char;
          seenSeparator = true;
        }
      } else {
        sanitized += char;
      }
    }
    // Avoid multiple leading zeros like 009 -> 9 (but keep 0, or 0. or 0)
    if (/^0\d/.test(sanitized)) {
      sanitized = sanitized.replace(/^0+(?=\d)/, "");
    }
    setText(sanitized);

    const parsed = parseDecimalInput(sanitized);
    onChange(parsed);
  };

  const handleBlur = () => {
    const parsed = parseDecimalInput(text);
    if (parsed != null) {
      if (min !== undefined && parsed < min) {
        setText(String(min));
        onChange(min);
        return;
      }
      if (max !== undefined && parsed > max) {
        setText(String(max));
        onChange(max);
        return;
      }
    }
  };

  return (
    <input
      id={id}
      aria-label={ariaLabel}
      type="text"
      inputMode="decimal"
      value={text}
      onChange={handleChange}
      onBlur={handleBlur}
      required={required}
      placeholder={placeholder}
      className={className}
    />
  );
}
