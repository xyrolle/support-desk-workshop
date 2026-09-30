import type { Comment } from "@support-desk/shared";
import { Lock } from "lucide-react";
import type { ReactNode } from "react";
import { Markdown } from "../../components/Markdown.tsx";
import { RelativeTime } from "../../components/RelativeTime.tsx";
import { Avatar } from "../../components/ui/Avatar.tsx";
import { Badge } from "../../components/ui/Badge.tsx";
import { classNames } from "../../lib/class-names.ts";
import { ContactAvatar } from "../customers/ContactAvatar.tsx";

/**
 * A message in the conversation. Customer messages, public replies and internal notes
 * look different on purpose: nobody should mistake a note for something the customer saw.
 */
export function CommentItem({ comment }: { comment: Comment }) {
  if (comment.kind === "customer_message") {
    return (
      <MessageCard
        avatar={<ContactAvatar contact={comment.author} />}
        author={comment.author.name}
        tag={<Badge>Customer</Badge>}
        createdAt={comment.createdAt}
        body={comment.body}
      />
    );
  }

  if (comment.kind === "internal_note") {
    return (
      <MessageCard
        avatar={<Avatar user={comment.author} />}
        author={comment.author.name}
        tag={<InternalNoteTag />}
        createdAt={comment.createdAt}
        body={comment.body}
        tone="note"
      />
    );
  }

  return (
    <MessageCard
      avatar={<Avatar user={comment.author} />}
      author={comment.author.name}
      tag={<span className="text-ink-subtle">replied</span>}
      createdAt={comment.createdAt}
      body={comment.body}
    />
  );
}

type MessageCardProps = {
  avatar: ReactNode;
  author: string;
  /** What kind of message it is, after the author's name. */
  tag: ReactNode;
  createdAt: string;
  body: string;
  tone?: "default" | "note";
};

export function MessageCard({
  avatar,
  author,
  tag,
  createdAt,
  body,
  tone = "default",
}: MessageCardProps) {
  return (
    <li
      className={classNames(
        "relative rounded-lg border px-4 py-3",
        tone === "note" ? "border-note/30 bg-note-soft" : "border-line bg-canvas",
      )}
    >
      <header className="flex items-center gap-2">
        {avatar}
        <span className="font-medium">{author}</span>
        {tag}
        <span className="ml-auto text-xs text-ink-subtle">
          <RelativeTime value={createdAt} />
        </span>
      </header>
      <div className="mt-2">
        <Markdown>{body}</Markdown>
      </div>
    </li>
  );
}

function InternalNoteTag() {
  return (
    <span className="inline-flex h-5 items-center gap-1 rounded-md bg-note/12 px-1.5 text-xs font-medium text-note">
      <Lock aria-hidden="true" className="size-3" />
      Internal note
    </span>
  );
}
