import TrackPlayer from 'react-native-track-player';

const setupPlayer = async () => {
  // Setup the player
  await TrackPlayer.setupPlayer();

  // Add the radio stream to the player
  await TrackPlayer.add({
    id: '1',
    url: 'http://yourstreamurl.com/stream', // Replace with your actual streaming URL
    title: 'Reeboot Radio Live',
    artist: 'Reeboot DJ',
    artwork: 'https://your-image-url.com/image.jpg', // Optional artwork
  });

  // Update options for playback controls
  TrackPlayer.updateOptions({
    stopWithApp: true,
    capabilities: [
      TrackPlayer.CAPABILITY_PLAY,
      TrackPlayer.CAPABILITY_PAUSE,
      TrackPlayer.CAPABILITY_STOP,
    ],
    compactCapabilities: [
      TrackPlayer.CAPABILITY_PLAY,
      TrackPlayer.CAPABILITY_PAUSE,
    ],
  });
};

export default setupPlayer;

