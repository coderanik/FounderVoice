import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
  Line,
} from "react-native-svg";

type Props = {
  size?: number;
  /** `dark` keeps the branded squircle; `light` drops the black plate for light UIs. */
  theme?: "dark" | "light";
};

/** Official FounderVoice mark (voice waveform + claim graph F). */
export function FounderVoiceMark({ size = 28, theme = "dark" }: Props) {
  const uid = `fv${Math.round(size)}${theme}`;
  const isLight = theme === "light";

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      accessibilityRole="image"
      accessibilityLabel="FounderVoice"
    >
      <Defs>
        <RadialGradient id={`${uid}-depth`} cx="50%" cy="36%" rx="65%" ry="65%">
          <Stop offset="0%" stopColor="#161d36" stopOpacity={0.9} />
          <Stop offset="55%" stopColor="#090d19" stopOpacity={0.98} />
          <Stop offset="100%" stopColor="#04060b" stopOpacity={1} />
        </RadialGradient>
        <LinearGradient id={`${uid}-wave`} x1="0%" y1="100%" x2="0%" y2="0%">
          <Stop offset="0%" stopColor="#1d4ed8" />
          <Stop offset="45%" stopColor="#2563eb" />
          <Stop offset="75%" stopColor="#06b6d4" />
          <Stop offset="100%" stopColor="#38bdf8" />
        </LinearGradient>
        <LinearGradient id={`${uid}-top`} x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#2563eb" />
          <Stop offset="50%" stopColor="#4f46e5" />
          <Stop offset="100%" stopColor="#8b5cf6" />
        </LinearGradient>
        <LinearGradient id={`${uid}-mid`} x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#06b6d4" />
          <Stop offset="60%" stopColor="#3b82f6" />
          <Stop offset="100%" stopColor="#6366f1" />
        </LinearGradient>
        <LinearGradient id={`${uid}-arrow`} x1="0%" y1="100%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#38bdf8" />
          <Stop offset="50%" stopColor="#818cf8" />
          <Stop offset="100%" stopColor="#c084fc" />
        </LinearGradient>
      </Defs>

      {isLight ? (
        <>
          <Rect width="512" height="512" rx="116" fill="#eef2ff" />
          <Rect
            width="510"
            height="510"
            x="1"
            y="1"
            rx="115"
            stroke="#c7d2fe"
            strokeWidth="2"
            fill="none"
          />
          <Circle cx="290" cy="210" r="130" fill="#6366f1" opacity={0.08} />
        </>
      ) : (
        <>
          <Rect width="512" height="512" rx="116" fill={`url(#${uid}-depth)`} />
          <Rect
            width="510"
            height="510"
            x="1"
            y="1"
            rx="115"
            stroke="rgba(255,255,255,0.14)"
            strokeWidth="2"
            fill="none"
          />
          <Circle cx="290" cy="210" r="130" fill="#4f46e5" opacity={0.18} />
        </>
      )}

      <Rect x="106" y="224" width="12" height="64" rx="6" fill={`url(#${uid}-wave)`} opacity={0.45} />
      <Rect x="128" y="184" width="14" height="144" rx="7" fill={`url(#${uid}-wave)`} opacity={0.8} />
      <Rect x="152" y="132" width="22" height="248" rx="11" fill={`url(#${uid}-wave)`} />
      <Rect x="184" y="204" width="14" height="104" rx="7" fill={`url(#${uid}-wave)`} opacity={0.75} />

      <Path
        d="M 163 148 L 336 148"
        stroke={`url(#${uid}-top)`}
        strokeWidth="22"
        strokeLinecap="round"
      />
      <Path
        d="M 324 192 L 388 128 L 324 64"
        fill="none"
        stroke={`url(#${uid}-arrow)`}
        strokeWidth="20"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Line
        x1="280"
        y1="128"
        x2="384"
        y2="128"
        stroke="#38bdf8"
        strokeWidth="12"
        strokeLinecap="round"
      />

      <Path
        d="M 163 252 L 278 252"
        stroke={`url(#${uid}-mid)`}
        strokeWidth="20"
        strokeLinecap="round"
      />
      <Line
        x1="278"
        y1="252"
        x2="340"
        y2="204"
        stroke="#818cf8"
        strokeWidth="4"
        strokeDasharray="6 6"
        opacity={0.8}
      />
      <Line x1="278" y1="252" x2="330" y2="304" stroke="#38bdf8" strokeWidth="4" opacity={0.6} />
      <Line
        x1="340"
        y1="204"
        x2="336"
        y2="148"
        stroke="#a78bfa"
        strokeWidth="3"
        strokeDasharray="4 4"
        opacity={0.5}
      />

      <Circle cx="163" cy="148" r="9" fill="#38bdf8" />
      <Circle cx="163" cy="148" r="4.5" fill="#ffffff" />
      <Circle cx="280" cy="148" r="10" fill="#818cf8" />
      <Circle cx="280" cy="148" r="5" fill="#ffffff" />
      <Circle cx="388" cy="128" r="12" fill="#c084fc" />
      <Circle cx="388" cy="128" r="6" fill="#ffffff" />
      <Circle cx="278" cy="252" r="11" fill="#06b6d4" />
      <Circle cx="278" cy="252" r="5.5" fill="#ffffff" />
      <Circle cx="340" cy="204" r="9" fill="#818cf8" />
      <Circle cx="340" cy="204" r="4.5" fill="#ffffff" />
      <Circle cx="330" cy="304" r="8" fill="#38bdf8" />
      <Circle cx="330" cy="304" r="4" fill="#ffffff" />
      <Circle cx="163" cy="252" r="9" fill="#2563eb" />
      <Circle cx="163" cy="252" r="4" fill="#ffffff" />
    </Svg>
  );
}
