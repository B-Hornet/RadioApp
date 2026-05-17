# Auth Login Spinning Issue — Summary for Second Opinion

## Problem
The owner login modal in the React Native app spins indefinitely when trying to sign in. The spinner never stops — no success, no error message.

## Environment
- React Native 0.75 (bare workflow, no Expo)
- Firebase JS SDK 10.14.1 (`firebase` npm package)
- iOS 18.6.2, iPhone 12
- Firebase project: `livestreamchat-2d575`
- Metro bundler running on port 8081 (debug build via xcodebuild)

## What Works
- Firebase Firestore reads/writes work fine (chat, song requests, leaderboard all functional)
- The Firebase REST API works from the command line:
  ```
  curl "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyABtGR_xpkhKskHPJ26_ViVmW_5pALYwp8" \
    -H 'Content-Type: application/json' \
    -d '{"email":"reebootradio@gmail.com","password":"Reeboot2026","returnSecureToken":true}'
  ```
  This returns a valid `localId` and `idToken` — credentials are correct.
- The seed script (`node src/scripts/seedSchedule.js Reeboot2026`) authenticates and writes to Firestore successfully from Node.js.

## What Doesn't Work
The login modal in the app spins forever. Three approaches were tried:

### Attempt 1: Firebase JS SDK `signInWithEmailAndPassword`
```js
import { signInWithEmailAndPassword } from 'firebase/auth';
const cred = await signInWithEmailAndPassword(auth, email, password);
```
**Result:** Hangs indefinitely. Never resolves or rejects.

### Attempt 2: `initializeAuth` with `getReactNativePersistence`
```js
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
```
**Result:** Same hang. Added 15s timeout — times out every time.

### Attempt 3: Direct REST API via `fetch()`
```js
const response = await fetch(AUTH_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password, returnSecureToken: true }),
});
const data = await response.json();
```
**Result:** Still spins. This suggests the issue may not be Firebase auth at all — the `fetch()` call itself or the modal's state management may be the problem.

## Key Files
- `src/firebaseConfig.js` — Firebase init
- `src/hooks/useOwnerAuth.js` — Auth hook (latest: REST API approach)
- `src/components/OwnerLoginModal.js` — Login modal UI
- `src/AppNavigator.js` — Wires login modal, passes `onLogin` handler

## Login Flow
1. User long-presses avatar on Profile screen (3s)
2. `OwnerLoginModal` appears
3. User enters email/password, taps "Sign In"
4. `handleSubmit` sets `submitting=true`, calls `onLogin(email, password)`
5. `onLogin` is `handleLogin` in AppNavigator which calls `login()` from `useOwnerAuth`
6. **The `await` never returns** — spinner stays forever

## Theories
1. **React Native `fetch` blocked in Modal?** — The Modal component may be blocking the JS thread or network calls.
2. **Metro bundler intercepting requests?** — Debug builds route network through Metro; could be interfering.
3. **Hermes engine issue?** — Hermes handles Promises differently; async/await in the auth flow may have a subtle bug.
4. **State update during unmount?** — The `setSubmitting(false)` after `await` may not fire if component re-renders.

## Quick Test to Try
Add this to any screen (not inside a Modal) to test if `fetch` works at all:
```js
fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyABtGR_xpkhKskHPJ26_ViVmW_5pALYwp8', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'reebootradio@gmail.com',
    password: 'Reeboot2026',
    returnSecureToken: true,
  }),
})
  .then(r => r.json())
  .then(d => Alert.alert('Result', JSON.stringify(d.localId || d.error)))
  .catch(e => Alert.alert('Error', e.message));
```
If this works outside a Modal but not inside, the Modal is the issue.

## Current State
- Firestore schedule data is seeded (28 slots across 7 days)
- Owner user doc exists in Firestore (`users/LF1G3wKbYHYPw4RUu8iEEoRfJDR2` with `role: 'owner'`)
- Firebase Auth user exists (`reebootradio@gmail.com` / `Reeboot2026`)
- All Control Room screens are built and wired up
- The ONLY blocker is the auth login hanging in the app
