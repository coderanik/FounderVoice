import { type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { fonts } from "@/theme/tokens";

const accent = "#6366f1";
const muted = "#6b7280";
const line = "#e5e7eb";

type Props = {
  checked: boolean;
  onToggle: () => void;
  /** When true, shows the standard T&C agreement copy with links. */
  termsAgreement?: boolean;
  children?: ReactNode;
  onOpenTerms?: () => void;
  onOpenPrivacy?: () => void;
};

export function TermsCheckRow({
  checked,
  onToggle,
  termsAgreement,
  children,
  onOpenTerms,
  onOpenPrivacy,
}: Props) {
  const router = useRouter();

  function openTerms() {
    if (onOpenTerms) onOpenTerms();
    else router.push("/terms");
  }

  function openPrivacy() {
    if (onOpenPrivacy) onOpenPrivacy();
    else router.push("/terms?section=privacy-policy");
  }

  return (
    <View style={styles.checkRow}>
      <Pressable
        onPress={onToggle}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        hitSlop={6}
      >
        <View style={[styles.checkbox, checked && styles.checkboxOn]}>
          {checked ? <Text style={styles.checkMark}>✓</Text> : null}
        </View>
      </Pressable>

      {termsAgreement ? (
        <Text style={styles.checkLabel}>
          I agree to the{" "}
          <Text style={styles.link} onPress={openTerms} accessibilityRole="link">
            Terms and Conditions
          </Text>{" "}
          and{" "}
          <Text style={styles.link} onPress={openPrivacy} accessibilityRole="link">
            Privacy Policy
          </Text>
          .
        </Text>
      ) : (
        <Pressable onPress={onToggle} style={styles.labelPress}>
          <Text style={styles.checkLabel}>{children}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  checkRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: line,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  checkboxOn: {
    backgroundColor: accent,
    borderColor: accent,
  },
  checkMark: {
    color: "#fff",
    fontSize: 12,
    fontFamily: fonts.sansBold,
  },
  checkLabel: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: 12,
    color: muted,
    lineHeight: 18,
  },
  labelPress: {
    flex: 1,
  },
  link: {
    color: accent,
    fontFamily: fonts.sansSemi,
    textDecorationLine: "underline",
  },
});
