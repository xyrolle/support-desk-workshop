import { type CustomerTier, tierNames } from "@support-desk/shared";
import { Badge } from "../../components/ui/Badge.tsx";

/** The customer's plan. Quiet on purpose: every customer matters. */
export function TierBadge({ tier }: { tier: CustomerTier }) {
  return <Badge>{tierNames[tier]}</Badge>;
}
