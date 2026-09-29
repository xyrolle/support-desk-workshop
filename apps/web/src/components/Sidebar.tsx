import { Inbox } from "lucide-react";
import { ProjectSwitcher } from "../features/projects/ProjectSwitcher.tsx";
import { CurrentUserCard } from "../features/users/CurrentUserCard.tsx";

export function Sidebar() {
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-line bg-sidebar">
      <div className="flex h-16 items-center gap-2.5 px-5">
        <span className="flex size-7 items-center justify-center rounded-lg bg-indigo-500 text-white shadow-xs">
          <Inbox aria-hidden="true" className="size-4" />
        </span>
        <span className="text-[15px] font-semibold tracking-tight">Support Desk</span>
      </div>

      <nav aria-label="Projects" className="flex-1 overflow-y-auto px-3 py-3">
        <ProjectSwitcher />
      </nav>

      <div className="border-t border-line p-3">
        <CurrentUserCard />
      </div>
    </aside>
  );
}
