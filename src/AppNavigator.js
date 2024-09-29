import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomeScreen from './screens/WelcomeScreen';  // Welcome screen
import RadioPlayer from './components/RadioPlayer';  // Radio player screen
import MerchShop from './screens/MerchShop';  // Merch shop screen
import { NavigationContainer } from '@react-navigation/native';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Welcome"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1e90ff', // Customize header background
          },
          headerTintColor: '#fff', // Customize header text color
          headerTitleStyle: {
            fontWeight: 'bold', // Customize header text style
          },
        }}
      >
        <Stack.Screen 
          name="Welcome" 
          component={WelcomeScreen} 
          options={{ title: 'Welcome to ReebootRadio' }} // Custom screen title
        />
        <Stack.Screen 
          name="RadioPlayer" 
          component={RadioPlayer} 
          options={{ title: 'Radio Player' }} 
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

