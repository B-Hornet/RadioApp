import React, { useEffect, useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';

import AppNavigator from './AppNavigator';
import setupPlayer from './setupPlayer';
import { StreamProvider } from './StreamContext';
import { colors } from './theme';
import { auth } from './firebaseConfig';

const App = () => {
  const [playerReady, setPlayerReady] = useState(false);

  useEffect(() => {
    console.log('App mounted — initializing TrackPlayer...');
    setupPlayer()
      .then(() => {
        console.log('TrackPlayer setup complete');
        setPlayerReady(true);
      })
      .catch((error) => {
        console.error('TrackPlayer setup failed:', error.message);
        // Still show UI even if player setup fails
        setPlayerReady(true);
      });
  }, []);

  // Make sure every device has an auth identity so Firestore Security
  // Rules can gate writes. Owners sign in via useOwnerAuth and replace
  // this anonymous identity. Non-owners stay anonymous for the session.
  // Requires Anonymous sign-in to be enabled in Firebase Console.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        signInAnonymously(auth).catch((e) => {
          console.warn('Anonymous sign-in failed:', e?.message);
        });
      }
    });
    return unsubscribe;
  }, []);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        {playerReady ? (
          <StreamProvider>
            <AppNavigator />
          </StreamProvider>
        ) : null}
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
