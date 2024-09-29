import React from 'react';
import { SafeAreaView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';

const App = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ReebootRadio</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.welcomeText}>Welcome to ReebootRadio!</Text>
        
        {/* Navigation to RadioPlayer */}
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('RadioPlayer')}>
          <Text style={styles.buttonText}>Go to Radio Player</Text>
        </TouchableOpacity>
        
        {/* Navigation to MerchShop */}
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('MerchShop')}>
          <Text style={styles.buttonText}>Visit Merch Shop</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Define styles to enhance the design
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    backgroundColor: '#007AFF',
    width: '100%',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    color: 'white',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#841584',
    padding: 15,
    marginVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default App;

