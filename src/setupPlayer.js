import TrackPlayer, { Capability, RepeatMode } from 'react-native-track-player';
import { STREAM_URL } from './constants';

const setupPlayer = async () => {
  await TrackPlayer.setupPlayer({
    waitForBuffer: true,
  });

  await TrackPlayer.add({
    id: 'reeboot-live',
    url: STREAM_URL,
    title: 'Reeboot Radio',
    artist: 'What Radio Should Sound Like',
    artwork: require('../assets/Images/reebologo.png'),
    isLiveStream: true,
  });

  await TrackPlayer.updateOptions({
    stopWithApp: true,
    capabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.Stop,
    ],
    compactCapabilities: [
      Capability.Play,
      Capability.Pause,
    ],
    notificationCapabilities: [
      Capability.Play,
      Capability.Pause,
    ],
  });

  await TrackPlayer.setRepeatMode(RepeatMode.Off);
};

export default setupPlayer;
