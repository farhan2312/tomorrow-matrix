import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BarChart3, FolderCog, Lock, Loader2, LogOut, ShieldCheck } from "lucide-react";
import { adminLogin, adminVerify } from "@/lib/admin/admin.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin, Tomorrow Matrix" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

const TOKEN_KEY = "tm-admin-token";

function getToken(): string | null {
  try { return sessionStorage.getItem(TOKEN_KEY); } catch { return null; }
}
function setToken(t: string | null) {
  try { t ? sessionStorage.setItem(TOKEN_KEY, t) : sessionStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
}

function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const t = getToken();
    if (!t) { setChecking(false); return; }
    adminVerify({ data: { token: t } })
      .then((r) => setAuthed(!!r.ok))
      .catch(() => setAuthed(false))
      .finally(() => setChecking(false));
  }, []);

  if (checking) {
    return (
      <main className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </main>
    );
  }

  return authed ? <AdminShell onLogout={() => { setToken(null); setAuthed(false); }} /> : <AdminLogin onAuthed={() => setAuthed(true)} />;
}

function AdminLogin({ onAuthed }: { onAuthed: () => void }) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { token } = await adminLogin({ data: { password } });
      setToken(token);
      onAuthed();
    } catch (err) {
      setError((err as Error).message || "Login failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-background px-6">
      <form onSubmit={submit} className="surface-card w-full max-w-sm gap-4 p-7">
        <div className="mb-4 flex flex-col items-center text-center">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-[color:var(--terra-soft)] text-[color:var(--terra-deep)]">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="mt-3 font-display text-xl font-semibold">Admin access</h1>
          <p className="mt-1 text-xs text-muted-foreground">Enter the admin password to continue.</p>
        </div>
        <input
          type="password" autoFocus required value={password}
          onChange={(e) => { setPassword(e.target.value); if (error) setError(null); }}
          placeholder="Admin password"
          className="h-11 w-full rounded-lg border border-input bg-card px-3 text-sm"
        />
        {error && <p className="mt-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>}
        <button
          disabled={busy || !password} type="submit"
          className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[image:var(--gradient-terra)] text-sm font-medium text-white disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />} Unlock
        </button>
      </form>
    </main>
  );
}

type Tab = "analytics" | "management";

function AdminShell({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>("analytics");

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-7xl">
        {/* sidebar */}
        <aside className="flex w-56 shrink-0 flex-col border-r border-border p-4">
          <div className="mb-6 flex items-center gap-2 px-2">
            <img src="/icon-512.png" alt="" className="h-7 w-7 object-contain" />
            <div>
              <div className="font-display text-sm font-semibold leading-none">Tomorrow Matrix</div>
              <div className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">Admin</div>
            </div>
          </div>
          <nav className="space-y-1">
            <SideLink active={tab === "analytics"} onClick={() => setTab("analytics")} icon={BarChart3} label="Analytics" />
            <SideLink active={tab === "management"} onClick={() => setTab("management")} icon={FolderCog} label="Media Management" />
          </nav>
          <button
            onClick={onLogout}
            className="mt-auto inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </aside>

        {/* content */}
        <section className="flex-1 p-8">
          {tab === "analytics" ? <AnalyticsPlaceholder /> : <ManagementPlaceholder />}
        </section>
      </div>
    </main>
  );
}

function SideLink({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: typeof BarChart3; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${active ? "bg-[color:var(--terra-soft)] text-[color:var(--terra-deep)]" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
    >
      <Icon className="h-4 w-4" /> {label}
    </button>
  );
}

function AnalyticsPlaceholder() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Analytics</h1>
      <p className="mt-1 text-sm text-muted-foreground">Users, journey progress, activity, and sessions.</p>
      <div className="mt-6 grid place-items-center rounded-xl border border-dashed border-border bg-muted/30 p-16 text-sm text-muted-foreground">
        Analytics dashboard coming in the next step.
      </div>
    </div>
  );
}

function ManagementPlaceholder() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Media Management</h1>
      <p className="mt-1 text-sm text-muted-foreground">Upload, update, and delete videos and images by mystery / module.</p>
      <div className="mt-6 grid place-items-center rounded-xl border border-dashed border-border bg-muted/30 p-16 text-sm text-muted-foreground">
        Management console coming after analytics.
      </div>
    </div>
  );
}
