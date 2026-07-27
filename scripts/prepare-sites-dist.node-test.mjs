import assert from "node:assert/strict";
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

test("places the Vite app in the Sites client asset directory", async () => {
  const fixtureRoot = await mkdtemp(join(tmpdir(), "repbook-sites-build-"));
  const fixtureDist = join(fixtureRoot, "dist");

  try {
    await mkdir(join(fixtureDist, "assets"), { recursive: true });
    await writeFile(join(fixtureDist, "index.html"), "<main>Repbook</main>");
    await writeFile(join(fixtureDist, "assets", "app.js"), "console.log('Repbook')");

    const buildModule = await import(`./prepare-sites-dist.mjs?test=${Date.now()}`);
    assert.equal(typeof buildModule.prepareSitesDist, "function");

    await buildModule.prepareSitesDist(fixtureRoot);

    assert.equal(
      await readFile(join(fixtureDist, "client", "index.html"), "utf8"),
      "<main>Repbook</main>",
    );
    await access(join(fixtureDist, "client", "assets", "app.js"));
    await access(join(fixtureDist, "server", "index.js"));
    await assert.rejects(access(join(fixtureDist, "index.html")));
  } finally {
    await rm(fixtureRoot, { recursive: true, force: true });
  }
});
