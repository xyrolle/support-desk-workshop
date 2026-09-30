import type { ReactNode } from "react";

/** The strip at the top of every page, for breadcrumbs. It stays visible while the page scrolls. */
export function TopBar({ children }: { children: ReactNode }) {
  return (
    <div className="sticky top-0 z-30 flex h-12 shrink-0 items-center gap-3 border-b border-line bg-canvas px-8">
      {children}
    </div>
  );
}
