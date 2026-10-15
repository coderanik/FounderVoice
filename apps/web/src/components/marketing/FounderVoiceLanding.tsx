"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Check,
  CircleHelp,
  FileCheck2,
  FileText,
  GitBranch,
  Headphones,
  Menu,
  Play,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import "./founder-voice-landing.css";
import { FounderVoiceLogo } from "@/components/brand/FounderVoiceLogo";

const problems: [string, string, LucideIcon][] = [
  ["Narrative compression", "Problem → insight → solution → why now → why us", FileText],
  ["Number honesty", "Real unit economics, not Excel theater", ShieldCheck],
  [
    "Diligence consistency",
    "Decks, calls, and emails that don't contradict each other",
    GitBranch,
  ],
];

const loop: [string, string, LucideIcon][] = [
  ["Capture", "Voice / chat / docs", Headphones],
  ["Structure", "Claim Graph", GitBranch],
  ["Stress-test", "Investor Critic Agent", CircleHelp],
  ["Resolve", "Confirmed claims only", ShieldCheck],
  ["Render", "Deck / model / FAQ", FileText],
  ["Rehearse", "Mock investor Q&A", Sparkles],
];

const agents = [
  ["Scribe", "Never lose context"],
  ["Extractor", "Only cite source"],
  ["Investor Critic", "Ask the hard question"],
  ["Benchmarker", "Label every benchmark"],
  ["Modeler", "Show the assumptions"],
  ["Narrator", "No invented facts"],
  ["Consistency Auditor", "Catch the mismatch"],
];


function Logo() {
  return (
    <a href="#top" className="logo" aria-label="founderVoice">
      <FounderVoiceLogo variant="compact" size={32} />
    </a>
  );
}

function Provenance({
  children,
  tone = "founder",
}: {
  children: React.ReactNode;
  tone?: string;
}) {
  return <span className={`provenance ${tone}`}>{children}</span>;
}

function HeroVisual() {
  const nodes = [
    ["MARKET", 28, 31],
    ["TRACTION", 70, 21],
    ["TEAM", 59, 66],
    ["ASK", 81, 64],
    ["PROBLEM", 24, 72],
  ] as const;

  return (
    <div className="hero-visual" aria-label="Voice memo resolving into a Claim Graph visualization">
      <div className="visual-top">
        <span className="eyebrow-dot" /> live claim graph <span className="mono">FV-0428</span>
      </div>
      <div className="waveform">
        {Array.from({ length: 38 }, (_, i) => (
          <i key={i} style={{ height: `${18 + ((i * 17) % 54)}%`, animationDelay: `${i * 35}ms` }} />
        ))}
      </div>
      <svg className="graph-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="line" x1="0" x2="1">
            <stop stopColor="#7c3aed" />
            <stop offset="1" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        <path
          d="M28 31L70 21 59 66 81 64M28 31L24 72 59 66"
          stroke="url(#line)"
          strokeWidth=".6"
          fill="none"
          strokeDasharray="3 2"
        />
      </svg>
      {nodes.map(([label, left, top], i) => (
        <div
          key={label}
          className={`graph-node node-${i}`}
          style={{ left: `${left}%`, top: `${top}%` }}
        >
          <span className="node-dot" />
          {label}
          <small>
            {i === 1 ? "Founder-stated" : i === 3 ? "Unverified" : "Confirmed"}
          </small>
        </div>
      ))}
      <div className="visual-footer">
        <span className="mono">12 claims resolved</span>
        <span>
          <Provenance>Founder-stated</Provenance>{" "}
          <Provenance tone="unverified">Unverified</Provenance>
        </span>
      </div>
    </div>
  );
}

function Price({
  name,
  price,
  copy,
  items,
  featured = false,
}: {
  name: string;
  price: string;
  copy: string;
  items: string[];
  featured?: boolean;
}) {
  return (
    <article className={`price-card ${featured ? "featured" : ""}`}>
      <div className="price-name">
        {name}
        {featured && <span>Most popular</span>}
      </div>
      <h3>
        {price}
        <small>/mo</small>
      </h3>
      <p>{copy}</p>
      <ul>
        {items.map((item) => (
          <li key={item}>
            <Check size={15} />
            {item}
          </li>
        ))}
      </ul>
      <a className={featured ? "button" : "ghost"} href="#top">
        Choose {name} <ArrowRight size={15} />
      </a>
    </article>
  );
}

export function FounderVoiceLanding() {
  const [menu, setMenu] = useState(false);
  const [annual, setAnnual] = useState(false);
  const [strict, setStrict] = useState(true);
  const [playing, setPlaying] = useState(false);

  return (
    <main id="top" className="fv-landing">
      <nav className="nav">
        <div className="nav-inner">
          <Logo />
          <div className={`nav-links ${menu ? "open" : ""}`}>
            <a href="#product" onClick={() => setMenu(false)}>
              Product
            </a>
            <a href="#how" onClick={() => setMenu(false)}>
              How it works
            </a>
            <a href="#pricing" onClick={() => setMenu(false)}>
              Pricing
            </a>
            <a href="#accelerators" onClick={() => setMenu(false)}>
              For Accelerators
            </a>
          </div>
          <div className="nav-actions">
            <a className="ghost small" href="#demo">
              Book a Demo
            </a>
            <a className="button small" href="#pricing">
              Start Free <ArrowRight size={15} />
            </a>
            <button
              className="menu-button"
              onClick={() => setMenu(!menu)}
              aria-label="Toggle navigation"
            >
              {menu ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      <section className="hero section-pad">
        <div className="hero-copy">
          <div className="eyebrow">Fundraising Readiness Infrastructure</div>
          <h1>
            Turn rambling founder thinking into an <em>investor-ready truth.</em>
          </h1>
          <p className="lede">
            FounderVoice extracts a structured, honest Claim Graph from your voice, chat, and docs —
            then renders decks, financial models, and FAQs that never contradict each other.
          </p>
          <div className="cta-row">
            <a className="button" href="#pricing">
              Start Free — no card <ArrowRight size={17} />
            </a>
            <button className="ghost" onClick={() => setPlaying(!playing)}>
              <Play size={16} fill="currentColor" />{" "}
              {playing ? "Playing demo…" : "Watch 2-min demo"}
            </button>
          </div>
          <p className="trust">
            <Check size={15} />
            No invented metrics. Ever.
          </p>
        </div>
        <HeroVisual />
      </section>

      <div className="ticker">
        <span>Trusted by founders applying to</span>
        <b>YC</b>
        <b>TECHSTARS</b>
        <b>EU EIC</b>
        <b>500 GLOBAL</b>
        <b>ANTLER</b>
      </div>

      <section id="product" className="section-pad problem">
        <div className="section-intro">
          <span className="kicker">The uncomfortable part</span>
          <h2>Fundraising breaks when the story outruns the source.</h2>
          <p>Hiring a banker costs $5k–$25k+. Generic AI tools produce pretty lies.</p>
        </div>
        <div className="three-grid">
          {problems.map(([title, copy, Icon]) => (
            <article className="line-card" key={title}>
              <Icon />
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="how" className="section-pad loop-section">
        <div className="section-intro center">
          <span className="kicker">The core loop</span>
          <h2>One source of truth. Every output in sync.</h2>
          <p>Change one number once. Your deck, model, FAQ, and investor update all stay in sync.</p>
        </div>
        <div className="loop-grid">
          {loop.map(([title, copy, Icon], i) => (
            <div className="loop-item" key={title}>
              <div className="loop-icon">
                <Icon />
              </div>
              <span className="mono">0{i + 1}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-pad claim-section">
        <div className="claim-copy">
          <span className="kicker">The flagship feature</span>
          <h2>
            Meet the <em>Claim Graph.</em>
          </h2>
          <p>
            Not a JSON dump. A typed ontology of your company — every claim tagged Founder-stated,
            Benchmark-derived, Placeholder, or Unverified.
          </p>
          <p className="mono quote">“No silent invention.”</p>
          <div className="legend">
            <Provenance>Founder-stated</Provenance>
            <Provenance tone="benchmark">Benchmark-derived</Provenance>
            <Provenance tone="placeholder">Placeholder</Provenance>
            <Provenance tone="unverified">Unverified</Provenance>
          </div>
        </div>
        <HeroVisual />
      </section>

      <section className="section-pad honesty">
        <div className="honesty-card">
          <div>
            <span className="kicker amber">The honesty engine</span>
            <h2>
              The opposite of <em>AI hype.</em>
            </h2>
            <div className="toggle-row">
              <span>Strict mode</span>
              <button
                className={`toggle ${strict ? "on" : ""}`}
                onClick={() => setStrict(!strict)}
                aria-pressed={strict}
              >
                <i />
              </button>
              <span className="mono">{strict ? "ON" : "OFF"}</span>
            </div>
            <ul className="feature-list">
              <li>
                <Check /> “Contains unverified assumptions” export watermark
              </li>
              <li>
                <Check /> Provenance-tagged spreadsheet cells
              </li>
              <li>
                <Check /> Strip unverified numbers before sending
              </li>
            </ul>
          </div>
          <div className="export-card">
            <div className="export-head">
              <FileCheck2 /> Investor update <span>•••</span>
            </div>
            <div className="export-lines">
              <b>Q2 ARR</b>
              <strong>$184,000</strong>
              <Provenance tone="unverified">UNVERIFIED</Provenance>
              <hr />
              <b>What changed</b>
              <p>Pipeline expanded across 3 new design partners…</p>
            </div>
            <div className="watermark">CONTAINS UNVERIFIED ASSUMPTIONS</div>
          </div>
        </div>
      </section>

      <section className="section-pad agents">
        <div className="section-intro center">
          <span className="kicker">Technical credibility</span>
          <h2>Seven agents. Zero hand-waving.</h2>
        </div>
        <div className="agent-grid">
          {agents.map(([name, rule], i) => (
            <article key={name} className="agent">
              <span className="agent-index">A{i + 1}</span>
              <h3>{name}</h3>
              <p>{rule}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-pad audiences">
        <div className="section-intro center">
          <span className="kicker">Built for the whole fundraising motion</span>
          <h2>Wherever your company is telling its story.</h2>
        </div>
        <div className="three-grid">
          <article className="audience">
            <span>01</span>
            <h3>Pre-seed / seed founders</h3>
            <p>Apply to accelerators with a narrative that can survive the first hard question.</p>
          </article>
          <article className="audience">
            <span>02</span>
            <h3>University programs</h3>
            <p>White-label fundraising readiness for every founder in your cohort.</p>
          </article>
          <article className="audience">
            <span>03</span>
            <h3>Post-seed teams</h3>
            <p>Investor updates and board packs that stay aligned as the company moves.</p>
          </article>
        </div>
      </section>

      <section id="demo" className="section-pad demo">
        <div className="section-intro">
          <span className="kicker">A two-minute transformation</span>
          <h2>From “uh, basically…” to “here’s the proof.”</h2>
        </div>
        <div className="demo-steps">
          {[
            ["01", "Capture", "Founder records a rambling voice memo."],
            ["02", "Structure", "Claim Graph lights up — including the gaps."],
            ["03", "Stress-test", "Investor Critic asks the question everyone is thinking."],
            ["04", "Resolve", "Consistency Auditor catches a mismatch before export."],
          ].map(([n, t, c]) => (
            <div className="demo-step" key={n}>
              <span className="mono">{n}</span>
              <div>
                <h3>{t}</h3>
                <p>{c}</p>
              </div>
              <ArrowRight />
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="section-pad pricing">
        <div className="section-intro center">
          <span className="kicker">Simple by design</span>
          <h2>Start with the truth.</h2>
          <div className="billing">
            <span>Monthly</span>
            <button
              className={`toggle ${annual ? "on" : ""}`}
              onClick={() => setAnnual(!annual)}
              aria-pressed={annual}
            >
              <i />
            </button>
            <span>
              Annual <b>save 20%</b>
            </span>
          </div>
        </div>
        <div className="price-grid">
          <Price
            name="Free"
            price="$0"
            copy="For founders finding their shape."
            items={["1 project", "Outline only", "Watermarked exports"]}
          />
          <Price
            featured
            name="Pro"
            price={annual ? "$39" : "$49"}
            copy="For founders getting ready to raise."
            items={[
              "Unlimited voice capture",
              "Deck + financial model",
              "Critic loop",
              "2 style packs",
            ]}
          />
          <Price
            name="Raise"
            price={annual ? "$119" : "$149"}
            copy="For the full investor motion."
            items={["Mock investor room", "Diligence link", "Update composer", "Connectors"]}
          />
        </div>
      </section>

      <section id="accelerators" className="accelerator">
        <div>
          <span className="kicker">For accelerators & universities</span>
          <h2>Make every founder in your cohort fundable.</h2>
          <p>White-label readiness infrastructure for your next 50 companies.</p>
        </div>
        <a className="ghost" href="#demo">
          Talk to us <ArrowRight size={16} />
        </a>
      </section>

      <section className="final-cta">
        <div className="final-wave">
          {Array.from({ length: 24 }, (_, i) => (
            <i key={i} style={{ height: `${22 + ((i * 23) % 65)}%` }} />
          ))}
        </div>
        <span className="kicker">The last draft you’ll need</span>
        <h2>
          Stop pitching from memory.
          <br />
          <em>Start pitching from truth.</em>
        </h2>
        <a className="button" href="#pricing">
          Start Free — no card <ArrowRight size={17} />
        </a>
      </section>

      <footer>
        <Logo />
        <p>Fundraising readiness infrastructure.</p>
        <div className="footer-links">
          <span>Product</span>
          <span>Company</span>
          <span>Resources</span>
          <span>Legal</span>
        </div>
        <small>Built for founders who’d rather be honest than impressive.</small>
      </footer>
    </main>
  );
}
