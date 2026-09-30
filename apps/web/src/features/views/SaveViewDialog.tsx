import type { TicketFilters } from "@support-desk/shared";
import { useState } from "react";
import { useCreateView } from "../../api/mutations.ts";
import { Button } from "../../components/ui/Button.tsx";
import { Dialog, DialogClose, DialogPopup, DialogTrigger } from "../../components/ui/Dialog.tsx";
import { Input } from "../../components/ui/Input.tsx";
import { useToast } from "../../components/ui/Toast.tsx";

type SaveViewDialogProps = {
  projectId: string;
  filters: TicketFilters;
};

/** Names the filters that are on the list right now. Only the owner will see the view. */
export function SaveViewDialog({ projectId, filters }: SaveViewDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const createView = useCreateView(projectId);
  const toast = useToast();
  const trimmed = name.trim();

  function save() {
    if (!trimmed) {
      return;
    }
    createView.mutate(
      { name: trimmed, filters },
      {
        onSuccess: (view) => {
          toast.add({ title: `Saved "${view.name}"` });
          setIsOpen(false);
          setName("");
        },
        onError: (error) => toast.add({ title: "View was not saved", description: error.message }),
      },
    );
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setName("");
        }
      }}
    >
      <DialogTrigger render={<Button variant="ghost" size="sm" />}>Save view</DialogTrigger>
      <DialogPopup
        title="Save view"
        description="Only you can see it. Opening it shows this project's tickets with these filters."
        actions={
          <>
            <DialogClose render={<Button />}>Cancel</DialogClose>
            <Button variant="primary" onClick={save} disabled={!trimmed || createView.isPending}>
              Save
            </Button>
          </>
        }
      >
        <Input
          aria-label="View name"
          value={name}
          placeholder="Urgent and unassigned"
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              save();
            }
          }}
        />
      </DialogPopup>
    </Dialog>
  );
}
