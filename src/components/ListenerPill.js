/**
 * ListenerPill — Online listener count indicator
 * ════════════════════════════════════════════════
 * Green dot + count in a compact pill.
 *
 * Usage:
 *   <ListenerPill count={1247} />
 *   <ListenerPill count="48" />
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '../theme/tokens';

export default function ListenerPill({ count }) {
  const display = typeof count === 'number' ? count.toLocaleString() : count;

  return (
    <View style={styles.pill}>
      <View style={styles.dot} />
      <Text style={styles.count}>{display}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: spacing.xs,
    backgroundColor: colors.onlineBg,
    borderWidth: 1,
    borderColor: colors.onlineBorder,
    borderRadius: radius.full,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.online,
    shadowColor: colors.online,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 3,
    elevation: 2,
  },
  count: {
    fontFamily: 'JetBrainsMono-Medium',
    fontWeight: '500',
    fontSize: typography.size.xs,
    color: colors.online,
  },
});
