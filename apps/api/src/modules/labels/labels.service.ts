import type { Label } from "@support-desk/shared";
import { authorize } from "../../auth/policy.ts";
import type { RequestContext } from "../../request-context.ts";
import { findProjectLabels } from "./labels.repository.ts";

export function listLabels(context: RequestContext, projectId: string): Label[] {
  authorize(context, projectId);
  return findProjectLabels(context.database, projectId);
}
