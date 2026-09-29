import { Bell, ChevronDown, Link2, Trash2, UserRound } from "lucide-react";
import { useState } from "react";
import { Button } from "../../components/ui/Button.tsx";
import {
  Menu,
  MenuCheckboxItem,
  MenuItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "../../components/ui/Menu.tsx";

const iconClassName = "size-4 shrink-0 text-ink-subtle";

/** Actions with shortcuts, a toggle that keeps the menu open, and a destructive item. */
export function ActionsMenuDemo() {
  const [isSubscribed, setIsSubscribed] = useState(true);

  return (
    <Menu>
      <MenuTrigger render={<Button />}>
        Actions
        <ChevronDown aria-hidden="true" className="-mr-1 size-3.5 text-ink-subtle" />
      </MenuTrigger>
      <MenuPopup>
        <MenuItem icon={<UserRound aria-hidden="true" className={iconClassName} />} shortcut="A">
          Assign to…
        </MenuItem>
        <MenuItem icon={<Link2 aria-hidden="true" className={iconClassName} />} shortcut="⌘ L">
          Copy link
        </MenuItem>
        <MenuSeparator />
        <MenuCheckboxItem
          icon={<Bell aria-hidden="true" className={iconClassName} />}
          checked={isSubscribed}
          onCheckedChange={setIsSubscribed}
        >
          Notify me of replies
        </MenuCheckboxItem>
        <MenuSeparator />
        <MenuItem
          icon={<Trash2 aria-hidden="true" className="size-4 shrink-0" />}
          className="text-danger data-highlighted:bg-danger-soft"
        >
          Delete ticket
        </MenuItem>
      </MenuPopup>
    </Menu>
  );
}
