import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Path, Polyline } from "react-native-svg";
import { FounderVoiceMark } from "@/components/brand/FounderVoiceMark";
import { getPostOnboardingAuthRoute, markOnboardingDone } from "@/lib/device";
import { fonts, spacing } from "@/theme/tokens";

const accent = "#7c6cff";
const accentSoft = "#9b8cff";
const ink = "#ffffff";
const muted = "#b4b4bc";
const canvas = "#0a0a0c";
const { width: SCREEN_W } = Dimensions.get("window");

type FeatureIconKind = "upload" | "branch" | "check" | "doc" | "spark";

type Slide =
  | {
      key: string;
      kind: "feature";
      title: string;
      body: string;
      icon: FeatureIconKind;
    }
  | { key: string; kind: "cta" };

const SLIDES: Slide[] = [
  {
    key: "capture",
    kind: "feature",
    icon: "upload",
    title: "Capture your ideas",
    body: "Speak freely. FounderVoice turns voice memos, chats, and docs into structured startup truth.",
  },
  {
    key: "structure",
    kind: "feature",
    icon: "branch",
    title: "Structure with AI",
    body: "We extract a Claim Graph — problem, market, traction, team, and ask — without inventing metrics.",
  },
  {
    key: "verify",
    kind: "feature",
    icon: "check",
    title: "Verify your claims",
    body: "Stress-test every statement. Confirm what is real before it reaches an investor inbox.",
  },
  {
    key: "generate",
    kind: "feature",
    icon: "doc",
    title: "Investor-ready outputs",
    body: "Generate decks, models, and FAQs that stay consistent with your verified claims.",
  },
  {
    key: "rehearse",
    kind: "feature",
    icon: "spark",
    title: "Rehearse diligence",
    body: "Practice hard investor questions so you walk into the room prepared — not improvising.",
  },
  { key: "start", kind: "cta" },
];

function FeatureIcon({ kind, size = 36 }: { kind: FeatureIconKind; size?: number }) {
  return (
    <View style={[styles.iconBox, { width: size + 28, height: size + 28, borderRadius: 18 }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {kind === "upload" ? (
          <>
            <Path d="M12 3v12" stroke={accent} strokeWidth={1.8} strokeLinecap="round" />
            <Polyline
              points="7,8 12,3 17,8"
              stroke={accent}
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3"
              stroke={accent}
              strokeWidth={1.8}
              strokeLinecap="round"
            />
          </>
        ) : null}
        {kind === "branch" ? (
          <>
            <Circle cx={12} cy={5} r={2.2} stroke={accent} strokeWidth={1.8} />
            <Circle cx={6} cy={19} r={2.2} stroke={accent} strokeWidth={1.8} />
            <Circle cx={18} cy={19} r={2.2} stroke={accent} strokeWidth={1.8} />
            <Path
              d="M12 7.2v4.3M12 11.5 6.8 16.8M12 11.5l5.2 5.3"
              stroke={accent}
              strokeWidth={1.8}
              strokeLinecap="round"
            />
          </>
        ) : null}
        {kind === "check" ? (
          <>
            <Circle cx={12} cy={12} r={9} stroke={accent} strokeWidth={1.8} />
            <Path
              d="M8 12.5l2.5 2.5L16 9.5"
              stroke={accent}
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        ) : null}
        {kind === "doc" ? (
          <>
            <Path
              d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"
              stroke={accent}
              strokeWidth={1.8}
              strokeLinejoin="round"
            />
            <Path d="M14 3v5h5" stroke={accent} strokeWidth={1.8} strokeLinejoin="round" />
            <Path d="M9 13h6M9 17h4" stroke={accent} strokeWidth={1.8} strokeLinecap="round" />
          </>
        ) : null}
        {kind === "spark" ? (
          <Path
            d="M12 2l1.4 6.2L20 10l-6.6 1.8L12 18l-1.4-6.2L4 10l6.6-1.8L12 2z"
            stroke={accent}
            strokeWidth={1.6}
            strokeLinejoin="round"
          />
        ) : null}
      </Svg>
    </View>
  );
}

type Phase = "onboarding" | "permissions";

function AnimatedSlideBody({
  active,
  children,
}: {
  active: boolean;
  children: ReactNode;
}) {
  const opacity = useRef(new Animated.Value(active ? 1 : 0.35)).current;
  const translateY = useRef(new Animated.Value(active ? 0 : 18)).current;
  const scale = useRef(new Animated.Value(active ? 1 : 0.96)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: active ? 1 : 0.35,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: active ? 0 : 18,
        friction: 8,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: active ? 1 : 0.96,
        friction: 7,
        tension: 70,
        useNativeDriver: true,
      }),
    ]).start();
  }, [active, opacity, scale, translateY]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }, { scale }], alignItems: "center", gap: 16 }}>
      {children}
    </Animated.View>
  );
}

function NextButton({ onPress }: { onPress: () => void }) {
  const shimmer = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.025,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    pulseLoop.start();
    return () => {
      loop.stop();
      pulseLoop.stop();
    };
  }, [pulse, shimmer]);

  const shineX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-80, 280],
  });

  return (
    <Animated.View style={{ flex: 1, transform: [{ scale: pulse }] }}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.nextPress, pressed && styles.pressed]}
      >
        <LinearGradient
          colors={["#c4b5fd", "#8b5cf6", "#6366f1", "#3b82f6"]}
          locations={[0, 0.35, 0.7, 1]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.nextGradient}
        >
          <Animated.View
            pointerEvents="none"
            style={[
              styles.nextShine,
              {
                transform: [{ translateX: shineX }, { rotate: "18deg" }],
              },
            ]}
          />
          <Text style={styles.nextLabel}>Next</Text>
          <View style={styles.nextChevron}>
            <Text style={styles.nextChevronText}>→</Text>
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

function Dot({ active }: { active: boolean }) {
  const width = useRef(new Animated.Value(active ? 22 : 7)).current;
  const opacity = useRef(new Animated.Value(active ? 1 : 0.35)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(width, {
        toValue: active ? 22 : 7,
        friction: 8,
        tension: 80,
        useNativeDriver: false,
      }),
      Animated.timing(opacity, {
        toValue: active ? 1 : 0.35,
        duration: 240,
        useNativeDriver: false,
      }),
    ]).start();
  }, [active, opacity, width]);

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          width,
          opacity,
          backgroundColor: active ? accent : "#2a2a35",
        },
      ]}
    />
  );
}

export function WelcomeScreen() {
  const router = useRouter();
  const listRef = useRef<FlatList<Slide>>(null);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("onboarding");
  const [permLoading, setPermLoading] = useState(false);
  const fade = useRef(new Animated.Value(1)).current;
  const brandEntrance = useRef(new Animated.Value(0)).current;

  const isLast = index === SLIDES.length - 1;

  useEffect(() => {
    Animated.timing(brandEntrance, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [brandEntrance]);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const i = viewableItems[0]?.index;
    if (typeof i === "number") setIndex(i);
  }).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 60 }).current;

  function goTo(next: number) {
    const clamped = Math.max(0, Math.min(SLIDES.length - 1, next));
    listRef.current?.scrollToIndex({ index: clamped, animated: true });
    setIndex(clamped);
  }

  function onMomentumEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const i = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    setIndex(i);
  }

  const startPermissions = useCallback(() => {
    Animated.timing(fade, { toValue: 0, duration: 280, easing: Easing.out(Easing.quad), useNativeDriver: true }).start(
      () => {
        setPhase("permissions");
        fade.setValue(0);
        Animated.timing(fade, {
          toValue: 1,
          duration: 360,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      },
    );
  }, [fade]);

  async function finishPermissions() {
    setPermLoading(true);
    try {
      const { requestAppPermissions } = await import("@/lib/permissions");
      await requestAppPermissions();
      await markOnboardingDone();
      const route = await getPostOnboardingAuthRoute();
      router.replace(route);
    } catch {
      try {
        await markOnboardingDone();
        const route = await getPostOnboardingAuthRoute();
        router.replace(route);
      } catch {
        router.replace("/signup");
      }
    } finally {
      setPermLoading(false);
    }
  }

  function renderSlide({ item, index: slideIndex }: { item: Slide; index: number }) {
    const active = slideIndex === index;

    if (item.kind === "cta") {
      return (
        <View style={[styles.slide, { width: SCREEN_W }]}>
          <AnimatedSlideBody active={active}>
            <Text style={styles.ctaEyebrow}>Ready when you are</Text>
            <Text style={styles.ctaTitle}>Turn founder thinking into investor-ready truth.</Text>
            <Text style={styles.ctaBody}>
              One more step — allow a couple of device permissions so voice capture and alerts work
              smoothly.
            </Text>
          </AnimatedSlideBody>
        </View>
      );
    }

    return (
      <View style={[styles.slide, { width: SCREEN_W }]}>
        <AnimatedSlideBody active={active}>
          <FeatureIcon kind={item.icon} size={40} />
          <Text style={styles.featureTitle}>{item.title}</Text>
          <Text style={styles.featureBody}>{item.body}</Text>
        </AnimatedSlideBody>
      </View>
    );
  }

  const brandStyle = {
    opacity: brandEntrance,
    transform: [
      {
        translateY: brandEntrance.interpolate({
          inputRange: [0, 1],
          outputRange: [-16, 0],
        }),
      },
    ],
  };

  if (phase === "permissions") {
    return (
      <View style={styles.root}>
        <LinearGradient
          colors={["#12121a", canvas, "#07070a"]}
          locations={[0, 0.55, 1]}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView style={styles.safe}>
          <Animated.View style={[styles.permWrap, { opacity: fade }]}>
            <View style={styles.brandBlockCompact}>
              <FounderVoiceMark size={44} />
              <Text style={styles.wordmark}>
                Founder<Text style={styles.wordmarkAccent}>Voice</Text>
              </Text>
            </View>
            <Text style={styles.permTitle}>Enable a few permissions</Text>
            <Text style={styles.permBody}>
              FounderVoice needs microphone access to capture pitch voice notes, and notifications
              so you never miss diligence follow-ups.
            </Text>

            <View style={styles.permList}>
              <View style={styles.permItem}>
                <Text style={styles.permItemTitle}>Microphone</Text>
                <Text style={styles.permItemBody}>Record founder voice memos securely on device.</Text>
              </View>
              <View style={styles.permItem}>
                <Text style={styles.permItemTitle}>Notifications</Text>
                <Text style={styles.permItemBody}>Reminders when claims need review or confirmation.</Text>
              </View>
            </View>

            <Pressable
              disabled={permLoading}
              onPress={finishPermissions}
              style={({ pressed }) => [styles.ctaPress, pressed && styles.pressed, permLoading && styles.disabled]}
            >
              <LinearGradient
                colors={["#a78bfa", "#6366f1", "#2563eb"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.ctaGradient}
              >
                {permLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.ctaLabel}>Allow & continue</Text>
                )}
              </LinearGradient>
            </Pressable>

            <Pressable disabled={permLoading} onPress={finishPermissions} style={styles.skipPerm}>
              <Text style={styles.skipPermText}>Skip for now</Text>
            </Pressable>
          </Animated.View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#12121a", canvas, "#07070a"]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.glowTop} />
      <SafeAreaView style={styles.safe}>
        <Animated.View style={{ flex: 1, opacity: fade }}>
          <Animated.View style={[styles.brandBlock, brandStyle]}>
            <FounderVoiceMark size={48} />
            <Text style={styles.wordmark}>
              Founder<Text style={styles.wordmarkAccent}>Voice</Text>
            </Text>
            <Text style={styles.tagline}>From your ideas to investor-ready impact.</Text>
          </Animated.View>

          <FlatList
            ref={listRef}
            data={SLIDES}
            keyExtractor={(s) => s.key}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onMomentumEnd}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            renderItem={renderSlide}
            extraData={index}
            style={styles.pager}
          />

          <View style={styles.footer}>
            <View style={styles.dots}>
              {SLIDES.map((s, i) => (
                <Dot key={s.key} active={i === index} />
              ))}
            </View>

            {isLast ? (
              <Pressable
                onPress={startPermissions}
                style={({ pressed }) => [styles.ctaPress, pressed && styles.pressed]}
              >
                <LinearGradient
                  colors={["#c4b5fd", "#8b5cf6", "#4f46e5", "#2563eb"]}
                  locations={[0, 0.35, 0.7, 1]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.ctaGradient}
                >
                  <Text style={styles.ctaLabel}>Get Started</Text>
                  <View style={styles.nextChevron}>
                    <Text style={styles.nextChevronText}>→</Text>
                  </View>
                </LinearGradient>
              </Pressable>
            ) : (
              <View style={styles.navRow}>
                <Pressable
                  onPress={() => goTo(index - 1)}
                  disabled={index === 0}
                  style={({ pressed }) => [
                    styles.navBtn,
                    index === 0 && styles.navBtnDisabled,
                    pressed && index > 0 && styles.pressed,
                  ]}
                >
                  <LinearGradient
                    colors={
                      index === 0
                        ? ["#1a1a22", "#15151c"]
                        : ["#2a2a38", "#1c1c28"]
                    }
                    style={styles.navBtnInner}
                  >
                    <Text style={styles.navBtnText}>←</Text>
                  </LinearGradient>
                </Pressable>
                <NextButton onPress={() => goTo(index + 1)} />
              </View>
            )}
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: canvas,
  },
  glowTop: {
    position: "absolute",
    top: -40,
    alignSelf: "center",
    width: 280,
    height: 180,
    borderRadius: 140,
    backgroundColor: "rgba(124, 108, 255, 0.12)",
  },
  safe: {
    flex: 1,
  },
  brandBlock: {
    alignItems: "center",
    gap: 10,
    paddingTop: 56,
    paddingHorizontal: spacing.lg,
  },
  brandBlockCompact: {
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  wordmark: {
    fontFamily: fonts.sansBold,
    fontSize: 28,
    color: ink,
    letterSpacing: -0.6,
    textAlign: "center",
  },
  wordmarkAccent: {
    color: accent,
  },
  tagline: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: muted,
    textAlign: "center",
    marginTop: 2,
  },
  pager: {
    flex: 1,
  },
  slide: {
    flex: 1,
    paddingHorizontal: 36,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  iconBox: {
    borderWidth: 1.5,
    borderColor: accent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    backgroundColor: "rgba(124, 108, 255, 0.08)",
  },
  featureTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 24,
    color: ink,
    textAlign: "center",
    letterSpacing: -0.4,
  },
  featureBody: {
    fontFamily: fonts.sans,
    fontSize: 15,
    color: muted,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 320,
  },
  ctaEyebrow: {
    fontFamily: fonts.sansSemi,
    fontSize: 12,
    color: accentSoft,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  ctaTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 26,
    color: ink,
    textAlign: "center",
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  ctaBody: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: muted,
    textAlign: "center",
    lineHeight: 21,
    maxWidth: 300,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: 18,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 7,
    minHeight: 12,
  },
  dot: {
    height: 7,
    borderRadius: 4,
  },
  navRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  navBtn: {
    width: 52,
    minHeight: 56,
    borderRadius: 16,
    overflow: "hidden",
  },
  navBtnInner: {
    flex: 1,
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2f2f3d",
  },
  navBtnDisabled: {
    opacity: 0.4,
  },
  navBtnText: {
    fontFamily: fonts.sansSemi,
    fontSize: 18,
    color: ink,
  },
  nextPress: {
    borderRadius: 16,
    overflow: "hidden",
  },
  nextGradient: {
    minHeight: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 18,
    overflow: "hidden",
  },
  nextShine: {
    position: "absolute",
    top: -20,
    bottom: -20,
    width: 40,
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  nextLabel: {
    fontFamily: fonts.sansBold,
    fontSize: 16,
    color: ink,
    letterSpacing: 0.3,
  },
  nextChevron: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  nextChevronText: {
    fontFamily: fonts.sansBold,
    fontSize: 15,
    color: ink,
  },
  ctaPress: {
    borderRadius: 16,
    overflow: "hidden",
  },
  ctaGradient: {
    minHeight: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  ctaLabel: {
    fontFamily: fonts.sansBold,
    fontSize: 17,
    color: ink,
    letterSpacing: 0.2,
  },
  pressed: {
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.6,
  },
  permWrap: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    justifyContent: "center",
    gap: 14,
  },
  permTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 24,
    color: ink,
    marginTop: spacing.lg,
  },
  permBody: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: muted,
    lineHeight: 21,
  },
  permList: {
    gap: 10,
    marginVertical: spacing.md,
  },
  permItem: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2a2a35",
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: 14,
    gap: 4,
  },
  permItemTitle: {
    fontFamily: fonts.sansSemi,
    fontSize: 14,
    color: ink,
  },
  permItemBody: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: muted,
    lineHeight: 17,
  },
  skipPerm: {
    alignItems: "center",
    paddingVertical: 8,
  },
  skipPermText: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: muted,
  },
});
