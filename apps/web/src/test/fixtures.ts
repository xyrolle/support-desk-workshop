import type {
  Comment,
  Project,
  ProjectMember,
  TicketDetail,
  TicketEvent,
  TicketListItem,
  User,
} from "@support-desk/shared";

export const maya: User = {
  id: "maya-chen",
  name: "Maya Chen",
  initials: "MC",
  email: "maya.chen@brightcart.example",
  avatarColor: "violet",
};

export const diego: User = {
  id: "diego-alvarez",
  name: "Diego Alvarez",
  initials: "DA",
  email: "diego.alvarez@brightcart.example",
  avatarColor: "amber",
};

export function buildProject(overrides: Partial<Project> = {}): Project {
  return {
    id: "checkout",
    key: "CHK",
    name: "Checkout",
    description: "Cart, payments, taxes and order confirmation for our merchants' stores.",
    timeZone: "Europe/Berlin",
    role: "agent",
    permissions: { editTickets: true, manageMembers: false },
    ...overrides,
  };
}

export const viewerProject = buildProject({
  role: "viewer",
  permissions: { editTickets: false, manageMembers: false },
});

export const adminProject = buildProject({
  role: "admin",
  permissions: { editTickets: true, manageMembers: true },
});

export function buildTicket(overrides: Partial<TicketListItem> = {}): TicketListItem {
  return {
    id: "CHK-196",
    projectId: "checkout",
    title: "Customers charged twice when 3-D Secure times out and they retry",
    status: "in_progress",
    priority: "urgent",
    assignee: diego,
    requester: {
      id: 17,
      name: "Daniel Okoye",
      email: "daniel@atlassportsgroup.example",
      organization: { id: "atlas-sports-group", name: "Atlas Sports Group", tier: "enterprise" },
    },
    labels: [{ id: 1, name: "Bug", color: "red" }],
    createdAt: "2026-09-27T18:19:00.000Z",
    updatedAt: "2026-09-29T11:30:00.000Z",
    firstRespondedAt: "2026-09-27T18:31:00.000Z",
    resolvedAt: null,
    sla: {
      measuredAt: "2026-09-29T13:00:00.000Z",
      firstResponse: { state: "met", targetMinutes: 60, elapsedMinutes: 0 },
      resolution: { state: "running", targetMinutes: 540, elapsedMinutes: 400 },
    },
    ...overrides,
  };
}

export function buildTicketDetail(overrides: Partial<TicketDetail> = {}): TicketDetail {
  return {
    ...buildTicket(),
    description: "Customers are being **charged twice** for one order.",
    ...overrides,
  };
}

export function buildMember(user: User, role: ProjectMember["role"]): ProjectMember {
  return { ...user, role };
}

type TeammateComment = Exclude<Comment, { kind: "customer_message" }>;
type StatusChangedEvent = Extract<TicketEvent, { type: "status_changed" }>;

export const customerMessage: Comment = {
  id: 1,
  ticketId: "CHK-196",
  kind: "customer_message",
  author: { id: 17, name: "Daniel Okoye", email: "daniel@atlassportsgroup.example" },
  body: "More examples from this morning: 418355 and 418362.",
  createdAt: "2026-09-27T19:15:00.000Z",
};

export const internalNote: TeammateComment = {
  id: 2,
  ticketId: "CHK-196",
  kind: "internal_note",
  author: diego,
  body: "The retry sends a different idempotency key.",
  createdAt: "2026-09-27T19:20:00.000Z",
};

export const statusChange: StatusChangedEvent = {
  id: 10,
  ticketId: "CHK-196",
  type: "status_changed",
  actor: diego,
  from: "open",
  to: "in_progress",
  createdAt: "2026-09-27T18:31:00.000Z",
};
