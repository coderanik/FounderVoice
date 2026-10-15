"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { api, Project } from "@/lib/api";
import { getSession, roleLabel } from "@/lib/session";
import { FounderVoiceLogo } from "@/components/brand/FounderVoiceLogo";

export default function AppHomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [founder, setFounder] = useState("");
  const [strict, setStrict] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [roleBadge, setRoleBadge] = useState<string | null>(null);

  async function load() {
    try {
      setProjects(await api.listProjects());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load projects. Is the API running on :8010?");
    }
  }

  useEffect(() => {
    load();
    const session = getSession();
    if (session) {
      setRoleBadge(roleLabel(session.role));
      if (session.role === "founder") {
        setFounder((prev) => prev || session.name);
      }
    }
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const p = await api.createProject({
        name,
        founder_name: founder,
        strict_mode: strict,
        language: "en",
      });
      window.location.href = `/app/projects/${p.id}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell">
      <header className="topbar">
        <Link href="/" className="inline-flex items-center hover:opacity-90 transition-opacity">
          <FounderVoiceLogo variant="horizontal" size={36} />
        </Link>
        <div className="row">
          {roleBadge ? <span className="badge">{roleBadge}</span> : null}
          <Link href="/" className="muted">
            ← Landing
          </Link>
        </div>
      </header>

      <div className="grid two">
        <section className="card">
          <h2>New project</h2>
          <form className="stack" onSubmit={onCreate}>
            <label className="field">
              Startup / project name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Your startup name"
              />
            </label>
            <label className="field">
              Founder name
              <input
                value={founder}
                onChange={(e) => setFounder(e.target.value)}
                placeholder="Your name"
              />
            </label>
            <label className="row" style={{ gap: "0.5rem" }}>
              <input type="checkbox" checked={strict} onChange={(e) => setStrict(e.target.checked)} />
              Strict mode (watermark export until claims are confirmed)
            </label>
            <button type="submit" disabled={loading}>
              {loading ? "Creating…" : "Create project"}
            </button>
          </form>
          {error ? <p className="error" style={{ marginTop: "1rem" }}>{error}</p> : null}
        </section>

        <section className="card">
          <h2>Projects</h2>
          {projects.length === 0 ? (
            <p className="muted">No projects yet. Create one to start the pipeline.</p>
          ) : (
            <ul className="list">
              {projects.map((p) => (
                <li key={p.id}>
                  <Link href={`/app/projects/${p.id}`}>
                    <strong>{p.name}</strong>
                    <div className="muted">
                      {p.status} · readiness {p.readiness_score.toFixed(0)} · {p.strict_mode ? "strict" : "exploratory"}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
