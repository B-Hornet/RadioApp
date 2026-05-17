/**
 * RequestManager — Song request queue management
 * ═════════════════════════════════════════════════
 * Approve/deny/pin requests, clear queue.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { db } from '../../firebaseConfig';
import {
  collection,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { colors, typography, spacing, radius } from '../../theme/tokens';

export default function RequestManager() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'songRequests'), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.votes || 0) - (a.votes || 0));
      setRequests(list);
      setLoading(false);
      setError(null);
    }, (err) => {
      setLoading(false);
      setError(err.message);
    });
    return () => unsub();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, 'songRequests', id), { status });
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const removeRequest = async (id) => {
    try {
      await deleteDoc(doc(db, 'songRequests', id));
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const clearAll = () => {
    Alert.alert('Clear All', 'Remove all song requests?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          try {
            const snap = await getDocs(collection(db, 'songRequests'));
            const batch = writeBatch(db);
            snap.docs.forEach((d) => batch.delete(d.ref));
            await batch.commit();
          } catch (e) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  };

  if (loading) {
    return <ActivityIndicator color={colors.primary} style={{ flex: 1, justifyContent: 'center' }} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText} numberOfLines={2}>{error}</Text>
        </View>
      ) : null}
      <View style={styles.topRow}>
        <Text style={styles.count}>{requests.length} requests</Text>
        {requests.length > 0 && (
          <Pressable style={styles.clearBtn} onPress={clearAll}>
            <Text style={styles.clearBtnText}>Clear All</Text>
          </Pressable>
        )}
      </View>

      {requests.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No song requests</Text>
        </View>
      ) : (
        requests.map((req) => (
          <View key={req.id} style={[styles.card, req.status === 'playing' && styles.cardPlaying]}>
            <View style={styles.info}>
              <Text style={styles.song}>{req.songTitle}</Text>
              {req.artistName ? <Text style={styles.artist}>{req.artistName}</Text> : null}
              <Text style={styles.meta}>
                by {req.requesterName || 'Anonymous'} · {req.votes || 0} votes
              </Text>
            </View>
            <View style={styles.actions}>
              <Pressable
                style={[styles.actionBtn, req.status === 'playing' && styles.actionBtnActive]}
                onPress={() => updateStatus(req.id, req.status === 'playing' ? 'pending' : 'playing')}
              >
                <Text style={styles.actionBtnText}>{req.status === 'playing' ? 'ON AIR' : 'Play'}</Text>
              </Pressable>
              <Pressable
                style={[styles.actionBtn, styles.actionBtnQueue]}
                onPress={() => updateStatus(req.id, 'queued')}
              >
                <Text style={styles.actionBtnText}>Queue</Text>
              </Pressable>
              <Pressable
                style={[styles.actionBtn, styles.actionBtnDeny]}
                onPress={() => removeRequest(req.id)}
              >
                <Text style={styles.actionBtnTextDeny}>X</Text>
              </Pressable>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.screen, paddingBottom: 140 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  count: { fontFamily: 'JetBrainsMono-Regular', fontSize: typography.size.sm, color: colors.textMuted },
  clearBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.sm, backgroundColor: 'rgba(255, 69, 58, 0.15)' },
  clearBtnText: { fontFamily: 'DMSans-SemiBold', fontSize: 10, color: colors.error },

  card: {
    backgroundColor: colors.bgSurface, borderRadius: radius.md, borderWidth: 1,
    borderColor: colors.glassBorder, padding: spacing.md, marginBottom: spacing.sm,
  },
  cardPlaying: { borderColor: colors.online },
  info: { marginBottom: spacing.sm },
  song: { fontFamily: 'Oswald-Bold', fontWeight: '700', fontSize: typography.size.lg, color: colors.textPrimary },
  artist: { fontFamily: 'DMSans-Regular', fontSize: typography.size.sm, color: colors.textSecondary, marginTop: 2 },
  meta: { fontFamily: 'JetBrainsMono-Regular', fontSize: typography.size.xs, color: colors.textMuted, marginTop: 4 },

  actions: { flexDirection: 'row', gap: spacing.xs },
  actionBtn: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.sm,
    backgroundColor: colors.bgHighlight,
  },
  actionBtnActive: { backgroundColor: colors.online },
  actionBtnQueue: { backgroundColor: 'rgba(255, 214, 10, 0.15)' },
  actionBtnDeny: { backgroundColor: 'rgba(255, 69, 58, 0.15)' },
  actionBtnText: { fontFamily: 'DMSans-SemiBold', fontSize: 10, color: colors.textPrimary },
  actionBtnTextDeny: { fontFamily: 'DMSans-SemiBold', fontSize: 10, color: colors.error },

  empty: { paddingVertical: spacing.xxl, alignItems: 'center' },
  emptyText: { fontFamily: 'DMSans-Regular', fontSize: typography.size.md, color: colors.textMuted },

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
