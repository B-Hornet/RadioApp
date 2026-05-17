/**
 * LiveDashboard — Real-time listener stats
 * ═══════════════════════════════════════════
 * Active listeners, locations, peaks, chat rate, current track.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { db } from '../../firebaseConfig';
import {
  doc,
  onSnapshot,
  collection,
  query,
  orderBy,
  limit,
  where,
  Timestamp,
} from 'firebase/firestore';
import { colors, typography, spacing, radius } from '../../theme/tokens';
import { useStream } from '../../StreamContext';

const StatBox = ({ label, value, accent }) => (
  <View style={[styles.statBox, accent && styles.statBoxAccent]}>
    <Text style={[styles.statValue, accent && styles.statValueAccent]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export default function LiveDashboard() {
  const { trackTitle, artistName, isPlaying } = useStream();
  const [listenerCount, setListenerCount] = useState(0);
  const [locations, setLocations] = useState({});
  const [peakToday, setPeakToday] = useState(0);
  const [peakWeek, setPeakWeek] = useState(0);
  const [chatRate, setChatRate] = useState(0);
  const [errors, setErrors] = useState({});

  const setErr = (key, msg) =>
    setErrors((prev) => {
      if (prev[key] === msg) return prev;
      return { ...prev, [key]: msg };
    });

  // Listener count from Chatrooms
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'Chatrooms', 'reebootlive'), (snap) => {
      if (snap.exists()) {
        setListenerCount(snap.data().listenerCount || 0);
      }
      setErr('listeners', null);
    }, (err) => setErr('listeners', err.message));
    return () => unsub();
  }, []);

  // Listener locations + peaks from appState
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'appState', 'listeners'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setLocations(data.locations || {});
        setPeakToday(data.peakToday || 0);
        setPeakWeek(data.peakThisWeek || 0);
      }
      setErr('appState', null);
    }, (err) => setErr('appState', err.message));
    return () => unsub();
  }, []);

  // Chat rate — count messages in last 5 minutes
  useEffect(() => {
    const fiveMinAgo = Timestamp.fromDate(new Date(Date.now() - 5 * 60 * 1000));
    const q = query(
      collection(db, 'Messages'),
      where('timestamp', '>=', fiveMinAgo),
      orderBy('timestamp', 'desc'),
      limit(500),
    );
    const unsub = onSnapshot(q, (snap) => {
      setChatRate(Math.round(snap.size / 5));
      setErr('chatRate', null);
    }, (err) => setErr('chatRate', err.message));
    return () => unsub();
  }, []);

  const errorMsg = Object.values(errors).find(Boolean);

  const sortedLocations = Object.entries(locations)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {errorMsg ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText} numberOfLines={2}>{errorMsg}</Text>
        </View>
      ) : null}
      {/* Stats grid */}
      <View style={styles.statsGrid}>
        <StatBox label="Active Listeners" value={listenerCount} accent />
        <StatBox label="Peak Today" value={peakToday} />
        <StatBox label="Peak This Week" value={peakWeek} />
        <StatBox label="Msgs / Min" value={chatRate} />
      </View>

      {/* Now playing */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>NOW PLAYING</Text>
        <View style={styles.nowPlaying}>
          <View style={[styles.playingDot, isPlaying && styles.playingDotActive]} />
          <View style={styles.playingInfo}>
            <Text style={styles.playingTrack} numberOfLines={1}>{trackTitle || 'Nothing playing'}</Text>
            <Text style={styles.playingArtist} numberOfLines={1}>{artistName || '—'}</Text>
          </View>
        </View>
      </View>

      {/* Listener locations */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>LISTENER LOCATIONS</Text>
        {sortedLocations.length === 0 ? (
          <Text style={styles.emptyText}>No location data yet</Text>
        ) : (
          sortedLocations.map(([city, count]) => (
            <View key={city} style={styles.locationRow}>
              <Text style={styles.locationCity}>{city}</Text>
              <Text style={styles.locationCount}>{count}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.screen, paddingBottom: 140 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl },
  statBox: {
    width: '48%', backgroundColor: colors.bgSurface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.glassBorder, padding: spacing.md, alignItems: 'center',
  },
  statBoxAccent: { borderColor: colors.primary },
  statValue: { fontFamily: 'Oswald-Bold', fontWeight: '700', fontSize: 28, color: colors.textPrimary },
  statValueAccent: { color: colors.primary },
  statLabel: { fontFamily: 'JetBrainsMono-Regular', fontSize: typography.size.xs, color: colors.textMuted, marginTop: 4 },

  section: { marginBottom: spacing.xl },
  sectionLabel: {
    fontFamily: 'Oswald-Medium', fontWeight: '500', fontSize: typography.size.sm,
    color: colors.textMuted, letterSpacing: 2, marginBottom: spacing.md,
  },

  nowPlaying: {
    backgroundColor: colors.bgSurface, borderRadius: radius.md, borderWidth: 1,
    borderColor: colors.glassBorder, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md,
  },
  playingDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.textMuted },
  playingDotActive: { backgroundColor: colors.online },
  playingInfo: { flex: 1 },
  playingTrack: { fontFamily: 'Oswald-Bold', fontWeight: '700', fontSize: typography.size.lg, color: colors.textPrimary },
  playingArtist: { fontFamily: 'DMSans-Regular', fontSize: typography.size.sm, color: colors.textSecondary, marginTop: 2 },

  locationRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.glassBorder,
  },
  locationCity: { fontFamily: 'DMSans-Medium', fontWeight: '500', fontSize: typography.size.md, color: colors.textPrimary },
  locationCount: { fontFamily: 'JetBrainsMono-Medium', fontWeight: '500', fontSize: typography.size.sm, color: colors.primary },

  emptyText: { fontFamily: 'DMSans-Regular', fontSize: typography.size.sm, color: colors.textMuted },

  errorBanner: {
    backgroundColor: 'rgba(255, 69, 58, 0.15)',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 58, 0.4)',
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  errorText: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: typography.size.xs,
    color: colors.error,
  },
});
