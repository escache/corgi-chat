import { describe, expect, it } from "vitest";

import { generateRoomSlug, isValidRoomSlug } from "./slug";

describe("generateRoomSlug", () => {
  it("returns a slug within length bounds", () => {
    const slug = generateRoomSlug();
    expect(slug.length).toBeGreaterThanOrEqual(6);
    expect(slug.length).toBeLessThanOrEqual(32);
    expect(isValidRoomSlug(slug)).toBe(true);
  });

  it("slugifies room names", () => {
    const slug = generateRoomSlug("Game Night!");
    expect(slug).toMatch(/game-night/);
    expect(isValidRoomSlug(slug)).toBe(true);
  });
});

describe("isValidRoomSlug", () => {
  it("rejects invalid slugs", () => {
    expect(isValidRoomSlug("ab")).toBe(false);
    expect(isValidRoomSlug("UPPER")).toBe(false);
    expect(isValidRoomSlug("bad_slug")).toBe(false);
  });
});
