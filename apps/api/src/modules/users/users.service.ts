import type { User } from "@support-desk/shared";
import type { RequestContext } from "../../request-context.ts";
import { findAllUsers } from "./users.repository.ts";

/** Everyone in the workspace: the people an admin can add to a project. */
export function listTeammates(context: RequestContext): User[] {
  return findAllUsers(context.database);
}
