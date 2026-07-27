import { mkdir, readdir, rename, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const workerSource = `const worker = {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404 || request.method !== "GET") return response;

    const acceptsHtml = (request.headers.get("accept") ?? "").includes("text/html");
    if (!acceptsHtml) return response;

    const indexUrl = new URL("/index.html", request.url);
    return env.ASSETS.fetch(new Request(indexUrl, request));
  },
};

export default worker;
`;

export async function prepareSitesDist(projectRoot) {
  const distDirectory = join(projectRoot, "dist");
  const clientDirectory = join(distDirectory, "client");
  const serverDirectory = join(distDirectory, "server");

  await rm(clientDirectory, { recursive: true, force: true });
  await mkdir(clientDirectory, { recursive: true });
  await mkdir(serverDirectory, { recursive: true });

  const entries = await readdir(distDirectory, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === "client" || entry.name === "server" || entry.name === ".openai") continue;
    await rename(
      join(distDirectory, entry.name),
      join(clientDirectory, entry.name),
    );
  }

  await writeFile(join(serverDirectory, "index.js"), workerSource);
}

const modulePath = fileURLToPath(import.meta.url);
if (process.argv[1] && resolve(process.argv[1]) === modulePath) {
  await prepareSitesDist(resolve(dirname(modulePath), ".."));
}
