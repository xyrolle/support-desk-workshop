import { Skeleton } from "../../components/Skeleton.tsx";

const placeholderRows = [1, 2, 3, 4, 5, 6, 7, 8];

export function TicketTableSkeleton() {
  return (
    <div role="status" aria-label="Loading tickets" className="pt-10">
      {placeholderRows.map((row) => (
        <div key={row} className="flex h-11 items-center gap-6 border-b border-line px-8">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 flex-1" />
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  );
}
