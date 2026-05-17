/**
 * ChatRoom — Production Live Chat
 * ═══════════════════════════════════
 * Firebase Firestore real-time chat with:
 *   - Hybrid auth: anonymous users read; only signed-in users post
 *     (rules enforce via isIdentified() in firestore.rules)
 *   - Username = Firebase displayName for signed-in listeners
 *   - Own-message right-alignment
 *   - DJ badge detection
 *   - Real listener count from Firestore
 *   - Inverted FlatList: newest at the visible bottom, virtualized
 *   - Animated LIVE pulse (RN Animated, no Reanimated)
 */

import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
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
  Animated,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db, auth } from '../firebaseConfig';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
  doc,
} from 'firebase/firestore';
import { colors, typography, spacing, radius, layout } from '../theme/tokens';
import { CHATROOM_ID, CHAT_COLORS, MESSAGE_LIMIT } from '../constants';
import useListenerAuth from '../hooks/useListenerAuth';
import ListenerAuthModal from '../components/ListenerAuthModal';

// ── Helpers ──────────────────────────────────────────────────
const getColorForUser = (username) => {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CHAT_COLORS[Math.abs(hash) % CHAT_COLORS.length];
};

const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const DJ_NAMES = ['DJ Shadow', 'DJ Reeboot', 'DJ Pulse', 'MC Vortex', 'Luna Wave'];

// ── LIVE Pulse Dot ───────────────────────────────────────────
const LivePulseDot = () => {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.4, duration: 750, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 750, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  return <Animated.View style={[styles.liveDot, { opacity }]} />;
};

// ── Chat Bubble ──────────────────────────────────────────────
// Memoized — FlatList passes a stable item per row, so identical
// messages don't re-render on scroll or new arrivals. Cuts paint
// cost on long histories from O(n) per scroll tick to O(visible).
const ChatBubble = memo(function ChatBubble({ item, isOwn }) {
  const isDJ = item.role === 'dj' || DJ_NAMES.includes(item.username);
  const userColor = getColorForUser(item.username || 'anon');

  return (
    <View style={[styles.bubbleRow, isOwn && styles.bubbleRowOwn]}>
      <View style={[
        styles.bubble,
        isOwn ? styles.bubbleOwn : (isDJ ? styles.bubbleAccent : styles.bubbleOther),
      ]}>
        {!isOwn && (
          <View style={styles.bubbleHeader}>
            <Text style={[styles.username, { color: isDJ ? colors.primary : userColor }]}>
              {item.username}
            </Text>
            {isDJ && (
              <View style={styles.djBadge}>
                <Text style={styles.djBadgeText}>DJ</Text>
              </View>
            )}
          </View>
        )}
        <Text style={[styles.messageText, isOwn && styles.messageTextOwn]}>{item.text}</Text>
        <Text style={[styles.timestamp, isOwn && styles.timestampOwn]}>
          {formatTime(item.timestamp)}
        </Text>
      </View>
    </View>
  );
});

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function ChatRoom({ navigation, route }) {
  const {
    user,
    isAnonymous,
    isSignedIn,
    displayName,
    authError,
    signIn,
    signUp,
    clearError,
  } = useListenerAuth();
  const [messages, setMessages] = useState([]);
  const [listenerCount, setListenerCount] = useState(0);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // The username shown next to your messages and used to color
  // your bubble. For signed-in users it's their Firebase displayName;
  // anonymous users can't post anyway, so a sane fallback is fine.
  const username = displayName || 'Listener';

  // Firebase listeners — start as soon as we have any auth context
  // (including the anonymous bootstrap from App.js).
  useEffect(() => {
    if (!user) return;

    setIsLoading(true);

    // Messages listener
    let unsubMessages = () => {};
    let unsubListeners = () => {};

    try {
      // Newest first to match an inverted FlatList: index 0 of the
      // data array maps to the visible bottom of the list. Prepending
      // a new message keeps the user's scroll position stable
      // automatically — no manual scrollToEnd needed.
      const messagesQuery = query(
        collection(db, 'Messages'),
        orderBy('timestamp', 'desc'),
        limit(MESSAGE_LIMIT),
      );
      unsubMessages = onSnapshot(
        messagesQuery,
        (snapshot) => {
          const list = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            timestamp: d.data().timestamp?.toMillis?.() || null,
          }));
          setMessages(list);
          setIsLoading(false);
        },
        (error) => {
          console.error('Messages listener error:', error.message);
          setIsLoading(false);
          // Still show chat even if history fails to load
        },
      );
    } catch (e) {
      console.error('Messages query setup error:', e.message);
      setIsLoading(false);
    }

    // Listener count
    try {
      const chatroomRef = doc(db, 'Chatrooms', CHATROOM_ID);
      unsubListeners = onSnapshot(
        chatroomRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            const members = data.members;
            setListenerCount(
              Array.isArray(members) ? members.length : (typeof members === 'number' ? members : 0),
            );
          }
        },
        (error) => {
          // Chatroom doc may not exist yet — that's OK
          console.warn('Listener count unavailable:', error.message);
        },
      );
    } catch (e) {
      console.warn('Listener count setup error:', e.message);
    }

    return () => {
      unsubMessages();
      unsubListeners();
    };
  }, [username]);

  // FlatList renderItem — declared at component scope and memoized
  // by useCallback on `username` so its identity stays stable across
  // re-renders. FlatList uses identity to skip row work.
  const renderItem = useCallback(({ item }) => (
    <ChatBubble item={item} isOwn={item.username === username} />
  ), [username]);

  const keyExtractor = useCallback((item) => item.id, []);

  // Send message — requires a non-anonymous Firebase identity. The
  // Firestore rule (Messages.create with isIdentified()) is the
  // authoritative gate; the UI gate just keeps anonymous users from
  // seeing a confusing permission-denied error.
  const handleSend = useCallback(async () => {
    if (!message.trim() || isSending) return;
    if (!isSignedIn) {
      setShowAuthModal(true);
      return;
    }
    setIsSending(true);
    try {
      const uid = auth.currentUser?.uid;
      await addDoc(collection(db, 'Messages'), {
        uid,
        text: message.trim(),
        username,
        role: 'listener',
        timestamp: serverTimestamp(),
        chatroomId: CHATROOM_ID,
        type: 'message',
      });
      setMessage('');
    } catch (error) {
      console.error('Send message error:', error);
      Alert.alert('Send Failed', 'Could not send your message. Please try again.');
    } finally {
      setIsSending(false);
    }
  }, [message, isSending, isSignedIn, username]);

  // Wait for the anonymous bootstrap or restored auth session before
  // mounting the chat. Without this we'd briefly run as null and the
  // listeners would fail.
  if (!user) {
    return (
      <View style={[styles.screen, styles.center]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bgDeep} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>TALKBACK</Text>
              <Text style={styles.headerSub}>Live Chat</Text>
            </View>
            <View style={styles.headerBadges}>
              <View style={styles.livePill}>
                <LivePulseDot />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
              <View style={styles.listenerPill}>
                <View style={styles.listenerDot} />
                <Text style={styles.listenerCount}>
                  {listenerCount || '—'}
                </Text>
              </View>
            </View>
          </View>

          {/* Messages */}
          {isLoading ? (
            <View style={[styles.flex, styles.center]}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading messages...</Text>
            </View>
          ) : messages.length === 0 ? (
            <View style={[styles.flex, styles.emptyState]}>
              <Text style={styles.emptyEmoji}>💬</Text>
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySub}>Be the first to say something!</Text>
            </View>
          ) : (
            <FlatList
              data={messages}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              inverted
              contentContainerStyle={styles.messageList}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              initialNumToRender={20}
              maxToRenderPerBatch={20}
              windowSize={11}
              removeClippedSubviews
            />
          )}

          {/* Input Bar — locked to a Sign In CTA for anonymous users */}
          <View style={styles.inputWrapper}>
            {isAnonymous ? (
              <Pressable
                onPress={() => setShowAuthModal(true)}
                style={styles.signInCta}
              >
                <Text style={styles.signInCtaText}>Sign in to join the chat</Text>
                <Text style={styles.signInCtaSub}>
                  You can keep reading and reacting without an account.
                </Text>
              </Pressable>
            ) : (
              <View style={styles.inputBar}>
                <TextInput
                  style={styles.input}
                  placeholder="Say something..."
                  placeholderTextColor={colors.textMuted}
                  value={message}
                  onChangeText={setMessage}
                  onSubmitEditing={handleSend}
                  returnKeyType="send"
                  editable={!isSending}
                />
                <Pressable
                  onPress={handleSend}
                  style={[styles.sendButton, (!message.trim() || isSending) && styles.sendDisabled]}
                  disabled={!message.trim() || isSending}
                >
                  <Text style={styles.sendIcon}>↑</Text>
                </Pressable>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <ListenerAuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSignIn={signIn}
        onSignUp={signUp}
        authError={authError}
        clearError={clearError}
      />
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bgDeep },
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center' },

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.screen, paddingVertical: spacing.lg,
    borderBottomWidth: 1, borderBottomColor: colors.glassBorder,
  },
  headerTitle: {
    fontFamily: 'Oswald-Bold', fontWeight: '700',
    fontSize: typography.size.xl, color: colors.textPrimary, letterSpacing: 1,
  },
  headerSub: {
    fontFamily: 'JetBrainsMono-Regular', fontWeight: '400',
    fontSize: typography.size.xs, color: colors.textMuted, marginTop: spacing.xs,
  },
  headerBadges: { flexDirection: 'row', gap: spacing.sm },

  // Badges
  livePill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3,
    backgroundColor: colors.liveBg, borderWidth: 1,
    borderColor: colors.liveBorder, borderRadius: radius.full,
  },
  liveDot: {
    width: 5, height: 5, borderRadius: 2.5, backgroundColor: colors.live,
  },
  liveText: {
    fontFamily: 'Oswald-SemiBold', fontWeight: '600',
    fontSize: 9, color: colors.live, letterSpacing: 1.5,
  },
  listenerPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: spacing.xs,
    backgroundColor: colors.onlineBg, borderWidth: 1,
    borderColor: colors.onlineBorder, borderRadius: radius.full,
  },
  listenerDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: colors.online },
  listenerCount: {
    fontFamily: 'JetBrainsMono-Medium', fontWeight: '500',
    fontSize: typography.size.xs, color: colors.online,
  },

  // Messages
  messageList: {
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
  },
  loadingText: {
    fontFamily: 'DMSans-Regular', fontWeight: '400',
    color: colors.textMuted, fontSize: typography.size.sm, marginTop: spacing.md,
  },

  // Bubbles
  bubbleRow: {
    flexDirection: 'row', justifyContent: 'flex-start', marginBottom: spacing.sm,
  },
  bubbleRowOwn: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '80%', paddingVertical: spacing.sm, paddingHorizontal: spacing.md,
    borderRadius: radius.lg, overflow: 'hidden',
  },
  bubbleOther: {
    backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.glassBorder,
    borderTopLeftRadius: radius.sm,
  },
  bubbleOwn: {
    backgroundColor: colors.primarySubtle, borderWidth: 1,
    borderColor: colors.primaryBorder, borderTopRightRadius: radius.sm,
  },
  bubbleAccent: {
    backgroundColor: colors.glassAccent, borderWidth: 1,
    borderColor: colors.glassAccentBorder, borderTopLeftRadius: radius.sm,
  },
  bubbleHeader: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs,
  },
  username: { fontFamily: 'DMSans-Bold', fontWeight: '700', fontSize: typography.size.sm },
  djBadge: {
    paddingHorizontal: 6, paddingVertical: 2,
    borderWidth: 1, borderColor: 'rgba(255, 107, 0, 0.3)', borderRadius: radius.full,
  },
  djBadgeText: {
    fontFamily: 'JetBrainsMono-Regular', fontWeight: '400',
    fontSize: 8, color: colors.primary, letterSpacing: 1,
  },
  messageText: {
    fontFamily: 'DMSans-Regular', fontWeight: '400',
    fontSize: typography.size.md, color: colors.textPrimary,
    lineHeight: typography.size.md * typography.lineHeight.relaxed, textAlign: 'left',
  },
  messageTextOwn: {
    color: '#F0EDE8',
  },
  timestamp: {
    fontFamily: 'JetBrainsMono-Regular', fontWeight: '400',
    fontSize: 9, color: colors.textMuted, marginTop: spacing.xs,
  },
  timestampOwn: {
    textAlign: 'right',
  },

  // Empty state
  emptyState: { alignItems: 'center', paddingVertical: spacing.section },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyText: {
    fontFamily: 'DMSans-SemiBold', fontWeight: '600',
    fontSize: typography.size.lg, color: colors.textSecondary,
  },
  emptySub: {
    fontFamily: 'DMSans-Regular', fontWeight: '400',
    fontSize: typography.size.sm, color: colors.textMuted, marginTop: spacing.xs,
  },

  // Input bar
  inputWrapper: {
    paddingHorizontal: spacing.lg, paddingTop: spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.lg,
    marginBottom: layout.inputBottomMargin,
    borderTopWidth: 1, borderTopColor: colors.glassBorder,
    backgroundColor: colors.bgDeep,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
  inputBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingLeft: spacing.lg, paddingRight: spacing.xs, paddingVertical: spacing.xs,
    backgroundColor: colors.glass, borderWidth: 1,
    borderColor: colors.glassBorder, borderRadius: radius.lg, overflow: 'hidden',
  },
  input: {
    flex: 1, fontFamily: 'DMSans-Regular', fontWeight: '400',
    fontSize: typography.size.md, color: colors.textPrimary, paddingVertical: spacing.sm,
  },
  sendButton: {
    width: 36, height: 36, borderRadius: radius.md,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  sendDisabled: { opacity: 0.4 },
  sendIcon: { fontSize: 14, color: colors.white, fontWeight: '700' },

  // Sign-in CTA — replaces the input bar for anonymous listeners.
  signInCta: {
    backgroundColor: colors.primarySubtle,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  signInCtaText: {
    fontFamily: 'Oswald-Bold',
    fontWeight: '700',
    fontSize: typography.size.md,
    color: colors.primary,
    letterSpacing: 1,
  },
  signInCtaSub: {
    fontFamily: 'DMSans-Regular',
    fontWeight: '400',
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
