
DROP POLICY IF EXISTS "lobbies_insert_all" ON public.lobbies;
DROP POLICY IF EXISTS "lobbies_update_all" ON public.lobbies;
DROP POLICY IF EXISTS "lobby_players_all" ON public.lobby_players;
DROP POLICY IF EXISTS "lobby_events_insert" ON public.lobby_events;
DROP POLICY IF EXISTS "lobby_votes_all" ON public.lobby_crisis_votes;

-- Recreate as SELECT-only for anon/authenticated; service_role bypasses RLS for writes.
REVOKE INSERT, UPDATE, DELETE ON public.lobbies FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.lobby_players FROM anon, authenticated;
REVOKE INSERT ON public.lobby_events FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.lobby_crisis_votes FROM anon, authenticated;

CREATE POLICY "lobby_players_read" ON public.lobby_players FOR SELECT USING (true);
CREATE POLICY "lobby_votes_read" ON public.lobby_crisis_votes FOR SELECT USING (true);
