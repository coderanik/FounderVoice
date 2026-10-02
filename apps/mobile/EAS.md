# EAS + Auth setup (PitchOS mobile)

Expo project: [@coderanik/pitchos](https://expo.dev/accounts/coderanik/projects/pitchos)  
Project ID: `f1dea53f-665e-4d4b-8642-202cdc8e0c0b`  
URL scheme: `pitchos`  
OAuth redirect: `pitchos://auth/callback`

This app uses **Supabase Auth** today. The same scheme/redirect pattern works for **Clerk** native OAuth if you switch later.

## Why EAS (not Expo Go) for OAuth

Google/GitHub OAuth needs a stable redirect URI baked into a **development or production build**. Expo Go uses `exp://…` URLs that change and are easy to misconfigure in Supabase/Clerk.

## 1. Local env

```bash
cp apps/mobile/.env.example apps/mobile/.env
# fill EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_ANON_KEY
```

## 2. Push secrets to EAS (required for cloud builds)

From `apps/mobile`:

```bash
npx eas-cli env:create --name EXPO_PUBLIC_SUPABASE_URL \
  --value "https://YOUR_PROJECT.supabase.co" \
  --environment development --visibility plaintext --non-interactive

npx eas-cli env:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY \
  --value "your_anon_key" \
  --environment development --visibility sensitive --non-interactive
```

Repeat for `--environment preview` and `--environment production`.

Optional:

```bash
npx eas-cli env:create --name EXPO_PUBLIC_API_BASE \
  --value "https://your-api.example.com/api" \
  --environment production --visibility plaintext --non-interactive
```

## 3. Supabase Auth redirect allowlist

Dashboard → **Authentication → URL Configuration → Redirect URLs**, add:

| Environment | Redirect URL |
|-------------|--------------|
| EAS / store builds | `pitchos://auth/callback` |
| Broad native match | `pitchos://**` |
| Expo Go (dev only) | `exp://**` |
| Expo proxy (optional) | `https://auth.expo.io/@coderanik/pitchos` |

Site URL can stay your web origin; native OAuth uses the custom scheme above.

Enable **Email**, **Google**, and **GitHub** under Authentication → Providers. For Google/GitHub, set the provider callback to Supabase’s callback URL (shown in the provider settings), not the app scheme.

## 4. Clerk (if you switch later)

In Clerk Dashboard → Native applications, use the same scheme:

- iOS/Android redirect: `pitchos://auth/callback`
- Bundle ID / package: `com.pitchos.app`

## 5. Build & run

```bash
cd apps/mobile

# iOS Simulator (dev client — OAuth works here)
npx eas-cli build --profile development --platform ios

# Physical device
npx eas-cli build --profile development:device --platform ios
npx eas-cli build --profile development:device --platform android

# Internal preview / production
npx eas-cli build --profile preview --platform all
npx eas-cli build --profile production --platform all
```

After a development build installs:

```bash
npx expo start --dev-client --port 19006
```

Or: `npm run start:dev-client`

## 6. Verify redirect URI

In a development build, tap Google/GitHub once. Metro logs:

```text
[auth] OAuth redirectTo → pitchos://auth/callback
```

That exact string must be allowed in Supabase (or Clerk).

## Profiles (`eas.json`)

| Profile | Purpose |
|---------|---------|
| `development` | Dev client, iOS Simulator |
| `development:device` | Dev client, physical devices |
| `preview` | Internal distribution |
| `production` | Store builds |
