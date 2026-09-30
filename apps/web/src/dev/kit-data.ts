import type { TicketListItem, User } from "@support-desk/shared";
import type { PriorityKind } from "../components/ui/PriorityIcon.tsx";
import type { StatusKind } from "../components/ui/StatusIcon.tsx";

export const maya: User = {
  id: "maya-chen",
  email: "maya.chen@brightcart.example",
  name: "Maya Chen",
  initials: "MC",
  avatarColor: "violet",
};
export const diego: User = {
  id: "diego-alvarez",
  email: "diego.alvarez@brightcart.example",
  name: "Diego Alvarez",
  initials: "DA",
  avatarColor: "amber",
};
export const priya: User = {
  id: "priya-nair",
  email: "priya.nair@brightcart.example",
  name: "Priya Nair",
  initials: "PN",
  avatarColor: "emerald",
};
export const lena: User = {
  id: "lena-fischer",
  email: "lena.fischer@brightcart.example",
  name: "Lena Fischer",
  initials: "LF",
  avatarColor: "rose",
};
export const sam: User = {
  id: "sam-okafor",
  email: "sam.okafor@brightcart.example",
  name: "Sam Okafor",
  initials: "SO",
  avatarColor: "sky",
};
export const hana: User = {
  id: "hana-kim",
  name: "Hana Kim",
  initials: "HK",
  email: "hana.kim@brightcart.example",
  avatarColor: "teal",
};

/** The Checkout members, sorted by name like the API sorts them. */
export const checkoutMembers = [diego, lena, maya, priya];

export const statusKinds: StatusKind[] = ["open", "in_progress", "blocked", "resolved", "closed"];

export const priorityKinds: PriorityKind[] = ["none", "low", "medium", "high", "urgent"];

export const priorityNames: Record<PriorityKind, string> = {
  none: "No priority",
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

const requester: TicketListItem["requester"] = {
  id: 17,
  name: "Daniel Okoye",
  email: "daniel@atlassportsgroup.example",
  organization: { id: "atlas-sports-group", name: "Atlas Sports Group", tier: "enterprise" },
};

function kitTicket(
  ticket: Pick<TicketListItem, "id" | "title" | "status" | "priority" | "assignee"> & {
    hours: number;
  },
): TicketListItem {
  const { hours, ...fields } = ticket;
  return {
    ...fields,
    projectId: "checkout",
    requester,
    labels: [],
    createdAt: hoursAgo(hours + 48),
    updatedAt: hoursAgo(hours),
    firstRespondedAt: hoursAgo(hours + 47),
    resolvedAt: null,
  };
}

export const kitTickets: TicketListItem[] = [
  kitTicket({
    id: "CHK-101",
    title: "Apple Pay sheet closes without charging on Safari 18",
    status: "in_progress",
    priority: "urgent",
    assignee: diego,
    hours: 3,
  }),
  kitTicket({
    id: "CHK-104",
    title: "Cart total flickers to $0.00 while shipping is recalculated",
    status: "in_progress",
    priority: "low",
    assignee: lena,
    hours: 6,
  }),
  kitTicket({
    id: "CHK-112",
    title: "3-D Secure challenge times out on slow connections",
    status: "blocked",
    priority: "urgent",
    assignee: maya,
    hours: 9,
  }),
  kitTicket({
    id: "CHK-109",
    title: "Tax summary is missing QST for Quebec orders",
    status: "open",
    priority: "high",
    assignee: diego,
    hours: 10,
  }),
  kitTicket({
    id: "CHK-123",
    title: "Postcode validation rejects valid UK postcodes",
    status: "open",
    priority: "medium",
    assignee: null,
    hours: 26,
  }),
  kitTicket({
    id: "CHK-125",
    title: "Double-clicking 'Place order' creates two orders",
    status: "closed",
    priority: "urgent",
    assignee: maya,
    hours: 30,
  }),
];
