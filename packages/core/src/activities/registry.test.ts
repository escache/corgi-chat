import { describe, expect, it } from "vitest";

import { ACTIVITY_GROUPS, ACTIVITY_REGISTRY, listActivities } from "./registry";

describe("activity registry", () => {
  it("includes draw and youtube sync activities", () => {
    expect(ACTIVITY_REGISTRY.draw.requiresSync).toBe(true);
    expect(ACTIVITY_REGISTRY.youtube.requiresSync).toBe(true);
    expect(ACTIVITY_REGISTRY.twitch.requiresSync).toBe(false);
  });

  it("lists every registered activity exactly once across groups", () => {
    const grouped = ACTIVITY_GROUPS.flatMap((group) => group.activities);
    const listed = listActivities().map((activity) => activity.id);
    expect(new Set(grouped).size).toBe(grouped.length);
    expect(new Set(listed)).toEqual(new Set(grouped));
  });
});
