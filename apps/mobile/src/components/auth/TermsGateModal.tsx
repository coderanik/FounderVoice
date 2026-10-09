import { useEffect, useState } from "react";
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
import { TermsCheckRow } from "@/components/auth/TermsCheckRow";
import { RoleToggle } from "@/components/ui/RoleToggle";
import {
  TERMS_INTRO,
  TERMS_LAST_UPDATED,
  TERMS_SECTIONS,
} from "@/content/terms";
import { acceptTermsAndCompleteProfile, needsTermsGate } from "@/lib/auth";
import { UserProfile, UserRole } from "@/lib/session";
import { fonts, spacing } from "@/theme/tokens";

const accent = "#6366f1";
const ink = "#111827";
const muted = "#6b7280";
const line = "#e5e7eb";

type Props = {
  profile: UserProfile | null;
  onAccepted: (profile: UserProfile) => void;
};

export function TermsGateModal({ profile, onAccepted }: Props) {
  const visible = needsTermsGate(profile);
  const [role, setRole] = useState<UserRole>("founder");
  const [displayName, setDisplayName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [docView, setDocView] = useState<"form" | "terms" | "privacy">("form");

  useEffect(() => {
    if (!profile) return;
    setRole(profile.role);
    setDisplayName(profile.name);
    setOrgName(profile.orgName);
    setAgreed(false);
    setError("");
    setDocView("form");
  }, [profile]);

  if (!profile) return null;

  async function onConfirm() {
    setError("");
    if (!agreed) {
      setError("Please agree to the Terms and Conditions.");
      return;
    }
    setLoading(true);
    try {
      const next = await acceptTermsAndCompleteProfile({
        role,
        displayName,
        orgName,
      });
      onAccepted(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setLoading(false);
    }
  }

  const sections =
    docView === "privacy"
      ? TERMS_SECTIONS.filter((s) => s.id === "privacy-policy" || s.id === "privacy")
      : TERMS_SECTIONS;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={styles.card}>
            {docView !== "form" ? (
              <>
                <View style={styles.docHeader}>
                  <Pressable onPress={() => setDocView("form")} hitSlop={10}>
                    <Text style={styles.link}>← Back</Text>
                  </Pressable>
                  <Text style={styles.docHeaderTitle}>
                    {docView === "privacy" ? "Privacy Policy" : "Terms and Conditions"}
                  </Text>
                  <View style={{ width: 48 }} />
                </View>
                <ScrollView showsVerticalScrollIndicator={false} style={styles.docScroll}>
                  {docView === "terms" ? (
                    <>
                      <Text style={styles.updated}>Last updated: {TERMS_LAST_UPDATED}</Text>
                      <Text style={styles.docIntro}>{TERMS_INTRO}</Text>
                    </>
                  ) : null}
                  {sections.map((block) => (
                    <View key={block.id} style={styles.section}>
                      <Text style={styles.sectionTitle}>{block.title}</Text>
                      {block.paragraphs.map((p, i) => (
                        <Text key={i} style={styles.paragraph}>
                          {p}
                        </Text>
                      ))}
                    </View>
                  ))}
                </ScrollView>
              </>
            ) : (
              <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>Almost there</Text>
                <Text style={styles.body}>
                  Please review and agree to our{" "}
                  <Text style={styles.link} onPress={() => setDocView("terms")}>
                    Terms and Conditions
                  </Text>{" "}
                  to keep FounderVoice running smoothly. Confirm your role and details below.
                </Text>

                <Text style={styles.label}>Continue as</Text>
                <RoleToggle value={role} onChange={setRole} variant="light" />

                <Text style={[styles.label, styles.fieldGap]}>
                  {role === "founder" ? "Founder name" : "Investor name"}
                </Text>
                <TextInput
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder={role === "founder" ? "Your name" : "Investor name"}
                  placeholderTextColor="#9ca3af"
                  style={styles.input}
                  autoCapitalize="words"
                />

                <Text style={[styles.label, styles.fieldGap]}>
                  {role === "founder" ? "Startup name" : "Company name"}
                </Text>
                <TextInput
                  value={orgName}
                  onChangeText={setOrgName}
                  placeholder={role === "founder" ? "Startup name" : "Company name"}
                  placeholderTextColor="#9ca3af"
                  style={styles.input}
                  autoCapitalize="words"
                />

                <View style={styles.termsWrap}>
                  <TermsCheckRow
                    checked={agreed}
                    onToggle={() => setAgreed((v) => !v)}
                    termsAgreement
                    onOpenTerms={() => setDocView("terms")}
                    onOpenPrivacy={() => setDocView("privacy")}
                  />
                </View>

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <Pressable
                  style={[styles.btn, loading && styles.disabled]}
                  disabled={loading}
                  onPress={onConfirm}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.btnLabel}>Continue</Text>
                  )}
                </Pressable>
              </ScrollView>
            )}
          </View>
        </KeyboardAvoidingView>
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
    maxHeight: "88%",
  },
  title: {
    fontFamily: fonts.sansBold,
    fontSize: 20,
    color: ink,
    marginBottom: 8,
  },
  body: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: muted,
    lineHeight: 19,
    marginBottom: 18,
  },
  link: {
    color: accent,
    fontFamily: fonts.sansSemi,
    textDecorationLine: "underline",
  },
  label: {
    fontFamily: fonts.sansSemi,
    fontSize: 13,
    color: ink,
    marginBottom: 8,
  },
  fieldGap: {
    marginTop: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: line,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 11 : 9,
    fontFamily: fonts.sans,
    fontSize: 14,
    color: ink,
  },
  termsWrap: {
    marginTop: 16,
  },
  error: {
    marginTop: 10,
    fontFamily: fonts.sans,
    fontSize: 12,
    color: "#dc2626",
  },
  btn: {
    marginTop: 16,
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
  disabled: {
    opacity: 0.55,
  },
  docHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  docHeaderTitle: {
    fontFamily: fonts.sansSemi,
    fontSize: 14,
    color: ink,
  },
  docScroll: {
    maxHeight: 420,
  },
  updated: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: muted,
    marginBottom: 10,
  },
  docIntro: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: ink,
    lineHeight: 18,
    marginBottom: 14,
  },
  section: {
    marginBottom: 14,
    gap: 6,
  },
  sectionTitle: {
    fontFamily: fonts.sansSemi,
    fontSize: 13,
    color: ink,
  },
  paragraph: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: muted,
    lineHeight: 18,
  },
});
