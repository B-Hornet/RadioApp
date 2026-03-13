import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { db } from '../firebaseConfig';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { colors, spacing, fonts, borderRadius } from '../theme';
import { CHATROOM_ID } from '../constants';

const ModControlRoom = ({ route }) => {
  const {
    streamId = CHATROOM_ID,
    ownerUsername = '',
  } = route?.params || {};

  const [followers, setFollowers] = useState([]);
  const [moderators, setModerators] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [modCount, setModCount] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const mountedRef = useRef(true);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    return () => {
      mountedRef.current = false;
    };
  }, [fadeAnim]);

  // Listen to followers (members of the chatroom)
  useEffect(() => {
    const followersQuery = query(
      collection(db, 'Chatrooms', streamId, 'followers'),
      orderBy('username')
    );
    const unsubFollowers = onSnapshot(
      followersQuery,
      (snapshot) => {
        if (!mountedRef.current) return;
        const followerList = snapshot.docs.map((docSnap) => ({
          uid: docSnap.id,
          ...docSnap.data(),
        }));
        setFollowers(followerList);
        setIsLoading(false);
      },
      (error) => {
        console.error('Followers listener error:', error);
        if (!mountedRef.current) return;
        setIsLoading(false);
      }
    );

    return () => unsubFollowers();
  }, [streamId]);

  // Listen to current moderators
  useEffect(() => {
    const modsQuery = query(
      collection(db, 'streams', streamId, 'moderators')
    );
    const unsubMods = onSnapshot(
      modsQuery,
      (snapshot) => {
        if (!mountedRef.current) return;
        const modMap = {};
        snapshot.docs.forEach((d) => { modMap[d.id] = true; });
        setModerators(modMap);
        setModCount(snapshot.docs.length);
      },
      (error) => {
        console.error('Moderators listener error:', error);
      }
    );

    return () => unsubMods();
  }, [streamId]);

  const promoteMod = useCallback(async (follower) => {
    try {
      await setDoc(
        doc(db, 'streams', streamId, 'moderators', follower.uid),
        {
          username: follower.username,
          promotedAt: serverTimestamp(),
          promotedBy: ownerUsername,
        }
      );
      if (!mountedRef.current) return;
      Alert.alert('Promoted', `${follower.username} is now a moderator.`);
    } catch (error) {
      console.error('Promote mod error:', error);
      if (!mountedRef.current) return;
      Alert.alert('Error', 'Failed to promote moderator. Please try again.');
    }
  }, [streamId, ownerUsername]);

  const demoteMod = useCallback(async (follower) => {
    try {
      await deleteDoc(
        doc(db, 'streams', streamId, 'moderators', follower.uid)
      );
      if (!mountedRef.current) return;
      Alert.alert('Demoted', `${follower.username} is no longer a moderator.`);
    } catch (error) {
      console.error('Demote mod error:', error);
      if (!mountedRef.current) return;
      Alert.alert('Error', 'Failed to demote moderator. Please try again.');
    }
  }, [streamId]);

  const toggleMod = useCallback((follower) => {
    const isMod = moderators[follower.uid];
    const action = isMod ? 'demote' : 'promote';
    const actionLabel = isMod ? 'Remove Moderator' : 'Make Moderator';

    Alert.alert(
      actionLabel,
      `${action === 'promote' ? 'Promote' : 'Demote'} ${follower.username} as a moderator?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: actionLabel,
          style: isMod ? 'destructive' : 'default',
          onPress: () => isMod ? demoteMod(follower) : promoteMod(follower),
        },
      ]
    );
  }, [moderators, promoteMod, demoteMod]);

  const filteredFollowers = followers.filter((f) =>
    f.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderFollowerRow = ({ item }) => {
    const isMod = moderators[item.uid];

    return (
      <View style={styles.followerRow}>
        <View style={styles.followerAvatar}>
          <Text style={styles.followerAvatarText}>
            {(item.username || '?').charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.followerInfo}>
          <Text style={styles.followerUsername}>{item.username}</Text>
          {isMod && (
            <Text style={styles.modBadgeLabel}>Moderator</Text>
          )}
        </View>
        <TouchableOpacity
          style={[styles.shieldButton, isMod && styles.shieldButtonActive]}
          onPress={() => toggleMod(item)}
          accessibilityLabel={isMod ? `Demote ${item.username}` : `Promote ${item.username}`}
          accessibilityRole="button"
        >
          <Text style={styles.shieldIcon}>{isMod ? '\uD83D\uDEE1\uFE0F' : '\uD83D\uDEE1\uFE0F'}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Header section */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerIcon}>{'\uD83D\uDC65'}</Text>
          <Text style={styles.headerTitle}>Manage Moderators</Text>
        </View>
        <Text style={styles.modCountText}>
          {modCount} active moderator{modCount !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search followers..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          accessibilityLabel="Search followers"
        />
      </View>

      {/* Follower list */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading followers...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredFollowers}
          renderItem={renderFollowerRow}
          keyExtractor={(item) => item.uid}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery
                  ? 'No followers match your search.'
                  : 'No followers yet.'}
              </Text>
            </View>
          }
        />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // Header
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  headerIcon: {
    fontSize: 22,
    marginRight: spacing.sm,
  },
  headerTitle: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.bold,
    color: colors.textPrimary,
  },
  modCountText: {
    fontSize: fonts.sizes.sm,
    color: colors.primary,
    fontWeight: fonts.weights.semibold,
  },
  // Search
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  searchInput: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fonts.sizes.md,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
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
  // List
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  // Follower row
  followerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  followerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  followerAvatarText: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.bold,
    color: colors.primary,
  },
  followerInfo: {
    flex: 1,
  },
  followerUsername: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.semibold,
    color: colors.textPrimary,
  },
  modBadgeLabel: {
    fontSize: fonts.sizes.xs,
    color: colors.secondary,
    fontWeight: fonts.weights.medium,
    marginTop: 2,
  },
  // Shield toggle button
  shieldButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  shieldButtonActive: {
    backgroundColor: 'rgba(29, 185, 84, 0.2)',
    borderColor: colors.secondary,
  },
  shieldIcon: {
    fontSize: 20,
  },
  // Empty
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: fonts.sizes.md,
  },
});

export default ModControlRoom;
