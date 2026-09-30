import { MyTicketsLink } from "../features/my-tickets/MyTicketsLink.tsx";
import { ProjectSwitcher } from "../features/projects/ProjectSwitcher.tsx";
import { CurrentUserCard } from "../features/users/CurrentUserCard.tsx";
import { AppLogo } from "./AppLogo.tsx";

/** The app's left column. Each module adds a link or a SidebarSection to the middle. */
export function Sidebar() {
  return (
    <aside className="sticky top-0 flex h-dvh w-60 shrink-0 flex-col border-r border-line bg-sidebar">
      <div className="flex h-12 shrink-0 items-center gap-2 px-4">
        <AppLogo />
        <span className="font-semibold tracking-tight">Support Desk</span>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-2 py-2">
        <nav aria-label="Your work">
          <MyTicketsLink />
        </nav>
        <ProjectSwitcher />
      </div>

      <div className="p-2">
        <CurrentUserCard />
      </div>
    </aside>
  );
}
