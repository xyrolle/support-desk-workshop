import { useCurrentUser } from "../../api/queries.ts";
import { Avatar } from "../../components/ui/Avatar.tsx";

export function CurrentUserCard() {
  const { data: currentUser } = useCurrentUser();

  if (!currentUser) {
    return null;
  }

  return (
    <div className="flex items-center gap-2.5 px-2 py-1.5">
      <Avatar user={currentUser} size="md" />
      <div className="min-w-0">
        <p className="truncate font-medium">{currentUser.name}</p>
        <p className="text-xs text-ink-subtle">Demo user</p>
      </div>
    </div>
  );
}
