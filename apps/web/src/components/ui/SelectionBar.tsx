import { X } from "lucide-react";
import { type ReactNode, useEffect, useEffectEvent } from "react";
import { Button } from "./Button.tsx";
import { Tooltip } from "./Tooltip.tsx";

type SelectionBarProps = {
  count: number;
  onClear: () => void;
  /** Buttons that act on the selected rows. */
  children: ReactNode;
};

/**
 * Floats over the bottom of a Panel while rows are selected; Escape clears the selection.
 * Pass it as the Panel's `overlay`, which positions it.
 */
export function SelectionBar({ count, onClear, children }: SelectionBarProps) {
  const clear = useEffectEvent(onClear);

  useEffect(() => {
    if (count === 0) {
      return;
    }
    function clearOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        clear();
      }
    }
    document.addEventListener("keydown", clearOnEscape);
    return () => document.removeEventListener("keydown", clearOnEscape);
  }, [count]);

  if (count === 0) {
    return null;
  }

  return (
    <div
      role="toolbar"
      aria-label="Selected rows"
      className="flex h-11 items-center gap-1 rounded-lg border border-line bg-popover px-1.5 shadow-popover"
    >
      <span className="px-2 font-medium whitespace-nowrap tabular-nums">{count} selected</span>
      <span aria-hidden="true" className="mx-1 h-5 w-px bg-line" />
      {children}
      <span aria-hidden="true" className="mx-1 h-5 w-px bg-line" />
      <Tooltip content="Clear selection" shortcut="Esc">
        <Button variant="ghost" size="icon" aria-label="Clear selection" onClick={onClear}>
          <X aria-hidden="true" className="size-4" />
        </Button>
      </Tooltip>
    </div>
  );
}
