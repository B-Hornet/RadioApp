/**
 * GiveawayPanel — Random listener picker + giveaway history
 * ═══════════════════════════════════════════════════════════
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  StyleSheet,
  Animated as RNAnimated,
} from 'react-native';
import { db } from '../../firebaseConfig';
import {
  collection,
  addDoc,
  onSnapshot,
  getDocs,
  query,
  orderBy,
  where,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { colors, typography, spacing, radius } from '../../theme/tokens';

export default function GiveawayPanel() {
  const [listeners, setListeners] = useState([]);
  const [winner, setWinner] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [history, setHistory] = useState([]);
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState(null);
  const spinAnim = useRef(new RNAnimated.Value(0)).current;
  const spinIntervalRef = useRef(null);

  // Clear any in-flight spin on unmount so we don't setState after teardown.
  useEffect(() => {
    return () => {
      if (spinIntervalRef.current) {
        clearInterval(spinIntervalRef.current);
        spinIntervalRef.current = null;
      }
    };
  }, []);

  // Load active listeners from recent chat messages
  useEffect(() => {
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000);
    const q = query(
      collection(db, 'Messages'),
      where('timestamp', '>=', tenMinAgo),
      orderBy('timestamp', 'desc'),
      limit(200),
    );
    const unsub = onSnapshot(q, (snap) => {
      const usernames = new Set();
      snap.docs.forEach((d) => {
        const name = d.data().username;
        if (name) usernames.add(name);
      });
      setListeners([...usernames]);
      setError(null);
    }, (err) => setError(err.message));
    return () => unsub();
  }, []);

  // Giveaway history
  useEffect(() => {
    const q = query(
      collection(db, 'shoutouts'),
      where('type', '==', 'giveaway'),
      orderBy('createdAt', 'desc'),
      limit(10),
    );
    const unsub = onSnapshot(q, (snap) => {
      setHistory(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setError(null);
    }, (err) => setError(err.message));
    return () => unsub();
  }, []);

  const pickWinner = () => {
    if (listeners.length === 0) {
      Alert.alert('No Listeners', 'No active listeners found in chat. Wait for some chat activity.');
      return;
    }

    // Defensive: if a previous spin is somehow still running (e.g. user
    // tapped Re-roll from the post-pick action row), kill it first.
    if (spinIntervalRef.current) {
      clearInterval(spinIntervalRef.current);
      spinIntervalRef.current = null;
    }

    setSpinning(true);
    setWinner(null);

    // Animated name cycling
    let count = 0;
    const totalCycles = 20;
    spinIntervalRef.current = setInterval(() => {
      const randomName = listeners[Math.floor(Math.random() * listeners.length)];
      setDisplayName(randomName);
      count++;
      if (count >= totalCycles) {
        clearInterval(spinIntervalRef.current);
        spinIntervalRef.current = null;
        const finalWinner = listeners[Math.floor(Math.random() * listeners.length)];
        setWinner(finalWinner);
        setDisplayName(finalWinner);
        setSpinning(false);
      }
    }, 100);
  };

  const announceWinner = async () => {
    if (!winner) return;
    try {
      await addDoc(collection(db, 'shoutouts'), {
        message: `Congratulations ${winner}! You won the giveaway!`,
        type: 'giveaway',
        winner,
        createdAt: serverTimestamp(),
      });
      Alert.alert('Announced!', `${winner} has been announced as the winner!`);
      setWinner(null);
      setDisplayName('');
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const formatTime = (ts) => {
    if (!ts?.toDate) return '';
    return ts.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText} numberOfLines={2}>{error}</Text>
        </View>
      ) : null}
      {/* Picker */}
      <View style={styles.pickerSection}>
        <Text style={styles.label}>RANDOM LISTENER PICKER</Text>
        <Text style={styles.listenerCount}>{listeners.length} active listeners in chat</Text>

        <View style={styles.pickerBox}>
          <Text style={[styles.pickerName, winner && styles.pickerNameWinner]}>
            {displayName || '???'}
          </Text>
        </View>

        {!winner ? (
          <Pressable
            style={[styles.spinBtn, spinning && styles.spinBtnDisabled]}
            onPress={pickWinner}
            disabled={spinning}
          >
            <Text style={styles.spinBtnText}>{spinning ? 'Picking...' : 'Pick a Winner'}</Text>
          </Pressable>
        ) : (
          <View style={styles.winnerActions}>
            <Pressable style={styles.announceBtn} onPress={announceWinner}>
              <Text style={styles.announceBtnText}>Announce Winner</Text>
            </Pressable>
            <Pressable style={styles.rerollBtn} onPress={pickWinner}>
              <Text style={styles.rerollBtnText}>Re-roll</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* History */}
      <View style={styles.section}>
        <Text style={styles.label}>GIVEAWAY HISTORY</Text>
        {history.length === 0 ? (
          <Text style={styles.emptyText}>No giveaways yet</Text>
        ) : (
          history.map((item) => (
            <View key={item.id} style={styles.historyCard}>
              <Text style={styles.historyWinner}>{item.winner}</Text>
              <Text style={styles.historyTime}>{formatTime(item.createdAt)}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.screen, paddingBottom: 140 },

  pickerSection: { marginBottom: spacing.xxl },
  label: {
    fontFamily: 'Oswald-Medium', fontWeight: '500', fontSize: typography.size.sm,
    color: colors.textMuted, letterSpacing: 2, marginBottom: spacing.sm,
  },
  listenerCount: { fontFamily: 'JetBrainsMono-Regular', fontSize: typography.size.xs, color: colors.textSecondary, marginBottom: spacing.lg },

  pickerBox: {
    backgroundColor: colors.bgSurface, borderRadius: radius.lg, borderWidth: 2,
    borderColor: colors.glassBorder, padding: spacing.xxl, alignItems: 'center',
    marginBottom: spacing.lg,
  },
  pickerName: {
    fontFamily: 'Oswald-Bold', fontWeight: '700', fontSize: 32, color: colors.textPrimary,
  },
  pickerNameWinner: { color: colors.primary },

  spinBtn: {
    backgroundColor: colors.primary, borderRadius: radius.md,
    paddingVertical: spacing.md, alignItems: 'center',
  },
  spinBtnDisabled: { opacity: 0.6 },
  spinBtnText: { fontFamily: 'Oswald-Bold', fontWeight: '700', fontSize: typography.size.lg, color: colors.white, letterSpacing: 1 },

  winnerActions: { flexDirection: 'row', gap: spacing.sm },
  announceBtn: {
    flex: 1, backgroundColor: colors.online, borderRadius: radius.md,
    paddingVertical: spacing.md, alignItems: 'center',
  },
  announceBtnText: { fontFamily: 'DMSans-SemiBold', fontWeight: '600', fontSize: typography.size.md, color: colors.white },
  rerollBtn: {
    backgroundColor: colors.bgHighlight, borderRadius: radius.md,
    paddingVertical: spacing.md, paddingHorizontal: spacing.lg, alignItems: 'center',
  },
  rerollBtnText: { fontFamily: 'DMSans-SemiBold', fontWeight: '600', fontSize: typography.size.md, color: colors.textSecondary },

  section: { marginBottom: spacing.xl },
  emptyText: { fontFamily: 'DMSans-Regular', fontSize: typography.size.sm, color: colors.textMuted },

  historyCard: {
    backgroundColor: colors.bgSurface, borderRadius: radius.md, borderWidth: 1,
    borderColor: colors.glassBorder, padding: spacing.md, marginBottom: spacing.sm,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  historyWinner: { fontFamily: 'Oswald-Bold', fontWeight: '700', fontSize: typography.size.lg, color: colors.online },
  historyTime: { fontFamily: 'JetBrainsMono-Regular', fontSize: typography.size.xs, color: colors.textMuted },

  errorBanner: {
    backgroundColor: 'rgba(255, 69, 58, 0.15)',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 58, 0.4)',
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  errorText: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: typography.size.xs,
    color: colors.error,
  },
});
