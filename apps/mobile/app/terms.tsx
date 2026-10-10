import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useRef } from "react";
import {
  TERMS_INTRO,
  TERMS_LAST_UPDATED,
  TERMS_SECTIONS,
} from "@/content/terms";
import { fonts, spacing } from "@/theme/tokens";

const accent = "#6366f1";
const ink = "#111827";
const muted = "#6b7280";
const canvas = "#ffffff";

export default function TermsScreen() {
  const router = useRouter();
  const { section } = useLocalSearchParams<{ section?: string }>();
  const scrollRef = useRef<ScrollView>(null);
  const sectionY = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!section || typeof section !== "string") return;
    const y = sectionY.current[section];
    if (y == null) return;
    const t = setTimeout(() => {
      scrollRef.current?.scrollTo({ y: Math.max(0, y - 12), animated: true });
    }, 250);
    return () => clearTimeout(t);
  }, [section]);

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button">
            <Text style={styles.back}>← Back</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Terms</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Terms and Conditions</Text>
          <Text style={styles.updated}>Last updated: {TERMS_LAST_UPDATED}</Text>
          <Text style={styles.intro}>{TERMS_INTRO}</Text>

          {TERMS_SECTIONS.map((block) => (
            <View
              key={block.id}
              onLayout={(e) => {
                sectionY.current[block.id] = e.nativeEvent.layout.y;
              }}
              style={styles.section}
            >
              <Text style={styles.sectionTitle}>{block.title}</Text>
              {block.paragraphs.map((p, i) => (
                <Text key={i} style={styles.paragraph}>
                  {p}
                </Text>
              ))}
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: canvas,
  },
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  back: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    color: accent,
    minWidth: 64,
  },
  headerTitle: {
    fontFamily: fonts.sansSemi,
    fontSize: 15,
    color: ink,
  },
  headerSpacer: {
    minWidth: 64,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  title: {
    fontFamily: fonts.sansBold,
    fontSize: 24,
    color: ink,
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  updated: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: muted,
    marginBottom: 14,
  },
  intro: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: ink,
    lineHeight: 20,
    marginBottom: 20,
  },
  section: {
    marginBottom: 18,
    gap: 8,
  },
  sectionTitle: {
    fontFamily: fonts.sansSemi,
    fontSize: 15,
    color: ink,
    marginBottom: 2,
  },
  paragraph: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: muted,
    lineHeight: 20,
  },
});
