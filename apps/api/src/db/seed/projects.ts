import type { CustomerTier, LabelColor, ProjectRole } from "@support-desk/shared";

export type SeedLabel = {
  name: string;
  color: LabelColor;
};

export type SeedProject = {
  id: string;
  key: string;
  name: string;
  description: string;
  timeZone: string;
  members: Record<string, ProjectRole>;
  /** Who sorts new tickets: sets labels, fixes the priority and assigns someone. */
  triagerIds: string[];
  labels: SeedLabel[];
  /** Which customers file tickets here (the mobile app is only on paid plans). */
  customerTiers: CustomerTier[];
};

const allTiers: CustomerTier[] = ["free", "pro", "enterprise"];

// Every project has the same three kinds of ticket, then labels for its own areas.
const ticketKindLabels: SeedLabel[] = [
  { name: "Bug", color: "red" },
  { name: "Question", color: "blue" },
  { name: "Feature request", color: "violet" },
];

/**
 * Maya Chen is an admin of Checkout and an agent in Mobile App and Internal
 * Tools. Billing is hidden from her. Ravi Patel (account manager) is a viewer.
 */
export const seedProjects: SeedProject[] = [
  {
    id: "checkout",
    key: "CHK",
    name: "Checkout",
    description: "Cart, payments, taxes and order confirmation for our merchants' stores.",
    timeZone: "Europe/Berlin",
    members: {
      "maya-chen": "admin",
      "diego-alvarez": "agent",
      "priya-nair": "agent",
      "lena-fischer": "agent",
      "chloe-martin": "agent",
      "ravi-patel": "viewer",
    },
    triagerIds: ["maya-chen", "priya-nair"],
    labels: [
      ...ticketKindLabels,
      { name: "Payments", color: "green" },
      { name: "Taxes", color: "amber" },
      { name: "Shipping", color: "teal" },
      { name: "Promotions", color: "pink" },
      { name: "Emails", color: "indigo" },
      { name: "Performance", color: "orange" },
    ],
    customerTiers: allTiers,
  },
  {
    id: "mobile-app",
    key: "MOB",
    name: "Mobile App",
    description: "The iOS and Android shopping apps merchants publish under their own brand.",
    timeZone: "America/New_York",
    members: {
      "sam-okafor": "admin",
      "maya-chen": "agent",
      "lena-fischer": "agent",
      "hana-kim": "agent",
      "olivia-brooks": "agent",
      "ravi-patel": "viewer",
    },
    triagerIds: ["sam-okafor", "maya-chen"],
    labels: [
      ...ticketKindLabels,
      { name: "iOS", color: "gray" },
      { name: "Android", color: "green" },
      { name: "Crash", color: "orange" },
      { name: "Push notifications", color: "amber" },
      { name: "Login", color: "teal" },
      { name: "App review", color: "indigo" },
    ],
    customerTiers: ["pro", "enterprise"],
  },
  {
    id: "internal-tools",
    key: "INT",
    name: "Internal Tools",
    description: "Merchant admin, exports, imports and the back-office tools support works in.",
    timeZone: "Europe/Lisbon",
    members: {
      "priya-nair": "admin",
      "maya-chen": "agent",
      "hana-kim": "agent",
      "tomas-silva": "agent",
      "olivia-brooks": "viewer",
    },
    triagerIds: ["priya-nair", "hana-kim"],
    labels: [
      ...ticketKindLabels,
      { name: "Exports", color: "teal" },
      { name: "Imports", color: "green" },
      { name: "Permissions", color: "amber" },
      { name: "Account changes", color: "indigo" },
      { name: "Data request", color: "pink" },
      { name: "Integrations", color: "orange" },
    ],
    customerTiers: allTiers,
  },
  {
    id: "billing",
    key: "BIL",
    name: "Billing",
    description: "Plans, invoices, refunds and failed payments for merchant subscriptions.",
    timeZone: "Europe/Dublin",
    members: {
      "aisha-rahman": "admin",
      "jonas-weber": "agent",
      "chloe-martin": "agent",
      "tomas-silva": "viewer",
      "ravi-patel": "viewer",
    },
    triagerIds: ["aisha-rahman", "jonas-weber"],
    labels: [
      ...ticketKindLabels,
      { name: "Invoices", color: "teal" },
      { name: "Refunds", color: "pink" },
      { name: "Plan change", color: "indigo" },
      { name: "Failed payment", color: "orange" },
      { name: "Tax ID", color: "amber" },
      { name: "Cancellation", color: "gray" },
    ],
    customerTiers: allTiers,
  },
];
