import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import { Check } from "lucide-react";
import { classNames, type WithClassName } from "../../lib/class-names.ts";
import { popupClassName, popupItemClassName } from "./popup-styles.ts";

/**
 * A searchable list. Pass `items`, and render them with a function child of ComboboxPopup.
 * The first match is highlighted while typing, so Enter picks it.
 */
export function Combobox<Value, Multiple extends boolean | undefined = false>(
  props: BaseCombobox.Root.Props<Value, Multiple>,
) {
  return <BaseCombobox.Root autoHighlight {...props} />;
}

/** Opens the popup. Style it with `render`, for example as the value it edits. */
export const ComboboxTrigger = BaseCombobox.Trigger;

type ComboboxPopupProps = {
  /** Placeholder of the search field at the top of the popup. */
  placeholder: string;
  /** Shown when nothing matches the search. */
  emptyText: string;
  children: BaseCombobox.List.Props["children"];
};

/** A popup with a search field on top and the matching items below. */
export function ComboboxPopup({ placeholder, emptyText, children }: ComboboxPopupProps) {
  return (
    <BaseCombobox.Portal>
      <BaseCombobox.Positioner align="start" sideOffset={4} className="z-50 outline-none">
        <BaseCombobox.Popup className={classNames(popupClassName, "w-60")}>
          <BaseCombobox.Input
            placeholder={placeholder}
            className="h-9 w-full border-b border-line bg-transparent px-3 outline-none placeholder:text-ink-subtle"
          />
          <BaseCombobox.Empty className="px-3 py-2.5 text-ink-subtle empty:hidden">
            {emptyText}
          </BaseCombobox.Empty>
          <BaseCombobox.List className="max-h-72 overflow-y-auto p-1 empty:hidden">
            {children}
          </BaseCombobox.List>
        </BaseCombobox.Popup>
      </BaseCombobox.Positioner>
    </BaseCombobox.Portal>
  );
}

/** One choice, with a check when it is the chosen one. */
export function ComboboxItem({
  className,
  children,
  ...props
}: WithClassName<BaseCombobox.Item.Props>) {
  return (
    <BaseCombobox.Item className={classNames(popupItemClassName, "pr-1.5", className)} {...props}>
      <span className="flex min-w-0 flex-1 items-center gap-2 truncate">{children}</span>
      <BaseCombobox.ItemIndicator className="text-ink-muted">
        <Check aria-hidden="true" className="size-3.5" />
      </BaseCombobox.ItemIndicator>
    </BaseCombobox.Item>
  );
}
