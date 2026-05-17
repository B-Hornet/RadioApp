# Owner Control Room — Design Spec

## Overview

A dedicated owner-only dashboard centralizing all administrative functions for Reeboot Radio. Accessible via Firebase Auth (email/password), hidden from regular users.

## Access & Auth

- Long-press Profile screen header (3s) reveals login modal
- Firebase Auth sign-in with `reebootradio@gmail.com`
- Firestore `users/{uid}` doc checked for `role: 'owner'`
- On verified owner auth, "Control Room" nav item appears in NavDock
- Auth state persists across restarts via Firebase Auth persistence

## Control Room Tabs

### 1. SCHEDULE — DJ Time Slot Manager
- Day selector tabs (MON–SUN)
- List of slots for selected day from `schedule` collection
- Each slot: editable djName, showName, startTime, endTime
- "Set Live" toggle (exclusive — only one slot live at a time)
- Swipe-to-delete, "Add Slot" button
- Real-time sync via `onSnapshot`

### 2. REQUESTS — Song Request Queue
- Real-time list from existing `songRequests` collection
- Shows: song, artist, requester, vote count
- Approve (highlights/pins), Deny (removes), Pin to top
- Clear all button

### 3. LIVE STATS — Listener Dashboard
- Active listener count from `Chatrooms/reebootlive`
- Listener locations (city/region list sorted by count)
- Peak listeners today/this week
- Currently playing track
- Chat message rate (messages/minute)

### 4. SHOUTOUTS — Broadcast Messages
- Text input + preview
- Send writes to `shoutouts` collection
- All clients display banner via `ShoutoutBanner` component
- History of sent shoutouts

### 5. GIVEAWAYS — Random Listener Picker
- Pull active listeners list
- Animated random picker
- Winner announced via `shoutouts` collection (type: 'giveaway')
- Giveaway history log

## Firestore Collections

### New Collections

**`schedule/{id}`**
- `day` (string: "MON"–"SUN")
- `startTime` (string: "10 PM")
- `endTime` (string: "12 AM")
- `djName` (string)
- `showName` (string)
- `isLive` (boolean)
- `order` (number)

**`users/{uid}`**
- `email` (string)
- `role` (string: 'owner' | 'listener')
- `displayName` (string)

**`shoutouts/{id}`**
- `message` (string)
- `type` (string: 'shoutout' | 'giveaway')
- `winner` (string, optional — for giveaways)
- `createdAt` (serverTimestamp)
- `expiresAt` (timestamp — auto-dismiss after duration)

**`appState/listeners`**
- `locations` (map: city → count)
- `peakToday` (number)
- `peakThisWeek` (number)
- `updatedAt` (serverTimestamp)

### Existing Collections (unchanged)
- `songRequests` — used by Requests tab
- `Messages` — used for chat rate calculation
- `Chatrooms` — used for listener count

## Listener-Side Changes

- `ShoutoutBanner` component on all screens — listens to `shoutouts`, shows animated banner
- `GiveawayModal` — full-screen winner announcement
- Location tracking on app open (city-level via device locale/timezone)

## New Files

- `src/screens/ControlRoom.js` — Tab container with auth gate
- `src/screens/controlroom/ScheduleManager.js`
- `src/screens/controlroom/RequestManager.js`
- `src/screens/controlroom/LiveDashboard.js`
- `src/screens/controlroom/ShoutoutPanel.js`
- `src/screens/controlroom/GiveawayPanel.js`
- `src/components/OwnerLoginModal.js`
- `src/components/ShoutoutBanner.js`
- `src/components/GiveawayModal.js`
- `src/hooks/useOwnerAuth.js`
- `src/scripts/seedSchedule.js` — Firestore seed script

## Modified Files

- `src/AppNavigator.js` — Add ControlRoom route, conditionally show in NavDock
- `src/screens/DJSchedule.js` — Fetch from Firestore instead of hardcoded data
- `src/screens/ListenerProfile.js` — Add long-press trigger for login modal
- `src/components/NavDock.js` — Show Control Room icon for owner

## Owner Account Setup

- Firebase Auth user created for `reebootradio@gmail.com`
- Firestore `users/{uid}` doc with `role: 'owner'`
- Seed script populates `schedule` collection with sample data matching current placeholders
