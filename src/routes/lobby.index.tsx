import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { ArrowLeft, Users, Plus, LogIn, ClipboardCheck } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { createLobby, createWorkshop, joinLobby } from "@/lib/multiplayer/api.functions";
import { getClientId, getGuestName, setGuestName } from "@/lib/multiplayer/identity";
import { useLobby } from "@/lib/multiplayer/store";
import { useGame } from "@/lib/game/store";

const searchSchema = z.object({ facilitator: z.coerce.boolean().optional() });

export const Route = createFileRoute("/lobby/")({
  head: () => ({ meta: [{ title: "Multiplayer Lobby — Tomorrow Matrix" }] }),
  validateSearch: searchSchema,
  component: LobbyIndex,
});

function LobbyIndex() {
  const navigate = useNavigate();
  const { facilitator } = useSearch({ from: "/lobby/" });
  const isFacilitator = !!facilitator;
  const create = useServerFn(createLobby);
  const createWs = useServerFn(createWorkshop);
  const join = useServerFn(joinLobby);
  const setLobby = useLobby((s) => s.setLobby);
  const setMode = useGame((s) => s.setMode);

  const [name, setName] = useState(typeof window !== "undefined" ? getGuestName() : "Player");
  const [workshopName, setWorkshopName] = useState("Climate Workshop");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState<"create" | "join" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    setError(null); setBusy("create");
    try {
      setGuestName(name);
      setMode("multiplayer");
      if (isFacilitator) {
        const ws = await createWs({ data: { clientId: getClientId(), name: workshopName.trim() || "Workshop" } });
        navigate({ to: "/facilitator/workshop/$code", params: { code: ws.code } });
        return;
      }
      const res = await create({
        data: { clientId: getClientId(), name, mode: "play" },
      });
      setLobby({ lobbyId: res.lobbyId, code: res.code, mode: res.mode as "play" | "workshop" });
      navigate({ to: "/lobby/$code", params: { code: res.code } });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create lobby");
    } finally { setBusy(null); }
  };

  const handleJoin = async () => {
    setError(null); setBusy("join");
    try {
      setGuestName(name);
      setMode("multiplayer");
      const res = await join({ data: { clientId: getClientId(), name, code: code.toUpperCase() } });
      setLobby({ lobbyId: res.lobbyId, code: res.code, mode: res.mode as "play" | "workshop" });
      navigate({ to: "/lobby/$code", params: { code: res.code } });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not join — check the code");
    } finally { setBusy(null); }
  };

  return (
    <main className="min-h-screen bg-background">
      <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <Link to="/mode-select" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {isFacilitator ? "Workshop" : "Multiplayer"}
        </span>
      </nav>

      <section className="mx-auto max-w-3xl px-6 pb-20">
        <header className="max-w-2xl">
          <div className={`inline-flex items-center gap-2 pill ${isFacilitator ? "chip-warmth" : "chip-terra"}`}>
            {isFacilitator ? <ClipboardCheck className="h-3 w-3" /> : <Users className="h-3 w-3" />}
            {isFacilitator ? "Facilitator Console" : "Live Sessions"}
          </div>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-5xl">
            {isFacilitator ? "Run a workshop" : "Play with your team"}
          </h1>
          <p className="mt-3 text-muted-foreground">
            {isFacilitator
              ? "Create a session, share the code with your participants, then steer the workshop from the facilitator console — pause, inject crises, and watch the analytics live."
              : "Create a session and share the code, or join one with a friend's code. 2–6 players work the same Terra together."}
          </p>
        </header>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="surface-card p-6">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              {isFacilitator ? "Your facilitator name" : "Your display name"}
            </div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 40))}
              className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-[color:var(--terra)]"
            />
            {isFacilitator && (
              <>
                <div className="mt-4 text-xs uppercase tracking-wider text-muted-foreground">Workshop name</div>
                <input
                  value={workshopName}
                  onChange={(e) => setWorkshopName(e.target.value.slice(0, 80))}
                  placeholder="e.g. Climate Leaders Cohort — Nov 2026"
                  className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-[color:var(--warmth)]"
                />
              </>
            )}
            <button
              onClick={handleCreate}
              disabled={!name.trim() || busy !== null || (isFacilitator && !workshopName.trim())}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[image:var(--gradient-terra)] px-5 py-3 text-sm font-medium text-white shadow-sm transition-transform hover:scale-[1.02] disabled:opacity-60"
            >
              <Plus className="h-4 w-4" /> {busy === "create" ? "Creating…" : (isFacilitator ? "Create workshop" : "Create new session")}
            </button>
          </div>

          {!isFacilitator && (
            <div className="surface-card p-6">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Join code</div>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))}
                placeholder="ABCD23"
                className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 font-mono text-lg tracking-[0.3em] outline-none focus:border-[color:var(--terra)]"
              />
              <button
                onClick={handleJoin}
                disabled={code.length < 4 || !name.trim() || busy !== null}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-medium hover:border-[color:var(--terra)] disabled:opacity-60"
              >
                <LogIn className="h-4 w-4" /> {busy === "join" ? "Joining…" : "Join session"}
              </button>
            </div>
          )}

          {isFacilitator && (
            <div className="surface-card flex flex-col justify-center gap-2 p-6">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">How it works</div>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li>1. Open the facilitator console.</li>
                <li>2. Share the 6-character code with participants.</li>
                <li>3. Players join at <span className="font-mono">/lobby</span> and pick stakeholder roles.</li>
                <li>4. Pace the session: pause, inject crises, end on time.</li>
              </ol>
            </div>
          )}
        </div>

        {error && <div className="mt-4 rounded-xl border border-[color:var(--warmth)]/30 bg-[color:var(--warmth-soft)] p-3 text-sm">{error}</div>}
      </section>
    </main>
  );
}
