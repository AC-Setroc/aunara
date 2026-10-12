// Static server that mimics GitHub Pages for the review matrix:
// serves a client artifact under a base path with SPA fallback to 404.html.
// Usage: node server.mjs <port> <base> <dir>   e.g. node server.mjs 4301 /aunara/ ../builds/e4-aunara
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, normalize } from "node:path";

const [port, base, dir] = process.argv.slice(2);
if (!port || !base || !dir) { console.error("usage: server.mjs <port> <base> <dir>"); process.exit(2); }

const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".webmanifest": "application/manifest+json", ".svg": "image/svg+xml",
  ".png": "image/png", ".gif": "image/gif", ".webp": "image/webp", ".md": "text/markdown; charset=utf-8",
};

async function serveFile(path, res, status = 200) {
  const body = await readFile(path);
  res.writeHead(status, { "content-type": MIME[extname(path)] ?? "application/octet-stream", "cache-control": "no-store" });
  res.end(body);
}

createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  if (!url.pathname.startsWith(base)) {
    // Pages redirects project paths outside the base to the apex; mimic with 404 so leaks are visible.
    res.writeHead(404, { "content-type": "text/plain" }); res.end("outside base"); return;
  }
  const raw = decodeURIComponent(url.pathname.slice(base.length));
  const rel = raw === "" ? "index.html" : normalize(raw).replace(/^(\.\.[/\\])+/, "");
  const target = join(dir, rel);
  try {
    const info = await stat(target);
    if (info.isFile()) return await serveFile(target, res);
  } catch { /* fall through to SPA fallback */ }
  try { await serveFile(join(dir, "404.html"), res, 404); }
  catch { res.writeHead(404); res.end("not found"); }
}).listen(Number(port), "127.0.0.1", () => console.log(`serving ${dir} at http://127.0.0.1:${port}${base}`));
