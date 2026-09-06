import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, LogOut, Loader2, Save, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "Your Profile, Tomorrow Matrix" }] }),
  component: AccountPage,
});

function AccountPage() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string>("");
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

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

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please choose an image file."); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5 MB."); return; }
    setUploading(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const ext = (file.name.split(".").pop() || "png").toLowerCase();
      const path = `${u.user.id}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, {
        upsert: true, contentType: file.type,
      });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      setAvatarUrl(pub.publicUrl);
      toast.success("Photo updated — don't forget to Save.");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      const { error } = await supabase.from("profiles").upsert({
        id: data.user.id, display_name: displayName || null, avatar_url: avatarUrl || null,
      });
      if (error) throw error;
      // Best-effort: mark onboarding complete so future logins go straight home.
      // Ignored if the `onboarded` column hasn't been added yet.
      await supabase.from("profiles").update({ onboarded: true }).eq("id", data.user.id);
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
          <img src="/icon-512.png" alt="Tomorrow Matrix" className="h-8 w-8 object-contain" />
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
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                title="Change photo"
                className="group relative grid h-16 w-16 place-items-center overflow-hidden rounded-full bg-muted text-lg font-semibold text-muted-foreground"
              >
                {avatarUrl
                  ? <img src={avatarUrl} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                  : (displayName || email).slice(0, 1).toUpperCase()}
                <span className="absolute inset-0 hidden place-items-center bg-black/45 text-white group-hover:grid">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                </span>
              </button>
              <div className="flex-1">
                <div className="text-sm font-medium">{displayName || "Unnamed player"}</div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="mt-0.5 text-xs font-medium text-[color:var(--terra-deep)] hover:underline disabled:opacity-60"
                >
                  {uploading ? "Uploading…" : "Change photo"}
                </button>
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={onPickFile} className="hidden" />
            </div>

            <label className="grid gap-1 text-xs">
              <span className="uppercase tracking-wider text-muted-foreground">Display name</span>
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                className="h-10 rounded-lg border border-input bg-card px-3 text-sm" />
            </label>

            <div className="flex items-center gap-2 pt-2">
              <button onClick={save} disabled={saving || uploading}
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
