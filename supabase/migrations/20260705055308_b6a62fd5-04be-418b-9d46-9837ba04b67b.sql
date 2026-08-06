
CREATE TABLE public.workshops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL DEFAULT 'Workshop',
  host_client uuid NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.workshops TO anon, authenticated;
GRANT ALL ON public.workshops TO service_role;

ALTER TABLE public.workshops ENABLE ROW LEVEL SECURITY;

CREATE POLICY workshops_read_all ON public.workshops FOR SELECT USING (true);

CREATE TRIGGER update_workshops_updated_at
BEFORE UPDATE ON public.workshops
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.lobbies
  ADD COLUMN workshop_id uuid REFERENCES public.workshops(id) ON DELETE SET NULL,
  ADD COLUMN name text;

CREATE INDEX lobbies_workshop_id_idx ON public.lobbies(workshop_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.workshops;
