import React from "react";

export interface FounderVoiceLogoProps {
  variant?: "mark" | "horizontal" | "compact" | "badge";
  size?: "sm" | "md" | "lg" | "xl" | number;
  theme?: "light" | "dark" | "auto";
  animated?: boolean;
  className?: string;
}

export function FounderVoiceLogo({
  variant = "horizontal",
  size = "md",
  theme = "auto",
  animated = true,
  className = "",
}: FounderVoiceLogoProps) {
  const getHeight = () => {
    if (typeof size === "number") return size;
    switch (size) {
      case "sm":
        return variant === "mark" ? 28 : 28;
      case "md":
        return variant === "mark" ? 36 : 38;
      case "lg":
        return variant === "mark" ? 48 : 52;
      case "xl":
        return variant === "mark" ? 64 : 68;
      default:
        return 38;
    }
  };

  const height = getHeight();

  // Standalone Mark
  if (variant === "mark") {
    return (
      <svg
        viewBox="0 0 512 512"
        height={height}
        width={height}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`fv-mark-svg shrink-0 ${animated ? "fv-animated" : ""} ${className}`}
        aria-label="founderVoice Mark"
      >
        <defs>
          <radialGradient id="fvm-depth" cx="50%" cy="36%" r="65%">
            <stop offset="0%" stopColor="#161d36" stopOpacity="0.9" />
            <stop offset="55%" stopColor="#090d19" stopOpacity="0.98" />
            <stop offset="100%" stopColor="#04060b" stopOpacity="1" />
          </radialGradient>
          <linearGradient id="fvm-wave" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#1d4ed8" />
            <stop offset="45%" stopColor="#2563eb" />
            <stop offset="75%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
          <linearGradient id="fvm-top" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="50%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <linearGradient id="fvm-mid" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="60%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <linearGradient id="fvm-arrow" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
          <filter id="fvm-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="512" height="512" rx="116" fill="url(#fvm-depth)" />
        <rect
          width="510"
          height="510"
          x="1"
          y="1"
          rx="115"
          stroke="rgba(255,255,255,0.14)"
          strokeWidth="2"
          fill="none"
        />

        <circle cx="290" cy="210" r="130" fill="#4f46e5" opacity="0.18" filter="url(#fvm-glow)" />

        {/* Voice waveform stem */}
        <rect x="106" y="224" width="12" height="64" rx="6" fill="url(#fvm-wave)" opacity="0.45" />
        <rect x="128" y="184" width="14" height="144" rx="7" fill="url(#fvm-wave)" opacity="0.8" />
        <rect x="152" y="132" width="22" height="248" rx="11" fill="url(#fvm-wave)" />
        <rect x="184" y="204" width="14" height="104" rx="7" fill="url(#fvm-wave)" opacity="0.75" />

        {/* Top Arm of 'F' + Pitch Vector */}
        <path d="M 163 148 L 336 148" stroke="url(#fvm-top)" strokeWidth="22" strokeLinecap="round" />
        <path
          d="M 324 192 L 388 128 L 324 64"
          fill="none"
          stroke="url(#fvm-arrow)"
          strokeWidth="20"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line x1="280" y1="128" x2="384" y2="128" stroke="#38bdf8" strokeWidth="12" strokeLinecap="round" />

        {/* Mid Arm of 'F' + Claim Graph */}
        <path d="M 163 252 L 278 252" stroke="url(#fvm-mid)" strokeWidth="20" strokeLinecap="round" />
        <line x1="278" y1="252" x2="340" y2="204" stroke="#818cf8" strokeWidth="4" strokeDasharray="6 6" opacity="0.8" />
        <line x1="278" y1="252" x2="330" y2="304" stroke="#38bdf8" strokeWidth="4" opacity="0.6" />
        <line x1="340" y1="204" x2="336" y2="148" stroke="#a78bfa" strokeWidth="3" strokeDasharray="4 4" opacity="0.5" />

        {/* Constellation Nodes */}
        <circle cx="163" cy="148" r="9" fill="#38bdf8" filter="url(#fvm-glow)" />
        <circle cx="163" cy="148" r="4.5" fill="#ffffff" />

        <circle cx="280" cy="148" r="10" fill="#818cf8" filter="url(#fvm-glow)" />
        <circle cx="280" cy="148" r="5" fill="#ffffff" />

        <circle cx="388" cy="128" r="12" fill="#c084fc" filter="url(#fvm-glow)" />
        <circle cx="388" cy="128" r="6" fill="#ffffff" />

        <circle cx="278" cy="252" r="11" fill="#06b6d4" filter="url(#fvm-glow)" />
        <circle cx="278" cy="252" r="5.5" fill="#ffffff" />

        <circle cx="340" cy="204" r="9" fill="#818cf8" filter="url(#fvm-glow)" />
        <circle cx="340" cy="204" r="4.5" fill="#ffffff" />

        <circle cx="330" cy="304" r="8" fill="#38bdf8" filter="url(#fvm-glow)" />
        <circle cx="330" cy="304" r="4" fill="#ffffff" />

        <circle cx="163" cy="252" r="9" fill="#2563eb" filter="url(#fvm-glow)" />
        <circle cx="163" cy="252" r="4" fill="#ffffff" />
      </svg>
    );
  }

  // Horizontal Full / Compact Lockup
  const isDark = theme === "dark";
  const founderColor = isDark ? "#f8fafc" : theme === "light" ? "#0f172a" : "currentColor";
  const badgeBg = isDark ? "#1e293b" : "#eff6ff";
  const badgeText = isDark ? "#38bdf8" : "#2563eb";
  const subtextColor = isDark ? "#94a3b8" : "#64748b";

  return (
    <div
      className={`fv-brand-lockup inline-flex items-center gap-2.5 select-none ${className}`}
      style={{ height }}
    >
      {/* Mark */}
      <svg
        viewBox="0 0 512 512"
        height={height}
        width={height}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`fv-mark-svg shrink-0 ${animated ? "fv-animated" : ""}`}
      >
        <defs>
          <radialGradient id="fv-hl-depth" cx="50%" cy="36%" r="65%">
            <stop offset="0%" stopColor="#161d36" stopOpacity="0.9" />
            <stop offset="55%" stopColor="#090d19" stopOpacity="0.98" />
            <stop offset="100%" stopColor="#04060b" stopOpacity="1" />
          </radialGradient>
          <linearGradient id="fv-hl-wave" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#1d4ed8" />
            <stop offset="45%" stopColor="#2563eb" />
            <stop offset="75%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
          <linearGradient id="fv-hl-top" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="50%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <linearGradient id="fv-hl-mid" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="60%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <linearGradient id="fv-hl-arrow" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
          <filter id="fv-hl-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="512" height="512" rx="116" fill="url(#fv-hl-depth)" />
        <rect
          width="510"
          height="510"
          x="1"
          y="1"
          rx="115"
          stroke="rgba(255,255,255,0.16)"
          strokeWidth="2"
          fill="none"
        />

        <circle cx="290" cy="210" r="130" fill="#4f46e5" opacity="0.2" filter="url(#fv-hl-glow)" />

        <rect x="106" y="224" width="12" height="64" rx="6" fill="url(#fv-hl-wave)" opacity="0.45" />
        <rect x="128" y="184" width="14" height="144" rx="7" fill="url(#fv-hl-wave)" opacity="0.8" />
        <rect x="152" y="132" width="22" height="248" rx="11" fill="url(#fv-hl-wave)" />
        <rect x="184" y="204" width="14" height="104" rx="7" fill="url(#fv-hl-wave)" opacity="0.75" />

        <path d="M 163 148 L 336 148" stroke="url(#fv-hl-top)" strokeWidth="22" strokeLinecap="round" />
        <path
          d="M 324 192 L 388 128 L 324 64"
          fill="none"
          stroke="url(#fv-hl-arrow)"
          strokeWidth="20"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line x1="280" y1="128" x2="384" y2="128" stroke="#38bdf8" strokeWidth="12" strokeLinecap="round" />

        <path d="M 163 252 L 278 252" stroke="url(#fv-hl-mid)" strokeWidth="20" strokeLinecap="round" />
        <line x1="278" y1="252" x2="340" y2="204" stroke="#818cf8" strokeWidth="4" strokeDasharray="6 6" opacity="0.8" />
        <line x1="278" y1="252" x2="330" y2="304" stroke="#38bdf8" strokeWidth="4" opacity="0.6" />
        <line x1="340" y1="204" x2="336" y2="148" stroke="#a78bfa" strokeWidth="3" strokeDasharray="4 4" opacity="0.5" />

        <circle cx="163" cy="148" r="9" fill="#38bdf8" filter="url(#fv-hl-glow)" />
        <circle cx="163" cy="148" r="4.5" fill="#ffffff" />

        <circle cx="280" cy="148" r="10" fill="#818cf8" filter="url(#fv-hl-glow)" />
        <circle cx="280" cy="148" r="5" fill="#ffffff" />

        <circle cx="388" cy="128" r="12" fill="#c084fc" filter="url(#fv-hl-glow)" />
        <circle cx="388" cy="128" r="6" fill="#ffffff" />

        <circle cx="278" cy="252" r="11" fill="#06b6d4" filter="url(#fv-hl-glow)" />
        <circle cx="278" cy="252" r="5.5" fill="#ffffff" />

        <circle cx="340" cy="204" r="9" fill="#818cf8" filter="url(#fv-hl-glow)" />
        <circle cx="340" cy="204" r="4.5" fill="#ffffff" />

        <circle cx="330" cy="304" r="8" fill="#38bdf8" filter="url(#fv-hl-glow)" />
        <circle cx="330" cy="304" r="4" fill="#ffffff" />

        <circle cx="163" cy="252" r="9" fill="#2563eb" filter="url(#fv-hl-glow)" />
        <circle cx="163" cy="252" r="4" fill="#ffffff" />
      </svg>

      {/* Typography */}
      <div className="flex flex-col justify-center leading-tight">
        <div className="flex items-center gap-1.5">
          <span
            style={{
              color: founderColor,
              fontWeight: 700,
              fontSize: `${height * 0.48}px`,
              letterSpacing: "-0.035em",
              fontFamily:
                "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif",
            }}
          >
            founder
            <span
              style={{
                fontWeight: 800,
                background: "linear-gradient(135deg, #2563eb, #6366f1, #a855f7)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Voice
            </span>
          </span>

          {variant === "badge" && (
            <span
              style={{
                backgroundColor: badgeBg,
                color: badgeText,
                fontSize: `${Math.max(9, height * 0.22)}px`,
                padding: "1px 5px",
                borderRadius: "4px",
                fontWeight: 700,
                letterSpacing: "0.05em",
              }}
            >
              PRO
            </span>
          )}
        </div>

        {variant !== "compact" && (
          <span
            style={{
              fontSize: `${Math.max(8.5, height * 0.2)}px`,
              color: subtextColor,
              letterSpacing: "0.04em",
              fontWeight: 600,
              textTransform: "uppercase",
              fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
            }}
          >
            Rule your pitch
          </span>
        )}
      </div>
    </div>
  );
}
