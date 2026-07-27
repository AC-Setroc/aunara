import type { LanguageCode } from "../types";

export type InterfaceLanguage = "en" | "es";

export function interfaceLanguage(language: LanguageCode): InterfaceLanguage {
  return language === "en" ? "en" : "es";
}

export function tr(language: LanguageCode, english: string, spanish: string): string {
  return interfaceLanguage(language) === "es" ? spanish : english;
}
