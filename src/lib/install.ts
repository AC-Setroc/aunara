export type InstallGuide = "android" | "ios" | "desktop" | "installed";

export function getInstallGuide(userAgent: string, standalone: boolean): InstallGuide {
  if (standalone) return "installed";

  const normalized = userAgent.toLocaleLowerCase();
  if (normalized.includes("android")) return "android";
  if (normalized.includes("iphone") || normalized.includes("ipad") || normalized.includes("ipod")) {
    return "ios";
  }
  return "desktop";
}
