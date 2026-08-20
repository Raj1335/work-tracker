# Deploy Guide

## 1. Supabase (free tier)
1. Go to supabase.com → New Project. Pick any name/region, set a DB password (save it somewhere, you won't need it day-to-day).
2. Once created: SQL Editor → New query → paste everything from `supabase/schema.sql` → Run.
3. Project Settings → API → copy:
   - `Project URL` → this is `SUPABASE_URL`
   - `service_role` key (NOT `anon`) → this is `SUPABASE_SERVICE_ROLE_KEY`
   - Keep the service role key secret — it bypasses RLS. It only ever gets used server-side (Vercel env var), never in the browser.

## 2. Generate your password hash
Locally, with Node installed:
```
cd work-tracker
npm install
node scripts/hash-password.js "your-strong-password-here"
```
Use 12+ characters — this gates real work data. Copy the two printed lines
(`PASSWORD_HASH=...` and `SESSION_SECRET=...`) — you'll paste these into Vercel next.

## 3. Push to GitHub
```
git init
git add .
git commit -m "init"
```
Create a new (can be public, doesn't matter — no secrets are in the code) GitHub repo and push:
```
git remote add origin https://github.com/<you>/work-tracker.git
git branch -M main
git push -u origin main
```

## 4. Deploy on Vercel
1. vercel.com → New Project → import the GitHub repo.
2. Framework preset: Next.js (auto-detected).
3. Before deploying, add Environment Variables (Settings → Environment Variables, or during import):
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `PASSWORD_HASH`
   - `SESSION_SECRET`
4. Deploy.

## 5. Use it
Open the deployed URL on your phone, enter your password, add it to your home
screen (Chrome/Brave → "Add to Home Screen") so it opens like an app.

## Changing your password later
Run `node scripts/hash-password.js "new-password"` again, update `PASSWORD_HASH`
in Vercel's env vars, redeploy. (`SESSION_SECRET` can stay the same.)

## Backups
Use the "Export" button in the app anytime — downloads a CSV of everything.
Do this occasionally regardless of Supabase's own durability, since it's your
copy independent of the app staying up.

## Notes on the security model
- The service role key never reaches the browser — all DB access goes through
  Next.js API routes on the server, which check your session cookie first.
- Session cookie is a random signed token (httpOnly, secure, sameSite=strict),
  not derived from your password — so it can't be reversed even if leaked in
  a log somewhere.
- Supabase Row Level Security is enabled with no public policies, so even if
  someone got your anon/public key (they can't from this app, but as a second
  layer) they still can't read the table directly.
- The repo can safely be public — nothing secret is committed, only referenced
  via env vars.
