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
  sla?: "at_risk";
  onChange: (changes: Partial<TicketFilters & { sla?: "at_risk" }>) => void;
  onClear: () => void;
};

/** Status, priority, assignee and label, in the ticket table's toolbar. */
export function FilterBar({ projectId, filters, sla, onChange, onClear }: FilterBarProps) {
  const { data: members = [] } = useMembers(projectId);
  const { data: labels = [] } = useLabels(projectId);
  const active = filtersAreActive(filters) || sla === "at_risk";

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
      <Button
        variant={sla === "at_risk" ? "secondary" : "ghost"}
        size="sm"
        aria-pressed={sla === "at_risk"}
        onClick={() => onChange({ sla: sla === "at_risk" ? undefined : "at_risk" })}
      >
        At risk
      </Button>
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
  const selected = value.flatMap((item) => {
    const option = options.find((candidate) => candidate.value === item);
    return option ? [option] : [];
  });
  const [first, ...rest] = selected;

  return (
    <Select multiple value={value} onValueChange={onChange}>
      <SelectTrigger appearance="field" aria-label={label} className="w-auto shrink-0">
        {first ? (
          <span className="flex items-center gap-1">
            <Badge>{first.label}</Badge>
            {rest.length > 0 && <Badge>+{rest.length}</Badge>}
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
