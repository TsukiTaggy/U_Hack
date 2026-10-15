import { Fragment } from "react";

// Coach replies are LLM text. Render only inline `code` and **bold** as React elements (never as HTML),
// so Markdown markers do not show up as raw backticks or asterisks.
const INLINE = /(`[^`\n]+`|\*\*[^*\n]+\*\*)/g;

export function CoachText({ text }: { text: string }) {
  return (
    <p className="whitespace-pre-wrap text-sm leading-relaxed">
      {text.split(INLINE).map((part, i) => {
        if (part.length > 2 && part.startsWith("`") && part.endsWith("`")) {
          return (
            <code key={i} className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-[0.85em] dark:bg-zinc-800">
              {part.slice(1, -1)}
            </code>
          );
        }
        if (part.length > 4 && part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </p>
  );
}
