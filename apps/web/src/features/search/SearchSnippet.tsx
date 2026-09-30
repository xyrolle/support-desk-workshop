import type { SnippetPart } from "@support-desk/shared";

/** Renders a search passage. Highlighted parts are elements, never HTML from the ticket. */
export function SearchSnippet({ parts }: { parts: SnippetPart[] }) {
  let offset = 0;
  return (
    <p className="truncate text-ink-muted">
      {parts.map((part) => {
        const key = offset;
        offset += part.text.length;
        return part.highlighted ? (
          <mark key={key} className="bg-accent/15 text-ink">
            {part.text}
          </mark>
        ) : (
          <span key={key}>{part.text}</span>
        );
      })}
    </p>
  );
}
