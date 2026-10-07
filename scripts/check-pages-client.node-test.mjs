import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { checkPagesClient } from "./check-pages-client.mjs";

async function fixture(basePath = "/") {
  const directory = await mkdtemp(join(tmpdir(), "aunara-pages-test-"));
  for (const folder of ["assets", "data", "brand", "icons"]) {
    await mkdir(join(directory, folder));
  }
  const html = `<link rel="manifest" href="${basePath}manifest.webmanifest"><script src="${basePath}assets/main.js"></script>`;
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
  const directory = await fixture("/aunara/");
  try {
    await writeFile(join(directory, "index.html"), '<script src="/assets/main.js"></script>');
    await writeFile(join(directory, "404.html"), '<script src="/assets/main.js"></script>');
    await assert.rejects(checkPagesClient(directory, "/aunara/"), /outside \/aunara\//);
  } finally {
    await rm(directory, { recursive: true });
  }
});

for (const base of ["/", "/aunara/"]) {
  test(`accepts the client artifact at ${base}`, async () => {
    const directory = await fixture(base);
    try { assert.equal((await checkPagesClient(directory, base)).length, 9); }
    finally { await rm(directory, { recursive: true }); }
  });
  for (const file of ["server/index.js", "src/main.ts", ".env"]) {
    test(`rejects ${file} at ${base}`, async () => {
      const directory = await fixture(base);
      try {
        if (file.includes("/")) await mkdir(join(directory, file.split("/")[0]));
        await writeFile(join(directory, file), "fixture-not-secret");
        await assert.rejects(checkPagesClient(directory, base), /Unexpected file/);
      } finally { await rm(directory, { recursive: true }); }
    });
  }
  test(`rejects foreign-origin manifest scope at ${base}`, async () => {
    const directory = await fixture(base);
    try {
      await writeFile(join(directory, "manifest.webmanifest"), JSON.stringify({ start_url: "./", scope: "https://other.invalid/", icons: [] }));
      await assert.rejects(checkPagesClient(directory, base), /escapes/);
    } finally { await rm(directory, { recursive: true }); }
  });
}

test("root artifact rejects a leftover project asset reference", async () => {
  const directory = await fixture();
  try {
    for (const file of ["index.html", "404.html"]) await writeFile(join(directory, file), '<script src="/aunara/assets/main.js"></script>');
    await assert.rejects(checkPagesClient(directory, "/"), /missing artifact file/);
  } finally { await rm(directory, { recursive: true }); }
});

for (const base of ["", "//other.invalid/", "/../", "/aunara", "https://example.invalid/"]) {
  test(`rejects unsafe base ${JSON.stringify(base)}`, async () => {
    await assert.rejects(checkPagesClient("unused", base), /Pages base/);
  });
}
