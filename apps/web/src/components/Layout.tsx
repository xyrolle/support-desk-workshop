import { Outlet } from "react-router";
import { CommandPalette } from "../features/search/CommandPalette.tsx";
import {
  SearchPaletteProvider,
  useCommandPalette,
} from "../features/search/use-command-palette.ts";
import { Sidebar } from "./Sidebar.tsx";

/** The sidebar stays put while the page scrolls, so tables keep their natural height. */
export function Layout() {
  const palette = useCommandPalette();
  return (
    <SearchPaletteProvider value={{ openSearch: palette.openSearch }}>
      <div className="flex min-h-dvh">
        <Sidebar />
        <main className="flex min-w-0 flex-1 flex-col">
          <Outlet />
        </main>
      </div>
      <CommandPalette open={palette.open} onOpenChange={palette.setOpen} />
    </SearchPaletteProvider>
  );
}
