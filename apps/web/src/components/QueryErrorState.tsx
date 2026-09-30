import { Lock, type LucideIcon } from "lucide-react";
import { Link } from "react-router";
import { isForbiddenError, isNotFoundError } from "../api/client.ts";
import { type Breadcrumb, Breadcrumbs } from "./Breadcrumbs.tsx";
import { TopBar } from "./TopBar.tsx";
import { Button, buttonClassName } from "./ui/Button.tsx";
import { EmptyState } from "./ui/EmptyState.tsx";
import { ErrorState } from "./ui/ErrorState.tsx";

type QueryErrorStateProps = {
  error: Error;
  /** Where the user tried to go, for the top bar. */
  crumbs: Breadcrumb[];
  /** What failed to load, for the generic error: "This ticket". */
  subject: string;
  /** Wording for a 404: the thing is missing, or hidden from this user. */
  notFound: { title: string; description: string; icon: LucideIcon };
  onRetry: () => void;
};

/** One place that turns a failed request into the right screen: 404, 403 or a retry. */
export function QueryErrorState({ crumbs, ...content }: QueryErrorStateProps) {
  return (
    <>
      <TopBar>
        <Breadcrumbs items={crumbs} />
      </TopBar>
      <ErrorContent {...content} />
    </>
  );
}

function ErrorContent({ error, subject, notFound, onRetry }: Omit<QueryErrorStateProps, "crumbs">) {
  if (isNotFoundError(error)) {
    return <EmptyState {...notFound} action={<BackToMyTickets />} />;
  }

  if (isForbiddenError(error)) {
    return (
      <EmptyState
        icon={Lock}
        title="You don't have access"
        description={error.message}
        action={<BackToMyTickets />}
      />
    );
  }

  return (
    <ErrorState
      title={`${subject} could not be loaded`}
      description={error.message}
      action={<Button onClick={onRetry}>Try again</Button>}
    />
  );
}

function BackToMyTickets() {
  return (
    <Link to="/my-tickets" className={buttonClassName()}>
      Back to My tickets
    </Link>
  );
}
