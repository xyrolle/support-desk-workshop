import type { NewSavedView, SavedView } from "@support-desk/shared";
import { authorize } from "../../auth/policy.ts";
import { ConflictError, ValidationError } from "../../http/errors.ts";
import type { RequestContext } from "../../request-context.ts";
import { findForeignLabelIds } from "../labels/labels.repository.ts";
import { findSavedViewByName, findSavedViews, insertSavedView } from "./views.repository.ts";

/** The current user's private views in the project, by name. */
export function listViews(context: RequestContext, projectId: string): SavedView[] {
  authorize(context, projectId);
  return findSavedViews(context.database, projectId, context.user.id);
}

/** Saves a private view. Every member can, because nobody else can see it. */
export function createView(
  context: RequestContext,
  projectId: string,
  view: NewSavedView,
): SavedView {
  const { database, user, clock } = context;
  authorize(context, projectId);
  requireViewLabels(database, projectId, view.filters.label);
  if (findSavedViewByName(database, projectId, user.id, view.name)) {
    throw new ConflictError(`You already have a view called "${view.name}".`);
  }

  return insertSavedView(database, {
    projectId,
    ownerId: user.id,
    name: view.name,
    filters: JSON.stringify(view.filters),
    createdAt: clock.now().toISOString(),
  });
}

function requireViewLabels(
  database: RequestContext["database"],
  projectId: string,
  labelIds: number[] | undefined,
) {
  if (!labelIds?.length) {
    return;
  }
  const [foreignLabelId] = findForeignLabelIds(database, projectId, labelIds);
  if (foreignLabelId !== undefined) {
    throw new ValidationError(`label: ${foreignLabelId} is not a label of this project.`);
  }
}
