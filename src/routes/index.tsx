import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Sparkles, Network as NetIcon, Map as MapIcon, AlertTriangle, LogIn, UserCircle } from "lucide-react";
import { useGame } from "@/lib/game/store";
import { supabase } from "@/integrations/supabase/client";
import terraGlobe from "@/assets/terra-globe.jpg";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Tomorrow Matrix, A Living Climate System Game" },
      { name: "description", content: "Restore Terra to 70% before 2050. Solve climate mysteries, respond to crises, and shape the planet's future." },
      { property: "og:title", content: "The Tomorrow Matrix" },
      { property: "og:description", content: "One Planet. Many Choices. Our Future." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();
  const { setPlayer, reset } = useGame();
  const role = useGame((s) => s.role);
  const [name, setName] = useState("");
  const [signedIn, setSignedIn] = useState<null | { email: string | null; display: string | null; avatar: string | null }>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        // First-time / signed-out landing
        import("@/lib/voice/store").then((m) => m.narrate("OB-01"));
        return;
      }
      const meta = data.user.user_metadata ?? {};
      const { data: prof } = await supabase.from("profiles").select("display_name, avatar_url").eq("id", data.user.id).maybeSingle();
      const dn = prof?.display_name ?? meta.full_name ?? meta.name ?? null;
      setSignedIn({
        email: data.user.email ?? null,
        display: dn,
        avatar: prof?.avatar_url ?? meta.avatar_url ?? meta.picture ?? null,
      });
      if (dn) setName((n) => n || dn);
      import("@/lib/voice/store").then((m) => m.narrate("OB-02"));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) { setSignedIn(null); return; }
      const meta = session.user.user_metadata ?? {};
      const dn = meta.full_name ?? meta.name ?? null;
      setSignedIn({
        email: session.user.email ?? null,
        display: dn,
        avatar: meta.avatar_url ?? meta.picture ?? null,
      });
      if (dn) setName((n) => n || dn);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const startGuest = () => {
    reset();
    setPlayer(name.trim() || signedIn?.display || signedIn?.email?.split("@")[0] || "Guest");
    navigate({ to: "/mode-select" });
  };

  return (
    <main className="min-h-screen overflow-hidden bg-background">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <img src="/icon-512.png" alt="Tomorrow Matrix" className="h-8 w-8 object-contain" />
          <span className="font-display text-base font-semibold">Tomorrow Matrix</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="#how" className="text-sm text-muted-foreground hover:text-foreground">How it works</a>
          {signedIn ? (
            <Link to="/account" className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-[color:var(--terra-deep)]">
              {signedIn.avatar
                ? <img src={signedIn.avatar} alt="" referrerPolicy="no-referrer" className="h-5 w-5 rounded-full object-cover" />
                : <UserCircle className="h-4 w-4" />}
              {signedIn.display || signedIn.email || "Account"}
            </Link>
          ) : (
            <Link to="/auth" className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-[color:var(--terra-deep)]">
              <LogIn className="h-4 w-4" /> Sign in
            </Link>
          )}
        </div>
      </nav>

      <section className="relative mx-auto grid max-w-7xl gap-10 px-6 pb-20 pt-8 md:grid-cols-2 md:gap-16 md:pt-16">
        <div className="flex flex-col justify-center">
          <span className="pill chip-terra w-fit">
            <Sparkles className="h-3 w-3" /> A living climate system game
          </span>
          <h1 className="mt-5 font-display text-5xl font-semibold leading-[1.05] tracking-tight text-foreground md:text-6xl">
            One Planet.<br/>
            <span className="bg-[image:var(--gradient-terra)] bg-clip-text text-transparent">Many Choices.</span><br/>
            Our Future.
          </h1>
          <p className="mt-5 max-w-md text-base text-muted-foreground md:text-lg">
            Terra is at 40% health. You and your stakeholders have until 2050 to restore it to 70%.
            Investigate mysteries, navigate crises, and watch every choice ripple across the planet.
          </p>

          {signedIn && role && (
            <button
              onClick={() => navigate({ to: "/play" })}
              className="mt-7 inline-flex h-12 w-full max-w-md items-center justify-center gap-2 rounded-xl bg-[image:var(--gradient-terra)] px-5 text-sm font-medium text-white shadow-sm transition-transform hover:scale-[1.01]"
            >
              Continue your game <ArrowRight className="h-4 w-4" />
            </button>
          )}

          <form
            onSubmit={(e) => { e.preventDefault(); startGuest(); }}
            className={`${signedIn && role ? "mt-3" : "mt-7"} flex w-full max-w-md flex-col gap-2 sm:flex-row`}
          >
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Choose a player name (optional)"
              className="h-12 flex-1 rounded-xl border border-input bg-card px-4 text-sm outline-none ring-ring/30 transition-all focus:border-[color:var(--terra)] focus:ring-2"
            />
            <button
              type="submit"

              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[image:var(--gradient-terra)] px-5 text-sm font-medium text-white shadow-sm transition-transform hover:scale-[1.02]"
            >
              {signedIn && role ? "Start new game" : "Enter Terra"} <ArrowRight className="h-4 w-4" />
            </button>
          </form>
          {signedIn ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Signed in, your profile and game progress sync to your account across devices.
            </p>
          ) : (
            <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-[color:var(--warmth)]" />
              <span>Guest mode: progress is saved only on this device.{" "}
                <Link to="/auth" className="text-[color:var(--terra-deep)] underline">Sign in</Link> to save a profile that follows you.
              </span>
            </p>
          )}

          <div className="mt-10 grid grid-cols-3 gap-4 border-t border-border pt-6 text-sm">
            <Stat icon={Sparkles} label="Mysteries" value="60+" />
            <Stat icon={MapIcon}  label="Regions"   value="12" />
            <Stat icon={NetIcon}  label="Stakeholders" value="8" />
          </div>

        </div>

        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 -z-10 rounded-full bg-[radial-gradient(circle_at_center,var(--terra-soft),transparent_60%)]" />
          <img
            src={terraGlobe}
            alt="Planet Terra, half lush and half struggling, your mission begins here"
            width={1024}
            height={1024}
            className="w-full max-w-lg animate-float drop-shadow-[0_30px_60px_rgba(20,80,40,0.18)]"
          />
        </div>
      </section>

      <section id="how" className="mx-auto max-w-7xl px-6 pb-24">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { n: "01", t: "Choose Your Role", d: "Scientist, Farmer, Activist… each role sees a unique piece of the puzzle." },
            { n: "02", t: "Discover Alerts",  d: "Explore Terra's world map and find regions in crisis." },
            { n: "03", t: "Solve Mysteries",  d: "Connect causes, actions and impacts to unlock Climate Action Points." },
            { n: "04", t: "Restore Terra",    d: "Invest in interventions, respond to crises, and watch the planet heal." },
          ].map((s) => (
            <div key={s.n} className="surface-card p-5">
              <div className="font-mono text-xs text-[color:var(--terra-deep)]">{s.n}</div>
              <div className="mt-2 font-display text-lg font-semibold">{s.t}</div>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} Tomorrow Matrix</span>
          <nav className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-foreground">Privacy Policy</Link>
            <Link to="/auth" className="hover:text-foreground">Sign in</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Sparkles; label: string; value: string }) {
  return (
    <div>
      <Icon className="h-4 w-4 text-[color:var(--terra-deep)]" />
      <div className="mt-1 font-display text-xl font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
