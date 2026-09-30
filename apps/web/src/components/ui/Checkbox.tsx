import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { Check, Minus } from "lucide-react";
import { classNames, type WithClassName } from "../../lib/class-names.ts";

/** A small square checkbox. Pass `indeterminate` for a "some rows selected" box. */
export function Checkbox({ className, ...props }: WithClassName<BaseCheckbox.Root.Props>) {
  return (
    <BaseCheckbox.Root
      className={classNames(
        "flex size-3.5 shrink-0 items-center justify-center rounded-[4px] border border-ink-subtle/50 bg-canvas text-white",
        "transition-colors hover:border-ink-subtle",
        "data-checked:border-primary data-checked:bg-primary data-indeterminate:border-primary data-indeterminate:bg-primary",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        className,
      )}
      {...props}
    >
      <BaseCheckbox.Indicator>
        {props.indeterminate ? (
          <Minus aria-hidden="true" className="size-2.5" strokeWidth={3.5} />
        ) : (
          <Check aria-hidden="true" className="size-2.5" strokeWidth={3.5} />
        )}
      </BaseCheckbox.Indicator>
    </BaseCheckbox.Root>
  );
}
