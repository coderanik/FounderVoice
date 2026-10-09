import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { WelcomeScreen } from "@/components/welcome/WelcomeScreen";
import { ensureSessionPersistence } from "@/lib/auth";
import { getPostOnboardingAuthRoute, isOnboardingDone } from "@/lib/device";
import { colors } from "@/theme/tokens";

export default function IndexScreen() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    let active = true;

    async function boot() {
      try {
        const profile = await ensureSessionPersistence();
        if (!active) return;
        if (profile) {
          router.replace("/projects");
          return;
        }

        const onboarded = await isOnboardingDone();
        if (!active) return;
        if (onboarded) {
          const route = await getPostOnboardingAuthRoute();
          if (!active) return;
          router.replace(route);
          return;
        }
      } catch {
        // fall through to welcome
      }
      if (active) {
        setShowWelcome(true);
        setReady(true);
      }
    }

    boot();
    return () => {
      active = false;
    };
  }, [router]);

  if (!ready || !showWelcome) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color="#7c6cff" />
      </View>
    );
  }

  return <WelcomeScreen />;
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    backgroundColor: colors.canvas,
    alignItems: "center",
    justifyContent: "center",
  },
});
