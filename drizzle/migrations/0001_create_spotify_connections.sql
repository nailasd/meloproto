CREATE TABLE public.spotify_connections (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token text NOT NULL,
  refresh_token text,
  expires_at timestamptz NOT NULL,
  scope text NOT NULL DEFAULT '',
  top_artists jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.spotify_connections TO authenticated;
GRANT ALL ON public.spotify_connections TO service_role;
ALTER TABLE public.spotify_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own spotify connection"
ON public.spotify_connections FOR SELECT TO authenticated
USING (auth.uid() = user_id);