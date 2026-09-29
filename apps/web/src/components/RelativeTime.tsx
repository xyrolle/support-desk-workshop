import { formatDateTime, formatRelativeTime } from "../lib/dates.ts";
import { Tooltip } from "./ui/Tooltip.tsx";

/** "3 hours ago", with the exact date and time on hover. */
export function RelativeTime({ value }: { value: string }) {
  return (
    <Tooltip content={formatDateTime(value)}>
      <time dateTime={value}>{formatRelativeTime(value)}</time>
    </Tooltip>
  );
}
