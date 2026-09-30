import { Outlet } from "react-router";
import { Sidebar } from "./Sidebar.tsx";

/** The sidebar stays put while the page scrolls, so tables keep their natural height. */
export function Layout() {
  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  );
}
