import { describe, expect, it } from "vitest";

import { generateRoomSlug, isValidRoomSlug } from "@corgi-chat/core";

describe("room slug API constraints", () => {
  it("generates unique-looking slugs for repeated calls", () => {
    const slugs = new Set(Array.from({ length: 20 }, () => generateRoomSlug("Game Night")));
    expect(slugs.size).toBeGreaterThan(1);
    for (const slug of slugs) {
      expect(isValidRoomSlug(slug)).toBe(true);
    }
  });
});
