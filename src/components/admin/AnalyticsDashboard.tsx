import { useEffect, useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Users, UserCheck, Gamepad2, Sparkles, Radio, Activity, Loader2, RefreshCw } from "lucide-react";
import { adminAnalytics } from "@/lib/admin/admin.functions";
import { ROLES } from "@/lib/game/data";

type Analytics = Awaited<ReturnType<typeof adminAnalytics>>;

const roleName = (id: string) => ROLES.find((r) => r.id === id)?.name ?? id;
const EVENT_LABEL: Record<string, string> = {
  login: "Logins", mystery_solved: "Mysteries solved", game_start: "Games started",
};

export function AnalyticsDashboard({ token }: { token: string }) {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true); setError(null);
    adminAnalytics({ data: { token } })
      .then(setData)
      .catch((e) => setError((e as Error).message || "Failed to load analytics."))
      .finally(() => setLoading(false));
  };
  useEffect(load, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <div className="grid place-items-center py-24"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  if (error) return <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">{error}</div>;
  if (!data) return null;

  const maxRole = Math.max(1, ...data.roles.map((r) => r.count));
  const maxTier = Math.max(1, ...data.byTier.map((t) => t.players));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">Users, journey progress, activity, and sessions.</p>
        </div>
        <button onClick={load} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <Stat icon={Users} label="Total users" value={data.users.total} />
        <Stat icon={UserCheck} label="Active (7d)" value={data.users.active7d} tone="terra" />
        <Stat icon={Gamepad2} label="Players started" value={data.progress.players} />
        <Stat icon={Sparkles} label="Mysteries solved" value={data.progress.totalSolved} tone="terra" />
        <Stat icon={Radio} label="MP sessions" value={data.sessions.multiplayer} />
        <Stat icon={Activity} label="Avg Terra" value={`${data.progress.avgHealth}%`} tone="warn" />
      </div>

      {/* signups over time */}
      <Panel title="Sign-ups (last 30 days)">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data.signupsByDay} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="su" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2f9d55" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#2f9d55" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d: string) => d.slice(5)} interval={4} stroke="var(--color-border)" />
            <YAxis allowDecimals={false} tick={{ fontSize: 10 }} stroke="var(--color-border)" width={28} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid var(--color-border)" }} />
            <Area type="monotone" dataKey="count" stroke="#2f9d55" strokeWidth={2} fill="url(#su)" />
          </AreaChart>
        </ResponsiveContainer>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* roles */}
        <Panel title="Role distribution">
          {data.roles.length === 0 ? <Empty /> : (
            <div className="space-y-2">
              {data.roles.map((r) => (
                <div key={r.role} className="flex items-center gap-3 text-xs">
                  <span className="w-28 shrink-0 text-muted-foreground">{roleName(r.role)}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-[image:var(--gradient-terra)]" style={{ width: `${(r.count / maxRole) * 100}%` }} />
                  </div>
                  <span className="w-6 text-right font-mono">{r.count}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>

        {/* journey by tier */}
        <Panel title="Journey progress (players by tier reached)">
          <div className="space-y-2">
            {data.byTier.map((t) => (
              <div key={t.tier} className="flex items-center gap-3 text-xs">
                <span className="w-28 shrink-0 text-muted-foreground">Tier {t.tier}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-[color:var(--terra)]" style={{ width: `${(t.players / maxTier) * 100}%` }} />
                </div>
                <span className="w-6 text-right font-mono">{t.players}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* activity 7d */}
        <Panel title="Activity (last 7 days)">
          {Object.keys(data.events.last7d).length === 0 ? <Empty label="No events yet." /> : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={Object.entries(data.events.last7d).map(([event, count]) => ({ event: EVENT_LABEL[event] ?? event, count }))} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <XAxis dataKey="event" tick={{ fontSize: 10 }} stroke="var(--color-border)" />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} stroke="var(--color-border)" width={28} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid var(--color-border)" }} cursor={{ fill: "var(--color-muted)" }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {Object.keys(data.events.last7d).map((_, i) => <Cell key={i} fill="#2f9d55" />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Panel>

        {/* recent + providers */}
        <Panel title="Recent activity">
          <div className="mb-3 flex flex-wrap gap-2">
            {data.users.providers.map((p) => (
              <span key={p.provider} className="rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground">
                {p.provider}: <strong className="text-foreground">{p.count}</strong>
              </span>
            ))}
          </div>
          {data.events.recent.length === 0 ? <Empty label="No events yet." /> : (
            <ul className="space-y-1.5 text-xs">
              {data.events.recent.map((e, i) => (
                <li key={i} className="flex items-center justify-between gap-2">
                  <span className="font-medium">{EVENT_LABEL[e.event] ?? e.event}</span>
                  <span className="text-muted-foreground">{new Date(e.created_at).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, tone }: { icon: typeof Users; label: string; value: number | string; tone?: "terra" | "warn" }) {
  const color = tone === "terra" ? "text-[color:var(--terra-deep)]" : tone === "warn" ? "text-[color:var(--warmth)]" : "text-foreground";
  return (
    <div className="surface-card p-3.5">
      <Icon className={`h-4 w-4 ${color}`} />
      <div className={`mt-2 font-display text-2xl font-semibold tabular-nums ${color}`}>{value}</div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="surface-card p-5">
      <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</div>
      {children}
    </div>
  );
}

function Empty({ label = "No data yet." }: { label?: string }) {
  return <div className="py-8 text-center text-xs text-muted-foreground">{label}</div>;
}
