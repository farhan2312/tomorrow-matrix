import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Globe2, ArrowLeft, LogOut, Loader2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "Your Profile — Tomorrow Matrix" }] }),
  component: AccountPage,
});

function AccountPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string>("");
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) { navigate({ to: "/auth" }); return; }
      setEmail(data.user.email ?? "");
      const { data: prof } = await supabase.from("profiles").select("display_name, avatar_url").eq("id", data.user.id).maybeSingle();
      setDisplayName(prof?.display_name ?? "");
      setAvatarUrl(prof?.avatar_url ?? "");
      setLoading(false);
    })();
  }, [navigate]);

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      const { error } = await supabase.from("profiles").upsert({
        id: data.user.id, display_name: displayName || null, avatar_url: avatarUrl || null,
      });
      if (error) throw error;
      toast.success("Profile saved");
    } catch (err) {
      toast.error((err as Error).message);
    } finally { setSaving(false); }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <main className="min-h-screen bg-background">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-[image:var(--gradient-terra)] text-white"><Globe2 className="h-4 w-4"/></div>
          <span className="font-display text-base font-semibold">Tomorrow Matrix</span>
        </Link>
        <Link to="/mode-select" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to game
        </Link>
      </nav>

      <section className="mx-auto grid w-full max-w-md gap-6 px-6 py-12">
        <div>
          <h1 className="font-display text-3xl font-semibold">Your profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">Signed in as <strong>{email}</strong></p>
        </div>

        {loading ? (
          <div className="surface-card grid place-items-center p-10"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="surface-card grid gap-4 p-5">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-full bg-muted text-lg font-semibold text-muted-foreground">
                {avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" /> : (displayName || email).slice(0, 1).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{displayName || "Unnamed player"}</div>
                <div className="text-xs text-muted-foreground">This is how other stakeholders see you.</div>
              </div>
            </div>

            <label className="grid gap-1 text-xs">
              <span className="uppercase tracking-wider text-muted-foreground">Display name</span>
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                className="h-10 rounded-lg border border-input bg-card px-3 text-sm" />
            </label>
            <label className="grid gap-1 text-xs">
              <span className="uppercase tracking-wider text-muted-foreground">Avatar URL</span>
              <input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://…"
                className="h-10 rounded-lg border border-input bg-card px-3 text-sm" />
            </label>

            <div className="flex items-center gap-2 pt-2">
              <button onClick={save} disabled={saving}
                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-[image:var(--gradient-terra)] text-sm font-medium text-white disabled:opacity-60">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
              </button>
              <button onClick={signOut}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-input px-4 text-sm hover:bg-muted">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
