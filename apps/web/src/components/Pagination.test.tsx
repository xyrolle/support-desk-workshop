import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Pagination } from "./Pagination.tsx";

describe("Pagination", () => {
  it("shows the visible range and disables Previous on the first page", () => {
    render(
      <Pagination page={1} pageSize={20} totalItems={30} totalPages={2} onPageChange={vi.fn()} />,
    );

    expect(screen.getByRole("navigation", { name: "Pagination" })).toHaveTextContent(
      "Showing 1–20 of 30",
    );
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();
  });

  it("disables Next on the last page", () => {
    render(
      <Pagination page={2} pageSize={20} totalItems={30} totalPages={2} onPageChange={vi.fn()} />,
    );

    expect(screen.getByRole("navigation")).toHaveTextContent("Showing 21–30 of 30");
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });

  it("asks for the next page", async () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        page={1}
        pageSize={20}
        totalItems={30}
        totalPages={2}
        onPageChange={onPageChange}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});
