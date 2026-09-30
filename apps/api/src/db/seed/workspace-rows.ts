import { addMinutes, utcDate } from "../../lib/dates.ts";
import type {
  ContactRow,
  LabelRow,
  OrganizationRow,
  ProjectMemberRow,
  ProjectRow,
} from "../schema.ts";
import type { SeedOrganization } from "./organizations.ts";
import type { SeedProject } from "./projects.ts";

const MINUTES_PER_DAY = 24 * 60;

export function toProjectRow(project: SeedProject): ProjectRow {
  return {
    id: project.id,
    key: project.key,
    name: project.name,
    description: project.description,
    timeZone: project.timeZone,
  };
}

export function toMemberRows(project: SeedProject): ProjectMemberRow[] {
  return Object.entries(project.members).map(([userId, role]) => ({
    projectId: project.id,
    userId,
    role,
  }));
}

export function toOrganizationRow(
  organization: SeedOrganization,
  referenceDate: Date,
): OrganizationRow {
  const customerSince = addMinutes(referenceDate, -organization.customerForDays * MINUTES_PER_DAY);
  return {
    id: organization.id,
    name: organization.name,
    domain: organization.domain,
    tier: organization.tier,
    customerSince: utcDate(customerSince),
  };
}

/** Contacts get ids from 1, in the order of the organizations. */
export function toContactRows(organizations: SeedOrganization[]): ContactRow[] {
  const rows = organizations.flatMap((organization) =>
    organization.contacts.map((name) => ({
      organizationId: organization.id,
      name,
      email: `${firstNameOf(name).toLowerCase()}@${organization.domain}`,
    })),
  );
  return rows.map((row, index) => ({ id: index + 1, ...row }));
}

/** Labels get ids from 1, in the order of the projects. */
export function toLabelRows(projects: SeedProject[]): LabelRow[] {
  const rows = projects.flatMap((project) =>
    project.labels.map((label) => ({ projectId: project.id, ...label })),
  );
  return rows.map((row, index) => ({ id: index + 1, ...row }));
}

export function firstNameOf(fullName: string): string {
  return fullName.split(" ")[0] ?? fullName;
}
