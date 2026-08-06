
-- LOBBIES
CREATE TABLE public.lobbies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  host_client uuid NOT NULL,
  status text NOT NULL DEFAULT 'waiting',
  started_at timestamptz,
  shared_state jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.lobbies TO anon, authenticated;
GRANT ALL ON public.lobbies TO service_role;
ALTER TABLE public.lobbies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lobbies_read_all" ON public.lobbies FOR SELECT USING (true);
CREATE POLICY "lobbies_insert_all" ON public.lobbies FOR INSERT WITH CHECK (true);
CREATE POLICY "lobbies_update_all" ON public.lobbies FOR UPDATE USING (true) WITH CHECK (true);

-- PLAYERS
CREATE TABLE public.lobby_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lobby_id uuid NOT NULL REFERENCES public.lobbies(id) ON DELETE CASCADE,
  client_id uuid NOT NULL,
  name text NOT NULL,
  role text,
  is_host boolean NOT NULL DEFAULT false,
  last_seen timestamptz NOT NULL DEFAULT now(),
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (lobby_id, client_id)
);
CREATE INDEX lobby_players_lobby_idx ON public.lobby_players(lobby_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lobby_players TO anon, authenticated;
GRANT ALL ON public.lobby_players TO service_role;
ALTER TABLE public.lobby_players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lobby_players_all" ON public.lobby_players FOR ALL USING (true) WITH CHECK (true);

-- EVENTS
CREATE TABLE public.lobby_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lobby_id uuid NOT NULL REFERENCES public.lobbies(id) ON DELETE CASCADE,
  client_id uuid NOT NULL,
  kind text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX lobby_events_lobby_idx ON public.lobby_events(lobby_id, created_at DESC);
GRANT SELECT, INSERT ON public.lobby_events TO anon, authenticated;
GRANT ALL ON public.lobby_events TO service_role;
ALTER TABLE public.lobby_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lobby_events_read" ON public.lobby_events FOR SELECT USING (true);
CREATE POLICY "lobby_events_insert" ON public.lobby_events FOR INSERT WITH CHECK (true);

-- CRISIS VOTES
CREATE TABLE public.lobby_crisis_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lobby_id uuid NOT NULL REFERENCES public.lobbies(id) ON DELETE CASCADE,
  crisis_id text NOT NULL,
  client_id uuid NOT NULL,
  choice_id text NOT NULL,
  response_ms integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (lobby_id, crisis_id, client_id)
);
CREATE INDEX lobby_crisis_votes_idx ON public.lobby_crisis_votes(lobby_id, crisis_id);
GRANT SELECT, INSERT, UPDATE ON public.lobby_crisis_votes TO anon, authenticated;
GRANT ALL ON public.lobby_crisis_votes TO service_role;
ALTER TABLE public.lobby_crisis_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lobby_votes_all" ON public.lobby_crisis_votes FOR ALL USING (true) WITH CHECK (true);

-- UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_lobbies_updated_at
BEFORE UPDATE ON public.lobbies
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE public.lobbies;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lobby_players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lobby_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lobby_crisis_votes;
