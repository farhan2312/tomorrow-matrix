import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown, Loader2, Upload, RotateCcw, ImageIcon, Film, Check, AlertTriangle, Search, ExternalLink,
} from "lucide-react";
import {
  adminMediaList, adminMediaPresign, adminMediaSetOverride, adminMediaDelete,
} from "@/lib/admin/admin.functions";
import { buildMediaCatalog, catalogCounts, type MediaSlot } from "@/lib/admin/media-catalog";

type OverrideMap = Record<string, { url: string; updatedAt: string | null }>;

const extOf = (name: string) => (name.split(".").pop() || "bin").toLowerCase();

export function ManagementConsole({ token }: { token: string }) {
  const catalog = useMemo(() => buildMediaCatalog(), []);
  const counts = useMemo(() => catalogCounts(catalog), [catalog]);
  const [overrides, setOverrides] = useState<OverrideMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const refresh = () =>
    adminMediaList({ data: { token } })
      .then((r) => setOverrides(r.map as OverrideMap))
      .catch((e) => setError((e as Error).message));

  useEffect(() => {
    refresh().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const q = query.trim().toLowerCase();
  const overrideCount = Object.keys(overrides).length;

  const setOne = (key: string, entry: { url: string; updatedAt: string | null } | null) =>
    setOverrides((m) => {
      const next = { ...m };
      if (entry) next[key] = entry; else delete next[key];
      return next;
    });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">Media Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Replace or reset any cover, card, or video at runtime. {counts.slots} slots across {counts.groups} groups,
            {" "}<span className="font-medium text-foreground">{overrideCount} overridden</span>.
          </p>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search M01, cover, card…"
            className="h-10 w-64 rounded-lg border border-input bg-card pl-9 pr-3 text-sm"
          />
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4" /> {error}
        </div>
      )}

      {loading ? (
        <div className="mt-8 grid place-items-center py-16"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="mt-6 space-y-8">
          {catalog.map((section) => {
            const groups = section.groups
              .map((g) => ({
                ...g,
                slots: q
                  ? g.slots.filter((s) => g.title.toLowerCase().includes(q) || s.key.toLowerCase().includes(q) || s.label.toLowerCase().includes(q))
                  : g.slots,
              }))
              .filter((g) => g.slots.length);
            if (!groups.length) return null;
            return (
              <div key={section.id}>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{section.title}</h2>
                <div className="space-y-2">
                  {groups.map((g) => {
                    const isOpen = q ? true : !!open[g.id];
                    const overridden = g.slots.filter((s) => overrides[s.key]).length;
                    return (
                      <div key={g.id} className="overflow-hidden rounded-xl border border-border bg-card">
                        <button
                          onClick={() => setOpen((o) => ({ ...o, [g.id]: !o[g.id] }))}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/40"
                        >
                          <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? "" : "-rotate-90"}`} />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium">{g.title}</div>
                            {g.subtitle && <div className="truncate text-xs text-muted-foreground">{g.subtitle}</div>}
                          </div>
                          <span className="shrink-0 text-xs text-muted-foreground">{g.slots.length} slots</span>
                          {overridden > 0 && (
                            <span className="shrink-0 rounded-full bg-[color:var(--terra-soft)] px-2 py-0.5 text-[10px] font-semibold text-[color:var(--terra-deep)]">
                              {overridden} custom
                            </span>
                          )}
                        </button>
                        {isOpen && (
                          <div className="divide-y divide-border border-t border-border">
                            {g.slots.map((s) => (
                              <SlotRow
                                key={s.key}
                                slot={s}
                                token={token}
                                override={overrides[s.key] ?? null}
                                onChange={(entry) => setOne(s.key, entry)}
                                onError={setError}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SlotRow({
  slot, token, override, onChange, onError,
}: {
  slot: MediaSlot;
  token: string;
  override: { url: string; updatedAt: string | null } | null;
  onChange: (entry: { url: string; updatedAt: string | null } | null) => void;
  onError: (msg: string | null) => void;
}) {
  const [busy, setBusy] = useState<"upload" | "reset" | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const currentUrl = override?.url;
  const previewUrl = currentUrl ?? (slot.default && slot.default !== "bundled" ? slot.default : undefined);

  const handleFile = async (file: File) => {
    onError(null);
    setBusy("upload");
    try {
      const ext = extOf(file.name);
      const contentType = file.type || (slot.kind === "video" ? "video/mp4" : "image/webp");
      const { uploadUrl, url } = await adminMediaPresign({ data: { token, key: slot.key, contentType, ext } });
      const put = await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": contentType } });
      if (!put.ok) throw new Error(`Upload failed (${put.status}). Check R2 CORS.`);
      await adminMediaSetOverride({ data: { token, key: slot.key, url } });
      onChange({ url, updatedAt: new Date().toISOString() });
    } catch (e) {
      onError((e as Error).message);
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleReset = async () => {
    onError(null);
    setBusy("reset");
    try {
      await adminMediaDelete({ data: { token, key: slot.key } });
      onChange(null);
    } catch (e) {
      onError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      {/* preview */}
      <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-lg border border-border bg-muted/40">
        {slot.kind === "image" && previewUrl ? (
          <img src={previewUrl} alt="" className="h-full w-full object-cover" />
        ) : slot.kind === "video" ? (
          <Film className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ImageIcon className="h-4 w-4 text-muted-foreground" />
        )}
      </div>

      {/* label + status */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">{slot.label}</span>
          {override ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--terra-soft)] px-1.5 py-0.5 text-[10px] font-semibold text-[color:var(--terra-deep)]">
              <Check className="h-2.5 w-2.5" /> Custom
            </span>
          ) : slot.default ? (
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">Default</span>
          ) : (
            <span className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">No asset</span>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
          <span className="truncate">{slot.key}</span>
          {currentUrl && (
            <a href={currentUrl} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-0.5 text-[color:var(--terra-deep)] hover:underline">
              open <ExternalLink className="h-2.5 w-2.5" />
            </a>
          )}
        </div>
      </div>

      {/* actions */}
      <input
        ref={fileRef}
        type="file"
        accept={slot.kind === "video" ? "video/*" : "image/*"}
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); }}
      />
      <button
        onClick={() => fileRef.current?.click()}
        disabled={!!busy}
        className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-border px-2.5 text-xs font-medium hover:bg-muted disabled:opacity-50"
      >
        {busy === "upload" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
        {override ? "Replace" : "Upload"}
      </button>
      {override && (
        <button
          onClick={handleReset}
          disabled={!!busy}
          title="Reset to default"
          className="inline-flex h-8 shrink-0 items-center gap-1 rounded-lg border border-border px-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
        >
          {busy === "reset" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
        </button>
      )}
    </div>
  );
}
