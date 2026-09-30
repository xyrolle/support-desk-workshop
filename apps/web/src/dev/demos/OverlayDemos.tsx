import { Button } from "../../components/ui/Button.tsx";
import { Dialog, DialogClose, DialogPopup, DialogTrigger } from "../../components/ui/Dialog.tsx";
import { Popover, PopoverPopup, PopoverTrigger } from "../../components/ui/Popover.tsx";
import { StatusIcon } from "../../components/ui/StatusIcon.tsx";
import { useToast } from "../../components/ui/Toast.tsx";

/** Popover, dialog and toast, wired the way a "close ticket" flow would use them. */
export function OverlayDemos() {
  const toast = useToast();

  function closeTicket() {
    const toastId = toast.add({
      title: "CHK-104 closed",
      description: "Replies from the customer will reopen it.",
      actionProps: {
        children: "Undo",
        onClick: () => toast.close(toastId),
      },
    });
  }

  return (
    <>
      <Popover>
        <PopoverTrigger render={<Button />}>Why is it blocked?</PopoverTrigger>
        <PopoverPopup title="Waiting on the payment provider">
          <p className="text-ink-muted">
            Adyen confirmed the 3-D Secure timeout and plans a fix for next week.
          </p>
          <p className="mt-3 flex items-center gap-2 text-xs text-ink-subtle">
            <StatusIcon status="blocked" />
            Blocked for 2 days
          </p>
        </PopoverPopup>
      </Popover>

      <Dialog>
        <DialogTrigger render={<Button />}>Close ticket…</DialogTrigger>
        <DialogPopup
          title="Close CHK-104?"
          description="The customer is told the issue is fixed. A reply from them reopens the ticket."
          actions={
            <>
              <DialogClose render={<Button />}>Cancel</DialogClose>
              <DialogClose render={<Button variant="primary" />} onClick={closeTicket}>
                Close ticket
              </DialogClose>
            </>
          }
        />
      </Dialog>

      <Button onClick={closeTicket}>Show a toast with Undo</Button>
    </>
  );
}
