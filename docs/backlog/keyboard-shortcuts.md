# Keyboard shortcuts

Needs: `v2/base`. `x` needs 04 (bulk actions).

## User story

As someone who lives in the queue all day, I want to move through tickets and change them
from the keyboard, so that my hands stay on the keys.

## Acceptance checks

- [ ] On a ticket list: `j` and `k` move a visible focus ring down and up (without scrolling
      the page past it), Enter opens the focused ticket, and the focused row is announced
      (`aria-selected` in a grid, or roving focus).
- [ ] `a` assigns the focused ticket to the current user and `s` opens its status menu, both
      through the existing `PATCH`, so the activity log records them; on the ticket page
      they act on that ticket.
- [ ] With 04 merged, `x` toggles the focused row's selection.
- [ ] `?` opens a cheat sheet dialog listing every shortcut, grouped by page; Esc closes it.
- [ ] Shortcuts do nothing while typing in an input, a textarea or an open menu, and never
      override the browser's own shortcuts (⌘ and Ctrl combinations).
- [ ] Viewers: `a` and `s` show a toast "Viewers can't change tickets" instead of acting.
- [ ] Tests press the keys with Testing Library's `userEvent.keyboard` and check the focus,
      the requests and the cheat sheet.

## Out of scope

Customizing shortcuts, sequences like `g i`, shortcuts in the conversation composer.

## Likely files

- `apps/web/src/lib/use-shortcuts.ts` (new, one place that registers and ignores inputs)
- the ticket list, the ticket page, `ShortcutsDialog.tsx` (new)

## Watch for

- One `keydown` listener per row; a single listener with the focused ticket in state.
- Listening on `window` and firing inside inputs and dialogs.
- Focus that jumps back to the first row after a refetch; keep it on the ticket id.
