/**
 * GiveawayModal — Full-screen winner announcement
 * ══════════════════════════════════════════════════
 * Shows when a giveaway winner is announced.
 * Auto-dismisses after 10 seconds.
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, Modal, StyleSheet, Animated } from 'react-native';
import { db } from '../firebaseConfig';
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { colors, typography, spacing, radius } from '../theme/tokens';

export default function GiveawayModal() {
  const [giveaway, setGiveaway] = useState(null);
  const [lastSeenId, setLastSeenId] = useState(null);
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const q = query(
      collection(db, 'shoutouts'),
      where('type', '==', 'giveaway'),
      orderBy('createdAt', 'desc'),
      limit(1),
    );
    const unsub = onSnapshot(q, (snap) => {
      if (snap.empty) return;
      const latest = { id: snap.docs[0].id, ...snap.docs[0].data() };
      if (latest.id !== lastSeenId && latest.createdAt) {
        setGiveaway(latest);
        setLastSeenId(latest.id);
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, damping: 12 }).start();
        // Auto-dismiss after 10s
        setTimeout(() => dismiss(), 10000);
      }
    }, () => {});
    return () => unsub();
  }, [lastSeenId]);

  const dismiss = () => {
    Animated.timing(scaleAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
      setGiveaway(null);
      scaleAnim.setValue(0.5);
    });
  };

  if (!giveaway) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={dismiss}>
      <Pressable style={styles.overlay} onPress={dismiss}>
        <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.title}>GIVEAWAY WINNER!</Text>
          <Text style={styles.winner}>{giveaway.winner}</Text>
          <Text style={styles.message}>{giveaway.message}</Text>
          <Pressable style={styles.closeBtn} onPress={dismiss}>
            <Text style={styles.closeBtnText}>Awesome!</Text>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.screen,
  },
  card: {
    backgroundColor: colors.bgSurface,
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: colors.online,
    padding: spacing.xxl,
    alignItems: 'center',
    width: '100%',
    shadowColor: colors.online,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 20,
  },
  emoji: { fontSize: 64, marginBottom: spacing.md },
  title: {
    fontFamily: 'Oswald-Bold',
    fontWeight: '700',
    fontSize: typography.size.xxl,
    color: colors.online,
    letterSpacing: 3,
    marginBottom: spacing.md,
  },
  winner: {
    fontFamily: 'Oswald-Bold',
    fontWeight: '700',
    fontSize: 36,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontFamily: 'DMSans-Regular',
    fontSize: typography.size.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  closeBtn: {
    backgroundColor: colors.online,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
  },
  closeBtnText: {
    fontFamily: 'Oswald-Bold',
    fontWeight: '700',
    fontSize: typography.size.lg,
    color: colors.white,
    letterSpacing: 1,
  },
});
