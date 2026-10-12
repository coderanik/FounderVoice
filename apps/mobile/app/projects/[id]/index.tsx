import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { api, ProjectDetail } from "@/lib/api";
import { colors, fonts, spacing } from "@/theme/tokens";

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setError("");
      setProject(await api.getProject(id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load project");
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (!project && !error) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (!project) {
    return (
      <Screen>
        <View style={styles.center}>
          <Text style={styles.error}>{error || "Project not found"}</Text>
          <Pressable onPress={() => router.replace("/projects")}>
            <Text style={styles.back}>← Back to projects</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  const pendingClaims = project.claims.filter((c) => c.status === "pending").length;
  const openQuestions = project.questions.filter((q) => !q.resolved).length;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← Projects</Text>
        </Pressable>

        <Text style={styles.title}>{project.name}</Text>
        <Text style={styles.subtitle}>
          {project.founder_name || "Founder"} · {project.status} · {project.strict_mode ? "Strict" : "Exploratory"}
        </Text>

        <View style={styles.scoreRow}>
          <Text style={styles.scoreLabel}>Readiness</Text>
          <Text style={styles.score}>{project.readiness_score.toFixed(0)}</Text>
        </View>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Pipeline status</Text>
          <Text style={styles.meta}>Claims pending: {pendingClaims}</Text>
          <Text style={styles.meta}>Open critic questions: {openQuestions}</Text>
          <Text style={styles.meta}>Memos: {project.memos.length}</Text>
          <Text style={styles.meta}>Artifacts: {project.artifacts.length}</Text>
        </Card>

        <Pressable
          onPress={() => router.push(`/projects/${id}/capture`)}
          style={styles.record}
        >
          <Text style={styles.recordText}>Record your pitch</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.canvas,
    padding: spacing.lg,
    gap: spacing.md,
  },
  scroll: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  back: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.muted,
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: colors.ink,
  },
  subtitle: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.muted,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  scoreLabel: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.muted,
  },
  score: {
    fontFamily: fonts.display,
    fontSize: 48,
    color: colors.accent,
    lineHeight: 52,
  },
  card: {
    gap: 8,
  },
  cardTitle: {
    fontFamily: fonts.sansSemi,
    fontSize: 16,
    color: colors.ink,
    marginBottom: 4,
  },
  meta: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.muted,
  },
  record: {
    backgroundColor: "#6d4aff",
    borderRadius: 14,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  recordText: {
    fontFamily: fonts.sansSemi,
    fontSize: 15,
    color: "#ffffff",
  },
  error: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.danger,
    textAlign: "center",
  },
});
