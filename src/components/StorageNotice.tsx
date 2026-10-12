import { useState } from "react";
import { tr } from "../lib/i18n";
import type { LanguageCode } from "../types";

export const STORAGE_NOTICE_KEY = "aunara-storage-notice-v1";

interface StorageNoticeProps {
  language: LanguageCode;
  onLearnMore: () => void;
}

export function StorageNotice({ language, onLearnMore }: StorageNoticeProps) {
  const [acknowledged, setAcknowledged] = useState(() => {
    try {
      return window.localStorage.getItem(STORAGE_NOTICE_KEY) === "1";
    } catch {
      return false;
    }
  });

  if (acknowledged) return null;

  const acknowledge = () => {
    setAcknowledged(true);
    try {
      window.localStorage.setItem(STORAGE_NOTICE_KEY, "1");
    } catch {
      // Dismissal still works for this visit when device storage is unavailable.
    }
  };

  return (
    <aside className="storage-notice" aria-label={tr(language, "Device storage notice", "Aviso de almacenamiento en el dispositivo")}>
      <p>{tr(language,
        "Aunara stores preferences and app data on your device, keeps your session and caches technical resources for operation and offline use. This notice is informational; it does not replace acceptance of terms or health-data authorization.",
        "Aunara guarda preferencias y datos de uso de la app en tu dispositivo, mantiene tu sesión y conserva recursos técnicos para funcionar y usarla sin conexión. Este aviso es informativo; no sustituye la aceptación de términos ni la autorización de datos de salud.",
      )}</p>
      <div className="storage-notice-actions">
        <button type="button" onClick={onLearnMore}>{tr(language, "Learn more", "Más información")}</button>
        <button type="button" onClick={acknowledge}>{tr(language, "Understood", "Entendido")}</button>
      </div>
    </aside>
  );
}
