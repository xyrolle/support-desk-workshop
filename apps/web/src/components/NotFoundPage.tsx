import { Compass } from "lucide-react";
import { Link } from "react-router";
import { buttonClassName } from "./Button.tsx";
import { EmptyState } from "./EmptyState.tsx";

export function NotFoundPage() {
  return (
    <EmptyState
      icon={Compass}
      title="Page not found"
      description="The link may be broken, or the page may have moved."
      action={
        <Link to="/" className={buttonClassName}>
          Back to your projects
        </Link>
      }
    />
  );
}
