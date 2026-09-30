import ReactMarkdown, { type Components } from "react-markdown";

// Headings inside a message would break the page's outline, so they render as bold text.
const heading: Components["h1"] = ({ children }) => (
  <p className="mt-3 mb-1 font-semibold first:mt-0">{children}</p>
);

const components: Components = {
  // Messages come from email, where a single line break matters (signatures, addresses).
  p: ({ children }) => <p className="my-2 whitespace-pre-line first:mt-0 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="my-2 list-disc space-y-0.5 pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="my-2 list-decimal space-y-0.5 pl-5">{children}</ol>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent"
    >
      {children}
    </a>
  ),
  code: ({ children }) => (
    <code className="rounded bg-surface-muted px-1 py-0.5 font-mono text-[0.85em]">{children}</code>
  ),
  pre: ({ children }) => (
    <pre className="my-2 overflow-x-auto rounded-md border border-line bg-surface-subtle p-3 font-mono text-xs leading-relaxed [&>code]:bg-transparent [&>code]:p-0 [&>code]:text-[1em]">
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-2 border-l-2 border-line pl-3 text-ink-muted">{children}</blockquote>
  ),
  h1: heading,
  h2: heading,
  h3: heading,
  h4: heading,
};

/**
 * Renders Markdown written by customers and teammates. react-markdown's defaults never
 * render raw HTML and drop unsafe link protocols, so customer text stays inert.
 */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="text-base leading-relaxed break-words text-ink">
      <ReactMarkdown components={components}>{children}</ReactMarkdown>
    </div>
  );
}
