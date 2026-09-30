import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { buildTicket } from "../../test/fixtures.ts";
import { renderPage } from "../../test/render.tsx";
import { TicketTable } from "./TicketTable.tsx";
import { SlaClockProvider } from "./use-now.ts";

function renderTable(tickets = [buildTicket()]) {
  return renderPage(
    <TicketTable
      tickets={tickets}
      columns={["id", "title", "customer", "status", "priority", "assignee", "updated"]}
    />,
    { path: "/", url: "/" },
  );
}

describe("TicketTable", () => {
  it("shows the chosen columns for each ticket", () => {
    renderTable();

    const row = screen.getAllByRole("row")[1];
    if (!row) {
      throw new Error("The table has no ticket row.");
    }
    expect(within(row).getByText("CHK-196")).toBeInTheDocument();
    expect(within(row).getByText("Atlas Sports Group")).toBeInTheDocument();
    expect(within(row).getByText("In progress")).toBeInTheDocument();
    expect(within(row).getByText("Urgent")).toBeInTheDocument();
    expect(within(row).getByText("Diego Alvarez")).toBeInTheDocument();
  });

  it("links each title to its ticket", () => {
    renderTable();

    expect(screen.getByRole("link", { name: /Customers charged twice/ })).toHaveAttribute(
      "href",
      "/projects/checkout/tickets/CHK-196",
    );
  });

  it("shows the clock that matters on an unresolved row", () => {
    const measuredAt = "2026-09-29T13:00:00.000Z";
    renderPage(
      <SlaClockProvider now={new Date(measuredAt)} timeZoneFor={() => "Europe/Berlin"}>
        <TicketTable
          tickets={[
            buildTicket({
              status: "open",
              firstRespondedAt: null,
              sla: {
                measuredAt,
                firstResponse: { state: "running", targetMinutes: 180, elapsedMinutes: 46 },
                resolution: { state: "running", targetMinutes: 540, elapsedMinutes: 0 },
              },
            }),
            buildTicket({
              id: "CHK-194",
              status: "blocked",
              sla: {
                measuredAt,
                firstResponse: { state: "met", targetMinutes: 60, elapsedMinutes: 0 },
                resolution: { state: "paused", targetMinutes: 540, elapsedMinutes: 80 },
              },
            }),
            buildTicket({
              id: "CHK-100",
              status: "resolved",
              resolvedAt: measuredAt,
            }),
          ]}
          columns={["id", "title", "customer", "status", "priority", "assignee", "updated"]}
        />
      </SlaClockProvider>,
      { path: "/", url: "/" },
    );

    expect(screen.getByText("2h 14m left")).toBeInTheDocument();
    expect(screen.getByText("Paused")).toBeInTheDocument();
    expect(screen.getAllByText(/left|Paused|Breached/)).toHaveLength(2);
  });

  it("names the waiting status plainly and says Unassigned when nobody has the ticket", () => {
    renderTable([buildTicket({ status: "blocked", assignee: null })]);

    expect(screen.getByText("Waiting on customer")).toBeInTheDocument();
    expect(screen.getByText("Unassigned")).toBeInTheDocument();
  });
});
