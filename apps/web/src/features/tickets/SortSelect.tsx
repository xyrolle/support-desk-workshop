import type { SortDirection, TicketSort } from "@support-desk/shared";
import { ArrowUpDown } from "lucide-react";
import { Select, SelectItem, SelectPopup, SelectTrigger } from "../../components/ui/Select.tsx";

type SortOption = {
  id: string;
  label: string;
  sort: TicketSort;
  direction: SortDirection;
};

const sortOptions: SortOption[] = [
  { id: "updated-desc", label: "Recently updated", sort: "updated", direction: "desc" },
  { id: "updated-asc", label: "Least recently updated", sort: "updated", direction: "asc" },
  { id: "created-desc", label: "Newest first", sort: "created", direction: "desc" },
  { id: "created-asc", label: "Oldest first", sort: "created", direction: "asc" },
  { id: "priority-desc", label: "Most urgent first", sort: "priority", direction: "desc" },
  { id: "priority-asc", label: "Least urgent first", sort: "priority", direction: "asc" },
];

type SortSelectProps = {
  sort: TicketSort;
  direction: SortDirection;
  onChange: (sort: TicketSort, direction: SortDirection) => void;
};

/** One choice for the order of a ticket list: a field and a direction, named plainly. */
export function SortSelect({ sort, direction, onChange }: SortSelectProps) {
  const selected = sortOptions.find(
    (option) => option.sort === sort && option.direction === direction,
  );

  function choose(optionId: string | null) {
    const option = sortOptions.find((candidate) => candidate.id === optionId);
    if (option) {
      onChange(option.sort, option.direction);
    }
  }

  return (
    <Select value={selected?.id ?? null} onValueChange={choose}>
      <SelectTrigger aria-label="Sort tickets" className="w-52">
        <ArrowUpDown aria-hidden="true" className="size-3.5 shrink-0 text-ink-subtle" />
        {selected?.label}
      </SelectTrigger>
      <SelectPopup>
        {sortOptions.map((option) => (
          <SelectItem key={option.id} value={option.id}>
            {option.label}
          </SelectItem>
        ))}
      </SelectPopup>
    </Select>
  );
}
