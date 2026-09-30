import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ApiError, api } from "../../api/client.ts";
import { buildProject } from "../../test/fixtures.ts";
import { renderPage } from "../../test/render.tsx";
import { ProjectViews } from "./ProjectViews.tsx";

function renderViews() {
  return renderPage(<ProjectViews project={buildProject()} />, {
    path: "/projects/:projectId",
    url: "/projects/checkout",
  });
}

describe("ProjectViews", () => {
  it("shows a short error with Try again when views cannot be loaded", async () => {
    const listViews = vi
      .spyOn(api, "listViews")
      .mockRejectedValue(new ApiError(500, "internal_error", "Views failed"));
    const user = userEvent.setup();
    renderViews();

    expect(await screen.findByText("Views could not be loaded.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(listViews).toHaveBeenCalledTimes(2);
  });

  it("renders nothing when the project has no views", async () => {
    vi.spyOn(api, "listViews").mockResolvedValue([]);
    renderViews();

    await vi.waitFor(() => expect(api.listViews).toHaveBeenCalled());
    expect(screen.queryByText("Views could not be loaded.")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
