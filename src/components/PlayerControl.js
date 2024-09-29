import React from 'react';
import { View, Button } from 'react-native';
import TrackPlayer from 'react-native-track-player';

const PlayerControls = () => {
  const play = () => TrackPlayer.play();
  const pause = () => TrackPlayer.pause();

  return (
    <View>
      <Button title="Play" onPress={play} />
      <Button title="Pause" onPress={pause} />
    </View>
  );
};

export default PlayerControls;

