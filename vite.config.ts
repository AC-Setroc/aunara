import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Local builds stay at /; the Pages workflow supplies /aunara/ for its project site.
const nodeProcess = (globalThis as typeof globalThis & {
  process?: { env?: Record<string, string | undefined> };
}).process;
const base = nodeProcess?.env?.AUNARA_BASE_PATH ?? "/";
if (!/^\/(?:[a-zA-Z0-9_-]+\/)*$/.test(base)) {
  throw new Error(`AUNARA_BASE_PATH must be an absolute directory path: ${base}`);
}

export default defineConfig({
  base,
  plugins: [react()],
});
