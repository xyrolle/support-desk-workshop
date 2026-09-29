import type { TicketPriority } from "@support-desk/shared";

type BarPriority = Exclude<TicketPriority, "urgent">;

const filledBarCount: Record<BarPriority, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

const bars = [
  { x: 1.5, y: 9, height: 5 },
  { x: 6.5, y: 5.5, height: 8.5 },
  { x: 11.5, y: 2, height: 12 },
];

/** Signal bars for low, medium and high; a filled alert square for urgent. */
export function PriorityIcon({ priority }: { priority: TicketPriority }) {
  if (priority === "urgent") {
    return <UrgentIcon />;
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 shrink-0 text-ink-muted">
      {bars.map((bar, index) => (
        <rect
          key={bar.x}
          x={bar.x}
          y={bar.y}
          width="3"
          height={bar.height}
          rx="1"
          fill="currentColor"
          opacity={index < filledBarCount[priority] ? 1 : 0.25}
        />
      ))}
    </svg>
  );
}

function UrgentIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 shrink-0 text-orange-500">
      <rect x="1" y="1" width="14" height="14" rx="4" fill="currentColor" />
      <rect x="7" y="4" width="2" height="5" rx="1" fill="white" />
      <rect x="7" y="10.5" width="2" height="2" rx="1" fill="white" />
    </svg>
  );
}
