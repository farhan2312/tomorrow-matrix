import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [{ title: "Reset Password, Tomorrow Matrix" }],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  // "checking" until Supabase processes the recovery token in the URL.
  const [status, setStatus] = useState<"checking" | "ready" | "invalid">("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // The recovery link opens this page with a token; supabase-js exchanges it
    // for a session and fires PASSWORD_RECOVERY.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setStatus("ready");
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setStatus("ready");
    });
    const timer = setTimeout(() => {
      setStatus((s) => (s === "checking" ? "invalid" : s));
    }, 4000);
    return () => {
      clearTimeout(timer);
      sub.subscription.unsubscribe();
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error("Password must be at least 6 characters."); return; }
    if (password !== confirm) { toast.error("The two passwords don't match."); return; }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated. You're signed in.");
      navigate({ to: "/account" });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <img src="/icon-512.png" alt="Tomorrow Matrix" className="h-8 w-8 object-contain" />
          <span className="font-display text-base font-semibold">Tomorrow Matrix</span>
        </Link>
        <Link to="/auth" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
      </nav>

      <section className="mx-auto grid w-full max-w-md gap-6 px-6 py-12">
        <div className="text-center">
          <h1 className="font-display text-3xl font-semibold tracking-tight">Set a new password</h1>
          <p className="mt-2 text-sm text-muted-foreground">Choose a new password for your Terra account.</p>
        </div>

        <div className="surface-card grid gap-3 p-5">
          {status === "checking" && (
            <div className="grid place-items-center gap-2 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Verifying your reset link…
            </div>
          )}

          {status === "invalid" && (
            <div className="grid gap-3 py-4 text-center text-sm">
              <p className="text-muted-foreground">
                This reset link is invalid or has expired. Request a new one from the sign-in page.
              </p>
              <Link
                to="/auth"
                className="inline-flex h-10 items-center justify-center rounded-lg bg-[image:var(--gradient-terra)] text-sm font-medium text-white"
              >
                Back to sign in
              </Link>
            </div>
          )}

          {status === "ready" && (
            <form onSubmit={submit} className="grid gap-2">
              <input
                type="password" required minLength={6} value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="New password"
                className="h-10 rounded-lg border border-input bg-card px-3 text-sm"
              />
              <input
                type="password" required minLength={6} value={confirm}
                onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm new password"
                className="h-10 rounded-lg border border-input bg-card px-3 text-sm"
              />
              <button
                disabled={busy} type="submit"
                className="mt-1 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[image:var(--gradient-terra)] text-sm font-medium text-white disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Update password
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
