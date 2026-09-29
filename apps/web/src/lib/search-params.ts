type SearchParamValue = string | number | undefined;

/** Builds URLSearchParams from a plain object, leaving out undefined values. */
export function toSearchParams(values: Record<string, SearchParamValue>): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined) {
      params.set(key, String(value));
    }
  }
  return params;
}
