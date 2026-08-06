ALTER TABLE public.lobbies
  ADD COLUMN IF NOT EXISTS mode text NOT NULL DEFAULT 'play';