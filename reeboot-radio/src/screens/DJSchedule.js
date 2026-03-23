/**
 * DJSchedule — Timeline Schedule View
 * ═══════════════════════════════════════
 * Replaces flat card list with a vertical timeline.
 * The live DJ gets hero treatment with glow + inline visualizer.
 * Day selector tabs at top.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  StatusBar,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radius } from '../theme/tokens';
import Glass from '../components/Glass';
import LiveBadge from '../components/LiveBadge';
import VisualizerBars from '../components/VisualizerBars';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

// TODO: Pull from Firestore schedule collection
const SCHEDULE = [
  { time: '8 PM', dj: 'MC Vortex', show: 'Prime Time Bass', live: false },
  { time: '10 PM', dj: 'DJ Shadow', show: 'Midnight Frequencies', live: true },
  { time: '12 AM', dj: 'DJ Pulse', show: 'Night Drive Mix', live: false },
  { time: '2 AM', dj: 'Luna Wave', show: 'Ambient Hours', live: false },
];

// ── Day Tab ────────────────────────────────────────────────
const DayTab = ({ day, isActive, onPress }) => (
  <Pressable
    onPress={onPress}
    style={[styles.dayTab, isActive && styles.dayTabActive]}
  >
    <Text style={[styles.dayText, isActive && styles.dayTextActive]}>{day}</Text>
  </Pressable>
);

// ── Timeline Slot ──────────────────────────────────────────
const TimelineSlot = ({ slot, isLast, index }) => (
  <Animated.View
    entering={FadeInDown.delay(200 + index * 100).springify()}
    style={styles.timelineRow}
  >
    {/* Time column + connector line */}
    <View style={styles.timeColumn}>
      <Text style={[styles.timeText, slot.live && styles.timeTextLive]}>
        {slot.time}
      </Text>
      {!isLast && (
        <View
          style={[
            styles.connector,
            slot.live && styles.connectorLive,
          ]}
        />
      )}
    </View>

    {/* Card */}
    <View style={styles.slotCard}>
      <Glass
        accent={slot.live}
        glow={slot.live}
        style={styles.slotGlass}
      >
        <View style={styles.slotHeader}>
          <View style={styles.slotInfo}>
            <Text style={styles.showName}>{slot.show}</Text>
            <Text style={[styles.djName, slot.live && styles.djNameLive]}>
              {slot.dj}
            </Text>
          </View>
          {slot.live && <LiveBadge size="sm" />}
        </View>

        {slot.live && (
          <View style={styles.slotVisualizer}>
            <VisualizerBars count={24} height={20} playing />
          </View>
        )}
      </Glass>
    </View>
  </Animated.View>
);

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

export default function DJSchedule() {
  const [activeDay, setActiveDay] = useState(3); // Thursday

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bgDeep} />
      <View style={styles.ambientGlow} />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ─────────────────────────────────── */}
          <Animated.View entering={FadeIn.delay(100)} style={styles.header}>
            <Text style={styles.headerTitle}>SCHEDULE</Text>
            <Text style={styles.headerSub}>This Week's Lineup</Text>
          </Animated.View>

          {/* ── Day Selector ───────────────────────────── */}
          <Animated.View entering={FadeIn.delay(150)}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dayRow}
            >
              {DAYS.map((day, i) => (
                <DayTab
                  key={day}
                  day={day}
                  isActive={i === activeDay}
                  onPress={() => setActiveDay(i)}
                />
              ))}
            </ScrollView>
          </Animated.View>

          {/* ── Timeline ───────────────────────────────── */}
          <View style={styles.timeline}>
            {SCHEDULE.map((slot, i) => (
              <TimelineSlot
                key={i}
                slot={slot}
                isLast={i === SCHEDULE.length - 1}
                index={i}
              />
            ))}
          </View>
        </ScrollView>
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
  scrollContent: {
    paddingBottom: 140,
  },
  ambientGlow: {
    position: 'absolute',
    top: -80,
    left: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: colors.primarySubtle,
    opacity: 0.6,
  },

  // Header
  header: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.screen,
  },
  headerTitle: {
    fontFamily: 'Oswald-Bold',
    fontWeight: '700',
    fontSize: typography.size.xxl,
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

  // Day selector
  dayRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.xl,
  },
  dayTab: {
    paddingHorizontal: 14,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  dayTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayText: {
    fontFamily: 'Oswald-SemiBold',
    fontWeight: '600',
    fontSize: typography.size.sm,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  dayTextActive: {
    color: colors.white,
  },

  // Timeline
  timeline: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.xl,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },

  // Time column
  timeColumn: {
    width: 56,
    alignItems: 'center',
    paddingTop: spacing.xs,
  },
  timeText: {
    fontFamily: 'JetBrainsMono-Medium',
    fontWeight: '500',
    fontSize: typography.size.sm,
    color: colors.textMuted,
  },
  timeTextLive: {
    color: colors.primary,
  },
  connector: {
    width: 1,
    flex: 1,
    backgroundColor: colors.glassBorder,
    marginTop: spacing.sm,
  },
  connectorLive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 2,
  },

  // Slot card
  slotCard: {
    flex: 1,
    paddingBottom: spacing.lg,
  },
  slotGlass: {
    padding: spacing.lg,
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  slotInfo: {
    flex: 1,
  },
  showName: {
    fontFamily: 'Oswald-Bold',
    fontWeight: '700',
    fontSize: typography.size.xl,
    color: colors.textPrimary,
  },
  djName: {
    fontFamily: 'DMSans-Regular',
    fontWeight: '400',
    fontSize: typography.size.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  djNameLive: {
    color: colors.primary,
  },
  slotVisualizer: {
    marginTop: spacing.md,
  },
});
