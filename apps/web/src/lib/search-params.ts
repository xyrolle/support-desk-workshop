type SearchParamValue = string | number | readonly (string | number)[] | undefined;

/** Builds URLSearchParams from a plain object, leaving out undefined values. Arrays are repeated. */
export function toSearchParams(values: Record<string, SearchParamValue>): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) {
      continue;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        params.append(key, String(item));
      }
    } else {
      params.set(key, String(value));
    }
  }
  return params;
}
