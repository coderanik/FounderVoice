import { StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "@/theme/tokens";

export function BrandMark({ size = "lg" }: { size?: "lg" | "sm" }) {
  return (
    <View style={styles.wrap}>
      <Text style={[styles.wordmark, size === "sm" && styles.wordmarkSm]}>
        Pitch<Text style={styles.accent}>OS</Text>
      </Text>
      {size === "lg" ? (
        <Text style={styles.tagline}>Rule your pitch!</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    gap: 8,
  },
  wordmark: {
    fontFamily: fonts.display,
    fontSize: 48,
    color: colors.ink,
    letterSpacing: -0.5,
  },
  wordmarkSm: {
    fontSize: 28,
  },
  accent: {
    color: colors.accent,
  },
  tagline: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.muted,
    fontStyle: "italic",
  },
});
