import { MoreHorizontal, Plus, SearchX } from "lucide-react";
import { type ReactNode, useState } from "react";
import { AppLogo } from "../components/AppLogo.tsx";
import { Breadcrumbs } from "../components/Breadcrumbs.tsx";
import { PageHeader } from "../components/PageHeader.tsx";
import { Panel } from "../components/Panel.tsx";
import { TopBar } from "../components/TopBar.tsx";
import { Avatar } from "../components/ui/Avatar.tsx";
import { AvatarStack } from "../components/ui/AvatarStack.tsx";
import { Badge } from "../components/ui/Badge.tsx";
import { Button } from "../components/ui/Button.tsx";
import { EmptyState } from "../components/ui/EmptyState.tsx";
import { Input, SearchInput } from "../components/ui/Input.tsx";
import { Kbd } from "../components/ui/Kbd.tsx";
import { PriorityIcon } from "../components/ui/PriorityIcon.tsx";
import { Skeleton } from "../components/ui/Skeleton.tsx";
import { StatusBadge } from "../components/ui/StatusBadge.tsx";
import { StatusIcon } from "../components/ui/StatusIcon.tsx";
import { Tooltip } from "../components/ui/Tooltip.tsx";
import { AssigneeLabel } from "../features/tickets/AssigneeLabel.tsx";
import { ActionsMenuDemo } from "./demos/ActionsMenuDemo.tsx";
import { AssigneeComboboxDemo } from "./demos/AssigneeComboboxDemo.tsx";
import { OverlayDemos } from "./demos/OverlayDemos.tsx";
import { SelectableTableDemo } from "./demos/SelectableTableDemo.tsx";
import { StatusMultiSelectDemo } from "./demos/StatusMultiSelectDemo.tsx";
import { StatusSelectDemo } from "./demos/StatusSelectDemo.tsx";
import { TabsDemo } from "./demos/TabsDemo.tsx";
import {
  diego,
  hana,
  lena,
  maya,
  priorityKinds,
  priorityNames,
  priya,
  sam,
  statusKinds,
  statusNames,
} from "./kit-data.ts";

/** Every primitive in components/ui on one page, in the system theme. Development only. */
export function UiKitPage() {
  const [searchText, setSearchText] = useState("apple pay");

  return (
    <div className="min-h-dvh bg-canvas">
      <title>UI kit · Support Desk</title>
      <TopBar>
        <Breadcrumbs
          items={[{ label: "Support Desk", to: "/", icon: <AppLogo /> }, { label: "UI kit" }]}
        />
      </TopBar>
      <PageHeader
        title="UI kit"
        description="The primitives in components/ui, drawn by the app's own code. Only in development."
      />

      <div className="px-8 pb-16">
        <KitSection title="Buttons" description="Primary once per view.">
          <Button variant="primary">
            <Plus aria-hidden="true" className="-ml-0.5 size-4" />
            New ticket
          </Button>
          <Button>Export</Button>
          <Button variant="ghost">Cancel</Button>
          <Button size="sm">Small</Button>
          <Tooltip content="More actions">
            <Button variant="ghost" size="icon" aria-label="More actions">
              <MoreHorizontal aria-hidden="true" className="size-4" />
            </Button>
          </Tooltip>
          <Button disabled>Disabled</Button>
        </KitSection>

        <KitSection title="Fields and keys" description="Kbd marks real shortcuts.">
          <Input aria-label="Ticket title" placeholder="Ticket title" className="w-56" />
          <SearchInput
            aria-label="Search tickets"
            placeholder="Search tickets"
            className="w-64"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            onClear={() => setSearchText("")}
          />
          <span className="flex items-center gap-1.5 text-ink-muted">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
            <span className="ml-1">Search</span>
          </span>
          <span className="flex items-center gap-1.5 text-ink-muted">
            <Kbd>Esc</Kbd>
            <span className="ml-1">Close</span>
          </span>
        </KitSection>

        <KitSection title="Status" description="Chips in lists, glyphs in menus.">
          <div className="flex w-full flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {statusKinds.map((kind) => (
                <StatusBadge key={kind} status={kind}>
                  {statusNames[kind]}
                </StatusBadge>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-5">
              {statusKinds.map((kind) => (
                <span key={kind} className="flex items-center gap-2 text-ink-muted">
                  <StatusIcon status={kind} />
                  {statusNames[kind]}
                </span>
              ))}
            </div>
          </div>
        </KitSection>

        <KitSection title="Priority" description="Urgent is the only colour.">
          {priorityKinds.map((kind) => (
            <span key={kind} className="flex items-center gap-2 pr-3 text-ink-muted">
              <PriorityIcon priority={kind} />
              {priorityNames[kind]}
            </span>
          ))}
        </KitSection>

        <KitSection title="Badges" description="Labels and counts, not status.">
          <Badge>Billing</Badge>
          <Badge>iOS 18</Badge>
          <Badge icon={<StatusIcon status="blocked" />}>Waiting on Adyen</Badge>
          <Badge>12</Badge>
        </KitSection>

        <KitSection title="People" description="Avatars, unassigned, a stack.">
          <Avatar user={maya} size="md" />
          <Avatar user={diego} />
          <AssigneeLabel assignee={priya} />
          <AssigneeLabel assignee={null} />
          <AvatarStack users={[maya, diego, priya, lena, sam, hana]} />
        </KitSection>

        <KitSection title="Select and menu" description="Single, multiple, actions.">
          <StatusSelectDemo />
          <StatusMultiSelectDemo />
          <ActionsMenuDemo />
        </KitSection>

        <KitSection title="Combobox" description="Type to filter teammates.">
          <AssigneeComboboxDemo />
        </KitSection>

        <KitSection title="Overlays" description="A toast can carry Undo.">
          <OverlayDemos />
        </KitSection>

        <KitSection title="Tabs" description="The line follows the active tab.">
          <TabsDemo />
        </KitSection>

        <KitSection title="Data table" description="Select rows to see the bar.">
          <div className="flex h-[27.5rem] w-full flex-col">
            <SelectableTableDemo />
          </div>
        </KitSection>

        <KitSection title="Empty and loading" description="Every data view has both.">
          <div className="grid w-full grid-cols-2 gap-6">
            <div className="flex h-64 flex-col">
              <Panel>
                <EmptyState
                  icon={SearchX}
                  title='No tickets match "zebra"'
                  description="Check the spelling or try a different word."
                  action={<Button>Clear search</Button>}
                />
              </Panel>
            </div>
            <div className="flex h-64 flex-col">
              <Panel>
                <div role="status" aria-label="Loading" className="space-y-5 p-5">
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-3/5" />
                  <Skeleton className="h-3 w-2/5" />
                </div>
              </Panel>
            </div>
          </div>
        </KitSection>
      </div>
    </div>
  );
}

type KitSectionProps = {
  title: string;
  description: string;
  children: ReactNode;
};

function KitSection({ title, description, children }: KitSectionProps) {
  return (
    <section className="grid grid-cols-[15rem_1fr] gap-8 border-t border-line py-6">
      <div>
        <h2 className="font-semibold">{title}</h2>
        <p className="mt-1 text-pretty text-ink-muted">{description}</p>
      </div>
      <div className="flex min-w-0 flex-wrap items-center gap-3">{children}</div>
    </section>
  );
}
