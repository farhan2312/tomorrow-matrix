import { Link, useRouterState } from "@tanstack/react-router";
import { Globe2, Map, Sparkles, Store, Library, LogOut, UserCircle2, Network, BookOpen, Settings } from "lucide-react";
import { useGame } from "@/lib/game/store";
import { ROLES } from "@/lib/game/data";
import { cn } from "@/lib/utils";

const nav: { to: string; label: string; icon: typeof Globe2; exact?: boolean }[] = [
  { to: "/play", label: "World Map", icon: Globe2, exact: true },
  { to: "/play/mysteries", label: "Mysteries", icon: Sparkles },
  { to: "/play/network", label: "Butterfly Network", icon: Network },
  { to: "/play/dashboard", label: "Dashboard", icon: Map },
  { to: "/play/role", label: "Role Center", icon: UserCircle2 },
  { to: "/play/marketplace", label: "Marketplace", icon: Store },
  { to: "/play/knowledge", label: "Knowledge Hub", icon: BookOpen },
  { to: "/play/archive", label: "Archive", icon: Library },
];

export function HudBar() {
  const { planetHealth, year, cap, role, playerName, reset } = useGame();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const roleData = ROLES.find((r) => r.id === role);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-4 px-4 md:px-6">
        <Link to="/play" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-[image:var(--gradient-terra)] text-white shadow-sm">
            <Globe2 className="h-4 w-4" />
          </div>
          <span className="font-display text-sm font-semibold tracking-tight">Tomorrow Matrix</span>
        </Link>

        <div className="ml-2 hidden items-center gap-1.5 md:flex">
          <Stat label="Terra" value={`${planetHealth}%`} tone={planetHealth >= 70 ? "good" : planetHealth >= 40 ? "warn" : "bad"} />
          <Stat label="Year" value={String(year)} />
          <Stat label="CAP" value={String(cap)} tone="terra" />
          {roleData && <Stat label="Role" value={roleData.name} />}
        </div>

        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          {nav.map((n) => {
            const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to as any}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "bg-[color:var(--terra-soft)] text-[color:var(--terra-deep)]"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-3.5 w-3.5" />{n.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-2">
          <span className="hidden text-xs text-muted-foreground md:inline">{playerName}</span>
          <Link
            to="/settings"
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Audio & voice settings"
          >
            <Settings className="h-3.5 w-3.5" />
          </Link>
          <button
            onClick={() => { reset(); window.location.href = "/"; }}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Exit session"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* mobile nav */}
      <nav className="flex items-center gap-1 overflow-x-auto border-t border-border px-3 py-2 lg:hidden">
        {nav.map((n) => {
          const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
          const Icon = n.icon;
          return (
            <Link key={n.to} to={n.to as any}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs",
                active ? "bg-[color:var(--terra-soft)] text-[color:var(--terra-deep)]" : "text-muted-foreground",
              )}>
              <Icon className="h-3.5 w-3.5" />{n.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "good" | "warn" | "bad" | "terra" }) {
  const toneClass =
    tone === "good"  ? "text-[color:var(--terra-deep)]" :
    tone === "warn"  ? "text-[color:var(--warmth)]" :
    tone === "bad"   ? "text-destructive" :
    tone === "terra" ? "text-[color:var(--terra-deep)]" :
                       "text-foreground";
  return (
    <div className="flex items-baseline gap-1 rounded-md bg-muted/60 px-2.5 py-1">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className={cn("font-mono text-xs font-semibold tabular-nums", toneClass)}>{value}</span>
    </div>
  );
}
