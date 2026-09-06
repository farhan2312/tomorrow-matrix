import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft, Sparkles, Users, Layers, Network as NetIcon, AlertTriangle,
  Store, Coins, Map as MapIcon, Trophy, BookOpen, Camera, Play,
} from "lucide-react";
import terraGlobe from "@/assets/terra-globe.png";
import card1 from "@/assets/cards/M01/1.webp";
import card2 from "@/assets/cards/M01/2.webp";
import card3 from "@/assets/cards/M01/3.webp";

export const Route = createFileRoute("/how-to-play")({
  head: () => ({
    meta: [
      { title: "How to Play, Tomorrow Matrix" },
      { name: "description", content: "A complete guide to playing The Tomorrow Matrix, restore Terra to 70% health by 2050." },
    ],
  }),
  component: HowToPlay,
});

const SECTIONS = [
  { id: "goal", label: "The Goal", icon: Trophy },
  { id: "start", label: "Getting Started", icon: Play },
  { id: "role", label: "Your Role", icon: Users },
  { id: "mysteries", label: "Solving Mysteries", icon: Layers },
  { id: "network", label: "Butterfly Network", icon: NetIcon },
  { id: "crises", label: "Crises", icon: AlertTriangle },
  { id: "market", label: "Interventions", icon: Store },
  { id: "cap", label: "Climate Action Points", icon: Coins },
  { id: "map", label: "Map & Dashboard", icon: MapIcon },
  { id: "multi", label: "Multiplayer", icon: Users },
  { id: "tips", label: "Tips", icon: Sparkles },
];

/** Placeholder figure for a screenshot the team will drop in later.
 *  When src is provided it renders the image; otherwise a labeled slot. */
function Shot({ name, caption }: { name: string; caption: string }) {
  return (
    <figure className="my-4 overflow-hidden rounded-xl border border-border bg-muted/40">
      <div className="grid aspect-[16/9] place-items-center bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,color-mix(in_oklab,var(--foreground)_4%,transparent)_10px,color-mix(in_oklab,var(--foreground)_4%,transparent)_20px)]">
        <div className="flex flex-col items-center gap-1 text-muted-foreground">
          <Camera className="h-6 w-6" />
          <span className="text-xs font-medium">Screenshot: {name}</span>
        </div>
      </div>
      <figcaption className="border-t border-border px-3 py-2 text-xs text-muted-foreground">{caption}</figcaption>
    </figure>
  );
}

function Section({ id, title, icon: Icon, children }: { id: string; title: string; icon: typeof Trophy; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-border pt-10">
      <h2 className="flex items-center gap-2 font-display text-2xl font-semibold tracking-tight">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-[color:var(--terra-soft)] text-[color:var(--terra-deep)]">
          <Icon className="h-4 w-4" />
        </span>
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-sm leading-relaxed text-foreground/90">{children}</div>
    </section>
  );
}

function HowToPlay() {
  const [active, setActive] = useState("goal");
  return (
    <main className="min-h-screen bg-background">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <img src="/icon-512.png" alt="Tomorrow Matrix" className="h-8 w-8 object-contain" />
          <span className="font-display text-base font-semibold">Tomorrow Matrix</span>
        </Link>
        <Link to="/mode-select" className="inline-flex items-center gap-1.5 rounded-lg bg-[image:var(--gradient-terra)] px-4 py-2 text-sm font-medium text-white">
          <Play className="h-4 w-4" /> Play now
        </Link>
      </nav>

      {/* hero */}
      <header className="mx-auto max-w-6xl px-6 pb-6 pt-4 text-center">
        <img src={terraGlobe} alt="" className="mx-auto w-40 animate-float drop-shadow-[0_20px_40px_rgba(20,80,40,0.18)]" />
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight md:text-5xl">How to Play</h1>
        <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground">
          The Tomorrow Matrix is a living climate-strategy game. Terra, our planet, is at <strong className="text-foreground">40% health</strong>.
          You and your fellow stakeholders have until <strong className="text-foreground">2050</strong> to restore it to <strong className="text-foreground">70%</strong> by
          uncovering climate mysteries, understanding how everything connects, and turning small actions into global change.
        </p>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-8 lg:grid-cols-[220px_1fr]">
        {/* table of contents */}
        <aside className="hidden lg:block">
          <div className="sticky top-6 space-y-1">
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">On this page</div>
            {SECTIONS.map((s) => (
              <a key={s.id} href={`#${s.id}`} onClick={() => setActive(s.id)}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${active === s.id ? "bg-[color:var(--terra-soft)] text-[color:var(--terra-deep)]" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                <s.icon className="h-3.5 w-3.5" /> {s.label}
              </a>
            ))}
          </div>
        </aside>

        {/* content */}
        <article className="min-w-0">
          <Section id="goal" title="The Goal" icon={Trophy}>
            <p>Every game centers on one number: <strong>Terra Health</strong>, shown as a percentage in the top bar. It starts at 40%. Your mission is to lift it to <strong>70% before the year 2050</strong>.</p>
            <p>Terra Health is driven by five interconnected <strong>indicators</strong>, Climate, Food, Water, Biodiversity, and Economy. Improving one often ripples into the others (sometimes for better, sometimes worse), which is the heart of the game.</p>
            <Shot name="Game HUD (top bar)" caption="The top bar shows Terra Health, the current Year, and your Climate Action Points (CAP)." />
          </Section>

          <Section id="start" title="Getting Started" icon={Play}>
            <p>From the landing page, enter Terra as a guest or sign in to save your progress across devices. Then pick <strong>how you want to play</strong>:</p>
            <ul className="ml-5 list-disc space-y-1">
              <li><strong>Solo Mode</strong>, play through every mystery on your own. Best for first-timers.</li>
              <li><strong>Solo with AI Team</strong>, recruit AI stakeholders who each offer their perspective.</li>
              <li><strong>Multiplayer</strong>, 2–6 players share one Terra and solve together.</li>
              <li><strong>Workshop / Facilitator</strong>, run a guided session for a room, pacing crises and watching analytics live.</li>
            </ul>
            <Shot name="Mode select screen" caption="Choose how you play: Solo, Solo with AI Team, Multiplayer, or Workshop." />
          </Section>

          <Section id="role" title="Your Role" icon={Users}>
            <p>You play as one of <strong>8 stakeholders</strong>, Scientist, Farmer, Policymaker, Activist, Business Leader, City Planner, Community Representative, or Student. Each role sees a unique slice of the data and gets a bonus for mysteries in its domain.</p>
            <p>When you pick a role you'll answer a short <strong>role orientation challenge</strong> (a few true/false and multiple-choice questions). Correct answers earn bonus CAP, and every answer teaches something real about climate systems.</p>
            <Shot name="Role select + orientation" caption="Pick your stakeholder, then answer the orientation questions to earn starting CAP." />
          </Section>

          <Section id="mysteries" title="Solving Mysteries" icon={Layers}>
            <p>Mysteries are the core of the game, there are <strong>66 of them</strong> across four tiers of increasing difficulty. Each mystery tells a climate "story" as a chain of cause and effect.</p>
            <p>To solve one, you're given <strong>8 full-art cards</strong>, shuffled. Drag them into the correct order, from the <strong>first cause</strong> to the <strong>final impact</strong>, then hit <strong>Validate sequence</strong>. Get it right to earn Climate Action Points and reveal how the chain ripples across Terra.</p>
            <div className="my-4 rounded-xl border border-border bg-muted/30 p-4">
              <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Example, the first three cards of "Arctic Ice Loss"</div>
              <div className="flex flex-wrap gap-3">
                {[card1, card2, card3].map((c, i) => (
                  <div key={i} className="relative">
                    <img src={c} alt={`Card ${i + 1}`} className="h-32 w-32 rounded-xl border border-white/15 object-cover shadow" />
                    <span className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-black/50 font-mono text-[10px] text-white">{i + 1}</span>
                  </div>
                ))}
                <div className="grid h-32 w-16 place-items-center rounded-xl border border-dashed border-border text-2xl text-muted-foreground">…</div>
              </div>
            </div>
            <p><strong>Stuck?</strong> Use a <strong>Hint</strong> (costs a little CAP) to reveal a card that's out of place, or <strong>Shuffle</strong> to reset. Fewer attempts and fewer hints = a higher score.</p>
            <Shot name="Card sequence puzzle" caption="Drag the 8 cards into the correct cause-to-impact order, then Validate." />
          </Section>

          <Section id="network" title="The Butterfly Network" icon={NetIcon}>
            <p>Nothing on Terra happens in isolation, that's the <strong>butterfly effect</strong>. Solving one mystery can unlock others and shift indicators far away. The <strong>Butterfly Network</strong> view maps these connections so you can plan which chains to tackle first.</p>
            <Shot name="Butterfly Network view" caption="See how mysteries connect and cascade across the planet." />
          </Section>

          <Section id="crises" title="Crises" icon={AlertTriangle}>
            <p>As the years advance, <strong>crises</strong> can strike, floods, heatwaves, supply shocks. When a crisis appears, you'll be prompted to respond; your choice affects Terra's indicators. Responding quickly and wisely limits the damage (and can even create positive turning points).</p>
            <Shot name="Crisis prompt" caption="Respond to crises as they emerge, each choice ripples through Terra's health." />
          </Section>

          <Section id="market" title="Interventions" icon={Store}>
            <p>Spend your Climate Action Points in the <strong>Marketplace</strong> on <strong>interventions</strong>, real-world solutions across energy, water, food, nature, cities, economy, society, and AI. Each intervention heals specific indicators. Building the right mix is how you push Terra toward 70%.</p>
            <Shot name="Marketplace / interventions" caption="Invest CAP in interventions that restore Terra's indicators." />
          </Section>

          <Section id="cap" title="Climate Action Points (CAP)" icon={Coins}>
            <p><strong>CAP</strong> is your currency. You earn it by:</p>
            <ul className="ml-5 list-disc space-y-1">
              <li>Solving mysteries (first-attempt solves pay the most, up to 100+ CAP).</li>
              <li>Answering role questions correctly.</li>
              <li>Handling crises well.</li>
            </ul>
            <p>You spend CAP on interventions and hints. Manage it like a budget, it's the bridge between understanding a problem and actually fixing it.</p>
          </Section>

          <Section id="map" title="Map & Dashboard" icon={MapIcon}>
            <p>The <strong>World Map</strong> shows Terra's regions and where crises are active. The <strong>Dashboard</strong> tracks your five indicators over time so you can see the impact of every decision. Check them often to decide where to focus next.</p>
            <Shot name="World map + dashboard" caption="Track regions on the map and indicator trends on the dashboard." />
          </Section>

          <Section id="multi" title="Multiplayer" icon={Users}>
            <p>In multiplayer, one player <strong>creates a session</strong> and shares the 6-character code (or QR). Up to <strong>6 players</strong> join, each picks a stakeholder, and you solve mysteries and vote on crises together on a shared Terra, live.</p>
            <Shot name="Multiplayer lobby" caption="Create or join a session with a code; play together in real time." />
          </Section>

          <Section id="tips" title="Tips for a High Score" icon={Sparkles}>
            <ul className="ml-5 list-disc space-y-1">
              <li>Solve on the <strong>first attempt</strong> when you can, hints and retries cost CAP.</li>
              <li>Lean into your role's <strong>priority mysteries</strong> for bonus CAP.</li>
              <li>Read the <strong>Butterfly Network</strong> before diving in, some chains unlock many others.</li>
              <li>Don't hoard CAP, timely <strong>interventions</strong> compound over the years.</li>
              <li>Respond to <strong>crises</strong> fast; delays deepen the damage.</li>
              <li>Tap any underlined term to open the in-game <strong>glossary</strong>.</li>
            </ul>
          </Section>

          <div className="mt-12 flex flex-col items-center gap-3 rounded-2xl border border-border bg-[color:var(--terra-soft)]/40 p-8 text-center">
            <BookOpen className="h-6 w-6 text-[color:var(--terra-deep)]" />
            <h3 className="font-display text-xl font-semibold">Ready to restore Terra?</h3>
            <p className="max-w-md text-sm text-muted-foreground">The best way to learn is to play, you'll get a quick guided tour on your first game.</p>
            <Link to="/mode-select" className="mt-1 inline-flex items-center gap-2 rounded-xl bg-[image:var(--gradient-terra)] px-6 py-3 text-sm font-medium text-white">
              <Play className="h-4 w-4" /> Start playing
            </Link>
          </div>
        </article>
      </div>
    </main>
  );
}
