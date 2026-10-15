import React, { useId } from "react";

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
  const light = theme !== "dark";
  const uid = useId().replace(/:/g, "");

  if (variant === "mark") {
    return (
      <svg
        viewBox="0 0 512 512"
        height={height}
        width={height}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`fv-mark-svg shrink-0 ${light ? "fv-mark-light" : ""} ${animated ? "fv-animated" : ""} ${className}`}
        aria-label="founderVoice Mark"
      >
        <defs>
          <radialGradient id={`fvm-depth-${uid}`} cx="50%" cy="36%" r="68%">
            <stop offset="0%" stopColor={light ? "#ffffff" : "#161d36"} />
            <stop offset="58%" stopColor={light ? "#f4f7ff" : "#090d19"} />
            <stop offset="100%" stopColor={light ? "#e4ecfb" : "#04060b"} />
          </radialGradient>
          <linearGradient id={`fvm-wave-${uid}`} x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor={light ? "#1e40af" : "#1d4ed8"} />
            <stop offset="45%" stopColor="#2563eb" />
            <stop offset="75%" stopColor={light ? "#0891b2" : "#06b6d4"} />
            <stop offset="100%" stopColor={light ? "#0284c7" : "#38bdf8"} />
          </linearGradient>
          <linearGradient id={`fvm-top-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="50%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor={light ? "#7c3aed" : "#8b5cf6"} />
          </linearGradient>
          <linearGradient id={`fvm-mid-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={light ? "#0891b2" : "#06b6d4"} />
            <stop offset="60%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <linearGradient id={`fvm-arrow-${uid}`} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={light ? "#2563eb" : "#38bdf8"} />
            <stop offset="50%" stopColor="#6366f1" />
            <stop offset="100%" stopColor={light ? "#7c3aed" : "#c084fc"} />
          </linearGradient>
          <filter id={`fvm-glow-${uid}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation={light ? 4 : 6} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="512" height="512" rx="116" fill={`url(#fvm-depth-${uid})`} />
        <rect
          width="510"
          height="510"
          x="1"
          y="1"
          rx="115"
          stroke={light ? "rgba(37,99,235,0.18)" : "rgba(255,255,255,0.14)"}
          strokeWidth="2"
          fill="none"
        />

        <circle cx="290" cy="210" r="130" fill="#4f46e5" opacity={light ? 0.1 : 0.18} filter={`url(#fvm-glow-${uid})`} />

        <rect x="106" y="224" width="12" height="64" rx="6" fill={`url(#fvm-wave-${uid})`} opacity="0.45" />
        <rect x="128" y="184" width="14" height="144" rx="7" fill={`url(#fvm-wave-${uid})`} opacity="0.8" />
        <rect x="152" y="132" width="22" height="248" rx="11" fill={`url(#fvm-wave-${uid})`} />
        <rect x="184" y="204" width="14" height="104" rx="7" fill={`url(#fvm-wave-${uid})`} opacity="0.75" />

        <path d={`M 163 148 L 336 148`} stroke={`url(#fvm-top-${uid})`} strokeWidth="22" strokeLinecap="round" />
        <path
          d="M 324 192 L 388 128 L 324 64"
          fill="none"
          stroke={`url(#fvm-arrow-${uid})`}
          strokeWidth="20"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line x1="280" y1="128" x2="384" y2="128" stroke={light ? "#2563eb" : "#38bdf8"} strokeWidth="12" strokeLinecap="round" />

        <path d="M 163 252 L 278 252" stroke={`url(#fvm-mid-${uid})`} strokeWidth="20" strokeLinecap="round" />
        <line x1="278" y1="252" x2="340" y2="204" stroke="#818cf8" strokeWidth="4" strokeDasharray="6 6" opacity="0.8" />
        <line x1="278" y1="252" x2="330" y2="304" stroke="#38bdf8" strokeWidth="4" opacity="0.6" />
        <line x1="340" y1="204" x2="336" y2="148" stroke="#a78bfa" strokeWidth="3" strokeDasharray="4 4" opacity="0.5" />

        <circle cx="163" cy="148" r="9" fill={light ? "#2563eb" : "#38bdf8"} filter={`url(#fvm-glow-${uid})`} />
        <circle cx="163" cy="148" r="4.5" fill="#ffffff" />

        <circle cx="280" cy="148" r="10" fill="#818cf8" filter={`url(#fvm-glow-${uid})`} />
        <circle cx="280" cy="148" r="5" fill="#ffffff" />

        <circle cx="388" cy="128" r="12" fill={light ? "#7c3aed" : "#c084fc"} filter={`url(#fvm-glow-${uid})`} />
        <circle cx="388" cy="128" r="6" fill="#ffffff" />

        <circle cx="278" cy="252" r="11" fill={light ? "#0891b2" : "#06b6d4"} filter={`url(#fvm-glow-${uid})`} />
        <circle cx="278" cy="252" r="5.5" fill="#ffffff" />

        <circle cx="340" cy="204" r="9" fill="#818cf8" filter={`url(#fvm-glow-${uid})`} />
        <circle cx="340" cy="204" r="4.5" fill="#ffffff" />

        <circle cx="330" cy="304" r="8" fill={light ? "#2563eb" : "#38bdf8"} filter={`url(#fvm-glow-${uid})`} />
        <circle cx="330" cy="304" r="4" fill="#ffffff" />

        <circle cx="163" cy="252" r="9" fill="#2563eb" filter={`url(#fvm-glow-${uid})`} />
        <circle cx="163" cy="252" r="4" fill="#ffffff" />
      </svg>
    );
  }

  const isDark = theme === "dark";
  const founderColor = isDark ? "#f8fafc" : theme === "light" ? "#0f172a" : "currentColor";

  return (
    <div
      className={`fv-brand-lockup inline-flex items-center gap-2.5 select-none ${className}`}
      style={{ height }}
    >
      <FounderVoiceLogo variant="mark" size={height} theme={theme} animated={animated} />
      <div className="flex flex-col justify-center leading-tight">
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
      </div>
    </div>
  );
}
