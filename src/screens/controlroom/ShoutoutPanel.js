/**
 * ShoutoutPanel — Broadcast messages to all listeners
 * ═════════════════════════════════════════════════════
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { db } from '../../firebaseConfig';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { colors, typography, spacing, radius } from '../../theme/tokens';

export default function ShoutoutPanel() {
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'shoutouts'), orderBy('createdAt', 'desc'), limit(20));
    const unsub = onSnapshot(q, (snap) => {
      setHistory(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setError(null);
    }, (err) => setError(err.message));
    return () => unsub();
  }, []);

  const sendShoutout = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      await addDoc(collection(db, 'shoutouts'), {
        message: message.trim(),
        type: 'shoutout',
        createdAt: serverTimestamp(),
      });
      setMessage('');
      Alert.alert('Sent!', 'Shoutout broadcast to all listeners.');
    } catch (e) {
      Alert.alert('Error', e.message);
    }
    setSending(false);
  };

  const formatTime = (ts) => {
    if (!ts?.toDate) return '';
    const d = ts.toDate();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText} numberOfLines={2}>{error}</Text>
        </View>
      ) : null}
      {/* Compose */}
      <View style={styles.compose}>
        <Text style={styles.label}>BROADCAST MESSAGE</Text>
        <TextInput
          style={styles.input}
          placeholder="Type your shoutout..."
          placeholderTextColor={colors.textMuted}
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={200}
        />
        <View style={styles.composeFooter}>
          <Text style={styles.charCount}>{message.length}/200</Text>
          <Pressable
            style={[styles.sendBtn, (!message.trim() || sending) && styles.sendBtnDisabled]}
            onPress={sendShoutout}
            disabled={!message.trim() || sending}
          >
            <Text style={styles.sendBtnText}>{sending ? 'Sending...' : 'Send Shoutout'}</Text>
          </Pressable>
        </View>
      </View>

      {/* Preview */}
      {message.trim() ? (
        <View style={styles.preview}>
          <Text style={styles.previewLabel}>PREVIEW</Text>
          <View style={styles.previewBanner}>
            <Text style={styles.previewText}>{message.trim()}</Text>
          </View>
        </View>
      ) : null}

      {/* History */}
      <View style={styles.section}>
        <Text style={styles.label}>HISTORY</Text>
        {history.length === 0 ? (
          <Text style={styles.emptyText}>No shoutouts sent yet</Text>
        ) : (
          history.map((item) => (
            <View key={item.id} style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <View style={[styles.typeBadge, item.type === 'giveaway' && styles.typeBadgeGiveaway]}>
                  <Text style={styles.typeBadgeText}>
                    {item.type === 'giveaway' ? 'GIVEAWAY' : 'SHOUTOUT'}
                  </Text>
                </View>
                <Text style={styles.historyTime}>{formatTime(item.createdAt)}</Text>
              </View>
              <Text style={styles.historyMessage}>{item.message}</Text>
              {item.winner && <Text style={styles.historyWinner}>Winner: {item.winner}</Text>}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.screen, paddingBottom: 140 },

  compose: { marginBottom: spacing.xl },
  label: {
    fontFamily: 'Oswald-Medium', fontWeight: '500', fontSize: typography.size.sm,
    color: colors.textMuted, letterSpacing: 2, marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.bgSurface, borderRadius: radius.md, borderWidth: 1,
    borderColor: colors.glassBorder, padding: spacing.md, color: colors.textPrimary,
    fontFamily: 'DMSans-Regular', fontSize: typography.size.md, minHeight: 80, textAlignVertical: 'top',
  },
  composeFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  charCount: { fontFamily: 'JetBrainsMono-Regular', fontSize: typography.size.xs, color: colors.textMuted },
  sendBtn: { backgroundColor: colors.primary, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.sm },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { fontFamily: 'DMSans-SemiBold', fontWeight: '600', fontSize: typography.size.sm, color: colors.white },

  preview: { marginBottom: spacing.xl },
  previewLabel: {
    fontFamily: 'JetBrainsMono-Regular', fontSize: typography.size.xs,
    color: colors.textMuted, letterSpacing: 1, marginBottom: spacing.sm,
  },
  previewBanner: {
    backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md,
  },
  previewText: { fontFamily: 'DMSans-SemiBold', fontWeight: '600', fontSize: typography.size.md, color: colors.white },

  section: { marginBottom: spacing.xl },
  emptyText: { fontFamily: 'DMSans-Regular', fontSize: typography.size.sm, color: colors.textMuted },

  historyCard: {
    backgroundColor: colors.bgSurface, borderRadius: radius.md, borderWidth: 1,
    borderColor: colors.glassBorder, padding: spacing.md, marginBottom: spacing.sm,
  },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  typeBadge: { backgroundColor: 'rgba(255, 107, 0, 0.15)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.sm },
  typeBadgeGiveaway: { backgroundColor: 'rgba(52, 208, 88, 0.15)' },
  typeBadgeText: { fontFamily: 'DMSans-SemiBold', fontSize: 9, color: colors.primary, letterSpacing: 0.5 },
  historyTime: { fontFamily: 'JetBrainsMono-Regular', fontSize: typography.size.xs, color: colors.textMuted },
  historyMessage: { fontFamily: 'DMSans-Regular', fontSize: typography.size.md, color: colors.textPrimary },
  historyWinner: { fontFamily: 'DMSans-SemiBold', fontSize: typography.size.sm, color: colors.online, marginTop: spacing.xs },

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
