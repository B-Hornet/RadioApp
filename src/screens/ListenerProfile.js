import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Share,
} from 'react-native';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { colors, spacing, fonts, borderRadius } from '../theme';
import { BADGES, LEADERBOARD_LIMIT } from '../constants';

const StatCard = ({ label, value, icon }) => (
  <View style={styles.statCard}>
    <Text style={styles.statIcon}>{icon}</Text>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const BadgeItem = ({ badge, earned }) => (
  <View style={[styles.badgeItem, !earned && styles.badgeLocked]}>
    <Text style={[styles.badgeEmoji, !earned && styles.badgeEmojiLocked]}>
      {badge.emoji}
    </Text>
    <Text style={[styles.badgeName, !earned && styles.badgeNameLocked]}>
      {badge.name}
    </Text>
    {!earned && <Text style={styles.badgeLockIcon}>{'\uD83D\uDD12'}</Text>}
  </View>
);

const ListenerProfile = () => {
  const [stats, setStats] = useState({
    totalListeningMinutes: 0,
    chatMessages: 0,
    songRequests: 0,
    reactionsGiven: 0,
    currentStreak: 0,
  });
  const [earnedBadges, setEarnedBadges] = useState(['first_listen', 'chat_starter']);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const leaderboardQuery = query(
      collection(db, 'leaderboard'),
      orderBy('points', 'desc'),
      limit(LEADERBOARD_LIMIT)
    );
    const unsubscribe = onSnapshot(
      leaderboardQuery,
      (snapshot) => {
        const sorted = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setLeaderboard(sorted);
        setIsLoading(false);
      },
      (error) => {
        console.error('Leaderboard listener error:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Check out Reeboot Radio! Listen live and join the community. Download the app now!',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const formatListeningTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {'\uD83C\uDFA7'}
          </Text>
        </View>
        <Text style={styles.username}>Listener</Text>
        <Text style={styles.memberSince}>Reeboot Radio Community Member</Text>
      </View>

      {/* Stats grid */}
      <View style={styles.statsGrid}>
        <StatCard
          icon={'\u23F1\uFE0F'}
          value={formatListeningTime(stats.totalListeningMinutes)}
          label="Listen Time"
        />
        <StatCard
          icon={'\uD83D\uDCAC'}
          value={stats.chatMessages}
          label="Messages"
        />
        <StatCard
          icon={'\uD83C\uDFB5'}
          value={stats.songRequests}
          label="Requests"
        />
        <StatCard
          icon={'\uD83D\uDD25'}
          value={stats.reactionsGiven}
          label="Reactions"
        />
      </View>

      {/* Streak */}
      <View style={styles.streakCard}>
        <Text style={styles.streakEmoji}>{'\u26A1'}</Text>
        <View style={styles.streakInfo}>
          <Text style={styles.streakValue}>{stats.currentStreak} Day Streak</Text>
          <Text style={styles.streakSubtext}>Keep tuning in daily to grow your streak!</Text>
        </View>
      </View>

      {/* Badges section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Badges</Text>
        <Text style={styles.sectionCount}>
          {earnedBadges.length}/{BADGES.length} earned
        </Text>
      </View>
      <View style={styles.badgesGrid}>
        {BADGES.map((badge) => (
          <BadgeItem
            key={badge.id}
            badge={badge}
            earned={earnedBadges.includes(badge.id)}
          />
        ))}
      </View>

      {/* Leaderboard */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Top Listeners This Week</Text>
      </View>
      <View style={styles.leaderboardContainer}>
        {leaderboard.length > 0 ? (
          leaderboard.map((entry, index) => (
            <View key={entry.id} style={styles.leaderboardRow}>
              <Text style={styles.leaderboardRank}>
                {index === 0 ? '\uD83E\uDD47' : index === 1 ? '\uD83E\uDD48' : index === 2 ? '\uD83E\uDD49' : `#${index + 1}`}
              </Text>
              <Text style={styles.leaderboardName}>{entry.username}</Text>
              <Text style={styles.leaderboardPoints}>{entry.points} pts</Text>
            </View>
          ))
        ) : (
          <View style={styles.leaderboardEmpty}>
            <Text style={styles.leaderboardEmptyText}>
              Leaderboard updates weekly. Start listening to earn points!
            </Text>
          </View>
        )}
      </View>

      {/* Social sharing */}
      <TouchableOpacity
        style={styles.shareButton}
        onPress={handleShare}
        accessibilityLabel="Share profile"
        accessibilityRole="button"
      >
        <Text style={styles.shareButtonText}>
          Share My Reeboot Radio Profile
        </Text>
      </TouchableOpacity>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // Profile header
  profileHeader: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.primary,
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: 36,
  },
  username: {
    fontSize: fonts.sizes.xxl,
    fontWeight: fonts.weights.bold,
    color: colors.textPrimary,
  },
  memberSince: {
    fontSize: fonts.sizes.md,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  // Stats
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  statCard: {
    width: '50%',
    padding: spacing.sm,
  },
  statCardInner: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
    textAlign: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: fonts.sizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  // Streak
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    marginBottom: spacing.lg,
  },
  streakEmoji: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  streakInfo: {
    flex: 1,
  },
  streakValue: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.bold,
    color: colors.primary,
  },
  streakSubtext: {
    fontSize: fonts.sizes.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  // Sections
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.bold,
    color: colors.textPrimary,
  },
  sectionCount: {
    fontSize: fonts.sizes.sm,
    color: colors.textMuted,
  },
  // Badges
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  badgeItem: {
    width: '33.33%',
    padding: spacing.xs,
    alignItems: 'center',
  },
  badgeLocked: {
    opacity: 0.35,
  },
  badgeEmoji: {
    fontSize: 32,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    overflow: 'hidden',
    textAlign: 'center',
    minWidth: 56,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeEmojiLocked: {
    borderColor: colors.surfaceLight,
  },
  badgeName: {
    fontSize: fonts.sizes.xs,
    fontWeight: fonts.weights.medium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  badgeNameLocked: {
    color: colors.textMuted,
  },
  badgeLockIcon: {
    fontSize: 12,
    position: 'absolute',
    top: spacing.xs,
    right: spacing.sm,
  },
  // Leaderboard
  leaderboardContainer: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  leaderboardRank: {
    fontSize: fonts.sizes.lg,
    width: 40,
    textAlign: 'center',
  },
  leaderboardName: {
    flex: 1,
    fontSize: fonts.sizes.md,
    color: colors.textPrimary,
    fontWeight: fonts.weights.medium,
  },
  leaderboardPoints: {
    fontSize: fonts.sizes.md,
    color: colors.primary,
    fontWeight: fonts.weights.bold,
  },
  leaderboardEmpty: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  leaderboardEmptyText: {
    fontSize: fonts.sizes.md,
    color: colors.textMuted,
    textAlign: 'center',
  },
  // Share
  shareButton: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  shareButtonText: {
    color: colors.primary,
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.bold,
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
});

export default ListenerProfile;
