import { Search, X } from "lucide-react";
import type { ComponentProps } from "react";
import { classNames } from "../../lib/class-names.ts";
import { controlClassName } from "./popup-styles.ts";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={classNames(controlClassName, "px-2.5 placeholder:text-ink-subtle", className)}
      {...props}
    />
  );
}

type SearchInputProps = Omit<ComponentProps<"input">, "type"> & {
  /** Shows a clear button while there is text. */
  onClear?: () => void;
};

/** A search field with a magnifier, and a clear button when `onClear` is given. */
export function SearchInput({ className, onClear, value, ...props }: SearchInputProps) {
  return (
    <div className={classNames("relative", className)}>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-ink-subtle"
      />
      <input
        type="search"
        value={value}
        className={classNames(
          controlClassName,
          "w-full px-8 placeholder:text-ink-subtle [&::-webkit-search-cancel-button]:appearance-none",
        )}
        {...props}
      />
      {onClear && value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={onClear}
          className="absolute top-1/2 right-1.5 flex size-5 -translate-y-1/2 items-center justify-center rounded text-ink-subtle transition-colors hover:bg-surface-muted hover:text-ink"
        >
          <X aria-hidden="true" className="size-3.5" />
        </button>
      )}
    </div>
  );
}
