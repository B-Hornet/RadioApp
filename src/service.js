import TrackPlayer, { Capability, RepeatMode } from 'react-native-track-player';

const setupPlayer = async () => {
  await TrackPlayer.setupPlayer({
    waitForBuffer: true,
  });

  await TrackPlayer.add({
    id: 'reeboot-live',
    url: 'https://streaming.live365.com/a49353',
    title: 'Reeboot Radio Live',
    artist: 'Reeboot Radio',
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

