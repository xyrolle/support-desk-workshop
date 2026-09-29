import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import type { ReactNode } from "react";
import { classNames, type WithClassName } from "../../lib/class-names.ts";

export const Tabs = BaseTabs.Root;

/** The row of tabs, underlined, with a line under the active one. */
export function TabsList({ children }: { children: ReactNode }) {
  return (
    <BaseTabs.List className="relative flex items-center gap-5 border-b border-line">
      {children}
      <BaseTabs.Indicator className="absolute -bottom-px left-0 h-0.5 w-(--active-tab-width) translate-x-(--active-tab-left) bg-ink transition-[translate,width] duration-200 ease-out motion-reduce:transition-none" />
    </BaseTabs.List>
  );
}

export function Tab({ className, ...props }: WithClassName<BaseTabs.Tab.Props>) {
  return (
    <BaseTabs.Tab
      className={classNames(
        "flex h-9 items-center gap-1.5 font-medium text-ink-muted outline-none transition-colors",
        "hover:text-ink data-active:text-ink",
        "focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-accent",
        className,
      )}
      {...props}
    />
  );
}

export function TabsPanel({ className, ...props }: WithClassName<BaseTabs.Panel.Props>) {
  return <BaseTabs.Panel className={classNames("pt-4 outline-none", className)} {...props} />;
}
