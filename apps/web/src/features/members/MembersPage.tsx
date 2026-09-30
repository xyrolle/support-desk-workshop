import type { Project, ProjectMember, ProjectRole } from "@support-desk/shared";
import { projectRoles, roleNames } from "@support-desk/shared";
import { Eye, FolderX } from "lucide-react";
import { useState } from "react";
import { useChangeMemberRole } from "../../api/mutations.ts";
import { useCurrentUser, useMembers, useProject } from "../../api/queries.ts";
import { Panel } from "../../components/Panel.tsx";
import { QueryErrorState } from "../../components/QueryErrorState.tsx";
import { Button } from "../../components/ui/Button.tsx";
import { ErrorState } from "../../components/ui/ErrorState.tsx";
import { Skeleton } from "../../components/ui/Skeleton.tsx";
import { Table, TableHead, TableHeader } from "../../components/ui/Table.tsx";
import { useToast } from "../../components/ui/Toast.tsx";
import { ProjectHeader, ProjectHeaderSkeleton } from "../projects/ProjectHeader.tsx";
import { useProjectId } from "../projects/use-project-id.ts";
import { useProjectLabel } from "../projects/use-project-label.ts";
import { AddMemberDialog } from "./AddMemberDialog.tsx";
import { MemberRow } from "./MemberRow.tsx";
import { manageMembersBlockedReason } from "./member-permission.ts";
import { RemoveMemberDialog } from "./RemoveMemberDialog.tsx";
import { roleDescriptions } from "./RoleSelect.tsx";

/** The project's members and roles: admins change them, everyone else can look. */
export function MembersPage() {
  const projectId = useProjectId();
  const projectQuery = useProject(projectId);
  const projectLabel = useProjectLabel(projectId);

  if (projectQuery.isError) {
    return (
      <QueryErrorState
        error={projectQuery.error}
        crumbs={[{ label: projectLabel }, { label: "Settings" }]}
        subject="This project"
        notFound={{
          icon: FolderX,
          title: "Project not found",
          description: "This project does not exist, or you do not have access to it.",
        }}
        onRetry={() => projectQuery.refetch()}
      />
    );
  }

  if (!projectQuery.data) {
    return <ProjectHeaderSkeleton />;
  }

  return <ProjectMembers project={projectQuery.data} />;
}

function ProjectMembers({ project }: { project: Project }) {
  const membersQuery = useMembers(project.id);
  const blockedReason = manageMembersBlockedReason(project);

  return (
    <>
      <ProjectHeader
        project={project}
        page="Settings"
        title="Members"
        narrow
        description={`Who works on ${project.name}, and what their role lets them do.`}
        actions={
          <AddMemberDialog
            project={project}
            members={membersQuery.data ?? []}
            blockedReason={blockedReason}
          />
        }
      />

      <div className="max-w-4xl space-y-4 px-8 pb-8">
        {blockedReason && (
          <p className="flex items-center gap-2 text-ink-muted">
            <Eye aria-hidden="true" className="size-3.5 shrink-0" />
            {blockedReason}
          </p>
        )}
        <Panel>
          <MemberList project={project} membersQuery={membersQuery} blockedReason={blockedReason} />
        </Panel>
        <RoleLegend />
      </div>
    </>
  );
}

type MemberListProps = {
  project: Project;
  membersQuery: ReturnType<typeof useMembers>;
  blockedReason: string | null;
};

function MemberList({ project, membersQuery, blockedReason }: MemberListProps) {
  const { data: currentUser } = useCurrentUser();
  const changeRole = useChangeMemberRole(project.id);
  const toast = useToast();
  const [memberToRemove, setMemberToRemove] = useState<ProjectMember | null>(null);

  if (membersQuery.isPending) {
    return (
      <div role="status" aria-label="Loading members" className="space-y-4 p-4">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
        <Skeleton className="h-3 w-2/5" />
      </div>
    );
  }

  if (membersQuery.isError) {
    return (
      <ErrorState
        title="Members could not be loaded"
        description={membersQuery.error.message}
        action={<Button onClick={() => membersQuery.refetch()}>Try again</Button>}
      />
    );
  }

  function changeMemberRole(member: ProjectMember, role: ProjectRole) {
    changeRole.mutate(
      { userId: member.id, changes: { role } },
      {
        onSuccess: () =>
          toast.add({
            title: `Changed ${member.name} to ${roleNames[role]}`,
            description:
              role === "viewer" ? "Their unresolved tickets are unassigned now." : undefined,
          }),
        onError: (error) =>
          toast.add({ title: "The role was not changed", description: error.message }),
      },
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableHead>Member</TableHead>
          <TableHead className="w-56">Role</TableHead>
          <TableHead className="w-14">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableHeader>
        <tbody>
          {membersQuery.data.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              isCurrentUser={member.id === currentUser?.id}
              blockedReason={blockedReason}
              onRoleChange={(role) => changeMemberRole(member, role)}
              onRemove={() => setMemberToRemove(member)}
            />
          ))}
        </tbody>
      </Table>
      <RemoveMemberDialog
        project={project}
        member={memberToRemove}
        onClose={() => setMemberToRemove(null)}
      />
    </>
  );
}

function RoleLegend() {
  return (
    <dl className="flex flex-wrap gap-x-8 gap-y-1 px-1 text-ink-muted">
      {projectRoles.map((role) => (
        <div key={role} className="flex gap-1.5">
          <dt className="font-medium text-ink">{roleNames[role]}</dt>
          <dd>{roleDescriptions[role]}</dd>
        </div>
      ))}
    </dl>
  );
}
