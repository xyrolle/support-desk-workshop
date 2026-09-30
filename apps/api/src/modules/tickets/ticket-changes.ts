import type { TicketChanges, TicketPriority, TicketStatus } from "@support-desk/shared";
import type { TicketChange } from "../activity/ticket-change.ts";

export type TicketState = {
  status: TicketStatus;
  priority: TicketPriority;
  assigneeId: string | null;
  labelIds: number[];
};

/** What actually changes when `changes` is applied: one entry per event to record. */
export function describeChanges(current: TicketState, changes: TicketChanges): TicketChange[] {
  const result: TicketChange[] = [];

  if (changes.status !== undefined && changes.status !== current.status) {
    result.push({ type: "status_changed", from: current.status, to: changes.status });
  }
  if (changes.priority !== undefined && changes.priority !== current.priority) {
    result.push({ type: "priority_changed", from: current.priority, to: changes.priority });
  }
  if (changes.assigneeId !== undefined && changes.assigneeId !== current.assigneeId) {
    result.push({ type: "assignee_changed", from: current.assigneeId, to: changes.assigneeId });
  }
  if (changes.labelIds !== undefined) {
    result.push(...describeLabelChanges(current.labelIds, changes.labelIds));
  }
  return result;
}

function describeLabelChanges(currentIds: number[], nextIds: number[]): TicketChange[] {
  const added = nextIds.filter((labelId) => !currentIds.includes(labelId));
  const removed = currentIds.filter((labelId) => !nextIds.includes(labelId));
  return [
    ...added.map((labelId) => ({ type: "label_added" as const, labelId })),
    ...removed.map((labelId) => ({ type: "label_removed" as const, labelId })),
  ];
}
