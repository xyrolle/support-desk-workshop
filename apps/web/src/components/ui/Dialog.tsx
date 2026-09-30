import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import type { ReactNode } from "react";

export const Dialog = BaseDialog.Root;

/** Opens the dialog. Style it with `render`, for example `render={<Button />}`. */
export const DialogTrigger = BaseDialog.Trigger;

/** Closes the dialog. Style it with `render`, for example `render={<Button />}`. */
export const DialogClose = BaseDialog.Close;

type DialogPopupProps = {
  title: string;
  description?: string;
  children?: ReactNode;
  /** Buttons on the bottom right, the main action last. */
  actions: ReactNode;
};

/** A modal window for a decision or a short form. */
export function DialogPopup({ title, description, children, actions }: DialogPopupProps) {
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop className="fixed inset-0 z-50 bg-ink/20 transition-opacity duration-150 data-starting-style:opacity-0 data-ending-style:opacity-0 dark:bg-black/50" />
      <BaseDialog.Popup className="fixed top-1/2 left-1/2 z-50 w-[28rem] max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-line bg-popover shadow-popover transition-[opacity,scale] duration-150 data-starting-style:scale-98 data-starting-style:opacity-0 data-ending-style:scale-98 data-ending-style:opacity-0 motion-reduce:transition-none">
        <div className="px-5 pt-5">
          <BaseDialog.Title className="text-base font-semibold">{title}</BaseDialog.Title>
          {description && (
            <BaseDialog.Description className="mt-1 text-pretty text-ink-muted">
              {description}
            </BaseDialog.Description>
          )}
        </div>
        {children && <div className="px-5 pt-4">{children}</div>}
        <div className="mt-5 flex justify-end gap-2 border-t border-line px-5 py-3">{actions}</div>
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  );
}
