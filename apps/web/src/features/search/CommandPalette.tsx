import type { TicketListItem } from "@support-desk/shared";
import { type KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Badge } from "../../components/ui/Badge.tsx";
import { Dialog, DialogSurface, DialogTitle } from "../../components/ui/Dialog.tsx";
import { classNames } from "../../lib/class-names.ts";
import { StatusLabel } from "../tickets/StatusLabel.tsx";
import { SearchSnippet } from "./SearchSnippet.tsx";
import { useSearchProject, useTicketSearch } from "./use-command-palette.ts";

type CommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/** A search dialog over the current page. Results follow what you type, after a short pause. */
export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const project = useSearchProject();
  const navigate = useNavigate();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const search = useTicketSearch(project.id, q, open);
  const showError =
    q.length > 0 && search.isError && !search.isFetching && !search.isPlaceholderData;
  const items = q.length > 0 && !showError ? (search.data?.items ?? []) : [];
  const activeIndex = items.length === 0 ? 0 : Math.min(Math.max(active, 0), items.length - 1);
  const showEmpty =
    q.length > 0 &&
    !showError &&
    items.length === 0 &&
    search.isSuccess &&
    !search.isFetching &&
    !search.isPlaceholderData;

  function openTicket(ticket: TicketListItem) {
    onOpenChange(false);
    navigate(`/projects/${ticket.projectId}/tickets/${ticket.id}`);
  }

  function onInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (items.length > 0) {
        setActive(Math.min(activeIndex + 1, items.length - 1));
      }
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive(Math.max(activeIndex - 1, 0));
    } else if (event.key === "Enter" && items[activeIndex]) {
      event.preventDefault();
      openTicket(items[activeIndex]);
    }
  }

  useEffect(() => {
    if (!open) {
      setText("");
      setQ("");
      return;
    }
    const timer = window.setTimeout(() => {
      setQ(text.trim());
      setActive(0);
    }, 200);
    return () => window.clearTimeout(timer);
  }, [open, text]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogSurface
        initialFocus={inputRef}
        className="fixed top-[15%] left-1/2 z-50 w-[36rem] max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-lg border border-line bg-popover shadow-popover outline-none"
      >
        <DialogTitle className="sr-only">Search tickets</DialogTitle>
        <div className="flex items-center gap-2 border-b border-line pr-3 pl-4">
          <input
            ref={inputRef}
            aria-label="Search tickets"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={
              items[activeIndex] ? `${listId}-${items[activeIndex].id}` : undefined
            }
            placeholder="Search tickets…"
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={onInputKeyDown}
            className="h-12 min-w-0 flex-1 bg-transparent outline-none placeholder:text-ink-subtle"
          />
          {project.name && <Badge>{project.name}</Badge>}
        </div>
        {showError && (
          <p className="px-4 py-6 text-center text-danger">
            {search.error instanceof Error ? search.error.message : "Tickets could not be loaded"}
          </p>
        )}
        {showEmpty && (
          <p className="px-4 py-6 text-center text-ink-muted">No tickets match “{q}”</p>
        )}
        {items.length > 0 && (
          <div
            role="listbox"
            id={listId}
            aria-label="Search results"
            className="max-h-80 overflow-y-auto p-1"
          >
            {items.map((ticket, index) => (
              <div
                key={ticket.id}
                id={`${listId}-${ticket.id}`}
                role="option"
                aria-selected={index === activeIndex}
                tabIndex={-1}
                onMouseEnter={() => setActive(index)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => openTicket(ticket)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    openTicket(ticket);
                  }
                }}
                className={classNames(
                  "flex cursor-default flex-col gap-0.5 rounded-md px-3 py-2",
                  index === activeIndex && "bg-surface-hover",
                )}
              >
                <span className="flex items-center gap-2">
                  <span className="shrink-0 whitespace-nowrap text-ink-subtle tabular-nums">
                    {ticket.id}
                  </span>
                  <StatusLabel status={ticket.status} />
                  <span className="min-w-0 truncate font-medium">{ticket.title}</span>
                </span>
                {ticket.snippet && <SearchSnippet parts={ticket.snippet} />}
              </div>
            ))}
          </div>
        )}
      </DialogSurface>
    </Dialog>
  );
}
