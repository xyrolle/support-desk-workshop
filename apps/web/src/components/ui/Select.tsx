import { Select as BaseSelect } from "@base-ui/react/select";
import { Check, ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { classNames, type WithClassName } from "../../lib/class-names.ts";
import { controlClassName, popupClassName, popupItemClassName } from "./popup-styles.ts";

/** Holds the value. Pass `multiple` to choose several items; the popup then stays open. */
export const Select = BaseSelect.Root;

/** Renders the chosen value inside the trigger. */
export const SelectValue = BaseSelect.Value;

type SelectTriggerProps = WithClassName<BaseSelect.Trigger.Props> & {
  /**
   * `field` is a bordered control, as in a toolbar. `inline` looks like the value it edits
   * until hovered, as in a property list.
   */
  appearance?: "field" | "inline";
};

const triggerAppearanceClasses = {
  field: classNames(
    controlClassName,
    "pr-2 pl-2.5 font-medium data-disabled:cursor-not-allowed data-disabled:opacity-60",
  ),
  inline: classNames(
    "flex h-8 w-full items-center rounded-md px-2 text-ink transition-colors",
    "hover:bg-surface-hover data-popup-open:bg-surface-hover",
    "focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-accent",
    "data-disabled:cursor-not-allowed data-disabled:opacity-60 data-disabled:hover:bg-transparent",
  ),
};

/** A button that shows the chosen value and opens the list. */
export function SelectTrigger({
  appearance = "field",
  className,
  children,
  ...props
}: SelectTriggerProps) {
  return (
    <BaseSelect.Trigger
      className={classNames(
        triggerAppearanceClasses[appearance],
        "gap-2 whitespace-nowrap data-popup-open:bg-surface-hover",
        className,
      )}
      {...props}
    >
      {children}
      <BaseSelect.Icon
        className={classNames(
          "ml-auto text-ink-subtle",
          appearance === "inline" && "opacity-0 group-hover/field:opacity-100",
        )}
      >
        <ChevronDown aria-hidden="true" className="size-3.5" />
      </BaseSelect.Icon>
    </BaseSelect.Trigger>
  );
}

/** The list of items, below the trigger. */
export function SelectPopup({ children }: { children: ReactNode }) {
  return (
    <BaseSelect.Portal>
      <BaseSelect.Positioner
        align="start"
        sideOffset={4}
        alignItemWithTrigger={false}
        className="z-50 outline-none"
      >
        <BaseSelect.Popup className={classNames(popupClassName, "min-w-(--anchor-width) p-1")}>
          <BaseSelect.List className="max-h-(--available-height) overflow-y-auto">
            {children}
          </BaseSelect.List>
        </BaseSelect.Popup>
      </BaseSelect.Positioner>
    </BaseSelect.Portal>
  );
}

/** One choice. Children can include a glyph or an avatar before the label. */
export function SelectItem({
  className,
  children,
  ...props
}: WithClassName<BaseSelect.Item.Props>) {
  return (
    <BaseSelect.Item className={classNames(popupItemClassName, "pr-1.5", className)} {...props}>
      <BaseSelect.ItemText className="flex min-w-0 flex-1 items-center gap-2 truncate">
        {children}
      </BaseSelect.ItemText>
      <BaseSelect.ItemIndicator className="text-ink-muted">
        <Check aria-hidden="true" className="size-3.5" />
      </BaseSelect.ItemIndicator>
    </BaseSelect.Item>
  );
}
