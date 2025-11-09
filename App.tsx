/**
 * Farm Connect - Haron India App
 * React Native App for Agricultural Services
 *
 * @format
 */

import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { UserProvider } from './src/context/UserContext';
import { CartProvider } from './src/context/CartContext';
import AppNavigator from './src/navigation/AppNavigator';
import { colors } from './src/constants/theme';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <UserProvider>
        <CartProvider>
          <StatusBar
            barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            backgroundColor={colors.primary}
          />
          <AppNavigator />
        </CartProvider>
      </UserProvider>
    </SafeAreaProvider>
  );
}

export default App;
