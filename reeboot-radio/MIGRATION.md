# Midnight Broadcast Booth — Migration Guide

## Overview
This package replaces the existing Reeboot Radio UI with the **Midnight Broadcast Booth** redesign.
The new theme uses a deep midnight color palette, broadcast-studio-inspired typography (Oswald, DM Sans, JetBrains Mono), and redesigned screens built on a unified token system.

## Prerequisites
- `react-native-reanimated` (>= 3.x) must be installed and its Babel plugin added.
- `react-native-safe-area-context` (>= 4.x) must be installed.
- Custom fonts must be linked (see Step 7).

## Migration Steps

### Step 1 — Replace theme and constants
The old `src/theme.js` and `src/constants.js` are merged into a single file:
```
src/theme/tokens.js
```
Copy `reeboot-radio/src/theme/tokens.js` → `src/theme/tokens.js` (create the `src/theme/` directory first).

**Back up** `src/theme.js` and `src/constants.js` before replacing.

Old imports like:
```js
import { colors, spacing, fonts, borderRadius } from '../theme';
import { DAYS, DEFAULT_SCHEDULE, ... } from '../constants';
```
become:
```js
import { colors, spacing, fonts, borderRadius, STREAM_URL, CHATROOM_ID, CHAT_COLORS, REACTIONS, DAYS, DEFAULT_SCHEDULE, BADGES, MESSAGE_LIMIT, LEADERBOARD_LIMIT } from '../theme/tokens';
```

### Step 2 — Copy new components
Copy everything from `reeboot-radio/src/components/` into `src/components/`:
- `StudioLogo.js` — animated logo component (uses the existing MP4 + PNG assets)

**Back up** any existing component files you are replacing.

### Step 3 — Replace screens (in order)
Replace the following screens **one at a time, in this exact order**. Back up each file before overwriting.

1. `DJSchedule.js`
2. `ListenerProfile.js`
3. `HubScreen.js` *(new file — the Hub is extracted from AppNavigator)*
4. `RadioPlayer.js` *(moves from components/ to screens/)*
5. `ChatRoom.js`

### Step 4 — Replace AppNavigator.js
Copy `reeboot-radio/src/AppNavigator.js` → `src/AppNavigator.js`.
**This must be done LAST** because it depends on the new screens and components.

### Step 5 — Do NOT touch these files
The following screens should **not** be replaced. They will continue to work but their imports must be updated to point to `../theme/tokens` instead of `../theme`:
- `WelcomeScreen.js`
- `SongRequests.js`
- `MerchShop.js`
- `LiveReactions.js`

### Step 6 — Install dependencies
```bash
npm install react-native-reanimated
npm install react-native-safe-area-context  # if not already installed
```
Add the Reanimated Babel plugin to `babel.config.js`:
```js
plugins: [
  // ... existing plugins
  'react-native-reanimated/plugin',  // MUST be listed last
],
```

### Step 7 — Install fonts
Download and place these font files in `assets/fonts/`:
- Oswald-Bold.ttf, Oswald-SemiBold.ttf, Oswald-Medium.ttf
- DMSans-Regular.ttf, DMSans-Medium.ttf, DMSans-SemiBold.ttf, DMSans-Bold.ttf
- JetBrainsMono-Regular.ttf, JetBrainsMono-Medium.ttf

Then run:
```bash
npx react-native-asset
```

### Token Name Mapping (old → new)
All old token names are preserved in the new `tokens.js`, so existing code will work without changes. The following new tokens have been added:

| New Token | Value | Purpose |
|-----------|-------|---------|
| `colors.midnight` | `#0A0A1A` | Deepest background |
| `colors.boothSurface` | `#12122A` | Primary surface |
| `colors.dial` | `#E84A1C` | Primary accent (broadcast dial) |
| `colors.frequency` | `#00E5A0` | Secondary accent (frequency green) |
| `colors.signalYellow` | `#FFD23F` | Tertiary accent |
| `colors.onAirRed` | `#FF2D2D` | Live/on-air indicator |
| `fonts.families.display` | `'Oswald-Bold'` | Headlines |
| `fonts.families.body` | `'DMSans-Regular'` | Body text |
| `fonts.families.mono` | `'JetBrainsMono-Regular'` | Metadata |

The old color names (`primary`, `secondary`, `background`, `surface`, etc.) still exist and map to the new palette values for backwards compatibility.
