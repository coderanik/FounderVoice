import Link from "next/link";

export function ClosingCtaSection() {
  return (
    <section className="border-t-[2.5px] border-[var(--ink)] px-5 py-12">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-lg opacity-80">Rule your pitch!</p>
        <h2 className="sketch-title mt-2 text-3xl md:text-4xl">Ready to build your investor pack?</h2>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/signup?role=founder" className="btn-primary">
            Get started free
          </Link>
          <Link href="/login" className="btn-secondary">
            Log in
          </Link>
        </div>
      </div>
    </section>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t-[2.5px] border-[var(--ink)] px-5 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="sketch-title text-xl">FounderVoice / PitchOS</p>
          <p className="mt-1 text-sm opacity-75">Mapped to User Stories 1–10</p>
        </div>
        <nav className="flex flex-wrap gap-4 text-sm">
          <Link href="/signup?role=founder" className="hover:underline">
            Sign up
          </Link>
          <Link href="/login" className="hover:underline">
            Log in
          </Link>
          <Link href="/app" className="hover:underline">
            Open app
          </Link>
        </nav>
      </div>
    </footer>
  );
}
