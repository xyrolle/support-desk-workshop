import { addMinutes, zonedParts } from "../../lib/dates.ts";
import type { Random } from "./random.ts";

const OPENING_HOUR = 9;
const CLOSING_HOUR = 18;

/** Monday to Friday, 9:00 to 18:00 in the team's time zone. */
function isWorkingTime(date: Date, timeZone: string): boolean {
  const { weekday, hour } = zonedParts(date, timeZone);
  return weekday <= 5 && hour >= OPENING_HOUR && hour < CLOSING_HOUR;
}

/**
 * The same moment, or an earlier one within the team's working hours: most
 * merchants write in during the working day, and the team answers during theirs.
 */
export function earlierWorkingTime(date: Date, timeZone: string, random: Random): Date {
  let moment = date;
  while (!isWorkingTime(moment, timeZone)) {
    moment = addMinutes(moment, -60);
  }
  // Spread the openings over the day rather than just before closing time.
  const earlier = addMinutes(moment, -60 * random.integer(0, 6));
  return isWorkingTime(earlier, timeZone) ? earlier : moment;
}
