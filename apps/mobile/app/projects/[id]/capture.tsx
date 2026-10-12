import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path, Rect } from "react-native-svg";
import { FounderVoiceMark } from "@/components/brand/FounderVoiceMark";
import { api } from "@/lib/api";
import { getCurrentProfile, signOut } from "@/lib/auth";
import { UserProfile } from "@/lib/session";

type Phase = "idle" | "recording" | "paused" | "processing";

function initialOf(profile: UserProfile | null): string {
  const source = profile?.name?.trim() || profile?.email?.trim() || "A";
  return source.charAt(0).toUpperCase();
}

function formatElapsed(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function MicIcon() {
  return (
    <Svg width={42} height={42} viewBox="0 0 24 24" fill="none">
      <Rect x="9" y="3" width="6" height="11" rx="3" fill="#6d4aff" />
      <Path
        d="M7 11.5a5 5 0 0 0 10 0"
        stroke="#6d4aff"
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Path d="M12 16.5V20" stroke="#6d4aff" strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M9 20h6" stroke="#6d4aff" strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

export default function CaptureScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 200);
  const [phase, setPhase] = useState<Phase>("idle");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [error, setError] = useState("");
  const phaseRef = useRef<Phase>("idle");
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    getCurrentProfile()
      .then(setProfile)
      .catch(() => setProfile(null));
  }, []);

  useEffect(() => {
    if (phase !== "recording") {
      pulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 700, useNativeDriver: Platform.OS !== "web" }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: Platform.OS !== "web" }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [phase, pulse]);

  const elapsed =
    phase === "recording" || phase === "paused" ? recorderState.durationMillis : 0;
  const canPause = phase === "recording" || phase === "paused";
  const canStop = phase === "recording" || phase === "paused";

  async function startRecording() {
    if (!id || phaseRef.current === "processing") return;
    setError("");
    try {
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        setError("Microphone access is required to record your pitch.");
        return;
      }
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
        interruptionMode: "doNotMix",
      });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setPhase("recording");
    } catch (e) {
      setPhase("idle");
      setError(e instanceof Error ? e.message : "Could not start recording.");
    }
  }

  function pauseOrResume() {
    if (phaseRef.current === "recording") {
      recorder.pause();
      setPhase("paused");
      return;
    }
    if (phaseRef.current === "paused") {
      recorder.record();
      setPhase("recording");
    }
  }

  async function stopAndProcess() {
    if (!id || (phaseRef.current !== "recording" && phaseRef.current !== "paused")) return;
    setError("");
    setPhase("processing");
    try {
      await recorder.stop();
      const uri = recorder.uri || recorderState.url;
      if (!uri) {
        setPhase("idle");
        setError("Recording was empty. Try again.");
        return;
      }
      await api.uploadMemo(
        id,
        {
          uri,
          name: `pitch-${Date.now()}.m4a`,
          type: "audio/mp4",
        },
        "auto"
      );
      router.replace(`/projects/${id}`);
    } catch (e) {
      setPhase("idle");
      const message = e instanceof Error ? e.message : "Could not process the recording.";
      setError(
        message.includes("prepareToRecordAsync")
          ? "Recording was interrupted. Tap the microphone to start again."
          : message
      );
    }
  }

  function onMicPress() {
    if (phase === "idle") {
      void startRecording();
      return;
    }
    if (phase === "paused") {
      pauseOrResume();
    }
  }

  const hint =
    phase === "recording"
      ? `Recording ${formatElapsed(elapsed)}`
      : phase === "paused"
        ? `Paused ${formatElapsed(elapsed)} — tap to resume`
        : phase === "processing"
          ? "Turning your pitch into a claim graph…"
          : "Tap to start recording";

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safe}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.replace("/projects")} style={styles.brandRow}>
            <FounderVoiceMark size={28} theme="light" />
            <Text style={styles.brand}>
              Founder<Text style={styles.brandAccent}>Voice</Text>
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setMenuOpen(true)}
            style={styles.avatar}
            accessibilityLabel="Account menu"
          >
            <Text style={styles.avatarText}>{initialOf(profile)}</Text>
          </Pressable>
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>Tell us about your startup</Text>
          <Text style={styles.subtitle}>
            Just speak naturally. Don’t worry about structure — we’ll take care of the rest.
          </Text>

          <Pressable
            onPress={onMicPress}
            disabled={phase === "recording" || phase === "processing"}
            accessibilityRole="button"
            accessibilityLabel={phase === "idle" ? "Start recording" : "Resume recording"}
            style={styles.micHit}
          >
            <Animated.View style={[styles.micRing, { transform: [{ scale: pulse }] }]}>
              <View style={[styles.micCore, phase === "recording" && styles.micCoreLive]}>
                {phase === "processing" ? (
                  <ActivityIndicator color="#6d4aff" />
                ) : (
                  <MicIcon />
                )}
              </View>
            </Animated.View>
          </Pressable>
          <Text style={styles.hint}>{hint}</Text>

          <View style={styles.tips}>
            <Text style={styles.tipsTitle}>Tips:</Text>
            <Text style={styles.tip}>•  Speak freely (2–5 minutes)</Text>
            <Text style={styles.tip}>•  Cover problem, solution, target market, traction, etc.</Text>
            <Text style={styles.tip}>•  You can pause and resume anytime</Text>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.actions}>
            <Pressable
              onPress={pauseOrResume}
              disabled={!canPause}
              accessibilityRole="button"
              accessibilityLabel={phase === "paused" ? "Resume recording" : "Pause recording"}
              style={[styles.pause, !canPause && styles.pauseDisabled]}
            >
              <View style={styles.pauseIcon}>
                <View style={[styles.pauseBar, !canPause && styles.pauseBarDisabled]} />
                <View style={[styles.pauseBar, !canPause && styles.pauseBarDisabled]} />
              </View>
              <Text style={[styles.pauseLabel, !canPause && styles.pauseLabelDisabled]}>
                {phase === "paused" ? "Resume" : "Pause"}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => void stopAndProcess()}
              disabled={!canStop}
              accessibilityRole="button"
              accessibilityLabel="Stop and process"
              style={[styles.stop, !canStop && styles.stopDisabled]}
            >
              <View style={styles.stopSquare} />
              <Text style={styles.stopLabel}>
                {phase === "processing" ? "Processing…" : "Stop & Process"}
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>

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
  root: {
    flex: 1,
    backgroundColor: "#f4f5f8",
  },
  safe: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingTop: 6,
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
  body: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 18,
  },
  title: {
    fontFamily: "IBMPlexSans_700Bold",
    fontSize: 26,
    color: "#1a1b23",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: "IBMPlexSans_400Regular",
    fontSize: 15,
    lineHeight: 22,
    color: "#8b909c",
    marginBottom: 28,
  },
  micHit: {
    alignSelf: "center",
  },
  micRing: {
    width: 168,
    height: 168,
    borderRadius: 84,
    backgroundColor: "#efeaff",
    alignItems: "center",
    justifyContent: "center",
  },
  micCore: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6d4aff",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  micCoreLive: {
    backgroundColor: "#f7f4ff",
  },
  hint: {
    marginTop: 16,
    textAlign: "center",
    fontFamily: "IBMPlexSans_500Medium",
    fontSize: 15,
    color: "#6b7280",
  },
  tips: {
    marginTop: 28,
    backgroundColor: "#f3f4f8",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  tipsTitle: {
    fontFamily: "IBMPlexSans_700Bold",
    fontSize: 15,
    color: "#1a1b23",
  },
  tip: {
    fontFamily: "IBMPlexSans_400Regular",
    fontSize: 14,
    lineHeight: 20,
    color: "#4b5160",
  },
  error: {
    marginTop: 12,
    fontFamily: "IBMPlexSans_400Regular",
    fontSize: 13,
    lineHeight: 18,
    color: "#c04545",
  },
  actions: {
    marginTop: "auto",
    flexDirection: "row",
    gap: 12,
    paddingBottom: 12,
  },
  pause: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#eceef3",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  pauseDisabled: {
    backgroundColor: "#f3f4f6",
  },
  pauseIcon: {
    flexDirection: "row",
    gap: 3,
  },
  pauseBar: {
    width: 3.5,
    height: 14,
    borderRadius: 2,
    backgroundColor: "#3c4150",
  },
  pauseBarDisabled: {
    backgroundColor: "#b0b6c2",
  },
  pauseLabel: {
    fontFamily: "IBMPlexSans_600SemiBold",
    fontSize: 15,
    color: "#2a2e3a",
  },
  pauseLabelDisabled: {
    color: "#b0b6c2",
  },
  stop: {
    flex: 1.15,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#ef4444",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  stopDisabled: {
    opacity: 0.92,
  },
  stopSquare: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: "#ffffff",
  },
  stopLabel: {
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
});
