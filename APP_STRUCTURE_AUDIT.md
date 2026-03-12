# RadioApp - Structure & Design Audit

## App Structure & Navigation

**RadioApp** is a React Native app for **Reeboot Radio** using React Navigation (Stack Navigator) and Firebase Firestore for real-time data.

### Navigation Flow
```
WelcomeScreen (initial route)
  └── HubScreen (central hub / "Home")
        ├── RadioPlayer + LiveReactions (live stream playback)
        ├── ChatRoom (real-time messaging)
        ├── SongRequests (request queue with voting)
        ├── DJSchedule (weekly schedule + now playing)
        ├── ListenerProfile (stats, badges, leaderboard)
        └── MerchShop (placeholder - coming soon)
```

### Screen Files

| File | Lines | Purpose |
|------|-------|---------|
| `src/screens/WelcomeScreen.js` | 137 | Full-screen looping MP4 video background with animated fade-in buttons |
| `src/AppNavigator.js` (HubScreen) | 369 | Central navigation hub with branded header, feature cards, and grid tiles |
| `src/components/RadioPlayer.js` | 228 | Live stream player with pulsing artwork, play/pause, audio visualizer bars |
| `src/screens/ChatRoom.js` | 468 | Real-time chat with color-coded usernames, live listener count |
| `src/screens/SongRequests.js` | 414 | Song request queue with voting, status badges, toggle form |
| `src/screens/DJSchedule.js` | 373 | Weekly DJ schedule with day selector, now-playing banner, genre badges |
| `src/screens/ListenerProfile.js` | 425 | Gamification dashboard: stats grid, 9 badges, top-10 leaderboard |
| `src/screens/MerchShop.js` | 70 | Placeholder "Coming Soon" page |
| `src/components/LiveReactions.js` | 201 | Floating emoji reaction overlay (🔥❤️👏💯) on RadioPlayer |

### Firebase Collections

| Collection | Purpose | Realtime |
|-----------|---------|----------|
| `Messages` | Chat messages | Yes |
| `songRequests` | Song request queue | Yes |
| `djSchedule` | DJ show schedule | Yes |
| `liveReactions` | Emoji reactions | Yes |
| `leaderboard` | Weekly rankings | Yes |
| `Chatrooms/{id}` | Chat metadata | Yes |
| `appState/nowPlaying` | Current track | Yes |
| `appState/reactionCounts` | Reaction totals | Yes |

---

## Theme & Design System

**Files:** `src/theme.js`, `src/constants.js`

### Color Palette
- **Primary:** `#FF6B00` (Orange) / Light: `#FF8C3A` / Dark: `#CC5500`
- **Secondary:** `#1DB954` (Green) / Light: `#1ED760` / Dark: `#17A348`
- **Backgrounds:** `#0D0D0D` → `#1A1A2E` → `#242442` → `#2D2D4A`
- **Text:** `#FFFFFF` (primary) / `#B0B0C0` (secondary) / `#6B6B80` (muted)
- **Status:** Live `#FF3B30` / Online `#1DB954` / Warning `#FFD60A`
- **Reactions:** Fire `#FF6B00` / Heart `#FF3B5C` / Clap `#FFD60A` / Hundred `#1DB954`

### Typography
| Token | Size |
|-------|------|
| XS | 10px |
| SM | 12px |
| MD | 14px |
| LG | 16px |
| XL | 20px |
| XXL | 28px |
| Hero | 36px |

Weights: Regular(400), Medium(500), Semibold(600), Bold(700), Heavy(800)

### Spacing
| Token | Value |
|-------|-------|
| XS | 4px |
| SM | 8px |
| MD | 16px |
| LG | 24px |
| XL | 32px |
| XXL | 48px |

### Border Radius
SM(6) → MD(12) → LG(20) → XL(30) → Full(999)

---

## UI Quality Audit

### 1. Hardcoded Colors (Not Using Theme Tokens)

| File | Line | Issue |
|------|------|-------|
| `WelcomeScreen.js` | 74 | `backgroundColor: '#000000'` → should use `colors.background` |
| `WelcomeScreen.js` | 113 | `color: '#FF3B00'` → wrong hex, should use `colors.primary` |
| `WelcomeScreen.js` | 127 | `color: '#FF6B00'` → should use `colors.primary` |
| `WelcomeScreen.js` | 116-118, 130-132 | Hardcoded rgba textShadow values |
| `ChatRoom.js` | 424 | `color: 'rgba(255,255,255,0.5)'` → should use `colors.textMuted` |

### 2. Magic Numbers (Should Use Spacing Tokens)

| File | Line | Value | Should Be |
|------|------|-------|-----------|
| `WelcomeScreen.js` | 100 | `bottom: 80` | Spacing token |
| `WelcomeScreen.js` | 106, 121 | `spacing.md + 4` | Clean token value |
| `WelcomeScreen.js` | 92 | `height * 0.35` | Spacing/layout token |
| `ListenerProfile.js` | 208 | `width: 80, height: 80, borderRadius: 40` | Size constants |
| `ChatRoom.js` | 400 | `maxWidth: '78%'` | Layout constant |
| `DJSchedule.js` | 313 | `minWidth: 70` | Size constant |

### 3. Repeated `marginTop: 2` Anti-Pattern

Found across multiple files (should be `spacing.xs` = 4px):
- `ListenerProfile.js`: lines 270, 299, 323
- `DJSchedule.js`: lines 206, 323, 336
- `ChatRoom.js`: lines 416, 427
- `SongRequests.js`: lines 352, 391

### 4. Oversized Padding

| File | Line | Issue |
|------|------|-------|
| `ListenerProfile.js` | 200-204 | `paddingVertical: spacing.xl` (32px) on profile header |
| `ChatRoom.js` | 283-292 | `padding: spacing.xl` (32px) on username card |
| `DJSchedule.js` | 268 | `paddingBottom: spacing.xxl` (48px) excessive |
| `SongRequests.js` | 329 | `paddingBottom: spacing.xxl` (48px) excessive |

### 5. Generic Flat Cards (No Visual Hierarchy)

- All cards use identical `backgroundColor: colors.surface` + `borderRadius: borderRadius.md`
- No shadows, elevation, or accent differentiation
- Live states only use border color change (barely noticeable)
- Badge locked/unlocked only differs by opacity (0.35)

### 6. Inconsistent Button Styling

- ChatRoom join button: `borderRadius.xl` (30px) vs send button: `borderRadius.full` (999px)
- Disabled states differ: ChatRoom `opacity: 0.4` vs SongRequests `opacity: 0.5`
- Cancel button in SongRequests has no background styling

---

## MP4 Logo & Video Usage

### Video Background
- **Asset:** `assets/Images/Radio App Background.mp4` (18.1 MB)
- **Package:** `react-native-video ^6.19.0`
- **Used in:** `WelcomeScreen.js` — full-screen, looping, muted, covers entire screen
- **Config:** `repeat={true} muted={true} resizeMode="cover" controls={false}`

### Logo Images
- `assets/Images/reebologo.png` (250.7 KB) — RadioPlayer artwork (pulsing glow), HubScreen header
- `assets/Images/reebobanneer.png` (121.9 KB) — banner usage

### Animations
1. **WelcomeScreen** — Button fade-in: `Animated.timing` 1s duration, 600ms delay
2. **RadioPlayer** — Logo pulse: scale 1→1.15→1, looping when stream plays
3. **LiveReactions** — Floating emoji: translateY -200, opacity fade, 2s duration

### Native Splash Screens
- **Android:** `android/app/src/main/res/drawable/splash_screen.xml` — white bg + centered `reebologo.png`
- **iOS:** `Info.plist` UILaunchScreen with `SplashScreenBackground` color
