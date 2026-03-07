import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { database } from '../firebaseConfig';
import { ref, onValue } from 'firebase/database';
import { colors, spacing, fonts, borderRadius } from '../theme';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DEFAULT_SCHEDULE = [
  { id: '1', djName: 'DJ Reeboot', showName: 'The Morning Mix', day: 'Monday', startTime: '8:00 AM', endTime: '12:00 PM', genre: 'Hip-Hop / R&B' },
  { id: '2', djName: 'DJ Reeboot', showName: 'Afternoon Vibes', day: 'Wednesday', startTime: '2:00 PM', endTime: '6:00 PM', genre: 'Soul / Funk' },
  { id: '3', djName: 'DJ Reeboot', showName: 'Friday Night Live', day: 'Friday', startTime: '8:00 PM', endTime: '12:00 AM', genre: 'EDM / Dance' },
  { id: '4', djName: 'DJ Reeboot', showName: 'Weekend Warm-Up', day: 'Saturday', startTime: '6:00 PM', endTime: '10:00 PM', genre: 'Mix / Open Format' },
];

const DJSchedule = () => {
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE);
  const [nowPlaying, setNowPlaying] = useState(null);
  const [selectedDay, setSelectedDay] = useState(DAYS[new Date().getDay()]);

  useEffect(() => {
    const scheduleRef = ref(database, 'djSchedule');
    const unsubscribe = onValue(scheduleRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const scheduleList = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));
        setSchedule(scheduleList);
      }
    });

    const nowPlayingRef = ref(database, 'nowPlaying');
    const unsubNowPlaying = onValue(nowPlayingRef, (snapshot) => {
      setNowPlaying(snapshot.val());
    });

    return () => {
      unsubscribe();
      unsubNowPlaying();
    };
  }, []);

  const todayShows = schedule.filter((show) => show.day === selectedDay);

  const renderShow = ({ item }) => {
    const isLive = nowPlaying && nowPlaying.showId === item.id;

    return (
      <View style={[styles.showCard, isLive && styles.showCardLive]}>
        {isLive && (
          <View style={styles.liveTag}>
            <View style={styles.liveDot} />
            <Text style={styles.liveTagText}>LIVE NOW</Text>
          </View>
        )}
        <View style={styles.timeBlock}>
          <Text style={styles.startTime}>{item.startTime}</Text>
          <Text style={styles.endTime}>{item.endTime}</Text>
        </View>
        <View style={styles.showInfo}>
          <Text style={styles.showName}>{item.showName}</Text>
          <Text style={styles.djName}>{item.djName}</Text>
          <View style={styles.genreBadge}>
            <Text style={styles.genreText}>{item.genre}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Now Playing Banner */}
      {nowPlaying && (
        <View style={styles.nowPlayingBanner}>
          <View style={styles.nowPlayingDot} />
          <View style={styles.nowPlayingInfo}>
            <Text style={styles.nowPlayingLabel}>NOW PLAYING</Text>
            <Text style={styles.nowPlayingTrack}>
              {nowPlaying.trackTitle || 'Reeboot Radio Live'}
            </Text>
            <Text style={styles.nowPlayingArtist}>
              {nowPlaying.artist || 'Reeboot Radio'}
            </Text>
          </View>
        </View>
      )}

      {/* Day selector */}
      <FlatList
        horizontal
        data={DAYS}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.dayChip,
              selectedDay === item && styles.dayChipActive,
            ]}
            onPress={() => setSelectedDay(item)}
          >
            <Text
              style={[
                styles.dayChipText,
                selectedDay === item && styles.dayChipTextActive,
              ]}
            >
              {item.slice(0, 3)}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.daySelector}
        showsHorizontalScrollIndicator={false}
      />

      {/* Schedule header */}
      <View style={styles.scheduleHeader}>
        <Text style={styles.scheduleDay}>{selectedDay}</Text>
        <Text style={styles.showCount}>
          {todayShows.length} show{todayShows.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Shows list */}
      <FlatList
        data={todayShows}
        renderItem={renderShow}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.showsList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>{'\uD83C\uDF99\uFE0F'}</Text>
            <Text style={styles.emptyText}>No shows scheduled</Text>
            <Text style={styles.emptySubtext}>
              Check back later or tune in to AutoDJ
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // Now Playing
  nowPlayingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  nowPlayingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.live,
    marginRight: spacing.md,
  },
  nowPlayingInfo: {
    flex: 1,
  },
  nowPlayingLabel: {
    fontSize: fonts.sizes.xs,
    fontWeight: fonts.weights.bold,
    color: colors.live,
    letterSpacing: 1,
  },
  nowPlayingTrack: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.semibold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  nowPlayingArtist: {
    fontSize: fonts.sizes.md,
    color: colors.textSecondary,
  },
  // Day selector
  daySelector: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  dayChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayChipText: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.medium,
    color: colors.textMuted,
  },
  dayChipTextActive: {
    color: colors.textPrimary,
    fontWeight: fonts.weights.bold,
  },
  // Schedule
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  scheduleDay: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.bold,
    color: colors.textPrimary,
  },
  showCount: {
    fontSize: fonts.sizes.sm,
    color: colors.textMuted,
  },
  showsList: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  // Show card
  showCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  showCardLive: {
    borderColor: colors.live,
    borderWidth: 2,
  },
  liveTag: {
    position: 'absolute',
    top: -10,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.live,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textPrimary,
    marginRight: 4,
  },
  liveTagText: {
    fontSize: fonts.sizes.xs,
    fontWeight: fonts.weights.bold,
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  timeBlock: {
    marginRight: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },
  startTime: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.bold,
    color: colors.primary,
  },
  endTime: {
    fontSize: fonts.sizes.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  showInfo: {
    flex: 1,
  },
  showName: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.semibold,
    color: colors.textPrimary,
  },
  djName: {
    fontSize: fonts.sizes.md,
    color: colors.textSecondary,
    marginTop: 2,
  },
  genreBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginTop: spacing.xs,
  },
  genreText: {
    fontSize: fonts.sizes.xs,
    color: colors.textAccent,
    fontWeight: fonts.weights.medium,
  },
  // Empty
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.semibold,
    color: colors.textSecondary,
  },
  emptySubtext: {
    fontSize: fonts.sizes.md,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});

export default DJSchedule;
