/**
 * RadioPlayer — Full-Screen Hero Player
 * ═══════════════════════════════════════════
 * The centerpiece of the Midnight Broadcast Booth.
 * Features:
 *   - Animated MP4 logo as the "studio monitor" centerpiece
 *   - Ambient orange glow radiating from the logo
 *   - Glass-panel track info card
 *   - Animated visualizer bars
 *   - Quick action buttons (Like, Request, Chat, Share)
 *   - Reanimated play/pause with spring feedback
 *
 * This replaces the old RadioPlayer.js + LiveReactions.js
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  StatusBar,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
  SlideInUp,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import TrackPlayer, { usePlaybackState, State } from 'react-native-track-player';
import { colors, typography, spacing, elevation } from '../theme/tokens';
import Glass from '../components/Glass';
import StudioLogo from '../components/StudioLogo';
import LiveBadge from '../components/LiveBadge';
import ListenerPill from '../components/ListenerPill';
import VisualizerBars from '../components/VisualizerBars';

// ── Quick action data ──────────────────────────────────────
const ACTIONS = [
  { icon: '♡', label: 'Like' },
  { icon: '🎵', label: 'Request' },
  { icon: '💬', label: 'Chat' },
  { icon: '📤', label: 'Share' },
];

// ── Play Button ────────────────────────────────────────────
const PlayButton = ({ isPlaying, onPress, size = 64 }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.9, { damping: 15 }, () => {
      scale.value = withSpring(1, { damping: 12 });
    });
    onPress?.();
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={handlePress}
        style={[styles.playButton, { width: size, height: size, borderRadius: size / 2 }]}
      >
        <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
      </Pressable>
    </Animated.View>
  );
};

// ── Control Button (prev/next) ─────────────────────────────
const ControlButton = ({ icon, onPress, size = 44 }) => (
  <Pressable
    onPress={onPress}
    style={[styles.controlButton, { width: size, height: size, borderRadius: size / 2 }]}
  >
    <Text style={styles.controlIcon}>{icon}</Text>
  </Pressable>
);

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

export default function RadioPlayer({ navigation, route }) {
  const { state: playbackState } = usePlaybackState();
  const isPlaying = playbackState === State.Playing;
  const isLive = route?.params?.isLive ?? true;

  const togglePlayback = useCallback(async () => {
    if (isPlaying) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  }, [isPlaying]);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bgDeep} />

      {/* Ambient studio glow — radiates from top center */}
      <View style={styles.ambientGlow} />
      <View style={styles.bottomFade} />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ─────────────────────────────────── */}
          <Animated.View entering={FadeIn.delay(100)} style={styles.header}>
            <Text style={styles.headerLabel}>Now Playing</Text>
            <View style={styles.headerBadges}>
              {isLive && <LiveBadge />}
              <ListenerPill count={1247} />
            </View>
          </Animated.View>

          {/* ── Studio Monitor (Logo) ──────────────────── */}
          <Animated.View entering={FadeIn.delay(200)} style={styles.logoSection}>
            <StudioLogo size={160} glow spinning={isPlaying} playing={isPlaying} />
          </Animated.View>

          {/* ── Track Info Glass Panel ──────────────────── */}
          <Animated.View entering={SlideInUp.delay(300).springify()}>
            <View style={styles.trackSection}>
              <Glass accent glow style={styles.trackCard}>
                <Text style={styles.trackTitle}>Midnight Frequencies</Text>
                <Text style={styles.djName}>DJ Shadow</Text>
                <Text style={styles.upNext}>
                  UP NEXT: Night Drive Mix • DJ Pulse • 11:00 PM
                </Text>
              </Glass>
            </View>
          </Animated.View>

          {/* ── Visualizer ─────────────────────────────── */}
          <Animated.View entering={FadeIn.delay(400)} style={styles.visualizerSection}>
            <VisualizerBars count={40} height={50} playing={isPlaying} />
          </Animated.View>

          {/* ── Controls ───────────────────────────────── */}
          <Animated.View entering={FadeIn.delay(500)} style={styles.controls}>
            <ControlButton icon="⏮" />
            <PlayButton isPlaying={isPlaying} onPress={togglePlayback} />
            <ControlButton icon="⏭" />
          </Animated.View>

          {/* ── Quick Actions ──────────────────────────── */}
          <Animated.View entering={FadeIn.delay(600)} style={styles.actions}>
            {ACTIONS.map((action) => (
              <Glass
                key={action.label}
                onPress={() => {
                  if (action.label === 'Chat') {
                    navigation.navigate('ChatRoom');
                  }
                  if (action.label === 'Request') {
                    navigation.navigate('SongRequests');
                  }
                }}
                style={styles.actionButton}
              >
                <Text style={styles.actionLabel}>
                  {action.icon} {action.label}
                </Text>
              </Glass>
            ))}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgDeep,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },

  // Ambient effects
  ambientGlow: {
    position: 'absolute',
    top: -100,
    left: '50%',
    marginLeft: -250,
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: colors.primaryGlow,
    opacity: 0.12,
  },
  bottomFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: colors.bgDeep,
    opacity: 0.8,
    zIndex: 2,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screen,
    paddingVertical: spacing.lg,
    zIndex: 3,
  },
  headerLabel: {
    fontFamily: 'Oswald-Medium',
    fontWeight: '500',
    fontSize: typography.size.sm,
    color: colors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  headerBadges: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  // Logo section
  logoSection: {
    alignItems: 'center',
    paddingTop: spacing.section,
    paddingBottom: spacing.xl,
    zIndex: 3,
  },

  // Track info
  trackSection: {
    paddingHorizontal: spacing.screen,
    zIndex: 3,
    marginTop: spacing.xxl,
  },
  trackCard: {
    padding: spacing.xl,
  },
  trackTitle: {
    fontFamily: 'Oswald-Bold',
    fontWeight: '700',
    fontSize: typography.size.xxl,
    color: colors.textPrimary,
    letterSpacing: 0.5,
    lineHeight: typography.size.xxl * typography.lineHeight.tight,
  },
  djName: {
    fontFamily: 'DMSans-Medium',
    fontWeight: '500',
    fontSize: typography.size.lg,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  upNext: {
    fontFamily: 'JetBrainsMono-Regular',
    fontWeight: '400',
    fontSize: typography.size.xs,
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginTop: spacing.sm,
  },

  // Visualizer
  visualizerSection: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.xl,
    zIndex: 3,
  },

  // Controls
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    paddingVertical: spacing.xxl,
    zIndex: 3,
  },
  playButton: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...elevation.glow(colors.primaryGlow),
  },
  playIcon: {
    fontSize: 22,
    color: colors.white,
  },
  controlButton: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlIcon: {
    fontSize: 16,
    color: colors.textSecondary,
  },

  // Quick actions
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.screen,
    zIndex: 3,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
  },
  actionLabel: {
    fontFamily: 'DMSans-Medium',
    fontWeight: '500',
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
});
