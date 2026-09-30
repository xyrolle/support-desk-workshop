import type { TicketPage } from "@support-desk/shared";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../../api/client.ts";
import { Sidebar } from "../../components/Sidebar.tsx";
import { buildMember, buildProject, buildTicket, diego, maya } from "../../test/fixtures.ts";
import { renderPage } from "../../test/render.tsx";
import { TicketListPage } from "./TicketListPage.tsx";

const ticketPage: TicketPage = {
  page: 1,
  pageSize: 25,
  totalItems: 2,
  totalPages: 1,
  items: [buildTicket(), buildTicket({ id: "CHK-188", status: "blocked" })],
};

function renderTicketList(url = "/projects/checkout") {
  return renderPage(<TicketListPage />, {
    path: "/projects/:projectId",
    url,
  });
}

beforeEach(() => {
  vi.spyOn(api, "getProject").mockResolvedValue(buildProject());
  vi.spyOn(api, "listProjects").mockResolvedValue([buildProject()]);
  vi.spyOn(api, "listMembers").mockResolvedValue([
    buildMember(diego, "agent"),
    buildMember(maya, "admin"),
    buildMember(
      {
        id: "ravi-patel",
        name: "Ravi Patel",
        initials: "RP",
        email: "ravi.patel@brightcart.example",
        avatarColor: "teal",
      },
      "viewer",
    ),
  ]);
  vi.spyOn(api, "listLabels").mockResolvedValue([{ id: 4, name: "Payments", color: "green" }]);
  vi.spyOn(api, "listTickets").mockResolvedValue(ticketPage);
});

describe("TicketListPage filters", () => {
  it("shows the filters from the URL and asks for every repeated value", async () => {
    renderTicketList("/projects/checkout?status=open&status=blocked&status=done&assignee=me");

    expect(await screen.findByRole("combobox", { name: "Status" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Priority" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Assignee" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Label" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Status" })).toHaveTextContent("Open");
    expect(screen.getByRole("combobox", { name: "Status" })).toHaveTextContent("+1");
    expect(screen.getByRole("combobox", { name: "Status" })).not.toHaveTextContent(
      "Waiting on customer",
    );
    expect(screen.getByText("Me")).toBeInTheDocument();
    expect(api.listTickets).toHaveBeenCalledWith(
      "checkout",
      expect.objectContaining({
        status: ["open", "blocked"],
        assignee: ["me"],
      }),
    );
    expect(api.listTickets).not.toHaveBeenCalledWith(
      "checkout",
      expect.objectContaining({ status: expect.arrayContaining(["done"]) }),
    );
  });

  it("shows the first value and a count when a filter has several", async () => {
    const user = userEvent.setup();
    renderTicketList(
      "/projects/checkout?status=open&status=in_progress&status=blocked&assignee=me&label=4",
    );

    const status = await screen.findByRole("combobox", { name: "Status" });
    expect(status).toHaveTextContent("Open");
    expect(status).toHaveTextContent("+2");
    expect(status).not.toHaveTextContent("In progress");
    expect(status).not.toHaveTextContent("Waiting on customer");

    await user.click(status);
    expect(await screen.findByRole("option", { name: "Open" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "In progress" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Waiting on customer" })).toBeInTheDocument();
  });

  it("goes back to page 1 when a filter changes, and clear removes the filters", async () => {
    const user = userEvent.setup();
    renderTicketList("/projects/checkout?status=open&page=2");

    await user.click(await screen.findByRole("combobox", { name: "Status" }));
    await user.click(await screen.findByRole("option", { name: "Waiting on customer" }));

    expect(api.listTickets).toHaveBeenLastCalledWith(
      "checkout",
      expect.objectContaining({ status: ["open", "blocked"], page: 1 }),
    );

    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    await user.keyboard("{Escape}");

    const query = vi.mocked(api.listTickets).mock.lastCall?.[1];
    expect(query?.page).toBe(1);
    expect(query?.status).toBeUndefined();
    expect(screen.getByRole("combobox", { name: "Status" })).toHaveTextContent("Status");
  });

  it("clears At risk along with the other filters", async () => {
    const user = userEvent.setup();
    renderTicketList("/projects/checkout?sla=at_risk&priority=urgent&page=2");

    await user.click(await screen.findByRole("button", { name: "Clear filters" }));

    const query = vi.mocked(api.listTickets).mock.lastCall?.[1];
    expect(query?.page).toBe(1);
    expect(query?.sla).toBeUndefined();
    expect(query?.priority).toBeUndefined();
    expect(screen.getByRole("button", { name: "At risk" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("keeps At risk in the URL and sends it with the other filters", async () => {
    const user = userEvent.setup();
    renderTicketList("/projects/checkout?sla=at_risk&page=2");

    const atRisk = await screen.findByRole("button", { name: "At risk" });
    expect(atRisk).toHaveAttribute("aria-pressed", "true");
    expect(api.listTickets).toHaveBeenCalledWith(
      "checkout",
      expect.objectContaining({ sla: "at_risk", page: 2 }),
    );

    await user.click(atRisk);

    expect(vi.mocked(api.listTickets).mock.lastCall?.[1]).toMatchObject({ page: 1 });
    expect(vi.mocked(api.listTickets).mock.lastCall?.[1]?.sla).toBeUndefined();
  });

  it("says when nothing matches and still offers clear filters", async () => {
    vi.mocked(api.listTickets).mockResolvedValue({
      page: 1,
      pageSize: 25,
      totalItems: 0,
      totalPages: 1,
      items: [],
    });
    renderTicketList("/projects/checkout?priority=urgent");

    expect(
      await screen.findByRole("heading", { name: "No tickets match these filters" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Clear filters" })).toHaveLength(2);
    expect(screen.getByRole("combobox", { name: "Priority" })).toBeInTheDocument();
  });

  it("treats At risk alone as a filter when nothing matches", async () => {
    vi.mocked(api.listTickets).mockResolvedValue({
      page: 1,
      pageSize: 25,
      totalItems: 0,
      totalPages: 1,
      items: [],
    });
    renderTicketList("/projects/checkout?sla=at_risk");

    expect(
      await screen.findByRole("heading", { name: "No tickets match these filters" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Clear filters" })).toHaveLength(2);
  });

  it("saves the current filters as a view and highlights it in the sidebar", async () => {
    vi.spyOn(api, "getCurrentUser").mockResolvedValue(maya);
    const listViews = vi.spyOn(api, "listViews").mockResolvedValue([]);
    vi.spyOn(api, "createView").mockImplementation(async (_projectId, view) => {
      const saved = { id: 1, name: view.name.trim(), filters: view.filters };
      listViews.mockResolvedValue([saved]);
      return saved;
    });
    const user = userEvent.setup();
    renderPage(
      <>
        <Sidebar />
        <TicketListPage />
      </>,
      { path: "/projects/:projectId", url: "/projects/checkout?status=open&page=2" },
    );

    await user.click(await screen.findByRole("button", { name: "Save view" }));
    await user.type(screen.getByRole("textbox", { name: "View name" }), "Urgent");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(api.createView).toHaveBeenCalledWith(
      "checkout",
      expect.objectContaining({
        name: "Urgent",
        filters: expect.objectContaining({ status: ["open"] }),
      }),
    );
    const view = await screen.findByRole("link", { name: "Urgent" });
    expect(view).toHaveAttribute("aria-current", "page");
    expect(view).toHaveAttribute("href", "/projects/checkout?status=open");
  });
});
