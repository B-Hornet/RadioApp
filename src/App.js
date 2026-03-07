import React, { useEffect } from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import AppNavigator from './AppNavigator';
import setupPlayer from './service';
import { colors } from './theme';

const App = () => {
  useEffect(() => {
    setupPlayer().catch((error) => {
      console.error('Error setting up TrackPlayer:', error);
    });

    return () => {
      // TrackPlayer cleanup handled by the service
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <AppNavigator />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

export default App;

