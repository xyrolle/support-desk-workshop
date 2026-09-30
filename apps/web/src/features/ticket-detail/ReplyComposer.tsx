import type { NewComment, Project, TicketDetail } from "@support-desk/shared";
import { Lock, Send } from "lucide-react";
import { type FormEvent, type ReactNode, useId, useState } from "react";
import { useAddComment } from "../../api/mutations.ts";
import { PermissionHint } from "../../components/PermissionHint.tsx";
import { Button } from "../../components/ui/Button.tsx";
import { Textarea } from "../../components/ui/Textarea.tsx";
import { useToast } from "../../components/ui/Toast.tsx";
import { classNames } from "../../lib/class-names.ts";
import { editTicketsBlockedReason } from "./edit-permission.ts";

type CommentKind = NewComment["kind"];

type ReplyComposerProps = {
  project: Project;
  ticket: TicketDetail;
};

/** Where a teammate answers the customer, or leaves a note only the team will see. */
export function ReplyComposer({ project, ticket }: ReplyComposerProps) {
  const [kind, setKind] = useState<CommentKind>("public_reply");
  const [body, setBody] = useState("");
  const addComment = useAddComment(project.id, ticket.id);
  const toast = useToast();
  const textareaId = useId();
  const blockedReason = editTicketsBlockedReason(project);
  const requesterFirstName = ticket.requester.name.split(" ")[0];
  const isNote = kind === "internal_note";

  function submit(event: FormEvent) {
    event.preventDefault();
    addComment.mutate(
      { kind, body },
      {
        onSuccess: () => setBody(""),
        onError: (error) =>
          toast.add({ title: "Your message was not saved", description: error.message }),
      },
    );
  }

  return (
    <form
      onSubmit={submit}
      className={classNames(
        "rounded-lg border transition-colors",
        isNote ? "border-note/30 bg-note-soft" : "border-line bg-canvas",
      )}
    >
      <fieldset className="flex min-w-0 gap-1 px-2 pt-2">
        <legend className="sr-only">Kind of message</legend>
        <KindButton selected={!isNote} onSelect={() => setKind("public_reply")}>
          Reply to {requesterFirstName}
        </KindButton>
        <KindButton selected={isNote} onSelect={() => setKind("internal_note")}>
          <Lock aria-hidden="true" className="size-3" />
          Internal note
        </KindButton>
      </fieldset>

      <label htmlFor={textareaId} className="sr-only">
        {isNote ? "Internal note" : `Reply to ${ticket.requester.name}`}
      </label>
      <Textarea
        id={textareaId}
        rows={4}
        value={body}
        onChange={(event) => setBody(event.target.value)}
        disabled={blockedReason !== null}
        placeholder={
          isNote ? "Add a note for the team…" : `Write a reply to ${requesterFirstName}…`
        }
        className="px-3.5 py-2.5"
      />

      <div className="flex items-center gap-3 px-3.5 pb-3">
        <p className="min-w-0 flex-1 text-xs text-ink-subtle">
          {blockedReason ??
            (isNote
              ? "Only the team sees internal notes."
              : `${ticket.requester.name} gets this by email. Markdown works.`)}
        </p>
        <PermissionHint reason={blockedReason}>
          <Button
            type="submit"
            variant="primary"
            disabled={blockedReason !== null || body.trim() === "" || addComment.isPending}
          >
            <Send aria-hidden="true" className="size-3.5" />
            {isNote ? "Add note" : "Send reply"}
          </Button>
        </PermissionHint>
      </div>
    </form>
  );
}

type KindButtonProps = {
  selected: boolean;
  onSelect: () => void;
  children: ReactNode;
};

function KindButton({ selected, onSelect, children }: KindButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={classNames(
        "flex h-7 items-center gap-1.5 rounded-md px-2.5 font-medium transition-colors",
        "focus-visible:outline-2 focus-visible:outline-accent",
        selected ? "bg-surface-muted text-ink" : "text-ink-muted hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
