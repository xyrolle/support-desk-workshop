import {
  type ProjectMember,
  priorityNames,
  statusNames,
  type TicketFilters,
  type TicketPriority,
  type TicketStatus,
  ticketPriorities,
  ticketStatuses,
} from "@support-desk/shared";
import { useLabels, useMembers } from "../../api/queries.ts";
import { Badge } from "../../components/ui/Badge.tsx";
import { Button } from "../../components/ui/Button.tsx";
import { Select, SelectItem, SelectPopup, SelectTrigger } from "../../components/ui/Select.tsx";
import { filtersAreActive } from "./use-ticket-list-query.ts";

type FilterBarProps = {
  projectId: string;
  filters: TicketFilters;
  onChange: (changes: Partial<TicketFilters>) => void;
  onClear: () => void;
};

/** Status, priority, assignee and label, in the ticket table's toolbar. */
export function FilterBar({ projectId, filters, onChange, onClear }: FilterBarProps) {
  const { data: members = [] } = useMembers(projectId);
  const { data: labels = [] } = useLabels(projectId);
  const active = filtersAreActive(filters);

  return (
    <>
      <MultiFilter
        label="Status"
        value={filters.status ?? []}
        options={ticketStatuses.map((status) => ({ value: status, label: statusNames[status] }))}
        onChange={(status: TicketStatus[]) => onChange({ status: orUndefined(status) })}
      />
      <MultiFilter
        label="Priority"
        value={filters.priority ?? []}
        options={ticketPriorities.map((priority) => ({
          value: priority,
          label: priorityNames[priority],
        }))}
        onChange={(priority: TicketPriority[]) => onChange({ priority: orUndefined(priority) })}
      />
      <MultiFilter
        label="Assignee"
        value={filters.assignee ?? []}
        options={assigneeOptions(members)}
        onChange={(assignee: string[]) => onChange({ assignee: orUndefined(assignee) })}
      />
      <MultiFilter
        label="Label"
        value={filters.label ?? []}
        options={labels.map((label) => ({ value: label.id, label: label.name }))}
        onChange={(label: number[]) => onChange({ label: orUndefined(label) })}
      />
      {active && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear filters
        </Button>
      )}
    </>
  );
}

type Option<Value extends string | number> = {
  value: Value;
  label: string;
};

type MultiFilterProps<Value extends string | number> = {
  label: string;
  value: Value[];
  options: Option<Value>[];
  onChange: (value: Value[]) => void;
};

function MultiFilter<Value extends string | number>({
  label,
  value,
  options,
  onChange,
}: MultiFilterProps<Value>) {
  const selected = options.filter((option) => value.includes(option.value));

  return (
    <Select multiple value={value} onValueChange={onChange}>
      <SelectTrigger appearance="field" aria-label={label} className="w-auto max-w-64">
        {selected.length > 0 ? (
          <span className="flex min-w-0 gap-1">
            {selected.map((option) => (
              <Badge key={String(option.value)}>{option.label}</Badge>
            ))}
          </span>
        ) : (
          label
        )}
      </SelectTrigger>
      <SelectPopup>
        {options.map((option) => (
          <SelectItem key={String(option.value)} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectPopup>
    </Select>
  );
}

/** Me and Unassigned first, then agents and admins in the order the API returns them. */
function assigneeOptions(members: ProjectMember[]): Option<string>[] {
  return [
    { value: "me", label: "Me" },
    { value: "unassigned", label: "Unassigned" },
    ...members
      .filter((member) => member.role !== "viewer")
      .map((member) => ({ value: member.id, label: member.name })),
  ];
}

function orUndefined<Value>(values: Value[]): Value[] | undefined {
  return values.length > 0 ? values : undefined;
}
