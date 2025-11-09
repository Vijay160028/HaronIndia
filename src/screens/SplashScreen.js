import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useUser } from '../context/UserContext';
import { colors, typography, spacing } from '../constants/theme';

const SplashScreen = ({ navigation }) => {
  const { isLoggedIn, isLoading } = useUser();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        // Still loading user data, wait a bit more
        return;
      }
      
      if (isLoggedIn) {
        navigation.replace('MainTabs');
      } else {
        navigation.replace('Auth');
      }
    }, 1500); // Reduced from 2000ms to 1500ms

    return () => clearTimeout(timer);
  }, [navigation, isLoggedIn, isLoading]);

  return (
    <LinearGradient
      colors={['#E8F5E8', '#C8E6C9']}
      style={styles.container}
    >
      <View style={styles.logoContainer}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>🌱</Text>
        </View>
        <ActivityIndicator 
          size="small" 
          color="#2E7D32" 
          style={styles.loadingIndicator}
        />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: 40,
  },
  loadingIndicator: {
    marginTop: 20,
  },
});

export default SplashScreen;
