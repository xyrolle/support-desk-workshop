import type { ReactNode } from "react";
import { NavLink } from "react-router";
import { classNames } from "../lib/class-names.ts";

type SidebarLinkProps = {
  to: string;
  icon: ReactNode;
  children: ReactNode;
};

export function SidebarLink({ to, icon, children }: SidebarLinkProps) {
  return (
    <NavLink to={to} className={sidebarLinkClassName}>
      {icon}
      <span className="truncate">{children}</span>
    </NavLink>
  );
}

function sidebarLinkClassName({ isActive }: { isActive: boolean }): string {
  return classNames(
    "flex h-7 items-center gap-2 rounded-md px-2 font-medium transition-colors",
    "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent",
    isActive
      ? "bg-surface-muted text-ink"
      : "text-ink-muted hover:bg-surface-muted/60 hover:text-ink",
  );
}
