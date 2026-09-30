import { advanceRunningClock, type SlaClock } from "@support-desk/shared";
import { classNames } from "../../lib/class-names.ts";

type SlaChipProps = {
  clock: SlaClock;
  measuredAt: string;
  timeZone: string;
  now: Date;
};

type ChipTone = "neutral" | "amber" | "breached" | "paused" | "met";

const toneClasses: Record<ChipTone, string> = {
  neutral: "bg-surface-muted text-ink",
  amber: "bg-amber-500/15 text-amber-800 dark:text-amber-200",
  breached: "bg-red-500/12 text-red-700 dark:text-red-300",
  paused: "bg-surface-muted text-ink-muted",
  met: "bg-status-resolved/12 text-status-resolved",
};

/** A live countdown for one SLA clock, in business time. */
export function SlaChip({ clock, measuredAt, timeZone, now }: SlaChipProps) {
  const live = advanceRunningClock(clock, new Date(measuredAt), now, timeZone);
  const tone = chipTone(live);

  return (
    <span
      data-tone={tone}
      className={classNames(
        "relative z-10 inline-flex h-5 shrink-0 items-center rounded-md px-1.5 text-xs font-medium whitespace-nowrap tabular-nums",
        toneClasses[tone],
      )}
    >
      {chipText(live)}
    </span>
  );
}

/** A target such as 60 minutes, written as "1h". */
export function formatSlaTarget(minutes: number): string {
  if (minutes % 60 === 0) {
    return `${minutes / 60}h`;
  }
  return formatDuration(minutes);
}

function chipTone(clock: SlaClock): ChipTone {
  if (clock.state === "paused") {
    return "paused";
  }
  if (clock.state === "breached") {
    return "breached";
  }
  if (clock.state === "met") {
    return "met";
  }
  return clock.targetMinutes - clock.elapsedMinutes < 60 ? "amber" : "neutral";
}

function chipText(clock: SlaClock): string {
  if (clock.state === "paused") {
    return "Paused";
  }
  if (clock.state === "met") {
    return "Met";
  }
  if (clock.state === "breached") {
    return `Breached ${formatDuration(clock.elapsedMinutes - clock.targetMinutes)} ago`;
  }
  return `${formatDuration(clock.targetMinutes - clock.elapsedMinutes)} left`;
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours <= 0) {
    return `${rest}m`;
  }
  return `${hours}h ${String(rest).padStart(2, "0")}m`;
}
