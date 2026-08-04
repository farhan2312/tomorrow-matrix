import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FRAMEWORK_CARDS } from "@/lib/strategy-data";

export function FrameworkCards({ tone = "#84994f" }: { tone?: string }) {
  const [open, setOpen] = useState<string | null>(FRAMEWORK_CARDS[0].id);
  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {FRAMEWORK_CARDS.map((f, i) => {
        const isOpen = open === f.id;
        return (
          <motion.div
            key={f.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            layout
            className="overflow-hidden rounded-2xl border bg-card shadow-soft"
            style={{ borderColor: isOpen ? `color-mix(in oklab, ${tone} 40%, var(--border))` : "var(--border)" }}
          >
            <button onClick={() => setOpen(isOpen ? null : f.id)} className="flex w-full items-center justify-between gap-4 p-5 text-left">
              <div>
                <div className="text-display text-xl">{f.name}</div>
                <div className="mt-1 text-[11px] text-muted-foreground">{f.purpose}</div>
              </div>
              <motion.span animate={{ rotate: isOpen ? 45 : 0 }} className="text-lg" style={{ color: tone }}>+</motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="space-y-2 border-t border-border p-5 text-xs">
                    <Row k="Who uses it" v={f.users} />
                    <Row k="Business value" v={f.value} />
                    <Row k="Integration" v={f.integration} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{k}</div>
      <div className="mt-0.5 text-foreground/85">{v}</div>
    </div>
  );
}
