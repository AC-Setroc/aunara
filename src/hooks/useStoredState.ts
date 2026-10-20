import { useCallback, useEffect, useState } from "react";

export function useStoredState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setStoredValue = useCallback((action: React.SetStateAction<T>) => {
    setValue((current) => {
      const next = typeof action === "function" ? (action as (prev: T) => T)(current) : action;
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // Keep the current visit's React state when persistence is unavailable.
      }
      return next;
    });
  }, [key]);

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Keep the current visit's React state when persistence is unavailable.
    }
  }, [key, value]);

  return [value, setStoredValue] as const;
}
