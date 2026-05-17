/**
 * AppNavigator — Root Navigation with NavDock + MiniPlayer
 * ═══════════════════════════════════════════════════════════════
 * Stack navigator with a custom bottom dock and persistent mini player.
 * Owner-authenticated users get a Control Room nav item.
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from './theme/tokens';
import { useStream } from './StreamContext';
import useOwnerAuth from './hooks/useOwnerAuth';

// Screens
import WelcomeScreen from './screens/WelcomeScreen';
import HubScreen from './screens/HubScreen';
import RadioPlayer from './screens/RadioPlayer';
import ChatRoom from './screens/ChatRoom';
import SongRequests from './screens/SongRequests';
import DJSchedule from './screens/DJSchedule';
import ListenerProfile from './screens/ListenerProfile';
import MerchShop from './screens/MerchShop';
import ControlRoom from './screens/ControlRoom';

// Persistent UI
import NavDock from './components/NavDock';
import MiniPlayer from './components/MiniPlayer';
import ShoutoutBanner from './components/ShoutoutBanner';
import GiveawayModal from './components/GiveawayModal';
import OwnerLoginModal from './components/OwnerLoginModal';

const Stack = createStackNavigator();

const HIDE_DOCK_SCREENS = ['Welcome'];
const HIDE_MINIPLAYER_SCREENS = ['Welcome', 'RadioPlayer'];

function AppContent({ navigationRef }) {
  const [currentRoute, setCurrentRoute] = useState('Welcome');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const {
    isOwner,
    authError,
    login,
    logout,
    hasBiometricCreds,
    enableBiometricLogin,
    tryBiometricSignIn,
    clearBiometricLogin,
  } = useOwnerAuth();

  const onStateChange = useCallback(() => {
    const route = navigationRef.current?.getCurrentRoute();
    if (route?.name) {
      setCurrentRoute(route.name);
    }
  }, [navigationRef]);

  const showDock = !HIDE_DOCK_SCREENS.includes(currentRoute);
  const showMiniPlayer = !HIDE_MINIPLAYER_SCREENS.includes(currentRoute);

  const { isPlaying, isLive, trackTitle, artistName, togglePlayback } = useStream();

  const handleNavigate = useCallback((route) => {
    if (route === 'ControlRoom' && !isOwner) {
      setShowLoginModal(true);
      return;
    }
    navigationRef.current?.navigate(route);
  }, [navigationRef, isOwner]);

  const handleLogin = async (email, password) => {
    const success = await login(email, password);
    if (success) {
      setShowLoginModal(false);
      navigationRef.current?.navigate('ControlRoom');
    }
    return success;
  };

  const handleOwnerLongPress = useCallback(async () => {
    // Already signed in as owner → straight to ControlRoom.
    if (isOwner) {
      navigationRef.current?.navigate('ControlRoom');
      return;
    }
    // Returning owner with stored creds → try Face ID first. iOS
    // shows the biometric prompt; on success we land in ControlRoom
    // with no UI to type into.
    if (hasBiometricCreds) {
      const success = await tryBiometricSignIn();
      if (success) {
        navigationRef.current?.navigate('ControlRoom');
        return;
      }
      // Biometric cancelled or stored creds rejected — fall through
      // to the manual modal so the user isn't dead-ended.
    }
    setShowLoginModal(true);
  }, [isOwner, hasBiometricCreds, tryBiometricSignIn, navigationRef]);

  return (
    <View style={styles.container}>
      <NavigationContainer
        ref={navigationRef}
        onStateChange={onStateChange}
      >
        <Stack.Navigator
          initialRouteName="Welcome"
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: colors.bgDeep },
            gestureEnabled: false,
          }}
        >
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Hub" component={HubScreen} />
          <Stack.Screen name="RadioPlayer" component={RadioPlayer} />
          <Stack.Screen name="ChatRoom" component={ChatRoom} />
          <Stack.Screen name="SongRequests" component={SongRequests} />
          <Stack.Screen name="DJSchedule" component={DJSchedule} />
          <Stack.Screen name="ListenerProfile">
            {(props) => (
              <ListenerProfile {...props} onOwnerLongPress={handleOwnerLongPress} />
            )}
          </Stack.Screen>
          <Stack.Screen name="MerchShop" component={MerchShop} />
          <Stack.Screen name="ControlRoom" component={ControlRoom} />
        </Stack.Navigator>
      </NavigationContainer>

      {/* Persistent MiniPlayer */}
      {showMiniPlayer && (
        <MiniPlayer
          trackTitle={trackTitle}
          djName={artistName}
          isPlaying={isPlaying}
          isLive={isLive}
          onPress={() => handleNavigate('RadioPlayer')}
          onPlayPause={togglePlayback}
        />
      )}

      {/* Persistent NavDock */}
      {showDock && (
        <NavDock
          activeRoute={currentRoute}
          onNavigate={handleNavigate}
          isOwner={isOwner}
        />
      )}

      {/* Global shoutout banner + giveaway modal */}
      <ShoutoutBanner />
      <GiveawayModal />

      {/* Owner login modal */}
      <OwnerLoginModal
        visible={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
        error={authError}
        hasBiometricCreds={hasBiometricCreds}
        onEnableBiometric={enableBiometricLogin}
      />
    </View>
  );
}

export default function AppNavigator() {
  const navigationRef = React.useRef(null);

  return (
    <SafeAreaProvider>
      <AppContent navigationRef={navigationRef} />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgDeep,
  },
});
