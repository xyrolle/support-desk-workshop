/** Joins class names, skipping empty and false values. */
export function classNames(...names: Array<string | false | null | undefined>): string {
  return names.filter(Boolean).join(" ");
}

/** Base UI parts accept `className` as a function of their state; our wrappers take plain strings. */
export type WithClassName<Props> = Omit<Props, "className"> & { className?: string };
