-- Media override registry. A row overrides the default URL for a media "key"
-- (e.g. "video/M01/intro", "cover/M01", "card/M01/3"). No row = use the
-- bundled/default asset. Publicly readable (the app resolves overrides at
-- runtime); only the admin (service_role) writes.
CREATE TABLE public.media_overrides (
  key text PRIMARY KEY,
  url text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.media_overrides TO anon, authenticated;
GRANT ALL ON public.media_overrides TO service_role;

ALTER TABLE public.media_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "media_overrides_read" ON public.media_overrides
  FOR SELECT USING (true);
