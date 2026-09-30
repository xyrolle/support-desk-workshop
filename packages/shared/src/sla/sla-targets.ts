import type { CustomerTier } from "../customers.ts";
import type { TicketPriority } from "../tickets.ts";

/** First-response and resolution targets, in business hours. One lookup. */
const targetHours = {
  urgent: {
    enterprise: [1, 9],
    pro: [2, 18],
    free: [4, 27],
  },
  high: {
    enterprise: [2, 27],
    pro: [4, 45],
    free: [8, 63],
  },
  medium: {
    enterprise: [4, 45],
    pro: [8, 72],
    free: [16, 90],
  },
  low: {
    enterprise: [8, 90],
    pro: [16, 135],
    free: [32, 180],
  },
} as const satisfies Record<TicketPriority, Record<CustomerTier, readonly [number, number]>>;

/** The promise for this priority and plan, in business minutes. */
export function slaTargetMinutes(
  priority: TicketPriority,
  tier: CustomerTier,
): { firstResponseMinutes: number; resolutionMinutes: number } {
  const [firstResponseHours, resolutionHours] = targetHours[priority][tier];
  return {
    firstResponseMinutes: firstResponseHours * 60,
    resolutionMinutes: resolutionHours * 60,
  };
}
