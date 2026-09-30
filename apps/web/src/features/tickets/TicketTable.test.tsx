import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { buildTicket } from "../../test/fixtures.ts";
import { renderPage } from "../../test/render.tsx";
import { TicketTable } from "./TicketTable.tsx";

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

  it("names the waiting status plainly and says Unassigned when nobody has the ticket", () => {
    renderTable([buildTicket({ status: "blocked", assignee: null })]);

    expect(screen.getByText("Waiting on customer")).toBeInTheDocument();
    expect(screen.getByText("Unassigned")).toBeInTheDocument();
  });
});
