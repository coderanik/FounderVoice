# Auth setup (Supabase)

1. Create a project at https://supabase.com
2. Run `supabase/migrations/001_profiles.sql` in the SQL editor
3. Enable Email, Google, and GitHub under Authentication → Providers
4. Add redirect URLs under Authentication → URL Configuration:
   - `pitchos://auth/callback`  ← EAS / production / dev-client builds
   - `pitchos://**`
   - `exp://**`                 ← Expo Go only
   - `https://auth.expo.io/@coderanik/pitchos`  ← optional Expo auth proxy
5. Copy Project URL + anon key into `apps/mobile/.env`
6. For cloud builds, also set the same keys as EAS environment variables
   (see `apps/mobile/EAS.md`)

See `apps/mobile/.env.example` for variable names.
See `apps/mobile/EAS.md` for Expo Application Services setup.
