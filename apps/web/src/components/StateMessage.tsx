import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { classNames } from "../lib/class-names.ts";

export type StateContent = {
  title: string;
  description: string;
  action?: ReactNode;
};

type Tone = "neutral" | "danger";

type StateMessageProps = StateContent & {
  icon: LucideIcon;
  tone: Tone;
  role?: "alert";
};

const toneClasses: Record<Tone, string> = {
  neutral: "bg-surface-muted text-ink-muted",
  danger: "bg-rose-50 text-rose-600 dark:bg-rose-400/10 dark:text-rose-300",
};

/** The shared layout behind EmptyState and ErrorState. */
export function StateMessage({
  icon: Icon,
  tone,
  role,
  title,
  description,
  action,
}: StateMessageProps) {
  return (
    <div
      role={role}
      className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center"
    >
      <div
        className={classNames(
          "flex size-11 items-center justify-center rounded-xl",
          toneClasses[tone],
        )}
      >
        <Icon aria-hidden="true" className="size-5" />
      </div>
      <h2 className="mt-4 text-base font-semibold text-ink">{title}</h2>
      <p className="mt-1.5 max-w-sm text-pretty text-ink-muted">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
