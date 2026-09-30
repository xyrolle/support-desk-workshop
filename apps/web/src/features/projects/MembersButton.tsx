import type { Project } from "@support-desk/shared";
import { Link } from "react-router";
import { useMembers } from "../../api/queries.ts";
import { AvatarStack } from "../../components/ui/AvatarStack.tsx";
import { buttonClassName } from "../../components/ui/Button.tsx";

/** Who works on the project, as faces; opens the members page (editable by admins). */
export function MembersButton({ project }: { project: Project }) {
  const { data: members } = useMembers(project.id);

  return (
    <Link to={`/projects/${project.id}/settings`} className={buttonClassName()}>
      {members && <AvatarStack users={members} max={4} />}
      Members
    </Link>
  );
}
