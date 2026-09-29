import { Popover as BasePopover } from "@base-ui/react/popover";
import type { ReactNode } from "react";
import { classNames } from "../../lib/class-names.ts";
import { popupClassName } from "./popup-styles.ts";

export const Popover = BasePopover.Root;

/** Opens the popover. Style it with `render`, for example `render={<Button />}`. */
export const PopoverTrigger = BasePopover.Trigger;

type PopoverPopupProps = {
  title?: string;
  children: ReactNode;
};

/** A small panel of extra content or controls, anchored to its trigger. */
export function PopoverPopup({ title, children }: PopoverPopupProps) {
  return (
    <BasePopover.Portal>
      <BasePopover.Positioner align="start" sideOffset={6} className="z-50 outline-none">
        <BasePopover.Popup className={classNames(popupClassName, "w-72 p-3")}>
          {title && <BasePopover.Title className="mb-1 font-semibold">{title}</BasePopover.Title>}
          {children}
        </BasePopover.Popup>
      </BasePopover.Positioner>
    </BasePopover.Portal>
  );
}
