import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { db, auth } from '../firebaseConfig';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
  increment,
} from 'firebase/firestore';
import { colors, spacing, fonts, borderRadius } from '../theme';

const SongRequests = () => {
  const [requests, setRequests] = useState([]);
  const [songTitle, setSongTitle] = useState('');
  const [artistName, setArtistName] = useState('');
  const [requesterName, setRequesterName] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const requestsQuery = query(
      collection(db, 'songRequests'),
      orderBy('timestamp', 'desc')
    );
    const unsubscribe = onSnapshot(
      requestsQuery,
      (snapshot) => {
        const requestList = snapshot.docs
          .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
          .sort((a, b) => (b.votes || 0) - (a.votes || 0));
        setRequests(requestList);
        setIsLoading(false);
      },
      (error) => {
        console.error('Song requests listener error:', error);
        setIsLoading(false);
        Alert.alert('Connection Error', 'Unable to load song requests.');
      }
    );

    return () => unsubscribe();
  }, []);

  const submitRequest = useCallback(async () => {
    if (!songTitle.trim()) {
      Alert.alert('Missing Info', 'Please enter a song title.');
      return;
    }
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        Alert.alert('Submit Failed', 'Not signed in. Please restart the app.');
        return;
      }
      await addDoc(collection(db, 'songRequests'), {
        uid,
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
    } catch (error) {
      console.error('Submit request error:', error);
      Alert.alert('Submit Failed', 'Could not submit your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [songTitle, artistName, requesterName, isSubmitting]);

  const voteForRequest = useCallback(async (requestId) => {
    try {
      const requestRef = doc(db, 'songRequests', requestId);
      await updateDoc(requestRef, { votes: increment(1) });
    } catch (error) {
      console.error('Vote error:', error);
      Alert.alert('Vote Failed', 'Could not register your vote. Please try again.');
    }
  }, []);

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

  const renderRequest = (item) => (
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
        onPress={() => voteForRequest(item.id)}
        accessibilityLabel={`Vote for ${item.songTitle}`}
        accessibilityRole="button"
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
          accessibilityLabel="Request a song"
          accessibilityRole="button"
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
            accessibilityLabel="Song title"
          />
          <TextInput
            style={styles.input}
            placeholder="Artist name (optional)"
            placeholderTextColor={colors.textMuted}
            value={artistName}
            onChangeText={setArtistName}
            maxLength={100}
            accessibilityLabel="Artist name"
          />
          <TextInput
            style={styles.input}
            placeholder="Your name (optional)"
            placeholderTextColor={colors.textMuted}
            value={requesterName}
            onChangeText={setRequesterName}
            maxLength={30}
            accessibilityLabel="Your name"
          />
          <View style={styles.formActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowForm(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={submitRequest}
              disabled={isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Request queue */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading requests...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContent}>
          {requests.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>{'\uD83C\uDFB5'}</Text>
              <Text style={styles.emptyText}>No requests yet</Text>
              <Text style={styles.emptySubtext}>Be the first to request a song!</Text>
            </View>
          ) : (
            requests.map((item) => (
              <React.Fragment key={item.id}>
                {renderRequest(item)}
              </React.Fragment>
            ))
          )}
        </ScrollView>
      )}
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
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: colors.textPrimary,
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.bold,
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
