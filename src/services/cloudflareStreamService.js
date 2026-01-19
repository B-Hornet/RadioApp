// File: src/services/cloudflareStreamService.js
// Service for managing Cloudflare Stream video playback URLs
// Supports both HLS (for RTMPS/SRT ingest) and WHEP (for WebRTC/WHIP ingest)

/**
 * Configuration for Cloudflare Stream
 * IMPORTANT: Replace 'YOUR_CUSTOMER_CODE' with your actual Cloudflare customer code
 * Found in Cloudflare Dashboard > Stream > API
 */
const CLOUDFLARE_CONFIG = {
  // Your Cloudflare customer code (NOT account_id)
  // Format: customer-<CODE>.cloudflarestream.com
  customerCode: 'YOUR_CUSTOMER_CODE',

  // Base domain for Cloudflare Stream
  baseDomain: 'cloudflarestream.com',
};

/**
 * Stream playback modes
 * - HLS: For streams ingested via RTMPS or SRT
 * - WHEP: For streams ingested via WebRTC (WHIP)
 */
export const PlaybackMode = {
  HLS: 'hls',
  WHEP: 'whep',
};

/**
 * Constructs the base URL for Cloudflare Stream
 * @returns {string} Base URL like 'https://customer-CODE.cloudflarestream.com'
 */
const getBaseUrl = () => {
  return `https://customer-${CLOUDFLARE_CONFIG.customerCode}.${CLOUDFLARE_CONFIG.baseDomain}`;
};

/**
 * Constructs HLS playback URL for a stream
 * Use this for streams ingested via RTMPS or SRT
 *
 * @param {string} streamId - The Cloudflare Live Input ID or Video ID
 * @returns {string} HLS manifest URL
 *
 * Example output: https://customer-CODE.cloudflarestream.com/<ID>/manifest/video.m3u8
 */
export const getHlsPlaybackUrl = (streamId) => {
  if (!streamId) {
    console.error('getHlsPlaybackUrl: streamId is required');
    return null;
  }
  return `${getBaseUrl()}/${streamId}/manifest/video.m3u8`;
};

/**
 * Constructs WHEP playback URL for a stream
 * Use this for streams ingested via WebRTC (WHIP)
 *
 * @param {string} inputUid - The Cloudflare Live Input UID
 * @returns {string} WHEP playback URL
 *
 * Example output: https://customer-CODE.cloudflarestream.com/<INPUT_UID>/webRTC/play
 */
export const getWhepPlaybackUrl = (inputUid) => {
  if (!inputUid) {
    console.error('getWhepPlaybackUrl: inputUid is required');
    return null;
  }
  return `${getBaseUrl()}/${inputUid}/webRTC/play`;
};

/**
 * Constructs thumbnail URL for a stream
 *
 * @param {string} streamId - The Cloudflare stream ID
 * @param {Object} options - Thumbnail options
 * @param {number} options.time - Time offset in seconds (default: 0)
 * @param {number} options.width - Thumbnail width (default: 640)
 * @param {number} options.height - Thumbnail height (default: 360)
 * @returns {string} Thumbnail URL
 */
export const getThumbnailUrl = (streamId, options = {}) => {
  const { time = 0, width = 640, height = 360 } = options;
  if (!streamId) {
    console.error('getThumbnailUrl: streamId is required');
    return null;
  }
  return `${getBaseUrl()}/${streamId}/thumbnails/thumbnail.jpg?time=${time}s&width=${width}&height=${height}`;
};

/**
 * Determines the correct playback URL based on the stream's ingest mode
 *
 * @param {Object} streamData - Stream data from Firestore
 * @param {string} streamData.streamId - The stream ID
 * @param {string} streamData.playbackUrl - Pre-configured playback URL (optional)
 * @param {string} streamData.playbackId - Cloudflare playback ID
 * @param {string} streamData.cloudflareStreamId - Cloudflare stream ID
 * @param {string} streamData.platform - Ingest platform ('whip', 'rtmps', 'srt')
 * @param {string} streamData.webrtcPlaybackUrl - WHEP URL if provided
 * @param {string} streamData.hlsUrl - HLS URL if provided
 * @returns {Object} { url: string, mode: PlaybackMode }
 */
export const getPlaybackUrlForStream = (streamData) => {
  if (!streamData) {
    console.error('getPlaybackUrlForStream: streamData is required');
    return { url: null, mode: null };
  }

  const {
    playbackUrl,
    playbackId,
    cloudflareStreamId,
    platform,
    webrtcPlaybackUrl,
    hlsUrl,
  } = streamData;

  // Priority 1: Use pre-configured URLs if they exist and are valid
  if (webrtcPlaybackUrl && platform === 'whip') {
    return { url: webrtcPlaybackUrl, mode: PlaybackMode.WHEP };
  }

  if (hlsUrl && platform !== 'whip') {
    return { url: hlsUrl, mode: PlaybackMode.HLS };
  }

  // Priority 2: If pre-configured playbackUrl exists, determine mode from platform
  if (playbackUrl) {
    const mode = platform === 'whip' ? PlaybackMode.WHEP : PlaybackMode.HLS;
    return { url: playbackUrl, mode };
  }

  // Priority 3: Construct URL from IDs based on platform
  const streamId = playbackId || cloudflareStreamId;

  if (!streamId) {
    console.error('getPlaybackUrlForStream: No valid stream ID found');
    return { url: null, mode: null };
  }

  // WebRTC/WHIP ingest -> WHEP playback
  if (platform === 'whip' || platform === 'webrtc') {
    return {
      url: getWhepPlaybackUrl(streamId),
      mode: PlaybackMode.WHEP,
    };
  }

  // RTMPS/SRT ingest -> HLS playback (default)
  return {
    url: getHlsPlaybackUrl(streamId),
    mode: PlaybackMode.HLS,
  };
};

/**
 * Validates if a playback URL is correctly formatted for Cloudflare Stream
 *
 * @param {string} url - URL to validate
 * @returns {Object} { isValid: boolean, mode: PlaybackMode | null, error: string | null }
 */
export const validatePlaybackUrl = (url) => {
  if (!url) {
    return { isValid: false, mode: null, error: 'URL is empty' };
  }

  // Check for HLS format
  const hlsPattern = /^https:\/\/customer-[a-z0-9]+\.cloudflarestream\.com\/[a-zA-Z0-9-]+\/manifest\/video\.m3u8$/;
  if (hlsPattern.test(url)) {
    return { isValid: true, mode: PlaybackMode.HLS, error: null };
  }

  // Check for WHEP format
  const whepPattern = /^https:\/\/customer-[a-z0-9]+\.cloudflarestream\.com\/[a-zA-Z0-9-]+\/webRTC\/play$/;
  if (whepPattern.test(url)) {
    return { isValid: true, mode: PlaybackMode.WHEP, error: null };
  }

  // Check for common mistakes
  if (url.includes('cloudflarestream.com') && !url.includes('customer-')) {
    return {
      isValid: false,
      mode: null,
      error: 'URL missing customer code. Format should be: customer-CODE.cloudflarestream.com'
    };
  }

  if (url.includes('/manifest/') && !url.endsWith('.m3u8')) {
    return {
      isValid: false,
      mode: null,
      error: 'HLS URL should end with .m3u8'
    };
  }

  return { isValid: false, mode: null, error: 'URL format not recognized' };
};

/**
 * Updates the Cloudflare customer code
 * Call this at app initialization with your actual customer code
 *
 * @param {string} customerCode - Your Cloudflare customer code
 */
export const setCustomerCode = (customerCode) => {
  if (!customerCode || typeof customerCode !== 'string') {
    console.error('setCustomerCode: Valid customer code string required');
    return;
  }
  CLOUDFLARE_CONFIG.customerCode = customerCode;
};

/**
 * Gets current configuration (for debugging)
 * @returns {Object} Current config
 */
export const getConfig = () => ({
  ...CLOUDFLARE_CONFIG,
  baseUrl: getBaseUrl(),
});

export default {
  PlaybackMode,
  getHlsPlaybackUrl,
  getWhepPlaybackUrl,
  getThumbnailUrl,
  getPlaybackUrlForStream,
  validatePlaybackUrl,
  setCustomerCode,
  getConfig,
};
