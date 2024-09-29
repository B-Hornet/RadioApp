// File: src/screens/HomeScreen.js
import React from 'react';
import { View, Image, Button, StyleSheet } from 'react-native';

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
      
      <Button title="Go to Radio Player" onPress={() => navigation.navigate('RadioPlayer')} />
      <Button title="Go to Chat Room" onPress={() => navigation.navigate('ChatRoom')} />
      <Button title="Go to Merch Shop" onPress={() => navigation.navigate('MerchShop')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff', // Set the background color
  },
  logo: {
    width: 200, // Adjust size according to the logo’s aspect ratio
    height: 100,
    resizeMode: 'contain',
    marginBottom: 20,
  },
});

export default HomeScreen;

