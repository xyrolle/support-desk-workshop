import type { ReactNode } from "react";

/** The strip at the top of every page, for breadcrumbs. */
export function TopBar({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-12 shrink-0 items-center border-b border-line px-8">{children}</div>
  );
}
