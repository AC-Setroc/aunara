import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import test from "node:test";

async function workerHarness(scope = "https://ac-setroc.github.io/aunara/") {
  const handlers = new Map();
  const added = [];
  const deleted = [];
  const matched = [];
  const cache = { addAll: async (urls) => added.push(...urls), put: async () => {} };
  const context = {
    URL,
    caches: {
      open: async () => cache,
      keys: async () => ["aunara-shell-v2", "another-app-v1", "aunara-project-shell-old"],
      delete: async (name) => deleted.push(name),
      match: async (url) => { matched.push(url); return { offline: true }; },
    },
    fetch: async () => { throw new Error("offline"); },
    self: {
      registration: { scope },
      addEventListener: (name, handler) => handlers.set(name, handler),
      skipWaiting: () => {},
      clients: { claim: () => {} },
    },
  };
  const source = await readFile(new URL("../public/sw.js", import.meta.url), "utf8");
  runInNewContext(source, context);
  return { handlers, added, deleted, matched };
}

test("precache and cleanup stay within the Aunara project", async () => {
  const { handlers, added, deleted } = await workerHarness();
  let install;
  handlers.get("install")({ waitUntil: (promise) => { install = promise; } });
  await install;
  assert.equal(added.length, 4);
  assert.ok(added.every((url) => url.startsWith("https://ac-setroc.github.io/aunara/")));

  let activate;
  handlers.get("activate")({ waitUntil: (promise) => { activate = promise; } });
  await activate;
  assert.deepEqual(deleted, ["aunara-project-shell-old"]);
});

for (const scope of ["https://aunaratraining.com/", "https://ac-setroc.github.io/aunara/"]) {
  test(`precache and offline navigation use exactly ${scope}`, async () => {
    const { handlers, added, matched, deleted } = await workerHarness(scope);
    let install;
    handlers.get("install")({ waitUntil: (promise) => { install = promise; } });
    await install;
    assert.deepEqual(added, [scope, ...["manifest.webmanifest", "icons/aunara-192.png", "icons/aunara-512.png"].map(path => new URL(path, scope).href)]);
    let activation;
    handlers.get("activate")({ waitUntil: promise => { activation = promise; } });
    await activation;
    assert.deepEqual(deleted, ["aunara-project-shell-old"]);
    let response;
    handlers.get("fetch")({ request: { method: "GET", url: new URL("nested/route", scope).href, mode: "navigate" }, respondWith: promise => { response = promise; } });
    assert.equal((await response).offline, true);
    assert.deepEqual(matched, [scope]);
  });
  test(`never handles another origin or non-GET requests at ${scope}`, async () => {
    const { handlers } = await workerHarness(scope);
    for (const request of [
      { method: "GET", url: "https://other.invalid/data/exercises.json", mode: "same-origin" },
      { method: "POST", url: scope, mode: "same-origin" },
    ]) {
      let handled = false;
      handlers.get("fetch")({ request, respondWith: () => { handled = true; } });
      assert.equal(handled, false);
    }
  });
}

test("project worker never handles a sibling path with the same prefix", async () => {
  const { handlers } = await workerHarness();
  let handled = false;
  handlers.get("fetch")({ request: { method: "GET", url: "https://ac-setroc.github.io/aunara-other/", mode: "navigate" }, respondWith: () => { handled = true; } });
  assert.equal(handled, false);
});

test("ignores root-site requests and falls back within project scope", async () => {
  const { handlers, matched } = await workerHarness();
  let rootHandled = false;
  handlers.get("fetch")({
    request: { method: "GET", url: "https://ac-setroc.github.io/data/exercises.json", mode: "same-origin" },
    respondWith: () => { rootHandled = true; },
  });
  assert.equal(rootHandled, false);

  let response;
  handlers.get("fetch")({
    request: { method: "GET", url: "https://ac-setroc.github.io/aunara/", mode: "navigate" },
    respondWith: (promise) => { response = promise; },
  });
  assert.equal((await response).offline, true);
  assert.deepEqual(matched, ["https://ac-setroc.github.io/aunara/"]);
});
