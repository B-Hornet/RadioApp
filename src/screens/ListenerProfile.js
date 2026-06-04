/**
 * ListenerProfile — Gamified Listener Profile
 * ═══════════════════════════════════════════════
 * Identity comes from useListenerAuth (Firebase displayName for
 * signed-in users, generic "Listener" for anonymous). Anonymous
 * users see a "Sign in to chat" CTA; signed-in users see Sign Out.
 * Leaderboard from Firestore. Badges from users/{uid}.badges.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Pressable,
  Share,
  ActivityIndicator,
  Linking,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db, auth } from '../firebaseConfig';
import { collection, onSnapshot, query, orderBy, limit, doc } from 'firebase/firestore';
import { colors, typography, spacing, radius, presets, elevation } from '../theme/tokens';
import { BADGES, LEADERBOARD_LIMIT, LEGAL_URLS, MODERATION_STRINGS } from '../constants';
import Glass from '../components/Glass';
import useListenerAuth from '../hooks/useListenerAuth';
import useBlockList from '../hooks/useBlockList';
import ListenerAuthModal from '../components/ListenerAuthModal';
import DeleteAccountModal from '../components/DeleteAccountModal';

// A blocked entry only carries the sender uid (no display name is
// stored locally), so we surface a short, stable label instead.
const shortUid = (uid) => (uid && uid.length > 8 ? `${uid.slice(0, 8)}…` : uid);

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
const BadgeCard = ({ badge, earned, index }) => (
  <Animated.View
    entering={FadeInDown.delay(500 + index * 60).springify()}
    style={styles.badgeCell}
  >
    <Glass
      accent={earned}
      style={[styles.badgeGlass, !earned && styles.badgeLocked]}
    >
      <Text style={[styles.badgeIcon, earned && styles.badgeIconGlow, !earned && styles.badgeIconLocked]}>
        {badge.emoji}
      </Text>
      <Text style={[styles.badgeName, !earned && styles.badgeNameLocked]}>
        {badge.name}
      </Text>
    </Glass>
  </Animated.View>
);

export default function ListenerProfile({ onOwnerLongPress }) {
  const {
    isAnonymous,
    isSignedIn,
    displayName,
    authError,
    signIn,
    signUp,
    signOut,
    deleteAccount,
    clearError,
  } = useListenerAuth();
  const { blockedUids, unblockUser } = useBlockList();
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // Badges populate from users/{uid}.badges once a Cloud Function
  // writes them on achievement events. Until then it stays empty —
  // the UI shows every badge as locked, which is the truthful state.
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const openLink = (url) => {
    Linking.openURL(url).catch((e) => console.warn('Open URL failed:', e?.message));
  };

  // Owner-access gesture — double-tap on the avatar within 400ms.
  // Replaces the 3-second long-press (no visual feedback was a real
  // UX gap; you couldn't tell the press was registering). Two quick
  // taps is intentional, hard to trigger by accident, and instant.
  const lastAvatarTapRef = useRef(0);
  const handleAvatarTap = useCallback(() => {
    const now = Date.now();
    if (now - lastAvatarTapRef.current < 400) {
      onOwnerLongPress?.();
      lastAvatarTapRef.current = 0;
    } else {
      lastAvatarTapRef.current = now;
    }
  }, [onOwnerLongPress]);

  // Username = signed-in displayName, or generic "Listener" for anon.
  const username = displayName || 'Listener';

  // Subscribe to the current user's badge list.
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return undefined;
    const userRef = doc(db, 'users', uid);
    const unsub = onSnapshot(userRef, (snap) => {
      const list = snap.exists() ? snap.data().badges : null;
      setEarnedBadges(Array.isArray(list) ? list : []);
    }, () => {
      // Doc may not exist yet (anonymous user, never wrote a profile);
      // keep the empty state.
    });
    return () => unsub();
  }, []);

  // Leaderboard from Firestore
  useEffect(() => {
    let unsub = () => {};
    try {
      const leaderboardQuery = query(
        collection(db, 'leaderboard'),
        orderBy('points', 'desc'),
        limit(LEADERBOARD_LIMIT),
      );
      unsub = onSnapshot(
        leaderboardQuery,
        (snapshot) => {
          setLeaderboard(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
          setIsLoading(false);
        },
        (error) => {
          console.warn('Leaderboard unavailable:', error.message);
          setIsLoading(false);
        },
      );
    } catch (e) {
      console.warn('Leaderboard setup error:', e.message);
      setIsLoading(false);
    }
    return () => unsub();
  }, []);

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Check out Reeboot Radio — What Radio Should Sound Like. Download the app now!',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const STATS = [
    { value: '—', label: 'Hours Listened' },
    { value: '—', label: 'Songs Requested' },
    { value: '—', label: 'Chat Messages' },
    { value: leaderboard.length > 0 ? `#${leaderboard.findIndex((e) => e.username === username) + 1 || '—'}` : '—', label: 'Leaderboard' },
  ];

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bgDeep} />
      <View style={styles.ambientGlow} />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar + Name — double-tap the headphones for owner access */}
          <Animated.View entering={FadeIn.delay(100)} style={styles.avatarSection}>
            <Pressable onPress={handleAvatarTap}>
              <View style={styles.avatar}>
                <Text style={styles.avatarEmoji}>🎧</Text>
              </View>
            </Pressable>
            <Text style={styles.displayName}>{username}</Text>
            <Text style={styles.levelBadge}>
              {earnedBadges.length}/{BADGES.length} BADGES EARNED
            </Text>

            {/* Auth control: anon → Sign In CTA, signed-in → Sign Out + Delete */}
            {isAnonymous ? (
              <Pressable
                onPress={() => setShowAuthModal(true)}
                style={styles.authPrimaryBtn}
              >
                <Text style={styles.authPrimaryBtnText}>Sign in to chat</Text>
              </Pressable>
            ) : isSignedIn ? (
              <View style={styles.authRow}>
                <Pressable onPress={signOut} style={styles.authSecondaryBtn}>
                  <Text style={styles.authSecondaryBtnText}>Sign Out</Text>
                </Pressable>
                <Pressable
                  onPress={() => setShowDeleteModal(true)}
                  style={styles.authDangerBtn}
                >
                  <Text style={styles.authDangerBtnText}>Delete Account</Text>
                </Pressable>
              </View>
            ) : null}
          </Animated.View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            {STATS.map((stat, i) => (
              <StatCard key={stat.label} stat={stat} index={i} />
            ))}
          </View>

          {/* Badges */}
          <View style={styles.section}>
            <Text style={presets.sectionLabel}>Badges</Text>
            <View style={styles.badgeGrid}>
              {BADGES.map((badge, i) => (
                <BadgeCard
                  key={badge.id}
                  badge={badge}
                  earned={earnedBadges.includes(badge.id)}
                  index={i}
                />
              ))}
            </View>
          </View>

          {/* Leaderboard */}
          <View style={styles.section}>
            <Text style={presets.sectionLabel}>Top Listeners</Text>
            {isLoading ? (
              <ActivityIndicator color={colors.primary} style={{ paddingVertical: spacing.xl }} />
            ) : leaderboard.length > 0 ? (
              leaderboard.map((entry, i) => {
                const isYou = entry.username === username;
                return (
                  <Animated.View
                    key={entry.id}
                    entering={FadeInDown.delay(800 + i * 80).springify()}
                  >
                    <Glass
                      accent={isYou}
                      style={[styles.leaderRow, isYou && styles.leaderRowYou]}
                    >
                      <Text style={[styles.leaderRank, isYou && styles.leaderRankYou]}>
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                      </Text>
                      <Text style={[styles.leaderName, isYou && styles.leaderNameYou]}>
                        {entry.username}{isYou ? ' (You)' : ''}
                      </Text>
                      <Text style={styles.leaderPoints}>{entry.points} pts</Text>
                    </Glass>
                  </Animated.View>
                );
              })
            ) : (
              <Glass style={styles.emptyLeaderboard}>
                <Text style={styles.emptyText}>
                  Leaderboard updates weekly. Keep listening to earn points!
                </Text>
              </Glass>
            )}
          </View>

          {/* Blocked listeners — moderation (App Store guideline 1.2).
              Lets a listener review and undo blocks made from chat. */}
          <View style={styles.section}>
            <Text style={presets.sectionLabel}>
              {MODERATION_STRINGS.blockedSectionTitle}
            </Text>
            {blockedUids.length === 0 ? (
              <Glass style={styles.emptyLeaderboard}>
                <Text style={styles.emptyText}>
                  {MODERATION_STRINGS.blockedEmpty}
                </Text>
              </Glass>
            ) : (
              blockedUids.map((uid) => (
                <Glass key={uid} style={styles.blockedRow}>
                  <View style={styles.blockedInfo}>
                    <Text style={styles.blockedLabel}>
                      {MODERATION_STRINGS.blockedRowLabel}
                    </Text>
                    <Text style={styles.blockedUid}>{shortUid(uid)}</Text>
                  </View>
                  <Pressable
                    onPress={() => unblockUser(uid)}
                    style={styles.unblockBtn}
                  >
                    <Text style={styles.unblockBtnText}>
                      {MODERATION_STRINGS.unblockAction}
                    </Text>
                  </Pressable>
                </Glass>
              ))
            )}
          </View>

          {/* Share */}
          <Animated.View entering={FadeIn.delay(1000)} style={styles.shareSection}>
            <Glass onPress={handleShare} style={styles.shareButton}>
              <Text style={styles.shareText}>📤  Share Reeboot Radio</Text>
            </Glass>
          </Animated.View>

          {/* Legal — required by App Store + Play Store reviewers.
              The privacy policy URL is also referenced from the
              store listing pages. */}
          <View style={styles.legalSection}>
            <Pressable onPress={() => openLink(LEGAL_URLS.privacyPolicy)}>
              <Text style={styles.legalLink}>Privacy Policy</Text>
            </Pressable>
            <Text style={styles.legalDivider}>·</Text>
            <Pressable onPress={() => openLink(LEGAL_URLS.termsOfService)}>
              <Text style={styles.legalLink}>Terms of Service</Text>
            </Pressable>
            <Text style={styles.legalDivider}>·</Text>
            <Pressable onPress={() => openLink(LEGAL_URLS.support)}>
              <Text style={styles.legalLink}>Support</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>

      <ListenerAuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSignIn={signIn}
        onSignUp={signUp}
        authError={authError}
        clearError={clearError}
      />

      <DeleteAccountModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={deleteAccount}
        authError={authError}
        clearError={clearError}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bgDeep },
  safeArea: { flex: 1 },
  scrollContent: { paddingBottom: 140 },
  ambientGlow: {
    position: 'absolute', top: -60, left: '50%', marginLeft: -200,
    width: 400, height: 400, borderRadius: 200,
    backgroundColor: colors.primarySubtle, opacity: 0.6,
  },

  // Avatar
  avatarSection: { alignItems: 'center', paddingTop: spacing.xxl, paddingBottom: spacing.lg },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.bgHighlight, borderWidth: 2,
    borderColor: 'rgba(255, 107, 0, 0.3)',
    alignItems: 'center', justifyContent: 'center',
    ...elevation.glow(colors.primaryGlow),
  },
  avatarEmoji: { fontSize: 32 },
  displayName: {
    fontFamily: 'Oswald-Bold', fontWeight: '700',
    fontSize: typography.size.xxl, color: colors.textPrimary,
    letterSpacing: 0.5, marginTop: spacing.md,
  },
  levelBadge: {
    fontFamily: 'JetBrainsMono-Regular', fontWeight: '400',
    fontSize: typography.size.xs, color: colors.primary,
    letterSpacing: 1, marginTop: spacing.xs,
  },
  authPrimaryBtn: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
  authPrimaryBtnText: {
    fontFamily: 'DMSans-SemiBold',
    fontWeight: '600',
    fontSize: typography.size.sm,
    color: colors.white,
    letterSpacing: 0.5,
  },
  authRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  authSecondaryBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  authSecondaryBtnText: {
    fontFamily: 'DMSans-Medium',
    fontWeight: '500',
    fontSize: typography.size.xs,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  authDangerBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 58, 0.4)',
    backgroundColor: 'rgba(255, 69, 58, 0.08)',
  },
  authDangerBtnText: {
    fontFamily: 'DMSans-Medium',
    fontWeight: '500',
    fontSize: typography.size.xs,
    color: colors.error,
    letterSpacing: 0.5,
  },
  legalSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  legalLink: {
    fontFamily: 'DMSans-Medium',
    fontWeight: '500',
    fontSize: typography.size.xs,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
  legalDivider: {
    fontFamily: 'DMSans-Regular',
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },

  // Stats
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm,
    paddingHorizontal: spacing.screen, paddingTop: spacing.xl,
  },
  statCell: { width: '48.5%' },
  statGlass: { padding: spacing.lg, alignItems: 'center' },
  statValue: {
    fontFamily: 'Oswald-Bold', fontWeight: '700', fontSize: 28, color: colors.textPrimary,
  },
  statLabel: {
    fontFamily: 'JetBrainsMono-Regular', fontWeight: '400',
    fontSize: typography.size.xs, color: colors.textMuted,
    letterSpacing: 0.5, marginTop: spacing.xs,
  },

  // Section
  section: { paddingHorizontal: spacing.screen, paddingTop: spacing.xl, gap: spacing.md },

  // Badges
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  badgeCell: { width: '31.5%' },
  badgeGlass: { padding: 14, alignItems: 'center' },
  badgeLocked: { opacity: 0.35 },
  badgeIcon: { fontSize: 28 },
  badgeIconGlow: {
    textShadowColor: colors.primaryGlow,
    textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8,
  },
  badgeIconLocked: { opacity: 0.5 },
  badgeName: {
    fontFamily: 'DMSans-Medium', fontWeight: '500',
    fontSize: typography.size.xs, color: colors.textPrimary,
    marginTop: spacing.sm, textAlign: 'center',
  },
  badgeNameLocked: { color: colors.textMuted },

  // Leaderboard
  leaderRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: spacing.md, paddingHorizontal: spacing.lg, marginBottom: spacing.sm,
  },
  leaderRowYou: { borderColor: colors.glassAccentBorder },
  leaderRank: {
    fontFamily: 'Oswald-Bold', fontWeight: '700',
    fontSize: typography.size.lg, color: colors.textMuted, width: 36,
  },
  leaderRankYou: { color: colors.primary },
  leaderName: {
    fontFamily: 'DMSans-SemiBold', fontWeight: '600',
    fontSize: typography.size.md, color: colors.textPrimary, flex: 1,
  },
  leaderNameYou: { color: colors.primary },
  leaderPoints: {
    fontFamily: 'JetBrainsMono-Medium', fontWeight: '500',
    fontSize: typography.size.sm, color: colors.textMuted,
  },
  emptyLeaderboard: { padding: spacing.xl, alignItems: 'center' },
  emptyText: {
    fontFamily: 'DMSans-Regular', fontWeight: '400',
    fontSize: typography.size.sm, color: colors.textMuted, textAlign: 'center',
  },

  // Blocked listeners
  blockedRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: spacing.md, paddingHorizontal: spacing.lg, marginBottom: spacing.sm,
  },
  blockedInfo: { flex: 1, marginRight: spacing.md },
  blockedLabel: {
    fontFamily: 'DMSans-SemiBold', fontWeight: '600',
    fontSize: typography.size.sm, color: colors.textPrimary,
  },
  blockedUid: {
    fontFamily: 'JetBrainsMono-Regular', fontWeight: '400',
    fontSize: typography.size.xs, color: colors.textMuted, marginTop: spacing.xs,
  },
  unblockBtn: {
    paddingHorizontal: spacing.lg, paddingVertical: spacing.xs,
    borderRadius: radius.full, borderWidth: 1, borderColor: colors.primaryBorder,
    backgroundColor: colors.primarySubtle,
  },
  unblockBtnText: {
    fontFamily: 'DMSans-Medium', fontWeight: '500',
    fontSize: typography.size.xs, color: colors.primary, letterSpacing: 0.5,
  },

  // Share
  shareSection: { paddingHorizontal: spacing.screen, paddingTop: spacing.xl },
  shareButton: { padding: spacing.lg, alignItems: 'center' },
  shareText: {
    fontFamily: 'DMSans-SemiBold', fontWeight: '600',
    fontSize: typography.size.md, color: colors.primary,
  },
});
