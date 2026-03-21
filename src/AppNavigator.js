import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { colors, fonts, spacing, borderRadius } from './theme';
import { auth, db } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// Screens
import WelcomeScreen from './screens/WelcomeScreen';
import RadioPlayer from './components/RadioPlayer';
import ChatRoom from './screens/ChatRoom';
import SongRequests from './screens/SongRequests';
import DJSchedule from './screens/DJSchedule';
import ListenerProfile from './screens/ListenerProfile';
import MerchShop from './screens/MerchShop';
import UsernameSetupScreen from './screens/UsernameSetupScreen';

const AUTO_USERNAME_PATTERN = /^user[a-z0-9]{4,10}$/;

const Stack = createStackNavigator();
const { width } = Dimensions.get('window');

// Hub screen with branded navigation
const HubScreen = ({ navigation }) => {
  return (
    <ScrollView
      style={hubStyles.container}
      contentContainerStyle={hubStyles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header with logo */}
      <View style={hubStyles.header}>
        <Image
          source={require('../assets/Images/reebologo.png')}
          style={hubStyles.logo}
          resizeMode="contain"
        />
      </View>

      {/* NOW PLAYING - big featured card */}
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

      {/* LIVE CHAT - prominent card */}
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  // Header
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logo: {
    width: 120,
    height: 120,
  },
  // Featured NOW PLAYING card
  featuredCard: {
    backgroundColor: '#1A0A00',
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#FF6B00',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#FF6B00',
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
    backgroundColor: '#FF6B00',
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
    color: '#FF6B00',
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
    backgroundColor: '#FF6B00',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B00',
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
  // Chat card
  chatCard: {
    backgroundColor: '#0A1A0A',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#1DB954',
    shadowColor: '#1DB954',
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
    color: '#1DB954',
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
    backgroundColor: 'rgba(29, 185, 84, 0.15)',
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
    borderColor: '#2D2D2D',
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

const needsUsernameSetup = (username) => {
  if (!username || username.trim() === '') return true;
  return AUTO_USERNAME_PATTERN.test(username.toLowerCase());
};

const AppNavigator = () => {
  const [authChecked, setAuthChecked] = useState(false);
  const [initialRoute, setInitialRoute] = useState('Welcome');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'Users', user.uid));
          const data = userDoc.exists() ? userDoc.data() : {};
          if (needsUsernameSetup(data.username)) {
            setInitialRoute('UsernameSetup');
          } else {
            setInitialRoute('Home');
          }
        } catch (err) {
          console.error('Error checking username:', err);
          setInitialRoute('Home');
        }
      } else {
        setInitialRoute('Welcome');
      }
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, []);

  if (!authChecked) {
    return (
      <View style={{ flex: 1, backgroundColor: '#081425', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3F8CFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={defaultScreenOptions}
      >
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="UsernameSetup"
          component={UsernameSetupScreen}
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
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
            headerTintColor: '#FF6B00',
            headerTitleStyle: {
              fontWeight: fonts.weights.heavy,
              fontSize: fonts.sizes.xl,
              color: '#FF6B00',
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
