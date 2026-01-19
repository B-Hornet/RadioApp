// File: src/components/VideoPlayer.js
// Unified video player component supporting HLS and WHEP playback
// This is the shared player used by both preview cards and chatroom

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Video from 'react-native-video';
import PropTypes from 'prop-types';
import {
  PlaybackMode,
  getPlaybackUrlForStream,
  validatePlaybackUrl,
} from '../services/cloudflareStreamService';

/**
 * Player states for tracking playback status
 */
const PlayerState = {
  IDLE: 'idle',
  LOADING: 'loading',
  PLAYING: 'playing',
  PAUSED: 'paused',
  BUFFERING: 'buffering',
  ERROR: 'error',
};

/**
 * Unified Video Player Component
 *
 * Handles both HLS and WHEP playback based on stream configuration.
 * For WHEP (WebRTC) playback, falls back to HLS if WebRTC is not supported.
 *
 * @param {Object} props
 * @param {Object} props.streamData - Stream data containing playback info
 * @param {string} props.playbackUrl - Direct playback URL (optional, overrides streamData)
 * @param {string} props.playbackMode - Force specific mode: 'hls' or 'whep'
 * @param {boolean} props.autoPlay - Start playing automatically
 * @param {boolean} props.muted - Start muted
 * @param {boolean} props.showControls - Show playback controls
 * @param {boolean} props.isPreview - Preview mode (smaller, no controls)
 * @param {Function} props.onError - Error callback
 * @param {Function} props.onLoad - Load complete callback
 * @param {Function} props.onStateChange - Player state change callback
 * @param {Object} props.style - Additional container styles
 */
const VideoPlayer = ({
  streamData,
  playbackUrl: directUrl,
  playbackMode: forcedMode,
  autoPlay = false,
  muted = false,
  showControls = true,
  isPreview = false,
  onError,
  onLoad,
  onStateChange,
  style,
}) => {
  const videoRef = useRef(null);
  const [playerState, setPlayerState] = useState(PlayerState.IDLE);
  const [errorMessage, setErrorMessage] = useState(null);
  const [playbackUrl, setPlaybackUrl] = useState(null);
  const [playbackMode, setPlaybackMode] = useState(null);
  const [isPaused, setIsPaused] = useState(!autoPlay);
  const [isMuted, setIsMuted] = useState(muted);

  /**
   * Determine the correct playback URL and mode
   */
  useEffect(() => {
    let url = directUrl;
    let mode = forcedMode;

    if (!url && streamData) {
      const result = getPlaybackUrlForStream(streamData);
      url = result.url;
      mode = result.mode;
    }

    if (url) {
      // Validate the URL
      const validation = validatePlaybackUrl(url);

      if (!validation.isValid && validation.error) {
        console.warn(`VideoPlayer: URL validation warning - ${validation.error}`);
        // Still try to use the URL, but log the warning
      }

      // If forced mode is not set, use validated mode or default to HLS
      if (!mode) {
        mode = validation.mode || PlaybackMode.HLS;
      }

      // WHEP (WebRTC) requires special handling
      // React Native Video doesn't support WebRTC natively
      // Fall back to HLS if WHEP is detected
      if (mode === PlaybackMode.WHEP) {
        console.warn('VideoPlayer: WHEP (WebRTC) playback requested but not natively supported.');
        console.warn('VideoPlayer: Attempting HLS fallback. For WebRTC, use WebView-based player.');

        // Try to construct HLS URL from WHEP URL
        const hlsFallbackUrl = url.replace('/webRTC/play', '/manifest/video.m3u8');
        url = hlsFallbackUrl;
        mode = PlaybackMode.HLS;
      }

      setPlaybackUrl(url);
      setPlaybackMode(mode);
      setPlayerState(PlayerState.LOADING);
      setErrorMessage(null);
    } else {
      setErrorMessage('No valid playback URL available');
      setPlayerState(PlayerState.ERROR);
    }
  }, [directUrl, streamData, forcedMode]);

  /**
   * Notify parent of state changes
   */
  useEffect(() => {
    if (onStateChange) {
      onStateChange(playerState);
    }
  }, [playerState, onStateChange]);

  /**
   * Handle video load complete
   */
  const handleLoad = useCallback((data) => {
    console.log('VideoPlayer: Video loaded', data);
    setPlayerState(isPaused ? PlayerState.PAUSED : PlayerState.PLAYING);
    if (onLoad) {
      onLoad(data);
    }
  }, [isPaused, onLoad]);

  /**
   * Handle video errors
   */
  const handleError = useCallback((error) => {
    console.error('VideoPlayer: Playback error', error);

    let message = 'Failed to load video';

    if (error?.error) {
      const errorCode = error.error.code || error.error.errorCode;
      const errorString = error.error.errorString || error.error.message;

      // Common error handling
      if (errorCode === -11800 || errorString?.includes('404')) {
        message = 'Stream not found. Check if the stream is live and the URL is correct.';
      } else if (errorCode === -11819 || errorString?.includes('format')) {
        message = 'Unsupported video format. The stream may be using WebRTC (WHIP) ingest.';
      } else if (errorString?.includes('network')) {
        message = 'Network error. Check your internet connection.';
      } else if (errorString) {
        message = errorString;
      }
    }

    setErrorMessage(message);
    setPlayerState(PlayerState.ERROR);

    if (onError) {
      onError({ ...error, friendlyMessage: message });
    }
  }, [onError]);

  /**
   * Handle buffering state
   */
  const handleBuffer = useCallback(({ isBuffering }) => {
    if (isBuffering) {
      setPlayerState(PlayerState.BUFFERING);
    } else {
      setPlayerState(isPaused ? PlayerState.PAUSED : PlayerState.PLAYING);
    }
  }, [isPaused]);

  /**
   * Toggle play/pause
   */
  const togglePlayPause = useCallback(() => {
    setIsPaused(prev => !prev);
    setPlayerState(isPaused ? PlayerState.PLAYING : PlayerState.PAUSED);
  }, [isPaused]);

  /**
   * Toggle mute
   */
  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  /**
   * Retry playback after error
   */
  const retryPlayback = useCallback(() => {
    setErrorMessage(null);
    setPlayerState(PlayerState.LOADING);
    // Force video reload by clearing and resetting URL
    const currentUrl = playbackUrl;
    setPlaybackUrl(null);
    setTimeout(() => setPlaybackUrl(currentUrl), 100);
  }, [playbackUrl]);

  /**
   * Render loading indicator
   */
  const renderLoading = () => (
    <View style={styles.overlay}>
      <ActivityIndicator size={isPreview ? 'small' : 'large'} color="#fff" />
      {!isPreview && <Text style={styles.loadingText}>Loading stream...</Text>}
    </View>
  );

  /**
   * Render error state
   */
  const renderError = () => (
    <View style={styles.overlay}>
      <Text style={styles.errorIcon}>!</Text>
      <Text style={styles.errorText}>
        {isPreview ? 'Error' : errorMessage || 'Playback error'}
      </Text>
      {!isPreview && (
        <TouchableOpacity style={styles.retryButton} onPress={retryPlayback}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  /**
   * Render playback controls
   */
  const renderControls = () => {
    if (!showControls || isPreview) return null;

    return (
      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.controlButton} onPress={togglePlayPause}>
          <Text style={styles.controlIcon}>{isPaused ? '>' : '||'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={toggleMute}>
          <Text style={styles.controlIcon}>{isMuted ? 'X' : ')'}</Text>
        </TouchableOpacity>
        {playbackMode && (
          <View style={styles.modeBadge}>
            <Text style={styles.modeBadgeText}>{playbackMode.toUpperCase()}</Text>
          </View>
        )}
      </View>
    );
  };

  /**
   * Render preview overlay with play button
   */
  const renderPreviewOverlay = () => {
    if (!isPreview || playerState === PlayerState.PLAYING) return null;

    return (
      <TouchableOpacity
        style={styles.previewOverlay}
        onPress={togglePlayPause}
        activeOpacity={0.8}
      >
        <View style={styles.previewPlayButton}>
          <Text style={styles.previewPlayIcon}>></Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, isPreview && styles.previewContainer, style]}>
      {playbackUrl && playerState !== PlayerState.ERROR ? (
        <>
          <Video
            ref={videoRef}
            source={{ uri: playbackUrl }}
            style={styles.video}
            resizeMode={isPreview ? 'cover' : 'contain'}
            paused={isPaused}
            muted={isMuted}
            repeat={false}
            playInBackground={false}
            playWhenInactive={false}
            onLoad={handleLoad}
            onError={handleError}
            onBuffer={handleBuffer}
            onEnd={() => setPlayerState(PlayerState.PAUSED)}
            bufferConfig={{
              minBufferMs: 15000,
              maxBufferMs: 30000,
              bufferForPlaybackMs: 2500,
              bufferForPlaybackAfterRebufferMs: 5000,
            }}
          />
          {(playerState === PlayerState.LOADING || playerState === PlayerState.BUFFERING) && renderLoading()}
          {renderPreviewOverlay()}
          {renderControls()}
        </>
      ) : (
        renderError()
      )}
    </View>
  );
};

VideoPlayer.propTypes = {
  streamData: PropTypes.shape({
    streamId: PropTypes.string,
    playbackUrl: PropTypes.string,
    playbackId: PropTypes.string,
    cloudflareStreamId: PropTypes.string,
    platform: PropTypes.string,
    webrtcPlaybackUrl: PropTypes.string,
    hlsUrl: PropTypes.string,
  }),
  playbackUrl: PropTypes.string,
  playbackMode: PropTypes.oneOf([PlaybackMode.HLS, PlaybackMode.WHEP]),
  autoPlay: PropTypes.bool,
  muted: PropTypes.bool,
  showControls: PropTypes.bool,
  isPreview: PropTypes.bool,
  onError: PropTypes.func,
  onLoad: PropTypes.func,
  onStateChange: PropTypes.func,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    overflow: 'hidden',
    aspectRatio: 16 / 9,
  },
  previewContainer: {
    borderRadius: 8,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 14,
  },
  errorIcon: {
    color: '#ff4444',
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  errorText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  retryButton: {
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#1e90ff',
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  controlButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  controlIcon: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modeBadge: {
    marginLeft: 'auto',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(30, 144, 255, 0.8)',
    borderRadius: 4,
  },
  modeBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewPlayButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(30, 144, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewPlayIcon: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});

export { VideoPlayer, PlayerState };
export default VideoPlayer;
