import type { Project, TicketDetail } from "@support-desk/shared";
import { useActivity, useComments } from "../../api/queries.ts";
import { Button } from "../../components/ui/Button.tsx";
import { ErrorState } from "../../components/ui/ErrorState.tsx";
import { Skeleton } from "../../components/ui/Skeleton.tsx";
import { ContactAvatar } from "../customers/ContactAvatar.tsx";
import { CommentItem, MessageCard } from "./CommentItem.tsx";
import { EventItem } from "./EventItem.tsx";
import { ReplyComposer } from "./ReplyComposer.tsx";
import { buildTimeline } from "./timeline.ts";

type TicketConversationProps = {
  project: Project;
  ticket: TicketDetail;
};

/** The customer's first message, then every reply, note and change in order, then the composer. */
export function TicketConversation({ project, ticket }: TicketConversationProps) {
  const commentsQuery = useComments(project.id, ticket.id);
  const activityQuery = useActivity(project.id, ticket.id);

  return (
    <section aria-label="Conversation and activity" className="space-y-4">
      {/* A thin rail behind the avatars ties the conversation and the changes together. */}
      <ol className="relative space-y-2 before:absolute before:inset-y-4 before:left-[25px] before:w-px before:bg-line">
        <MessageCard
          avatar={<ContactAvatar contact={ticket.requester} />}
          author={ticket.requester.name}
          tag={<span className="text-ink-subtle">opened the ticket</span>}
          createdAt={ticket.createdAt}
          body={ticket.description}
        />
        <TimelineEntries commentsQuery={commentsQuery} activityQuery={activityQuery} />
      </ol>
      <ReplyComposer project={project} ticket={ticket} />
    </section>
  );
}

type TimelineEntriesProps = {
  commentsQuery: ReturnType<typeof useComments>;
  activityQuery: ReturnType<typeof useActivity>;
};

function TimelineEntries({ commentsQuery, activityQuery }: TimelineEntriesProps) {
  if (commentsQuery.isPending || activityQuery.isPending) {
    return (
      <li aria-label="Loading the conversation" className="space-y-3">
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
      </li>
    );
  }

  if (commentsQuery.isError || activityQuery.isError) {
    const error = commentsQuery.error ?? activityQuery.error;
    return (
      <li>
        <ErrorState
          title="The conversation could not be loaded"
          description={error?.message ?? "Please try again."}
          action={
            <Button
              onClick={() => {
                commentsQuery.refetch();
                activityQuery.refetch();
              }}
            >
              Try again
            </Button>
          }
        />
      </li>
    );
  }

  return buildTimeline(commentsQuery.data, activityQuery.data).map((entry) =>
    entry.kind === "comment" ? (
      <CommentItem key={`comment-${entry.comment.id}`} comment={entry.comment} />
    ) : (
      <EventItem key={`event-${entry.event.id}`} event={entry.event} />
    ),
  );
}
