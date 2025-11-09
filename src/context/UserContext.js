import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      const loginStatus = await AsyncStorage.getItem('isLoggedIn');
      
      if (userData) {
        setUser(JSON.parse(userData));
      }
      
      if (loginStatus === 'true') {
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.log('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUserData = async (userData, token = null) => {
    try {
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      await AsyncStorage.setItem('isLoggedIn', 'true');
      if (token) {
        await AsyncStorage.setItem('authToken', token);
      }
      setUser(userData);
      setIsLoggedIn(true);
    } catch (error) {
      console.log('Error saving user data:', error);
    }
  };

  const clearUserData = async () => {
    try {
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('isLoggedIn');
      setUser(null);
      setIsLoggedIn(false);
    } catch (error) {
      console.log('Error clearing user data:', error);
    }
  };

  const updateUserData = async (updates) => {
    try {
      const updatedUser = { ...user, ...updates };
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.log('Error updating user data:', error);
    }
  };

  const getAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      return token;
    } catch (error) {
      console.log('Error getting auth token:', error);
      return null;
    }
  };

  const value = {
    user,
    isLoading,
    isLoggedIn,
    saveUserData,
    clearUserData,
    updateUserData,
    getAuthToken,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
