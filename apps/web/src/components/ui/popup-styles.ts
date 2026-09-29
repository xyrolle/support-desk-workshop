import { classNames } from "../../lib/class-names.ts";

/** The surface every popup shares: select, combobox, menu, popover. */
export const popupClassName = classNames(
  "origin-(--transform-origin) rounded-lg border border-line bg-popover text-ink shadow-popover outline-none",
  "transition-[opacity,scale] duration-100 ease-out motion-reduce:transition-none",
  "data-starting-style:scale-98 data-starting-style:opacity-0",
  "data-ending-style:scale-98 data-ending-style:opacity-0",
);

/** A row in a popup list, highlighted by the pointer or the arrow keys. */
export const popupItemClassName = classNames(
  "flex h-8 cursor-default items-center gap-2 rounded-md px-2 outline-none select-none",
  "data-highlighted:bg-surface-muted data-disabled:opacity-50",
);

/** The bordered look of text fields and select triggers. */
export const controlClassName = classNames(
  "flex h-8 items-center rounded-md border border-line bg-canvas text-ink",
  "transition-colors hover:border-ink-subtle/40",
  "focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-accent",
);
