import { Toast as BaseToast } from "@base-ui/react/toast";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { buttonClassName } from "./Button.tsx";

/**
 * Shows a toast from anywhere below ToastProvider:
 * `toast.add({ title, description, actionProps: { children: "Undo", onClick } })`.
 */
export const useToast = BaseToast.useToastManager;

/** Wrap the app once. Toasts stack in the bottom-right corner. */
export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <BaseToast.Provider>
      {children}
      <BaseToast.Portal>
        <BaseToast.Viewport className="fixed right-4 bottom-4 z-50 flex w-90 flex-col gap-2 outline-none">
          <ToastList />
        </BaseToast.Viewport>
      </BaseToast.Portal>
    </BaseToast.Provider>
  );
}

function ToastList() {
  const { toasts } = BaseToast.useToastManager();

  return toasts.map((toast) => (
    <BaseToast.Root
      key={toast.id}
      toast={toast}
      className="rounded-lg border border-line bg-popover shadow-popover transition-[opacity,translate] duration-200 data-starting-style:translate-y-2 data-starting-style:opacity-0 data-ending-style:opacity-0 motion-reduce:transition-none"
    >
      <BaseToast.Content className="flex items-center gap-3 py-2.5 pr-2 pl-3.5">
        <div className="min-w-0 flex-1">
          <BaseToast.Title className="font-medium" />
          <BaseToast.Description className="text-ink-muted" />
        </div>
        {toast.actionProps && (
          <BaseToast.Action className={buttonClassName({ variant: "secondary", size: "sm" })} />
        )}
        <BaseToast.Close
          aria-label="Dismiss"
          className={buttonClassName({ variant: "ghost", size: "icon" })}
        >
          <X aria-hidden="true" className="size-4" />
        </BaseToast.Close>
      </BaseToast.Content>
    </BaseToast.Root>
  ));
}
