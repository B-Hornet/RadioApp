/**
 * ChatRoom — "Talkback" Live Chat
 * ═══════════════════════════════════════
 * Redesigned as a studio talkback channel.
 * Features:
 *   - Glass-panel message bubbles
 *   - DJ messages get orange accent + badge
 *   - Color-coded usernames
 *   - Animated message entrance
 *   - Glass input bar with orange send button
 *
 * TODO: Connect to existing Firebase Firestore real-time stream
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  StatusBar,
} from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radius, layout } from '../theme/tokens';
import Glass from '../components/Glass';
import LiveBadge from '../components/LiveBadge';
import ListenerPill from '../components/ListenerPill';

// ── Message bubble ─────────────────────────────────────────
const ChatBubble = ({ item, index }) => {
  const isDJ = item.dj;

  return (
    <Animated.View entering={FadeInUp.delay(index * 40).duration(250)}>
      <Glass
        style={styles.bubble}
        accent={isDJ}
      >
        {/* Username row */}
        <View style={styles.bubbleHeader}>
          <Text style={[styles.username, { color: isDJ ? colors.primary : (item.color || colors.textSecondary) }]}>
            {item.user}
          </Text>
          {isDJ && (
            <View style={styles.djBadge}>
              <Text style={styles.djBadgeText}>DJ</Text>
            </View>
          )}
          <Text style={styles.timestamp}>{item.time}</Text>
        </View>

        {/* Message text */}
        <Text style={styles.messageText}>{item.msg}</Text>
      </Glass>
    </Animated.View>
  );
};

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

export default function ChatRoom({ navigation, route }) {
  const [message, setMessage] = useState('');
  const flatListRef = useRef(null);

  // TODO: Replace with Firestore snapshots listener
  // Use your existing _setupMessageStream() pattern but with session boundary
  const [messages] = useState([
    { id: '1', user: 'DJ Shadow', msg: 'Welcome to Midnight Frequencies, fam 🔥', dj: true, time: '10:02' },
    { id: '2', user: 'Neon_Kid', msg: 'This track is insane', color: '#FF6B9D', time: '10:03' },
    { id: '3', user: 'BassDrop99', msg: 'Can we get some garage next?', color: '#6B9DFF', time: '10:03' },
    { id: '4', user: 'LunaVibes', msg: 'First time tuning in, this station is everything', color: '#9DFF6B', time: '10:04' },
    { id: '5', user: 'DJ Shadow', msg: 'Garage coming up after this one 🎧', dj: true, time: '10:04' },
    { id: '6', user: 'VinylJunkie', msg: 'The mix on this transition though 👏', color: '#FFD16B', time: '10:05' },
    { id: '7', user: 'MidnightOwl', msg: 'Vibes are immaculate tonight', color: '#D16BFF', time: '10:05' },
    { id: '8', user: 'Neon_Kid', msg: 'LETS GOOOO', color: '#FF6B9D', time: '10:06' },
  ]);

  const handleSend = useCallback(() => {
    if (!message.trim()) return;
    // TODO: Send to Firestore
    // FirebaseFirestore.instance.collection('streams').doc(streamId).collection('chat').add({...})
    setMessage('');
  }, [message]);

  const renderMessage = useCallback(({ item, index }) => (
    <ChatBubble item={item} index={index} />
  ), []);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bgDeep} />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {/* ── Header ─────────────────────────────────── */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>TALKBACK</Text>
              <Text style={styles.headerSub}>Live Chat • Midnight Frequencies</Text>
            </View>
            <View style={styles.headerBadges}>
              <LiveBadge size="sm" />
              <ListenerPill count="48" />
            </View>
          </View>

          {/* ── Messages ───────────────────────────────── */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
            inverted={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />

          {/* ── Input Bar ──────────────────────────────── */}
          <View style={styles.inputWrapper}>
            <Glass style={styles.inputGlass}>
              <TextInput
                style={styles.input}
                placeholder="Say something..."
                placeholderTextColor={colors.textMuted}
                value={message}
                onChangeText={setMessage}
                onSubmitEditing={handleSend}
                returnKeyType="send"
                textAlign="left" // NEVER use TextAlign.justify — see chat-system-rules
              />
              <Pressable
                onPress={handleSend}
                style={[styles.sendButton, !message.trim() && styles.sendDisabled]}
                disabled={!message.trim()}
              >
                <Text style={styles.sendIcon}>↑</Text>
              </Pressable>
            </Glass>
          </View>
        </KeyboardAvoidingView>
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
  flex: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screen,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  headerTitle: {
    fontFamily: 'Oswald-Bold',
    fontWeight: '700',
    fontSize: typography.size.xl,
    color: colors.textPrimary,
    letterSpacing: 1,
  },
  headerSub: {
    fontFamily: 'JetBrainsMono-Regular',
    fontWeight: '400',
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  headerBadges: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  // Messages
  messageList: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },

  // Bubble
  bubble: {
    padding: spacing.md,
    paddingHorizontal: 14,
    marginBottom: spacing.sm,
  },
  bubbleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  username: {
    fontFamily: 'DMSans-Bold',
    fontWeight: '700',
    fontSize: typography.size.sm,
  },
  djBadge: {
    paddingHorizontal: 6,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.3)',
    borderRadius: radius.full,
  },
  djBadgeText: {
    fontFamily: 'JetBrainsMono-Regular',
    fontWeight: '400',
    fontSize: 8,
    color: colors.primary,
    letterSpacing: 1,
  },
  timestamp: {
    fontFamily: 'JetBrainsMono-Regular',
    fontWeight: '400',
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginLeft: 'auto',
  },
  messageText: {
    fontFamily: 'DMSans-Regular',
    fontWeight: '400',
    fontSize: typography.size.md,
    color: colors.textPrimary,
    lineHeight: typography.size.md * typography.lineHeight.relaxed,
    textAlign: 'left', // NEVER justify — Rule 1 from chat-system-rules
  },

  // Input
  inputWrapper: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.lg,
    marginBottom: layout.inputBottomMargin, // clears NavDock
  },
  inputGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing.lg,
    paddingRight: spacing.xs,
    paddingVertical: spacing.xs,
  },
  input: {
    flex: 1,
    fontFamily: 'DMSans-Regular',
    fontWeight: '400',
    fontSize: typography.size.md,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
    textAlign: 'left', // NEVER justify
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: {
    opacity: 0.4,
  },
  sendIcon: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '700',
  },
});
