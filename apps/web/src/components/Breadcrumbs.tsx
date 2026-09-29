import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { Link, type To } from "react-router";

export type Breadcrumb = {
  label: string;
  /** Where the crumb links to. Leave it out for the current page. */
  to?: To;
  icon?: ReactNode;
};

export function Breadcrumbs({ items }: { items: Breadcrumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="-ml-1.5 min-w-0">
      <ol className="flex items-center gap-0.5">
        {items.map((item, index) => (
          <li key={item.label} className="flex min-w-0 items-center gap-0.5">
            {index > 0 && (
              <ChevronRight aria-hidden="true" className="size-3.5 shrink-0 text-ink-subtle" />
            )}
            <BreadcrumbItem item={item} />
          </li>
        ))}
      </ol>
    </nav>
  );
}

function BreadcrumbItem({ item }: { item: Breadcrumb }) {
  const content = (
    <>
      {item.icon}
      <span className="truncate">{item.label}</span>
    </>
  );

  if (!item.to) {
    return (
      <span aria-current="page" className="flex h-7 min-w-0 items-center gap-2 px-1.5 font-medium">
        {content}
      </span>
    );
  }

  return (
    <Link
      to={item.to}
      className="flex h-7 min-w-0 items-center gap-2 rounded-md px-1.5 text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
    >
      {content}
    </Link>
  );
}
