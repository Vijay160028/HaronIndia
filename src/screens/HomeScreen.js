import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ImageBackground, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Geolocation from '@react-native-community/geolocation';
import { useUser } from '../context/UserContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, typography, spacing } from '../constants/theme';

const HomeScreen = ({ navigation }) => {
  const [location, setLocation] = useState('Jabalpur, MP');
  const [weather, setWeather] = useState({ temp: '28°C', condition: 'Partly Cloudy' });
  const { user } = useUser();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // You can use reverse geocoding here to get city name
        // For now, we'll use a default location
        setLocation('Jabalpur, MP');
      },
      (error) => {
        console.log('Location error:', error);
        // Use default location if permission denied
        setLocation('Jabalpur, MP');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const actionCards = [
    {
      id: 1,
      title: 'Buy',
      subtitle: 'Seeds & Inputs',
      icon: 'shopping-cart',
      iconFamily: 'MaterialIcons',
      onPress: () => navigation.navigate('Buy'),
    },
    {
      id: 2,
      title: 'Rent',
      subtitle: 'Equipment',
      icon: 'tractor',
      iconFamily: 'MaterialCommunityIcons',
      onPress: () => console.log('Rent pressed'),
    },
    {
      id: 3,
      title: 'Sell',
      subtitle: 'Produce',
      icon: 'local-offer',
      iconFamily: 'MaterialIcons',
      onPress: () => console.log('Sell pressed'),
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
            <View style={styles.logoIcon}>
              <MaterialCommunityIcons name="sprout" size={24} color="#2E7D32" />
            </View>
            <View style={styles.logoTextContainer}>
              <Text style={styles.appName}>Farm Connect</Text>
              <Text style={styles.appSubtitle}>Farm Portal</Text>
            </View>
          </View>
          <View style={styles.profileContainer}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face' }}
              style={styles.profileImage}
            />
          </View>
        </View>

            <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 300 + insets.bottom }]}>

          {/* Welcome Card */}
          <View style={styles.welcomeCard}>
            <Text style={styles.welcomeText}>Welcome back, Ravi</Text>
            <Text style={styles.locationText}>{location}</Text>
            <View style={styles.weatherBadge}>
              <Icon name="cloud" size={14} color="#1B5E20" style={{ marginRight: 4 }} />
              <Text style={styles.weatherTemp}>{weather.temp}</Text>
              <Text style={styles.weatherDot}>•</Text>
              <Text style={styles.weatherCondition}>{weather.condition}</Text>
            </View>
          </View>

          {/* Action Cards */}
          <View style={styles.actionCardsContainer}>
            {actionCards.map((card) => (
              <TouchableOpacity key={card.id} style={styles.actionCard} onPress={card.onPress}>
                <View style={styles.actionCardIcon}>
                  {card.iconFamily === 'MaterialIcons' ? (
                    <Icon name={card.icon} size={24} color="#2E7D32" />
                  ) : (
                    <MaterialCommunityIcons name={card.icon} size={24} color="#2E7D32" />
                  )}
                </View>
                <Text style={styles.actionCardTitle}>{card.title}</Text>
                <Text style={styles.actionCardSubtitle}>{card.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>

              {/* Active Listings */}
              <View style={styles.activeSection}>
                <Text style={styles.sectionTitle}>Active</Text>
                {activeListings.map((listing, index) => (
                  <View key={listing.id} style={[
                    styles.listingCard,
                    index === activeListings.length - 1 && [styles.lastListingCard, { marginBottom: 150 + insets.bottom }]
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
                    <Icon name="event" size={12} color="#666666" style={{ marginRight: 4 }} />
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
    paddingBottom: 300,
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
  logoIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#E8F5E8',
    borderRadius: 8, 
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
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
  locationText: {
    fontSize: 16,
    color: '#2E7D32',
    marginBottom: 12,
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
  actionCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 120,
  },
  actionCardIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  actionCardSubtitle: {
    fontSize: 12,
    color: '#666666',
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
    marginBottom: 150,
  },
});

export default HomeScreen;