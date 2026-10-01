export function publicBaseUrl(basePath: string, origin: string): string {
  return new URL(basePath, origin).href;
}
