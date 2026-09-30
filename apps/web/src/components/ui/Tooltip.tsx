import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import type { ReactElement, ReactNode } from "react";
import { Kbd } from "./Kbd.tsx";

type TooltipProps = {
  content: ReactNode;
  /** A keyboard shortcut shown after the content, like "Esc". */
  shortcut?: string;
  /** The element the tooltip describes. */
  children: ReactElement;
};

/** A short hint on hover or focus. Supplementary only: never hide essential information in it. */
export function Tooltip({ content, shortcut, children }: TooltipProps) {
  return (
    <BaseTooltip.Root>
      <BaseTooltip.Trigger delay={400} render={children} />
      <BaseTooltip.Portal>
        <BaseTooltip.Positioner sideOffset={6} className="z-50">
          <BaseTooltip.Popup className="flex h-7 items-center gap-2 rounded-md border border-line bg-popover px-2 text-xs text-ink shadow-popover transition-opacity duration-100 data-starting-style:opacity-0 data-ending-style:opacity-0">
            {content}
            {shortcut && <Kbd>{shortcut}</Kbd>}
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  );
}
