import type { TicketListItem } from "@support-desk/shared";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TicketTable } from "./TicketTable.tsx";

function buildTicket(overrides: Partial<TicketListItem> = {}): TicketListItem {
  return {
    id: "CHK-101",
    projectId: "checkout",
    title: "Apple Pay sheet closes without charging on Safari 18",
    status: "in_progress",
    priority: "urgent",
    assignee: {
      id: "diego-alvarez",
      name: "Diego Alvarez",
      initials: "DA",
      email: "diego.alvarez@brightcart.example",
      avatarColor: "amber",
    },
    requester: {
      id: 1,
      name: "Anna Berg",
      email: "anna@northgateoutfitters.example",
      organization: {
        id: "northgate-outfitters",
        name: "Northgate Outfitters",
        tier: "enterprise",
      },
    },
    labels: [{ id: 4, name: "Payments", color: "green" }],
    createdAt: "2026-09-28T09:00:00.000Z",
    updatedAt: "2026-09-29T07:00:00.000Z",
    firstRespondedAt: "2026-09-28T09:40:00.000Z",
    resolvedAt: null,
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
