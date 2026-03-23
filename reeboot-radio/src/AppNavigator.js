/**
 * AppNavigator — Root Navigation with NavDock + MiniPlayer
 * ═══════════════════════════════════════════════════════════════
 * Stack navigator with a custom bottom dock and persistent mini player.
 * The NavDock replaces the old card-based hub for navigation.
 * MiniPlayer shows on all screens except the full RadioPlayer.
 *
 * Architecture:
 *   NavigationContainer
 *     └── Stack.Navigator (headerShown: false)
 *           ├── WelcomeScreen (initial, no dock)
 *           ├── Hub
 *           ├── RadioPlayer
 *           ├── ChatRoom
 *           ├── SongRequests
 *           ├── DJSchedule
 *           ├── ListenerProfile
 *           └── MerchShop
 *     └── NavDock (absolute positioned, overlays all screens)
 *     └── MiniPlayer (absolute positioned, above NavDock)
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from './theme/tokens';

// Screens
import WelcomeScreen from './screens/WelcomeScreen';
import HubScreen from './screens/HubScreen';
import RadioPlayer from './screens/RadioPlayer';
import ChatRoom from './screens/ChatRoom';
import SongRequests from './screens/SongRequests';
import DJSchedule from './screens/DJSchedule';
import ListenerProfile from './screens/ListenerProfile';
import MerchShop from './screens/MerchShop';

// Persistent UI
import NavDock from './components/NavDock';
import MiniPlayer from './components/MiniPlayer';

const Stack = createNativeStackNavigator();

// Screens where the NavDock should be hidden
const HIDE_DOCK_SCREENS = ['Welcome'];
// Screens where MiniPlayer should be hidden
const HIDE_MINIPLAYER_SCREENS = ['Welcome', 'RadioPlayer'];

function AppContent({ navigationRef }) {
  // Track current route for dock/miniplayer visibility
  const [currentRoute, setCurrentRoute] = useState('Welcome');

  const onStateChange = useCallback(() => {
    const route = navigationRef.current?.getCurrentRoute();
    if (route?.name) {
      setCurrentRoute(route.name);
    }
  }, [navigationRef]);

  const showDock = !HIDE_DOCK_SCREENS.includes(currentRoute);
  const showMiniPlayer = !HIDE_MINIPLAYER_SCREENS.includes(currentRoute);

  const handleNavigate = useCallback((route) => {
    navigationRef.current?.navigate(route);
  }, [navigationRef]);

  // TODO: Connect to your actual stream state / audio player
  const handlePlayPause = useCallback(() => {
    // Toggle playback
  }, []);

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
            animation: 'fade',
            contentStyle: { backgroundColor: colors.bgDeep },
          }}
        >
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Hub" component={HubScreen} />
          <Stack.Screen name="RadioPlayer" component={RadioPlayer} />
          <Stack.Screen name="ChatRoom" component={ChatRoom} />
          <Stack.Screen name="SongRequests" component={SongRequests} />
          <Stack.Screen name="DJSchedule" component={DJSchedule} />
          <Stack.Screen name="ListenerProfile" component={ListenerProfile} />
          <Stack.Screen name="MerchShop" component={MerchShop} />
        </Stack.Navigator>
      </NavigationContainer>

      {/* Persistent MiniPlayer — above NavDock */}
      {showMiniPlayer && (
        <MiniPlayer
          trackTitle="Midnight Frequencies"
          djName="DJ Shadow"
          isPlaying={true}
          isLive={true}
          onPress={() => handleNavigate('RadioPlayer')}
          onPlayPause={handlePlayPause}
        />
      )}

      {/* Persistent NavDock */}
      {showDock && (
        <NavDock
          activeRoute={currentRoute}
          onNavigate={handleNavigate}
        />
      )}
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
