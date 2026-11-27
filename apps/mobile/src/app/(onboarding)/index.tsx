import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Pressable,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import { ArrowRight, Check, Cpu } from 'lucide-react-native';
import { useAuthStore } from '../../stores/auth-store';
import {
  Colors,
  HeaderHorizonGradient,
  HeaderHorizonLocations,
  Spacing,
  Radius,
} from '../../constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SlideData {
  id: string;
  type: 'welcome' | 'editor' | 'sandbox';
}

const SLIDES: SlideData[] = [
  { id: '1', type: 'welcome' },
  { id: '2', type: 'editor' },
  { id: '3', type: 'sandbox' },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const { completeOnboarding } = useAuthStore();

  const finishOnboarding = async () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    }
    await completeOnboarding();
  };

  const handleNext = async () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    }

    if (currentIndex < SLIDES.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    } else {
      await finishOnboarding();
    }
  };

  const isLast = currentIndex === SLIDES.length - 1;
  const ctaLabel =
    currentIndex === 0 ? 'Explore' : isLast ? 'Get Started' : 'Continue';

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Smooth Horizon Gradient Backdrop */}
      <LinearGradient
        colors={HeaderHorizonGradient}
        locations={HeaderHorizonLocations}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Fixed Top Bar */}
        <View style={styles.topSkipRow}>
          {!isLast ? (
            <Pressable
              onPress={finishOnboarding}
              hitSlop={12}
              style={({ pressed }) => [
                styles.skipPill,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={styles.skipLight}>Skip</Text>
            </Pressable>
          ) : (
            <View style={{ height: 30 }} />
          )}
        </View>

        {/* Carousel Slide Content */}
        <FlatList
          ref={flatListRef}
          data={SLIDES}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const newIndex = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
            setCurrentIndex(newIndex);
          }}
          renderItem={({ item }) => (
            <View style={styles.slide}>
              {item.type === 'welcome' && <WelcomeContent />}
              {item.type === 'editor' && <EditorContent />}
              {item.type === 'sandbox' && <SandboxContent />}
            </View>
          )}
        />

        {/* Fixed Bottom Carousel Controls */}
        <View style={styles.bottomActionWrap}>
          <View style={styles.dotsRow}>
            {SLIDES.map((_, i) => (
              <View
                key={i}
                style={i === currentIndex ? styles.dotActive : styles.dotInactive}
              />
            ))}
          </View>

          <Pressable
            onPress={handleNext}
            style={({ pressed }) => [
              isLast ? styles.primaryActionButton : styles.darkActionButton,
              pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] },
            ]}
          >
            <Text style={isLast ? styles.primaryActionText : styles.darkActionText}>
              {ctaLabel}
            </Text>
            <ArrowRight
              size={16}
              color={isLast ? '#111114' : '#F4F4F5'}
              strokeWidth={2.2}
            />
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

function WelcomeContent() {
  return (
    <View style={styles.welcomeBody}>
      <View style={styles.emblemStage}>
        <View style={styles.outerRing}>
          <View style={styles.innerRing}>
            <View style={styles.appIconShadow}>
              <View style={styles.logoCircle}>
                <Image
                  source={require('../../../assets/images/anvilly-logo.png')}
                  style={styles.appIconImage}
                />
              </View>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.welcomeCopy}>
        <Text style={styles.welcomeTitle}>Forge software{'\n'}from pure thought.</Text>
        <Text style={styles.welcomeSubtitle}>
          Turn prompts into live web and mobile apps inside isolated cloud sandboxes.
        </Text>
      </View>
    </View>
  );
}

function EditorContent() {
  const monoFont = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

  return (
    <View style={styles.featureBody}>
      <View style={styles.featureHeader}>
        <Text style={styles.featureTitle}>Build faster.{'\n'}Ship smarter.</Text>
        <Text style={styles.featureSubtitle}>
          Create ready-to-use web and Expo apps right from your phone.
        </Text>
      </View>

      <View style={styles.codePhoneFrame}>
        <View style={styles.codePhoneInner}>
          <View style={styles.miniStatusRow}>
            <Text style={styles.miniTime}>9:41</Text>
            <View style={styles.miniIsland} />
            <View style={styles.miniDots}>
              <View style={styles.miniSignal} />
            </View>
          </View>

          <View style={styles.miniAppHeader}>
            <Image
              source={require('../../../assets/images/anvilly-logo.png')}
              style={styles.miniAppLogo}
            />
            <Text style={styles.miniAppTitle}>anvilly</Text>
          </View>

          <View style={styles.codeBlock}>
            <Text style={[styles.codeFileTab, { fontFamily: monoFont }]}>
              src/App.tsx
            </Text>
            <Text style={[styles.codeLine, { fontFamily: monoFont }]}>
              <Text style={{ color: '#C084FC' }}>export function </Text>
              <Text style={{ color: '#60A5FA' }}>App</Text>
              <Text style={{ color: '#A1A1AA' }}>() {'{'}</Text>
            </Text>
            <Text style={[styles.codeLine, { fontFamily: monoFont }]}>
              <Text style={{ color: '#71717A' }}>  // Generated by Anvilly</Text>
            </Text>
            <Text style={[styles.codeLine, { fontFamily: monoFont }]}>
              <Text style={{ color: '#C084FC' }}>  return </Text>
              <Text style={{ color: '#F4F4F5' }}>&lt;Dashboard /&gt;;</Text>
            </Text>
            <Text style={[styles.codeLine, { fontFamily: monoFont }]}>
              <Text style={{ color: '#A1A1AA' }}>{'}'}</Text>
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function SandboxContent() {
  const monoFont = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

  return (
    <View style={styles.featureBody}>
      <View style={styles.featureHeader}>
        <Text style={styles.featureTitle}>Isolated sandboxes.{'\n'}Instant previews.</Text>
        <Text style={styles.featureSubtitle}>
          Verify TypeScript builds, launch Expo Go tunnels, and ship APKs.
        </Text>
      </View>

      <View style={styles.codePhoneFrame}>
        <View style={styles.codePhoneInner}>
          <View style={styles.sandboxBadgeRow}>
            <Cpu size={13} color="#A1A1AA" />
            <Text style={[styles.sandboxTitle, { fontFamily: monoFont }]}>
              e2b-sandbox · /home/user/app
            </Text>
          </View>

          <View style={styles.sandboxSteps}>
            <View style={styles.sandboxStep}>
              <View style={styles.stepCheck}>
                <Check size={11} color="#111114" strokeWidth={2.5} />
              </View>
              <Text style={[styles.stepText, { fontFamily: monoFont }]}>
                bun install · 0 warnings
              </Text>
            </View>

            <View style={styles.sandboxStep}>
              <View style={styles.stepCheck}>
                <Check size={11} color="#111114" strokeWidth={2.5} />
              </View>
              <Text style={[styles.stepText, { fontFamily: monoFont }]}>
                tsc --noEmit · 0 errors
              </Text>
            </View>

            <View style={styles.sandboxStep}>
              <View style={[styles.stepCheck, { backgroundColor: '#4ADE80' }]}>
                <Check size={11} color="#111114" strokeWidth={2.5} />
              </View>
              <Text style={[styles.stepText, { fontFamily: monoFont, color: '#4ADE80' }]}>
                Expo Go Tunnel · Live
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: Spacing.lg,
  },
  topSkipRow: {
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  skipPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  skipLight: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  welcomeBody: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: Spacing.xl,
  },
  emblemStage: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl + 8,
  },
  outerRing: {
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerRing: {
    width: 152,
    height: 152,
    borderRadius: 76,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.11)',
    backgroundColor: 'rgba(17, 17, 20, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appIconShadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 10,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appIconImage: {
    width: 92,
    height: 92,
    resizeMode: 'contain',
  },
  welcomeCopy: {
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 35,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -1.1,
    lineHeight: 40,
    marginBottom: Spacing.sm + 2,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.72)',
    textAlign: 'center',
    maxWidth: 290,
    lineHeight: 22,
  },
  featureBody: {
    flex: 1,
    justifyContent: 'center',
  },
  featureHeader: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  featureTitle: {
    fontSize: 31,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.9,
    lineHeight: 36,
    marginBottom: Spacing.sm,
  },
  featureSubtitle: {
    fontSize: 14.5,
    color: 'rgba(255, 255, 255, 0.76)',
    textAlign: 'center',
    maxWidth: 270,
    lineHeight: 20,
  },
  codePhoneFrame: {
    height: 270,
    borderRadius: 28,
    padding: 6,
    backgroundColor: '#1E1E24',
    borderWidth: 1,
    borderColor: '#32323A',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 10,
  },
  codePhoneInner: {
    flex: 1,
    backgroundColor: '#111114',
    borderRadius: 22,
    padding: Spacing.md,
  },
  miniStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  miniTime: {
    fontSize: 10,
    fontWeight: '600',
    color: '#F4F4F5',
  },
  miniIsland: {
    width: 48,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#000000',
  },
  miniDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniSignal: {
    width: 14,
    height: 7,
    borderRadius: 2,
    backgroundColor: '#F4F4F5',
    opacity: 0.85,
  },
  miniAppHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: Spacing.md,
  },
  miniAppLogo: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
  },
  miniAppTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F4F4F5',
  },
  codeBlock: {
    flex: 1,
    backgroundColor: '#18181D',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#27272F',
    padding: 12,
    gap: 6,
  },
  codeFileTab: {
    fontSize: 10.5,
    color: '#71717A',
    marginBottom: 4,
  },
  codeLine: {
    fontSize: 11.5,
    lineHeight: 17,
  },
  sandboxBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#24242A',
    marginBottom: 16,
  },
  sandboxTitle: {
    fontSize: 11.5,
    color: '#A1A1AA',
  },
  sandboxSteps: {
    gap: 14,
  },
  sandboxStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#F4F4F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    fontSize: 12,
    color: '#E4E4E7',
  },
  bottomActionWrap: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  dotActive: {
    width: 20,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#F4F4F5',
  },
  dotInactive: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#3F3F46',
  },
  darkActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#242429',
    borderWidth: 1,
    borderColor: '#32323A',
    borderRadius: Radius.md,
    paddingVertical: 15,
  },
  darkActionText: {
    fontSize: 15.5,
    fontWeight: '600',
    color: '#F4F4F5',
  },
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F4F4F5',
    borderRadius: Radius.md,
    paddingVertical: 15,
  },
  primaryActionText: {
    fontSize: 15.5,
    fontWeight: '600',
    color: '#111114',
  },
});
