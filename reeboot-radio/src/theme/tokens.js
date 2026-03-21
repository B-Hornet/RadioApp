// Midnight Broadcast Booth — Unified Design Tokens
// Replaces both theme.js and constants.js

// ─── Color Palette ───────────────────────────────────────────────
export const colors = {
  // Midnight Broadcast Booth — primary palette
  midnight: '#0A0A1A',
  boothSurface: '#12122A',
  dial: '#E84A1C',
  frequency: '#00E5A0',
  signalYellow: '#FFD23F',
  onAirRed: '#FF2D2D',

  // Backwards-compatible aliases (old theme.js names → new values)
  primary: '#E84A1C',
  primaryLight: '#FF6B3D',
  primaryDark: '#C43A10',

  secondary: '#00E5A0',
  secondaryLight: '#33EDBA',
  secondaryDark: '#00B87D',

  background: '#0A0A1A',
  surface: '#12122A',
  surfaceLight: '#1C1C3A',
  surfaceHighlight: '#26264A',

  textPrimary: '#F0F0F5',
  textSecondary: '#A0A0BC',
  textMuted: '#5C5C78',
  textAccent: '#E84A1C',

  chatBubbleOwn: '#E84A1C',
  chatBubbleOther: '#1C1C3A',
  chatInput: '#12122A',
  chatBorder: '#26264A',

  live: '#FF2D2D',
  online: '#00E5A0',
  offline: '#5C5C78',
  warning: '#FFD23F',

  reactionFire: '#E84A1C',
  reactionHeart: '#FF3B5C',
  reactionClap: '#FFD23F',
  reactionHundred: '#00E5A0',

  tabActive: '#E84A1C',
  tabInactive: '#5C5C78',
  headerBackground: '#0A0A1A',
  headerBorder: '#12122A',

  border: '#26264A',
  divider: '#12122A',

  overlay: 'rgba(10, 10, 26, 0.85)',
  overlayLight: 'rgba(10, 10, 26, 0.5)',
};

// ─── Spacing ─────────────────────────────────────────────────────
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// ─── Typography ──────────────────────────────────────────────────
export const fonts = {
  families: {
    display: 'Oswald-Bold',
    displaySemiBold: 'Oswald-SemiBold',
    displayMedium: 'Oswald-Medium',
    body: 'DMSans-Regular',
    bodyMedium: 'DMSans-Medium',
    bodySemiBold: 'DMSans-SemiBold',
    bodyBold: 'DMSans-Bold',
    mono: 'JetBrainsMono-Regular',
    monoMedium: 'JetBrainsMono-Medium',
  },
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
    xxl: 28,
    hero: 36,
    mega: 48,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    heavy: '800',
  },
};

// ─── Border Radius ───────────────────────────────────────────────
export const borderRadius = {
  sm: 6,
  md: 12,
  lg: 20,
  xl: 30,
  full: 999,
};

// ─── App Constants (from old constants.js) ───────────────────────
export const STREAM_URL = 'https://streaming.live365.com/a49353';

export const CHATROOM_ID = 'reebootlive';

export const CHAT_COLORS = [
  '#E84A1C', '#00E5A0', '#FF3B5C', '#FFD23F',
  '#00D4FF', '#A855F7', '#FF6B3D', '#14B8A6',
];

export const REACTIONS = [
  { id: 'fire', emoji: '\uD83D\uDD25', label: 'Fire' },
  { id: 'heart', emoji: '\u2764\uFE0F', label: 'Love' },
  { id: 'clap', emoji: '\uD83D\uDC4F', label: 'Clap' },
  { id: 'hundred', emoji: '\uD83D\uDCAF', label: '100' },
];

export const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const DEFAULT_SCHEDULE = [
  { id: '1', djName: 'DJ Reeboot', showName: 'The Morning Mix', day: 'Monday', startTime: '8:00 AM', endTime: '12:00 PM', genre: 'Hip-Hop / R&B' },
  { id: '2', djName: 'DJ Reeboot', showName: 'Afternoon Vibes', day: 'Wednesday', startTime: '2:00 PM', endTime: '6:00 PM', genre: 'Soul / Funk' },
  { id: '3', djName: 'DJ Reeboot', showName: 'Friday Night Live', day: 'Friday', startTime: '8:00 PM', endTime: '12:00 AM', genre: 'EDM / Dance' },
  { id: '4', djName: 'DJ Reeboot', showName: 'Weekend Warm-Up', day: 'Saturday', startTime: '6:00 PM', endTime: '10:00 PM', genre: 'Mix / Open Format' },
];

export const BADGES = [
  { id: 'first_listen', name: 'First Tune-In', emoji: '\uD83C\uDFB5', description: 'Listened for the first time' },
  { id: 'chat_starter', name: 'Chat Starter', emoji: '\uD83D\uDCAC', description: 'Sent first chat message' },
  { id: 'song_requester', name: 'Song Requester', emoji: '\uD83C\uDFA4', description: 'Requested a song' },
  { id: 'night_owl', name: 'Night Owl', emoji: '\uD83E\uDD89', description: 'Listened after midnight' },
  { id: 'weekend_warrior', name: 'Weekend Warrior', emoji: '\u26A1', description: 'Tuned in every weekend for a month' },
  { id: 'top_voter', name: 'Top Voter', emoji: '\uD83D\uDC4D', description: 'Voted on 50+ song requests' },
  { id: 'loyal_listener', name: 'Loyal Listener', emoji: '\uD83D\uDC8E', description: '100+ hours of listening' },
  { id: 'fire_reactor', name: 'Fire Reactor', emoji: '\uD83D\uDD25', description: 'Sent 100+ reactions' },
  { id: 'community_og', name: 'Community OG', emoji: '\uD83D\uDC51', description: 'Member since day one' },
];

export const MESSAGE_LIMIT = 100;
export const LEADERBOARD_LIMIT = 10;
