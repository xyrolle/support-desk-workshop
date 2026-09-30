import type { ComponentProps } from "react";
import { classNames } from "../../lib/class-names.ts";

/** Multi-line text, borderless: put it inside a bordered box such as a composer. */
export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={classNames(
        "block w-full resize-none bg-transparent text-base leading-relaxed text-ink outline-none",
        "placeholder:text-ink-subtle disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    />
  );
}
