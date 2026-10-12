import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { TermsGateModal } from "@/components/auth/TermsGateModal";
import { FounderVoiceMark } from "@/components/brand/FounderVoiceMark";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { api, Project } from "@/lib/api";
import { getCurrentProfile, signOut } from "@/lib/auth";
import { UserProfile } from "@/lib/session";

type Filter = "all" | "active" | "draft" | "completed";
type Bucket = Exclude<Filter, "all">;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "draft", label: "Draft" },
  { id: "completed", label: "Completed" },
];

const STATUS_LABEL: Record<Bucket, string> = {
  active: "In Progress",
  draft: "Draft",
  completed: "Completed",
};

function bucketFor(status: string): Bucket {
  const value = status.toLowerCase();
  if (value === "draft") return "draft";
  if (value === "exported" || value === "completed") return "completed";
  return "active";
}

function lastEdited(iso?: string | null): string {
  if (!iso) return "Last edited recently";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "Last edited recently";
  const days = Math.max(0, Math.floor((Date.now() - then) / 86_400_000));
  if (days === 0) return "Last edited today";
  if (days === 1) return "Last edited yesterday";
  if (days < 7) return `Last edited ${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return "Last edited 1 week ago";
  if (weeks < 5) return `Last edited ${weeks} weeks ago`;
  const months = Math.floor(days / 30);
  if (months <= 1) return "Last edited 1 month ago";
  return `Last edited ${months} months ago`;
}

function initialOf(profile: UserProfile | null): string {
  const source = profile?.name?.trim() || profile?.email?.trim() || "A";
  return source.charAt(0).toUpperCase();
}

export default function ProjectsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [menuOpen, setMenuOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      setProjects(await api.listProjects());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load projects.");
    }
  }, []);

  useEffect(() => {
    load();
    getCurrentProfile()
      .then((session) => {
        setProfile(session);
        if (session?.orgName) setName((prev) => prev || session.orgName);
      })
      .catch(() => setProfile(null));
  }, [load]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return projects.filter((project) => {
      const bucket = bucketFor(project.status);
      if (filter !== "all" && bucket !== filter) return false;
      if (!needle) return true;
      return (
        project.name.toLowerCase().includes(needle) ||
        project.summary.toLowerCase().includes(needle)
      );
    });
  }, [projects, query, filter]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function onCreate() {
    if (!name.trim()) {
      setError("Project name is required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const project = await api.createProject({
        name: name.trim(),
        founder_name: profile?.name ?? "",
        strict_mode: true,
        language: "en",
      });
      setCreating(false);
      setName(profile?.orgName ?? "");
      router.push(`/projects/${project.id}/capture`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Create failed");
    } finally {
      setLoading(false);
    }
  }

  function openProfile() {
    setMenuOpen(false);
    router.push("/profile");
  }

  async function onLogout() {
    setMenuOpen(false);
    await signOut();
    router.replace("/");
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <TermsGateModal profile={profile} onAccepted={setProfile} />

        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <FounderVoiceMark size={28} theme="light" />
            <Text style={styles.brand}>
              Founder<Text style={styles.brandAccent}>Voice</Text>
            </Text>
          </View>
          <Pressable
            onPress={() => setMenuOpen(true)}
            style={styles.avatar}
            accessibilityLabel="Account menu"
          >
            <Text style={styles.avatarText}>{initialOf(profile)}</Text>
          </Pressable>
        </View>

        <FlatList
          data={visible}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6d4aff" />
          }
          ListHeaderComponent={
            <View style={styles.header}>
              <View style={styles.titleRow}>
                <View style={styles.titleCopy}>
                  <Text style={styles.title}>Your Projects</Text>
                  <Text style={styles.subtitle}>Turn your ideas into investor-ready stories.</Text>
                </View>
                <Pressable onPress={() => setCreating(true)} style={styles.newButton}>
                  <Text style={styles.newButtonText}>+  New Project</Text>
                </Pressable>
              </View>

              <View style={styles.search}>
                <Text style={styles.searchIcon}>⌕</Text>
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search projects..."
                  placeholderTextColor="#9aa0ad"
                  style={styles.searchInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.filters}>
                {FILTERS.map((item) => {
                  const selected = filter === item.id;
                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => setFilter(item.id)}
                      style={[styles.chip, selected && styles.chipSelected]}
                    >
                      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {error ? <ErrorBanner message={error} onRetry={load} /> : null}
            </View>
          }
          ListEmptyComponent={
            !error ? (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>No projects yet</Text>
                <Text style={styles.emptyBody}>
                  Create a project to turn a founder idea into an investor-ready story.
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => {
            const bucket = bucketFor(item.status);
            return (
              <Pressable
                onPress={() => router.push(`/projects/${item.id}`)}
                style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              >
                <View style={styles.cardTop}>
                  <Text style={styles.cardName}>{item.name}</Text>
                  <View style={styles.cardMeta}>
                    <View style={[styles.badge, styles[`badge_${bucket}`]]}>
                      <Text style={[styles.badgeText, styles[`badgeText_${bucket}`]]}>
                        {STATUS_LABEL[bucket]}
                      </Text>
                    </View>
                    <Text style={styles.kebab}>⋮</Text>
                  </View>
                </View>
                <Text style={styles.cardBody} numberOfLines={2}>
                  {item.summary || "Add a voice note to shape this story."}
                </Text>
                <Text style={styles.edited}>{lastEdited(item.updated_at || item.created_at)}</Text>
              </Pressable>
            );
          }}
        />
      </SafeAreaView>

      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.menuBackdrop} onPress={() => setMenuOpen(false)}>
          <View style={[styles.menu, { top: insets.top + 52 }]}>
            <Pressable onPress={openProfile} style={styles.menuItem}>
              <Text style={styles.menuLabel}>My Profile</Text>
            </Pressable>
            <View style={styles.menuDivider} />
            <Pressable onPress={onLogout} style={styles.menuItem}>
              <Text style={styles.menuLogout}>Log out</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <Modal visible={creating} transparent animationType="fade" onRequestClose={() => setCreating(false)}>
        <Pressable style={styles.backdrop} onPress={() => setCreating(false)}>
          <Pressable style={styles.sheet} onPress={() => undefined}>
            <Text style={styles.sheetTitle}>New project</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Startup name"
              placeholderTextColor="#9aa0ad"
              style={styles.sheetInput}
              autoFocus
            />
            <Pressable onPress={onCreate} style={styles.sheetButton} disabled={loading}>
              <Text style={styles.sheetButtonText}>{loading ? "Creating…" : "Create project"}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f6f7fb",
  },
  safe: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brand: {
    fontFamily: "IBMPlexSans_700Bold",
    fontSize: 20,
    color: "#1c1d27",
    letterSpacing: -0.4,
  },
  brandAccent: {
    color: "#7c5cff",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#6d4aff",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: "IBMPlexSans_600SemiBold",
    fontSize: 15,
    color: "#ffffff",
  },
  menuBackdrop: {
    flex: 1,
  },
  menu: {
    position: "absolute",
    right: 20,
    width: 180,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#eef0f5",
    shadowColor: "#1c1d27",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    overflow: "hidden",
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuLabel: {
    fontFamily: "IBMPlexSans_500Medium",
    fontSize: 15,
    color: "#17181f",
  },
  menuLogout: {
    fontFamily: "IBMPlexSans_500Medium",
    fontSize: 15,
    color: "#c04545",
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#eef0f5",
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  header: {
    gap: 16,
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  titleCopy: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: "IBMPlexSans_700Bold",
    fontSize: 28,
    color: "#17181f",
    letterSpacing: -0.6,
  },
  subtitle: {
    fontFamily: "IBMPlexSans_400Regular",
    fontSize: 14,
    color: "#8b909c",
    lineHeight: 20,
  },
  newButton: {
    backgroundColor: "#6d4aff",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 4,
  },
  newButtonText: {
    fontFamily: "IBMPlexSans_600SemiBold",
    fontSize: 13,
    color: "#ffffff",
  },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e6e8ef",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
  },
  searchIcon: {
    fontSize: 18,
    color: "#9aa0ad",
    marginTop: -2,
  },
  searchInput: {
    flex: 1,
    fontFamily: "IBMPlexSans_400Regular",
    fontSize: 15,
    color: "#17181f",
    paddingVertical: 0,
  },
  filters: {
    flexDirection: "row",
    gap: 8,
  },
  chip: {
    backgroundColor: "#ffffff",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#eceef4",
  },
  chipSelected: {
    backgroundColor: "#6d4aff",
    borderColor: "#6d4aff",
  },
  chipText: {
    fontFamily: "IBMPlexSans_500Medium",
    fontSize: 13,
    color: "#3c4150",
  },
  chipTextSelected: {
    color: "#ffffff",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eef0f5",
    gap: 8,
  },
  cardPressed: {
    opacity: 0.92,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  cardName: {
    flex: 1,
    fontFamily: "IBMPlexSans_700Bold",
    fontSize: 17,
    color: "#17181f",
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badge_active: {
    backgroundColor: "#e8f8ee",
  },
  badge_draft: {
    backgroundColor: "#f1f2f6",
  },
  badge_completed: {
    backgroundColor: "#eee8ff",
  },
  badgeText: {
    fontFamily: "IBMPlexSans_500Medium",
    fontSize: 12,
  },
  badgeText_active: {
    color: "#1f9d55",
  },
  badgeText_draft: {
    color: "#6b7280",
  },
  badgeText_completed: {
    color: "#6d4aff",
  },
  kebab: {
    fontSize: 18,
    color: "#9aa0ad",
    lineHeight: 18,
  },
  cardBody: {
    fontFamily: "IBMPlexSans_400Regular",
    fontSize: 14,
    color: "#6d7380",
    lineHeight: 20,
  },
  edited: {
    fontFamily: "IBMPlexSans_400Regular",
    fontSize: 12,
    color: "#a0a6b2",
  },
  empty: {
    alignItems: "center",
    paddingVertical: 28,
    gap: 6,
  },
  emptyTitle: {
    fontFamily: "IBMPlexSans_600SemiBold",
    fontSize: 16,
    color: "#3c4150",
  },
  emptyBody: {
    fontFamily: "IBMPlexSans_400Regular",
    fontSize: 14,
    color: "#8b909c",
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 280,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(18, 18, 28, 0.4)",
    justifyContent: "center",
    padding: 24,
  },
  sheet: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    gap: 14,
  },
  sheetTitle: {
    fontFamily: "IBMPlexSans_700Bold",
    fontSize: 20,
    color: "#17181f",
  },
  sheetInput: {
    borderWidth: 1,
    borderColor: "#e6e8ef",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    fontFamily: "IBMPlexSans_400Regular",
    fontSize: 16,
    color: "#17181f",
  },
  sheetButton: {
    backgroundColor: "#6d4aff",
    borderRadius: 12,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetButtonText: {
    fontFamily: "IBMPlexSans_600SemiBold",
    fontSize: 15,
    color: "#ffffff",
  },
});
