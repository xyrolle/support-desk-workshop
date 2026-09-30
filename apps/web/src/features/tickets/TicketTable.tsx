import type { TicketListItem } from "@support-desk/shared";
import { useRef } from "react";
import { PermissionHint } from "../../components/PermissionHint.tsx";
import { Checkbox } from "../../components/ui/Checkbox.tsx";
import { Table, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/Table.tsx";
import { classNames } from "../../lib/class-names.ts";
import { type TicketColumn, ticketColumns } from "./ticket-columns.tsx";

export type TicketRowSelection = {
  isSelected: (ticketId: string) => boolean;
  allSelected: boolean;
  someSelected: boolean;
  /** Why the checkboxes are disabled, or null when the user may edit tickets. */
  blockedReason: string | null;
  onToggle: (ticketId: string, shiftKey: boolean) => void;
  onTogglePage: (selected: boolean) => void;
};

type TicketTableProps = {
  tickets: TicketListItem[];
  columns: TicketColumn[];
  selection?: TicketRowSelection;
};

const selectColumnClassName = "relative z-10 w-10 pr-0";

export function TicketTable({ tickets, columns, selection }: TicketTableProps) {
  return (
    <Table>
      <TableHeader>
        {selection && (
          <TableHead className={selectColumnClassName}>
            <SelectCheckbox
              label="Select all tickets"
              checked={selection.allSelected}
              indeterminate={selection.someSelected}
              blockedReason={selection.blockedReason}
              onCheckedChange={(checked) => selection.onTogglePage(checked)}
            />
          </TableHead>
        )}
        {columns.map((column) => (
          <TableHead key={column} className={ticketColumns[column].className}>
            {ticketColumns[column].header}
          </TableHead>
        ))}
      </TableHeader>
      <tbody>
        {tickets.map((ticket) => (
          <TableRow
            key={ticket.id}
            selected={selection?.isSelected(ticket.id)}
            className="relative cursor-pointer"
          >
            {selection && (
              <TableCell className={selectColumnClassName}>
                <SelectCheckbox
                  label={`Select ${ticket.id}`}
                  checked={selection.isSelected(ticket.id)}
                  blockedReason={selection.blockedReason}
                  onCheckedChange={(_checked, shiftKey) => selection.onToggle(ticket.id, shiftKey)}
                  trackShift
                />
              </TableCell>
            )}
            {columns.map((column) => (
              <TableCell
                key={column}
                className={classNames(
                  ticketColumns[column].className,
                  ticketColumns[column].cellClassName,
                )}
              >
                {ticketColumns[column].render(ticket)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </tbody>
    </Table>
  );
}

type SelectCheckboxProps = {
  label: string;
  checked: boolean;
  indeterminate?: boolean;
  blockedReason: string | null;
  onCheckedChange: (checked: boolean, shiftKey: boolean) => void;
  /** Row checkboxes read shift so a range can be selected. The header does not. */
  trackShift?: boolean;
};

function SelectCheckbox({
  label,
  checked,
  indeterminate = false,
  blockedReason,
  onCheckedChange,
  trackShift = false,
}: SelectCheckboxProps) {
  const shiftKey = useRef(false);
  return (
    <PermissionHint reason={blockedReason}>
      <span
        className="inline-flex"
        onClickCapture={(event) => {
          shiftKey.current = trackShift && event.shiftKey;
        }}
      >
        <Checkbox
          aria-label={label}
          checked={checked}
          indeterminate={indeterminate}
          disabled={blockedReason !== null}
          onCheckedChange={(next) => onCheckedChange(next === true, shiftKey.current)}
        />
      </span>
    </PermissionHint>
  );
}
