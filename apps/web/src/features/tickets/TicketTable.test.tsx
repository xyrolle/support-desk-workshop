import type { Ticket } from "@support-desk/shared";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TicketTable } from "./TicketTable.tsx";

function buildTicket(overrides: Partial<Ticket> = {}): Ticket {
  return {
    id: "CHK-101",
    projectId: "checkout",
    title: "Apple Pay sheet closes without charging on Safari 18",
    description: "Customers on Safari 18.1 see the Apple Pay sheet open and immediately dismiss.",
    status: "in_progress",
    priority: "urgent",
    assignee: { id: "diego-alvarez", name: "Diego Alvarez", initials: "DA", avatarColor: "amber" },
    createdAt: "2026-03-01T09:00:00.000Z",
    updatedAt: "2026-03-02T07:00:00.000Z",
    ...overrides,
  };
}

describe("TicketTable", () => {
  it("shows the id, title, status, priority and assignee of each ticket", () => {
    render(<TicketTable tickets={[buildTicket()]} />);

    expect(screen.getByText("CHK-101")).toBeInTheDocument();
    expect(
      screen.getByText("Apple Pay sheet closes without charging on Safari 18"),
    ).toBeInTheDocument();
    expect(screen.getByText("In progress")).toBeInTheDocument();
    expect(screen.getByText("Urgent")).toBeInTheDocument();
    expect(screen.getByText("Diego Alvarez")).toBeInTheDocument();
  });

  it("renders one row per ticket below the header row", () => {
    const tickets = [buildTicket({ id: "CHK-101" }), buildTicket({ id: "CHK-102" })];

    render(<TicketTable tickets={tickets} />);

    expect(screen.getAllByRole("row")).toHaveLength(3);
  });

  it("says Unassigned when a ticket has no assignee", () => {
    render(<TicketTable tickets={[buildTicket({ assignee: null })]} />);

    expect(screen.getByText("Unassigned")).toBeInTheDocument();
  });
});
