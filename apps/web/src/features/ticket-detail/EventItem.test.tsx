import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { diego, maya, statusChange } from "../../test/fixtures.ts";
import { EventItem } from "./EventItem.tsx";

function renderEvent(event: Parameters<typeof EventItem>[0]["event"]) {
  return render(
    <ul>
      <EventItem event={event} />
    </ul>,
  );
}

describe("EventItem", () => {
  it("says who changed the status, from what to what", () => {
    renderEvent(statusChange);

    expect(screen.getByRole("listitem")).toHaveTextContent(
      "Diego Alvarezchanged the status from Open to In progress",
    );
  });

  it("describes assigning a ticket", () => {
    renderEvent({
      id: 11,
      ticketId: "CHK-196",
      type: "assignee_changed",
      actor: maya,
      from: null,
      to: diego,
      createdAt: "2026-09-27T18:29:00.000Z",
    });

    expect(screen.getByRole("listitem")).toHaveTextContent("assigned the ticket to Diego Alvarez");
  });

  it("names Support Desk for changes nobody made by hand", () => {
    renderEvent({ ...statusChange, actor: null, from: "blocked", to: "in_progress" });

    expect(screen.getByText("Support Desk")).toBeInTheDocument();
    expect(screen.getByRole("listitem")).toHaveTextContent("from Waiting on customer");
  });
});
