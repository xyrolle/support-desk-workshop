import {
  createContext,
  createElement,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

const MINUTE_MS = 60_000;

/**
 * The current time, refreshed once a minute. One hook per page, so the rows
 * share a single interval, and it is cleared when the page unmounts.
 */
export function useNow(): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), MINUTE_MS);
    return () => clearInterval(timer);
  }, []);

  return now;
}

type SlaClockContextValue = {
  now: Date;
  timeZoneFor: (projectId: string) => string | undefined;
};

const SlaClockContext = createContext<SlaClockContextValue | null>(null);

/** The page's clock and each project's time zone, shared by every row. */
export function SlaClockProvider({
  now,
  timeZoneFor,
  children,
}: SlaClockContextValue & { children: ReactNode }) {
  return createElement(SlaClockContext.Provider, { value: { now, timeZoneFor } }, children);
}

export function useSlaClock(): SlaClockContextValue | null {
  return useContext(SlaClockContext);
}
