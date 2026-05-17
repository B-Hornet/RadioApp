/**
 * RNTP v4 Playback Service
 * ─────────────────────────────────────────────────────────────
 * Registered via TrackPlayer.registerPlaybackService in index.js.
 * Without this file the lock-screen / Control Center / Bluetooth
 * remote events are never delivered, and the capabilities declared
 * in setupPlayer.js silently do nothing.
 *
 * Live radio: only Play, Pause, Stop, and Duck are meaningful.
 * Seek/Jump/Skip are intentionally omitted because the source is
 * a live ICY stream with no rewindable timeline.
 */

import TrackPlayer, { Event } from 'react-native-track-player';

module.exports = async function () {
  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    TrackPlayer.play().catch(() => {});
  });

  TrackPlayer.addEventListener(Event.RemotePause, () => {
    TrackPlayer.pause().catch(() => {});
  });

  TrackPlayer.addEventListener(Event.RemoteStop, () => {
    TrackPlayer.stop().catch(() => {});
  });

  // Audio focus / interruption (calls, other media, route loss).
  // permanent=true means audio focus is gone for good — pause.
  // paused=true means transient loss — pause; do not auto-resume on
  // paused=false because the user may want to stay paused.
  TrackPlayer.addEventListener(Event.RemoteDuck, (event) => {
    if (event.permanent || event.paused) {
      TrackPlayer.pause().catch(() => {});
    }
  });
};
