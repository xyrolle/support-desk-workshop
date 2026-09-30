import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Markdown } from "./Markdown.tsx";

describe("Markdown", () => {
  it("renders the Markdown people write in tickets", () => {
    render(<Markdown>{"Orders **418207** and `418233`:\n\n1. First\n2. Second"}</Markdown>);

    expect(screen.getByText("418207").tagName).toBe("STRONG");
    expect(screen.getByText("418233").tagName).toBe("CODE");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("never renders raw HTML from customer text", () => {
    const { container } = render(
      <Markdown>{'Hello <img src="x" onerror="alert(1)"> <b>bold</b>'}</Markdown>,
    );

    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("b")).toBeNull();
  });

  it("drops javascript links and opens the others in a new tab", () => {
    render(<Markdown>{"[click](javascript:alert(1)) and [docs](https://example.com)"}</Markdown>);

    expect(screen.getByText("click")).not.toHaveAttribute("href", "javascript:alert(1)");
    expect(screen.getByRole("link", { name: "docs" })).toHaveAttribute("target", "_blank");
  });
});
