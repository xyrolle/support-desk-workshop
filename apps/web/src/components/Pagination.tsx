import type { PageInfo } from "@support-desk/shared";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/Button.tsx";

type PaginationProps = PageInfo & {
  onPageChange: (page: number) => void;
};

export function Pagination({
  page,
  pageSize,
  totalItems,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const firstItem = (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, totalItems);

  return (
    <nav aria-label="Pagination" className="flex h-12 items-center justify-between px-4">
      <p className="text-ink-muted">
        Showing{" "}
        <span className="font-medium text-ink tabular-nums">
          {firstItem}–{lastItem}
        </span>{" "}
        of <span className="font-medium text-ink tabular-nums">{totalItems}</span>
      </p>

      <div className="flex items-center gap-3">
        <p className="text-ink-muted tabular-nums">
          Page {page} of {totalPages}
        </p>
        <div className="flex gap-1.5">
          <Button size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            <ChevronLeft aria-hidden="true" className="-ml-1 size-4" />
            Previous
          </Button>
          <Button size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
            Next
            <ChevronRight aria-hidden="true" className="-mr-1 size-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
