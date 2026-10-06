import AsyncStorage from "@react-native-async-storage/async-storage";

export type UserRole = "founder" | "investor";
export type AuthProvider = "email" | "google" | "github";

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  orgName: string;
  termsAccepted: boolean;
  authProvider: AuthProvider;
};

const STAY_SIGNED_IN_KEY = "pitchos_stay_signed_in";
const PROFILE_CACHE_KEY = "pitchos_profile_cache";

export function roleLabel(role: UserRole): string {
  return role === "founder" ? "Founder" : "Investor";
}

export async function getStaySignedIn(): Promise<boolean> {
  const value = await AsyncStorage.getItem(STAY_SIGNED_IN_KEY);
  return value !== "0";
}

export async function setStaySignedIn(value: boolean): Promise<void> {
  await AsyncStorage.setItem(STAY_SIGNED_IN_KEY, value ? "1" : "0");
}

export async function cacheProfile(profile: UserProfile | null): Promise<void> {
  if (!profile) {
    await AsyncStorage.removeItem(PROFILE_CACHE_KEY);
    return;
  }
  await AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
}

export async function getCachedProfile(): Promise<UserProfile | null> {
  try {
    const raw = await AsyncStorage.getItem(PROFILE_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

/** @deprecated use getCurrentProfile from auth */
export type StubSession = UserProfile;

/** @deprecated use getCurrentProfile from auth */
export async function getSession(): Promise<UserProfile | null> {
  return getCachedProfile();
}

/** @deprecated use auth signup/signin */
export async function setSession(session: UserProfile): Promise<void> {
  await cacheProfile(session);
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.multiRemove([PROFILE_CACHE_KEY]);
}
