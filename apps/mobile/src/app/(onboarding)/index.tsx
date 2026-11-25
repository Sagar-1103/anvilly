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
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  Check,
  Terminal,
  Smartphone,
  Sparkles,
  ArrowRight,
  Download,
  Cpu,
  QrCode,
} from 'lucide-react-native';
import { useAuthStore } from '../../stores/auth-store';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SlideData {
  id: string;
  headline: string;
  subtitle: string;
  type: 'prompt' | 'sandbox' | 'preview';
}

const SLIDES: SlideData[] = [
  {
    id: '1',
    headline: 'Describe it.\nWatch it build.',
    subtitle:
      'Turn natural-language prompts into structured React and Expo applications in seconds.',
    type: 'prompt',
  },
  {
    id: '2',
    headline: 'Isolated sandboxes\nthat verify code.',
    subtitle:
      'Every project runs in a dedicated cloud container that installs packages and checks builds.',
    type: 'sandbox',
  },
  {
    id: '3',
    headline: 'Preview live and\nship builds.',
    subtitle:
      'Test natively with Expo Go tunnels or queue Android APK builds straight from your phone.',
    type: 'preview',
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const { completeOnboarding, isAuthenticated } = useAuthStore();

  const finishOnboarding = async () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    }
    await completeOnboarding();
    if (isAuthenticated) {
      router.replace('/(tabs)' as any);
    } else {
      router.replace('/(auth)/login' as any);
    }
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

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      {/* Top Navigation */}
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <View style={styles.logoFrame}>
            <Image
              source={require('../../../assets/images/anvilly-logo.png')}
              style={styles.logoImage}
            />
          </View>
          <Text style={styles.brandName}>anvilly</Text>
        </View>

        {!isLast ? (
          <Pressable
            onPress={finishOnboarding}
            hitSlop={12}
            style={({ pressed }) => [styles.skipPill, pressed && { opacity: 0.6 }]}
          >
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        ) : (
          <View style={{ width: 48 }} />
        )}
      </View>

      {/* Swipeable Slides */}
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
            <View style={styles.stageContainer}>
              {item.type === 'prompt' && <PromptStage />}
              {item.type === 'sandbox' && <SandboxStage />}
              {item.type === 'preview' && <PreviewStage />}
            </View>

            <View style={styles.copyContainer}>
              <Text style={styles.headline}>{item.headline}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>
          </View>
        )}
      />

      {/* Bottom Controls */}
      <View style={styles.bottomBar}>
        <View style={styles.dotsContainer}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        <Pressable
          onPress={handleNext}
          style={({ pressed }) => [
            styles.nextButton,
            pressed && styles.nextButtonPressed,
          ]}
        >
          <Text style={styles.nextButtonText}>
            {isLast ? 'Get started' : 'Continue'}
          </Text>
          <ArrowRight size={16} color="#FFFFFF" strokeWidth={2} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function PromptStage() {
  const files = [
    { path: 'app/_layout.tsx', tag: 'Router' },
    { path: 'app/(tabs)/index.tsx', tag: 'Screen' },
    { path: 'components/TrackerCard.tsx', tag: 'UI' },
  ];

  return (
    <View style={styles.stageSurface}>
      {/* Command Prompt Card */}
      <View style={styles.elevatedCard}>
        <View style={styles.cardTopRow}>
          <View style={styles.chipRow}>
            <Sparkles size={13} color="#09090B" strokeWidth={2} />
            <Text style={styles.chipText}>Prompt</Text>
          </View>
          <View style={styles.agentBadge}>
            <View style={styles.pulseDot} />
            <Text style={styles.agentBadgeText}>Generating</Text>
          </View>
        </View>
        <Text style={styles.promptBody}>
          “Build a minimal workout tracker with streak history and dark mode.”
        </Text>
      </View>

      {/* Generated Files Stack */}
      <View style={styles.fileStack}>
        {files.map((file) => (
          <View key={file.path} style={styles.fileItemCard}>
            <View style={styles.fileLeft}>
              <View style={styles.checkBadge}>
                <Check size={10} color="#FFFFFF" strokeWidth={3} />
              </View>
              <Text style={styles.fileName} numberOfLines={1}>
                {file.path}
              </Text>
            </View>
            <View style={styles.fileTag}>
              <Text style={styles.fileTagText}>{file.tag}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function SandboxStage() {
  const monoFont = Platform.OS === 'ios' ? 'Menlo' : 'monospace';
  return (
    <View style={styles.stageSurface}>
      <View style={styles.terminalWindow}>
        {/* Window Chrome */}
        <View style={styles.terminalHeader}>
          <View style={styles.windowDots}>
            <View style={[styles.winDot, { backgroundColor: '#3F3F46' }]} />
            <View style={[styles.winDot, { backgroundColor: '#3F3F46' }]} />
            <View style={[styles.winDot, { backgroundColor: '#3F3F46' }]} />
          </View>
          <View style={styles.vmPill}>
            <Cpu size={10} color="#A1A1AA" strokeWidth={2} />
            <Text style={[styles.vmText, { fontFamily: monoFont }]}>e2b-sandbox</Text>
          </View>
        </View>

        {/* Terminal Body */}
        <View style={styles.terminalBody}>
          <Text style={[styles.terminalLine, { fontFamily: monoFont }]}>
            <Text style={styles.promptSymbol}>$ </Text>
            npx expo install lucide-react-native
          </Text>
          <Text style={[styles.terminalMuted, { fontFamily: monoFont }]}>
            Installed 1 package in 1.4s
          </Text>

          <Text style={[styles.terminalLine, { fontFamily: monoFont, marginTop: 12 }]}>
            <Text style={styles.promptSymbol}>$ </Text>
            npx tsc --noEmit
          </Text>
          <View style={styles.terminalPassRow}>
            <View style={styles.passDot} />
            <Text style={[styles.terminalSuccess, { fontFamily: monoFont }]}>
              Passed with 0 errors
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function PreviewStage() {
  return (
    <View style={styles.stageSurface}>
      {/* Live Tunnel Card */}
      <View style={styles.elevatedCard}>
        <View style={styles.previewHeader}>
          <View style={styles.qrBox}>
            <QrCode size={22} color="#09090B" strokeWidth={1.75} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.previewTitle}>Expo Go Tunnel</Text>
            <Text style={styles.previewSub}>exp://anvilly-app.e2b.dev</Text>
          </View>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveBadgeText}>Live</Text>
          </View>
        </View>
      </View>

      {/* Overlapping Build Artifact Card */}
      <View style={[styles.elevatedCard, styles.buildArtifactCard]}>
        <View style={styles.previewHeader}>
          <View style={styles.apkIconBox}>
            <Smartphone size={18} color="#FFFFFF" strokeWidth={1.75} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.previewTitle}>Android APK · v1.0.0</Text>
            <Text style={styles.previewSub}>EAS Cloud Build finished</Text>
          </View>
          <View style={styles.downloadIconBtn}>
            <Download size={14} color="#09090B" strokeWidth={2} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoFrame: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: '#09090B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
  },
  brandName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    letterSpacing: -0.5,
  },
  skipPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  skipText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.light.textSecondary,
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
  },
  stageContainer: {
    marginBottom: Spacing.xl,
  },
  stageSurface: {
    backgroundColor: '#F4F4F5',
    borderWidth: 1,
    borderColor: '#E4E4E7',
    borderRadius: 24,
    padding: 16,
    minHeight: 268,
    justifyContent: 'center',
    gap: 10,
  },
  elevatedCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E4E7',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#09090B',
  },
  agentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F4F4F5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#09090B',
  },
  agentBadgeText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#52525B',
  },
  promptBody: {
    fontSize: 14,
    color: '#18181B',
    lineHeight: 20,
    fontWeight: '400',
  },
  fileStack: {
    gap: 7,
  },
  fileItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E4E7',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  fileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  checkBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#09090B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileName: {
    fontSize: 13,
    color: '#09090B',
    fontWeight: '500',
  },
  fileTag: {
    backgroundColor: '#F4F4F5',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  fileTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#71717A',
  },

  // Terminal Stage
  terminalWindow: {
    backgroundColor: '#09090B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#27272A',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 5,
  },
  terminalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#111114',
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
  },
  windowDots: {
    flexDirection: 'row',
    gap: 6,
  },
  winDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  vmPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#18181B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  vmText: {
    fontSize: 10,
    color: '#A1A1AA',
  },
  terminalBody: {
    padding: 16,
  },
  terminalLine: {
    fontSize: 12.5,
    color: '#FAFAFA',
    lineHeight: 19,
  },
  promptSymbol: {
    color: '#71717A',
  },
  terminalMuted: {
    fontSize: 11.5,
    color: '#71717A',
    marginTop: 3,
  },
  terminalPassRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 5,
  },
  passDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ADE80',
  },
  terminalSuccess: {
    fontSize: 12,
    color: '#4ADE80',
    fontWeight: '600',
  },

  // Preview Stage
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  qrBox: {
    width: 42,
    height: 42,
    borderRadius: 11,
    backgroundColor: '#F4F4F5',
    borderWidth: 1,
    borderColor: '#E4E4E7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  apkIconBox: {
    width: 42,
    height: 42,
    borderRadius: 11,
    backgroundColor: '#09090B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#09090B',
  },
  previewSub: {
    fontSize: 12,
    color: '#71717A',
    marginTop: 2,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 99,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  liveBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#16A34A',
  },
  buildArtifactCard: {
    marginTop: 2,
  },
  downloadIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F4F4F5',
    borderWidth: 1,
    borderColor: '#E4E4E7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Copy & Bottom Bar
  copyContainer: {
    paddingHorizontal: 4,
  },
  headline: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -1.1,
    lineHeight: 37,
    color: '#09090B',
    marginBottom: 10,
  },
  subtitle: {
    ...Typography.body,
    fontSize: 15,
    color: '#71717A',
    lineHeight: 22,
    maxWidth: 320,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 12 : 20,
    paddingTop: Spacing.md,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 22,
    backgroundColor: '#09090B',
  },
  dotInactive: {
    width: 6,
    backgroundColor: '#D4D4D8',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#09090B',
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: Radius.full,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 4,
  },
  nextButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  nextButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
