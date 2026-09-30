import { CircleCheck, UserRound } from "lucide-react";
import { useState } from "react";
import { Pagination } from "../../components/Pagination.tsx";
import { Panel } from "../../components/Panel.tsx";
import { RelativeTime } from "../../components/RelativeTime.tsx";
import { Button } from "../../components/ui/Button.tsx";
import { Checkbox } from "../../components/ui/Checkbox.tsx";
import { SearchInput } from "../../components/ui/Input.tsx";
import { SelectionBar } from "../../components/ui/SelectionBar.tsx";
import { Table, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/Table.tsx";
import { AssigneeLabel } from "../../features/tickets/AssigneeLabel.tsx";
import { PriorityLabel } from "../../features/tickets/PriorityLabel.tsx";
import { StatusLabel } from "../../features/tickets/StatusLabel.tsx";
import { useRowSelection } from "../../lib/use-row-selection.ts";
import { kitTickets } from "../kit-data.ts";
import { StatusMultiSelectDemo } from "./StatusMultiSelectDemo.tsx";

const actionIconClassName = "size-4 text-ink-subtle";

/** A Panel with a toolbar, a table with a checkbox column, the selection bar and pagination. */
export function SelectableTableDemo() {
  const [searchText, setSearchText] = useState("");
  const selection = useRowSelection(kitTickets.map((ticket) => ticket.id));

  return (
    <Panel
      toolbar={
        <>
          <SearchInput
            aria-label="Search tickets"
            placeholder="Search tickets"
            className="w-64"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            onClear={() => setSearchText("")}
          />
          <StatusMultiSelectDemo />
        </>
      }
      overlay={
        <SelectionBar count={selection.selectedCount} onClear={selection.clear}>
          <Button variant="ghost" size="sm">
            <UserRound aria-hidden="true" className={actionIconClassName} />
            Assign
          </Button>
          <Button variant="ghost" size="sm">
            <CircleCheck aria-hidden="true" className={actionIconClassName} />
            Close
          </Button>
        </SelectionBar>
      }
      footer={
        <Pagination page={1} pageSize={20} totalItems={6} totalPages={1} onPageChange={() => {}} />
      }
    >
      <Table>
        <TableHeader>
          <TableHead className="w-10 pr-0">
            <Checkbox
              aria-label="Select all tickets"
              checked={selection.allSelected}
              indeterminate={selection.someSelected}
              onCheckedChange={selection.toggleAll}
            />
          </TableHead>
          <TableHead className="w-24">ID</TableHead>
          <TableHead>Title</TableHead>
          <TableHead className="w-48">Status</TableHead>
          <TableHead className="w-32">Priority</TableHead>
          <TableHead className="w-48">Assignee</TableHead>
          <TableHead className="w-32 text-right">Updated</TableHead>
        </TableHeader>
        <tbody>
          {kitTickets.map((ticket) => (
            <TableRow key={ticket.id} selected={selection.isSelected(ticket.id)}>
              <TableCell className="pr-0">
                <Checkbox
                  aria-label={`Select ${ticket.id}`}
                  checked={selection.isSelected(ticket.id)}
                  onCheckedChange={(isChecked) => selection.toggleRow(ticket.id, isChecked)}
                />
              </TableCell>
              <TableCell className="text-ink-subtle">{ticket.id}</TableCell>
              <TableCell className="truncate font-medium">{ticket.title}</TableCell>
              <TableCell>
                <StatusLabel status={ticket.status} />
              </TableCell>
              <TableCell className="text-ink-muted">
                <PriorityLabel priority={ticket.priority} />
              </TableCell>
              <TableCell>
                <AssigneeLabel assignee={ticket.assignee} />
              </TableCell>
              <TableCell className="text-right text-ink-muted tabular-nums">
                <RelativeTime value={ticket.updatedAt} />
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>
    </Panel>
  );
}
