import type { CustomerTier, User } from "@support-desk/shared";
import { addMinutes } from "../../lib/dates.ts";
import type {
  ContactRow,
  LabelRow,
  NewCommentRow,
  NewTicketEventRow,
  OrganizationRow,
  ProjectMemberRow,
  ProjectRow,
  TicketLabelRow,
  TicketRow,
} from "../schema.ts";
import { generateHistory } from "./generated-history.ts";
import { seedOrganizations } from "./organizations.ts";
import { type SeedProject, seedProjects } from "./projects.ts";
import { createRandom, type Random } from "./random.ts";
import { billingStories } from "./stories/billing.ts";
import { checkoutStories } from "./stories/checkout.ts";
import { internalToolsStories } from "./stories/internal-tools.ts";
import { mobileAppStories } from "./stories/mobile-app.ts";
import type { ProjectStories, TicketStory, TicketThread } from "./story.ts";
import { teammates } from "./teammates.ts";
import { threadHistory } from "./thread-history.ts";
import { type LabelLookup, type PlacedTicket, toTicketRows } from "./ticket-rows.ts";
import { earlierWorkingTime } from "./working-hours.ts";
import {
  firstNameOf,
  toContactRows,
  toLabelRows,
  toMemberRows,
  toOrganizationRow,
  toProjectRow,
} from "./workspace-rows.ts";

const RANDOM_SEED = 20_260_929;
const FIRST_TICKET_NUMBER = 101;

const storiesByProject: Record<string, ProjectStories> = {
  checkout: checkoutStories,
  "mobile-app": mobileAppStories,
  "internal-tools": internalToolsStories,
  billing: billingStories,
};

/** Bigger customers write in more often. */
const ticketsPerTier: Record<CustomerTier, number> = { free: 1, pro: 2, enterprise: 3 };

export type SeedData = {
  users: User[];
  projects: ProjectRow[];
  projectMembers: ProjectMemberRow[];
  organizations: OrganizationRow[];
  contacts: ContactRow[];
  labels: LabelRow[];
  tickets: TicketRow[];
  ticketLabels: TicketLabelRow[];
  comments: NewCommentRow[];
  ticketEvents: NewTicketEventRow[];
};

type SeedContext = {
  random: Random;
  referenceDate: Date;
  contacts: ContactRow[];
};

/**
 * The whole demo data set, with every timestamp relative to `referenceDate`.
 * The same date always gives exactly the same data.
 */
export function buildSeedData(referenceDate: Date): SeedData {
  const context: SeedContext = {
    random: createRandom(RANDOM_SEED),
    referenceDate,
    contacts: toContactRows(seedOrganizations),
  };
  const labels = toLabelRows(seedProjects);
  const labelIdOf = labelLookup(labels);
  const ticketRows = seedProjects
    .flatMap((project) => placeProjectTickets(project, context))
    .map((placed) => toTicketRows(placed, labelIdOf));

  return {
    users: teammates,
    projects: seedProjects.map(toProjectRow),
    projectMembers: seedProjects.flatMap(toMemberRows),
    organizations: seedOrganizations.map((organization) =>
      toOrganizationRow(organization, referenceDate),
    ),
    contacts: context.contacts,
    labels,
    tickets: ticketRows.map((rows) => rows.ticket),
    ticketLabels: ticketRows.flatMap((rows) => rows.ticketLabels),
    comments: numberInTimeOrder(ticketRows.flatMap((rows) => rows.comments)),
    ticketEvents: numberInTimeOrder(ticketRows.flatMap((rows) => rows.events)),
  };
}

/** Ticket numbers follow the order in which the tickets were opened. */
function placeProjectTickets(project: SeedProject, context: SeedContext): PlacedTicket[] {
  const { stories, threads } = projectStories(project.id);
  const unnumbered = [
    ...stories.map((story) => placeStory(project, story, context)),
    ...threads.map((thread) => placeThread(project, thread, context)),
  ];

  return unnumbered
    .toSorted((first, second) => first.openedAt.getTime() - second.openedAt.getTime())
    .map((ticket, index) => ({ ...ticket, number: FIRST_TICKET_NUMBER + index }));
}

function placeStory(
  project: SeedProject,
  story: TicketStory,
  context: SeedContext,
): Omit<PlacedTicket, "number"> {
  const requester = pickRequester(project, story, context);
  const { history, quietMinutes } = generateHistory(story, {
    random: context.random,
    projectId: project.id,
    assigneeIds: assigneeIdsOf(project),
    triagerIds: project.triagerIds,
    requesterFirstName: firstNameOf(requester.name),
    firstNameOf: teammateFirstName,
  });

  const latestOpening = addMinutes(context.referenceDate, -(history.minute + quietMinutes));
  const openedAt = context.random.chance(0.8)
    ? earlierWorkingTime(latestOpening, project.timeZone, context.random)
    : latestOpening;

  return {
    projectId: project.id,
    projectKey: project.key,
    title: story.title,
    description: story.description,
    requesterId: requester.id,
    openedAt,
    history,
  };
}

function placeThread(
  project: SeedProject,
  thread: TicketThread,
  context: SeedContext,
): Omit<PlacedTicket, "number"> {
  const requester = context.contacts.find(
    (contact) => contact.organizationId === thread.organizationId,
  );
  if (!requester) {
    throw new Error(`Thread "${thread.title}": no contacts at ${thread.organizationId}.`);
  }
  const { history, quietMinutes } = threadHistory(thread, {
    random: context.random,
    triagerIds: project.triagerIds,
    requesterFirstName: firstNameOf(requester.name),
  });

  return {
    projectId: project.id,
    projectKey: project.key,
    title: thread.title,
    description: thread.description,
    requesterId: requester.id,
    openedAt: addMinutes(context.referenceDate, -(history.minute + quietMinutes)),
    history,
  };
}

/** A contact at a customer of the project, on the story's plan if it names one. */
function pickRequester(
  project: SeedProject,
  story: TicketStory,
  { random, contacts }: SeedContext,
): ContactRow {
  const tiers = story.tier ? [story.tier] : project.customerTiers;
  const organizations = seedOrganizations.filter((organization) =>
    tiers.includes(organization.tier),
  );
  const organization = random.weighted(
    organizations.map((candidate) => [candidate, ticketsPerTier[candidate.tier]] as const),
  );
  return random.pick(contacts.filter((contact) => contact.organizationId === organization.id));
}

function projectStories(projectId: string): ProjectStories {
  const stories = storiesByProject[projectId];
  if (!stories) {
    throw new Error(`There are no seed stories for project "${projectId}".`);
  }
  return stories;
}

function assigneeIdsOf(project: SeedProject): string[] {
  return Object.entries(project.members)
    .filter(([, role]) => role !== "viewer")
    .map(([userId]) => userId);
}

function teammateFirstName(userId: string): string {
  const teammate = teammates.find((candidate) => candidate.id === userId);
  if (!teammate) {
    throw new Error(`Unknown teammate "${userId}".`);
  }
  return firstNameOf(teammate.name);
}

function labelLookup(labels: LabelRow[]): LabelLookup {
  return (projectId, labelName) => {
    const label = labels.find(
      (candidate) => candidate.projectId === projectId && candidate.name === labelName,
    );
    if (!label) {
      throw new Error(`Project "${projectId}" has no label "${labelName}".`);
    }
    return label.id;
  };
}

/** Ids that grow with time, as they would in a real database. */
function numberInTimeOrder<Row extends { createdAt: string }>(rows: Row[]) {
  return rows
    .toSorted((first, second) => first.createdAt.localeCompare(second.createdAt))
    .map((row, index) => ({ ...row, id: index + 1 }));
}
