import type { Project, ProjectMember, ProjectRole, User } from "@support-desk/shared";
import { roleNames } from "@support-desk/shared";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { useAddMember } from "../../api/mutations.ts";
import { useUsers } from "../../api/queries.ts";
import { PermissionHint } from "../../components/PermissionHint.tsx";
import { Avatar } from "../../components/ui/Avatar.tsx";
import { Button } from "../../components/ui/Button.tsx";
import {
  Combobox,
  ComboboxItem,
  ComboboxPopup,
  ComboboxTrigger,
} from "../../components/ui/Combobox.tsx";
import { Dialog, DialogClose, DialogPopup, DialogTrigger } from "../../components/ui/Dialog.tsx";
import { controlClassName } from "../../components/ui/popup-styles.ts";
import { useToast } from "../../components/ui/Toast.tsx";
import { classNames } from "../../lib/class-names.ts";
import { RoleSelect } from "./RoleSelect.tsx";

type AddMemberDialogProps = {
  project: Project;
  members: ProjectMember[];
  blockedReason: string | null;
};

/** Adds a teammate from the workspace to the project, with a role (agent by default). */
export function AddMemberDialog({ project, members, blockedReason }: AddMemberDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [teammate, setTeammate] = useState<User | null>(null);
  const [role, setRole] = useState<ProjectRole>("agent");
  const { data: users = [] } = useUsers();
  const addMember = useAddMember(project.id);
  const toast = useToast();
  const candidates = users.filter((user) => !members.some((member) => member.id === user.id));

  function reset() {
    setTeammate(null);
    setRole("agent");
  }

  function add() {
    if (!teammate) {
      return;
    }
    addMember.mutate(
      { userId: teammate.id, role },
      {
        onSuccess: () => {
          toast.add({ title: `${teammate.name} joined ${project.name} as ${roleNames[role]}` });
          setIsOpen(false);
          reset();
        },
        onError: (error) =>
          toast.add({ title: `${teammate.name} was not added`, description: error.message }),
      },
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <PermissionHint reason={blockedReason}>
        <DialogTrigger render={<Button variant="primary" disabled={blockedReason !== null} />}>
          <UserPlus aria-hidden="true" className="size-3.5" />
          Add member
        </DialogTrigger>
      </PermissionHint>
      <DialogPopup
        title={`Add a member to ${project.name}`}
        description="They see the project's tickets right away. Agents and admins can also be assigned."
        actions={
          <>
            <DialogClose render={<Button />}>Cancel</DialogClose>
            <Button
              variant="primary"
              onClick={add}
              disabled={teammate === null || addMember.isPending}
            >
              Add member
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Combobox
            items={candidates}
            value={teammate}
            onValueChange={(user: User | null) => setTeammate(user)}
            itemToStringLabel={(user: User) => user.name}
            isItemEqualToValue={(item: User, value: User) => item.id === value.id}
          >
            <ComboboxTrigger
              aria-label="Teammate"
              className={classNames(controlClassName, "w-full gap-2 px-2.5")}
            >
              {teammate ? (
                <>
                  <Avatar user={teammate} />
                  {teammate.name}
                </>
              ) : (
                <span className="text-ink-subtle">Choose a teammate…</span>
              )}
            </ComboboxTrigger>
            <ComboboxPopup placeholder="Search teammates…" emptyText="Everyone is already here.">
              {(user: User) => (
                <ComboboxItem key={user.id} value={user}>
                  <Avatar user={user} />
                  {user.name}
                </ComboboxItem>
              )}
            </ComboboxPopup>
          </Combobox>
          <RoleSelect
            role={role}
            memberName={teammate?.name ?? "the new member"}
            blockedReason={null}
            onChange={setRole}
            appearance="field"
          />
        </div>
      </DialogPopup>
    </Dialog>
  );
}
