import type { AvatarColor, User } from "@support-desk/shared";
import { classNames } from "../../lib/class-names.ts";

type AvatarSize = "sm" | "md";

const sizeClasses: Record<AvatarSize, string> = {
  sm: "size-5 text-[9px]",
  md: "size-7 text-[11px]",
};

const colorClasses: Record<AvatarColor, string> = {
  amber: "bg-amber-100 text-amber-800 dark:bg-amber-400/20 dark:text-amber-200",
  emerald: "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/20 dark:text-emerald-200",
  indigo: "bg-indigo-100 text-indigo-800 dark:bg-indigo-400/20 dark:text-indigo-200",
  rose: "bg-rose-100 text-rose-800 dark:bg-rose-400/20 dark:text-rose-200",
  sky: "bg-sky-100 text-sky-800 dark:bg-sky-400/20 dark:text-sky-200",
  teal: "bg-teal-100 text-teal-800 dark:bg-teal-400/20 dark:text-teal-200",
  violet: "bg-violet-100 text-violet-800 dark:bg-violet-400/20 dark:text-violet-200",
};

type AvatarProps = {
  user: User;
  size?: AvatarSize;
  className?: string;
};

/** Initials in a coloured circle. Decorative: always show the name next to it. */
export function Avatar({ user, size = "sm", className }: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={classNames(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold tracking-tight",
        sizeClasses[size],
        colorClasses[user.avatarColor],
        className,
      )}
    >
      {user.initials}
    </span>
  );
}
