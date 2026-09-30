import { commentSchema, ticketDetailSchema } from "@support-desk/shared";
import { describe, expect, it } from "vitest";
import {
  createTestApp,
  getJson,
  sendJson,
  TEST_NOW,
  type TestApp,
  VIEWER_USER_ID,
} from "../../test/test-app.ts";

const threadPath = "/api/projects/checkout/tickets/CHK-196";
// CHK-205 came in recently and nobody has replied yet.
const newTicketPath = "/api/projects/checkout/tickets/CHK-205";

async function getTicket(app: TestApp, path: string) {
  return ticketDetailSchema.parse((await getJson(app, path)).body);
}

describe("GET /api/projects/:projectId/tickets/:ticketId/comments", () => {
  it("returns the conversation oldest first, with each author", async () => {
    const { app } = createTestApp();

    const response = await getJson(app, `${threadPath}/comments`);

    expect(response.status).toBe(200);
    const comments = commentSchema.array().parse(response.body);
    expect(comments).toHaveLength(22);
    expect(comments[0]).toMatchObject({
      kind: "public_reply",
      author: { id: "diego-alvarez" },
      createdAt: "2026-09-27T18:31:00.000Z",
    });
    const times = comments.map((comment) => comment.createdAt);
    expect(times).toEqual(times.toSorted());
  });

  it("shows customer messages as written by the requester", async () => {
    const { app } = createTestApp();

    const response = await getJson(app, `${threadPath}/comments`);

    const comments = commentSchema.array().parse(response.body);
    const customerMessages = comments.filter((comment) => comment.kind === "customer_message");
    expect(customerMessages).toHaveLength(5);
    expect(customerMessages[0]?.author).toEqual({
      id: 17,
      name: "Daniel Okoye",
      email: "daniel@atlassportsgroup.example",
    });
  });

  it("returns 404 for a hidden project and for an unknown ticket", async () => {
    const { app } = createTestApp();

    const hidden = await getJson(app, "/api/projects/billing/tickets/BIL-101/comments");
    const unknown = await getJson(app, "/api/projects/checkout/tickets/CHK-999/comments");

    expect(hidden.status).toBe(404);
    expect(unknown.status).toBe(404);
  });
});

describe("POST /api/projects/:projectId/tickets/:ticketId/comments", () => {
  it("adds a public reply from the current user", async () => {
    const { app } = createTestApp();

    const response = await sendJson(app, "POST", `${threadPath}/comments`, {
      kind: "public_reply",
      body: "  The fix is live. Could you check the orders from the last hour?  ",
    });

    expect(response.status).toBe(201);
    expect(commentSchema.parse(response.body)).toMatchObject({
      ticketId: "CHK-196",
      kind: "public_reply",
      author: { id: "maya-chen", name: "Maya Chen" },
      body: "The fix is live. Could you check the orders from the last hour?",
      createdAt: TEST_NOW.toISOString(),
    });
    expect((await getTicket(app, threadPath)).updatedAt).toBe(TEST_NOW.toISOString());
  });

  it("makes the first public reply the ticket's first response", async () => {
    const { app } = createTestApp();

    await sendJson(app, "POST", `${newTicketPath}/comments`, {
      kind: "public_reply",
      body: "Thanks, we're on it.",
    });

    expect((await getTicket(app, newTicketPath)).firstRespondedAt).toBe(TEST_NOW.toISOString());
  });

  it("keeps the first response time on later replies", async () => {
    const { app } = createTestApp();

    await sendJson(app, "POST", `${threadPath}/comments`, {
      kind: "public_reply",
      body: "Another update.",
    });

    expect((await getTicket(app, threadPath)).firstRespondedAt).toBe("2026-09-27T18:31:00.000Z");
  });

  it("does not count an internal note as a response to the customer", async () => {
    const { app } = createTestApp();

    const response = await sendJson(app, "POST", `${newTicketPath}/comments`, {
      kind: "internal_note",
      body: "Looks like the promo engine applies the percentage twice.",
    });

    expect(response.status).toBe(201);
    expect((await getTicket(app, newTicketPath)).firstRespondedAt).toBeNull();
  });

  it.each([
    [{ kind: "customer_message", body: "Teammates cannot write as the customer." }],
    [{ kind: "public_reply", body: "   " }],
    [{ kind: "public_reply", body: "x".repeat(10_001) }],
    [{ body: "No kind" }],
  ])("rejects the body %o", async (body) => {
    const { app } = createTestApp();

    const response = await sendJson(app, "POST", `${threadPath}/comments`, body);

    expect(response.status).toBe(400);
  });

  it("is forbidden to viewers", async () => {
    const { app } = createTestApp(VIEWER_USER_ID);

    const response = await sendJson(app, "POST", `${threadPath}/comments`, {
      kind: "internal_note",
      body: "Viewers can read the conversation but not add to it.",
    });

    expect(response.status).toBe(403);
  });
});
