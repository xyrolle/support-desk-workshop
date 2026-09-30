import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../../api/client.ts";
import { adminProject, buildMember, buildProject, diego, maya } from "../../test/fixtures.ts";
import { renderPage } from "../../test/render.tsx";
import { MembersPage } from "./MembersPage.tsx";

function renderMembersPage() {
  return renderPage(<MembersPage />, {
    path: "/projects/:projectId/settings",
    url: "/projects/checkout/settings",
  });
}

beforeEach(() => {
  vi.spyOn(api, "getCurrentUser").mockResolvedValue(maya);
  vi.spyOn(api, "listUsers").mockResolvedValue([diego, maya]);
  vi.spyOn(api, "listMembers").mockResolvedValue([
    buildMember(diego, "agent"),
    buildMember(maya, "admin"),
  ]);
});

describe("MembersPage", () => {
  it("lets an admin add members and change roles", async () => {
    vi.spyOn(api, "getProject").mockResolvedValue(adminProject);

    renderMembersPage();

    expect(await screen.findByRole("button", { name: "Add member" })).toBeEnabled();
    expect(
      await screen.findByRole("combobox", { name: "Role of Diego Alvarez: Agent" }),
    ).not.toHaveAttribute("data-disabled");
    expect(screen.getByText("You")).toBeInTheDocument();
  });

  it("shows everyone else the members, read-only, and says why", async () => {
    vi.spyOn(api, "getProject").mockResolvedValue(buildProject());

    renderMembersPage();

    expect(
      await screen.findByText("Only admins of Checkout can add, change or remove members."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add member" })).toBeDisabled();
    expect(
      await screen.findByRole("combobox", { name: "Role of Diego Alvarez: Agent" }),
    ).toHaveAttribute("data-disabled");
  });
});
