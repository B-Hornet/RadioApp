import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { db } from '../firebaseConfig';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
  doc,
  getDoc,
} from 'firebase/firestore';
import { colors, spacing, fonts, borderRadius } from '../theme';

// Default chatroom ID — uses the first Chatroom or creates messages in a default room
const CHATROOM_ID = 'reebootlive';

const CHAT_COLORS = [
  '#FF6B00', '#1DB954', '#FF3B5C', '#FFD60A',
  '#00D4FF', '#A855F7', '#F97316', '#14B8A6',
];

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

const ChatRoom = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [username, setUsername] = useState('');
  const [isUsernameSet, setIsUsernameSet] = useState(false);
  const [listenerCount, setListenerCount] = useState(0);
  const flatListRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (!isUsernameSet) return;

    // Listen to Messages collection, ordered by timestamp, last 100
    const messagesQuery = query(
      collection(db, 'Messages'),
      orderBy('timestamp', 'asc'),
      limit(100)
    );
    const unsubMessages = onSnapshot(messagesQuery, (snapshot) => {
      const messageList = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
        timestamp: docSnap.data().timestamp?.toMillis?.() || null,
      }));
      setMessages(messageList);
    });

    // Listen to active listeners count from Chatrooms doc
    const chatroomRef = doc(db, 'Chatrooms', CHATROOM_ID);
    const unsubListeners = onSnapshot(chatroomRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const members = data.members;
        setListenerCount(
          Array.isArray(members) ? members.length : (typeof members === 'number' ? members : 0)
        );
      }
    });

    return () => {
      unsubMessages();
      unsubListeners();
    };
  }, [isUsernameSet]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    await addDoc(collection(db, 'Messages'), {
      text: inputText.trim(),
      username: username,
      timestamp: serverTimestamp(),
      chatroomId: CHATROOM_ID,
      type: 'message',
    });

    setInputText('');
  };

  const handleSetUsername = () => {
    if (username.trim().length >= 2) {
      setIsUsernameSet(true);
    }
  };

  if (!isUsernameSet) {
    return (
      <Animated.View style={[styles.usernameContainer, { opacity: fadeAnim }]}>
        <View style={styles.usernameCard}>
          <Text style={styles.usernameTitle}>Join the Chat</Text>
          <Text style={styles.usernameSubtitle}>
            Connect with other listeners during the live set
          </Text>
          <TextInput
            style={styles.usernameInput}
            placeholder="Choose a display name..."
            placeholderTextColor={colors.textMuted}
            value={username}
            onChangeText={setUsername}
            maxLength={20}
            autoCapitalize="none"
            onSubmitEditing={handleSetUsername}
          />
          <TouchableOpacity
            style={[
              styles.joinButton,
              username.trim().length < 2 && styles.joinButtonDisabled,
            ]}
            onPress={handleSetUsername}
            disabled={username.trim().length < 2}
          >
            <Text style={styles.joinButtonText}>Enter Chat Room</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }

  const renderMessage = ({ item }) => {
    const isOwnMessage = item.username === username;
    const userColor = getColorForUser(item.username);

    return (
      <View style={[styles.messageRow, isOwnMessage && styles.messageRowOwn]}>
        <View
          style={[
            styles.messageBubble,
            isOwnMessage ? styles.messageBubbleOwn : styles.messageBubbleOther,
          ]}
        >
          {!isOwnMessage && (
            <Text style={[styles.messageUsername, { color: userColor }]}>
              {item.username}
            </Text>
          )}
          <Text style={styles.messageText}>{item.text}</Text>
          <Text style={styles.messageTime}>{formatTime(item.timestamp)}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Live indicator bar */}
      <View style={styles.liveBar}>
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE CHAT</Text>
        </View>
        <Text style={styles.listenerCount}>
          {listenerCount} listener{listenerCount !== 1 ? 's' : ''} online
        </Text>
      </View>

      {/* Messages list */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Input bar */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Say something..."
          placeholderTextColor={colors.textMuted}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={sendMessage}
          returnKeyType="send"
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!inputText.trim()}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // Username entry screen
  usernameContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  usernameCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  usernameTitle: {
    fontSize: fonts.sizes.xxl,
    fontWeight: fonts.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  usernameSubtitle: {
    fontSize: fonts.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  usernameInput: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fonts.sizes.lg,
    color: colors.textPrimary,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  joinButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    width: '100%',
    alignItems: 'center',
  },
  joinButtonDisabled: {
    opacity: 0.4,
  },
  joinButtonText: {
    color: colors.textPrimary,
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.bold,
  },
  // Live bar
  liveBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.live,
    marginRight: spacing.xs,
  },
  liveText: {
    color: colors.live,
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.bold,
    letterSpacing: 1,
  },
  listenerCount: {
    color: colors.textMuted,
    fontSize: fonts.sizes.sm,
  },
  // Messages
  messagesList: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    justifyContent: 'flex-start',
  },
  messageRowOwn: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '78%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  messageBubbleOwn: {
    backgroundColor: colors.chatBubbleOwn,
    borderBottomRightRadius: borderRadius.sm,
  },
  messageBubbleOther: {
    backgroundColor: colors.chatBubbleOther,
    borderBottomLeftRadius: borderRadius.sm,
  },
  messageUsername: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.bold,
    marginBottom: 2,
  },
  messageText: {
    color: colors.textPrimary,
    fontSize: fonts.sizes.md,
    lineHeight: 20,
  },
  messageTime: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: fonts.sizes.xs,
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  // Input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.chatInput,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
    fontSize: fonts.sizes.md,
    borderWidth: 1,
    borderColor: colors.chatBorder,
    marginRight: spacing.sm,
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendButtonText: {
    color: colors.textPrimary,
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.bold,
  },
});

export default ChatRoom;
