import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { api, Claim, ProjectDetail } from "@/lib/api";
import { getCurrentProfile, signOut } from "@/lib/auth";
import { UserProfile } from "@/lib/session";

type Tab = "transcript" | "claims";

const TYPE_LABELS: Record<string, string> = {
  problem: "Problem",
  insight: "Insight",
  icp: "Ideal Customer",
  market: "Market",
  solution: "Solution",
  differentiation: "Differentiation",
  traction: "Traction",
  gtm: "Go-to-Market",
  pricing: "Pricing",
  unit_economics: "Unit Economics",
  team: "Team",
  ask: "The Ask",
  use_of_funds: "Use of Funds",
  milestones: "Milestones",
  risk: "Risks",
  why_now: "Why Now",
  competition: "Competition",
};

const TYPE_ORDER = Object.keys(TYPE_LABELS);

function initialOf(profile: UserProfile | null): string {
  const source = profile?.name?.trim() || profile?.email?.trim() || "A";
  return source.charAt(0).toUpperCase();
}

function padClock(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${minutes.toString().padStart(2, "0")}:${rest.toString().padStart(2, "0")}`;
}

function clock(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${minutes}:${rest.toString().padStart(2, "0")}`;
}

function confidenceLabel(value: number): "High" | "Medium" | "Low" {
  if (value >= 0.75) return "High";
  if (value >= 0.45) return "Medium";
  return "Low";
}

function openClaim(claim: Claim): boolean {
  return claim.status !== "confirmed" && claim.status !== "rejected";
}

function BackIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M15 6 9 12l6 6" stroke="#1c1d27" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CheckIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="m5 12 5 5L20 7" stroke="#178a48" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function PencilIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z"
        stroke="#5c6370"
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function XIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M7 7l10 10M17 7 7 17" stroke="#5c6370" strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export default function ReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const player = useAudioPlayer(null);
  const playback = useAudioPlayerStatus(player);
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tab, setTab] = useState<Tab>("transcript");
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState<Claim | null>(null);
  const [draft, setDraft] = useState("");
  const [savingId, setSavingId] = useState("");
  const [trackWidth, setTrackWidth] = useState(1);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setError("");
      setProject(await api.getProject(id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load this pitch.");
    }
  }, [id]);

  useEffect(() => {
    load();
    getCurrentProfile()
      .then(setProfile)
      .catch(() => setProfile(null));
  }, [load]);

  const memo = project?.memos[0];
  const duration = playback.duration || memo?.duration_seconds || 0;
  const position = playback.currentTime || 0;
  const pending = (project?.claims || []).some(openClaim);

  useEffect(() => {
    if (!project || !memo?.id) return;
    const uri = api.memoAudioUrl(project.id, memo.id);
    player.replace({
      uri,
      headers: uri.includes("ngrok") ? { "ngrok-skip-browser-warning": "1" } : undefined,
    });
  }, [project, memo?.id, player]);

  const claims = [...(project?.claims || [])].sort((a, b) => {
    const ai = TYPE_ORDER.indexOf(a.claim_type);
    const bi = TYPE_ORDER.indexOf(b.claim_type);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  async function patchClaim(claim: Claim, body: Partial<Claim>) {
    if (!project) return;
    setSavingId(claim.id);
    try {
      const updated = await api.updateClaim(project.id, claim.id, body);
      setProject((current) =>
        current
          ? { ...current, claims: current.claims.map((item) => (item.id === updated.id ? updated : item)) }
          : current
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update that claim.");
    } finally {
      setSavingId("");
    }
  }

  async function togglePlayback() {
    await setAudioModeAsync({ playsInSilentMode: true, interruptionMode: "duckOthers" });
    if (playback.playing) player.pause();
    else player.play();
  }

  function seekTo(locationX: number) {
    if (!duration || !trackWidth) return;
    const ratio = Math.max(0, Math.min(1, locationX / trackWidth));
    player.seekTo(ratio * duration);
  }

  if (!project && !error) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#6d4aff" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.replace(`/projects/${id}`)}
            hitSlop={8}
            accessibilityLabel="Back"
          >
            <BackIcon />
          </Pressable>
          <Text style={styles.projectName} numberOfLines={1}>
            {project?.name || "Pitch"}
          </Text>
          <Pressable onPress={() => setMenuOpen(true)} style={styles.avatar} accessibilityLabel="Account menu">
            <Text style={styles.avatarText}>{initialOf(profile)}</Text>
          </Pressable>
        </View>

        <View style={styles.tabs}>
          <Pressable onPress={() => setTab("transcript")} style={styles.tab}>
            <Text style={[styles.tabLabel, tab === "transcript" && styles.tabLabelOn]}>Transcript</Text>
            {tab === "transcript" ? <View style={styles.tabLine} /> : <View style={styles.tabLineOff} />}
          </Pressable>
          <Pressable onPress={() => setTab("claims")} style={styles.tab}>
            <View style={styles.tabTitleRow}>
              <Text style={[styles.tabLabel, tab === "claims" && styles.tabLabelOn]}>Extracted Claims</Text>
              {pending ? <View style={styles.dot} /> : null}
            </View>
            {tab === "claims" ? <View style={styles.tabLine} /> : <View style={styles.tabLineOff} />}
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 28 }]}>
          {error ? <Text style={styles.error}>{error}</Text> : null}

          {tab === "transcript" ? (
            <View style={styles.transcriptBlock}>
              <Text style={styles.range}>
                00:00 – {duration ? padClock(duration) : "--:--"}
              </Text>
              <Text style={styles.transcript}>
                {memo?.transcript?.trim() || "No transcript yet. Record a pitch and we’ll write it here."}
              </Text>
              <View style={styles.player}>
                <Text style={styles.playerTime}>{clock(position)}</Text>
                <Pressable
                  style={styles.trackHit}
                  onPress={(event) => seekTo(event.nativeEvent.locationX)}
                  onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
                  accessibilityRole="adjustable"
                  accessibilityLabel="Seek audio"
                >
                  <View style={styles.track} />
                  <View style={[styles.trackFill, { width: `${duration ? (position / duration) * 100 : 0}%` }]} />
                  <View
                    style={[
                      styles.knob,
                      { left: Math.max(0, (duration ? position / duration : 0) * trackWidth - 7) },
                    ]}
                  />
                </Pressable>
                <Text style={styles.playerRemain}>-{clock(Math.max(0, duration - position))}</Text>
              </View>
              <Pressable onPress={() => void togglePlayback()} style={styles.play}>
                <Text style={styles.playLabel}>{playback.playing ? "Pause" : "Play recording"}</Text>
              </Pressable>
            </View>
          ) : null}

          <Text style={styles.section}>Extracted Claims</Text>
          <Text style={styles.sectionHint}>Review and confirm the information below.</Text>

          {claims.length === 0 ? (
            <Text style={styles.empty}>Nothing extracted from this recording yet.</Text>
          ) : (
            claims.map((claim) => {
              const level = confidenceLabel(claim.confidence);
              const heading = TYPE_LABELS[claim.claim_type] || claim.title || "Claim";
              const busy = savingId === claim.id;
              return (
                <View key={claim.id} style={[styles.card, claim.status === "rejected" && styles.cardRejected]}>
                  <View style={styles.cardHead}>
                    <Text style={styles.cardTitle}>{heading}</Text>
                    <View
                      style={[
                        styles.badge,
                        level === "High" && styles.badgeHigh,
                        level === "Medium" && styles.badgeMedium,
                        level === "Low" && styles.badgeLow,
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          level === "High" && styles.badgeTextHigh,
                          level === "Medium" && styles.badgeTextMedium,
                          level === "Low" && styles.badgeTextLow,
                        ]}
                      >
                        {level}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.cardBody}>{claim.body || claim.title}</Text>
                  <View style={styles.actions}>
                    <Pressable
                      disabled={busy}
                      onPress={() => void patchClaim(claim, { status: "confirmed" })}
                      style={[styles.action, styles.confirm, claim.status === "confirmed" && styles.confirmOn]}
                    >
                      <CheckIcon />
                      <Text style={styles.confirmLabel}>
                        {claim.status === "confirmed" ? "Confirmed" : "Confirm"}
                      </Text>
                    </Pressable>
                    <Pressable
                      disabled={busy}
                      onPress={() => {
                        setEditing(claim);
                        setDraft(claim.body || claim.title);
                      }}
                      style={[styles.action, styles.neutral]}
                    >
                      <PencilIcon />
                      <Text style={styles.neutralLabel}>Edit</Text>
                    </Pressable>
                    <Pressable
                      disabled={busy}
                      onPress={() => void patchClaim(claim, { status: "rejected" })}
                      style={[styles.action, styles.neutral, claim.status === "rejected" && styles.rejectOn]}
                    >
                      <XIcon />
                      <Text style={styles.neutralLabel}>
                        {claim.status === "rejected" ? "Rejected" : "Reject"}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>

      <Modal visible={editing !== null} transparent animationType="fade" onRequestClose={() => setEditing(null)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.modalWrap}>
          <Pressable style={styles.modalBackdrop} onPress={() => setEditing(null)} />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editing ? TYPE_LABELS[editing.claim_type] || "Edit claim" : "Edit claim"}
            </Text>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              multiline
              style={styles.input}
              placeholder="Rewrite this claim"
            />
            <View style={styles.modalActions}>
              <Pressable onPress={() => setEditing(null)} style={styles.modalCancel}>
                <Text style={styles.neutralLabel}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  if (!editing) return;
                  const claim = editing;
                  setEditing(null);
                  void patchClaim(claim, { body: draft.trim(), status: "stated" });
                }}
                style={styles.modalSave}
              >
                <Text style={styles.modalSaveLabel}>Save</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.menuBackdrop} onPress={() => setMenuOpen(false)}>
          <View style={[styles.menu, { top: insets.top + 52 }]}>
            <Pressable
              onPress={() => {
                setMenuOpen(false);
                router.push("/profile");
              }}
              style={styles.menuItem}
            >
              <Text style={styles.menuLabel}>My Profile</Text>
            </Pressable>
            <View style={styles.menuDivider} />
            <Pressable
              onPress={async () => {
                setMenuOpen(false);
                await signOut();
                router.replace("/");
              }}
              style={styles.menuItem}
            >
              <Text style={styles.menuLogout}>Log out</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f7f8fb" },
  safe: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#f7f8fb" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
    gap: 10,
  },
  projectName: {
    flex: 1,
    fontFamily: "IBMPlexSans_700Bold",
    fontSize: 20,
    color: "#1c1d27",
    letterSpacing: -0.3,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#6d4aff",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontFamily: "IBMPlexSans_600SemiBold", fontSize: 15, color: "#ffffff" },
  tabs: { flexDirection: "row", paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: "#eceef3" },
  tab: { flex: 1, alignItems: "center", paddingTop: 8 },
  tabTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  tabLabel: { fontFamily: "IBMPlexSans_600SemiBold", fontSize: 15, color: "#9aa0ab" },
  tabLabelOn: { color: "#6d4aff" },
  tabLine: { marginTop: 10, height: 3, width: "78%", borderRadius: 2, backgroundColor: "#6d4aff" },
  tabLineOff: { marginTop: 10, height: 3, width: "78%" },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#ef4444" },
  scroll: { paddingHorizontal: 18, paddingTop: 18, gap: 12 },
  error: { fontFamily: "IBMPlexSans_400Regular", fontSize: 14, color: "#b42318" },
  transcriptBlock: { gap: 12, marginBottom: 8 },
  range: { fontFamily: "IBMPlexSans_500Medium", fontSize: 13, color: "#8b909c" },
  transcript: { fontFamily: "IBMPlexSans_400Regular", fontSize: 16, lineHeight: 24, color: "#2a2d36" },
  player: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  playerTime: { fontFamily: "IBMPlexSans_500Medium", fontSize: 13, color: "#6b7280", width: 36 },
  playerRemain: {
    fontFamily: "IBMPlexSans_500Medium",
    fontSize: 13,
    color: "#6b7280",
    width: 44,
    textAlign: "right",
  },
  trackHit: { flex: 1, height: 28, justifyContent: "center" },
  track: { height: 4, borderRadius: 2, backgroundColor: "#e4e7ee" },
  trackFill: { position: "absolute", left: 0, height: 4, borderRadius: 2, backgroundColor: "#d9d4f5" },
  knob: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#6d4aff",
  },
  play: { alignSelf: "flex-start" },
  playLabel: { fontFamily: "IBMPlexSans_600SemiBold", fontSize: 13, color: "#6d4aff" },
  section: { fontFamily: "IBMPlexSans_700Bold", fontSize: 22, color: "#1c1d27", marginTop: 8 },
  sectionHint: { fontFamily: "IBMPlexSans_400Regular", fontSize: 14, color: "#8b909c", marginTop: -4 },
  empty: { fontFamily: "IBMPlexSans_400Regular", fontSize: 15, color: "#8b909c" },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#eceef3",
    padding: 14,
    gap: 10,
  },
  cardRejected: { opacity: 0.55 },
  cardHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  cardTitle: { fontFamily: "IBMPlexSans_700Bold", fontSize: 16, color: "#1c1d27" },
  cardBody: { fontFamily: "IBMPlexSans_400Regular", fontSize: 15, lineHeight: 22, color: "#3a3f4b" },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeHigh: { backgroundColor: "#e5f8ec" },
  badgeMedium: { backgroundColor: "#fff3df" },
  badgeLow: { backgroundColor: "#f1f2f5" },
  badgeText: { fontFamily: "IBMPlexSans_600SemiBold", fontSize: 12 },
  badgeTextHigh: { color: "#178a48" },
  badgeTextMedium: { color: "#d97706" },
  badgeTextLow: { color: "#6b7280" },
  actions: { flexDirection: "row", gap: 8 },
  action: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  confirm: { backgroundColor: "#e7f8ee" },
  confirmOn: { backgroundColor: "#c8f0d6" },
  confirmLabel: { fontFamily: "IBMPlexSans_600SemiBold", fontSize: 13, color: "#178a48" },
  neutral: { backgroundColor: "#f3f4f7" },
  rejectOn: { backgroundColor: "#eceef3" },
  neutralLabel: { fontFamily: "IBMPlexSans_600SemiBold", fontSize: 13, color: "#4b5160" },
  modalWrap: { flex: 1, justifyContent: "flex-end" },
  modalBackdrop: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(17, 18, 24, 0.35)" },
  modalCard: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 18,
    gap: 12,
  },
  modalTitle: { fontFamily: "IBMPlexSans_700Bold", fontSize: 18, color: "#1c1d27" },
  input: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: "#e4e7ee",
    borderRadius: 12,
    padding: 12,
    fontFamily: "IBMPlexSans_400Regular",
    fontSize: 15,
    color: "#1c1d27",
    textAlignVertical: "top",
  },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 8 },
  modalCancel: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f7",
  },
  modalSave: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6d4aff",
  },
  modalSaveLabel: { fontFamily: "IBMPlexSans_600SemiBold", fontSize: 14, color: "#ffffff" },
  menuBackdrop: { flex: 1 },
  menu: {
    position: "absolute",
    right: 16,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    minWidth: 160,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  menuItem: { paddingHorizontal: 14, paddingVertical: 12 },
  menuDivider: { height: 1, backgroundColor: "#eceef3" },
  menuLabel: { fontFamily: "IBMPlexSans_500Medium", fontSize: 15, color: "#1c1d27" },
  menuLogout: { fontFamily: "IBMPlexSans_500Medium", fontSize: 15, color: "#b42318" },
});
