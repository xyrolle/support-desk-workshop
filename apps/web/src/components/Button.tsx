import type { ComponentProps } from "react";
import { classNames } from "../lib/class-names.ts";

/** Also used to style links that look like buttons. */
export const buttonClassName = classNames(
  "inline-flex h-8 items-center justify-center gap-1.5 rounded-md px-3",
  "border border-line bg-canvas text-sm font-medium text-ink shadow-xs",
  "transition-colors hover:bg-surface-hover",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
  "disabled:pointer-events-none disabled:opacity-50",
);

export function Button({ className, ...props }: ComponentProps<"button">) {
  return <button type="button" className={classNames(buttonClassName, className)} {...props} />;
}
