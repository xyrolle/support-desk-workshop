import type { SnippetPart } from "@support-desk/shared";

/** Markers around a highlighted word. They are not characters ticket text uses. */
export const snippetMarkers = {
  start: "\u0001",
  end: "\u0002",
};

/**
 * Turns typed text into an FTS5 query. Every word must match as a prefix.
 * Words are quoted so characters like `-` and `"` stay data, and `*` sits
 * outside the quotes. A value with no letter or number cannot be searched.
 */
export function toFtsQuery(input: string): string | undefined {
  const words = input.split(/\s+/).filter((word) => /[\p{L}\p{N}]/u.test(word));
  if (words.length === 0) {
    return undefined;
  }
  return words.map((word) => `"${word.replaceAll('"', '""')}"*`).join(" ");
}

/** Splits an FTS5 snippet into text parts. The API never returns markup. */
export function snippetParts(raw: string): SnippetPart[] {
  const parts: SnippetPart[] = [];
  let highlighted = false;
  let text = "";

  function flush() {
    if (text.length === 0) {
      return;
    }
    parts.push({ text, highlighted });
    text = "";
  }

  for (const char of raw) {
    if (char === snippetMarkers.start) {
      flush();
      highlighted = true;
      continue;
    }
    if (char === snippetMarkers.end) {
      flush();
      highlighted = false;
      continue;
    }
    text += char;
  }
  flush();
  return parts;
}
