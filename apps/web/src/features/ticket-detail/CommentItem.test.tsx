import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { customerMessage, internalNote } from "../../test/fixtures.ts";
import { CommentItem } from "./CommentItem.tsx";

describe("CommentItem", () => {
  it("marks a customer's message as coming from the customer", () => {
    render(<CommentItem comment={customerMessage} />);

    expect(screen.getByText("Daniel Okoye")).toBeInTheDocument();
    expect(screen.getByText("Customer")).toBeInTheDocument();
  });

  it("marks an internal note, so nobody mistakes it for a reply", () => {
    render(<CommentItem comment={internalNote} />);

    expect(screen.getByText("Internal note")).toBeInTheDocument();
    expect(screen.queryByText("replied")).not.toBeInTheDocument();
  });

  it("marks a public reply as a reply", () => {
    render(<CommentItem comment={{ ...internalNote, kind: "public_reply" }} />);

    expect(screen.getByText("replied")).toBeInTheDocument();
  });
});
