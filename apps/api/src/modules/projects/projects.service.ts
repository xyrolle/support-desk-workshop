import type { Project } from "@support-desk/shared";
import { authorize, listVisibleProjects } from "../../auth/policy.ts";
import type { RequestContext } from "../../request-context.ts";

export function listProjects(context: RequestContext): Project[] {
  return listVisibleProjects(context);
}

export function getProject(context: RequestContext, projectId: string): Project {
  return authorize(context, projectId);
}
