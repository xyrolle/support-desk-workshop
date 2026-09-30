import type { ReactNode } from "react";

type PropertyRowProps = {
  label: string;
  children: ReactNode;
};

/** A label and its value or control, in the ticket's side panel. */
export function PropertyRow({ label, children }: PropertyRowProps) {
  return (
    <div className="group/field flex min-h-8 items-center gap-2">
      <dt className="w-24 shrink-0 pl-2 text-ink-subtle">{label}</dt>
      <dd className="min-w-0 flex-1">{children}</dd>
    </div>
  );
}
