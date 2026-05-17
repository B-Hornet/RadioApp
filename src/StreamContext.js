/**
 * StreamContext — Shared live stream state
 * ═══════════════════════════════════════════
 * Provides playback state and ICY metadata to all screens.
 * Wraps react-native-track-player so RadioPlayer, MiniPlayer,
 * and HubScreen all share the same source of truth.
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import TrackPlayer, {
  usePlaybackState,
  useTrackPlayerEvents,
  State,
  Event,
} from 'react-native-track-player';

const StreamContext = createContext({
  isPlaying: false,
  isLive: false,
  trackTitle: 'Reeboot Radio',
  artistName: 'What Radio Should Sound Like',
  togglePlayback: () => {},
});

export function StreamProvider({ children }) {
  const playbackState = usePlaybackState();
  const [trackTitle, setTrackTitle] = useState('Reeboot Radio');
  const [artistName, setArtistName] = useState('What Radio Should Sound Like');

  // Handle both RNTP v3 (returns State directly) and v4 (returns { state })
  const rawState = playbackState?.state ?? playbackState;
  const isPlaying = rawState === State.Playing;
  // "Live" = data is actively flowing from the stream. Buffering counts
  // because the stream is reachable; Playing obviously does. Paused /
  // Stopped / None / Error do not — we have no truthful signal that
  // the broadcast is up unless we're receiving bytes.
  const isLive = rawState === State.Playing || rawState === State.Buffering;

  // Listen for ICY metadata from the Live365 stream
  useTrackPlayerEvents(
    [Event.PlaybackMetadataReceived, Event.PlaybackActiveTrackChanged],
    (event) => {
      if (event.type === Event.PlaybackMetadataReceived) {
        // ICY metadata: "Artist - Title" or just "Title"
        const raw = event.title || '';
        if (raw.includes(' - ')) {
          const [artist, ...rest] = raw.split(' - ');
          setArtistName(artist.trim());
          setTrackTitle(rest.join(' - ').trim());
        } else if (raw) {
          setTrackTitle(raw);
        }
        if (event.artist) {
          setArtistName(event.artist);
        }
      }
      if (event.type === Event.PlaybackActiveTrackChanged && event.track) {
        if (event.track.title) setTrackTitle(event.track.title);
        if (event.track.artist) setArtistName(event.track.artist);
      }
    },
  );

  const togglePlayback = useCallback(async () => {
    try {
      if (isPlaying) {
        await TrackPlayer.pause();
      } else {
        await TrackPlayer.play();
      }
    } catch (error) {
      console.error('Playback toggle error:', error);
    }
  }, [isPlaying]);

  return (
    <StreamContext.Provider
      value={{ isPlaying, isLive, trackTitle, artistName, togglePlayback }}
    >
      {children}
    </StreamContext.Provider>
  );
}

export function useStream() {
  return useContext(StreamContext);
}
