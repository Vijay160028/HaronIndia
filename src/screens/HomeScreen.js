import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ImageBackground, Platform, PermissionsAndroid, Alert, Modal } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Geolocation from '@react-native-community/geolocation';
import { useUser } from '../context/UserContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getUserAvatarSource } from '../utils/imageUtils';
import { isProfileComplete, getMissingProfileFields } from '../utils/profileUtils';

const HomeScreen = ({ navigation }) => {
  // All state hooks must be called first, in consistent order
  const [location, setLocation] = useState('Detecting location...');
  const [weather, setWeather] = useState({ temp: '--', condition: 'Loading...', icon: 'cloud' });
  const [profileImageError, setProfileImageError] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  // Context hooks
  const { user } = useUser();
  const insets = useSafeAreaInsets();

  // Reset profile image error when user changes
  useEffect(() => {
    setProfileImageError(false);
  }, [user?.profileImage]);

  // Show profile completion modal if profile is incomplete
  useEffect(() => {
    if (user && !isProfileComplete(user)) {
      setShowProfileModal(true);
    } else {
      setShowProfileModal(false);
    }
  }, [user]);

  const fetchWeatherData = useCallback(async (latitude, longitude) => {
    try {
      // Using OpenWeatherMap API (free tier available)
      // Note: You'll need to get a free API key from https://openweathermap.org/api
      // For now, using a demo approach - replace with your API key
      const API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY'; // Replace with your API key
      
      // If no API key, use a fallback weather service or mock data
      if (API_KEY === 'YOUR_OPENWEATHERMAP_API_KEY') {
        // Fallback: Use a free weather API (Open-Meteo) that doesn't require API key
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`
        );
        
        const data = await response.json();
        
        if (data && data.current) {
          const temp = Math.round(data.current.temperature_2m);
          const weatherCode = data.current.weather_code;
          
          // Map weather codes to conditions and icons
          const weatherMap = {
            0: { condition: 'Clear', icon: 'wb-sunny' },
            1: { condition: 'Mainly Clear', icon: 'wb-sunny' },
            2: { condition: 'Partly Cloudy', icon: 'cloud' },
            3: { condition: 'Overcast', icon: 'cloud' },
            45: { condition: 'Foggy', icon: 'cloud' },
            48: { condition: 'Foggy', icon: 'cloud' },
            51: { condition: 'Light Drizzle', icon: 'opacity' },
            53: { condition: 'Drizzle', icon: 'opacity' },
            55: { condition: 'Heavy Drizzle', icon: 'opacity' },
            61: { condition: 'Light Rain', icon: 'opacity' },
            63: { condition: 'Rain', icon: 'opacity' },
            65: { condition: 'Heavy Rain', icon: 'opacity' },
            71: { condition: 'Light Snow', icon: 'ac-unit' },
            73: { condition: 'Snow', icon: 'ac-unit' },
            75: { condition: 'Heavy Snow', icon: 'ac-unit' },
            80: { condition: 'Light Rain', icon: 'opacity' },
            81: { condition: 'Rain', icon: 'opacity' },
            82: { condition: 'Heavy Rain', icon: 'opacity' },
            85: { condition: 'Snow', icon: 'ac-unit' },
            86: { condition: 'Heavy Snow', icon: 'ac-unit' },
            95: { condition: 'Thunderstorm', icon: 'flash-on' },
            96: { condition: 'Thunderstorm', icon: 'flash-on' },
            99: { condition: 'Thunderstorm', icon: 'flash-on' },
          };
          
          const weatherInfo = weatherMap[weatherCode] || { condition: 'Unknown', icon: 'cloud' };
          
          setWeather({
            temp: `${temp}°C`,
            condition: weatherInfo.condition,
            icon: weatherInfo.icon,
          });
        }
      } else {
        // Using OpenWeatherMap API (if you have an API key)
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
        );
        
        const data = await response.json();
        
        if (data && data.main && data.weather && data.weather[0]) {
          const temp = Math.round(data.main.temp);
          const condition = data.weather[0].main;
          const description = data.weather[0].description;
          
          // Map OpenWeatherMap conditions to icons (using MaterialIcons)
          const iconMap = {
            'Clear': 'wb-sunny',
            'Clouds': 'cloud',
            'Rain': 'opacity',
            'Drizzle': 'opacity',
            'Thunderstorm': 'flash-on',
            'Snow': 'ac-unit',
            'Mist': 'cloud',
            'Fog': 'cloud',
            'Haze': 'cloud',
          };
          
          setWeather({
            temp: `${temp}°C`,
            condition: description.charAt(0).toUpperCase() + description.slice(1),
            icon: iconMap[condition] || 'cloud',
          });
        }
      }
    } catch (error) {
      console.log('Weather fetch error:', error);
      // Set default weather on error
      setWeather({
        temp: '--',
        condition: 'Unable to fetch',
        icon: 'cloud',
      });
    }
  }, []);

  const getCurrentLocation = useCallback(() => {
    const reverseGeocode = async (latitude, longitude) => {
      try {
        // Using OpenStreetMap Nominatim API (free, no API key required)
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'HaronIndia/1.0', // Required by Nominatim
            },
          }
        );
        
        const data = await response.json();
        
        if (data && data.address) {
          const address = data.address;
          // Format location as "City, State" or "City, Country"
          let locationName = '';
          
          if (address.city || address.town || address.village) {
            locationName = address.city || address.town || address.village;
          } else if (address.suburb || address.county) {
            locationName = address.suburb || address.county;
          } else if (address.state_district) {
            locationName = address.state_district;
          }
          
          if (address.state) {
            locationName = locationName ? `${locationName}, ${address.state}` : address.state;
          } else if (address.country) {
            locationName = locationName ? `${locationName}, ${address.country}` : address.country;
          }
          
          if (locationName) {
            setLocation(locationName);
          } else {
            // Fallback to display name if structured address is not available
            setLocation(data.display_name?.split(',')[0] || 'Unknown location');
          }
        } else {
          setLocation('Unknown location');
        }
      } catch (error) {
        console.log('Reverse geocoding error:', error);
        setLocation('Location unavailable');
      }
    };

    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // Use reverse geocoding to get city name from coordinates
        reverseGeocode(latitude, longitude);
        // Fetch weather data based on coordinates
        fetchWeatherData(latitude, longitude);
      },
      (error) => {
        console.log('Location error:', error);
        // Handle different error codes
        if (error.code === 1) {
          // Permission denied
          setLocation('Location permission denied');
          if (Platform.OS === 'ios') {
            Alert.alert(
              'Location Permission Required',
              'Please enable location access in Settings to see your current location.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Open Settings', onPress: () => {
                  // On iOS, user needs to manually go to Settings
                  setLocation('Please enable location in Settings');
                }},
              ]
            );
          }
        } else if (error.code === 2) {
          // Position unavailable
          setLocation('Location unavailable');
        } else if (error.code === 3) {
          // Timeout
          setLocation('Location request timeout');
        } else {
          setLocation('Unable to detect location');
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  }, [fetchWeatherData]);

  const requestLocationPermission = useCallback(async () => {
    if (Platform.OS === 'android') {
      try {
        // Check if permission is already granted
        const checkResult = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        
        if (checkResult) {
          console.log('Location permission already granted');
          return true;
        }

        // Request permission
        console.log('Requesting location permission...');
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'Haron India needs access to your location to show your current city and provide location-based services.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        
        console.log('Permission result:', granted);
        
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Location permission granted');
          return true;
        } else if (granted === PermissionsAndroid.RESULTS.DENIED) {
          setLocation('Location permission denied');
          return false;
        } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          setLocation('Location permission permanently denied. Please enable in Settings');
          Alert.alert(
            'Permission Required',
            'Location permission has been permanently denied. Please enable it in Settings > Apps > Haron India > Permissions > Location.',
            [{ text: 'OK' }]
          );
          return false;
        } else {
          setLocation('Location permission not granted');
          return false;
        }
      } catch (err) {
        console.error('Permission request error:', err);
        setLocation('Permission request failed: ' + err.message);
        return false;
      }
    } else {
      // iOS permissions are requested automatically when Geolocation.getCurrentPosition is called
      // But we can check if permission was previously denied
      return true;
    }
  }, []);

  useEffect(() => {
    const initializeLocation = async () => {
      console.log('Initializing location...');
      // Request permission first
      const permissionGranted = await requestLocationPermission();
      console.log('Permission granted:', permissionGranted);
      if (permissionGranted) {
        // Get location after permission is granted
        getCurrentLocation();
      } else {
        console.log('Permission not granted, location will not be fetched');
      }
    };
    
    // Small delay to ensure screen is mounted
    const timer = setTimeout(() => {
      initializeLocation();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [getCurrentLocation, requestLocationPermission]);

  const handleActionPress = (screenName) => {
    if (!isProfileComplete(user)) {
      Alert.alert(
        'Profile Incomplete',
        'Please complete your profile to access this feature. You need to add: Mobile Number, PIN Code, Village, City, State, Bank Account, Bank Address, IFSC Code, and Kisan Card Number.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Complete Profile', 
            onPress: () => navigation.navigate('Profile')
          },
        ]
      );
      return;
    }
    navigation.navigate(screenName);
  };

  const actionCards = [
    {
      id: 1,
      title: 'Sell',
      subtitle: 'Sell Products',
      icon: 'local-offer',
      iconFamily: 'MaterialIcons',
      onPress: () => handleActionPress('Sell'),
    },
    {
      id: 2,
      title: 'Buy',
      subtitle: 'Seeds & Inputs',
      icon: 'shopping-cart',
      iconFamily: 'MaterialIcons',
      onPress: () => handleActionPress('Buy'),
    },
    {
      id: 3,
      title: 'Rent',
      subtitle: 'Equipment',
      icon: 'tractor',
      iconFamily: 'MaterialCommunityIcons',
      onPress: () => handleActionPress('Rent'),
    },
  ];

  const handleAdditionalSectionPress = (screenName, requiresProfile = false) => {
    if (requiresProfile && !isProfileComplete(user)) {
      Alert.alert(
        'Profile Incomplete',
        'Please complete your profile to access this feature.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Complete Profile', 
            onPress: () => navigation.navigate('Profile')
          },
        ]
      );
      return;
    }
    navigation.navigate(screenName);
  };

  const additionalSections = [
    {
      id: 4,
      title: 'Reels',
      subtitle: 'Watch Videos',
      icon: 'video-library',
      iconFamily: 'MaterialIcons',
      onPress: () => handleAdditionalSectionPress('Reels'),
      requiresProfile: false,
    },
    {
      id: 5,
      title: 'Contact',
      subtitle: 'Merchants',
      icon: 'contacts',
      iconFamily: 'MaterialIcons',
      onPress: () => handleAdditionalSectionPress('Contact'),
      requiresProfile: false,
    },
    {
      id: 6,
      title: 'Weather',
      subtitle: 'Forecast',
      icon: 'wb-sunny',
      iconFamily: 'MaterialIcons',
      onPress: () => handleAdditionalSectionPress('Weather'),
      requiresProfile: false,
    },
    {
      id: 7,
      title: 'Finance',
      subtitle: 'Loan & KCC',
      icon: 'account-balance',
      iconFamily: 'MaterialIcons',
      onPress: () => handleAdditionalSectionPress('Finance', true),
      requiresProfile: true,
    },
    {
      id: 8,
      title: 'Chatbot',
      subtitle: 'Get Help',
      icon: 'chat-bubble-outline',
      iconFamily: 'MaterialIcons',
      onPress: () => handleAdditionalSectionPress('Chatbot'),
      requiresProfile: false,
    },
    {
      id: 9,
      title: 'Complaint',
      subtitle: 'Raise Issue',
      icon: 'report-problem',
      iconFamily: 'MaterialIcons',
      onPress: () => handleAdditionalSectionPress('Complaint', true),
      requiresProfile: true,
    },
  ];

  const activeListings = [
    {
      id: 1,
      title: 'Wheat Seeds (HD-2967)',
      description: 'High quality certified seeds',
      quantity: '50 kg',
      status: 'Pending',
      date: '21 August 2025',
      progress: 60,
    },
    {
      id: 2,
      title: 'Wheat Seeds (HD-2967)',
      description: 'High quality certified seeds',
      quantity: '50 kg',
      status: 'Pending',
      date: '21 August 2025',
      progress: 0,
    },
  ];

  return (
    <ImageBackground 
      source={require('../assets/images/homescreenbg.png')}
      style={styles.backgroundImage}
      blurRadius={2}
    >
      <SafeAreaView style={styles.container}>
        {/* Fixed Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../assets/images/app_logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            {/* <View style={styles.logoTextContainer}>
              <Text style={styles.appName}>Farm Connect</Text>
              <Text style={styles.appSubtitle}>Farm Portal</Text>
            </View> */}
          </View>
          <View style={styles.profileContainer}>
            {user?.profileImage && 
             user.profileImage.trim() !== '' && 
             user.profileImage !== 'null' && 
             user.profileImage !== 'undefined' &&
             !profileImageError ? (
            <Image 
                source={getUserAvatarSource(user.profileImage)}
              style={styles.profileImage}
                onError={() => {
                  // If image fails to load, show default avatar with initials
                  setProfileImageError(true);
                }}
              />
            ) : (
              <View style={styles.defaultAvatar}>
                <Text style={styles.defaultAvatarText}>
                  {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </Text>
              </View>
            )}
          </View>
        </View>

            <ScrollView 
              contentContainerStyle={[styles.scrollContent, { paddingBottom: 80 + insets.bottom }]}
              showsVerticalScrollIndicator={false}
            >

          {/* Profile Incomplete Modal */}
          <Modal
            visible={showProfileModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowProfileModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.profileModal}>
                <View style={styles.modalHeader}>
                  <Icon name="warning" size={28} color="#FF9800" />
                  <Text style={styles.modalTitle}>Complete Your Profile</Text>
                </View>
                <Text style={styles.modalText}>
                  Please complete your profile to access all features including orders, finance requests, and complaints.
                </Text>
                <TouchableOpacity 
                  style={styles.modalButton}
                  onPress={() => {
                    setShowProfileModal(false);
                    navigation.navigate('Profile');
                  }}
                >
                  <Text style={styles.modalButtonText}>Complete Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Welcome Card */}
          <View style={styles.welcomeCard}>
            <Text style={styles.welcomeText}>
              Welcome back, {user?.fullName ? user.fullName.split(' ')[0] : 'User'}
            </Text>
            <View style={styles.locationContainer}>
              <View style={styles.locationTextContainer}>
                <Icon name="location-on" size={16} color="#2E7D32" style={styles.locationIcon} />
            <Text style={styles.locationText}>{location}</Text>
              </View>
            </View>
            <View style={styles.weatherBadge}>
              <Icon name={weather.icon} size={14} color="#1B5E20" style={styles.weatherIcon} />
              <Text style={styles.weatherTemp}>{weather.temp}</Text>
              <Text style={styles.weatherDot}>•</Text>
              <Text style={styles.weatherCondition}>{weather.condition}</Text>
            </View>
          </View>

          {/* Primary Action Cards (Sell, Buy, Rent) */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Main Services</Text>
          </View>
          <View style={styles.actionCardsContainer}>
            {actionCards.map((card) => (
              <TouchableOpacity 
                key={card.id} 
                style={styles.actionCard} 
                onPress={card.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.actionCardIcon}>
                  {card.iconFamily === 'MaterialIcons' ? (
                    <Icon name={card.icon} size={28} color="#2E7D32" />
                  ) : (
                    <MaterialCommunityIcons name={card.icon} size={28} color="#2E7D32" />
                  )}
                </View>
                <Text style={styles.actionCardTitle} numberOfLines={1} adjustsFontSizeToFit>
                  {card.title}
                </Text>
                <Text style={styles.actionCardSubtitle} numberOfLines={2} adjustsFontSizeToFit>
                  {card.subtitle}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Additional Sections */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>More Services</Text>
          </View>
          <View style={styles.additionalSectionsContainer}>
            {additionalSections.map((section) => (
              <TouchableOpacity 
                key={section.id} 
                style={styles.additionalSectionCard} 
                onPress={section.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.additionalSectionIcon}>
                  {section.iconFamily === 'MaterialIcons' ? (
                    <Icon name={section.icon} size={24} color="#2E7D32" />
                  ) : (
                    <MaterialCommunityIcons name={section.icon} size={24} color="#2E7D32" />
                  )}
                </View>
                <Text style={styles.additionalSectionTitle} numberOfLines={1}>
                  {section.title}
                </Text>
                <Text style={styles.additionalSectionSubtitle} numberOfLines={1}>
                  {section.subtitle}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

              {/* Active Listings */}
              <View style={styles.activeSection}>
                <Text style={styles.sectionTitle}>Active</Text>
                {activeListings.map((listing, index) => (
                  <View key={listing.id} style={[
                    styles.listingCard,
                    index === activeListings.length - 1 && styles.lastListingCard
                  ]}>
                <View style={styles.listingHeader}>
                  <Text style={styles.listingTitle}>{listing.title}</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{listing.status}</Text>
                  </View>
                </View>
                <Text style={styles.listingDescription}>{listing.description}</Text>
                <View style={styles.listingDetails}>
                  <Text style={styles.listingDetail}>Quantity: {listing.quantity}</Text>
                  <View style={styles.dateContainer}>
                    <Icon name="event" size={12} color="#666666" style={styles.dateIcon} />
                    <Text style={styles.listingDate}>{listing.date}</Text>
                  </View>
                </View>
                {listing.progress > 0 && (
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${listing.progress}%` }]} />
                    </View>
                    <Text style={styles.progressText}>{listing.progress}% complete</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.4)',

  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 70,
    height: 70,
    margin: 'auto',
  },
  logoTextContainer: {
    flexDirection: 'column',
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  appSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  profileContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#2E7D32',
  },
  defaultAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#2E7D32',
  },
  defaultAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  welcomeCard: {
    backgroundColor: '#E8F5E8',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 12,
  },
  locationTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationIcon: {
    marginRight: 6,
  },
  locationText: {
    fontSize: 16,
    color: '#2E7D32',
    flex: 1,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  retryButtonText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '600',
    marginLeft: 4,
  },
  weatherBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C8E6C9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  weatherIcon: {
    marginRight: 4,
  },
  weatherTemp: {
    fontSize: 14,
    color: '#1B5E20',
    fontWeight: '600',
  },
  weatherDot: {
    fontSize: 14,
    color: '#666666',
    marginHorizontal: 4,
  },
  weatherCondition: {
    fontSize: 14,
    color: '#1B5E20',
  },
  sectionHeader: {
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  actionCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 0,
  },
  additionalSectionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  additionalSectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    width: '30%',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  additionalSectionIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  additionalSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 4,
    textAlign: 'center',
  },
  additionalSectionSubtitle: {
    fontSize: 11,
    color: '#666666',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  profileModal: {
    backgroundColor: '#FFF8E1',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF9800',
    marginLeft: 12,
  },
  modalText: {
    fontSize: 14,
    color: '#E65100',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 140,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  actionCardIcon: {
    width: 56,
    height: 56,
    backgroundColor: '#E8F5E8',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  actionCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 6,
    textAlign: 'center',
    minHeight: 24,
  },
  actionCardSubtitle: {
    fontSize: 13,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 18,
    minHeight: 36,
  },
  activeSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 16,
  },
  listingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  listingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
  },
  statusBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '600',
  },
  listingDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
    lineHeight: 20,
  },
  listingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listingDetail: {
    fontSize: 14,
    color: '#666666',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIcon: {
    marginRight: 4,
  },
  listingDate: {
    fontSize: 14,
    color: '#666666',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2E7D32',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666666',
  },
  lastListingCard: {
    marginBottom: 0,
  },
});

export default HomeScreen;