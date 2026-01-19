// File: src/components/StreamPreviewCard.js
// Preview card component for displaying live stream thumbnails in a grid/list

import React, { useState, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import PropTypes from 'prop-types';
import VideoPlayer from './VideoPlayer';
import { getThumbnailUrl, PlaybackMode } from '../services/cloudflareStreamService';

/**
 * Stream Preview Card Component
 *
 * Displays a thumbnail preview of a live stream with metadata.
 * Can show either a static thumbnail or a live video preview.
 *
 * @param {Object} props
 * @param {Object} props.stream - Stream data object
 * @param {string} props.stream.id - Unique stream identifier
 * @param {string} props.stream.title - Stream title
 * @param {string} props.stream.streamerName - Name of the streamer
 * @param {string} props.stream.thumbnailUrl - Custom thumbnail URL
 * @param {string} props.stream.playbackId - Cloudflare playback ID
 * @param {boolean} props.stream.isLive - Whether stream is currently live
 * @param {number} props.stream.viewerCount - Number of current viewers
 * @param {string} props.stream.platform - Ingest platform (whip, rtmps, srt)
 * @param {Function} props.onPress - Callback when card is pressed
 * @param {boolean} props.showLivePreview - Show live video instead of thumbnail
 * @param {Object} props.style - Additional container styles
 */
const StreamPreviewCard = ({
  stream,
  onPress,
  showLivePreview = false,
  style,
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Get thumbnail URL - use custom or generate from Cloudflare
  const thumbnailUrl = stream.thumbnailUrl ||
    (stream.playbackId ? getThumbnailUrl(stream.playbackId) : null);

  /**
   * Handle card press
   */
  const handlePress = () => {
    if (onPress) {
      onPress(stream);
    }
  };

  /**
   * Render the live badge
   */
  const renderLiveBadge = () => {
    if (!stream.isLive) return null;

    return (
      <View style={styles.liveBadge}>
        <View style={styles.liveIndicator} />
        <Text style={styles.liveText}>LIVE</Text>
      </View>
    );
  };

  /**
   * Render viewer count
   */
  const renderViewerCount = () => {
    if (!stream.isLive || stream.viewerCount === undefined) return null;

    return (
      <View style={styles.viewerBadge}>
        <Text style={styles.viewerIcon}>O</Text>
        <Text style={styles.viewerCount}>
          {stream.viewerCount >= 1000
            ? `${(stream.viewerCount / 1000).toFixed(1)}K`
            : stream.viewerCount}
        </Text>
      </View>
    );
  };

  /**
   * Render platform badge (shows if using WHIP/WebRTC)
   */
  const renderPlatformBadge = () => {
    if (stream.platform !== 'whip') return null;

    return (
      <View style={styles.platformBadge}>
        <Text style={styles.platformText}>WebRTC</Text>
      </View>
    );
  };

  /**
   * Render thumbnail or video preview
   */
  const renderPreview = () => {
    // Show live video preview
    if (showLivePreview && stream.isLive) {
      return (
        <View style={styles.previewContainer}>
          <VideoPlayer
            streamData={stream}
            isPreview={true}
            autoPlay={false}
            muted={true}
            showControls={false}
            style={styles.videoPreview}
          />
          {renderLiveBadge()}
          {renderViewerCount()}
          {renderPlatformBadge()}
        </View>
      );
    }

    // Show thumbnail image
    return (
      <View style={styles.previewContainer}>
        {thumbnailUrl && !imageError ? (
          <>
            <Image
              source={{ uri: thumbnailUrl }}
              style={styles.thumbnail}
              resizeMode="cover"
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false);
                setImageError(true);
              }}
            />
            {imageLoading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="small" color="#fff" />
              </View>
            )}
          </>
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderIcon}>
              {stream.isLive ? '>' : 'O'}
            </Text>
            <Text style={styles.placeholderText}>
              {stream.isLive ? 'Tap to watch' : 'Offline'}
            </Text>
          </View>
        )}
        {renderLiveBadge()}
        {renderViewerCount()}
        {renderPlatformBadge()}
      </View>
    );
  };

  /**
   * Render stream metadata
   */
  const renderMetadata = () => (
    <View style={styles.metadataContainer}>
      <Text style={styles.title} numberOfLines={2}>
        {stream.title || 'Untitled Stream'}
      </Text>
      <Text style={styles.streamerName} numberOfLines={1}>
        {stream.streamerName || 'Unknown Streamer'}
      </Text>
      {stream.category && (
        <Text style={styles.category} numberOfLines={1}>
          {stream.category}
        </Text>
      )}
    </View>
  );

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {renderPreview()}
      {renderMetadata()}
    </TouchableOpacity>
  );
};

StreamPreviewCard.propTypes = {
  stream: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    streamerName: PropTypes.string,
    thumbnailUrl: PropTypes.string,
    playbackId: PropTypes.string,
    cloudflareStreamId: PropTypes.string,
    isLive: PropTypes.bool,
    viewerCount: PropTypes.number,
    platform: PropTypes.string,
    category: PropTypes.string,
    playbackUrl: PropTypes.string,
    hlsUrl: PropTypes.string,
    webrtcPlaybackUrl: PropTypes.string,
  }).isRequired,
  onPress: PropTypes.func,
  showLivePreview: PropTypes.bool,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

/**
 * Horizontal preview card for lists
 */
export const StreamPreviewCardHorizontal = memo(({
  stream,
  onPress,
  style,
}) => {
  const thumbnailUrl = stream.thumbnailUrl ||
    (stream.playbackId ? getThumbnailUrl(stream.playbackId, { width: 160, height: 90 }) : null);

  return (
    <TouchableOpacity
      style={[styles.horizontalContainer, style]}
      onPress={() => onPress?.(stream)}
      activeOpacity={0.8}
    >
      <View style={styles.horizontalThumbnail}>
        {thumbnailUrl ? (
          <Image
            source={{ uri: thumbnailUrl }}
            style={styles.horizontalImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.horizontalPlaceholder}>
            <Text style={styles.placeholderIcon}>O</Text>
          </View>
        )}
        {stream.isLive && (
          <View style={[styles.liveBadge, styles.liveBadgeSmall]}>
            <View style={styles.liveIndicator} />
            <Text style={[styles.liveText, styles.liveTextSmall]}>LIVE</Text>
          </View>
        )}
      </View>
      <View style={styles.horizontalMeta}>
        <Text style={styles.title} numberOfLines={1}>
          {stream.title || 'Untitled Stream'}
        </Text>
        <Text style={styles.streamerName} numberOfLines={1}>
          {stream.streamerName || 'Unknown'}
        </Text>
        {stream.viewerCount !== undefined && (
          <Text style={styles.viewerCountText}>
            {stream.viewerCount} watching
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
});

StreamPreviewCardHorizontal.displayName = 'StreamPreviewCardHorizontal';

StreamPreviewCardHorizontal.propTypes = {
  stream: PropTypes.object.isRequired,
  onPress: PropTypes.func,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  previewContainer: {
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  videoPreview: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderContainer: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 32,
    color: '#666',
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 12,
    color: '#666',
  },
  liveBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff0000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  liveBadgeSmall: {
    top: 4,
    left: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  liveIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
    marginRight: 4,
  },
  liveText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  liveTextSmall: {
    fontSize: 9,
  },
  viewerBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  viewerIcon: {
    color: '#ff0000',
    fontSize: 12,
    marginRight: 4,
  },
  viewerCount: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  viewerCountText: {
    color: '#888',
    fontSize: 11,
    marginTop: 2,
  },
  platformBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(30, 144, 255, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  platformText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  metadataContainer: {
    padding: 12,
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  streamerName: {
    color: '#aaa',
    fontSize: 12,
  },
  category: {
    color: '#888',
    fontSize: 11,
    marginTop: 4,
  },
  // Horizontal card styles
  horizontalContainer: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  horizontalThumbnail: {
    width: 120,
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    position: 'relative',
  },
  horizontalImage: {
    width: '100%',
    height: '100%',
  },
  horizontalPlaceholder: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  horizontalMeta: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
});

export default memo(StreamPreviewCard);
