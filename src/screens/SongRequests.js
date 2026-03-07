import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import { database } from '../firebaseConfig';
import { ref, push, onValue, serverTimestamp, query, orderByChild, update } from 'firebase/database';
import { colors, spacing, fonts, borderRadius } from '../theme';

const SongRequests = () => {
  const [requests, setRequests] = useState([]);
  const [songTitle, setSongTitle] = useState('');
  const [artistName, setArtistName] = useState('');
  const [requesterName, setRequesterName] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const requestsRef = query(ref(database, 'songRequests'), orderByChild('timestamp'));
    const unsubscribe = onValue(requestsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const requestList = Object.entries(data)
          .map(([key, value]) => ({ id: key, ...value }))
          .sort((a, b) => (b.votes || 0) - (a.votes || 0));
        setRequests(requestList);
      } else {
        setRequests([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const submitRequest = () => {
    if (!songTitle.trim()) {
      Alert.alert('Missing Info', 'Please enter a song title.');
      return;
    }

    const requestsRef = ref(database, 'songRequests');
    push(requestsRef, {
      songTitle: songTitle.trim(),
      artistName: artistName.trim(),
      requesterName: requesterName.trim() || 'Anonymous',
      timestamp: serverTimestamp(),
      votes: 0,
      status: 'pending',
    });

    setSongTitle('');
    setArtistName('');
    setShowForm(false);
    Alert.alert('Request Sent!', 'Your song request has been submitted to the DJ.');
  };

  const voteForRequest = (requestId, currentVotes) => {
    const requestRef = ref(database, `songRequests/${requestId}`);
    update(requestRef, { votes: (currentVotes || 0) + 1 });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'playing': return colors.secondary;
      case 'queued': return colors.warning;
      case 'declined': return colors.textMuted;
      default: return colors.primary;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'playing': return 'NOW PLAYING';
      case 'queued': return 'UP NEXT';
      case 'declined': return 'DECLINED';
      default: return 'REQUESTED';
    }
  };

  const renderRequest = ({ item }) => (
    <View style={styles.requestCard}>
      <View style={styles.requestInfo}>
        <Text style={styles.songTitle}>{item.songTitle}</Text>
        {item.artistName ? (
          <Text style={styles.artistName}>{item.artistName}</Text>
        ) : null}
        <View style={styles.requestMeta}>
          <Text style={styles.requesterName}>by {item.requesterName}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={styles.voteButton}
        onPress={() => voteForRequest(item.id, item.votes)}
      >
        <Text style={styles.voteArrow}>{'\u25B2'}</Text>
        <Text style={styles.voteCount}>{item.votes || 0}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Song Requests</Text>
        <Text style={styles.headerSubtitle}>
          Request songs and vote for what plays next
        </Text>
      </View>

      {/* Request form toggle */}
      {!showForm ? (
        <TouchableOpacity
          style={styles.requestButton}
          onPress={() => setShowForm(true)}
        >
          <Text style={styles.requestButtonText}>+ Request a Song</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Song title *"
            placeholderTextColor={colors.textMuted}
            value={songTitle}
            onChangeText={setSongTitle}
            maxLength={100}
          />
          <TextInput
            style={styles.input}
            placeholder="Artist name (optional)"
            placeholderTextColor={colors.textMuted}
            value={artistName}
            onChangeText={setArtistName}
            maxLength={100}
          />
          <TextInput
            style={styles.input}
            placeholder="Your name (optional)"
            placeholderTextColor={colors.textMuted}
            value={requesterName}
            onChangeText={setRequesterName}
            maxLength={30}
          />
          <View style={styles.formActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowForm(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitButton} onPress={submitRequest}>
              <Text style={styles.submitButtonText}>Submit Request</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Request queue */}
      <FlatList
        data={requests}
        renderItem={renderRequest}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>{'\uD83C\uDFB5'}</Text>
            <Text style={styles.emptyText}>No requests yet</Text>
            <Text style={styles.emptySubtext}>Be the first to request a song!</Text>
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
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: fonts.sizes.xxl,
    fontWeight: fonts.weights.bold,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: fonts.sizes.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  requestButton: {
    backgroundColor: colors.primary,
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  requestButtonText: {
    color: colors.textPrimary,
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.bold,
  },
  formContainer: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: colors.textPrimary,
    fontSize: fonts.sizes.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.sm,
  },
  cancelButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
  },
  cancelButtonText: {
    color: colors.textMuted,
    fontSize: fonts.sizes.md,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.xl,
  },
  submitButtonText: {
    color: colors.textPrimary,
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.bold,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  requestCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  requestInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.semibold,
    color: colors.textPrimary,
  },
  artistName: {
    fontSize: fonts.sizes.md,
    color: colors.textSecondary,
    marginTop: 2,
  },
  requestMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  requesterName: {
    fontSize: fonts.sizes.sm,
    color: colors.textMuted,
    marginRight: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: fonts.sizes.xs,
    fontWeight: fonts.weights.bold,
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  voteButton: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceLight,
    minWidth: 50,
  },
  voteArrow: {
    color: colors.primary,
    fontSize: 16,
  },
  voteCount: {
    color: colors.textPrimary,
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.bold,
    marginTop: 2,
  },
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

export default SongRequests;
