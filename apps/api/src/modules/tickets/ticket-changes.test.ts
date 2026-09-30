import { describe, expect, it } from "vitest";
import { describeChanges, type TicketState } from "./ticket-changes.ts";

const current: TicketState = {
  status: "open",
  priority: "medium",
  assigneeId: null,
  labelIds: [1, 4],
};

describe("describeChanges", () => {
  it("describes each property that changes", () => {
    const changes = describeChanges(current, {
      status: "in_progress",
      priority: "high",
      assigneeId: "diego-alvarez",
    });

    expect(changes).toEqual([
      { type: "status_changed", from: "open", to: "in_progress" },
      { type: "priority_changed", from: "medium", to: "high" },
      { type: "assignee_changed", from: null, to: "diego-alvarez" },
    ]);
  });

  it("ignores properties that keep their value", () => {
    expect(describeChanges(current, { status: "open", priority: "medium" })).toEqual([]);
  });

  it("describes unassigning as a change to null", () => {
    const assigned = { ...current, assigneeId: "diego-alvarez" };

    expect(describeChanges(assigned, { assigneeId: null })).toEqual([
      { type: "assignee_changed", from: "diego-alvarez", to: null },
    ]);
  });

  it("describes a new label set as labels added and removed", () => {
    expect(describeChanges(current, { labelIds: [4, 7] })).toEqual([
      { type: "label_added", labelId: 7 },
      { type: "label_removed", labelId: 1 },
    ]);
  });

  it("does not care about the order of labels", () => {
    expect(describeChanges(current, { labelIds: [4, 1] })).toEqual([]);
  });
});
