import React, { useState } from 'react';
import {
  Text,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import Video from 'react-native-video';
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
const { width } = Dimensions.get('window');

// Hub screen with branded navigation
const HubScreen = ({ navigation }) => {
  const [videoReady, setVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);

  return (
    <ScrollView
      style={hubStyles.container}
      contentContainerStyle={hubStyles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header with animated MP4 logo (PNG always visible underneath) */}
      <View style={hubStyles.header}>
        <View style={hubStyles.logoVideoContainer}>
          {/* PNG logo always rendered as base layer */}
          <Image
            source={require('../assets/Images/reebologo.png')}
            style={hubStyles.logoFallback}
            resizeMode="cover"
          />
          {/* Video layered on top once ready */}
          {!videoError && (
            <Video
              source={require('../assets/Radio App Background.mp4')}
              style={[hubStyles.logoVideo, !videoReady && { opacity: 0 }]}
              resizeMode="cover"
              repeat={true}
              muted={true}
              playInBackground={false}
              playWhenInactive={false}
              controls={false}
              onReadyForDisplay={() => setVideoReady(true)}
              onError={() => setVideoError(true)}
            />
          )}
        </View>
      </View>

      {/* NOW PLAYING - big featured card — Red/Black */}
      <TouchableOpacity
        style={hubStyles.featuredCard}
        onPress={() => navigation.navigate('RadioPlayer')}
        activeOpacity={0.85}
      >
        <View style={hubStyles.featuredGlow} />
        <View style={hubStyles.liveBadge}>
          <View style={hubStyles.liveDot} />
          <Text style={hubStyles.liveText}>LIVE</Text>
        </View>
        <Text style={hubStyles.featuredTitle}>Listen Now</Text>
        <Text style={hubStyles.featuredSubtitle}>Reeboot Radio Live Stream</Text>
        <View style={hubStyles.playIconContainer}>
          <Text style={hubStyles.playIcon}>{'\u25B6'}</Text>
        </View>
      </TouchableOpacity>

      {/* LIVE CHAT - Gold/Brown themed card */}
      <TouchableOpacity
        style={hubStyles.chatCard}
        onPress={() => navigation.navigate('ChatRoom')}
        activeOpacity={0.85}
      >
        <View style={hubStyles.chatCardInner}>
          <View>
            <Text style={hubStyles.chatTitle}>Live Chat Room</Text>
            <Text style={hubStyles.chatSubtitle}>
              Chat with listeners & DJs during live sets
            </Text>
          </View>
          <View style={hubStyles.chatIconBubble}>
            <Text style={hubStyles.chatIcon}>{'\uD83D\uDCAC'}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Grid tiles */}
      <View style={hubStyles.grid}>
        <TouchableOpacity
          style={hubStyles.tile}
          onPress={() => navigation.navigate('SongRequests')}
          activeOpacity={0.7}
        >
          <Text style={hubStyles.tileIcon}>{'\uD83C\uDFA4'}</Text>
          <Text style={hubStyles.tileLabel}>Song Requests</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={hubStyles.tile}
          onPress={() => navigation.navigate('DJSchedule')}
          activeOpacity={0.7}
        >
          <Text style={hubStyles.tileIcon}>{'\uD83D\uDCC5'}</Text>
          <Text style={hubStyles.tileLabel}>DJ Schedule</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={hubStyles.tile}
          onPress={() => navigation.navigate('ListenerProfile')}
          activeOpacity={0.7}
        >
          <Text style={hubStyles.tileIcon}>{'\uD83D\uDC64'}</Text>
          <Text style={hubStyles.tileLabel}>My Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={hubStyles.tile}
          onPress={() => navigation.navigate('MerchShop')}
          activeOpacity={0.7}
        >
          <Text style={hubStyles.tileIcon}>{'\uD83D\uDECD\uFE0F'}</Text>
          <Text style={hubStyles.tileLabel}>Merch Shop</Text>
        </TouchableOpacity>
      </View>

      {/* Back to Welcome screen */}
      <TouchableOpacity
        style={hubStyles.homeButton}
        onPress={() => navigation.navigate('Welcome')}
        activeOpacity={0.7}
      >
        <Text style={hubStyles.homeButtonText}>Back to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const hubStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  // Header — animated MP4 logo
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logoVideoContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#CC0000',
    shadowColor: '#CC0000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  logoFallback: {
    width: 140,
    height: 140,
  },
  logoVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 140,
    height: 140,
  },
  // Featured NOW PLAYING card — Red/Black
  featuredCard: {
    backgroundColor: '#1A0505',
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#CC0000',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#CC0000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  featuredGlow: {
    position: 'absolute',
    top: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#CC0000',
    opacity: 0.08,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: spacing.md,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
    marginRight: 6,
  },
  liveText: {
    color: '#FF3B30',
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.heavy,
    letterSpacing: 2,
  },
  featuredTitle: {
    fontSize: fonts.sizes.xxl,
    fontWeight: fonts.weights.heavy,
    color: '#CC0000',
    marginBottom: spacing.xs,
  },
  featuredSubtitle: {
    fontSize: fonts.sizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  playIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#CC0000',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#CC0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  playIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    marginLeft: 3,
  },
  // Chat card — Gold/Brown theme
  chatCard: {
    backgroundColor: '#1A1508',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#DAA520',
    shadowColor: '#DAA520',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  chatCardInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatTitle: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.bold,
    color: '#DAA520',
    marginBottom: spacing.xs,
  },
  chatSubtitle: {
    fontSize: fonts.sizes.sm,
    color: colors.textSecondary,
    maxWidth: width * 0.55,
  },
  chatIconBubble: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(218, 165, 32, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatIcon: {
    fontSize: 24,
  },
  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  tile: {
    width: '47%',
    backgroundColor: '#111111',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    margin: '1.5%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  tileIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  tileLabel: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.semibold,
    color: colors.textPrimary,
  },
  // Back to Welcome button
  homeButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    backgroundColor: '#111111',
  },
  homeButtonText: {
    color: colors.textSecondary,
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.semibold,
  },
});

const defaultScreenOptions = {
  headerStyle: {
    backgroundColor: '#000000',
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  headerTintColor: '#FFFFFF',
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
          options={{
            title: 'Reeboot Radio',
            headerLeft: () => null,
            headerStyle: {
              backgroundColor: '#000000',
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 0,
            },
            headerTintColor: '#CC0000',
            headerTitleStyle: {
              fontWeight: fonts.weights.heavy,
              fontSize: fonts.sizes.xl,
              color: '#CC0000',
            },
          }}
        />
        <Stack.Screen
          name="RadioPlayer"
          component={RadioPlayer}
          options={{ title: 'Now Playing' }}
        />
        <Stack.Screen
          name="ChatRoom"
          component={ChatRoom}
          options={{
            title: 'Live Chat',
            headerStyle: {
              backgroundColor: '#0F0A00',
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 1,
              borderBottomColor: '#3D2E0A',
            },
            headerTintColor: '#DAA520',
            headerTitleStyle: {
              fontWeight: fonts.weights.bold,
              fontSize: fonts.sizes.lg,
              color: '#DAA520',
            },
          }}
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
