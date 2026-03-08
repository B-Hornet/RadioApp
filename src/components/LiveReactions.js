import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
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
  setDoc,
  increment,
} from 'firebase/firestore';
import { colors, spacing, fonts, borderRadius } from '../theme';

const REACTIONS = [
  { id: 'fire', emoji: '\uD83D\uDD25', label: 'Fire' },
  { id: 'heart', emoji: '\u2764\uFE0F', label: 'Love' },
  { id: 'clap', emoji: '\uD83D\uDC4F', label: 'Clap' },
  { id: 'hundred', emoji: '\uD83D\uDCAF', label: '100' },
];

const FloatingEmoji = ({ emoji, onComplete }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value((Math.random() - 0.5) * 60)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -200,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 2000,
        useNativeDriver: true,
      }),
    ]).start(() => onComplete());
  }, []);

  return (
    <Animated.Text
      style={[
        styles.floatingEmoji,
        {
          transform: [{ translateY }, { translateX }],
          opacity,
        },
      ]}
    >
      {emoji}
    </Animated.Text>
  );
};

const LiveReactions = () => {
  const [floatingEmojis, setFloatingEmojis] = useState([]);
  const [reactionCounts, setReactionCounts] = useState({});
  const emojiIdRef = useRef(0);

  useEffect(() => {
    // Listen for latest reactions
    const reactionsQuery = query(
      collection(db, 'liveReactions'),
      orderBy('timestamp', 'desc'),
      limit(1)
    );
    const unsubReactions = onSnapshot(reactionsQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          if (data && data.emoji) {
            addFloatingEmoji(data.emoji);
          }
        }
      });
    });

    // Listen for reaction counts
    const countsRef = doc(db, 'appState', 'reactionCounts');
    const unsubCounts = onSnapshot(countsRef, (docSnap) => {
      if (docSnap.exists()) {
        setReactionCounts(docSnap.data());
      }
    });

    return () => {
      unsubReactions();
      unsubCounts();
    };
  }, []);

  const addFloatingEmoji = (emoji) => {
    const id = emojiIdRef.current++;
    setFloatingEmojis((prev) => [...prev.slice(-15), { id, emoji }]);
  };

  const removeFloatingEmoji = (id) => {
    setFloatingEmojis((prev) => prev.filter((e) => e.id !== id));
  };

  const sendReaction = async (reaction) => {
    await addDoc(collection(db, 'liveReactions'), {
      emoji: reaction.emoji,
      reactionId: reaction.id,
      timestamp: serverTimestamp(),
    });

    // Update counts
    const countsRef = doc(db, 'appState', 'reactionCounts');
    await setDoc(countsRef, { [reaction.id]: increment(1) }, { merge: true });

    addFloatingEmoji(reaction.emoji);
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Floating emojis overlay */}
      <View style={styles.floatingContainer} pointerEvents="none">
        {floatingEmojis.map((item) => (
          <FloatingEmoji
            key={item.id}
            emoji={item.emoji}
            onComplete={() => removeFloatingEmoji(item.id)}
          />
        ))}
      </View>

      {/* Reaction buttons bar */}
      <View style={styles.reactionsBar}>
        {REACTIONS.map((reaction) => (
          <TouchableOpacity
            key={reaction.id}
            style={styles.reactionButton}
            onPress={() => sendReaction(reaction)}
            activeOpacity={0.7}
          >
            <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
            {reactionCounts[reaction.id] > 0 && (
              <Text style={styles.reactionCount}>
                {reactionCounts[reaction.id]}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  floatingContainer: {
    position: 'absolute',
    bottom: 70,
    right: 20,
    width: 80,
    height: 250,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  floatingEmoji: {
    fontSize: 32,
    position: 'absolute',
    bottom: 0,
  },
  reactionsBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  reactionButton: {
    alignItems: 'center',
    marginHorizontal: spacing.md,
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceLight,
    minWidth: 56,
  },
  reactionEmoji: {
    fontSize: 24,
  },
  reactionCount: {
    color: colors.textMuted,
    fontSize: fonts.sizes.xs,
    marginTop: 2,
  },
});

export default LiveReactions;
