import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import TrackPlayer, { usePlaybackState } from 'react-native-track-player';
TrackPlayer.setupPlayer().then(()=> {
   console.log('Play is ready');
});

export default function App() {
  const playbackState = usePlaybackState();
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlayback = async () => {
    if (playbackState === TrackPlayer.STATE_PLAYING) {
      await TrackPlayer.pause();
      setIsPlaying(false);
    } else {
      await TrackPlayer.play();
      setIsPlaying(true);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('./assets/Images/reeboologo')} style={styles.logo} />
      <Text style={styles.title}>Reeboot Radio</Text>

      <TouchableOpacity onPress={togglePlayback} style={styles.playButton}>
        <Text style={styles.playButtonText}>
          {isPlaying ? 'Pause' : 'Play'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  playButton: {
    backgroundColor: '#1DB954',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

