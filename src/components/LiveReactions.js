import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { database } from '../firebaseConfig';
import { ref, push, onValue, serverTimestamp, query, limitToLast } from 'firebase/database';
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
    const reactionsRef = query(ref(database, 'liveReactions'), limitToLast(1));
    const unsubscribe = onValue(reactionsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const latestKey = Object.keys(data).pop();
        const reaction = data[latestKey];
        if (reaction && reaction.emoji) {
          addFloatingEmoji(reaction.emoji);
        }
      }
    });

    const countsRef = ref(database, 'reactionCounts');
    const unsubCounts = onValue(countsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setReactionCounts(data);
      }
    });

    return () => {
      unsubscribe();
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

  const sendReaction = (reaction) => {
    const reactionsRef = ref(database, 'liveReactions');
    push(reactionsRef, {
      emoji: reaction.emoji,
      reactionId: reaction.id,
      timestamp: serverTimestamp(),
    });
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
