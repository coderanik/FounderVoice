import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { TermsCheckRow } from "@/components/auth/TermsCheckRow";
import { fonts, spacing } from "@/theme/tokens";

const accent = "#6366f1";
const ink = "#111827";
const muted = "#6b7280";

type Props = {
  visible: boolean;
  staySignedIn: boolean;
  onToggleStay: () => void;
  saveCredentials: boolean;
  onToggleSaveCredentials: () => void;
  showSaveCredentials?: boolean;
  onContinue: () => void;
};

export function StaySignedInModal({
  visible,
  staySignedIn,
  onToggleStay,
  saveCredentials,
  onToggleSaveCredentials,
  showSaveCredentials = true,
  onContinue,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>You're signed in</Text>
          <Text style={styles.body}>
            Choose how this device should remember you. Credentials are stored in the system secure
            vault when enabled.
          </Text>

          <TermsCheckRow checked={staySignedIn} onToggle={onToggleStay}>
            Stay signed in on this device
          </TermsCheckRow>

          {showSaveCredentials ? (
            <TermsCheckRow checked={saveCredentials} onToggle={onToggleSaveCredentials}>
              Store email & password securely for faster sign-in
            </TermsCheckRow>
          ) : null}

          <Pressable
            accessibilityRole="button"
            onPress={onContinue}
            style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
          >
            <Text style={styles.btnLabel}>Continue</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    padding: spacing.lg,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: spacing.lg,
    gap: 14,
  },
  title: {
    fontFamily: fonts.sansBold,
    fontSize: 20,
    color: ink,
  },
  body: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: muted,
    lineHeight: 19,
  },
  btn: {
    marginTop: 4,
    minHeight: 46,
    borderRadius: 10,
    backgroundColor: accent,
    alignItems: "center",
    justifyContent: "center",
  },
  btnLabel: {
    fontFamily: fonts.sansSemi,
    fontSize: 15,
    color: "#fff",
  },
  pressed: {
    opacity: 0.88,
  },
});
