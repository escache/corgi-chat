import { describe, expect, it } from "vitest";

import { livekitRoomName } from "./api";

describe("livekitRoomName", () => {
  it("maps slug to deterministic livekit room id", () => {
    expect(livekitRoomName("game-night-abc1")).toBe("corgi-game-night-abc1");
  });
});
