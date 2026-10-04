import { Pressable, StyleSheet, Text, View } from "react-native";
import { API_BASE } from "@/lib/apiBase";
import { colors, fonts, radii, spacing } from "@/theme/tokens";

type Props = {
  message: string;
  onRetry?: () => void;
};

export function ErrorBanner({ message, onRetry }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Couldn&apos;t reach the API</Text>
      <Text style={styles.message} numberOfLines={4}>
        {message.includes("ConnectException") ||
        message.includes("fetch failed") ||
        message.includes("Network request failed") ||
        message.includes("Connection reset")
          ? `Can't reach ${API_BASE}. The phone and this computer must be on the same Wi-Fi. Pull to refresh.`
          : message}
      </Text>
      {onRetry ? (
        <Pressable onPress={onRetry} style={styles.retry}>
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: "rgba(240, 113, 120, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(240, 113, 120, 0.35)",
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  title: {
    fontFamily: fonts.sansSemi,
    fontSize: 14,
    color: colors.danger,
  },
  message: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.muted,
    lineHeight: 18,
  },
  retry: {
    alignSelf: "flex-start",
    paddingVertical: 4,
  },
  retryText: {
    fontFamily: fonts.sansSemi,
    fontSize: 13,
    color: colors.accent,
  },
});
