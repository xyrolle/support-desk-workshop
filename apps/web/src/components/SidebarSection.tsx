import { type ReactNode, useId } from "react";

type SidebarSectionProps = {
  title: string;
  children: ReactNode;
};

/** A titled group of links in the sidebar. Each module of the app gets its own section. */
export function SidebarSection({ title, children }: SidebarSectionProps) {
  const titleId = useId();

  return (
    <nav aria-labelledby={titleId}>
      <h2 id={titleId} className="flex h-7 items-center px-2 text-xs font-medium text-ink-subtle">
        {title}
      </h2>
      {children}
    </nav>
  );
}
