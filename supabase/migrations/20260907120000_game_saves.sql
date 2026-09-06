-- Cloud-synced single-player game progress: one row per user, holding the
-- serialized game store. Protected by RLS so each user only ever sees/writes
-- their own save.
CREATE TABLE public.game_saves (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  state jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.game_saves TO authenticated;
GRANT ALL ON public.game_saves TO service_role;

ALTER TABLE public.game_saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "game_saves_select_own" ON public.game_saves
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "game_saves_insert_own" ON public.game_saves
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "game_saves_update_own" ON public.game_saves
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
