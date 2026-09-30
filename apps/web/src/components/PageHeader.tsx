import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
  /** Buttons for the whole page, on the right. */
  actions?: ReactNode;
};

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex shrink-0 items-end gap-6 px-8 pt-7 pb-5">
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 truncate text-ink-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
