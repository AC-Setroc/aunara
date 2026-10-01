import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { checkPagesClient } from "./check-pages-client.mjs";

async function fixture() {
  const directory = await mkdtemp(join(tmpdir(), "aunara-pages-test-"));
  for (const folder of ["assets", "data", "brand", "icons"]) {
    await mkdir(join(directory, folder));
  }
  const html = '<link rel="manifest" href="/aunara/manifest.webmanifest"><script src="/aunara/assets/main.js"></script>';
  for (const file of ["index.html", "404.html"]) await writeFile(join(directory, file), html);
  await writeFile(join(directory, "manifest.webmanifest"), JSON.stringify({
    start_url: "./", scope: "./", icons: [{ src: "icons/aunara-192.png" }],
  }));
  for (const file of ["sw.js", "assets/main.js", "data/exercises.json",
    "brand/aunara-training-systems.svg", "icons/aunara-192.png", "icons/aunara-512.png"]) {
    await writeFile(join(directory, file), "fixture");
  }
  return directory;
}

test("accepts only a scoped client artifact", async () => {
  const directory = await fixture();
  try {
    assert.equal((await checkPagesClient(directory)).length, 9);
  } finally {
    await rm(directory, { recursive: true });
  }
});

test("rejects a server file even when the client is otherwise valid", async () => {
  const directory = await fixture();
  try {
    await mkdir(join(directory, "server"));
    await writeFile(join(directory, "server/index.js"), "private");
    await assert.rejects(checkPagesClient(directory), /Unexpected file.*server\/index.js/);
  } finally {
    await rm(directory, { recursive: true });
  }
});

test("rejects a root-relative asset path", async () => {
  const directory = await fixture();
  try {
    await writeFile(join(directory, "index.html"), '<script src="/assets/main.js"></script>');
    await writeFile(join(directory, "404.html"), '<script src="/assets/main.js"></script>');
    await assert.rejects(checkPagesClient(directory), /outside \/aunara\//);
  } finally {
    await rm(directory, { recursive: true });
  }
});
