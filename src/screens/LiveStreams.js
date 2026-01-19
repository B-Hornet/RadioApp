// File: src/screens/LiveStreams.js
// Screen displaying available live streams with preview cards

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';
import StreamPreviewCard from '../components/StreamPreviewCard';
import { setCustomerCode } from '../services/cloudflareStreamService';

// Sample stream data for demonstration
// In production, this would come from Firebase/Firestore
const SAMPLE_STREAMS = [
  {
    id: 'stream-1',
    title: 'Reeboot Radio Live Show',
    streamerName: 'DJ Reeboot',
    isLive: true,
    viewerCount: 245,
    platform: 'rtmps', // Using HLS playback
    playbackId: 'YOUR_CLOUDFLARE_STREAM_ID_1',
    thumbnailUrl: null, // Will use Cloudflare thumbnail
    category: 'Music',
  },
  {
    id: 'stream-2',
    title: 'Evening Mix Session',
    streamerName: 'RadioHost',
    isLive: true,
    viewerCount: 89,
    platform: 'whip', // Using WebRTC ingest -> needs WHEP playback
    playbackId: 'YOUR_CLOUDFLARE_STREAM_ID_2',
    thumbnailUrl: null,
    category: 'Music',
  },
  {
    id: 'stream-3',
    title: 'Talk Show - Weekly Discussion',
    streamerName: 'Community Radio',
    isLive: false,
    viewerCount: 0,
    platform: 'rtmps',
    playbackId: 'YOUR_CLOUDFLARE_STREAM_ID_3',
    thumbnailUrl: null,
    category: 'Talk',
  },
];

/**
 * LiveStreams Screen Component
 *
 * Displays a grid of available live streams with preview cards.
 * Users can tap a card to navigate to the ChatRoom with the stream.
 */
const LiveStreams = ({ navigation }) => {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showLiveOnly, setShowLiveOnly] = useState(false);

  /**
   * Initialize Cloudflare customer code
   * IMPORTANT: Replace with your actual customer code
   */
  useEffect(() => {
    // Set your Cloudflare customer code here
    // This is found in Cloudflare Dashboard > Stream > API
    setCustomerCode('YOUR_CUSTOMER_CODE');
  }, []);

  /**
   * Fetch streams from backend
   */
  const fetchStreams = useCallback(async () => {
    try {
      setError(null);

      // TODO: Replace with actual Firebase/Firestore query
      // Example:
      // const streamsRef = collection(firestore, 'streams');
      // const q = query(streamsRef, where('isLive', '==', true), orderBy('viewerCount', 'desc'));
      // const snapshot = await getDocs(q);
      // const streamData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Using sample data for demonstration
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      setStreams(SAMPLE_STREAMS);
    } catch (err) {
      console.error('Error fetching streams:', err);
      setError('Failed to load streams. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  /**
   * Initial fetch
   */
  useEffect(() => {
    fetchStreams();
  }, [fetchStreams]);

  /**
   * Pull to refresh handler
   */
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStreams();
  }, [fetchStreams]);

  /**
   * Navigate to ChatRoom with selected stream
   */
  const handleStreamPress = useCallback((stream) => {
    if (!stream.isLive) {
      // Stream is offline - show message or navigate to VOD
      return;
    }

    navigation.navigate('ChatRoom', { stream });
  }, [navigation]);

  /**
   * Toggle live-only filter
   */
  const toggleLiveFilter = useCallback(() => {
    setShowLiveOnly(prev => !prev);
  }, []);

  /**
   * Filter streams based on live status
   */
  const filteredStreams = showLiveOnly
    ? streams.filter(stream => stream.isLive)
    : streams;

  /**
   * Render stream preview card
   */
  const renderStream = ({ item }) => (
    <StreamPreviewCard
      stream={item}
      onPress={handleStreamPress}
      showLivePreview={false}
      style={styles.card}
    />
  );

  /**
   * Render list header with filter options
   */
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>Live Streams</Text>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            showLiveOnly && styles.filterButtonActive,
          ]}
          onPress={toggleLiveFilter}
        >
          <View
            style={[
              styles.filterIndicator,
              showLiveOnly && styles.filterIndicatorActive,
            ]}
          />
          <Text
            style={[
              styles.filterText,
              showLiveOnly && styles.filterTextActive,
            ]}
          >
            Live Only
          </Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {streams.filter(s => s.isLive).length} live now
        </Text>
        <Text style={styles.statsSeparator}>|</Text>
        <Text style={styles.statsText}>
          {streams.reduce((sum, s) => sum + (s.viewerCount || 0), 0)} viewers
        </Text>
      </View>
    </View>
  );

  /**
   * Render empty state
   */
  const renderEmpty = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>O</Text>
        <Text style={styles.emptyTitle}>
          {showLiveOnly ? 'No Live Streams' : 'No Streams Available'}
        </Text>
        <Text style={styles.emptyText}>
          {showLiveOnly
            ? 'No one is streaming right now. Check back later!'
            : 'There are no streams available at the moment.'}
        </Text>
        {showLiveOnly && (
          <TouchableOpacity style={styles.showAllButton} onPress={toggleLiveFilter}>
            <Text style={styles.showAllButtonText}>Show All Streams</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  /**
   * Render loading state
   */
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e90ff" />
        <Text style={styles.loadingText}>Loading streams...</Text>
      </SafeAreaView>
    );
  }

  /**
   * Render error state
   */
  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorIcon}>!</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchStreams}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredStreams}
        renderItem={renderStream}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#1e90ff"
            colors={['#1e90ff']}
          />
        }
      />
    </SafeAreaView>
  );
};

LiveStreams.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  headerContainer: {
    marginBottom: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252525',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  filterButtonActive: {
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    borderColor: '#ff0000',
  },
  filterIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#666',
    marginRight: 8,
  },
  filterIndicatorActive: {
    backgroundColor: '#ff0000',
  },
  filterText: {
    color: '#aaa',
    fontSize: 14,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsText: {
    color: '#888',
    fontSize: 13,
  },
  statsSeparator: {
    color: '#444',
    marginHorizontal: 8,
  },
  card: {
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#aaa',
    marginTop: 16,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorIcon: {
    fontSize: 50,
    color: '#ff4444',
    marginBottom: 16,
  },
  errorText: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#1e90ff',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 60,
    color: '#444',
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
    marginBottom: 20,
  },
  showAllButton: {
    backgroundColor: '#252525',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  showAllButtonText: {
    color: '#1e90ff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default LiveStreams;
