import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { UserRole } from "@/lib/session";
import { colors, fonts, radii } from "@/theme/tokens";

type Props = {
  value: UserRole;
  onChange: (role: UserRole) => void;
  variant?: "dark" | "light";
};

const OPTIONS: {
  role: UserRole;
  title: string;
  subtitle: string;
}[] = [
  { role: "founder", title: "Founder", subtitle: "Building & raising" },
  { role: "investor", title: "Investor", subtitle: "Diligence & deals" },
];

function RoleGlyph({ role, active, light }: { role: UserRole; active: boolean; light: boolean }) {
  const stroke = light
    ? active
      ? "#4f46e5"
      : "#94a3b8"
    : active
      ? colors.onAccent
      : colors.muted;

  if (role === "founder") {
    return (
      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 3v10"
          stroke={stroke}
          strokeWidth={1.8}
          strokeLinecap="round"
        />
        <Path
          d="M8 8c0 2.2 1.8 4 4 4s4-1.8 4-4"
          stroke={stroke}
          strokeWidth={1.8}
          strokeLinecap="round"
        />
        <Path
          d="M7 21v-2a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v2"
          stroke={stroke}
          strokeWidth={1.8}
          strokeLinecap="round"
        />
        <Circle cx={12} cy={7} r={2.2} stroke={stroke} strokeWidth={1.8} />
      </Svg>
    );
  }

  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={7} width={18} height={13} rx={2} stroke={stroke} strokeWidth={1.8} />
      <Path
        d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7"
        stroke={stroke}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Path d="M3 12h18" stroke={stroke} strokeWidth={1.8} />
    </Svg>
  );
}

export function RoleToggle({ value, onChange, variant = "dark" }: Props) {
  const light = variant === "light";

  if (light) {
    return (
      <View style={styles.cards}>
        {OPTIONS.map((option) => {
          const active = value === option.role;
          return (
            <Pressable
              key={option.role}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => onChange(option.role)}
              style={({ pressed }) => [
                styles.card,
                active && styles.cardActive,
                pressed && styles.cardPressed,
              ]}
            >
              <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
                <RoleGlyph role={option.role} active={active} light />
              </View>
              <Text style={[styles.cardTitle, active && styles.cardTitleActive]}>
                {option.title}
              </Text>
              <Text style={[styles.cardSub, active && styles.cardSubActive]}>
                {option.subtitle}
              </Text>
              <View style={[styles.dot, active && styles.dotActive]}>
                {active ? <View style={styles.dotInner} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      {OPTIONS.map((option) => {
        const active = value === option.role;
        return (
          <Pressable
            key={option.role}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(option.role)}
            style={[styles.segment, active && styles.segmentActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{option.title}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  cards: {
    flexDirection: "row",
    gap: 8,
  },
  card: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#e8eaf0",
    backgroundColor: "#fafbfd",
    paddingTop: 10,
    paddingBottom: 8,
    paddingHorizontal: 8,
    alignItems: "center",
    gap: 2,
  },
  cardActive: {
    borderColor: "#a5b4fc",
    backgroundColor: "#f5f3ff",
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9",
    marginBottom: 4,
  },
  iconWrapActive: {
    backgroundColor: "#e0e7ff",
  },
  cardTitle: {
    fontFamily: fonts.sansSemi,
    fontSize: 13,
    color: "#334155",
  },
  cardTitleActive: {
    color: "#3730a3",
  },
  cardSub: {
    fontFamily: fonts.sans,
    fontSize: 10,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 13,
  },
  cardSubActive: {
    color: "#818cf8",
  },
  dot: {
    width: 13,
    height: 13,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  dotActive: {
    borderColor: "#6366f1",
    backgroundColor: "#6366f1",
  },
  dotInner: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#fff",
  },
  wrap: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    padding: 4,
    gap: 4,
  },
  segment: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: radii.sm,
  },
  segmentActive: {
    backgroundColor: colors.accent,
  },
  label: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.muted,
  },
  labelActive: {
    color: colors.onAccent,
  },
});
