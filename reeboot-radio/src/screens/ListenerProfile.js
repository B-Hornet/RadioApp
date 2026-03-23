/**
 * ListenerProfile — Gamified Listener Profile
 * ═══════════════════════════════════════════════
 * Editorial stat layout with large display numbers.
 * Badge grid with earned/locked glow states.
 * Replaces the old oversized-padding profile.
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
import { colors, typography, spacing, presets, elevation } from '../theme/tokens';
import Glass from '../components/Glass';

// ── Stats ──────────────────────────────────────────────────
const STATS = [
  { value: '342', label: 'Hours Listened' },
  { value: '87', label: 'Songs Requested' },
  { value: '1.2K', label: 'Chat Messages' },
  { value: '#7', label: 'Leaderboard' },
];

// ── Badges ─────────────────────────────────────────────────
const BADGES = [
  { icon: '🔥', name: 'First Listen', earned: true },
  { icon: '💎', name: '100 Hours', earned: true },
  { icon: '⚡', name: 'Night Owl', earned: true },
  { icon: '🎯', name: 'Top Requester', earned: true },
  { icon: '🏆', name: 'Leaderboard', earned: true },
  { icon: '🌙', name: 'Midnight Club', earned: false },
  { icon: '👑', name: 'OG Listener', earned: false },
  { icon: '🎧', name: "DJ's Pick", earned: false },
  { icon: '✨', name: 'Legend', earned: false },
];

// ── Stat Card ──────────────────────────────────────────────
const StatCard = ({ stat, index }) => (
  <Animated.View
    entering={FadeInDown.delay(200 + index * 80).springify()}
    style={styles.statCell}
  >
    <Glass style={styles.statGlass}>
      <Text style={styles.statValue}>{stat.value}</Text>
      <Text style={styles.statLabel}>{stat.label}</Text>
    </Glass>
  </Animated.View>
);

// ── Badge Card ─────────────────────────────────────────────
const BadgeCard = ({ badge, index }) => (
  <Animated.View
    entering={FadeInDown.delay(500 + index * 60).springify()}
    style={styles.badgeCell}
  >
    <Glass
      accent={badge.earned}
      style={[styles.badgeGlass, !badge.earned && styles.badgeLocked]}
    >
      <Text
        style={[
          styles.badgeIcon,
          badge.earned && styles.badgeIconGlow,
          !badge.earned && styles.badgeIconLocked,
        ]}
      >
        {badge.icon}
      </Text>
      <Text
        style={[
          styles.badgeName,
          !badge.earned && styles.badgeNameLocked,
        ]}
      >
        {badge.name}
      </Text>
    </Glass>
  </Animated.View>
);

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

export default function ListenerProfile() {
  // TODO: Pull from user profile in Firestore / Zustand store

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bgDeep} />
      <View style={styles.ambientGlow} />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Avatar + Name ──────────────────────────── */}
          <Animated.View entering={FadeIn.delay(100)} style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarEmoji}>🎧</Text>
            </View>
            <Text style={styles.displayName}>Neon_Kid</Text>
            <Text style={styles.levelBadge}>LEVEL 7 • LOYAL LISTENER</Text>
          </Animated.View>

          {/* ── Stats Grid ─────────────────────────────── */}
          <View style={styles.statsGrid}>
            {STATS.map((stat, i) => (
              <StatCard key={stat.label} stat={stat} index={i} />
            ))}
          </View>

          {/* ── Badges ─────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={presets.sectionLabel}>Badges</Text>
            <View style={styles.badgeGrid}>
              {BADGES.map((badge, i) => (
                <BadgeCard key={badge.name} badge={badge} index={i} />
              ))}
            </View>
          </View>

          {/* ── Top 10 Leaderboard Preview ─────────────── */}
          <View style={styles.section}>
            <Text style={presets.sectionLabel}>Top Listeners</Text>
            {[
              { rank: 1, name: 'BassQueen', hours: '892h', you: false },
              { rank: 2, name: 'DJ_Fan_01', hours: '756h', you: false },
              { rank: 3, name: 'NightRider', hours: '621h', you: false },
              { rank: 7, name: 'Neon_Kid', hours: '342h', you: true },
            ].map((entry, i) => (
              <Animated.View
                key={entry.rank}
                entering={FadeInDown.delay(800 + i * 80).springify()}
              >
                <Glass
                  accent={entry.you}
                  style={[styles.leaderRow, entry.you && styles.leaderRowYou]}
                >
                  <Text style={[styles.leaderRank, entry.you && styles.leaderRankYou]}>
                    #{entry.rank}
                  </Text>
                  <Text style={[styles.leaderName, entry.you && styles.leaderNameYou]}>
                    {entry.name}
                  </Text>
                  <Text style={styles.leaderHours}>{entry.hours}</Text>
                </Glass>
              </Animated.View>
            ))}
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
    left: '50%',
    marginLeft: -200,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: colors.primarySubtle,
    opacity: 0.6,
  },

  // Avatar section
  avatarSection: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.bgHighlight,
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    ...elevation.glow(colors.primaryGlow),
  },
  avatarEmoji: {
    fontSize: 32,
  },
  displayName: {
    fontFamily: 'Oswald-Bold',
    fontWeight: '700',
    fontSize: typography.size.xxl,
    color: colors.textPrimary,
    letterSpacing: 0.5,
    marginTop: spacing.md,
  },
  levelBadge: {
    fontFamily: 'JetBrainsMono-Regular',
    fontWeight: '400',
    fontSize: typography.size.xs,
    color: colors.primary,
    letterSpacing: 1,
    marginTop: spacing.xs,
  },

  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.xl,
  },
  statCell: {
    width: '48.5%',
  },
  statGlass: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'Oswald-Bold',
    fontWeight: '700',
    fontSize: 28,
    color: colors.textPrimary,
  },
  statLabel: {
    fontFamily: 'JetBrainsMono-Regular',
    fontWeight: '400',
    fontSize: typography.size.xs,
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginTop: spacing.xs,
  },

  // Section
  section: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.xl,
    gap: spacing.md,
  },

  // Badges
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  badgeCell: {
    width: '31.5%',
  },
  badgeGlass: {
    padding: 14,
    alignItems: 'center',
  },
  badgeLocked: {
    opacity: 0.35,
  },
  badgeIcon: {
    fontSize: 28,
  },
  badgeIconGlow: {
    textShadowColor: colors.primaryGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  badgeIconLocked: {
    opacity: 0.5,
  },
  badgeName: {
    fontFamily: 'DMSans-Medium',
    fontWeight: '500',
    fontSize: typography.size.xs,
    color: colors.textPrimary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  badgeNameLocked: {
    color: colors.textMuted,
  },

  // Leaderboard
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  leaderRowYou: {
    borderColor: colors.glassAccentBorder,
  },
  leaderRank: {
    fontFamily: 'Oswald-Bold',
    fontWeight: '700',
    fontSize: typography.size.lg,
    color: colors.textMuted,
    width: 36,
  },
  leaderRankYou: {
    color: colors.primary,
  },
  leaderName: {
    fontFamily: 'DMSans-SemiBold',
    fontWeight: '600',
    fontSize: typography.size.md,
    color: colors.textPrimary,
    flex: 1,
  },
  leaderNameYou: {
    color: colors.primary,
  },
  leaderHours: {
    fontFamily: 'JetBrainsMono-Medium',
    fontWeight: '500',
    fontSize: typography.size.sm,
    color: colors.textMuted,
  },
});
