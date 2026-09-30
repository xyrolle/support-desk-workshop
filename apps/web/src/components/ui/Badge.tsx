import type { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  /** A glyph or a coloured dot before the text. */
  icon?: ReactNode;
};

/** A short, quiet chip, such as a ticket label or a count. For status, use StatusBadge. */
export function Badge({ children, icon }: BadgeProps) {
  return (
    <span className="inline-flex h-5 items-center gap-1.5 rounded-md bg-surface-muted px-1.5 align-middle text-xs font-medium whitespace-nowrap text-ink-muted">
      {icon}
      {children}
    </span>
  );
}
