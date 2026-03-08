import React, { useEffect } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import AppNavigator from './AppNavigator';
import setupPlayer from './service';
import DebugOverlay, { enableDebugLogging } from './components/DebugOverlay';
import { colors } from './theme';

// Enable debug logging early so all console output is captured
enableDebugLogging();

const App = () => {
  useEffect(() => {
    console.log('App mounted — initializing TrackPlayer...');
    setupPlayer()
      .then(() => {
        console.log('TrackPlayer setup complete');
      })
      .catch((error) => {
        console.error('TrackPlayer setup failed:', error.message);
      });

    return () => {
      // TrackPlayer cleanup handled by the service
    };
  }, []);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <AppNavigator />
      </SafeAreaView>
      <DebugOverlay />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

export default App;
