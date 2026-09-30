import type { ReactNode } from "react";
import { classNames } from "../../lib/class-names.ts";

export type StatusKind = "open" | "in_progress" | "blocked" | "resolved" | "closed";

const colorClasses: Record<StatusKind, string> = {
  open: "text-status-open",
  in_progress: "text-status-in-progress",
  blocked: "text-status-blocked",
  resolved: "text-status-resolved",
  closed: "text-status-closed",
};

const ring = <circle cx="7" cy="7" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.5" />;
const disc = <circle cx="7" cy="7" r="6.25" fill="currentColor" />;
const check = "m4.6 7.2 1.7 1.7 3.1-3.4";

/** Shape tells the states apart, colour adds meaning: a ring, a half-filled ring, a bar, a check. */
const glyphs: Record<StatusKind, ReactNode> = {
  open: ring,
  in_progress: (
    <>
      {ring}
      <path d="M7 3.75a3.25 3.25 0 0 1 0 6.5z" fill="currentColor" />
    </>
  ),
  blocked: (
    <>
      {disc}
      <rect x="4" y="6.25" width="6" height="1.5" rx="0.75" className="fill-canvas" />
    </>
  ),
  resolved: (
    <>
      {disc}
      <path
        d={check}
        fill="none"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="stroke-canvas"
      />
    </>
  ),
  closed: (
    <>
      {ring}
      <path d={check} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
};

/** The status glyph. Decorative: always show the status name next to it. */
export function StatusIcon({ status }: { status: StatusKind }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 14 14"
      className={classNames("size-3.5 shrink-0", colorClasses[status])}
    >
      {glyphs[status]}
    </svg>
  );
}
