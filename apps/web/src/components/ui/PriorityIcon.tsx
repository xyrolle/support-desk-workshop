export type PriorityKind = "none" | "low" | "medium" | "high" | "urgent";

type BarPriority = Exclude<PriorityKind, "urgent">;

const filledBarCount: Record<BarPriority, number> = {
  none: 0,
  low: 1,
  medium: 2,
  high: 3,
};

const bars = [
  { x: 1.5, height: 5 },
  { x: 6.5, height: 8.5 },
  { x: 11.5, height: 12 },
];

/** Signal bars for none to high, an alert square for urgent. Decorative: show the name too. */
export function PriorityIcon({ priority }: { priority: PriorityKind }) {
  if (priority === "urgent") {
    return <UrgentIcon />;
  }

  if (priority === "none") {
    return <NoPriorityIcon />;
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 shrink-0 text-ink-muted">
      {bars.map((bar, index) => (
        <rect
          key={bar.x}
          x={bar.x}
          y={14 - bar.height}
          width="3"
          height={bar.height}
          rx="1"
          fill="currentColor"
          opacity={index < filledBarCount[priority] ? 1 : 0.28}
        />
      ))}
    </svg>
  );
}

function UrgentIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 shrink-0 text-priority-urgent">
      <rect x="1.5" y="1.5" width="13" height="13" rx="3.5" fill="currentColor" />
      <rect x="7.1" y="4.25" width="1.8" height="4.9" rx="0.9" className="fill-canvas" />
      <circle cx="8" cy="11.1" r="1" className="fill-canvas" />
    </svg>
  );
}

function NoPriorityIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 shrink-0 text-ink-subtle">
      {bars.map((bar) => (
        <rect key={bar.x} x={bar.x} y="7.25" width="3" height="1.5" rx="0.75" fill="currentColor" />
      ))}
    </svg>
  );
}
