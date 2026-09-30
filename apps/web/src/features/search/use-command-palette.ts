import type { ProjectTicketListQuery } from "@support-desk/shared";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  createContext,
  createElement,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useParams } from "react-router";
import { api } from "../../api/client.ts";
import { queryKeys, useProject, useProjects } from "../../api/queries.ts";

type SearchPalette = {
  openSearch: () => void;
};

const SearchPaletteContext = createContext<SearchPalette>({
  openSearch() {},
});

export function SearchPaletteProvider({
  value,
  children,
}: {
  value: SearchPalette;
  children: ReactNode;
}) {
  return createElement(SearchPaletteContext.Provider, { value }, children);
}

export function useSearchPalette(): SearchPalette {
  return useContext(SearchPaletteContext);
}

/** Opens the palette. The shortcut listens on the document, so it works from any field. */
export function useCommandPalette() {
  const [open, setOpen] = useState(false);
  const openSearch = useCallback(() => setOpen(true), []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== "k" || (!event.metaKey && !event.ctrlKey)) {
        return;
      }
      event.preventDefault();
      setOpen(true);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return { open, setOpen, openSearch };
}

/** The project in the URL, or the first project the user can see. */
export function useSearchProject() {
  const routeProjectId = useParams().projectId;
  const projects = useProjects();
  const project = useProject(routeProjectId ?? "", routeProjectId !== undefined);
  if (routeProjectId) {
    return { id: routeProjectId, name: project.data?.name };
  }
  const first = projects.data?.[0];
  return { id: first?.id, name: first?.name };
}

const RESULT_LIMIT = 8;

/** The palette's search. The query is part of the key, so a late answer cannot replace a newer one. */
export function useTicketSearch(projectId: string | undefined, q: string, enabled: boolean) {
  const query = { page: 1, direction: "desc", q } as ProjectTicketListQuery;
  return useQuery({
    queryKey: queryKeys.tickets(projectId ?? "", query),
    queryFn: () => api.listTickets(projectId ?? "", query),
    enabled: enabled && Boolean(projectId) && q.length > 0,
    placeholderData: keepPreviousData,
    select: (page) => ({ ...page, items: page.items.slice(0, RESULT_LIMIT) }),
  });
}
