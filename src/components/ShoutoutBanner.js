/**
 * ShoutoutBanner — Displays broadcast messages from the owner
 * ═══════════════════════════════════════════════════════════
 * Listens to the shoutouts collection and shows new messages
 * as an animated banner at the top of the screen.
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { db } from '../firebaseConfig';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { colors, typography, spacing, radius } from '../theme/tokens';

const BANNER_DURATION = 8000; // auto-dismiss after 8s

export default function ShoutoutBanner() {
  const [shoutout, setShoutout] = useState(null);
  const [lastSeenId, setLastSeenId] = useState(null);
  const slideAnim = useRef(new Animated.Value(-120)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);

  useEffect(() => {
    const q = query(collection(db, 'shoutouts'), orderBy('createdAt', 'desc'), limit(1));
    const unsub = onSnapshot(q, (snap) => {
      if (snap.empty) return;
      const latest = { id: snap.docs[0].id, ...snap.docs[0].data() };
      // Only show if it's a new shoutout we haven't seen
      if (latest.id !== lastSeenId && latest.createdAt) {
        setShoutout(latest);
        setLastSeenId(latest.id);
        showBanner();
      }
    }, () => {});
    return () => unsub();
  }, [lastSeenId]);

  const showBanner = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 15 }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
    timerRef.current = setTimeout(dismissBanner, BANNER_DURATION);
  };

  const dismissBanner = () => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: -120, duration: 300, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setShoutout(null));
  };

  if (!shoutout) return null;

  const isGiveaway = shoutout.type === 'giveaway';

  return (
    <Animated.View
      style={[
        styles.banner,
        isGiveaway && styles.bannerGiveaway,
        { transform: [{ translateY: slideAnim }], opacity: opacityAnim },
      ]}
    >
      <View style={styles.bannerContent}>
        <Text style={styles.bannerLabel}>
          {isGiveaway ? 'GIVEAWAY WINNER' : 'SHOUTOUT'}
        </Text>
        <Text style={styles.bannerMessage}>{shoutout.message}</Text>
      </View>
      <Pressable style={styles.dismissBtn} onPress={dismissBanner}>
        <Text style={styles.dismissText}>X</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 50,
    left: spacing.screen,
    right: spacing.screen,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1000,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  bannerGiveaway: {
    backgroundColor: colors.online,
    shadowColor: colors.online,
  },
  bannerContent: { flex: 1 },
  bannerLabel: {
    fontFamily: 'Oswald-Bold',
    fontWeight: '700',
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 2,
    marginBottom: 2,
  },
  bannerMessage: {
    fontFamily: 'DMSans-SemiBold',
    fontWeight: '600',
    fontSize: typography.size.md,
    color: colors.white,
  },
  dismissBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  dismissText: {
    fontFamily: 'DMSans-Bold',
    fontSize: typography.size.md,
    color: 'rgba(255, 255, 255, 0.7)',
  },
});
