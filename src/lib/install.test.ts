import { describe, expect, it } from "vitest";
import { getInstallGuide } from "./install";

describe("install guidance", () => {
  it("recognizes when Repbook is already running as an installed app", () => {
    expect(getInstallGuide("Mozilla/5.0 (Linux; Android 15)", true)).toBe("installed");
  });

  it("shows Android and iPhone instructions for the matching device", () => {
    expect(getInstallGuide("Mozilla/5.0 (Linux; Android 15)", false)).toBe("android");
    expect(getInstallGuide("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)", false)).toBe("ios");
  });

  it("keeps desktop instructions separate from phone installation", () => {
    expect(getInstallGuide("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", false)).toBe("desktop");
  });
});
