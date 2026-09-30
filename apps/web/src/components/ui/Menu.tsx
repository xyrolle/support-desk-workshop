import { Menu as BaseMenu } from "@base-ui/react/menu";
import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { classNames, type WithClassName } from "../../lib/class-names.ts";
import { Kbd } from "./Kbd.tsx";
import { popupClassName, popupItemClassName } from "./popup-styles.ts";

/** A list of actions. Checkbox items make it a multi-select menu, such as a filter. */
export const Menu = BaseMenu.Root;

/** Opens the menu. Style it with `render`, for example `render={<Button />}`. */
export const MenuTrigger = BaseMenu.Trigger;

export function MenuPopup({ children }: { children: ReactNode }) {
  return (
    <BaseMenu.Portal>
      <BaseMenu.Positioner align="start" sideOffset={4} className="z-50 outline-none">
        <BaseMenu.Popup className={classNames(popupClassName, "min-w-48 p-1")}>
          {children}
        </BaseMenu.Popup>
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  );
}

type MenuItemProps = WithClassName<BaseMenu.Item.Props> & {
  icon?: ReactNode;
  /** A keyboard shortcut to show on the right, like "⌘C". */
  shortcut?: string;
};

export function MenuItem({ icon, shortcut, className, children, ...props }: MenuItemProps) {
  return (
    <BaseMenu.Item className={classNames(popupItemClassName, className)} {...props}>
      {icon}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {shortcut && <Kbd>{shortcut}</Kbd>}
    </BaseMenu.Item>
  );
}

type MenuCheckboxItemProps = WithClassName<BaseMenu.CheckboxItem.Props> & {
  icon?: ReactNode;
};

/** An item that toggles on and off and keeps the menu open. */
export function MenuCheckboxItem({ icon, className, children, ...props }: MenuCheckboxItemProps) {
  return (
    <BaseMenu.CheckboxItem
      closeOnClick={false}
      className={classNames(popupItemClassName, "pr-1.5", className)}
      {...props}
    >
      {icon}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      <BaseMenu.CheckboxItemIndicator className="text-ink-muted">
        <Check aria-hidden="true" className="size-3.5" />
      </BaseMenu.CheckboxItemIndicator>
    </BaseMenu.CheckboxItem>
  );
}

export function MenuSeparator() {
  return <BaseMenu.Separator className="-mx-1 my-1 h-px bg-line" />;
}
