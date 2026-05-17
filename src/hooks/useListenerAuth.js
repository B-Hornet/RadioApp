/**
 * useListenerAuth — hybrid listener identity
 * ═════════════════════════════════════════════
 * Anonymous bootstrap is started in App.js so every device has a
 * stable uid and can read chat. This hook adds the optional
 * upgrade path: a listener can sign up with email/password to
 * become "identified", which is what Firestore Rules require to
 * post chat messages (firestore.rules → Messages.create gates on
 * sign_in_provider != 'anonymous').
 *
 * Sign-up creates a fresh Firebase user (not a link to the
 * anonymous one). The anonymous reaction history under the old
 * uid is abandoned — acceptable for a chat surface, since chat
 * posts didn't exist for that uid.
 *
 * The owner uses the same Firebase auth instance via useOwnerAuth;
 * both hooks observe the same user and don't conflict.
 */

import { useState, useEffect, useRef } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

const mapAuthError = (code) => {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'That email already has an account. Try signing in instead.';
    case 'auth/invalid-email':
      return 'That email address is not valid.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please try again.';
    case 'auth/requires-recent-login':
      return 'Please re-enter your password to confirm.';
    default:
      return `Auth error: ${code}`;
  }
};

// Best-effort deletion of every doc in a collection authored by uid.
// Skips silently on permission errors so we always reach auth.delete().
async function deleteUserDocs(collectionName, uid) {
  try {
    const q = query(collection(db, collectionName), where('uid', '==', uid));
    const snap = await getDocs(q);
    await Promise.allSettled(snap.docs.map((d) => deleteDoc(d.ref)));
  } catch (e) {
    console.warn(`deleteUserDocs(${collectionName}) failed:`, e?.message);
  }
}

export default function useListenerAuth() {
  const [user, setUser] = useState(auth.currentUser);
  const [authError, setAuthError] = useState(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (mounted.current) setUser(firebaseUser);
    });
    return () => {
      mounted.current = false;
      unsubscribe();
    };
  }, []);

  const isAnonymous = !!user?.isAnonymous;
  const isSignedIn = !!user && !user.isAnonymous;
  const displayName = user?.displayName || null;

  const signUp = async (email, password, name) => {
    setAuthError(null);
    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );
      const trimmed = name.trim();
      await updateProfile(credential.user, { displayName: trimmed });
      // Mirror the displayName into the user's Firestore profile.
      // Rules allow uidMatches(uid) && !('role' in data) on create.
      await setDoc(doc(db, 'users', credential.user.uid), {
        displayName: trimmed,
        createdAt: serverTimestamp(),
      });
      return true;
    } catch (e) {
      setAuthError(mapAuthError(e?.code || 'unknown'));
      return false;
    }
  };

  const signIn = async (email, password) => {
    setAuthError(null);
    try {
      // Race against a 15s timeout — same hang protection as
      // useOwnerAuth.login. See firebaseConfig.js for context.
      await Promise.race([
        signInWithEmailAndPassword(auth, email.trim(), password),
        new Promise((_, reject) =>
          setTimeout(() => reject({ code: 'auth/timeout' }), 15000),
        ),
      ]);
      return true;
    } catch (e) {
      const code = e?.code || 'unknown';
      if (code === 'auth/timeout') {
        setAuthError('Sign-in timed out. Check connection and retry.');
      } else {
        setAuthError(mapAuthError(code));
      }
      return false;
    }
  };

  const signOutListener = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Listener sign-out failed:', e?.message);
    }
  };

  // Account deletion — Apple 5.1.1(v) + Play Store policy require an
  // in-app path. Re-auths with the current password (Firebase only
  // permits delete on a "recent" credential), tears down Firestore
  // content the user authored, then deletes the Firebase Auth user.
  // The anonymous bootstrap in App.js will sign them back in afterwards.
  const deleteAccount = async (password) => {
    setAuthError(null);
    const current = auth.currentUser;
    if (!current || current.isAnonymous) {
      setAuthError('No account to delete.');
      return false;
    }
    const email = current.email;
    if (!email) {
      setAuthError('Cannot re-authenticate: no email on this account.');
      return false;
    }
    try {
      const credential = EmailAuthProvider.credential(email, password);
      await reauthenticateWithCredential(current, credential);
    } catch (e) {
      setAuthError(mapAuthError(e?.code || 'unknown'));
      return false;
    }
    const uid = current.uid;
    // Best-effort UGC cleanup — failures are logged but never block
    // the auth-delete step. Apple's requirement is that the *account*
    // is gone; per-doc cleanup is policy gravy.
    await deleteUserDocs('Messages', uid);
    await deleteUserDocs('songRequests', uid);
    await deleteUserDocs('liveReactions', uid);
    try {
      await deleteDoc(doc(db, 'users', uid));
    } catch (e) {
      console.warn('users/{uid} delete failed:', e?.message);
    }
    try {
      await deleteUser(current);
    } catch (e) {
      setAuthError(mapAuthError(e?.code || 'unknown'));
      return false;
    }
    return true;
  };

  const clearError = () => setAuthError(null);

  return {
    user,
    isAnonymous,
    isSignedIn,
    displayName,
    authError,
    signUp,
    signIn,
    signOut: signOutListener,
    deleteAccount,
    clearError,
  };
}
