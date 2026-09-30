import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { classNames } from "../../lib/class-names.ts";

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
  neutral: "border-line text-ink-subtle",
  danger: "border-danger/25 bg-danger-soft text-danger",
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
      className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center"
    >
      <div
        className={classNames(
          "flex size-10 items-center justify-center rounded-lg border",
          toneClasses[tone],
        )}
      >
        <Icon aria-hidden="true" className="size-[18px]" strokeWidth={1.75} />
      </div>
      <h2 className="mt-4 text-base font-semibold">{title}</h2>
      <p className="mt-1 max-w-sm text-pretty text-ink-muted">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
