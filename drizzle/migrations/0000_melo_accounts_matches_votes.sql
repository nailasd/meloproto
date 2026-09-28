
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  username text NOT NULL,
  avatar_color text NOT NULL DEFAULT '#8a5cff',
  top_genres text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles readable by signed-in users" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'username',''), NULLIF(NEW.raw_user_meta_data->>'full_name',''), split_part(NEW.email,'@',1), 'melo')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid,
  author_name text NOT NULL DEFAULT 'melo',
  source jsonb NOT NULL,
  match jsonb NOT NULL,
  vibe text NOT NULL,
  genre text NOT NULL DEFAULT 'chill',
  likes_count integer NOT NULL DEFAULT 0,
  nopes_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.matches TO authenticated;
GRANT ALL ON public.matches TO service_role;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Matches readable by signed-in users" ON public.matches FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users publish own matches" ON public.matches FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users delete own matches" ON public.matches FOR DELETE TO authenticated USING (auth.uid() = author_id);

CREATE OR REPLACE FUNCTION public.set_match_author()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  NEW.author_id := auth.uid();
  NEW.author_name := COALESCE((SELECT username FROM public.profiles WHERE id = auth.uid()), 'melo');
  NEW.likes_count := 0;
  NEW.nopes_count := 0;
  RETURN NEW;
END; $$;
CREATE TRIGGER matches_set_author BEFORE INSERT ON public.matches FOR EACH ROW
  WHEN (auth.uid() IS NOT NULL) EXECUTE FUNCTION public.set_match_author();

CREATE TABLE public.votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  liked boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, match_id)
);
GRANT SELECT, INSERT ON public.votes TO authenticated;
GRANT ALL ON public.votes TO service_role;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own votes" ON public.votes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users cast own votes" ON public.votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.apply_vote()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.liked THEN
    UPDATE public.matches SET likes_count = likes_count + 1 WHERE id = NEW.match_id;
  ELSE
    UPDATE public.matches SET nopes_count = nopes_count + 1 WHERE id = NEW.match_id;
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER votes_apply AFTER INSERT ON public.votes FOR EACH ROW EXECUTE FUNCTION public.apply_vote();

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_match_author() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.apply_vote() FROM PUBLIC, anon, authenticated;

INSERT INTO public.matches (author_name, source, match, vibe, genre, likes_count, nopes_count) VALUES
('ana',   '{"id":"t3","title":"Late Night Drive","artist":"Tycho","color":"#3b82f6"}', '{"id":"t10","title":"Midnight City","artist":"M83","color":"#2563eb"}', 'late night drive', 'drive', 89, 12),
('leo',   '{"id":"t5","title":"Redbone","artist":"Childish Gambino","color":"#f43f5e"}', '{"id":"t4","title":"Nights","artist":"Frank Ocean","color":"#a855f7"}', 'warm summer haze', 'chill', 231, 30),
('mira',  '{"id":"t6","title":"After Hours","artist":"The Weeknd","color":"#6366f1"}', '{"id":"t7","title":"Resonance","artist":"HOME","color":"#8b5cf6"}', 'after midnight', 'lo-fi', 67, 15),
('sam',   '{"id":"t9","title":"Self Control","artist":"Frank Ocean","color":"#a78bfa"}', '{"id":"t2","title":"Sunsetz","artist":"Cigarettes After Sex","color":"#ec4899"}', 'soft heartbreak', 'love', 312, 40),
('kim',   '{"id":"t4","title":"Nights","artist":"Frank Ocean","color":"#a855f7"}', '{"id":"t8","title":"Pink + White","artist":"Frank Ocean","color":"#ec4899"}', 'frank ocean spiral', 'chill', 188, 22),
('yanis', '{"id":"t11","title":"Sweater Weather","artist":"The Neighbourhood","color":"#0ea5e9"}', '{"id":"t2","title":"Sunsetz","artist":"Cigarettes After Sex","color":"#ec4899"}', 'rap fr cold wave', 'rap-fr', 410, 50),
('elsa',  '{"id":"t12","title":"Ivy","artist":"Frank Ocean","color":"#22d3ee"}', '{"id":"t7","title":"Resonance","artist":"HOME","color":"#8b5cf6"}', 'neon euphoria', 'euphoria', 256, 28),
('jade',  '{"id":"t1","title":"Glimpse of Us","artist":"Joji","color":"#7c3aed"}', '{"id":"t8","title":"Pink + White","artist":"Frank Ocean","color":"#ec4899"}', 'melancholic dreams', 'love', 142, 18);
