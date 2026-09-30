import type { ReactElement } from "react";
import { Tooltip } from "./ui/Tooltip.tsx";

type PermissionHintProps = {
  /** Why the user cannot use the control, or `null` when they can. */
  reason: string | null;
  children: ReactElement;
};

/**
 * Wraps a control the user's role does not allow: it stays visible but disabled, and
 * hovering it says why. A disabled button gets no pointer events, so the wrapper
 * catches them. Pages also state the reason in text, for keyboard and screen readers.
 */
export function PermissionHint({ reason, children }: PermissionHintProps) {
  if (!reason) {
    return children;
  }

  return (
    <Tooltip content={reason}>
      <span className="block">{children}</span>
    </Tooltip>
  );
}
