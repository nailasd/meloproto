import { createServerFn } from "@tanstack/react-start";
import { createHmac } from "crypto";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SPOTIFY_CLIENT_ID = "30d8543ba87d4541b48afde4adc3b105";
const SCOPES = ["user-top-read", "user-read-email"].join(" ");

function signState(userId: string, secret: string): string {
  const sig = createHmac("sha256", secret).update(userId).digest("hex").slice(0, 32);
  return `${userId}.${sig}`;
}

export const getSpotifyAuthUrl = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const secret = process.env["SPOTIFY_CLIENT_SECRET"]!;
    const origin = new URL(context.request.url).origin;
    const redirectUri = `${origin}/api/spotify/callback`;
    const params = new URLSearchParams({
      client_id: SPOTIFY_CLIENT_ID,
      response_type: "code",
      redirect_uri: redirectUri,
      scope: SCOPES,
      state: signState(context.userId, secret),
      show_dialog: "true",
    });
    return { url: `https://accounts.spotify.com/authorize?${params.toString()}` };
  });
