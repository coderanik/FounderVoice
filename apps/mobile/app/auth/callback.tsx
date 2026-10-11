import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { createSessionFromUrl, getCurrentProfile } from "@/lib/auth";

/**
 * Deep-link landing for OAuth / magic links.
 * Primary path is WebBrowser.openAuthSessionAsync; this handles cold-start opens.
 */
export default function AuthCallbackScreen() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function run() {
      try {
        const url = await Linking.getInitialURL();
        if (url) {
          await createSessionFromUrl(url);
        }

        const profile = await getCurrentProfile();
        if (!active) return;
        router.replace(profile ? "/projects" : "/login");
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : "Auth callback failed.");
        setTimeout(() => {
          if (active) router.replace("/login");
        }, 1800);
      }
    }

    run();
    return () => {
      active = false;
    };
  }, [router]);

  return (
    <View style={styles.root}>
      <ActivityIndicator color="#6366f1" />
      <Text style={styles.label}>{error || "Finishing sign in…"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
  },
  label: {
    color: "#6b7280",
    fontSize: 14,
    textAlign: "center",
  },
});
