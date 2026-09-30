import { utcDate } from "../../lib/dates.ts";
import { buildSeedData, type SeedData } from "./build-seed-data.ts";

/**
 * The demo data is always built against this moment, so every copy of the app has the
 * same tickets with the same ids (ticket numbers follow the order the tickets were opened,
 * and openings are placed in working hours around this date). Seeding at another moment
 * moves every timestamp by the same amount: the data looks just as recent, and the ids
 * never change.
 */
export const SEED_DATE = new Date("2026-09-29T13:00:00.000Z");

/** The demo data as of `now`: the seed date's data, moved so that its "now" is `now`. */
export function seedDataFor(now: Date): SeedData {
  return moveBy(buildSeedData(SEED_DATE), now.getTime() - SEED_DATE.getTime());
}

function moveBy(data: SeedData, milliseconds: number): SeedData {
  if (milliseconds === 0) {
    return data;
  }
  const move = (timestamp: string) => new Date(Date.parse(timestamp) + milliseconds).toISOString();
  const moveIfSet = (timestamp: string | null) => (timestamp === null ? null : move(timestamp));
  const moveDate = (date: string) =>
    utcDate(new Date(Date.parse(`${date}T00:00:00.000Z`) + milliseconds));

  return {
    ...data,
    organizations: data.organizations.map((row) => ({
      ...row,
      customerSince: moveDate(row.customerSince),
    })),
    tickets: data.tickets.map((row) => ({
      ...row,
      createdAt: move(row.createdAt),
      updatedAt: move(row.updatedAt),
      firstRespondedAt: moveIfSet(row.firstRespondedAt),
      resolvedAt: moveIfSet(row.resolvedAt),
    })),
    comments: data.comments.map((row) => ({ ...row, createdAt: move(row.createdAt) })),
    ticketEvents: data.ticketEvents.map((row) => ({ ...row, createdAt: move(row.createdAt) })),
  };
}
