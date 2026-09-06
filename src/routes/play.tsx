import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { HudBar } from "@/components/game/HudBar";
import { TerraProgressPanel } from "@/components/game/TerraProgressPanel";
import { CrisisModal } from "@/components/game/CrisisModal";
import { RoleChallengeModal } from "@/components/game/RoleChallengeModal";
import { PromotionModal } from "@/components/game/PromotionModal";
import { RosterRail, MultiplayerBridge } from "@/components/game/RosterRail";
import { NarrationOverlay } from "@/components/game/NarrationOverlay";
import { useGame } from "@/lib/game/store";
import { useLobby } from "@/lib/multiplayer/store";
import { getClientId } from "@/lib/multiplayer/identity";
import { CRISES } from "@/lib/game/data";
import { narrate } from "@/lib/voice/store";

export const Route = createFileRoute("/play")({
  head: () => ({
    meta: [
      { title: "Play, Tomorrow Matrix" },
      { name: "description", content: "Restore Terra. Solve mysteries, respond to crises, invest in interventions." },
    ],
  }),
  component: PlayLayout,
});

function PlayLayout() {
  const role = useGame((s) => s.role);
  const mode = useGame((s) => s.mode);
  const pendingCrisisId = useGame((s) => s.pendingCrisisId);
  const dismissCrisis = useGame((s) => s.dismissCrisis);
  const resolveCrisis = useGame((s) => s.resolveCrisis);
  const lobbyId = useLobby((s) => s.lobbyId);
  const navigate = useNavigate();

  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);

  useEffect(() => {
    if (ready && !role) navigate({ to: "/mode-select" });
  }, [ready, role, navigate]);

  // Re-attach realtime subscription on /play if user lands here directly.
  useEffect(() => {
    if (!ready || mode !== "multiplayer" || !lobbyId) return;
    const clientId = getClientId();
    useLobby.getState().subscribe(lobbyId, clientId);
    return () => useLobby.getState().unsubscribe();
  }, [ready, mode, lobbyId]);

  const [crisisOpenedAt, setCrisisOpenedAt] = useState<number | null>(null);
  const [shownCrisisId, setShownCrisisId] = useState<string | null>(null);
  useEffect(() => {
    if (pendingCrisisId) {
      setCrisisOpenedAt(Date.now());
      setShownCrisisId(pendingCrisisId);
      const c = CRISES.find((x) => x.id === pendingCrisisId);
      if (c) narrate("CRISIS-ALERT", { "CRISIS NAME": c.title });
    }
  }, [pendingCrisisId]);

  const activeCrisis = useMemo(
    () => (shownCrisisId ? CRISES.find((c) => c.id === shownCrisisId) ?? null : null),
    [shownCrisisId],
  );

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="text-sm text-muted-foreground">Loading Terra…</div>
      </div>
    );
  }
  if (!role) return null;

  return (
    <div className="min-h-screen bg-background">
      <HudBar />
      <Outlet />
      <RosterRail />
      <MultiplayerBridge />
      <TerraProgressPanel />
      <NarrationOverlay />
      <PauseOverlay />
      <RoleChallengeModal />
      <PromotionModal />
      <CrisisModal
        crisis={activeCrisis}
        open={!!activeCrisis}
        onClose={() => {
          dismissCrisis();
          setShownCrisisId(null);
          setCrisisOpenedAt(null);
        }}
        onResolve={(choiceId) => {
          if (!activeCrisis) return;
          const responseMs = crisisOpenedAt ? Date.now() - crisisOpenedAt : 0;
          resolveCrisis(activeCrisis.id, choiceId, responseMs);
        }}
      />
    </div>
  );
}

function PauseOverlay() {
  const mode = useGame((s) => s.mode);
  const lobbyId = useLobby((s) => s.lobbyId);
  const paused = useLobby((s) => !!s.sharedState.paused);
  if (mode !== "multiplayer" || !lobbyId || !paused) return null;
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-background/85 backdrop-blur-md">
      <div className="surface-card max-w-sm p-8 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[color:var(--warmth-soft)] text-[color:var(--warmth)]">
          <span className="text-2xl">⏸</span>
        </div>
        <h2 className="mt-4 font-display text-xl font-semibold">Session paused</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Your facilitator paused the workshop. Play will resume when they unpause.
        </p>
      </div>
    </div>
  );
}
