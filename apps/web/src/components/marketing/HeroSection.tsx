import Link from "next/link";
import { PhoneHeader, PhoneMockup } from "@/components/marketing/PhoneMockup";

export function HeroSection() {
  return (
    <section className="px-5 pb-16 pt-12 md:pb-24 md:pt-16">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-10">
        <div className="animate-fade-up">
          <p className="text-lg opacity-80">Rule your pitch!</p>
          <h1 className="sketch-title mt-2 text-5xl leading-[1.05] md:text-6xl lg:text-7xl">
            Fundraising readiness for first-time founders
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed opacity-85">
            Speak your pitch. PitchOS turns your voice into a verified claim graph, runs an investor
            critic, and exports a deck + model — without inventing numbers.
          </p>
          <p className="mt-3 text-base opacity-70">
            Voice → Claim graph → Investor-ready pack
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup?role=founder" className="btn-primary">
              Start as founder
            </Link>
            <Link href="/signup?role=investor" className="btn-secondary">
              I&apos;m an investor
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4 lg:justify-end animate-fade-up [animation-delay:100ms]">
          <PhoneMockup label="Splash">
            <div className="phone-logo-box">
              <div className="phone-logo-text">PitchOS</div>
              <div className="phone-tagline">Rule your pitch!</div>
              <div className="mt-5 text-3xl">🎙</div>
            </div>
          </PhoneMockup>

          <PhoneMockup label="My Projects">
            <PhoneHeader left="☰" title="My Projects" right="+ NEW" />
            <div className="phone-segment">
              <span className="active">Founder</span>
              <span>Investor</span>
            </div>
            <div className="phone-list-item">
              <div>
                <strong>Acme AI</strong>
                <div className="phone-meta">Readiness 72% · 3 gaps · Draft deck</div>
              </div>
              <span>›</span>
            </div>
            <div className="phone-list-item">
              <div>
                <strong>GreenRoute</strong>
                <div className="phone-meta">Readiness 45% · Voice captured</div>
              </div>
              <span>›</span>
            </div>
            <div className="phone-list-item">
              <div>
                <strong>HealthBridge</strong>
                <div className="phone-meta">Investor-ready ✓</div>
              </div>
              <span>›</span>
            </div>
          </PhoneMockup>

          <PhoneMockup label="Voice Capture" tall>
            <PhoneHeader left="‹" title="Voice Capture" />
            <p className="text-center text-[10px]">Explain your business idea naturally</p>
            <div className="phone-mic">🎙</div>
            <p className="text-center text-[10px] font-bold">TAP TO RECORD</p>
            <p className="mt-4 text-[9px] leading-relaxed opacity-80">
              &ldquo;We&apos;re building PitchOS — fundraising readiness for first-time founders…&rdquo;
            </p>
          </PhoneMockup>
        </div>
      </div>
    </section>
  );
}
