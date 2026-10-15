export type UserRole = "founder" | "investor";

export type StubSession = {
  name: string;
  email: string;
  role: UserRole;
};

const SESSION_KEY = "pitchos_session";

export function getSession(): StubSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StubSession;
  } catch {
    return null;
  }
}

export function setSession(session: StubSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function roleLabel(role: UserRole): string {
  return role === "founder" ? "Founder" : "Investor";
}
