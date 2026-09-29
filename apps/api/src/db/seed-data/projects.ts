import type { Project } from "@support-desk/shared";
import type { ProjectMemberRow } from "../schema.ts";

export const seedProjects: Project[] = [
  {
    id: "checkout",
    key: "CHK",
    name: "Checkout",
    description: "Cart, payments and order confirmation on the web store.",
  },
  {
    id: "mobile-app",
    key: "MOB",
    name: "Mobile App",
    description: "The iOS and Android shopping app.",
  },
  {
    id: "internal-tools",
    key: "INT",
    name: "Internal Tools",
    description: "Admin panel and back-office tooling for support and finance.",
  },
];

export const seedProjectMembers: ProjectMemberRow[] = [
  { projectId: "checkout", userId: "maya-chen" },
  { projectId: "checkout", userId: "diego-alvarez" },
  { projectId: "checkout", userId: "priya-nair" },
  { projectId: "checkout", userId: "lena-fischer" },
  { projectId: "mobile-app", userId: "maya-chen" },
  { projectId: "mobile-app", userId: "lena-fischer" },
  { projectId: "mobile-app", userId: "sam-okafor" },
  { projectId: "mobile-app", userId: "hana-kim" },
  { projectId: "internal-tools", userId: "priya-nair" },
  { projectId: "internal-tools", userId: "hana-kim" },
  { projectId: "internal-tools", userId: "tomas-silva" },
];
