"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FounderVoiceLogo } from "@/components/brand/FounderVoiceLogo";

export function MarketingNav() {
  const pathname = usePathname();
  const onLanding = pathname === "/";

  return (
    <header className="sticky top-0 z-50 border-b-[2.5px] border-[var(--ink)] bg-[var(--paper)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <Link href="/" aria-label="founderVoice" className="flex items-center hover:opacity-90 transition-opacity">
          <FounderVoiceLogo variant="compact" size={32} />
        </Link>

        {onLanding ? (
          <p className="hidden text-sm opacity-70 md:block">Rule your pitch!</p>
        ) : null}

        <div className="flex items-center gap-2">
          <Link href="/login" className="btn-secondary px-3 py-2 text-sm">
            Log in
          </Link>
          <Link href="/signup" className="btn-primary px-3 py-2 text-sm">
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
