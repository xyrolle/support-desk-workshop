import { TopBar } from "../../components/TopBar.tsx";
import { Skeleton } from "../../components/ui/Skeleton.tsx";

/** The page's shape while the ticket loads: title, messages, and the side panel. */
export function TicketDetailSkeleton() {
  return (
    <div role="status" aria-label="Loading the ticket">
      <TopBar>
        <Skeleton className="h-3 w-56" />
      </TopBar>
      <div className="flex items-start gap-10 px-8 py-6">
        <div className="min-w-0 max-w-3xl flex-1 space-y-3">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="mt-6 h-32 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
        <div className="w-76 shrink-0 space-y-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-full" />
          <Skeleton className="h-7 w-full" />
          <Skeleton className="h-7 w-full" />
        </div>
      </div>
    </div>
  );
}
