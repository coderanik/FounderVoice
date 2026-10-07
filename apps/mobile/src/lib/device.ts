import * as SecureStore from "expo-secure-store";

const KEY_SEEN = "fv_app_installed_marker";
const KEY_EMAIL = "fv_saved_email";
const KEY_PASSWORD = "fv_saved_password";
const KEY_ONBOARDING = "fv_onboarding_done";

/** Survives reinstall on many iOS devices via Keychain. */
export async function hasPreviousInstall(): Promise<boolean> {
  try {
    const value = await SecureStore.getItemAsync(KEY_SEEN);
    return value === "1";
  } catch {
    return false;
  }
}

export async function markAppInstalled(): Promise<void> {
  try {
    await SecureStore.setItemAsync(KEY_SEEN, "1");
  } catch {
    // ignore
  }
}

export async function isOnboardingDone(): Promise<boolean> {
  try {
    return (await SecureStore.getItemAsync(KEY_ONBOARDING)) === "1";
  } catch {
    return false;
  }
}

export async function markOnboardingDone(): Promise<void> {
  try {
    await SecureStore.setItemAsync(KEY_ONBOARDING, "1");
  } catch {
    // ignore
  }
}

export async function clearOnboardingDone(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(KEY_ONBOARDING);
  } catch {
    // ignore
  }
}

/**
 * After onboarding:
 * - Fresh device → Sign up
 * - Returning device (SecureStore marker from a prior install/use) → Sign in
 */
export async function getPostOnboardingAuthRoute(): Promise<"/login" | "/signup"> {
  const returning = await hasPreviousInstall();
  await markAppInstalled();
  return returning ? "/login" : "/signup";
}

export async function saveCredentialsSecurely(
  email: string,
  password: string,
): Promise<void> {
  await SecureStore.setItemAsync(KEY_EMAIL, email.trim().toLowerCase());
  await SecureStore.setItemAsync(KEY_PASSWORD, password);
}

export async function clearSavedCredentials(): Promise<void> {
  await SecureStore.deleteItemAsync(KEY_EMAIL);
  await SecureStore.deleteItemAsync(KEY_PASSWORD);
}

export async function loadSavedCredentials(): Promise<{
  email: string;
  password: string;
} | null> {
  try {
    const email = await SecureStore.getItemAsync(KEY_EMAIL);
    const password = await SecureStore.getItemAsync(KEY_PASSWORD);
    if (!email || !password) return null;
    return { email, password };
  } catch {
    return null;
  }
}
