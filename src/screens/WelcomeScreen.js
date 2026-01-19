// File: src/screens/WelcomeScreen.js
// Welcome screen with navigation options to all app features

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import PropTypes from 'prop-types';

/**
 * Welcome Screen Component
 *
 * Entry point for the app with navigation to main features:
 * - Live Streams (video feeds with preview cards)
 * - Radio Player (audio streaming)
 * - Merch Shop
 */
const WelcomeScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>REEBOOT</Text>
        <Text style={styles.logoSubtext}>RADIO</Text>
      </View>

      {/* Welcome Message */}
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeTitle}>Welcome!</Text>
        <Text style={styles.welcomeText}>
          Your destination for live streams, radio, and more.
        </Text>
      </View>

      {/* Navigation Options */}
      <View style={styles.navigationContainer}>
        {/* Live Streams - Primary Action */}
        <TouchableOpacity
          style={[styles.navButton, styles.primaryButton]}
          onPress={() => navigation.navigate('LiveStreams')}
          activeOpacity={0.8}
        >
          <View style={styles.liveBadge}>
            <View style={styles.liveIndicator} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
          <Text style={styles.navButtonTitle}>Live Streams</Text>
          <Text style={styles.navButtonSubtext}>Watch video broadcasts</Text>
        </TouchableOpacity>

        {/* Radio Player */}
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('RadioPlayer')}
          activeOpacity={0.8}
        >
          <Text style={styles.navButtonIcon}>)))</Text>
          <Text style={styles.navButtonTitle}>Radio Player</Text>
          <Text style={styles.navButtonSubtext}>Listen to audio streams</Text>
        </TouchableOpacity>

        {/* Merch Shop */}
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('MerchShop')}
          activeOpacity={0.8}
        >
          <Text style={styles.navButtonIcon}>*</Text>
          <Text style={styles.navButtonTitle}>Merch Shop</Text>
          <Text style={styles.navButtonSubtext}>Browse merchandise</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Powered by Cloudflare Stream</Text>
      </View>
    </SafeAreaView>
  );
};

WelcomeScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  logo: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#1e90ff',
    letterSpacing: 8,
  },
  logoSubtext: {
    fontSize: 18,
    color: '#666',
    letterSpacing: 12,
    marginTop: -5,
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 30,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 24,
  },
  navigationContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  navButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  primaryButton: {
    backgroundColor: 'rgba(30, 144, 255, 0.1)',
    borderColor: '#1e90ff',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#ff0000',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 12,
  },
  liveIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
    marginRight: 6,
  },
  liveText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  navButtonIcon: {
    fontSize: 24,
    color: '#1e90ff',
    marginBottom: 8,
  },
  navButtonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  navButtonSubtext: {
    fontSize: 14,
    color: '#888',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#444',
  },
});

export default WelcomeScreen;
