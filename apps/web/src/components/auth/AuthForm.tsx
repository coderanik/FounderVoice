"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setSession, type UserRole } from "@/lib/session";
import { FounderVoiceLogo } from "@/components/brand/FounderVoiceLogo";

type AuthMode = "login" | "signup";

const inputClass =
  "w-full border-[1.5px] border-[var(--ink)] bg-white px-3 py-2.5 outline-none focus:ring-2 focus:ring-[var(--ink)]";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<UserRole>("founder");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const r = searchParams.get("role");
    if (r === "founder" || r === "investor") setRole(r);
  }, [searchParams]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }
    if (mode === "signup" && !name.trim()) {
      setError("Name is required to create an account.");
      return;
    }

    setSession({
      name: name.trim() || email.split("@")[0],
      email: email.trim(),
      role,
    });
    router.push("/app");
  }

  const isLogin = mode === "login";

  return (
    <div className="marketing-page flex min-h-screen flex-col">
      <div className="flex flex-1 items-center justify-center px-5 py-16">
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center text-center">
            <Link href="/" className="inline-flex items-center justify-center hover:opacity-90 transition-opacity">
              <FounderVoiceLogo variant="horizontal" size={44} />
            </Link>
            <p className="mt-3 text-sm opacity-65">
              {isLogin ? "Welcome back — log in to continue" : "Create your account to start capturing"}
            </p>
          </div>

          <div className="sketch-card p-8">
            <div className="phone-segment mb-6">
              {(["founder", "investor"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={role === r ? "active" : ""}
                >
                  {r}
                </button>
              ))}
            </div>

            <form className="space-y-4" onSubmit={onSubmit}>
              {!isLogin ? (
                <label className="block">
                  <span className="mb-1 block text-sm font-bold">Name</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className={inputClass}
                  />
                </label>
              ) : null}

              <label className="block">
                <span className="mb-1 block text-sm font-bold">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className={inputClass}
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-bold">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                />
              </label>

              {error ? <p className="text-sm font-bold text-red-700">{error}</p> : null}

              <button type="submit" className="btn-primary w-full">
                {isLogin ? "Log in" : "Create account"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm opacity-75">
              {isLogin ? (
                <>
                  No account?{" "}
                  <Link href={`/signup?role=${role}`} className="font-bold underline">
                    Sign up
                  </Link>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <Link href={`/login?role=${role}`} className="font-bold underline">
                    Log in
                  </Link>
                </>
              )}
            </p>

            <p className="mt-4 text-center">
              <Link href="/app" className="text-xs opacity-60 hover:opacity-100">
                Continue without account →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
