/**
 * useBlockList — device-local user block list
 * ════════════════════════════════════════════════
 * Supports App Store guideline 1.2 (UGC apps must let users block
 * abusive users). The authoritative store is AsyncStorage on the
 * device, so blocking works even for anonymous listeners and takes
 * effect immediately on already-rendered history (the chat filters
 * by this list with useMemo).
 *
 * When the user is signed in we ALSO mirror the list to a
 * `blockedUids` array on their users/{uid} doc — best-effort, never
 * blocking the local block. The Firestore mirror lets the same
 * block follow the account to another device once a read-back path
 * exists; failures here are logged and ignored.
 *
 * Block targets are sender uids (Messages.uid). Legacy/old-app
 * messages without a uid cannot be blocked (there is no stable
 * identity to block) — the action sheet only opens on messages that
 * have a uid, so this hook never receives an empty target.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { BLOCKED_UIDS_KEY } from '../constants';

// Mirror the block list onto the signed-in user's profile doc.
// Best-effort: an anonymous user (or a permission error) just leaves
// the local list as the source of truth.
async function mirrorToProfile(uids) {
  const current = auth.currentUser;
  if (!current || current.isAnonymous) return;
  try {
    await setDoc(
      doc(db, 'users', current.uid),
      { blockedUids: uids, updatedAt: serverTimestamp() },
      { merge: true },
    );
  } catch (e) {
    console.warn('Block list mirror failed:', e?.message);
  }
}

export default function useBlockList() {
  const [blockedUids, setBlockedUids] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const mounted = useRef(true);

  // Load the persisted list once on mount.
  useEffect(() => {
    mounted.current = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(BLOCKED_UIDS_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        if (mounted.current && Array.isArray(parsed)) {
          setBlockedUids(parsed.filter((u) => typeof u === 'string' && u));
        }
      } catch (e) {
        console.warn('Block list load failed:', e?.message);
      } finally {
        if (mounted.current) setLoaded(true);
      }
    })();
    return () => {
      mounted.current = false;
    };
  }, []);

  const persist = useCallback(async (next) => {
    try {
      await AsyncStorage.setItem(BLOCKED_UIDS_KEY, JSON.stringify(next));
    } catch (e) {
      console.warn('Block list persist failed:', e?.message);
    }
    // Mirror is fire-and-forget; do not await it on the UI path.
    mirrorToProfile(next);
  }, []);

  const blockUser = useCallback(
    (uid) => {
      if (!uid || typeof uid !== 'string') return;
      setBlockedUids((prev) => {
        if (prev.includes(uid)) return prev;
        const next = [...prev, uid];
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const unblockUser = useCallback(
    (uid) => {
      if (!uid) return;
      setBlockedUids((prev) => {
        if (!prev.includes(uid)) return prev;
        const next = prev.filter((u) => u !== uid);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const isBlocked = useCallback(
    (uid) => !!uid && blockedUids.includes(uid),
    [blockedUids],
  );

  return { blockedUids, loaded, blockUser, unblockUser, isBlocked };
}
