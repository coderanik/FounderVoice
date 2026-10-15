import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";

let ready: Promise<void> | null = null;

function ensureTable() {
  if (!ready) {
    const sql = getSql();
    ready = sql`
      CREATE TABLE IF NOT EXISTS waitlist (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        email text UNIQUE NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `.then(() => undefined);
  }
  return ready;
}

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "Waiting list is not connected yet." },
      { status: 503 },
    );
  }

  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Enter an email address." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase() ?? "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  try {
    await ensureTable();
    const sql = getSql();
    await sql`INSERT INTO waitlist (email) VALUES (${email})`;
    return NextResponse.json({ message: "You're on the list. We'll be in touch." });
  } catch (error) {
    const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
    if (code === "23505") {
      return NextResponse.json({ message: "You're already on the list." });
    }
    return NextResponse.json(
      { error: "Couldn't join the waiting list. Try again." },
      { status: 500 },
    );
  }
}
