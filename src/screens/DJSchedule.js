import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { db } from '../firebaseConfig';
import { collection, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { colors, spacing, fonts, borderRadius } from '../theme';
import { DAYS, DEFAULT_SCHEDULE } from '../constants';

const DJSchedule = () => {
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE);
  const [nowPlaying, setNowPlaying] = useState(null);
  const [selectedDay, setSelectedDay] = useState(DAYS[new Date().getDay()]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const scheduleQuery = query(collection(db, 'djSchedule'), orderBy('day'));
    const unsubscribe = onSnapshot(
      scheduleQuery,
      (snapshot) => {
        if (!snapshot.empty) {
          const scheduleList = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }));
          setSchedule(scheduleList);
        }
        setIsLoading(false);
      },
      (error) => {
        console.error('Schedule listener error:', error);
        setIsLoading(false);
      }
    );

    const nowPlayingRef = doc(db, 'appState', 'nowPlaying');
    const unsubNowPlaying = onSnapshot(
      nowPlayingRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setNowPlaying(docSnap.data());
        } else {
          setNowPlaying(null);
        }
      },
      (error) => {
        console.error('Now playing listener error:', error);
      }
    );

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
            accessibilityLabel={`${item} schedule`}
            accessibilityRole="button"
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
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading schedule...</Text>
        </View>
      ) : (
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
      )}
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
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: fonts.sizes.md,
    marginTop: spacing.md,
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
