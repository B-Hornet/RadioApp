/**
 * NavDock — Bottom navigation dock
 * ═════════════════════════════════════
 * Icon-based navigation with active indicator.
 * Replaces the old card-based hub navigation.
 *
 * Usage:
 *   <NavDock activeRoute={currentRoute} onNavigate={handleNav} />
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { colors, typography, radius, layout } from '../theme/tokens';

const NAV_ITEMS = [
  { route: 'Hub', icon: '⬡', label: 'Hub' },
  { route: 'RadioPlayer', icon: '◉', label: 'Player' },
  { route: 'ChatRoom', icon: '◫', label: 'Chat' },
  { route: 'DJSchedule', icon: '☰', label: 'Schedule' },
  { route: 'ListenerProfile', icon: '◎', label: 'Profile' },
];

const NavItem = ({ item, isActive, onPress }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.85, {}, () => {
      scale.value = withSpring(1);
    });
    onPress(item.route);
  };

  return (
    <Pressable onPress={handlePress} style={styles.item}>
      <Animated.View style={[styles.itemInner, animatedStyle]}>
        <Text
          style={[
            styles.icon,
            isActive && styles.iconActive,
          ]}
        >
          {item.icon}
        </Text>
        <Text
          style={[
            styles.label,
            isActive && styles.labelActive,
          ]}
        >
          {item.label}
        </Text>
        {isActive && <View style={styles.indicator} />}
      </Animated.View>
    </Pressable>
  );
};

export default function NavDock({ activeRoute, onNavigate }) {
  return (
    <View style={styles.dock}>
      {NAV_ITEMS.map((item) => (
        <NavItem
          key={item.route}
          item={item}
          isActive={activeRoute === item.route}
          onPress={onNavigate}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: layout.navDockHeight,
    backgroundColor: 'rgba(8, 8, 12, 0.95)',
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    zIndex: 100,
  },
  item: {
    flex: 1,
    alignItems: 'center',
  },
  itemInner: {
    alignItems: 'center',
    paddingVertical: 6, // optical: between xs(4) and sm(8)
    paddingHorizontal: 12,
    gap: 3,
  },
  icon: {
    fontSize: 20,
    color: colors.textMuted,
  },
  iconActive: {
    color: colors.primary,
    // glow effect handled by shadow on the container if needed
  },
  label: {
    fontFamily: 'DMSans-Regular',
    fontWeight: '400',
    fontSize: 9,
    color: colors.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  labelActive: {
    fontFamily: 'DMSans-SemiBold',
    fontWeight: '600',
    color: colors.primary,
  },
  indicator: {
    width: 16,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 2,
    marginTop: -1,
  },
});
