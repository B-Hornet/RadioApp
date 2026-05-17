/**
 * DJSchedule — Timeline Schedule View
 * ═══════════════════════════════════════
 * Fetches schedule from Firestore in real-time.
 * The live DJ gets hero treatment with glow + inline visualizer.
 * Day selector tabs at top.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { colors, typography, spacing, radius } from '../theme/tokens';
import Glass from '../components/Glass';
import LiveBadge from '../components/LiveBadge';
import VisualizerBars from '../components/VisualizerBars';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

// Get today's day index (0=MON ... 6=SUN)
const getTodayIndex = () => {
  const jsDay = new Date().getDay(); // 0=Sun, 1=Mon...
  return jsDay === 0 ? 6 : jsDay - 1;
};

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
    <View style={styles.timeColumn}>
      <Text style={[styles.timeText, slot.isLive && styles.timeTextLive]}>
        {slot.startTime}
      </Text>
      {!isLast && (
        <View style={[styles.connector, slot.isLive && styles.connectorLive]} />
      )}
    </View>

    <View style={styles.slotCard}>
      <Glass accent={slot.isLive} style={styles.slotGlass}>
        <View style={styles.slotHeader}>
          <View style={styles.slotInfo}>
            <Text style={styles.showName}>{slot.showName}</Text>
            <Text style={[styles.djName, slot.isLive && styles.djNameLive]}>
              {slot.djName}
            </Text>
          </View>
          {slot.isLive && <LiveBadge size="sm" />}
        </View>

        {slot.isLive && (
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
  const [activeDay, setActiveDay] = useState(getTodayIndex());
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setSlots([]);
    const dayStr = DAYS[activeDay];
    const q = query(
      collection(db, 'schedule'),
      where('day', '==', dayStr),
      orderBy('order', 'asc'),
    );
    const unsub = onSnapshot(q, (snap) => {
      setSlots(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      console.warn('Schedule fetch error:', err.message);
      setLoading(false);
    });
    return () => unsub();
  }, [activeDay]);

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
            {loading ? (
              <ActivityIndicator color={colors.primary} style={{ paddingVertical: spacing.xxl }} />
            ) : slots.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No shows scheduled for {DAYS[activeDay]}</Text>
              </View>
            ) : (
              slots.map((slot, i) => (
                <TimelineSlot
                  key={slot.id}
                  slot={slot}
                  isLast={i === slots.length - 1}
                  index={i}
                />
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bgDeep },
  safeArea: { flex: 1 },
  scrollContent: { paddingBottom: 140 },
  ambientGlow: {
    position: 'absolute', top: -80, left: -80, width: 300, height: 300,
    borderRadius: 150, backgroundColor: colors.primarySubtle, opacity: 0.6,
  },
  header: { paddingHorizontal: spacing.screen, paddingTop: spacing.screen },
  headerTitle: {
    fontFamily: 'Oswald-Bold', fontWeight: '700', fontSize: typography.size.xxl,
    color: colors.textPrimary, letterSpacing: 1,
  },
  headerSub: {
    fontFamily: 'JetBrainsMono-Regular', fontWeight: '400', fontSize: typography.size.xs,
    color: colors.textMuted, marginTop: spacing.xs,
  },
  dayRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.screen, paddingTop: spacing.xl },
  dayTab: {
    paddingHorizontal: 14, paddingVertical: spacing.sm, borderRadius: radius.md,
    backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.glassBorder,
  },
  dayTabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  dayText: {
    fontFamily: 'Oswald-SemiBold', fontWeight: '600', fontSize: typography.size.sm,
    color: colors.textMuted, letterSpacing: 1,
  },
  dayTextActive: { color: colors.white },
  timeline: { paddingHorizontal: spacing.screen, paddingTop: spacing.xl },
  timelineRow: { flexDirection: 'row', gap: spacing.lg },
  timeColumn: { width: 56, alignItems: 'center', paddingTop: spacing.xs },
  timeText: { fontFamily: 'JetBrainsMono-Medium', fontWeight: '500', fontSize: typography.size.sm, color: colors.textMuted },
  timeTextLive: { color: colors.primary },
  connector: { width: 1, flex: 1, backgroundColor: colors.glassBorder, marginTop: spacing.sm },
  connectorLive: {
    backgroundColor: colors.primary, shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 4, elevation: 2,
  },
  slotCard: { flex: 1, paddingBottom: spacing.lg },
  slotGlass: { padding: spacing.lg },
  slotHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  slotInfo: { flex: 1 },
  showName: { fontFamily: 'Oswald-Bold', fontWeight: '700', fontSize: typography.size.xl, color: colors.textPrimary },
  djName: { fontFamily: 'DMSans-Regular', fontWeight: '400', fontSize: typography.size.md, color: colors.textSecondary, marginTop: spacing.xs },
  djNameLive: { color: colors.primary },
  slotVisualizer: { marginTop: spacing.md },
  emptyState: { paddingVertical: spacing.xxl, alignItems: 'center' },
  emptyText: { fontFamily: 'DMSans-Regular', fontSize: typography.size.md, color: colors.textMuted },
});
