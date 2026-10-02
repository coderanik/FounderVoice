import { ReactNode } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/theme/tokens";

type Props = {
  children: ReactNode;
  style?: ViewStyle;
};

export function Screen({ children, style }: Props) {
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#0d0d10", colors.canvas, "#050506"]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.glow} />
      <SafeAreaView style={[styles.safe, style]}>{children}</SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  glow: {
    position: "absolute",
    top: -80,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(212, 168, 83, 0.08)",
  },
  safe: {
    flex: 1,
  },
});
