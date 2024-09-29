// Import necessary libraries
import React, { useEffect } from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import AppNavigator from './AppNavigator';  // Ensure this path is correct
import TrackPlayer from 'react-native-track-player';

const App = () => {

  // Use effect hook to initialize the TrackPlayer on app start
  useEffect(() => {
    const setupPlayer = async () => {
      try {
        // Initialize TrackPlayer
        await TrackPlayer.setupPlayer();

        // Configure player options (play, pause, stop)
        TrackPlayer.updateOptions({
          stopWithApp: true,
          capabilities: [
            TrackPlayer.CAPABILITY_PLAY,
            TrackPlayer.CAPABILITY_PAUSE,
            TrackPlayer.CAPABILITY_STOP,
          ],
        });
      } catch (error) {
        console.error('Error setting up TrackPlayer:', error);
      }
    };

    // Call setupPlayer when component mounts
    setupPlayer();

    // Optional cleanup when component unmounts
    return () => {
      TrackPlayer.destroy();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* Main navigation container */}
      <AppNavigator />
    </SafeAreaView>
  );
};

// Define styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default App;

