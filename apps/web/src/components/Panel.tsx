import type { ReactNode } from "react";

type PanelProps = {
  /** Controls above the content, such as sorting. */
  toolbar?: ReactNode;
  /** A strip below the content, such as pagination. */
  footer?: ReactNode;
  /** Floats at the bottom of the visible part of the panel, such as a SelectionBar. */
  overlay?: ReactNode;
  children: ReactNode;
};

/**
 * A bordered box for a table and its states. It grows with its content and the page
 * scrolls; `overflow-clip` keeps the rounded corners without breaking sticky headers.
 */
export function Panel({ toolbar, footer, overlay, children }: PanelProps) {
  return (
    <section className="flex flex-col overflow-clip rounded-lg border border-line bg-canvas">
      {toolbar && (
        <div className="flex h-12 shrink-0 flex-nowrap items-center gap-2 border-b border-line px-3">
          {toolbar}
        </div>
      )}
      <div className="flex min-h-48 flex-col">{children}</div>
      {overlay && (
        <div className="pointer-events-none sticky bottom-4 z-20 flex justify-center *:pointer-events-auto">
          {overlay}
        </div>
      )}
      {footer && <div className="shrink-0 border-t border-line">{footer}</div>}
    </section>
  );
}
