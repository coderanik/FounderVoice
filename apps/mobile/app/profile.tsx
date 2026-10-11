import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { getCurrentProfile } from "@/lib/auth";
import { roleLabel, UserProfile } from "@/lib/session";

function initialOf(profile: UserProfile | null): string {
  const source = profile?.name?.trim() || profile?.email?.trim() || "A";
  return source.charAt(0).toUpperCase();
}

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    getCurrentProfile()
      .then(setProfile)
      .catch(() => setProfile(null));
  }, []);

  const rows = [
    { label: "Email", value: profile?.email || "—" },
    { label: "Role", value: profile ? roleLabel(profile.role) : "—" },
    { label: "Organization", value: profile?.orgName || "—" },
  ];

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <Pressable onPress={() => router.back()} style={styles.back} accessibilityLabel="Back to projects">
          <Text style={styles.backText}>← Projects</Text>
        </Pressable>

        <View style={styles.hero}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initialOf(profile)}</Text>
          </View>
          <Text style={styles.name}>{profile?.name || "My Profile"}</Text>
        </View>

        <View style={styles.card}>
          {rows.map((row, index) => (
            <View key={row.label} style={[styles.row, index > 0 && styles.rowBorder]}>
              <Text style={styles.label}>{row.label}</Text>
              <Text style={styles.value}>{row.value}</Text>
            </View>
          ))}
        </View>
      </SafeAreaView>
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
    paddingHorizontal: 20,
  },
  back: {
    alignSelf: "flex-start",
    paddingVertical: 12,
  },
  backText: {
    fontFamily: "IBMPlexSans_500Medium",
    fontSize: 15,
    color: "#6d4aff",
  },
  hero: {
    alignItems: "center",
    gap: 12,
    paddingTop: 12,
    paddingBottom: 28,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#6d4aff",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: "IBMPlexSans_700Bold",
    fontSize: 28,
    color: "#ffffff",
  },
  name: {
    fontFamily: "IBMPlexSans_700Bold",
    fontSize: 24,
    color: "#17181f",
    letterSpacing: -0.4,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#eef0f5",
    overflow: "hidden",
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 4,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: "#eef0f5",
  },
  label: {
    fontFamily: "IBMPlexSans_400Regular",
    fontSize: 12,
    color: "#8b909c",
  },
  value: {
    fontFamily: "IBMPlexSans_500Medium",
    fontSize: 16,
    color: "#17181f",
  },
});
