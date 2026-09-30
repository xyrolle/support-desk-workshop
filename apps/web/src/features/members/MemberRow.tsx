import type { ProjectMember, ProjectRole } from "@support-desk/shared";
import { Ellipsis, UserMinus } from "lucide-react";
import { PermissionHint } from "../../components/PermissionHint.tsx";
import { Avatar } from "../../components/ui/Avatar.tsx";
import { Badge } from "../../components/ui/Badge.tsx";
import { Button } from "../../components/ui/Button.tsx";
import { Menu, MenuItem, MenuPopup, MenuTrigger } from "../../components/ui/Menu.tsx";
import { TableCell, TableRow } from "../../components/ui/Table.tsx";
import { RoleSelect } from "./RoleSelect.tsx";

type MemberRowProps = {
  member: ProjectMember;
  isCurrentUser: boolean;
  blockedReason: string | null;
  onRoleChange: (role: ProjectRole) => void;
  onRemove: () => void;
};

export function MemberRow({
  member,
  isCurrentUser,
  blockedReason,
  onRoleChange,
  onRemove,
}: MemberRowProps) {
  return (
    <TableRow>
      <TableCell className="h-14">
        <span className="flex min-w-0 items-center gap-3">
          <Avatar user={member} size="md" />
          <span className="min-w-0">
            <span className="flex items-center gap-2">
              <span className="truncate font-medium">{member.name}</span>
              {isCurrentUser && <Badge>You</Badge>}
            </span>
            <span className="block truncate text-ink-subtle">{member.email}</span>
          </span>
        </span>
      </TableCell>
      <TableCell>
        <RoleSelect
          role={member.role}
          memberName={member.name}
          blockedReason={blockedReason}
          onChange={onRoleChange}
          className="-ml-2"
        />
      </TableCell>
      <TableCell className="text-right">
        <PermissionHint reason={blockedReason}>
          <Menu>
            <MenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Actions for ${member.name}`}
                  disabled={blockedReason !== null}
                />
              }
            >
              <Ellipsis aria-hidden="true" className="size-4" />
            </MenuTrigger>
            <MenuPopup>
              <MenuItem
                icon={<UserMinus aria-hidden="true" className="size-3.5" />}
                onClick={onRemove}
              >
                Remove from project
              </MenuItem>
            </MenuPopup>
          </Menu>
        </PermissionHint>
      </TableCell>
    </TableRow>
  );
}
