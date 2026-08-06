import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, BookmarkPlus, BookmarkCheck, Star, Clock, X, Sparkles } from "lucide-react";
import glossaryData from "@/lib/game/glossary.data.json";
import { useAudioPrefs } from "@/lib/voice/store";
import { cn } from "@/lib/utils";

interface Term { id: string; term: string; def: string; example: string; category: string; n: number }
const TERMS = glossaryData as Term[];
const CATEGORIES = Array.from(new Set(TERMS.map((t) => t.category))).sort();
const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export const Route = createFileRoute("/play/knowledge")({
  head: () => ({
    meta: [
      { title: "Terra Knowledge Hub — Tomorrow Matrix" },
      { name: "description", content: "Your in-game encyclopedia — every climate term, mystery, and mechanic." },
    ],
  }),
  component: KnowledgeHub,
});

function KnowledgeHub() {
  const { bookmarks, recent, bookmark, unbookmark, markRecent } = useAudioPrefs();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [letter, setLetter] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TERMS.filter((t) => {
      if (cat && t.category !== cat) return false;
      if (letter && !t.term.toUpperCase().startsWith(letter)) return false;
      if (!q) return true;
      return t.term.toLowerCase().includes(q) || t.def.toLowerCase().includes(q);
    });
  }, [query, cat, letter]);

  const popular = useMemo(() => TERMS.slice(0, 6), []);
  const recentTerms = recent.map((id) => TERMS.find((t) => t.id === id)).filter(Boolean) as Term[];
  const bookmarked = bookmarks.map((id) => TERMS.find((t) => t.id === id)).filter(Boolean) as Term[];
  const open = openId ? TERMS.find((t) => t.id === openId) ?? null : null;

  return (
    <main className="mx-auto max-w-[1400px] space-y-6 px-4 py-6 md:px-6">
      <header>
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Encyclopedia · {TERMS.length} terms</div>
        <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Terra Knowledge Hub</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Every climate concept, mystery, mechanic, and framework you'll meet in Terra — cross-linked and searchable.
        </p>
      </header>

      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search terms, definitions, mysteries…"
          className="w-full rounded-2xl border border-border/60 bg-background/60 py-3.5 pl-11 pr-4 text-sm shadow-sm backdrop-blur-xl focus:border-[color:var(--terra-deep)] focus:outline-none"
        />
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        <Chip active={!cat} onClick={() => setCat(null)}>All · {TERMS.length}</Chip>
        {CATEGORIES.map((c) => (
          <Chip key={c} active={cat === c} onClick={() => setCat(cat === c ? null : c)}>
            {c} · {TERMS.filter((t) => t.category === c).length}
          </Chip>
        ))}
      </div>

      {/* Alpha nav */}
      <div className="flex flex-wrap items-center gap-1 text-xs">
        <span className="mr-2 text-muted-foreground">A–Z</span>
        <button onClick={() => setLetter(null)} className={cn("rounded px-1.5 py-0.5", !letter && "bg-muted font-semibold")}>All</button>
        {ALPHA.map((L) => {
          const has = TERMS.some((t) => t.term.toUpperCase().startsWith(L));
          return (
            <button key={L} disabled={!has} onClick={() => setLetter(letter === L ? null : L)}
              className={cn("rounded px-1.5 py-0.5", letter === L ? "bg-[color:var(--terra-soft)] text-[color:var(--terra-deep)] font-semibold" : has ? "text-foreground hover:bg-muted" : "text-muted-foreground/30")}>
              {L}
            </button>
          );
        })}
      </div>

      {/* Sidebars */}
      {(recentTerms.length > 0 || bookmarked.length > 0) && (
        <div className="grid gap-4 md:grid-cols-3">
          <SidePanel title="Popular" icon={<Star className="h-4 w-4" />}>
            {popular.map((t) => <SideItem key={t.id} term={t} onOpen={() => { setOpenId(t.id); markRecent(t.id); }} />)}
          </SidePanel>
          {recentTerms.length > 0 && (
            <SidePanel title="Recently Viewed" icon={<Clock className="h-4 w-4" />}>
              {recentTerms.slice(0, 6).map((t) => <SideItem key={t.id} term={t} onOpen={() => { setOpenId(t.id); markRecent(t.id); }} />)}
            </SidePanel>
          )}
          {bookmarked.length > 0 && (
            <SidePanel title="My Learning · Bookmarks" icon={<BookmarkCheck className="h-4 w-4" />}>
              {bookmarked.slice(0, 6).map((t) => <SideItem key={t.id} term={t} onOpen={() => { setOpenId(t.id); markRecent(t.id); }} />)}
            </SidePanel>
          )}
        </div>
      )}

      {/* Grid */}
      <section>
        <div className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "term" : "terms"}
        </div>
        {filtered.length === 0 ? (
          <div className="surface-card grid place-items-center p-10 text-sm text-muted-foreground">
            No terms match your search.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((t) => (
              <TermCard
                key={t.id}
                term={t}
                bookmarked={bookmarks.includes(t.id)}
                onToggleBookmark={() => (bookmarks.includes(t.id) ? unbookmark(t.id) : bookmark(t.id))}
                onOpen={() => { setOpenId(t.id); markRecent(t.id); }}
              />
            ))}
          </div>
        )}
      </section>

      {open && (
        <TermDetail
          term={open}
          bookmarked={bookmarks.includes(open.id)}
          onToggleBookmark={() => (bookmarks.includes(open.id) ? unbookmark(open.id) : bookmark(open.id))}
          onClose={() => setOpenId(null)}
          onNavigate={(id) => { setOpenId(id); markRecent(id); }}
        />
      )}
    </main>
  );
}

function Chip({ active, children, onClick }: { active?: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn(
      "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
      active
        ? "border-transparent bg-[color:var(--terra-deep)] text-white shadow-sm"
        : "border-border/60 bg-background/60 text-muted-foreground hover:bg-muted backdrop-blur-xl",
    )}>{children}</button>
  );
}

function SidePanel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="surface-card p-4">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}{title}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function SideItem({ term, onOpen }: { term: Term; onOpen: () => void }) {
  return (
    <button onClick={onOpen} className="block w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted">
      <span className="line-clamp-1 font-medium">{term.term}</span>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{term.category}</span>
    </button>
  );
}

function TermCard({ term, bookmarked, onToggleBookmark, onOpen }: {
  term: Term; bookmarked: boolean; onToggleBookmark: () => void; onOpen: () => void;
}) {
  return (
    <div className="surface-card group relative flex flex-col p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between gap-2">
        <span className="rounded-full bg-[color:var(--terra-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--terra-deep)]">
          {term.category}
        </span>
        <button
          onClick={onToggleBookmark}
          className={cn("rounded-md p-1 transition-colors", bookmarked ? "text-[color:var(--warmth)]" : "text-muted-foreground hover:text-foreground")}
          aria-label={bookmarked ? "Remove bookmark" : "Bookmark term"}
        >
          {bookmarked ? <BookmarkCheck className="h-4 w-4" /> : <BookmarkPlus className="h-4 w-4" />}
        </button>
      </div>
      <button onClick={onOpen} className="mt-2 text-left">
        <h3 className="font-display text-base font-semibold tracking-tight group-hover:text-[color:var(--terra-deep)]">{term.term}</h3>
        <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">{term.def}</p>
      </button>
    </div>
  );
}

function TermDetail({ term, bookmarked, onToggleBookmark, onClose, onNavigate }: {
  term: Term; bookmarked: boolean; onToggleBookmark: () => void; onClose: () => void; onNavigate: (id: string) => void;
}) {
  const related = useMemo(() => {
    const own = term.term.toLowerCase();
    const tokens = own.split(/\s+/).filter((w) => w.length > 3);
    return TERMS.filter((t) => t.id !== term.id && (
      t.category === term.category ||
      tokens.some((tok) => t.term.toLowerCase().includes(tok) || t.def.toLowerCase().includes(tok))
    )).slice(0, 6);
  }, [term]);

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-background/70 p-4 backdrop-blur-md" onClick={onClose}>
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-border/60 bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-[image:var(--gradient-terra)] p-6 text-white">
          <button onClick={onClose} className="absolute right-4 top-4 rounded-full bg-white/15 p-1.5 backdrop-blur hover:bg-white/25" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
          <div className="text-[10px] uppercase tracking-[0.2em] opacity-80">{term.category}</div>
          <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight">{term.term}</h2>
          <button
            onClick={onToggleBookmark}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur hover:bg-white/25"
          >
            {bookmarked ? <BookmarkCheck className="h-3.5 w-3.5" /> : <BookmarkPlus className="h-3.5 w-3.5" />}
            {bookmarked ? "Bookmarked" : "Bookmark"}
          </button>
        </div>

        <div className="max-h-[60vh] space-y-5 overflow-y-auto p-6">
          <section>
            <h3 className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Definition</h3>
            <p className="text-sm leading-relaxed text-foreground">{term.def}</p>
          </section>
          {term.example && (
            <section className="rounded-xl bg-muted/60 p-4">
              <h3 className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <Sparkles className="mr-1 inline h-3 w-3" /> In everyday terms
              </h3>
              <p className="text-sm italic text-muted-foreground">{term.example.replace(/^Example:\s*/i, "")}</p>
            </section>
          )}
          {related.length > 0 && (
            <section>
              <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Related terms</h3>
              <div className="flex flex-wrap gap-2">
                {related.map((r) => (
                  <button key={r.id} onClick={() => onNavigate(r.id)} className="rounded-full border border-border/60 bg-background px-3 py-1 text-xs hover:bg-muted">
                    {r.term}
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
