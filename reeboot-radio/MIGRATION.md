# Midnight Broadcast Booth — Migration Guide

## What's in this package

```
src/
├── theme/
│   └── tokens.js          ← NEW: replaces your existing theme.js + constants.js
├── components/
│   ├── index.js           ← barrel exports
│   ├── Glass.js           ← NEW: shared glass-panel surface (replaces flat cards)
│   ├── LiveBadge.js       ← NEW: animated LIVE indicator
│   ├── ListenerPill.js    ← NEW: listener count pill
│   ├── VisualizerBars.js  ← NEW: Reanimated audio visualizer
│   ├── StudioLogo.js      ← NEW: MP4 logo + fallback (replaces pulsing image)
│   ├── MiniPlayer.js      ← NEW: persistent mini player bar
│   └── NavDock.js         ← NEW: bottom navigation dock
├── screens/
│   ├── RadioPlayer.js     ← REWRITTEN: full hero player
│   ├── HubScreen.js       ← REWRITTEN: live hero card + quick grid
│   ├── ChatRoom.js        ← REWRITTEN: talkback glass chat
│   ├── DJSchedule.js      ← REWRITTEN: timeline layout
│   └── ListenerProfile.js ← REWRITTEN: editorial stats + badge grid
└── AppNavigator.js        ← REWRITTEN: Stack + NavDock + MiniPlayer
```

## Prerequisites

Install these packages if you don't have them:

```bash
# Reanimated (UI-thread animations — the backbone of all motion)
npm install react-native-reanimated

# Safe area (already likely installed with React Navigation)
npm install react-native-safe-area-context

# You already have react-native-video ^6.19.0 — keep it
```

**babel.config.js** — add Reanimated plugin if not present:
```js
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: ['react-native-reanimated/plugin'], // must be last
};
```

## Font Installation

The design system uses three font families. Download and link them:

1. **Oswald** (display/headlines): https://fonts.google.com/specimen/Oswald
   - Oswald-Bold.ttf, Oswald-SemiBold.ttf, Oswald-Medium.ttf
2. **DM Sans** (body): https://fonts.google.com/specimen/DM+Sans
   - DMSans-Regular.ttf, DMSans-Medium.ttf, DMSans-SemiBold.ttf, DMSans-Bold.ttf
3. **JetBrains Mono** (data/mono): https://fonts.google.com/specimen/JetBrains+Mono
   - JetBrainsMono-Regular.ttf, JetBrainsMono-Medium.ttf

Place in `assets/fonts/` and add to `react-native.config.js`:
```js
module.exports = {
  project: {
    ios: {},
    android: {},
  },
  assets: ['./assets/fonts'],
};
```

Then run:
```bash
npx react-native-asset
```

## Step-by-Step Migration

### 1. Replace the theme
```bash
# Back up old theme
cp src/theme.js src/theme.js.bak
cp src/constants.js src/constants.js.bak

# Copy new tokens
cp reeboot-radio/src/theme/tokens.js src/theme/tokens.js
```

Update imports across the project:
```js
// OLD
import { colors, spacing } from '../theme';

// NEW
import { colors, typography, spacing, radius, elevation, presets } from '../theme/tokens';
```

### 2. Add the new components
```bash
cp reeboot-radio/src/components/*.js src/components/
```

### 3. Update StudioLogo asset paths
Open `src/components/StudioLogo.js` and verify lines 30-31 match your actual asset paths:
```js
const LOGO_VIDEO = require('../../assets/Images/Radio App Background.mp4');
const LOGO_IMAGE = require('../../assets/Images/reebologo.png');
```

### 4. Replace screens one at a time

**Recommended order** (least → most risk):

1. **DJSchedule.js** — standalone, low coupling
2. **ListenerProfile.js** — standalone, no real-time data
3. **HubScreen.js** — replaces the Hub inside AppNavigator
4. **RadioPlayer.js** — replaces player + connects to stream
5. **ChatRoom.js** — has Firebase coupling, migrate carefully

For each screen:
```bash
cp src/screens/ScreenName.js src/screens/ScreenName.js.bak
cp reeboot-radio/src/screens/ScreenName.js src/screens/ScreenName.js
```

### 5. Update AppNavigator
```bash
cp src/AppNavigator.js src/AppNavigator.js.bak
cp reeboot-radio/src/AppNavigator.js src/AppNavigator.js
```

**Important**: The new AppNavigator imports all screens. Make sure `WelcomeScreen`, `SongRequests`, and `MerchShop` still exist (they aren't rewritten in this package — they keep working as-is).

### 6. Connect Firebase to ChatRoom

The new ChatRoom uses placeholder messages. To connect your existing Firebase listener:

```js
// In ChatRoom.js, replace the static messages array with your Firestore query.
// Your existing pattern from _setupMessageStream():

useEffect(() => {
  let query = firestore()
    .collection('streams')
    .doc(streamId)
    .collection('chat')
    .orderBy('timestamp', descending: true);

  // CRITICAL: Session boundary filter (from chat-system-rules-v3)
  if (streamStartedAt) {
    query = query.where('timestamp', isGreaterThanOrEqualTo: streamStartedAt);
  }

  const unsub = query.limit(150).onSnapshot(snapshot => {
    const msgs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setMessages(msgs.reverse());
  });

  return () => unsub();
}, [streamId, streamStartedAt]);
```

### 7. Connect stream state to MiniPlayer

In `AppNavigator.js`, connect the MiniPlayer props to your actual audio state:

```js
// Replace static props with your stream store:
import { useStreamStore } from '../stores/streamStore'; // or wherever

const stream = useStreamStore(s => s.currentStream);
const isPlaying = useStreamStore(s => s.isPlaying);

<MiniPlayer
  trackTitle={stream?.title || 'Reeboot Radio'}
  djName={stream?.djName || ''}
  isPlaying={isPlaying}
  isLive={stream?.isLive || false}
  onPress={() => handleNavigate('RadioPlayer')}
  onPlayPause={togglePlayback}
/>
```

## Verification Checklist

After migration, verify:

- [ ] Fonts render correctly (Oswald for headlines, DM Sans for body, JetBrains for data)
- [ ] MP4 logo plays in StudioLogo on player screen
- [ ] Logo falls back to static image if video fails
- [ ] NavDock navigation works to all 5 screens
- [ ] MiniPlayer hides on Welcome + RadioPlayer, shows everywhere else
- [ ] LiveBadge dot pulses smoothly
- [ ] VisualizerBars animate when playing, flatten when paused
- [ ] Chat messages enter with slide animation
- [ ] No hardcoded colors remain (grep for `#` in screen files)
- [ ] Chat text uses `textAlign: 'left'` everywhere (never justify)
- [ ] Glass panels have consistent blur + border across all screens

## What's NOT in this package (keep as-is)

- `WelcomeScreen.js` — keep your existing MP4 background welcome
- `SongRequests.js` — keep existing, will upgrade in next pass
- `MerchShop.js` — keep existing placeholder
- `LiveReactions.js` — functionality merged into RadioPlayer
- Firebase configuration — untouched
- Audio streaming logic — untouched

## Design Token Quick Reference

| Token | Value | Usage |
|-------|-------|-------|
| `colors.primary` | `#FF6B00` | Brand orange, CTAs, active states |
| `colors.bgDeep` | `#08080C` | Deepest background |
| `colors.glass` | `rgba(255,255,255,0.04)` | Glass panel fill |
| `spacing.screen` | `20` | Horizontal page padding |
| `spacing.sm` | `8` | Small gaps |
| `spacing.lg` | `16` | Card internal padding |
| `radius.lg` | `16` | Glass panel corners |
| `radius.full` | `999` | Pills and circles |
| `typography.size.md` | `13` | Body text |
| `typography.size.xxl` | `26` | Screen titles |
