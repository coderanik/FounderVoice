import Constants from "expo-constants";
import { Platform } from "react-native";

function devMachineHost(): string | null {
  // Expo Go / dev client already reached this machine to load the bundle.
  const hostUri = Constants.expoGoConfig?.debuggerHost ?? Constants.expoConfig?.hostUri;
  const host = hostUri?.split(":")[0]?.trim();
  if (!host || host === "localhost" || host === "127.0.0.1") return null;
  return host;
}

function hostOf(url: string): string | null {
  const match = url.match(/^https?:\/\/([^/:]+)/i);
  return match?.[1] ?? null;
}

/** Loopback and private LAN addresses are dev targets, not a deployed API. */
function isDevHost(host: string): boolean {
  if (host === "localhost" || host === "127.0.0.1") return true;
  if (host.startsWith("10.")) return true;
  if (host.startsWith("192.168.")) return true;
  const parts = host.split(".").map((part) => Number(part));
  if (parts.length === 4 && parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  return false;
}

function resolveApiBase(): string {
  const raw = (process.env.EXPO_PUBLIC_API_BASE || "http://127.0.0.1:8010/api").replace(/\/$/, "");
  const configuredHost = hostOf(raw);

  // A public or https production URL stays as configured.
  if (!configuredHost || !isDevHost(configuredHost)) return raw;

  // A phone already reached this computer for Metro. Use that host so a stale
  // LAN IP in .env (the machine's address changes) does not leave the app disconnected.
  const host = devMachineHost();
  if (host) {
    return raw.replace(`://${configuredHost}`, `://${host}`);
  }

  // Android emulator cannot reach the host via 127.0.0.1.
  if (Platform.OS === "android" && (configuredHost === "localhost" || configuredHost === "127.0.0.1")) {
    return raw.replace(`://${configuredHost}`, "://10.0.2.2");
  }

  return raw;
}

export const API_BASE = resolveApiBase();
