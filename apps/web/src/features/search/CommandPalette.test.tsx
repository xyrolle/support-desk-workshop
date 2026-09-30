import type { TicketPage } from "@support-desk/shared";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Outlet, useParams } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, api } from "../../api/client.ts";
import { useTickets } from "../../api/queries.ts";
import { Layout } from "../../components/Layout.tsx";
import { buildProject, buildTicket, maya } from "../../test/fixtures.ts";
import { renderPage } from "../../test/render.tsx";
import { TicketListPanel } from "../tickets/TicketListPanel.tsx";
import { CommandPalette } from "./CommandPalette.tsx";
import { SearchPaletteProvider, useCommandPalette } from "./use-command-palette.ts";

const ticketPage: TicketPage = {
  page: 1,
  pageSize: 25,
  totalItems: 1,
  totalPages: 1,
  items: [buildTicket()],
};

const listQuery = { page: 1, sort: "updated" as const, direction: "desc" as const };

function OpenedTicket() {
  const { ticketId } = useParams();
  return <p>Opened {ticketId}</p>;
}

function PaletteHost() {
  const palette = useCommandPalette();
  const ticketsQuery = useTickets("mobile-app", listQuery);
  return (
    <SearchPaletteProvider value={{ openSearch: palette.openSearch }}>
      <button type="button">Elsewhere</button>
      <TicketListPanel
        ticketsQuery={ticketsQuery}
        query={listQuery}
        onQueryChange={() => undefined}
        columns={["id", "title"]}
        filters={<span>Filters</span>}
        empty={{ title: "None", description: "None" }}
      />
      <CommandPalette open={palette.open} onOpenChange={palette.setOpen} />
      <Outlet />
    </SearchPaletteProvider>
  );
}

beforeEach(() => {
  vi.spyOn(api, "listTickets").mockResolvedValue(ticketPage);
  vi.spyOn(api, "listProjects").mockResolvedValue([
    buildProject(),
    buildProject({ id: "mobile-app", key: "MOB", name: "Mobile App" }),
  ]);
  vi.spyOn(api, "getProject").mockResolvedValue(
    buildProject({ id: "mobile-app", key: "MOB", name: "Mobile App" }),
  );
});

describe("CommandPalette", () => {
  it("opens from the shortcut or the toolbar, on the project you are in", async () => {
    const user = userEvent.setup();
    renderPage(<PaletteHost />, {
      path: "/projects/:projectId",
      url: "/projects/mobile-app",
    });

    expect(await screen.findByRole("button", { name: /Search/ })).toBeInTheDocument();
    await user.keyboard("{Meta>}k{/Meta}");

    const input = await screen.findByRole("textbox", { name: "Search tickets" });
    await waitFor(() => expect(input).toHaveFocus());
    expect(screen.getByText("Mobile App")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("textbox", { name: "Search tickets" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Search/ }));
    await waitFor(() =>
      expect(screen.getByRole("textbox", { name: "Search tickets" })).toHaveFocus(),
    );
    expect(screen.getByText("⌘K")).toBeInTheDocument();
  });

  it("opens with Ctrl+K and searches the first project when you are not in one", async () => {
    const user = userEvent.setup();
    renderPage(<PaletteHost />, { path: "/", url: "/" });

    await user.keyboard("{Control>}k{/Control}");

    await waitFor(() =>
      expect(screen.getByRole("textbox", { name: "Search tickets" })).toHaveFocus(),
    );
    expect(screen.getByText("Checkout")).toBeInTheDocument();
    expect(api.getProject).not.toHaveBeenCalled();
  });

  it("lists at most eight matches after a short pause, highlighting words as marks", async () => {
    const user = userEvent.setup();
    const matches = Array.from({ length: 10 }, (_, index) =>
      buildTicket({
        id: `CHK-${200 + index}`,
        title: `Refund number ${index}`,
        snippet: [
          { text: "See the ", highlighted: false },
          { text: "<b>refund</b>", highlighted: true },
        ],
      }),
    );
    vi.spyOn(api, "listTickets").mockImplementation(async (_projectId, query) => {
      if (!query.q) {
        return ticketPage;
      }
      return { page: 1, pageSize: 25, totalItems: matches.length, totalPages: 1, items: matches };
    });
    renderPage(<PaletteHost />, {
      path: "/projects/:projectId",
      url: "/projects/mobile-app",
    });

    await user.click(await screen.findByRole("button", { name: /Search/ }));
    await user.type(await screen.findByRole("textbox", { name: "Search tickets" }), "refun");

    expect(screen.queryByRole("option")).not.toBeInTheDocument();
    expect(await screen.findAllByRole("option")).toHaveLength(8);
    const highlighted = screen.getAllByText("<b>refund</b>")[0];
    expect(highlighted?.tagName).toBe("MARK");
    expect(document.querySelector("b")).toBeNull();
    expect(api.listTickets).toHaveBeenCalledWith(
      "mobile-app",
      expect.objectContaining({ page: 1, q: "refun" }),
    );
    const search = vi.mocked(api.listTickets).mock.calls.find((call) => call[1].q === "refun");
    expect(search?.[1].sort).toBeUndefined();
  });

  it("moves with the arrow keys, opens on Enter or click, and restores focus on Esc", async () => {
    const user = userEvent.setup();
    const matches = [
      buildTicket({
        id: "CHK-197",
        projectId: "mobile-app",
        title: "Apple Pay domain verification keeps failing",
      }),
      buildTicket({
        id: "CHK-188",
        projectId: "mobile-app",
        title: "Apple Pay button overlaps the total",
      }),
    ];
    vi.spyOn(api, "listTickets").mockImplementation(async (_projectId, query) => {
      if (!query.q) {
        return ticketPage;
      }
      return { page: 1, pageSize: 25, totalItems: matches.length, totalPages: 1, items: matches };
    });
    renderPage(<PaletteHost />, {
      path: "/projects/:projectId",
      url: "/projects/mobile-app",
      routes: [{ path: "tickets/:ticketId", element: <OpenedTicket /> }],
    });

    const elsewhere = await screen.findByRole("button", { name: "Elsewhere" });
    elsewhere.focus();
    await user.keyboard("{Meta>}k{/Meta}");
    await user.keyboard("{Escape}");
    expect(elsewhere).toHaveFocus();
    expect(screen.queryByRole("textbox", { name: "Search tickets" })).not.toBeInTheDocument();

    await user.keyboard("{Meta>}k{/Meta}");
    await user.type(await screen.findByRole("textbox", { name: "Search tickets" }), "apple");
    const first = await screen.findByRole("option", { name: /CHK-197/ });
    expect(first).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("option", { name: /CHK-188/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await user.keyboard("{ArrowUp}");
    expect(screen.getByRole("option", { name: /CHK-197/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await user.keyboard("{Enter}");
    expect(await screen.findByText("Opened CHK-197")).toBeInTheDocument();

    await user.keyboard("{Meta>}k{/Meta}");
    await user.type(await screen.findByRole("textbox", { name: "Search tickets" }), "apple");
    await user.click(await screen.findByRole("option", { name: /CHK-188/ }));
    expect(await screen.findByText("Opened CHK-188")).toBeInTheDocument();
  });

  it("keeps the previous matches while the next search loads", async () => {
    const user = userEvent.setup();
    const pending: Array<(page: TicketPage) => void> = [];
    vi.spyOn(api, "listTickets").mockImplementation((_projectId, query) => {
      if (!query.q) {
        return Promise.resolve(ticketPage);
      }
      return new Promise((resolve) => {
        pending.push(resolve);
      });
    });
    renderPage(<PaletteHost />, {
      path: "/projects/:projectId",
      url: "/projects/mobile-app",
    });

    await user.click(await screen.findByRole("button", { name: /Search/ }));
    await user.type(await screen.findByRole("textbox", { name: "Search tickets" }), "ref");
    await waitFor(() => expect(pending).toHaveLength(1));
    pending[0]?.({
      page: 1,
      pageSize: 25,
      totalItems: 1,
      totalPages: 1,
      items: [buildTicket({ id: "CHK-197", title: "Refund the Apple Pay charge" })],
    });
    expect(await screen.findByRole("option", { name: /CHK-197/ })).toBeInTheDocument();

    await user.type(screen.getByRole("textbox", { name: "Search tickets" }), "zzz");
    await waitFor(() => expect(pending).toHaveLength(2));
    expect(screen.getByRole("option", { name: /CHK-197/ })).toBeInTheDocument();

    pending[1]?.({ page: 1, pageSize: 25, totalItems: 0, totalPages: 1, items: [] });
    expect(await screen.findByText("No tickets match “refzzz”")).toBeInTheDocument();
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });

  it("opens the first match when ArrowDown happens before the results arrive", async () => {
    const user = userEvent.setup();
    const pending: Array<(page: TicketPage) => void> = [];
    const matches = [
      buildTicket({
        id: "CHK-197",
        projectId: "mobile-app",
        title: "Apple Pay domain verification keeps failing",
      }),
      buildTicket({
        id: "CHK-188",
        projectId: "mobile-app",
        title: "Apple Pay button overlaps the total",
      }),
    ];
    vi.spyOn(api, "listTickets").mockImplementation((_projectId, query) => {
      if (!query.q) {
        return Promise.resolve(ticketPage);
      }
      return new Promise((resolve) => {
        pending.push(resolve);
      });
    });
    renderPage(<PaletteHost />, {
      path: "/projects/:projectId",
      url: "/projects/mobile-app",
      routes: [{ path: "tickets/:ticketId", element: <OpenedTicket /> }],
    });

    await user.click(await screen.findByRole("button", { name: /Search/ }));
    await user.keyboard("{ArrowDown}");
    await user.type(await screen.findByRole("textbox", { name: "Search tickets" }), "apple");
    await waitFor(() => expect(pending).toHaveLength(1));
    await user.keyboard("{ArrowDown}");
    pending[0]?.({
      page: 1,
      pageSize: 25,
      totalItems: matches.length,
      totalPages: 1,
      items: matches,
    });

    const first = await screen.findByRole("option", { name: /CHK-197/ });
    expect(first).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{Enter}");
    expect(await screen.findByText("Opened CHK-197")).toBeInTheDocument();
  });

  it("announces the active result from its listbox", async () => {
    const user = userEvent.setup();
    vi.spyOn(api, "listTickets").mockImplementation(async (_projectId, query) => {
      if (!query.q) {
        return ticketPage;
      }
      return {
        page: 1,
        pageSize: 25,
        totalItems: 2,
        totalPages: 1,
        items: [
          buildTicket({ id: "CHK-197", title: "Apple Pay domain verification keeps failing" }),
          buildTicket({ id: "CHK-188", title: "Apple Pay button overlaps the total" }),
        ],
      };
    });
    renderPage(<PaletteHost />, {
      path: "/projects/:projectId",
      url: "/projects/mobile-app",
    });

    await user.click(await screen.findByRole("button", { name: /Search/ }));
    await user.type(await screen.findByRole("textbox", { name: "Search tickets" }), "apple");

    expect(await screen.findByRole("dialog", { name: "Search tickets" })).toBeInTheDocument();
    const input = screen.getByRole("textbox", { name: "Search tickets" });
    const list = await screen.findByRole("listbox", { name: "Search results" });
    expect(input).toHaveAttribute("aria-controls", list.id);
    const first = screen.getByRole("option", { name: /CHK-197/ });
    expect(input).toHaveAttribute("aria-activedescendant", first.id);

    await user.keyboard("{ArrowDown}");
    expect(input).toHaveAttribute(
      "aria-activedescendant",
      screen.getByRole("option", { name: /CHK-188/ }).id,
    );
  });

  it("shows an error when the search fails, and an empty result only when nothing matches", async () => {
    const user = userEvent.setup();
    vi.spyOn(api, "listTickets").mockImplementation(async (_projectId, query) => {
      if (!query.q) {
        return ticketPage;
      }
      if (query.q === "zzzz") {
        return { page: 1, pageSize: 25, totalItems: 0, totalPages: 1, items: [] };
      }
      throw new ApiError(
        400,
        "validation_error",
        "q: String must contain at most 100 character(s)",
      );
    });
    renderPage(<PaletteHost />, {
      path: "/projects/:projectId",
      url: "/projects/mobile-app",
    });

    await user.click(await screen.findByRole("button", { name: /Search/ }));
    const input = await screen.findByRole("textbox", { name: "Search tickets" });
    await user.type(input, "a".repeat(101));

    expect(
      await screen.findByText("q: String must contain at most 100 character(s)"),
    ).toBeInTheDocument();
    expect(screen.queryByText(/No tickets match/)).not.toBeInTheDocument();

    await user.clear(input);
    await user.type(input, "zzzz");
    expect(await screen.findByText("No tickets match “zzzz”")).toBeInTheDocument();
    expect(
      screen.queryByText("q: String must contain at most 100 character(s)"),
    ).not.toBeInTheDocument();
  });

  it("keeps the ticket id on one line", async () => {
    const user = userEvent.setup();
    vi.spyOn(api, "listTickets").mockImplementation(async (_projectId, query) => {
      if (!query.q) {
        return ticketPage;
      }
      return {
        page: 1,
        pageSize: 25,
        totalItems: 1,
        totalPages: 1,
        items: [
          buildTicket({
            id: "CHK-196",
            title: "A very long title that would otherwise push the ticket id onto two lines",
          }),
        ],
      };
    });
    renderPage(<PaletteHost />, {
      path: "/projects/:projectId",
      url: "/projects/mobile-app",
    });

    await user.click(await screen.findByRole("button", { name: /Search/ }));
    await user.type(await screen.findByRole("textbox", { name: "Search tickets" }), "long");
    const option = await screen.findByRole("option", { name: /CHK-196/ });
    expect(within(option).getByText("CHK-196")).toHaveClass("whitespace-nowrap", "shrink-0");
  });

  it("searches the project in the URL when the palette is mounted in the layout", async () => {
    const user = userEvent.setup();
    vi.spyOn(api, "getCurrentUser").mockResolvedValue(maya);
    vi.spyOn(api, "listMyTickets").mockResolvedValue(ticketPage);
    vi.spyOn(api, "listViews").mockResolvedValue([]);
    renderPage(<Layout />, {
      path: "/",
      url: "/projects/mobile-app",
      routes: [{ path: "projects/:projectId", element: <p>Mobile App tickets</p> }],
    });

    expect(await screen.findByText("Mobile App tickets")).toBeInTheDocument();
    await user.keyboard("{Meta>}k{/Meta}");
    await user.type(await screen.findByRole("textbox", { name: "Search tickets" }), "apple");

    await waitFor(() =>
      expect(api.listTickets).toHaveBeenCalledWith(
        "mobile-app",
        expect.objectContaining({ q: "apple" }),
      ),
    );
    expect(api.listTickets).not.toHaveBeenCalledWith(
      "checkout",
      expect.objectContaining({ q: "apple" }),
    );
  });
});
