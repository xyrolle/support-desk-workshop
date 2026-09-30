import type { TicketChanges } from "@support-desk/shared";
import { useUpdateTicket } from "../../api/mutations.ts";
import { useToast } from "../../components/ui/Toast.tsx";

/** Saves one inline edit; a refused change (a 403, an invalid assignee) becomes a toast. */
export function useTicketEditor(projectId: string, ticketId: string) {
  const mutation = useUpdateTicket(projectId, ticketId);
  const toast = useToast();

  function update(changes: TicketChanges) {
    mutation.mutate(changes, {
      onError: (error) =>
        toast.add({ title: "The ticket was not changed", description: error.message }),
    });
  }

  return { update, isSaving: mutation.isPending };
}
