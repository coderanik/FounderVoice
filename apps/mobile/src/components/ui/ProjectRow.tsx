import { Pressable, StyleSheet, Text, View } from "react-native";
import { Project } from "@/lib/api";
import { colors, fonts, radii, spacing } from "@/theme/tokens";

type Props = {
  project: Project;
  onPress: () => void;
};

export function ProjectRow({ project, onPress }: Props) {
  const score = Math.round(project.readiness_score);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={styles.scoreRing}>
        <Text style={styles.score}>{score}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.name}>{project.name}</Text>
        <Text style={styles.meta}>
          {project.founder_name || "Founder"} · {project.status.replace(/_/g, " ")}
        </Text>
        <View style={styles.tags}>
          <Text style={styles.tag}>{project.strict_mode ? "Strict" : "Exploratory"}</Text>
        </View>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  pressed: {
    opacity: 0.9,
    borderColor: colors.accentDim,
  },
  scoreRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(212, 168, 83, 0.1)",
  },
  score: {
    fontFamily: fonts.sansBold,
    fontSize: 16,
    color: colors.accent,
  },
  body: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontFamily: fonts.sansSemi,
    fontSize: 16,
    color: colors.ink,
  },
  meta: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.muted,
    textTransform: "capitalize",
  },
  tags: {
    flexDirection: "row",
    marginTop: 2,
  },
  tag: {
    fontFamily: fonts.sans,
    fontSize: 10,
    color: colors.accent,
    borderWidth: 1,
    borderColor: colors.accentDim,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  chevron: {
    fontSize: 22,
    color: colors.muted,
  },
});
