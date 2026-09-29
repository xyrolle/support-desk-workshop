import { Inbox } from "lucide-react";

export function AppLogo() {
  return (
    <span
      aria-hidden="true"
      className="flex size-5 shrink-0 items-center justify-center rounded-[5px] bg-primary text-white"
    >
      <Inbox className="size-3" strokeWidth={2.5} />
    </span>
  );
}
