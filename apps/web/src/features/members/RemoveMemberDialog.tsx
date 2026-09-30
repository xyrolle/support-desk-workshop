import type { Project, ProjectMember } from "@support-desk/shared";
import { useRemoveMember } from "../../api/mutations.ts";
import { Button } from "../../components/ui/Button.tsx";
import { Dialog, DialogClose, DialogPopup } from "../../components/ui/Dialog.tsx";
import { useToast } from "../../components/ui/Toast.tsx";

type RemoveMemberDialogProps = {
  project: Project;
  member: ProjectMember | null;
  onClose: () => void;
};

/** Says what happens to the member's tickets before anything is removed. */
export function RemoveMemberDialog({ project, member, onClose }: RemoveMemberDialogProps) {
  const removeMember = useRemoveMember(project.id);
  const toast = useToast();

  function remove() {
    if (!member) {
      return;
    }
    removeMember.mutate(member.id, {
      onSuccess: () => {
        toast.add({
          title: `${member.name} left ${project.name}`,
          description: "Their unresolved tickets are unassigned now.",
        });
        onClose();
      },
      onError: (error) =>
        toast.add({ title: `${member.name} was not removed`, description: error.message }),
    });
  }

  return (
    <Dialog open={member !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogPopup
        title={`Remove ${member?.name ?? "this member"} from ${project.name}?`}
        description={`Their unresolved tickets in ${project.name} become unassigned, and each ticket's activity says so. Resolved tickets keep them as assignee.`}
        actions={
          <>
            <DialogClose render={<Button />}>Cancel</DialogClose>
            <Button variant="primary" onClick={remove} disabled={removeMember.isPending}>
              Remove
            </Button>
          </>
        }
      />
    </Dialog>
  );
}
