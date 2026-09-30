import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

const SPOTIFY_CLIENT_ID = "30d8543ba87d4541b48afde4adc3b105";

function verifyState(state: string, secret: string): string | null {
  const [userId, sig] = state.split(".");
  if (!userId || !sig) return null;
  const expected = createHmac("sha256", secret).update(userId).digest("hex").slice(0, 32);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return userId;
}

export const Route = createFileRoute("/api/spotify/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const origin = url.origin;
        const fail = (reason: string) =>
          Response.redirect(`${origin}/onboarding?spotify=error&reason=${encodeURIComponent(reason)}`, 302);

        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const spotifyError = url.searchParams.get("error");
        if (spotifyError) return fail(spotifyError);
        if (!code || !state) return fail("missing_params");

        const secret = process.env["SPOTIFY_CLIENT_SECRET"]!;
        const userId = verifyState(state, secret);
        if (!userId) return fail("invalid_state");

        // Exchange the code for tokens (server-side only)
        const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            code,
            redirect_uri: `${origin}/api/spotify/callback`,
            client_id: SPOTIFY_CLIENT_ID,
            client_secret: secret,
          }),
        });
        if (!tokenRes.ok) return fail("token_exchange");
        const tokens = (await tokenRes.json()) as {
          access_token: string;
          refresh_token?: string;
          expires_in: number;
          scope: string;
        };

        // Fetch the user's top artists to build their musical profile
        let topGenres: string[] = [];
        let topArtists: { name: string; image?: string }[] = [];
        try {
          const topRes = await fetch("https://api.spotify.com/v1/me/top/artists?limit=10&time_range=medium_term", {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
          });
          if (topRes.ok) {
            const top = (await topRes.json()) as {
              items: { name: string; genres: string[]; images?: { url: string }[] }[];
            };
            topArtists = top.items.slice(0, 10).map((a) => ({ name: a.name, image: a.images?.[0]?.url }));
            const genreCount = new Map<string, number>();
            for (const a of top.items) for (const g of a.genres) genreCount.set(g, (genreCount.get(g) ?? 0) + 1);
            topGenres = [...genreCount.entries()].sort((x, y) => y[1] - x[1]).slice(0, 6).map(([g]) => g);
          }
        } catch {
          // Non-blocking: tokens are still saved
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();
        const { error } = await supabaseAdmin.from("spotify_connections" as never).upsert(
          {
            user_id: userId,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token ?? null,
            expires_at: expiresAt,
            scope: tokens.scope,
            top_artists: topArtists,
            updated_at: new Date().toISOString(),
          } as never,
          { onConflict: "user_id" },
        );
        if (error) return fail("save_failed");

        if (topGenres.length > 0) {
          await supabaseAdmin.from("profiles").update({ top_genres: topGenres } as never).eq("id", userId);
        }

        return Response.redirect(`${origin}/onboarding?spotify=done`, 302);
      },
    },
  },
});
