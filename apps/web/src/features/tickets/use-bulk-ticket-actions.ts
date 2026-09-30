import type {
  BulkTicketUpdate,
  BulkTicketUpdateResult,
  ProjectTicketListQuery,
  TicketChanges,
  TicketState,
} from "@support-desk/shared";
import { useBulkUpdateTickets } from "../../api/mutations.ts";
import { useToast } from "../../components/ui/Toast.tsx";
import { bulkSelectionKey, useTicketSelection } from "./use-ticket-selection.ts";

/** How long the undo toast stays. Long enough to notice a wrong selection. */
const UNDO_TIMEOUT_MS = 8_000;

/**
 * Selection on the project ticket list, and applying one change to all of it.
 * The toast's Undo sends back the state from before the change.
 */
export function useBulkTicketActions(
  projectId: string,
  query: ProjectTicketListQuery,
  ticketIds: readonly string[],
) {
  const selection = useTicketSelection(ticketIds, bulkSelectionKey(projectId, query));
  const bulkUpdate = useBulkUpdateTickets(projectId, query);
  const toast = useToast();

  function apply(changes: TicketChanges) {
    bulkUpdate.mutate(
      { updates: selection.selectedIds.map((ticketId) => ({ ticketId, changes })) },
      {
        onSuccess: (result) => toast.add(updatedToast(result, bulkUpdate.mutate)),
        onError: (error) => {
          toast.add({ title: "The tickets were not changed", description: error.message });
        },
      },
    );
  }

  return { ...selection, apply };
}

function updatedToast(result: BulkTicketUpdateResult, mutate: (body: BulkTicketUpdate) => void) {
  const count = result.tickets.length;
  return {
    title: `Updated ${count} ${count === 1 ? "ticket" : "tickets"}`,
    timeout: UNDO_TIMEOUT_MS,
    actionProps: {
      children: "Undo",
      onClick: () => mutate(undoUpdate(result.previous)),
    },
  };
}

function undoUpdate(previous: TicketState[]): BulkTicketUpdate {
  return {
    updates: previous.map((state) => ({
      ticketId: state.ticketId,
      changes: {
        status: state.status,
        priority: state.priority,
        assigneeId: state.assigneeId,
        labelIds: state.labelIds,
      },
    })),
  };
}
