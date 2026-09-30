import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, api } from "../../api/client.ts";
import {
  buildMember,
  buildProject,
  buildTicketDetail,
  customerMessage,
  diego,
  internalNote,
  maya,
  statusChange,
  viewerProject,
} from "../../test/fixtures.ts";
import { renderPage } from "../../test/render.tsx";
import { TicketDetailPage } from "./TicketDetailPage.tsx";

const ticket = buildTicketDetail();

function renderTicketPage() {
  return renderPage(<TicketDetailPage />, {
    path: "/projects/:projectId/tickets/:ticketId",
    url: "/projects/checkout/tickets/CHK-196",
  });
}

beforeEach(() => {
  vi.spyOn(api, "getTicket").mockResolvedValue(ticket);
  vi.spyOn(api, "listComments").mockResolvedValue([customerMessage, internalNote]);
  vi.spyOn(api, "listActivity").mockResolvedValue([statusChange]);
  vi.spyOn(api, "listMembers").mockResolvedValue([
    buildMember(diego, "agent"),
    buildMember(maya, "admin"),
  ]);
  vi.spyOn(api, "listLabels").mockResolvedValue([{ id: 1, name: "Bug", color: "red" }]);
});

describe("TicketDetailPage", () => {
  it("shows the ticket, the customer's first message and the conversation", async () => {
    vi.spyOn(api, "getProject").mockResolvedValue(buildProject());

    renderTicketPage();

    expect(
      await screen.findByRole("heading", { level: 1, name: ticket.title }),
    ).toBeInTheDocument();
    expect(screen.getByText("charged twice")).toBeInTheDocument();
    expect(await screen.findByText("Internal note")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Atlas Sports Group" })).toHaveAttribute(
      "href",
      "/organizations/atlas-sports-group",
    );
  });

  it("shows both SLA clocks, with their targets, in the side panel", async () => {
    vi.spyOn(api, "getProject").mockResolvedValue(buildProject());
    vi.spyOn(api, "getTicket").mockResolvedValue(
      buildTicketDetail({
        sla: {
          measuredAt: "2026-09-29T13:00:00.000Z",
          firstResponse: { state: "met", targetMinutes: 60, elapsedMinutes: 0 },
          resolution: { state: "breached", targetMinutes: 540, elapsedMinutes: 900 },
        },
      }),
    );

    renderTicketPage();

    expect(await screen.findByText("First response")).toBeInTheDocument();
    expect(screen.getByText("Resolution")).toBeInTheDocument();
    expect(screen.getByText("Met")).toBeInTheDocument();
    expect(screen.getByText("Breached 6h 00m ago")).toBeInTheDocument();
    expect(screen.getByText("1h")).toBeInTheDocument();
    expect(screen.getByText("9h")).toBeInTheDocument();
  });

  it("changes the status from the side panel", async () => {
    vi.spyOn(api, "getProject").mockResolvedValue(buildProject());
    const updateTicket = vi
      .spyOn(api, "updateTicket")
      .mockResolvedValue({ ...ticket, status: "resolved" });
    const user = userEvent.setup();
    renderTicketPage();

    await user.click(await screen.findByRole("combobox", { name: "Status: In progress" }));
    await user.click(await screen.findByRole("option", { name: "Resolved" }));

    await waitFor(() =>
      expect(updateTicket).toHaveBeenCalledWith("checkout", "CHK-196", { status: "resolved" }),
    );
  });

  it("shows a viewer every property but lets them change none, and says why", async () => {
    vi.spyOn(api, "getProject").mockResolvedValue(viewerProject);

    renderTicketPage();

    const reason =
      "You are a viewer in Checkout: you can read tickets but not change or answer them.";
    expect(await screen.findAllByText(reason)).not.toHaveLength(0);
    expect(screen.getByRole("combobox", { name: "Status: In progress" })).toHaveAttribute(
      "data-disabled",
    );
    expect(screen.getByRole("button", { name: /Send reply/ })).toBeDisabled();
  });

  it("says a hidden or missing ticket was not found", async () => {
    vi.spyOn(api, "getProject").mockResolvedValue(buildProject());
    vi.spyOn(api, "getTicket").mockRejectedValue(
      new ApiError(404, "not_found", 'Ticket "CHK-196" was not found.'),
    );

    renderTicketPage();

    expect(await screen.findByRole("heading", { name: "Ticket not found" })).toBeInTheDocument();
  });
});
