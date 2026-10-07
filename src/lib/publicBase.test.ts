import { describe, expect, it } from "vitest";
import { publicBaseUrl } from "./publicBase";

describe("publicBaseUrl", () => {
  it("keeps canonical-domain email callbacks at the root", () => {
    expect(publicBaseUrl("/", "https://aunaratraining.com"))
      .toBe("https://aunaratraining.com/");
  });
  it("keeps local root deployment working", () => {
    expect(publicBaseUrl("/", "http://localhost:5173")).toBe("http://localhost:5173/");
  });

  it("keeps account email callbacks in the Pages project path", () => {
    expect(publicBaseUrl("/aunara/", "https://ac-setroc.github.io"))
      .toBe("https://ac-setroc.github.io/aunara/");
  });
});
