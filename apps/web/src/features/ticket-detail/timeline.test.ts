import { describe, expect, it } from "vitest";
import { customerMessage, internalNote, statusChange } from "../../test/fixtures.ts";
import { buildTimeline } from "./timeline.ts";

describe("buildTimeline", () => {
  it("puts comments and changes in one stream, oldest first", () => {
    const timeline = buildTimeline([internalNote, customerMessage], [statusChange]);

    expect(timeline.map((entry) => entry.kind)).toEqual(["event", "comment", "comment"]);
  });

  it("puts a reply before the change made with it", () => {
    const reply = {
      ...internalNote,
      kind: "public_reply" as const,
      createdAt: statusChange.createdAt,
    };

    const timeline = buildTimeline([reply], [statusChange]);

    expect(timeline.map((entry) => entry.kind)).toEqual(["comment", "event"]);
  });
});
