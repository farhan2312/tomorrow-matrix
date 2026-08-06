import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Globe2, Mail, Phone, ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In — Tomorrow Matrix" },
      { name: "description", content: "Sign in to save your Terra progress across devices." },
    ],
  }),
  component: AuthPage,
});

type Tab = "email" | "phone";

function AuthPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("email");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState<null | string>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/account" });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: "/account" });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const oauth = async (provider: "google" | "apple") => {
    try {
      setBusy(provider);
      const res = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin + "/auth" });
      if (res.error) toast.error(`Sign-in failed: ${res.error.message ?? provider}`);
    } finally {
      setBusy(null);
    }
  };

  const emailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy("email");
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
            data: { display_name: displayName || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Check your inbox to confirm your email.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const sendOtp = async () => {
    setBusy("phone");
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone });
      if (error) throw error;
      setOtpSent(true);
      toast.success("Code sent by SMS.");
    } catch (err) {
      toast.error((err as Error).message);
    } finally { setBusy(null); }
  };

  const verifyOtp = async () => {
    setBusy("phone");
    try {
      const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: "sms" });
      if (error) throw error;
    } catch (err) {
      toast.error((err as Error).message);
    } finally { setBusy(null); }
  };

  return (
    <main className="min-h-screen bg-background">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-[image:var(--gradient-terra)] text-white">
            <Globe2 className="h-4 w-4" />
          </div>
          <span className="font-display text-base font-semibold">Tomorrow Matrix</span>
        </Link>
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>
      </nav>

      <section className="mx-auto grid w-full max-w-md gap-6 px-6 py-12">
        <div className="text-center">
          <h1 className="font-display text-3xl font-semibold tracking-tight">Sign in to Terra</h1>
          <p className="mt-2 text-sm text-muted-foreground">Save your progress, role and Climate Action Points across sessions.</p>
        </div>

        <div className="surface-card grid gap-3 p-5">
          <button onClick={() => oauth("google")} disabled={!!busy}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-input bg-card px-4 text-sm font-medium hover:bg-muted disabled:opacity-60">
            {busy === "google" ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />} Continue with Google
          </button>
          <button onClick={() => oauth("apple")} disabled={!!busy}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-input bg-card px-4 text-sm font-medium hover:bg-muted disabled:opacity-60">
            {busy === "apple" ? <Loader2 className="h-4 w-4 animate-spin" /> :  <AppleIcon />} Continue with Apple
          </button>

          <div className="my-1 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
          </div>

          <div className="flex gap-1 rounded-lg bg-muted p-1 text-xs">
            <button onClick={() => setTab("email")} className={`flex-1 rounded-md px-3 py-1.5 ${tab === "email" ? "bg-background shadow-sm" : ""}`}>
              <Mail className="mr-1 inline h-3 w-3" /> Email
            </button>
            <button onClick={() => setTab("phone")} className={`flex-1 rounded-md px-3 py-1.5 ${tab === "phone" ? "bg-background shadow-sm" : ""}`}>
              <Phone className="mr-1 inline h-3 w-3" /> Phone
            </button>
          </div>

          {tab === "email" ? (
            <form onSubmit={emailAuth} className="grid gap-2">
              {mode === "signup" && (
                <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Display name"
                  className="h-10 rounded-lg border border-input bg-card px-3 text-sm" />
              )}
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email"
                className="h-10 rounded-lg border border-input bg-card px-3 text-sm" />
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"
                className="h-10 rounded-lg border border-input bg-card px-3 text-sm" />
              <button disabled={!!busy} type="submit"
                className="mt-1 inline-flex h-10 items-center justify-center rounded-lg bg-[image:var(--gradient-terra)] text-sm font-medium text-white disabled:opacity-60">
                {busy === "email" ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "signup" ? "Create account" : "Sign in"}
              </button>
              <button type="button" onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
                className="text-xs text-muted-foreground hover:text-foreground">
                {mode === "signup" ? "Already have an account? Sign in" : "New here? Create an account"}
              </button>
            </form>
          ) : (
            <div className="grid gap-2">
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 123 4567"
                className="h-10 rounded-lg border border-input bg-card px-3 text-sm" />
              {!otpSent ? (
                <button onClick={sendOtp} disabled={!!busy || !phone}
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-[image:var(--gradient-terra)] text-sm font-medium text-white disabled:opacity-60">
                  {busy === "phone" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send code"}
                </button>
              ) : (
                <>
                  <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit code"
                    className="h-10 rounded-lg border border-input bg-card px-3 text-sm tracking-widest" />
                  <button onClick={verifyOtp} disabled={!!busy || otp.length < 4}
                    className="inline-flex h-10 items-center justify-center rounded-lg bg-[image:var(--gradient-terra)] text-sm font-medium text-white disabled:opacity-60">
                    {busy === "phone" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify & sign in"}
                  </button>
                </>
              )}
              <p className="text-[11px] text-muted-foreground">SMS sign-in requires an SMS provider configured on your workspace.</p>
            </div>
          )}
        </div>

        <div className="text-center text-xs text-muted-foreground">
          Prefer to keep it casual? <Link to="/" className="text-[color:var(--terra-deep)] hover:underline">Continue as guest</Link>
          <div className="mt-1">Guests can play the full game, but progress won't sync across devices.</div>
        </div>
      </section>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.3 9.14 5.38 12 5.38z"/></svg>
  );
}
function AppleIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16.365 12.7c-.02-2.16 1.76-3.19 1.84-3.24-1-1.46-2.56-1.66-3.11-1.68-1.32-.13-2.58.78-3.25.78-.68 0-1.71-.76-2.82-.74-1.44.02-2.79.84-3.53 2.13-1.51 2.61-.39 6.47 1.08 8.59.72 1.03 1.57 2.19 2.68 2.15 1.08-.04 1.49-.7 2.79-.7s1.67.7 2.82.68c1.17-.02 1.9-1.04 2.61-2.08.83-1.19 1.16-2.35 1.18-2.41-.03-.01-2.27-.87-2.29-3.46zM14.13 5.36c.59-.72 1-1.71.89-2.71-.86.03-1.9.57-2.51 1.29-.55.64-1.03 1.66-.9 2.63.96.07 1.94-.49 2.52-1.21z"/></svg>;
}
