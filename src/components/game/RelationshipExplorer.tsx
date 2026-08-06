import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronDown, X, Sparkles, ArrowRight, BookOpen, Lightbulb, Network } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Mystery } from "@/lib/game/types";
import { MYSTERIES } from "@/lib/game/data";
import {
  findLinkage, mysteryByCode, plainEnglish, systemsInsight, fullCascade, incomingCodes, outgoingCodes,
  type Linkage,
} from "@/lib/game/linkages";

interface Props {
  fromCode: string | null;
  toCode: string | null;
  onClose: () => void;
  onNavigate: (fromCode: string, toCode: string) => void;
}

export function RelationshipExplorer({ fromCode, toCode, onClose, onNavigate }: Props) {
  const open = !!(fromCode && toCode);
  const [plain, setPlain] = useState(false);
  const [cascade, setCascade] = useState<string[] | null>(null);
  const [key, setKey] = useState(0);

  useEffect(() => { setPlain(false); setCascade(null); setKey((k) => k + 1); }, [fromCode, toCode]);

  const from = fromCode ? mysteryByCode(fromCode) : null;
  const linkage = fromCode && toCode ? findLinkage(fromCode, toCode) : undefined;
  const to = toCode?.startsWith("M") ? mysteryByCode(toCode) : null;
  const toDisplayName = to?.title ?? linkage?.toName ?? toCode ?? "";

  const outgoing = useMemo(
    () => (fromCode ? outgoingCodes(fromCode).map(mysteryByCode).filter(Boolean) as Mystery[] : []),
    [fromCode],
  );
  const incoming = useMemo(
    () => (fromCode ? incomingCodes(fromCode).map(mysteryByCode).filter(Boolean) as Mystery[] : []),
    [fromCode],
  );

  if (!open || !from || !linkage) {
    // Dialog will still render; guard the interior.
    return (
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="max-w-md bg-slate-950 text-white border-white/10">
          <p className="p-6 text-sm text-white/70">No explanation available for this connection yet.</p>
        </DialogContent>
      </Dialog>
    );
  }

  const handleExplore = () => setCascade(fullCascade(fromCode!, 6));
  const handleGoto = (nextCode: string) => onNavigate(fromCode!, nextCode);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-6xl w-[96vw] max-h-[95vh] overflow-hidden p-0 gap-0 bg-slate-950 text-white border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 px-6 py-4">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/50">
              Butterfly Network · Relationship Explorer
            </div>
            <div className="mt-1 flex items-center gap-3 font-display text-xl">
              <span className="font-semibold">{from.title}</span>
              <ArrowRight className="h-5 w-5 text-emerald-300" />
              <span className="font-semibold">{toDisplayName}</span>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full bg-white/5 p-2 hover:bg-white/10">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div key={key} className="grid max-h-[calc(95vh-72px)] overflow-y-auto md:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] animate-[fade-in_0.35s_ease-out]">
          {/* LEFT — hero cards + connection */}
          <div className="space-y-4 border-b border-white/10 bg-gradient-to-b from-slate-900/60 to-slate-950 p-6 md:border-b-0 md:border-r">
            <HeroCard mystery={from} tag="Source" />
            <div className="flex flex-col items-center gap-2 py-2">
              <div className="h-8 w-0.5 bg-gradient-to-b from-emerald-400 to-transparent animate-pulse" />
              <ChevronDown className="h-6 w-6 text-emerald-300 animate-bounce" />
              <div className="rounded-full bg-emerald-500/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-emerald-300 ring-1 ring-emerald-400/30">
                {linkage.kind === "cascade" ? "Cascade" : linkage.kind === "soft" ? "Soft link" : "Direct driver"}
              </div>
              <div className="h-8 w-0.5 bg-gradient-to-b from-transparent to-emerald-400 animate-pulse" />
            </div>
            {to ? (
              <HeroCard mystery={to} tag="Target" />
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-white/50">Target</div>
                <div className="mt-1 font-display text-lg font-semibold">{toDisplayName}</div>
                <div className="mt-1 text-xs text-white/50">Compounding outcome (not a single card)</div>
              </div>
            )}

            {/* Neighbours */}
            {(incoming.length > 0 || outgoing.length > 0) && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs">
                <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/60">
                  <Network className="h-3 w-3" /> Related connections
                </div>
                {incoming.length > 0 && (
                  <div className="mb-2">
                    <div className="text-[10px] uppercase tracking-wider text-sky-300/70">Incoming</div>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {incoming.slice(0, 6).map((m) => (
                        <button key={m.id} onClick={() => onNavigate(m.code, from.code)}
                          className="rounded-full bg-sky-500/15 px-2 py-1 text-[10px] text-sky-200 ring-1 ring-sky-400/30 hover:bg-sky-500/25">
                          {m.code} · {m.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {outgoing.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-emerald-300/70">Outgoing</div>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {outgoing.slice(0, 6).map((m) => (
                        <button key={m.id} onClick={() => handleGoto(m.code)}
                          className={cn(
                            "rounded-full px-2 py-1 text-[10px] ring-1 hover:brightness-110",
                            m.code === toCode
                              ? "bg-amber-400/25 text-amber-100 ring-amber-300/50"
                              : "bg-emerald-500/15 text-emerald-200 ring-emerald-400/30",
                          )}>
                          {m.code} · {m.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT — explanation */}
          <div className="space-y-6 p-6">
            <Section title="Connection Explanation">
              <p className="text-sm leading-relaxed text-white/85">{linkage.explanation}</p>
            </Section>

            {linkage.chain && linkage.chain.length > 0 && (
              <Section title="Butterfly Cascade">
                <CascadeSteps steps={linkage.chain} />
                {!cascade && (
                  <button onClick={handleExplore}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-400/30 hover:bg-emerald-500/25">
                    <Sparkles className="h-3.5 w-3.5" /> Explore Full Cascade
                  </button>
                )}
                {cascade && (
                  <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-500/5 p-3">
                    <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-emerald-300/80">
                      Extended chain
                    </div>
                    <CascadeSteps
                      steps={cascade.map((c) => mysteryByCode(c)?.title ?? c)}
                      onClickStep={(i) => {
                        if (i > 0 && cascade[i]) handleGoto(cascade[i]);
                      }}
                    />
                  </div>
                )}
              </Section>
            )}

            <Section title="Why are these connected?" icon={<BookOpen className="h-3 w-3" />}>
              <p className="text-sm leading-relaxed text-white/85">
                {linkage.kind === "cascade" && linkage.chain
                  ? `The doc records a direct causal chain: ${linkage.chain.join(" → ")}. Each step is a documented consequence of the previous one.`
                  : linkage.kind === "soft"
                    ? `${from.title} doesn't unlock a specific card — it feeds ecological pressure into the nearest related mystery on the board.`
                    : `${from.title} is tagged as a direct upstream driver of ${toDisplayName}. Left unresolved, it removes a buffer that was holding ${toDisplayName} back.`}
              </p>
            </Section>

            <Section title="Systems Thinking" icon={<Network className="h-3 w-3" />}>
              <div className="rounded-xl border border-violet-400/20 bg-gradient-to-br from-violet-500/10 to-indigo-500/10 p-4 text-sm leading-relaxed text-white/85">
                {systemsInsight(from.title, toDisplayName)}
              </div>
            </Section>

            <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-4">
              <button onClick={() => setPlain((p) => !p)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition ring-1",
                  plain
                    ? "bg-amber-400/25 text-amber-100 ring-amber-300/50"
                    : "bg-white/5 text-white/80 ring-white/15 hover:bg-white/10",
                )}>
                <Lightbulb className="h-3.5 w-3.5" />
                {plain ? "Hide learning mode" : "Why does this happen?"}
              </button>
            </div>

            {plain && (
              <Section title="In plain English" icon={<Lightbulb className="h-3 w-3" />}>
                <div className="rounded-xl border border-amber-400/25 bg-amber-500/10 p-4 text-sm leading-relaxed text-amber-50 animate-[fade-in_0.3s_ease-out]">
                  {plainEnglish(linkage, from.title, toDisplayName)}
                </div>
              </Section>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/60">
        {icon} {title}
      </div>
      {children}
    </section>
  );
}

function HeroCard({ mystery, tag }: { mystery: Mystery; tag: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
      <div className="aspect-[16/9] bg-cover bg-center" style={{ backgroundImage: `url(${mystery.image})` }} />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4">
        <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-emerald-300/90">
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-white/80">{tag}</span>
          <span>{mystery.code} · Tier {mystery.tier}</span>
        </div>
        <div className="font-display text-lg font-semibold drop-shadow-md">{mystery.title}</div>
        <div className="mt-0.5 text-[11px] text-white/70">{mystery.region}</div>
      </div>
    </div>
  );
}

function CascadeSteps({ steps, onClickStep }: { steps: string[]; onClickStep?: (i: number) => void }) {
  return (
    <ol className="space-y-1.5">
      {steps.map((s, i) => (
        <li key={i}
          className="flex items-start gap-2 opacity-0 animate-[fade-in_0.4s_ease-out_forwards]"
          style={{ animationDelay: `${i * 120}ms` }}>
          <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-500/25 text-[10px] font-mono font-bold text-emerald-200 ring-1 ring-emerald-400/40">
            {i + 1}
          </span>
          <button
            onClick={() => onClickStep?.(i)}
            className={cn(
              "text-left text-sm text-white/85",
              onClickStep && "hover:text-emerald-200 hover:underline",
            )}
            disabled={!onClickStep}>
            {s}
          </button>
        </li>
      ))}
    </ol>
  );
}

/** Convenience: find any Mystery by code — re-export so callers don't need linkages module. */
export function mysteryFromCode(code: string) {
  return MYSTERIES.find((m) => m.code === code);
}
// keep Linkage type export handy
export type { Linkage };
