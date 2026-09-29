import { classNames } from "../lib/class-names.ts";

export function Skeleton({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={classNames("block animate-pulse rounded bg-surface-muted", className)}
    />
  );
}
