import type { User } from "@support-desk/shared";
import { Avatar } from "./Avatar.tsx";

type AvatarStackProps = {
  users: User[];
  /** How many avatars to draw before summing up the rest as "+N". */
  max?: number;
};

const listFormat = new Intl.ListFormat("en", { type: "conjunction" });

/** Overlapping avatars for a group of people, named for screen readers. */
export function AvatarStack({ users, max = 3 }: AvatarStackProps) {
  const shownUsers = users.slice(0, max);
  const hiddenCount = users.length - shownUsers.length;

  return (
    <span
      role="img"
      aria-label={listFormat.format(users.map((user) => user.name))}
      className="flex items-center -space-x-0.5"
    >
      {shownUsers.map((user) => (
        <Avatar key={user.id} user={user} className="ring-2 ring-canvas" />
      ))}
      {hiddenCount > 0 && (
        <span className="inline-flex size-5 items-center justify-center rounded-full bg-surface-muted text-[9px] font-semibold text-ink-muted ring-2 ring-canvas">
          +{hiddenCount}
        </span>
      )}
    </span>
  );
}
