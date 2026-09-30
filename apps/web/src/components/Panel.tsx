import type { ReactNode, Ref } from "react";

type PanelProps = {
  /** Controls above the content, such as search and filters. */
  toolbar?: ReactNode;
  /** A strip below the content, such as pagination. */
  footer?: ReactNode;
  /** Floats over the content without scrolling, such as a SelectionBar. */
  overlay?: ReactNode;
  scrollAreaRef?: Ref<HTMLDivElement>;
  children: ReactNode;
};

/** A bordered box that fills its parent, for a table and its states. The middle scrolls. */
export function Panel({ toolbar, footer, overlay, scrollAreaRef, children }: PanelProps) {
  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-line bg-canvas">
      {toolbar && (
        <div className="flex h-12 shrink-0 items-center gap-2 border-b border-line px-3">
          {toolbar}
        </div>
      )}
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div ref={scrollAreaRef} className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {children}
        </div>
        {overlay}
      </div>
      {footer && <div className="shrink-0 border-t border-line">{footer}</div>}
    </section>
  );
}
