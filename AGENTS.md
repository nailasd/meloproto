<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Melo — architecture rules

- App pages live under `src/routes/_authenticated/`; `/auth` is the only public page — every tester must have their own account.
- Data access goes through `src/lib/melo-data.ts` (React Query + browser client, RLS enforced) — one place to audit per-user data.
- Votes are private per user (RLS on user_id); like/nope counts are updated only by a database trigger — users can't tamper with counts.
- Matches are readable by all signed-in users, insertable/deletable only by their author (author set by trigger from auth.uid()).
- Sign-out clears the query cache — no data leaks between users on the same device.
- Spotify tokens (next step) must stay server-side only, never sent to the browser.
