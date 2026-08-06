import { useMemo, useState } from "react";
import glossaryData from "@/lib/game/glossary.data.json";

interface Term { id: string; term: string; def: string; category: string }
const TERMS = (glossaryData as Term[]);
// Build regex matching whole-word terms (longest first). Case-insensitive.
const SORTED = [...TERMS].sort((a, b) => b.term.length - a.term.length);
const TERM_RX = new RegExp(
  `\\b(${SORTED.map((t) => t.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`,
  "gi",
);
const BY_LC = new Map(TERMS.map((t) => [t.term.toLowerCase(), t]));

/** Renders text with glossary terms underlined + tap-to-explain tooltip. */
export function GlossaryText({ children, className }: { children: string; className?: string }) {
  const [open, setOpen] = useState<Term | null>(null);
  const parts = useMemo(() => {
    const out: (string | Term)[] = [];
    let last = 0;
    const text = children ?? "";
    let m: RegExpExecArray | null;
    TERM_RX.lastIndex = 0;
    while ((m = TERM_RX.exec(text)) !== null) {
      if (m.index > last) out.push(text.slice(last, m.index));
      const term = BY_LC.get(m[0].toLowerCase());
      if (term) out.push(term); else out.push(m[0]);
      last = m.index + m[0].length;
    }
    if (last < text.length) out.push(text.slice(last));
    return out;
  }, [children]);

  return (
    <span className={className}>
      {parts.map((p, i) =>
        typeof p === "string" ? (
          <span key={i}>{p}</span>
        ) : (
          <button
            key={i}
            onClick={() => setOpen(p)}
            title={p.def}
            className="underline decoration-dotted decoration-[color:var(--terra-deep)]/50 underline-offset-2 hover:decoration-solid"
          >
            {p.term}
          </button>
        ),
      )}
      {open && (
        <span
          role="dialog"
          className="fixed inset-0 z-[80] grid place-items-center bg-background/70 p-4 backdrop-blur-md"
          onClick={() => setOpen(null)}
        >
          <span
            className="max-w-md rounded-2xl border border-border/60 bg-background p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">{open.category}</span>
            <span className="mt-1 block font-display text-lg font-semibold">{open.term}</span>
            <span className="mt-2 block text-sm text-muted-foreground">{open.def}</span>
            <button
              onClick={() => setOpen(null)}
              className="mt-4 rounded-md bg-muted px-3 py-1 text-xs font-medium"
            >
              Close
            </button>
          </span>
        </span>
      )}
    </span>
  );
}
