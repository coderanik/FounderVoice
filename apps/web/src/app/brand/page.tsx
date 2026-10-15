"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FounderVoiceLogo } from "@/components/brand/FounderVoiceLogo";
import { ArrowLeft, Check, Copy, Download, Sparkles } from "lucide-react";

export default function BrandShowcasePage() {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 p-6 sm:p-12 font-sans selection:bg-blue-600 selection:text-white">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={16} /> Back to Application
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles size={13} /> Brand Identity System
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              founder<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Voice</span> Logo
            </h1>
            <p className="text-slate-400 mt-2 max-w-xl text-base">
              The official visual mark for founderVoice. Integrating voice soundwave resonance, the verified Claim Graph constellation, and the upward pitch victory vector.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/foundervoice-mark.svg"
              download="foundervoice-mark.svg"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2"
            >
              <Download size={16} /> Download Mark SVG
            </a>
            <a
              href="/foundervoice-logo-dark.svg"
              download="foundervoice-logo.svg"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-all border border-slate-700 flex items-center gap-2"
            >
              <Download size={16} /> Full Lockup SVG
            </a>
          </div>
        </div>
      </div>

      {/* Grid of Variants */}
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Section 1: The Iconic Standalone Mark */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl">
          <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
            <div className="flex-1">
              <span className="text-xs uppercase tracking-widest text-blue-400 font-semibold">Primary Icon Mark</span>
              <h2 className="text-2xl font-bold text-white mt-1">The &ldquo;F&rdquo; Resonance Glyph</h2>
              <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                The left spine features 4 human vocal resonance bars (founder voice audio input). The top arm shoots upward into an investment pitch trajectory vector. The middle arm branches into verified Claim Graph nodes.
              </p>
              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={() => handleCopy(`<img src="/foundervoice-mark.svg" alt="founderVoice" width="64" height="64" />`, "mark-html")}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-1.5 transition-colors"
                >
                  {copied === "mark-html" ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  Copy HTML
                </button>
                <button
                  onClick={() => handleCopy(`<FounderVoiceLogo variant="mark" size={48} />`, "mark-jsx")}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-1.5 transition-colors"
                >
                  {copied === "mark-jsx" ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  Copy React JSX
                </button>
              </div>
            </div>

            <div className="flex items-center gap-6 p-8 bg-slate-950/80 rounded-2xl border border-slate-800/80 shadow-2xl">
              <FounderVoiceLogo variant="mark" size={120} />
              <div className="flex flex-col gap-4">
                <FounderVoiceLogo variant="mark" size={64} />
                <FounderVoiceLogo variant="mark" size={40} />
                <FounderVoiceLogo variant="mark" size={28} />
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Dark vs Light Lockup */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Dark Mode Card */}
          <div className="p-8 rounded-3xl bg-[#090d16] border border-slate-800 shadow-2xl flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Dark Background Lockup</span>
              <h3 className="text-xl font-bold text-white mt-1">Venture &amp; Pitch Dark</h3>
              <p className="text-slate-400 text-xs mt-2">
                Ideal for dark presentations, sleek pitch decks, mobile app screens, and developer terminals.
              </p>
            </div>
            <div className="my-10 p-6 rounded-2xl bg-black/40 border border-slate-800/60 flex items-center justify-center">
              <FounderVoiceLogo variant="horizontal" size={44} theme="dark" />
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-slate-800/80">
              <span className="text-xs font-mono text-slate-500">public/foundervoice-logo-dark.svg</span>
              <a
                href="/foundervoice-logo-dark.svg"
                download
                className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
              >
                Download <Download size={13} />
              </a>
            </div>
          </div>

          {/* Light Mode Card */}
          <div className="p-8 rounded-3xl bg-slate-100 border border-slate-200 shadow-2xl flex flex-col justify-between text-slate-900">
            <div>
              <span className="text-xs uppercase tracking-widest text-blue-600 font-semibold">Light Background Lockup</span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">Investor Memorandum Light</h3>
              <p className="text-slate-600 text-xs mt-2">
                Engineered for white decks, one-pagers, diligence memos, PDF exports, and print documentation.
              </p>
            </div>
            <div className="my-10 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-center">
              <FounderVoiceLogo variant="horizontal" size={44} theme="light" />
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-slate-200">
              <span className="text-xs font-mono text-slate-500">public/foundervoice-logo.svg</span>
              <a
                href="/foundervoice-logo.svg"
                download
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                Download <Download size={13} />
              </a>
            </div>
          </div>
        </div>

        {/* Section 3: Metaphor & Design Geometry Breakdown */}
        <section className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8">
          <h3 className="text-lg font-bold text-white mb-6">Symbolic Architecture</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/60">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold mb-3">
                1
              </div>
              <h4 className="text-sm font-bold text-white">Voice Waveform Stem</h4>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                4 calibrated vertical audio frequency bars form the left spine of the &ldquo;F&rdquo;, honoring raw spoken founder thoughts, voice memos, and unfiltered passion.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/60">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold mb-3">
                2
              </div>
              <h4 className="text-sm font-bold text-white">Claim Graph Constellation</h4>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                The central crossbar branches into an illuminated network of nodes — representing verified traction numbers, defensibility, unit economics, and unshakeable truth.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/60">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold mb-3">
                3
              </div>
              <h4 className="text-sm font-bold text-white">Pitch Vector Arrow</h4>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                The top arm vaults forward into a high-momentum ascending arrow: the moment founder clarity converts investors, closing the round with authority.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
