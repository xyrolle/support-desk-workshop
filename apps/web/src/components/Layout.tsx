import { Outlet } from "react-router";
import { Sidebar } from "./Sidebar.tsx";

export function Layout() {
  return (
    <div className="flex h-dvh overflow-hidden">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  );
}
