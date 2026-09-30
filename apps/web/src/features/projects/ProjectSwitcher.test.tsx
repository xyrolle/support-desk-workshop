import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { api } from "../../api/client.ts";
import { buildProject } from "../../test/fixtures.ts";
import { renderPage } from "../../test/render.tsx";
import { ProjectSwitcher } from "./ProjectSwitcher.tsx";

describe("ProjectSwitcher", () => {
  it("marks only the saved view as current when its filters match the URL", async () => {
    vi.spyOn(api, "listProjects").mockResolvedValue([buildProject()]);
    vi.spyOn(api, "listViews").mockResolvedValue([
      { id: 1, name: "Blocked", filters: { status: ["blocked"] } },
    ]);
    renderPage(<ProjectSwitcher />, {
      path: "/projects/:projectId",
      url: "/projects/checkout?status=blocked",
    });

    expect(await screen.findByRole("link", { name: "Blocked" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: /Checkout/ })).not.toHaveAttribute("aria-current");
  });

  it("keeps the project current when no saved view matches", async () => {
    vi.spyOn(api, "listProjects").mockResolvedValue([buildProject()]);
    vi.spyOn(api, "listViews").mockResolvedValue([
      { id: 1, name: "Blocked", filters: { status: ["blocked"] } },
    ]);
    renderPage(<ProjectSwitcher />, {
      path: "/projects/:projectId",
      url: "/projects/checkout",
    });

    expect(await screen.findByRole("link", { name: "Blocked" })).not.toHaveAttribute(
      "aria-current",
    );
    expect(screen.getByRole("link", { name: /Checkout/ })).toHaveAttribute("aria-current", "page");
  });
});
