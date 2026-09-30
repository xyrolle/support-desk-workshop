import { type ProjectRole, projectRoles, roleNames } from "@support-desk/shared";
import { PermissionHint } from "../../components/PermissionHint.tsx";
import { Select, SelectItem, SelectPopup, SelectTrigger } from "../../components/ui/Select.tsx";

export const roleDescriptions: Record<ProjectRole, string> = {
  viewer: "Reads tickets and conversations",
  agent: "Also changes and answers tickets",
  admin: "Also manages members",
};

type RoleSelectProps = {
  role: ProjectRole;
  /** Who the role belongs to, for the label read to screen readers. */
  memberName: string;
  blockedReason: string | null;
  onChange: (role: ProjectRole) => void;
  appearance?: "field" | "inline";
  className?: string;
};

export function RoleSelect({
  role,
  memberName,
  blockedReason,
  onChange,
  appearance = "inline",
  className,
}: RoleSelectProps) {
  return (
    <PermissionHint reason={blockedReason}>
      <Select
        value={role}
        onValueChange={(value) => value && onChange(value)}
        disabled={blockedReason !== null}
      >
        <SelectTrigger
          appearance={appearance}
          aria-label={`Role of ${memberName}: ${roleNames[role]}`}
          className={className}
        >
          {roleNames[role]}
        </SelectTrigger>
        <SelectPopup>
          {projectRoles.map((option) => (
            <SelectItem key={option} value={option}>
              <span className="flex flex-col py-1">
                <span className="font-medium">{roleNames[option]}</span>
                <span className="text-xs text-ink-subtle">{roleDescriptions[option]}</span>
              </span>
            </SelectItem>
          ))}
        </SelectPopup>
      </Select>
    </PermissionHint>
  );
}
