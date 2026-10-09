import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { FounderVoiceMark } from "@/components/brand/FounderVoiceMark";
import { RoleToggle } from "@/components/ui/RoleToggle";
import { StaySignedInModal } from "@/components/auth/StaySignedInModal";
import { TermsCheckRow } from "@/components/auth/TermsCheckRow";
import { confirmStaySignedIn, signInWithEmail, signInWithOAuth, signUpWithEmail } from "@/lib/auth";
import {
  clearOnboardingDone,
  clearSavedCredentials,
  loadSavedCredentials,
  markAppInstalled,
  saveCredentialsSecurely,
} from "@/lib/device";
import { UserRole } from "@/lib/session";
import { fonts, spacing } from "@/theme/tokens";

type AuthMode = "login" | "signup";

const accent = "#6366f1";
const ink = "#111827";
const muted = "#6b7280";
const line = "#e5e7eb";
const canvas = "#ffffff";

function BrandLockup({ centered = false }: { centered?: boolean }) {
  return (
    <View style={[styles.logoRow, centered && styles.logoRowCentered]}>
      <FounderVoiceMark size={32} theme="light" />
      <Text style={styles.wordmark}>
        Founder<Text style={styles.wordmarkAccent}>Voice</Text>
      </Text>
    </View>
  );
}

function GoogleGlyph() {
  return (
    <Svg width={18} height={18} viewBox="0 0 48 48">
      <Path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.5-.4-3.5z"
      />
      <Path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.2 6.1 29.4 4 24 4 16.1 4 9.3 8.5 6.3 14.7z"
      />
      <Path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.3 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.2 39.4 16 44 24 44z"
      />
      <Path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.3 4.1-4.1 5.5l6.2 5.2C39.2 36.3 44 31.5 44 24c0-1.3-.1-2.5-.4-3.5z"
      />
    </Svg>
  );
}

function GitHubGlyph() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path
        fill={ink}
        d="M12 2C6.48 2 2 6.58 2 12.26c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.73 0 0 .84-.27 2.75 1.05A9.3 9.3 0 0 1 12 6.8c.85 0 1.71.12 2.51.35 1.91-1.32 2.75-1.05 2.75-1.05.55 1.42.2 2.47.1 2.73.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .26.18.58.69.48A10.03 10.03 0 0 0 22 12.26C22 6.58 17.52 2 12 2z"
      />
    </Svg>
  );
}

function HomeGlyph() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5z"
        stroke={ink}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function LightField({ label, ...rest }: { label: string } & TextInputProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput placeholderTextColor="#9ca3af" style={styles.input} {...rest} />
    </View>
  );
}

export function AuthScreen({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const isLogin = mode === "login";

  const [role, setRole] = useState<UserRole>("founder");
  const [founderName, setFounderName] = useState("");
  const [startupName, setStartupName] = useState("");
  const [investorName, setInvestorName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"google" | "github" | null>(null);
  const [showStayPrompt, setShowStayPrompt] = useState(false);
  const [staySignedIn, setStaySignedIn] = useState(true);
  const [saveCredentials, setSaveCredentials] = useState(true);
  const [authPassword, setAuthPassword] = useState("");
  const [usedPasswordAuth, setUsedPasswordAuth] = useState(false);

  useEffect(() => {
    if (!isLogin) return;
    loadSavedCredentials().then((saved) => {
      if (!saved) return;
      setEmail(saved.email);
      setPassword(saved.password);
    });
  }, [isLogin]);

  async function finishAfterStayChoice() {
    await confirmStaySignedIn(staySignedIn);
    await markAppInstalled();
    if (usedPasswordAuth && saveCredentials && email && authPassword) {
      await saveCredentialsSecurely(email, authPassword);
    } else if (!saveCredentials) {
      await clearSavedCredentials();
    }
    setShowStayPrompt(false);
    router.replace("/projects");
  }

  async function onSubmit() {
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmail({ email, password });
        setAuthPassword(password);
        setUsedPasswordAuth(true);
      } else if (role === "founder") {
        await signUpWithEmail({
          role: "founder",
          founderName,
          startupName,
          email,
          password,
          termsAccepted,
        });
        setAuthPassword(password);
        setUsedPasswordAuth(true);
      } else {
        await signUpWithEmail({
          role: "investor",
          investorName,
          companyName,
          email,
          password,
          termsAccepted,
        });
        setAuthPassword(password);
        setUsedPasswordAuth(true);
      }
      setStaySignedIn(true);
      setSaveCredentials(true);
      setShowStayPrompt(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function onSocial(provider: "google" | "github") {
    setError("");
    setSocialLoading(provider);
    try {
      await signInWithOAuth(provider);
      setUsedPasswordAuth(false);
      setSaveCredentials(false);
      setStaySignedIn(true);
      setShowStayPrompt(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Social sign in failed.");
    } finally {
      setSocialLoading(null);
    }
  }

  const busy = loading || !!socialLoading;

  async function goHome() {
    await clearOnboardingDone();
    router.replace("/");
  }

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <StaySignedInModal
        visible={showStayPrompt}
        staySignedIn={staySignedIn}
        onToggleStay={() => setStaySignedIn((v) => !v)}
        saveCredentials={saveCredentials}
        onToggleSaveCredentials={() => setSaveCredentials((v) => !v)}
        showSaveCredentials={usedPasswordAuth}
        onContinue={finishAfterStayChoice}
      />
      <SafeAreaView style={styles.safe}>
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go to onboarding"
            hitSlop={12}
            onPress={goHome}
            style={({ pressed }) => [styles.homeBtn, pressed && styles.pressed]}
          >
            <HomeGlyph />
            <Text style={styles.homeLabel}>Home</Text>
          </Pressable>
        </View>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={[styles.scroll, styles.scrollCentered]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <BrandLockup centered />

            <View style={[styles.intro, styles.introCentered]}>
              <Text style={[styles.title, styles.titleCentered]}>
                {isLogin ? "Welcome back" : "Create account"}
              </Text>
              <Text style={[styles.subtitle, styles.subtitleCentered]}>
                {isLogin
                  ? "Sign in to continue building your founder journey."
                  : "Start turning ideas into investor-ready clarity."}
              </Text>
            </View>

            <View style={styles.form}>
              {!isLogin ? (
                <>
                  <Text style={styles.label}>Continue as</Text>
                  <RoleToggle value={role} onChange={setRole} variant="light" />

                  {role === "founder" ? (
                    <>
                      <LightField
                        label="Founder name"
                        value={founderName}
                        onChangeText={setFounderName}
                        placeholder="Your name"
                        autoCapitalize="words"
                      />
                      <LightField
                        label="Startup name"
                        value={startupName}
                        onChangeText={setStartupName}
                        placeholder="Acme AI"
                        autoCapitalize="words"
                      />
                    </>
                  ) : (
                    <>
                      <LightField
                        label="Investor name"
                        value={investorName}
                        onChangeText={setInvestorName}
                        placeholder="Your name"
                        autoCapitalize="words"
                      />
                      <LightField
                        label="Company name"
                        value={companyName}
                        onChangeText={setCompanyName}
                        placeholder="Firm or fund"
                        autoCapitalize="words"
                      />
                    </>
                  )}
                </>
              ) : null}

              <LightField
                label={isLogin ? "Email" : role === "investor" ? "Investor email id" : "Email id"}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <View>
                <LightField
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  secureTextEntry
                />
                {isLogin ? (
                  <Pressable
                    style={styles.forgotWrap}
                    onPress={() => setError("Password reset coming soon.")}
                  >
                    <Text style={styles.forgot}>Forgot password?</Text>
                  </Pressable>
                ) : null}
              </View>

              {!isLogin ? (
                <TermsCheckRow
                  checked={termsAccepted}
                  onToggle={() => setTermsAccepted((v) => !v)}
                  termsAgreement
                />
              ) : null}

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Pressable
                accessibilityRole="button"
                disabled={busy}
                onPress={onSubmit}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  pressed && styles.pressed,
                  busy && styles.disabled,
                ]}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryLabel}>{isLogin ? "Sign In" : "Create account"}</Text>
                )}
              </Pressable>
            </View>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialStack}>
              <Pressable
                accessibilityRole="button"
                disabled={busy}
                onPress={() => onSocial("google")}
                style={({ pressed }) => [
                  styles.socialBtn,
                  pressed && styles.pressed,
                  busy && styles.disabled,
                ]}
              >
                {socialLoading === "google" ? (
                  <ActivityIndicator color={ink} />
                ) : (
                  <>
                    <GoogleGlyph />
                    <Text style={styles.socialLabel}>Continue with Google</Text>
                  </>
                )}
              </Pressable>

              <Pressable
                accessibilityRole="button"
                disabled={busy}
                onPress={() => onSocial("github")}
                style={({ pressed }) => [
                  styles.socialBtn,
                  pressed && styles.pressed,
                  busy && styles.disabled,
                ]}
              >
                {socialLoading === "github" ? (
                  <ActivityIndicator color={ink} />
                ) : (
                  <>
                    <GitHubGlyph />
                    <Text style={styles.socialLabel}>Continue with GitHub</Text>
                  </>
                )}
              </Pressable>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerMuted}>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
              </Text>
              <Pressable onPress={() => router.push(isLogin ? "/signup" : "/login")}>
                <Text style={styles.footerLink}>{isLogin ? "Sign up" : "Sign in"}</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: canvas,
  },
  safe: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 4,
    alignItems: "flex-start",
  },
  homeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "#f3f4f6",
  },
  homeLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    color: ink,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 28,
  },
  scrollCentered: {
    paddingTop: 20,
    justifyContent: "flex-start",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 28,
  },
  logoRowCentered: {
    justifyContent: "center",
    marginBottom: 10,
  },
  wordmark: {
    fontFamily: fonts.sansBold,
    fontSize: 16,
    color: ink,
    letterSpacing: -0.3,
  },
  wordmarkAccent: {
    color: accent,
  },
  intro: {
    gap: 6,
    marginBottom: 22,
  },
  introCentered: {
    alignItems: "center",
    marginBottom: 18,
  },
  title: {
    fontFamily: fonts.sansBold,
    fontSize: 24,
    color: ink,
    letterSpacing: -0.4,
  },
  titleCentered: {
    textAlign: "center",
  },
  subtitle: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: muted,
    lineHeight: 19,
  },
  subtitleCentered: {
    textAlign: "center",
  },
  form: {
    gap: 14,
  },
  field: {
    gap: 6,
  },
  label: {
    fontFamily: fonts.sansSemi,
    fontSize: 13,
    color: ink,
  },
  input: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: ink,
    backgroundColor: canvas,
    borderWidth: 1,
    borderColor: line,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
    minHeight: 44,
  },
  forgotWrap: {
    alignSelf: "flex-end",
    marginTop: 8,
  },
  forgot: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: accent,
  },
  error: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: "#dc2626",
  },
  primaryBtn: {
    marginTop: 4,
    minHeight: 46,
    borderRadius: 10,
    backgroundColor: accent,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryLabel: {
    fontFamily: fonts.sansSemi,
    fontSize: 15,
    color: "#ffffff",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 22,
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: line,
  },
  dividerText: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: muted,
  },
  socialStack: {
    gap: 10,
  },
  socialBtn: {
    minHeight: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: line,
    backgroundColor: canvas,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 14,
  },
  socialLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    color: ink,
  },
  footer: {
    marginTop: spacing.xl,
    paddingTop: spacing.md,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
  },
  footerMuted: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: muted,
  },
  footerLink: {
    fontFamily: fonts.sansSemi,
    fontSize: 13,
    color: accent,
  },
  pressed: {
    opacity: 0.88,
  },
  disabled: {
    opacity: 0.55,
  },
});
