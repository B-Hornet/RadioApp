/**
 * useOwnerAuth — REST-based owner sign-in + Firestore role gate
 * ═══════════════════════════════════════════════════════════════
 * Uses the Firebase Identity Toolkit REST API directly for sign-in
 * because the firebase JS SDK 10.14 + Hermes + iOS 26 combination
 * hangs the first signInWithEmailAndPassword call indefinitely.
 * The original code used REST for exactly this reason; the C1
 * audit fix swapped in the JS SDK and regressed back into the hang.
 *
 * Trade-off: hook state is maintained manually rather than via
 * onAuthStateChanged. ControlRoom Firestore reads that gate by
 * uidMatches() are made via REST as well, using the idToken
 * returned by the sign-in call as a Bearer credential.
 *
 * Cold-start sign-in does NOT survive an app restart (REST tokens
 * aren't picked up by the JS SDK). Face ID via Keychain handles
 * re-auth on cold start so owners only ever type the password once.
 */

import { useState, useEffect, useRef } from 'react';
import * as Keychain from 'react-native-keychain';

// Firebase Web API key for the livestreamchat-2d575 project. Same
// value as in firebaseConfig.js — duplicated here so this hook
// doesn't depend on the JS SDK auth module that's known to hang.
const FIREBASE_API_KEY = 'AIzaSyABtGR_xpkhKskHPJ26_ViVmW_5pALYwp8';
const FIREBASE_PROJECT_ID = 'livestreamchat-2d575';
const SIGNIN_URL = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`;

// Service identifier under which the owner's credentials are stored
// in the iOS Keychain (and Android Keystore, when we ship Android).
const KEYCHAIN_SERVICE = 'reeboot-owner';

// Role check via Firestore REST API. Authenticated as the just-signed-in
// user via the idToken returned by REST sign-in, so the security rule
// `allow read: if uidMatches(uid)` passes for self-read of users/{uid}.
const checkOwnerRole = async (uid, idToken) => {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/users/${uid}`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${idToken}` },
    });
    if (!response.ok) {
      console.warn('Owner role check HTTP', response.status);
      return false;
    }
    const data = await response.json();
    return data?.fields?.role?.stringValue === 'owner';
  } catch (e) {
    console.warn('Owner role check failed:', e?.message);
    return false;
  }
};

// Identity Toolkit REST returns UPPER_SNAKE_CASE error codes in
// data.error.message, occasionally suffixed (e.g. "WEAK_PASSWORD : ...").
const mapAuthError = (code) => {
  const c = String(code || '').toUpperCase();
  if (c.startsWith('INVALID_LOGIN_CREDENTIALS')
      || c.startsWith('INVALID_PASSWORD')
      || c.startsWith('EMAIL_NOT_FOUND')) {
    return 'Invalid email or password.';
  }
  if (c.startsWith('INVALID_EMAIL')) return 'That email address is not valid.';
  if (c.startsWith('USER_DISABLED')) return 'This account has been disabled.';
  if (c.startsWith('TOO_MANY_ATTEMPTS_TRY_LATER')) return 'Too many attempts. Try again later.';
  if (c.startsWith('PASSWORD_DOES_NOT_MEET_REQUIREMENTS')) return 'Password too long. Max 11 characters.';
  return `Login error: ${code}`;
};

export default function useOwnerAuth() {
  const [user, setUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  // True when the iOS Keychain has owner credentials saved. Surfaced
  // so the avatar gesture can show "Sign in with Face ID" instead of
  // the email/password modal when a returning owner taps in.
  const [hasBiometricCreds, setHasBiometricCreds] = useState(false);
  const mounted = useRef(true);

  // Check Keychain on mount so the UI can render the biometric path
  // without a flash of the email/password fields. Initial loading
  // state is false because no auth round-trip happens at startup —
  // owner is unauthenticated until they tap the avatar.
  useEffect(() => {
    mounted.current = true;
    Keychain.hasInternetCredentials(KEYCHAIN_SERVICE)
      .then((has) => { if (mounted.current) setHasBiometricCreds(!!has); })
      .catch(() => {})
      .finally(() => { if (mounted.current) setLoading(false); });
    return () => { mounted.current = false; };
  }, []);

  const login = async (email, password) => {
    setAuthError(null);
    try {
      // 30s timeout via AbortController so a flaky network surfaces
      // as a clear error instead of a forever-spin.
      const ac = new AbortController();
      const timer = setTimeout(() => ac.abort(), 30000);
      let response;
      try {
        response = await fetch(SIGNIN_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim(),
            password,
            returnSecureToken: true,
          }),
          signal: ac.signal,
        });
      } finally {
        clearTimeout(timer);
      }
      const data = await response.json();
      if (!response.ok || data?.error) {
        setAuthError(mapAuthError(data?.error?.message || `HTTP ${response.status}`));
        return false;
      }
      const uid = data.localId;
      const idToken = data.idToken;
      const owner = await checkOwnerRole(uid, idToken);
      if (!owner) {
        setAuthError('This account does not have owner access.');
        return false;
      }
      if (mounted.current) {
        setUser({ uid, email: data.email, idToken, refreshToken: data.refreshToken });
        setIsOwner(true);
      }
      return true;
    } catch (e) {
      if (e?.name === 'AbortError') {
        setAuthError('Sign-in timed out. Check internet connection and retry.');
      } else {
        setAuthError(`Network error: ${e?.message || 'unknown'}`);
      }
      return false;
    }
  };

  const logout = async () => {
    if (mounted.current) {
      setUser(null);
      setIsOwner(false);
    }
  };

  // Store the owner's email + password in the iOS Keychain so future
  // sign-ins can use Face ID / Touch ID instead of typing. Storage is
  // gated by BIOMETRY_ANY_OR_DEVICE_PASSCODE so the device's biometric
  // (or passcode fallback if biometric is unavailable) is required to
  // read it back. Bound to this device only — not synced via iCloud.
  const enableBiometricLogin = async (email, password) => {
    try {
      await Keychain.setInternetCredentials(
        KEYCHAIN_SERVICE,
        email,
        password,
        {
          accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE,
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        },
      );
      if (mounted.current) setHasBiometricCreds(true);
      return true;
    } catch (e) {
      console.warn('Keychain save failed:', e?.message);
      return false;
    }
  };

  // Triggered by the owner avatar double-tap when hasBiometricCreds
  // is true. Reading from the Keychain prompts Face ID — on success
  // we get the stored email/password back and re-run the standard
  // login flow (so the owner-role check still runs).
  const tryBiometricSignIn = async () => {
    setAuthError(null);
    try {
      const stored = await Keychain.getInternetCredentials(KEYCHAIN_SERVICE);
      if (!stored) {
        if (mounted.current) setHasBiometricCreds(false);
        return false;
      }
      return await login(stored.username, stored.password);
    } catch (e) {
      // User cancelled biometric, or Face ID failed too many times.
      // Don't surface as an error — let the caller fall back to the
      // manual modal silently.
      console.warn('Biometric sign-in failed:', e?.message);
      return false;
    }
  };

  // Forget the saved credentials — called when the owner explicitly
  // signs out (so the next person on the device can't backdoor in).
  const clearBiometricLogin = async () => {
    try {
      await Keychain.resetInternetCredentials({ server: KEYCHAIN_SERVICE });
      if (mounted.current) setHasBiometricCreds(false);
    } catch (e) {
      console.warn('Keychain clear failed:', e?.message);
    }
  };

  return {
    user,
    isOwner,
    loading,
    authError,
    login,
    logout,
    hasBiometricCreds,
    enableBiometricLogin,
    tryBiometricSignIn,
    clearBiometricLogin,
  };
}
