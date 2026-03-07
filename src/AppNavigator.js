import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { colors, fonts, spacing, borderRadius } from './theme';

// Screens
import WelcomeScreen from './screens/WelcomeScreen';
import RadioPlayer from './components/RadioPlayer';
import ChatRoom from './screens/ChatRoom';
import SongRequests from './screens/SongRequests';
import DJSchedule from './screens/DJSchedule';
import ListenerProfile from './screens/ListenerProfile';
import MerchShop from './screens/MerchShop';

const Stack = createStackNavigator();

// Hub screen with navigation grid
const HubScreen = ({ navigation }) => {
  const tiles = [
    { name: 'RadioPlayer', label: 'Listen', icon: '\uD83C\uDFB5' },
    { name: 'ChatRoom', label: 'Live Chat', icon: '\uD83D\uDCAC' },
    { name: 'SongRequests', label: 'Requests', icon: '\uD83C\uDFA4' },
    { name: 'DJSchedule', label: 'Schedule', icon: '\uD83D\uDCC5' },
    { name: 'ListenerProfile', label: 'My Profile', icon: '\uD83D\uDC64' },
    { name: 'MerchShop', label: 'Merch', icon: '\uD83D\uDECD\uFE0F' },
  ];

  return (
    <View style={hubStyles.container}>
      <View style={hubStyles.header}>
        <Text style={hubStyles.title}>Reeboot Radio</Text>
        <Text style={hubStyles.subtitle}>Your community radio station</Text>
      </View>
      <View style={hubStyles.grid}>
        {tiles.map((tile) => (
          <TouchableOpacity
            key={tile.name}
            style={hubStyles.tile}
            onPress={() => navigation.navigate(tile.name)}
            activeOpacity={0.7}
          >
            <Text style={hubStyles.tileIcon}>{tile.icon}</Text>
            <Text style={hubStyles.tileLabel}>{tile.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const hubStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fonts.sizes.hero,
    fontWeight: fonts.weights.heavy,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: fonts.sizes.md,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  tile: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    margin: '1.5%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  tileIcon: {
    fontSize: 36,
    marginBottom: spacing.sm,
  },
  tileLabel: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.semibold,
    color: colors.textPrimary,
  },
});

const defaultScreenOptions = {
  headerStyle: {
    backgroundColor: colors.headerBackground,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.headerBorder,
  },
  headerTintColor: colors.textPrimary,
  headerTitleStyle: {
    fontWeight: fonts.weights.bold,
    fontSize: fonts.sizes.lg,
  },
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={defaultScreenOptions}
      >
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HubScreen}
          options={{ title: 'Reeboot Radio', headerLeft: () => null }}
        />
        <Stack.Screen
          name="RadioPlayer"
          component={RadioPlayer}
          options={{ title: 'Now Playing' }}
        />
        <Stack.Screen
          name="ChatRoom"
          component={ChatRoom}
          options={{ title: 'Live Chat' }}
        />
        <Stack.Screen
          name="SongRequests"
          component={SongRequests}
          options={{ title: 'Song Requests' }}
        />
        <Stack.Screen
          name="DJSchedule"
          component={DJSchedule}
          options={{ title: 'DJ Schedule' }}
        />
        <Stack.Screen
          name="ListenerProfile"
          component={ListenerProfile}
          options={{ title: 'My Profile' }}
        />
        <Stack.Screen
          name="MerchShop"
          component={MerchShop}
          options={{ title: 'Merch Shop' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

