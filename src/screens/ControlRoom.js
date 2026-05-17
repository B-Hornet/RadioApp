/**
 * ControlRoom — Owner-Only Admin Dashboard
 * ═══════════════════════════════════════════
 * Tab-based control center for managing the radio station.
 * Tabs: Schedule, Requests, Live Stats, Shoutouts, Giveaways
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radius } from '../theme/tokens';
import useOwnerAuth from '../hooks/useOwnerAuth';

import ScheduleManager from './controlroom/ScheduleManager';
import RequestManager from './controlroom/RequestManager';
import LiveDashboard from './controlroom/LiveDashboard';
import ShoutoutPanel from './controlroom/ShoutoutPanel';
import GiveawayPanel from './controlroom/GiveawayPanel';

const TABS = [
  { key: 'schedule', label: 'Schedule' },
  { key: 'requests', label: 'Requests' },
  { key: 'live', label: 'Live Stats' },
  { key: 'shoutouts', label: 'Shoutouts' },
  { key: 'giveaways', label: 'Giveaways' },
];

const TabBar = ({ activeTab, onTabChange }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.tabBar}
  >
    {TABS.map((tab) => (
      <Pressable
        key={tab.key}
        onPress={() => onTabChange(tab.key)}
        style={[styles.tab, activeTab === tab.key && styles.tabActive]}
      >
        <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
          {tab.label}
        </Text>
      </Pressable>
    ))}
  </ScrollView>
);

export default function ControlRoom({ navigation }) {
  const [activeTab, setActiveTab] = useState('schedule');
  const { isOwner, loading, logout, clearBiometricLogin } = useOwnerAuth();

  const handleSignOut = async () => {
    // Explicit Sign Out from ControlRoom = "this device is no longer
    // mine". Clear the Keychain creds so Face ID can't unlock owner
    // mode for the next person on the device. signOut fires
    // onAuthStateChanged(null) → the C8 guard below redirects to Hub.
    await clearBiometricLogin();
    await logout();
  };

  // Defense-in-depth gate. AppNavigator hides the dock entry but the
  // route is still registered, so a deep link or programmatic navigate
  // could land here. Server-side Firestore Rules are the real
  // protection (see firestore.rules); this just keeps the UI honest.
  useEffect(() => {
    if (!loading && !isOwner) {
      navigation?.replace?.('Hub');
    }
  }, [loading, isOwner, navigation]);

  if (loading || !isOwner) {
    return (
      <View style={[styles.screen, styles.center]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  // Keep every panel mounted so its Firestore listeners aren't torn
  // down + re-created on each tab swap. Inactive panels are hidden via
  // display: 'none' (free in RN — the subtree is skipped during layout).
  // This is what makes the per-panel listener cost flat instead of
  // O(tab-switches).
  const PANELS = [
    { key: 'schedule', node: <ScheduleManager /> },
    { key: 'requests', node: <RequestManager /> },
    { key: 'live', node: <LiveDashboard /> },
    { key: 'shoutouts', node: <ShoutoutPanel /> },
    { key: 'giveaways', node: <GiveawayPanel /> },
  ];

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bgDeep} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Animated.View entering={FadeIn.delay(100)} style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>CONTROL ROOM</Text>
            <Text style={styles.headerSub}>Station Management</Text>
          </View>
          <Pressable
            onPress={handleSignOut}
            style={styles.signOutBtn}
            hitSlop={8}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>
        </Animated.View>

        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

        <View style={styles.content}>
          {PANELS.map(({ key, node }) => (
            <View
              key={key}
              style={[styles.panel, activeTab !== key && styles.panelHidden]}
            >
              {node}
            </View>
          ))}
        </View>
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
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.screen,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  signOutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255, 69, 58, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 58, 0.3)',
  },
  signOutText: {
    fontFamily: 'DMSans-SemiBold',
    fontWeight: '600',
    fontSize: typography.size.xs,
    color: colors.error,
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontFamily: 'Oswald-Bold',
    fontWeight: '700',
    fontSize: typography.size.xxl,
    color: colors.primary,
    letterSpacing: 2,
  },
  headerSub: {
    fontFamily: 'JetBrainsMono-Regular',
    fontWeight: '400',
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  tabBar: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    fontFamily: 'DMSans-SemiBold',
    fontWeight: '600',
    fontSize: typography.size.sm,
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.white,
  },
  content: {
    flex: 1,
  },
  panel: {
    flex: 1,
  },
  panelHidden: {
    display: 'none',
  },
});
