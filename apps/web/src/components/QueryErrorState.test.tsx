import { screen } from "@testing-library/react";
import { FileQuestion } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import { ApiError } from "../api/client.ts";
import { renderPage } from "../test/render.tsx";
import { QueryErrorState } from "./QueryErrorState.tsx";

function renderError(error: Error) {
  const onRetry = vi.fn();
  renderPage(
    <QueryErrorState
      error={error}
      crumbs={[{ label: "CHK-999" }]}
      subject="This ticket"
      notFound={{ icon: FileQuestion, title: "Ticket not found", description: "Gone." }}
      onRetry={onRetry}
    />,
    { path: "/", url: "/" },
  );
  return { onRetry };
}

describe("QueryErrorState", () => {
  it("shows the page's own not-found message for a 404", () => {
    renderError(new ApiError(404, "not_found", 'Ticket "CHK-999" was not found.'));

    expect(screen.getByRole("heading", { name: "Ticket not found" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to My tickets" })).toBeInTheDocument();
  });

  it("explains a 403 with the API's message", () => {
    renderError(new ApiError(403, "forbidden", "Viewers of Checkout cannot change tickets."));

    expect(screen.getByRole("heading", { name: "You don't have access" })).toBeInTheDocument();
    expect(screen.getByText("Viewers of Checkout cannot change tickets.")).toBeInTheDocument();
  });

  it("offers to try again after any other error", async () => {
    const { onRetry } = renderError(new Error("The API responded with status 502."));

    screen.getByRole("button", { name: "Try again" }).click();

    expect(
      screen.getByRole("heading", { name: "This ticket could not be loaded" }),
    ).toBeInTheDocument();
    expect(onRetry).toHaveBeenCalled();
  });
});
