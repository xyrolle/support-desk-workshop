import type { ComponentProps, ReactNode } from "react";
import { classNames } from "../../lib/class-names.ts";

/**
 * The parts of a data table: 40px rows on hairlines, under a 36px header that sticks
 * below the page's TopBar while the page scrolls. Put it inside a Panel.
 */
export function Table({ children }: { children: ReactNode }) {
  return <table className="w-full table-fixed border-separate border-spacing-0">{children}</table>;
}

/** The header row. Its children are TableHead cells. */
export function TableHeader({ children }: { children: ReactNode }) {
  return (
    <thead className="sticky top-12 z-10 bg-surface-subtle">
      <tr>{children}</tr>
    </thead>
  );
}

export function TableHead({ className, ...props }: ComponentProps<"th">) {
  return (
    <th
      scope="col"
      className={classNames(
        "h-9 border-b border-line px-3 text-left text-xs font-medium text-ink-subtle first:pl-4 last:pr-4",
        className,
      )}
      {...props}
    />
  );
}

type TableRowProps = ComponentProps<"tr"> & {
  selected?: boolean;
};

export function TableRow({ selected, className, ...props }: TableRowProps) {
  return (
    <tr
      data-selected={selected || undefined}
      className={classNames(
        "group transition-colors hover:bg-surface-hover",
        "has-[a:focus-visible,button:focus-visible]:bg-surface-hover",
        "data-selected:bg-accent-soft data-selected:hover:bg-accent-soft",
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: ComponentProps<"td">) {
  return (
    <td
      className={classNames(
        "h-10 border-b border-line-subtle px-3 first:pl-4 last:pr-4 group-last:border-b-0",
        className,
      )}
      {...props}
    />
  );
}
