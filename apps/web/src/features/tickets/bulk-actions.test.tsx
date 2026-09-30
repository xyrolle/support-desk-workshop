import type { BulkTicketUpdate, BulkTicketUpdateResult, TicketPage } from "@support-desk/shared";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, api } from "../../api/client.ts";
import {
  buildMember,
  buildProject,
  buildTicket,
  diego,
  maya,
  viewerProject,
} from "../../test/fixtures.ts";
import { renderPage } from "../../test/render.tsx";
import { TicketListPage } from "./TicketListPage.tsx";

const ravi = {
  id: "ravi-patel",
  name: "Ravi Patel",
  initials: "RP",
  email: "ravi.patel@brightcart.example",
  avatarColor: "teal" as const,
};

const tickets = [
  buildTicket({ id: "CHK-205", status: "open", priority: "urgent", assignee: null }),
  buildTicket({ id: "CHK-204", status: "open", priority: "high", assignee: null }),
  buildTicket({ id: "CHK-203", status: "open", priority: "low", assignee: null, labels: [] }),
];

const ticketPage: TicketPage = {
  page: 1,
  pageSize: 25,
  totalItems: 3,
  totalPages: 1,
  items: tickets,
};

function renderTicketList(url = "/projects/checkout") {
  return renderPage(<TicketListPage />, { path: "/projects/:projectId", url });
}

function resultFor(body: BulkTicketUpdate): BulkTicketUpdateResult {
  return {
    tickets: body.updates.map((update) => {
      const ticket = tickets.find((item) => item.id === update.ticketId) ?? tickets[0];
      if (!ticket) {
        throw new Error("The fixture has no tickets.");
      }
      const assignee =
        update.changes.assigneeId === undefined
          ? ticket.assignee
          : update.changes.assigneeId === "maya-chen"
            ? maya
            : null;
      return {
        ...ticket,
        status: update.changes.status ?? ticket.status,
        priority: update.changes.priority ?? ticket.priority,
        assignee,
      };
    }),
    previous: body.updates.map((update) => {
      const ticket = tickets.find((item) => item.id === update.ticketId) ?? tickets[0];
      if (!ticket) {
        throw new Error("The fixture has no tickets.");
      }
      return {
        ticketId: ticket.id,
        status: ticket.status,
        priority: ticket.priority,
        assigneeId: ticket.assignee?.id ?? null,
        labelIds: ticket.labels.map((label) => label.id),
      };
    }),
  };
}

afterEach(() => {
  vi.useRealTimers();
});

beforeEach(() => {
  vi.spyOn(api, "getProject").mockResolvedValue(buildProject());
  vi.spyOn(api, "listProjects").mockResolvedValue([buildProject()]);
  vi.spyOn(api, "listMembers").mockResolvedValue([
    buildMember(diego, "agent"),
    buildMember(maya, "admin"),
    buildMember(ravi, "viewer"),
  ]);
  vi.spyOn(api, "listLabels").mockResolvedValue([{ id: 1, name: "Bug", color: "red" }]);
  vi.spyOn(api, "listTickets").mockResolvedValue(ticketPage);
});

describe("bulk actions on the project ticket list", () => {
  it("selects the page from the header, and a shift-click range that can shrink", async () => {
    const user = userEvent.setup();
    renderTicketList();

    await user.click(await screen.findByRole("checkbox", { name: "Select all tickets" }));

    expect(screen.getByRole("checkbox", { name: "Select CHK-205" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Select CHK-203" })).toBeChecked();
    const bar = screen.getByRole("toolbar", { name: "Selected rows" });
    expect(bar).toHaveTextContent("3 selected");
    expect(within(bar).getByRole("button", { name: "Status" })).toBeInTheDocument();
    expect(within(bar).getByRole("button", { name: "Priority" })).toBeInTheDocument();
    expect(within(bar).getByRole("button", { name: "Assignee" })).toBeInTheDocument();

    await user.click(within(bar).getByRole("button", { name: "Clear selection" }));
    expect(screen.queryByRole("toolbar", { name: "Selected rows" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("checkbox", { name: "Select CHK-205" }));
    await user.keyboard("{Shift>}");
    await user.click(screen.getByRole("checkbox", { name: "Select CHK-203" }));
    await user.keyboard("{/Shift}");
    expect(screen.getByRole("toolbar", { name: "Selected rows" })).toHaveTextContent("3 selected");

    await user.keyboard("{Shift>}");
    await user.click(screen.getByRole("checkbox", { name: "Select CHK-204" }));
    await user.keyboard("{/Shift}");
    expect(screen.getByRole("toolbar", { name: "Selected rows" })).toHaveTextContent("2 selected");
    expect(screen.getByRole("checkbox", { name: "Select CHK-203" })).not.toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Select all tickets" })).toBePartiallyChecked();
    expect(screen.queryByText("Somewhere else")).not.toBeInTheDocument();
  });

  it("disables the checkboxes for a viewer and says why", async () => {
    vi.mocked(api.getProject).mockResolvedValue(viewerProject);
    const user = userEvent.setup();
    renderTicketList();

    const header = await screen.findByRole("checkbox", { name: "Select all tickets" });
    expect(header).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("checkbox", { name: "Select CHK-205" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );

    await user.hover(header);
    expect(
      await screen.findByText(
        "You are a viewer in Checkout: you can read tickets but not change or answer them.",
      ),
    ).toBeInTheDocument();
  });

  it("updates the selected rows at once, offers undo for 8 seconds, and restores them", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const pending: Array<(result: BulkTicketUpdateResult) => void> = [];
    vi.spyOn(api, "bulkUpdateTickets").mockImplementation(
      () =>
        new Promise((resolve) => {
          pending.push(resolve);
        }),
    );

    renderTicketList();
    await user.click(await screen.findByRole("checkbox", { name: "Select all tickets" }));
    await user.click(
      within(screen.getByRole("toolbar", { name: "Selected rows" })).getByRole("button", {
        name: "Status",
      }),
    );
    await user.click(await screen.findByRole("menuitem", { name: "Resolved" }));

    expect(within(screen.getByRole("table")).getAllByText("Resolved")).toHaveLength(3);
    expect(api.bulkUpdateTickets).toHaveBeenCalledWith("checkout", {
      updates: [
        { ticketId: "CHK-205", changes: { status: "resolved" } },
        { ticketId: "CHK-204", changes: { status: "resolved" } },
        { ticketId: "CHK-203", changes: { status: "resolved" } },
      ],
    });

    const firstCall = vi.mocked(api.bulkUpdateTickets).mock.calls[0]?.[1];
    if (!firstCall) {
      throw new Error("The bulk update was not sent.");
    }
    pending[0]?.(resultFor(firstCall));
    expect(await screen.findByText("Updated 3 tickets")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Undo" })).toBeInTheDocument();

    await vi.advanceTimersByTimeAsync(6_500);
    expect(screen.getByText("Updated 3 tickets")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(within(screen.getByRole("table")).getAllByText("Open")).toHaveLength(3);
    expect(api.bulkUpdateTickets).toHaveBeenLastCalledWith("checkout", {
      updates: [
        {
          ticketId: "CHK-205",
          changes: { status: "open", priority: "urgent", assigneeId: null, labelIds: [1] },
        },
        {
          ticketId: "CHK-204",
          changes: { status: "open", priority: "high", assigneeId: null, labelIds: [1] },
        },
        {
          ticketId: "CHK-203",
          changes: { status: "open", priority: "low", assigneeId: null, labelIds: [] },
        },
      ],
    });

    const undoCall = vi.mocked(api.bulkUpdateTickets).mock.calls[1]?.[1];
    if (!undoCall) {
      throw new Error("Undo was not sent.");
    }
    pending[1]?.(resultFor(undoCall));
  });

  it("dismisses the undo toast 8 seconds after the update", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    vi.spyOn(api, "bulkUpdateTickets").mockImplementation((_projectId, body) =>
      Promise.resolve(resultFor(body)),
    );
    renderTicketList();

    await user.click(await screen.findByRole("checkbox", { name: "Select all tickets" }));
    await user.click(
      within(screen.getByRole("toolbar", { name: "Selected rows" })).getByRole("button", {
        name: "Status",
      }),
    );
    await user.click(await screen.findByRole("menuitem", { name: "Resolved" }));

    expect(await screen.findByText("Updated 3 tickets")).toBeInTheDocument();
    await vi.advanceTimersByTimeAsync(6_500);
    expect(screen.getByText("Updated 3 tickets")).toBeInTheDocument();
    await vi.advanceTimersByTimeAsync(2_000);
    expect(screen.queryByText("Updated 3 tickets")).not.toBeInTheDocument();
  });

  it("puts the rows back and explains when the update is refused", async () => {
    vi.spyOn(api, "bulkUpdateTickets").mockRejectedValue(
      new ApiError(404, "not_found", 'Ticket "CHK-205" was not found.'),
    );
    const user = userEvent.setup();
    renderTicketList();

    await user.click(await screen.findByRole("checkbox", { name: "Select CHK-205" }));
    await user.click(
      within(screen.getByRole("toolbar", { name: "Selected rows" })).getByRole("button", {
        name: "Assignee",
      }),
    );
    expect(screen.queryByRole("menuitem", { name: "Ravi Patel" })).not.toBeInTheDocument();
    await user.click(await screen.findByRole("menuitem", { name: "Maya Chen" }));

    expect(await screen.findByText('Ticket "CHK-205" was not found.')).toBeInTheDocument();
    expect(within(screen.getByRole("table")).getAllByText("Unassigned")).toHaveLength(3);
    expect(within(screen.getByRole("table")).queryByText("Maya Chen")).not.toBeInTheDocument();
  });

  it("clears the selection when the page or the filters change, and keeps it when the sort changes", async () => {
    vi.mocked(api.listTickets).mockResolvedValue({ ...ticketPage, totalItems: 50, totalPages: 2 });
    const user = userEvent.setup();
    renderTicketList();

    await user.click(await screen.findByRole("checkbox", { name: "Select CHK-205" }));
    expect(screen.getByRole("toolbar", { name: "Selected rows" })).toBeInTheDocument();

    await user.click(screen.getByRole("combobox", { name: "Sort tickets" }));
    await user.click(await screen.findByRole("option", { name: "Newest first" }));
    expect(screen.getByRole("checkbox", { name: "Select CHK-205" })).toBeChecked();

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.queryByRole("toolbar", { name: "Selected rows" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("checkbox", { name: "Select CHK-204" }));
    await user.click(screen.getByRole("combobox", { name: "Status" }));
    await user.click(await screen.findByRole("option", { name: "Open" }));
    expect(screen.queryByRole("toolbar", { name: "Selected rows" })).not.toBeInTheDocument();
  });
});
