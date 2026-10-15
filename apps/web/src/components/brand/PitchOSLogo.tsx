import React from "react";

export interface PitchOSLogoProps {
  variant?: "mark" | "horizontal" | "compact" | "badge";
  size?: "sm" | "md" | "lg" | "xl" | number;
  theme?: "light" | "dark" | "auto";
  animated?: boolean;
  className?: string;
}

export function PitchOSLogo({
  variant = "horizontal",
  size = "md",
  theme = "auto",
  animated = true,
  className = "",
}: PitchOSLogoProps) {
  // Height sizing
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

  if (variant === "mark") {
    return (
      <svg
        viewBox="0 0 512 512"
        height={height}
        width={height}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`pitchos-mark ${animated ? "pitchos-mark-animated" : ""} ${className}`}
        aria-label="PitchOS Logo"
      >
        <defs>
          <radialGradient id="mark-bg-grad" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#090d16" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#05070b" stopOpacity="1" />
          </radialGradient>
          <linearGradient id="mark-wave" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
          <linearGradient id="mark-arc" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="40%" stopColor="#4f46e5" />
            <stop offset="80%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
          <linearGradient id="mark-arrow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#e879f9" />
          </linearGradient>
          <filter id="mark-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Base Squircle Container */}
        <rect width="512" height="512" rx="112" fill="url(#mark-bg-grad)" />
        <rect
          width="510"
          height="510"
          x="1"
          y="1"
          rx="111"
          stroke="rgba(255,255,255,0.14)"
          strokeWidth="2"
          fill="none"
        />

        {/* Subsurface Glow */}
        <circle cx="280" cy="220" r="130" fill="#6366f1" opacity="0.18" filter="url(#mark-glow)" />

        {/* Waveform Sound Stem */}
        <rect x="108" y="228" width="12" height="56" rx="6" fill="url(#mark-wave)" opacity="0.45" />
        <rect x="130" y="188" width="14" height="136" rx="7" fill="url(#mark-wave)" opacity="0.8" />
        <rect x="154" y="136" width="22" height="240" rx="11" fill="url(#mark-wave)" />
        <rect x="186" y="200" width="14" height="112" rx="7" fill="url(#mark-wave)" opacity="0.75" />

        {/* The Claim Graph Loop */}
        <path
          d="M 165 158 C 240 120, 345 140, 360 215 C 375 295, 275 328, 165 300"
          fill="none"
          stroke="url(#mark-arc)"
          strokeWidth="24"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Neural Network Dotted Links */}
        <path
          d="M 193 256 L 275 228 L 340 270"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="4"
          strokeDasharray="6 6"
          opacity="0.6"
        />

        {/* Trajectory Launch Arrow */}
        <path
          d="M 330 148 L 400 122 L 382 192"
          fill="none"
          stroke="url(#mark-arrow)"
          strokeWidth="20"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line
          x1="290"
          y1="185"
          x2="385"
          y2="135"
          stroke="#38bdf8"
          strokeWidth="12"
          strokeLinecap="round"
        />

        {/* Constellation Nodes */}
        <circle cx="165" cy="158" r="9" fill="#38bdf8" filter="url(#mark-glow)" />
        <circle cx="165" cy="158" r="4.5" fill="#ffffff" />

        <circle cx="280" cy="144" r="10" fill="#818cf8" filter="url(#mark-glow)" />
        <circle cx="280" cy="144" r="5" fill="#ffffff" />

        <circle cx="360" cy="215" r="12" fill="#c084fc" filter="url(#mark-glow)" />
        <circle cx="360" cy="215" r="6" fill="#ffffff" />

        <circle cx="275" cy="228" r="13" fill="#06b6d4" filter="url(#mark-glow)" />
        <circle cx="275" cy="228" r="6.5" fill="#ffffff" />

        <circle cx="295" cy="316" r="9" fill="#6366f1" filter="url(#mark-glow)" />
        <circle cx="295" cy="316" r="4.5" fill="#ffffff" />
      </svg>
    );
  }

  // Horizontal Full Lockup
  const textColor = theme === "dark" ? "#f8fafc" : theme === "light" ? "#0f172a" : "currentColor";
  const badgeBg = theme === "dark" ? "#1e293b" : "#eff6ff";
  const badgeText = theme === "dark" ? "#38bdf8" : "#2563eb";
  const subtextColor = theme === "dark" ? "#94a3b8" : "#64748b";

  return (
    <div
      className={`pitchos-brand-lockup flex items-center gap-3 select-none ${className}`}
      style={{ height }}
    >
      {/* Visual Emblem */}
      <svg
        viewBox="0 0 512 512"
        height={height}
        width={height}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`pitchos-mark shrink-0 ${animated ? "pitchos-mark-animated" : ""}`}
      >
        <defs>
          <radialGradient id="hl-bg-grad" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#090d16" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#05070b" stopOpacity="1" />
          </radialGradient>
          <linearGradient id="hl-wave" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
          <linearGradient id="hl-arc" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="40%" stopColor="#4f46e5" />
            <stop offset="80%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
          <linearGradient id="hl-arrow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#e879f9" />
          </linearGradient>
          <filter id="hl-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="512" height="512" rx="112" fill="url(#hl-bg-grad)" />
        <rect
          width="510"
          height="510"
          x="1"
          y="1"
          rx="111"
          stroke="rgba(255,255,255,0.16)"
          strokeWidth="2"
          fill="none"
        />

        <circle cx="280" cy="220" r="130" fill="#6366f1" opacity="0.2" filter="url(#hl-glow)" />

        <rect x="108" y="228" width="12" height="56" rx="6" fill="url(#hl-wave)" opacity="0.45" />
        <rect x="130" y="188" width="14" height="136" rx="7" fill="url(#hl-wave)" opacity="0.8" />
        <rect x="154" y="136" width="22" height="240" rx="11" fill="url(#hl-wave)" />
        <rect x="186" y="200" width="14" height="112" rx="7" fill="url(#hl-wave)" opacity="0.75" />

        <path
          d="M 165 158 C 240 120, 345 140, 360 215 C 375 295, 275 328, 165 300"
          fill="none"
          stroke="url(#hl-arc)"
          strokeWidth="24"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M 193 256 L 275 228 L 340 270"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="4"
          strokeDasharray="6 6"
          opacity="0.6"
        />

        <path
          d="M 330 148 L 400 122 L 382 192"
          fill="none"
          stroke="url(#hl-arrow)"
          strokeWidth="20"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line
          x1="290"
          y1="185"
          x2="385"
          y2="135"
          stroke="#38bdf8"
          strokeWidth="12"
          strokeLinecap="round"
        />

        <circle cx="165" cy="158" r="9" fill="#38bdf8" filter="url(#hl-glow)" />
        <circle cx="165" cy="158" r="4.5" fill="#ffffff" />

        <circle cx="280" cy="144" r="10" fill="#818cf8" filter="url(#hl-glow)" />
        <circle cx="280" cy="144" r="5" fill="#ffffff" />

        <circle cx="360" cy="215" r="12" fill="#c084fc" filter="url(#hl-glow)" />
        <circle cx="360" cy="215" r="6" fill="#ffffff" />

        <circle cx="275" cy="228" r="13" fill="#06b6d4" filter="url(#hl-glow)" />
        <circle cx="275" cy="228" r="6.5" fill="#ffffff" />

        <circle cx="295" cy="316" r="9" fill="#6366f1" filter="url(#hl-glow)" />
        <circle cx="295" cy="316" r="4.5" fill="#ffffff" />
      </svg>

      {/* Wordmark and Info */}
      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-center gap-2">
          <span
            style={{
              color: textColor,
              fontWeight: 800,
              fontSize: `${height * 0.52}px`,
              letterSpacing: "-0.04em",
              fontFamily:
                "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif",
            }}
          >
            Pitch<span style={{ color: "#38bdf8" }}>OS</span>
          </span>

          {variant === "badge" && (
            <span
              style={{
                backgroundColor: badgeBg,
                color: badgeText,
                fontSize: `${Math.max(10, height * 0.24)}px`,
                padding: "2px 6px",
                borderRadius: "4px",
                fontWeight: 700,
                letterSpacing: "0.04em",
              }}
            >
              VOICE
            </span>
          )}
        </div>

        {variant !== "compact" && (
          <div
            className="flex items-center gap-1.5"
            style={{
              marginTop: "2px",
              fontSize: `${Math.max(9, height * 0.22)}px`,
              color: subtextColor,
              letterSpacing: "0.03em",
              fontWeight: 500,
              textTransform: "uppercase",
              fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
            }}
          >
            <span>Voice</span>
            <span style={{ color: "#38bdf8" }}>→</span>
            <span>Claim Graph</span>
          </div>
        )}
      </div>
    </div>
  );
}
