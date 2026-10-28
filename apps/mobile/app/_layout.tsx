import "react-native-gesture-handler";
import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import * as Updates from "expo-updates";
import {
  IBMPlexSans_400Regular,
  IBMPlexSans_500Medium,
  IBMPlexSans_600SemiBold,
  IBMPlexSans_700Bold,
} from "@expo-google-fonts/ibm-plex-sans";
import { InstrumentSerif_400Regular } from "@expo-google-fonts/instrument-serif";
import { ActivityIndicator, View } from "react-native";
import { colors } from "@/theme/tokens";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    IBMPlexSans_400Regular,
    IBMPlexSans_500Medium,
    IBMPlexSans_600SemiBold,
    IBMPlexSans_700Bold,
    InstrumentSerif_400Regular,
  });
  const [updateReady, setUpdateReady] = useState(!Updates.isEnabled);

  useEffect(() => {
    let cancelled = false;
    async function applyUpdate() {
      if (!Updates.isEnabled) {
        setUpdateReady(true);
        return;
      }
      try {
        const result = await Updates.checkForUpdateAsync();
        if (result.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
          return;
        }
      } catch {
        // Stay on the current bundle if the update check fails offline.
      }
      if (!cancelled) setUpdateReady(true);
    }
    void applyUpdate();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!fontsLoaded || !updateReady) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.canvas }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.canvas },
          animation: "fade",
        }}
      />
    </>
  );
}
