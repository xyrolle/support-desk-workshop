import type { ComponentProps } from "react";
import { classNames } from "../../lib/class-names.ts";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "icon";

type ButtonStyle = {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary/90",
  secondary: "border border-line bg-canvas text-ink hover:bg-surface-hover",
  ghost: "text-ink-muted hover:bg-surface-hover hover:text-ink",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-7 gap-1.5 px-2.5",
  md: "h-8 gap-1.5 px-3",
  icon: "size-7",
};

/** Also used to style links that look like buttons. */
export function buttonClassName({ variant = "secondary", size = "md" }: ButtonStyle = {}) {
  return classNames(
    "inline-flex shrink-0 items-center justify-center rounded-md font-medium whitespace-nowrap",
    "transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
    "disabled:pointer-events-none disabled:opacity-50",
    variantClasses[variant],
    sizeClasses[size],
  );
}

type ButtonProps = ComponentProps<"button"> & ButtonStyle;

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={classNames(buttonClassName({ variant, size }), className)}
      {...props}
    />
  );
}
