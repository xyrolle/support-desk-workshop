import { ProjectSwitcher } from "../features/projects/ProjectSwitcher.tsx";
import { CurrentUserCard } from "../features/users/CurrentUserCard.tsx";
import { AppLogo } from "./AppLogo.tsx";

/** The app's left column. Each module adds a SidebarSection to the scrolling middle. */
export function Sidebar() {
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-line bg-sidebar">
      <div className="flex h-12 shrink-0 items-center gap-2 px-4">
        <AppLogo />
        <span className="font-semibold tracking-tight">Support Desk</span>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-2 py-2">
        <ProjectSwitcher />
      </div>

      <div className="p-2">
        <CurrentUserCard />
      </div>
    </aside>
  );
}
