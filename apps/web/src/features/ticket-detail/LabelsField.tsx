import type { Label } from "@support-desk/shared";
import { useLabels } from "../../api/queries.ts";
import { PermissionHint } from "../../components/PermissionHint.tsx";
import { Select, SelectItem, SelectPopup, SelectTrigger } from "../../components/ui/Select.tsx";
import { LabelBadge, LabelDot } from "../tickets/LabelBadge.tsx";

type LabelsFieldProps = {
  projectId: string;
  labels: Label[];
  blockedReason: string | null;
  onChange: (labelIds: number[]) => void;
};

/** Every toggle saves at once, like the other properties. */
export function LabelsField({ projectId, labels, blockedReason, onChange }: LabelsFieldProps) {
  const { data: projectLabels = [] } = useLabels(projectId);
  const labelIds = labels.map((label) => label.id);

  return (
    <PermissionHint reason={blockedReason}>
      <Select
        multiple
        value={labelIds}
        onValueChange={(ids: number[]) => onChange(ids)}
        disabled={blockedReason !== null}
      >
        <SelectTrigger
          appearance="inline"
          aria-label={`Labels: ${labels.map((label) => label.name).join(", ") || "none"}`}
          className="h-auto min-h-8 py-1 whitespace-normal"
        >
          {labels.length > 0 ? (
            <span className="flex flex-wrap gap-1">
              {labels.map((label) => (
                <LabelBadge key={label.id} label={label} />
              ))}
            </span>
          ) : (
            <span className="text-ink-subtle">Add labels</span>
          )}
        </SelectTrigger>
        <SelectPopup>
          {projectLabels.map((label) => (
            <SelectItem key={label.id} value={label.id}>
              <LabelDot color={label.color} />
              {label.name}
            </SelectItem>
          ))}
        </SelectPopup>
      </Select>
    </PermissionHint>
  );
}
