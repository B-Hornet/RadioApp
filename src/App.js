import React, { useEffect } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import AppNavigator from './AppNavigator';
import setupPlayer from './service';
import { colors } from './theme';

const App = () => {
  useEffect(() => {
    if (__DEV__) console.log('App mounted — initializing TrackPlayer...');
    setupPlayer()
      .then(() => {
        if (__DEV__) console.log('TrackPlayer setup complete');
      })
      .catch((error) => {
        if (__DEV__) console.error('TrackPlayer setup failed:', error.message);
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
