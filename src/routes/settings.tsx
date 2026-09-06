import { createFileRoute, Link } from "@tanstack/react-router";
import { Volume2, VolumeX, Mic, Music, Sparkles, Captions, Languages, ArrowLeft, Film } from "lucide-react";
import { useAudioPrefs, useNarration } from "@/lib/voice/store";
import { useGame } from "@/lib/game/store";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings, Tomorrow Matrix" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const prefs = useAudioPrefs();
  const play = useNarration((s) => s.play);
  const autoplayIntro = useGame((s) => s.autoplayIntro);
  const setAutoplayIntro = useGame((s) => s.setAutoplayIntro);
  const mediaState = useGame((s) => s.mediaState);
  const watchedIntros = Object.values(mediaState ?? {}).filter((m) => m.introWatched).length;


  return (
    <main className="mx-auto max-w-2xl px-4 py-8 md:px-6">
      <Link to="/play" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to game
      </Link>
      <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight">Audio & Voice</h1>
      <p className="mt-1 text-sm text-muted-foreground">Tune how Terra sounds and speaks to you.</p>

      <section className="surface-card mt-6 space-y-4 p-5">
        <ToggleRow
          icon={<Mic className="h-4 w-4" />}
          label="Voice Narration"
          hint="Cinematic documentary-style narrator. Off by default."
          checked={prefs.voiceOn}
          onChange={() => {
            prefs.toggleVoice();
            if (!prefs.voiceOn) setTimeout(() => play("OB-01"), 120);
            else useNarration.getState().stop();
          }}
        />
        <ToggleRow
          icon={<Captions className="h-4 w-4" />}
          label="Subtitles"
          hint="Show captions while narration plays."
          checked={prefs.subtitlesOn}
          onChange={prefs.toggleSubtitles}
        />
        <ToggleRow
          icon={prefs.muteAll ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          label="Mute All"
          hint="Silence music, effects, and narration."
          checked={prefs.muteAll}
          onChange={prefs.toggleMute}
        />
      </section>

      <section className="surface-card mt-4 space-y-4 p-5">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">Video</h2>
        <ToggleRow
          icon={<Film className="h-4 w-4" />}
          label="Autoplay mystery intro videos"
          hint={
            watchedIntros > 0
              ? `Turn this off to skip straight to the puzzle. You've watched ${watchedIntros} intro${watchedIntros === 1 ? "" : "s"}, intros stay replayable any time.`
              : "Plays the cinematic briefing when you open a mystery. Available to switch off once you've watched one."
          }
          checked={autoplayIntro}
          onChange={() => setAutoplayIntro(!autoplayIntro)}
        />
      </section>


      <section className="surface-card mt-4 space-y-5 p-5">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">Volume</h2>
        <SliderRow icon={<Volume2 className="h-4 w-4" />} label="Master" value={prefs.volumes.master}
          onChange={(v) => prefs.setVolume("master", v)} />
        <SliderRow icon={<Music className="h-4 w-4" />} label="Music" value={prefs.volumes.music}
          onChange={(v) => prefs.setVolume("music", v)} />
        <SliderRow icon={<Sparkles className="h-4 w-4" />} label="Sound Effects" value={prefs.volumes.sfx}
          onChange={(v) => prefs.setVolume("sfx", v)} />
        <SliderRow icon={<Mic className="h-4 w-4" />} label="Voice" value={prefs.volumes.voice}
          onChange={(v) => prefs.setVolume("voice", v)} />
      </section>

      <section className="surface-card mt-4 space-y-3 p-5">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <Languages className="mr-1 inline h-4 w-4" /> Language
        </h2>
        <p className="text-xs text-muted-foreground">
          Narration pack. Additional language packs (Arabic, French, Spanish, Hindi) plug in without frontend changes.
        </p>
        <select
          value={prefs.language}
          onChange={(e) => prefs.setLanguage(e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="en">English</option>
          <option value="ar" disabled>العربية, coming soon</option>
          <option value="fr" disabled>Français, coming soon</option>
          <option value="es" disabled>Español, coming soon</option>
          <option value="hi" disabled>हिन्दी, coming soon</option>
        </select>
      </section>

      <button
        onClick={() => play("OB-01")}
        className="mt-4 w-full rounded-lg bg-[image:var(--gradient-terra)] px-4 py-2.5 text-sm font-medium text-white shadow-sm"
      >
        Test narration
      </button>
    </main>
  );
}

function ToggleRow({ icon, label, hint, checked, onChange }: {
  icon: React.ReactNode; label: string; hint: string; checked: boolean; onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted text-foreground">{icon}</span>
      <span className="flex-1">
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-xs text-muted-foreground">{hint}</span>
      </span>
      <span
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${checked ? "bg-[color:var(--terra-deep)]" : "bg-muted"}`}
        onClick={(e) => { e.preventDefault(); onChange(); }}
      >
        <span className={`inline-block h-5 w-5 transform rounded-full bg-background shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
      </span>
    </label>
  );
}

function SliderRow({ icon, label, value, onChange }: {
  icon: React.ReactNode; label: string; value: number; onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">{icon}</span>
      <span className="w-24 text-sm">{label}</span>
      <input
        type="range" min={0} max={100} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 flex-1 accent-[color:var(--terra-deep)]"
      />
      <span className="w-10 text-right font-mono text-xs tabular-nums text-muted-foreground">{value}</span>
    </div>
  );
}
