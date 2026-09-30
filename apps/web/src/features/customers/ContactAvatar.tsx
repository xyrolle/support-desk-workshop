import type { Contact } from "@support-desk/shared";
import { classNames } from "../../lib/class-names.ts";

type ContactAvatarProps = {
  contact: Pick<Contact, "name">;
  size?: "sm" | "md";
};

/** A customer's initials on a neutral circle, so they never look like a teammate. */
export function ContactAvatar({ contact, size = "sm" }: ContactAvatarProps) {
  const initials = contact.name
    .split(" ")
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("");

  return (
    <span
      aria-hidden="true"
      className={classNames(
        "inline-flex shrink-0 items-center justify-center rounded-full border border-line bg-canvas font-semibold tracking-tight text-ink-muted",
        size === "sm" ? "size-5 text-[9px]" : "size-7 text-[11px]",
      )}
    >
      {initials}
    </span>
  );
}
