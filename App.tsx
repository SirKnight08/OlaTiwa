import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { AppProvider } from './src/AppContext';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { MenuProvider } from './src/theme/MenuContext';
import IntroScreen from './src/screens/IntroScreen';

function AppContent() {
  const [showIntro, setShowIntro] = useState(true);
  const { isDark } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (showIntro) {
    return <IntroScreen onFinish={() => setShowIntro(false)} />;
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AppNavigator />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <NavigationContainer>
          <MenuProvider>
            <AppContent />
          </MenuProvider>
        </NavigationContainer>
      </AppProvider>
    </ThemeProvider>
  );
}
