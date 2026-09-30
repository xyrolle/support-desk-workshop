import type { ReactNode } from "react";
import { Link } from "react-router";
import { classNames } from "../lib/class-names.ts";

type SidebarLinkProps = {
  to: string;
  /** Whether this is the page the user is on (or a page inside it). */
  active: boolean;
  icon: ReactNode;
  /** Quiet text on the right, such as a count or the user's role. */
  trailing?: ReactNode;
  /** A link that belongs to the one above it, such as a project's settings. */
  nested?: boolean;
  children: ReactNode;
};

export function SidebarLink({ to, active, icon, trailing, nested, children }: SidebarLinkProps) {
  return (
    <Link
      to={to}
      aria-current={active ? "page" : undefined}
      className={classNames(
        "flex h-7 items-center gap-2 rounded-md px-2 font-medium transition-colors",
        "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent",
        nested && "pl-8",
        active
          ? "bg-surface-muted text-ink"
          : "text-ink-muted hover:bg-surface-muted/60 hover:text-ink",
      )}
    >
      {icon}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {trailing && (
        <span className="shrink-0 text-xs text-ink-subtle tabular-nums">{trailing}</span>
      )}
    </Link>
  );
}
