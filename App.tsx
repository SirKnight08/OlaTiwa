import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { AppProvider } from './src/AppContext';

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <AppNavigator />
      </NavigationContainer>
    </AppProvider>
  );
}
