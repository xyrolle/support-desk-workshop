import type { ReactNode } from "react";

/** A keyboard key, for shortcut hints: <Kbd>Esc</Kbd>. */
export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-line bg-surface-subtle px-1 font-sans text-[11px] font-medium text-ink-muted">
      {children}
    </kbd>
  );
}
