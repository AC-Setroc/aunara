import { copyFile, lstat, readFile, readdir } from "node:fs/promises";
import { join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const STATIC_FILES = new Set([
  "index.html", "404.html", "manifest.webmanifest", "sw.js", "og.png",
  "DATASET_LICENSE", "DATASET_NOTICE.md",
  "brand/aunara-training-systems.svg", "brand/aunara-app-icon.svg",
  "brand/aunara-symbol.svg", "brand/aunara-symbol-reverse.svg",
  "icons/aunara-180.png", "icons/aunara-192.png", "icons/aunara-512.png",
  "icons/repbook-180.png", "icons/repbook-192.png", "icons/repbook-512.png",
  "exercise-art/pilot/push-up-aunara-keyframes-v1.png",
  "exercise-art/pilot/push-up-aunara-v1.gif",
  "exercise-art/pilot/push-up-aunara-v1.webp",
  "data/exercises.json", "data/exercises.schema.json",
  "data/exercise-directory/en-es.json", "data/exercise-directory/en-es.schema.json",
  "data/exercise-directory/name-overrides.es.json",
  "data/exercise-directory/owned-media.json",
  "data/exercise-directory/owned-media.schema.json",
  "data/exercise-directory/taxonomy.es.json",
]);

const REQUIRED_FILES = [
  "index.html", "404.html", "manifest.webmanifest", "sw.js",
  "data/exercises.json", "brand/aunara-training-systems.svg",
  "icons/aunara-192.png", "icons/aunara-512.png",
];

const GENERATED_ASSET = /^assets\/[a-zA-Z0-9_-]+\.(?:js|css|woff2?|svg|png|webp|gif)$/;

async function collectFiles(directory, root = directory) {
  const found = [];
  for (const entry of await readdir(directory)) {
    const fullPath = join(directory, entry);
    const stat = await lstat(fullPath);
    if (stat.isSymbolicLink()) throw new Error(`Pages artifact contains a symlink: ${fullPath}`);
    if (stat.isDirectory()) {
      found.push(...await collectFiles(fullPath, root));
    } else if (stat.isFile()) {
      found.push(relative(root, fullPath).split(sep).join("/"));
    } else {
      throw new Error(`Pages artifact contains a non-file entry: ${fullPath}`);
    }
  }
  return found;
}

export async function checkPagesClient(clientDirectory, basePath = "/") {
  if (!/^\/(?:[a-zA-Z0-9_-]+\/)*$/.test(basePath)) {
    throw new Error(`Pages base must be root or a project directory path: ${basePath}`);
  }

  const files = await collectFiles(clientDirectory);
  for (const file of files) {
    if (!STATIC_FILES.has(file) && !GENERATED_ASSET.test(file)) {
      throw new Error(`Unexpected file in Pages artifact: ${file}`);
    }
  }
  for (const file of REQUIRED_FILES) {
    if (!files.includes(file)) throw new Error(`Missing Pages file: ${file}`);
  }
  if (!files.some((file) => file.endsWith(".js") && file.startsWith("assets/"))) {
    throw new Error("Missing compiled JavaScript in Pages artifact");
  }

  const html = await readFile(join(clientDirectory, "index.html"), "utf8");
  const notFound = await readFile(join(clientDirectory, "404.html"), "utf8");
  if (html !== notFound) throw new Error("404.html must match the SPA entry page");
  const entryUrl = new URL(`https://example.invalid${basePath}`);
  for (const match of html.matchAll(/\b(?:src|href|content)="(\/[^\"]+)"/g)) {
    const assetUrl = new URL(match[1], entryUrl);
    if (assetUrl.origin !== entryUrl.origin || !assetUrl.pathname.startsWith(basePath)) {
      throw new Error(`HTML references an asset outside ${basePath}: ${match[1]}`);
    }
    if (!files.includes(assetUrl.pathname.slice(basePath.length))) {
      throw new Error(`HTML references a missing artifact file: ${match[1]}`);
    }
  }
  const manifest = JSON.parse(await readFile(join(clientDirectory, "manifest.webmanifest"), "utf8"));
  const manifestUrl = new URL(`https://example.invalid${basePath}manifest.webmanifest`);
  for (const value of [manifest.start_url, manifest.scope, ...manifest.icons.map((icon) => icon.src)]) {
    const target = new URL(value, manifestUrl);
    if (target.origin !== manifestUrl.origin || !target.pathname.startsWith(basePath)) {
      throw new Error(`Manifest path escapes ${basePath}: ${value}`);
    }
  }
  if (new URL(manifest.start_url, manifestUrl).pathname !== basePath ||
      new URL(manifest.scope, manifestUrl).pathname !== basePath) {
    throw new Error("Manifest launch and scope must equal the deployment base");
  }
  return files;
}

const modulePath = fileURLToPath(import.meta.url);
if (process.argv[1] && resolve(process.argv[1]) === modulePath) {
  const basePath = process.env.AUNARA_BASE_PATH ?? "/";
  const clientDirectory = resolve(process.cwd(), "dist/client");
  await copyFile(join(clientDirectory, "index.html"), join(clientDirectory, "404.html"));
  const files = await checkPagesClient(clientDirectory, basePath);
  console.log(`Pages client allowlist passed: ${files.length} files under ${basePath}`);
}
