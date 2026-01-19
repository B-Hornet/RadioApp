// File: src/AppNavigator.js
// Main navigation configuration for ReebootRadio app

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

// Screens
import WelcomeScreen from './screens/WelcomeScreen';
import RadioPlayer from './components/RadioPlayer';
import MerchShop from './screens/MerchShop';
import LiveStreams from './screens/LiveStreams';
import ChatRoom from './screens/ChatRoom';

const Stack = createStackNavigator();

/**
 * Default header styles for all screens
 */
const defaultScreenOptions = {
  headerStyle: {
    backgroundColor: '#1a1a1a',
    elevation: 0, // Remove shadow on Android
    shadowOpacity: 0, // Remove shadow on iOS
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTintColor: '#fff',
  headerTitleStyle: {
    fontWeight: 'bold',
  },
  headerBackTitleVisible: false,
  cardStyle: {
    backgroundColor: '#121212',
  },
};

/**
 * Main App Navigator
 *
 * Defines all routes and their configurations for the app.
 */
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={defaultScreenOptions}
      >
        {/* Welcome Screen - Entry point */}
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{
            title: 'Welcome to ReebootRadio',
            headerShown: false, // Hide header for welcome screen
          }}
        />

        {/* Live Streams - Grid of available streams with preview cards */}
        <Stack.Screen
          name="LiveStreams"
          component={LiveStreams}
          options={{
            title: 'Live Streams',
          }}
        />

        {/* Chat Room - Video player with live chat */}
        <Stack.Screen
          name="ChatRoom"
          component={ChatRoom}
          options={{
            title: 'Live Stream',
            headerStyle: {
              ...defaultScreenOptions.headerStyle,
              backgroundColor: '#000', // Darker header for video viewing
            },
          }}
        />

        {/* Radio Player - Audio streaming */}
        <Stack.Screen
          name="RadioPlayer"
          component={RadioPlayer}
          options={{
            title: 'Radio Player',
          }}
        />

        {/* Merch Shop */}
        <Stack.Screen
          name="MerchShop"
          component={MerchShop}
          options={{
            title: 'Merch Shop',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
