/**
 * HubScreen — Central Navigation Hub
 * ═══════════════════════════════════════
 * Replaces the old flat card grid with:
 *   - Live Now hero card (tappable → player)
 *   - Quick access 2x2 grid (glass panels)
 *   - Upcoming shows list
 *   - Station branding header with mini logo
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radius, presets } from '../theme/tokens';
import Glass from '../components/Glass';
import StudioLogo from '../components/StudioLogo';
import LiveBadge from '../components/LiveBadge';
import VisualizerBars from '../components/VisualizerBars';
import { useStream } from '../StreamContext';

// Quick-access tiles. Subtitles are intentionally action-descriptive
// rather than count-based — we don't have real-time queue / active
// listener counts plumbed through yet, so honesty beats a fake "48 active".
const QUICK_ITEMS = [
  { icon: '💬', label: 'Live Chat', sub: 'Talk back', route: 'ChatRoom', hot: true },
  { icon: '🎵', label: 'Requests', sub: 'Tell the DJ', route: 'SongRequests' },
  { icon: '📅', label: 'Schedule', sub: "This week's lineup", route: 'DJSchedule' },
  { icon: '👤', label: 'My Profile', sub: 'Stats & badges', route: 'ListenerProfile' },
];

export default function HubScreen({ navigation }) {
  const { isPlaying, isLive, trackTitle, artistName } = useStream();

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bgDeep} />

      {/* Ambient glow */}
      <View style={styles.ambientGlow} />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Station Header ─────────────────────────── */}
          <Animated.View entering={FadeIn.delay(100)} style={styles.stationHeader}>
            <StudioLogo size={40} glow={false} mini />
            <View>
              <Text style={styles.stationName}>REEBOOT RADIO</Text>
              <Text style={[styles.stationStatus, !isLive && styles.stationStatusOff]}>
                {isLive ? '● ON AIR' : '○ OFF AIR'}
              </Text>
            </View>
          </Animated.View>

          {/* ── Live Now Hero Card ──────────────────────── */}
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <View style={styles.heroSection}>
              <Glass
                accent
                glow
                onPress={() => navigation.navigate('RadioPlayer')}
                style={styles.heroCard}
              >
                <View style={styles.heroInner}>
                  <View style={styles.heroRow}>
                    <StudioLogo size={72} glow spinning={isPlaying} playing={isPlaying} />
                    <View style={styles.heroInfo}>
                      <View style={styles.heroBadges}>
                        {isLive && <LiveBadge size="sm" />}
                      </View>
                      <Text style={styles.heroTitle}>{trackTitle}</Text>
                      <Text style={styles.heroDJ}>{artistName}</Text>
                    </View>
                  </View>
                  <View style={styles.heroVisualizer}>
                    <VisualizerBars count={48} height={28} playing={isPlaying} />
                  </View>
                </View>
              </Glass>
            </View>
          </Animated.View>

          {/* ── Quick Access Grid ──────────────────────── */}
          <View style={styles.section}>
            <Text style={presets.sectionLabel}>Station</Text>
            <View style={styles.quickGrid}>
              {QUICK_ITEMS.map((item, i) => (
                <Animated.View
                  key={item.label}
                  entering={FadeInDown.delay(300 + i * 80).springify()}
                  style={styles.quickCell}
                >
                  <Glass
                    onPress={() => navigation.navigate(item.route)}
                    style={styles.quickCard}
                  >
                    <View style={styles.quickHeader}>
                      <Text style={styles.quickIcon}>{item.icon}</Text>
                      {item.hot && <View style={styles.hotDot} />}
                    </View>
                    <Text style={styles.quickLabel}>{item.label}</Text>
                    <Text style={styles.quickSub}>{item.sub}</Text>
                  </Glass>
                </Animated.View>
              ))}
            </View>
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgDeep,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 140,
  },
  ambientGlow: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: colors.primarySubtle,
    opacity: 0.8,
  },

  // Station header
  stationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xs,
  },
  stationName: {
    fontFamily: 'Oswald-Bold',
    fontWeight: '700',
    fontSize: typography.size.xl,
    color: colors.textPrimary,
    letterSpacing: 1,
  },
  stationStatus: {
    fontFamily: 'JetBrainsMono-Regular',
    fontWeight: '400',
    fontSize: typography.size.xs,
    color: colors.online,
    letterSpacing: 0.5,
  },
  stationStatusOff: {
    color: colors.textMuted,
  },

  // Hero card
  heroSection: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.lg,
  },
  heroCard: {
    padding: 0,
    overflow: 'hidden',
  },
  heroInner: {
    padding: spacing.screen,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
  },
  heroInfo: {
    flex: 1,
  },
  heroBadges: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  heroTitle: {
    fontFamily: 'Oswald-Bold',
    fontWeight: '700',
    fontSize: typography.size.xxl,
    color: colors.textPrimary,
    lineHeight: typography.size.xxl * typography.lineHeight.tight,
  },
  heroDJ: {
    fontFamily: 'DMSans-Regular',
    fontWeight: '400',
    fontSize: typography.size.md,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  heroVisualizer: {
    marginTop: spacing.lg,
  },

  // Section
  section: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.xl,
    gap: spacing.md,
  },

  // Quick grid
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickCell: {
    width: '48.5%',
  },
  quickCard: {
    padding: spacing.lg,
  },
  quickHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  quickIcon: {
    fontSize: 22,
  },
  hotDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 2,
  },
  quickLabel: {
    fontFamily: 'DMSans-SemiBold',
    fontWeight: '600',
    fontSize: typography.size.lg,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  quickSub: {
    fontFamily: 'JetBrainsMono-Regular',
    fontWeight: '400',
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },

});
