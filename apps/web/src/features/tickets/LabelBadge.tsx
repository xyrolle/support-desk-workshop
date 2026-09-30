import type { Label, LabelColor } from "@support-desk/shared";
import { Badge } from "../../components/ui/Badge.tsx";
import { classNames } from "../../lib/class-names.ts";

const dotClasses: Record<LabelColor, string> = {
  gray: "bg-zinc-400",
  red: "bg-red-500",
  orange: "bg-orange-500",
  amber: "bg-amber-500",
  green: "bg-emerald-500",
  teal: "bg-teal-500",
  blue: "bg-blue-500",
  indigo: "bg-indigo-500",
  violet: "bg-violet-500",
  pink: "bg-pink-500",
};

/** The label's colour as a small dot, for chips and menu items. */
export function LabelDot({ color }: { color: LabelColor }) {
  return (
    <span
      aria-hidden="true"
      className={classNames("size-2 shrink-0 rounded-full", dotClasses[color])}
    />
  );
}

export function LabelBadge({ label }: { label: Label }) {
  return <Badge icon={<LabelDot color={label.color} />}>{label.name}</Badge>;
}
