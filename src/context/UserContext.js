import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthAPI from '../services/api';

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
        // Ensure token is a string before storing
        const tokenString = typeof token === 'string' ? token : JSON.stringify(token);
        await AsyncStorage.setItem('authToken', tokenString);
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
      if (!token) {
        return null;
      }
      
      // If token was stored as a JSON stringified object, try to parse it
      // Otherwise return as is
      try {
        const parsed = JSON.parse(token);
        // If parsing succeeds and it's an object, try to extract the token
        if (typeof parsed === 'object' && parsed !== null) {
          // Try to get the actual token string from the object
          const extractedToken = parsed.token || parsed.value || parsed.accessToken || parsed.access_token;
          if (extractedToken && typeof extractedToken === 'string') {
            return extractedToken;
          }
          // If we can't extract a string token, return null
          return null;
        }
        // If parsed is not an object, it might be a string that was double-stringified
        if (typeof parsed === 'string') {
          return parsed;
        }
        return null;
      } catch {
        // If parsing fails, it's already a string token, return as is
        return token;
      }
    } catch (error) {
      console.log('Error getting auth token:', error);
      return null;
    }
  };

  const refetchUserData = async () => {
    try {
      const token = await getAuthToken();
      if (!token) {
        console.log('No auth token found');
        return;
      }

      const response = await AuthAPI.getUserProfile(token);
      
      // Extract user data from response (handle different response formats)
      const userData = response.data || response.user || response;
      
      // Get current user to preserve loginMethod
      const currentUser = user;
      
      // Update user data in storage and state
      const updatedUserData = {
        userId: userData.userId || userData.id,
        fullName: userData.fullName || userData.name,
        email: userData.email,
        phoneNumber: userData.phoneNumber || userData.phone,
        pinCode: userData.pinCode,
        village: userData.village,
        city: userData.city,
        state: userData.state,
        bankAccountNumber: userData.bankAccountNumber,
        bankAddress: userData.bankAddress,
        ifscCode: userData.ifscCode,
        kisanCardNumber: userData.kisanCardNumber,
        userType: userData.userType,
        profileImage: userData.profileImage || userData.avatar || null,
        isEmailVerified: userData.isEmailVerified,
        isPhoneVerified: userData.isPhoneVerified,
        lastLoginAt: userData.lastLoginAt || new Date().toISOString(),
        loginTime: new Date().toISOString(),
        loginMethod: currentUser?.loginMethod || 'email',
      };

      await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));
      setUser(updatedUserData);
      
      return updatedUserData;
    } catch (error) {
      console.log('Error refetching user data:', error);
      // If refetch fails, don't clear existing user data
      // Just log the error
      throw error;
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
    refetchUserData,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
