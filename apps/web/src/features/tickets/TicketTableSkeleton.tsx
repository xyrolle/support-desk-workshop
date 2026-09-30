import { Skeleton } from "../../components/ui/Skeleton.tsx";

/** Title widths vary from row to row, so the placeholder reads like a real list. */
const placeholderRows = [
  { id: 1, titleWidth: "w-3/5" },
  { id: 2, titleWidth: "w-2/5" },
  { id: 3, titleWidth: "w-1/2" },
  { id: 4, titleWidth: "w-2/3" },
  { id: 5, titleWidth: "w-1/3" },
  { id: 6, titleWidth: "w-1/2" },
  { id: 7, titleWidth: "w-3/5" },
  { id: 8, titleWidth: "w-2/5" },
  { id: 9, titleWidth: "w-1/2" },
  { id: 10, titleWidth: "w-1/3" },
];

/** Matches TicketTable's columns, so nothing moves when the tickets arrive. */
export function TicketTableSkeleton() {
  return (
    <div role="status" aria-label="Loading tickets">
      <div className="h-9 border-b border-line bg-surface-subtle" />
      {placeholderRows.map((row) => (
        <div key={row.id} className="flex h-10 items-center border-b border-line-subtle">
          <div className="w-24 shrink-0 pr-3 pl-4">
            <Skeleton className="h-2.5 w-14" />
          </div>
          <div className="min-w-0 flex-1 px-3">
            <Skeleton className={`h-2.5 ${row.titleWidth}`} />
          </div>
          <div className="flex w-36 shrink-0 items-center gap-2 px-3">
            <Skeleton className="size-3.5 rounded-full" />
            <Skeleton className="h-2.5 w-16" />
          </div>
          <div className="flex w-32 shrink-0 items-center gap-2 px-3">
            <Skeleton className="size-3.5" />
            <Skeleton className="h-2.5 w-12" />
          </div>
          <div className="flex w-48 shrink-0 items-center gap-2 px-3">
            <Skeleton className="size-5 rounded-full" />
            <Skeleton className="h-2.5 w-24" />
          </div>
          <div className="flex w-32 shrink-0 justify-end pr-4 pl-3">
            <Skeleton className="h-2.5 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}
