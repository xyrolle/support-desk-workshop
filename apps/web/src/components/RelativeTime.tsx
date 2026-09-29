import { formatDateTime, formatRelativeTime } from "../lib/dates.ts";

export function RelativeTime({ value }: { value: string }) {
  return (
    <time dateTime={value} title={formatDateTime(value)}>
      {formatRelativeTime(value)}
    </time>
  );
}
