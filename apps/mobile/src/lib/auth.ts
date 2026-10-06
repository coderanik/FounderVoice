import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  AuthProvider,
  UserProfile,
  UserRole,
  cacheProfile,
  clearSession,
  getCachedProfile,
  getStaySignedIn,
  setStaySignedIn,
} from "@/lib/session";

WebBrowser.maybeCompleteAuthSession();

/** Native + Expo Go + web-safe OAuth redirect for Supabase (and Clerk-compatible). */
export function getAuthRedirectUri(): string {
  return makeRedirectUri({
    scheme: "pitchos",
    path: "auth/callback",
  });
}

export type SignUpFounderInput = {
  role: "founder";
  founderName: string;
  startupName: string;
  email: string;
  password: string;
  termsAccepted: boolean;
};

export type SignUpInvestorInput = {
  role: "investor";
  investorName: string;
  companyName: string;
  email: string;
  password: string;
  termsAccepted: boolean;
};

export type SignUpInput = SignUpFounderInput | SignUpInvestorInput;

export type SignInInput = {
  email: string;
  password: string;
};

type ProfileRow = {
  id: string;
  role: UserRole;
  display_name: string;
  org_name: string;
  email: string;
  terms_accepted: boolean;
  auth_provider: string;
};

function mapProfile(row: ProfileRow): UserProfile {
  const provider = row.auth_provider;
  return {
    id: row.id,
    name: row.display_name,
    email: row.email,
    role: row.role,
    orgName: row.org_name,
    termsAccepted: row.terms_accepted,
    authProvider: provider === "google" || provider === "github" ? provider : "email",
  };
}

async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, display_name, org_name, email, terms_accepted, auth_provider")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapProfile(data as ProfileRow);
}

async function upsertProfile(
  userId: string,
  patch: {
    role: UserRole;
    displayName: string;
    orgName: string;
    email: string;
    termsAccepted: boolean;
    authProvider: AuthProvider;
  },
): Promise<UserProfile> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: userId,
        role: patch.role,
        display_name: patch.displayName,
        org_name: patch.orgName,
        email: patch.email,
        terms_accepted: patch.termsAccepted,
        auth_provider: patch.authProvider,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    )
    .select("id, role, display_name, org_name, email, terms_accepted, auth_provider")
    .single();

  if (error) throw new Error(error.message);
  const profile = mapProfile(data as ProfileRow);
  await cacheProfile(profile);
  return profile;
}

/** Complete OAuth / magic-link session from a deep-link URL. */
export async function createSessionFromUrl(url: string): Promise<UserProfile | null> {
  if (!isSupabaseConfigured) return null;

  const { params, errorCode } = QueryParams.getQueryParams(url);
  if (errorCode) throw new Error(errorCode);

  const accessToken = params.access_token;
  const refreshToken = params.refresh_token;
  const code = params.code;

  const supabase = getSupabase();

  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) throw new Error(error.message);
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw new Error(error.message);
  } else {
    return getCurrentProfile();
  }

  return getCurrentProfile();
}

export async function getCurrentProfile(): Promise<UserProfile | null> {
  if (!isSupabaseConfigured) {
    return getCachedProfile();
  }

  const supabase = getSupabase();
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message);
  if (!data.session) {
    await cacheProfile(null);
    return null;
  }

  const profile = await fetchProfile(data.session.user.id);
  if (profile) {
    await cacheProfile(profile);
    return profile;
  }

  // OAuth first login before trigger/profile row settles
  const email = data.session.user.email ?? "";
  const providerRaw = data.session.user.app_metadata?.provider;
  const authProvider: AuthProvider =
    providerRaw === "google" || providerRaw === "github" ? providerRaw : "email";

  return upsertProfile(data.session.user.id, {
    role: "founder",
    displayName: data.session.user.user_metadata?.full_name || email.split("@")[0] || "User",
    orgName: "",
    email,
    termsAccepted: false,
    authProvider,
  });
}

export async function ensureSessionPersistence(): Promise<UserProfile | null> {
  const stay = await getStaySignedIn();
  if (!stay) {
    if (isSupabaseConfigured) {
      await getSupabase().auth.signOut();
    }
    await clearSession();
    return null;
  }
  return getCurrentProfile();
}

export async function signUpWithEmail(input: SignUpInput): Promise<UserProfile> {
  if (!input.termsAccepted) {
    throw new Error("Please accept the Terms and Conditions to continue.");
  }
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured. Add keys to apps/mobile/.env");
  }

  const email = input.email.trim().toLowerCase();
  const displayName =
    input.role === "founder" ? input.founderName.trim() : input.investorName.trim();
  const orgName =
    input.role === "founder" ? input.startupName.trim() : input.companyName.trim();

  if (!displayName || !orgName || !email || !input.password) {
    throw new Error("Please fill in all required fields.");
  }

  await setStaySignedIn(true);

  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signUp({
    email,
    password: input.password,
    options: {
      data: {
        role: input.role,
        display_name: displayName,
        org_name: orgName,
        terms_accepted: true,
      },
    },
  });

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Sign up failed. Try again.");

  // Email confirmation is on: Supabase creates the user but withholds the session JWT
  // until the inbox link is opened. Profile writes need that JWT (row-level security).
  if (!data.session) {
    throw new Error("Account created. Open the confirmation email from Supabase, then sign in.");
  }

  const profile = await upsertProfile(data.user.id, {
    role: input.role,
    displayName,
    orgName,
    email,
    termsAccepted: true,
    authProvider: "email",
  });

  return profile;
}

export async function signInWithEmail(input: SignInInput): Promise<UserProfile> {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured. Add keys to apps/mobile/.env");
  }

  const email = input.email.trim().toLowerCase();
  if (!email || !input.password) {
    throw new Error("Email and password are required.");
  }

  await setStaySignedIn(true);

  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: input.password,
  });

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Sign in failed. Try again.");

  const profile = await getCurrentProfile();
  if (!profile) throw new Error("Profile not found. Contact support.");
  return profile;
}

export async function signInWithOAuth(provider: "google" | "github"): Promise<UserProfile> {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured. Add keys to apps/mobile/.env");
  }

  await setStaySignedIn(true);

  const supabase = getSupabase();
  const redirectTo = getAuthRedirectUri();

  if (__DEV__) {
    console.log("[auth] OAuth redirectTo →", redirectTo);
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) throw new Error(error.message);
  if (!data.url) throw new Error("Could not start OAuth flow.");

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== "success" || !result.url) {
    throw new Error("Sign in was cancelled.");
  }

  const profile = await createSessionFromUrl(result.url);
  if (!profile) throw new Error("OAuth succeeded but no profile returned.");

  // Ensure auth_provider matches the button they used
  return upsertProfile(profile.id, {
    role: profile.role,
    displayName: profile.name,
    orgName: profile.orgName,
    email: profile.email,
    termsAccepted: profile.termsAccepted,
    authProvider: provider,
  });
}

export async function acceptTermsAndCompleteProfile(input: {
  role: UserRole;
  displayName: string;
  orgName: string;
}): Promise<UserProfile> {
  const current = await getCurrentProfile();
  if (!current) throw new Error("You must be signed in.");

  if (!input.displayName.trim() || !input.orgName.trim()) {
    throw new Error("Please complete your profile details.");
  }

  return upsertProfile(current.id, {
    role: input.role,
    displayName: input.displayName.trim(),
    orgName: input.orgName.trim(),
    email: current.email,
    termsAccepted: true,
    authProvider: current.authProvider,
  });
}

export async function confirmStaySignedIn(stay: boolean): Promise<void> {
  await setStaySignedIn(stay);
}

export async function signOut(): Promise<void> {
  if (isSupabaseConfigured) {
    await getSupabase().auth.signOut();
  }
  await clearSession();
  await setStaySignedIn(true);
}

export function needsTermsGate(profile: UserProfile | null): boolean {
  if (!profile) return false;
  return !profile.termsAccepted;
}
