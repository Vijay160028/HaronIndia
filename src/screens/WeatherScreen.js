import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, Alert, Platform, PermissionsAndroid, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Geolocation from '@react-native-community/geolocation';
import { useUser } from '../context/UserContext';

const WeatherScreen = ({ navigation }) => {
  const { user } = useUser();
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [location, setLocation] = useState('Loading...');

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const requestLocationPermission = useCallback(async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        return false;
      }
    }
    return true;
  }, []);

  const fetchWeatherData = async () => {
    setIsLoading(true);
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Location permission is needed to show weather');
        setIsLoading(false);
        return;
      }

      Geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Reverse geocode for location name
          try {
            const geoResponse = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
              { headers: { 'User-Agent': 'HaronIndia/1.0' } }
            );
            const geoData = await geoResponse.json();
            setLocation(geoData.address?.city || geoData.address?.village || 'Current Location');
          } catch (e) {
            setLocation('Current Location');
          }

          // Fetch current weather
          try {
            const weatherResponse = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=7`
            );
            const weatherData = await weatherResponse.json();
            
            if (weatherData.current) {
              setCurrentWeather({
                temperature: Math.round(weatherData.current.temperature_2m),
                humidity: weatherData.current.relative_humidity_2m,
                windSpeed: weatherData.current.wind_speed_10m,
                weatherCode: weatherData.current.weather_code,
              });
            }

            if (weatherData.daily) {
              const forecastData = weatherData.daily.time.map((date, index) => ({
                date,
                maxTemp: Math.round(weatherData.daily.temperature_2m_max[index]),
                minTemp: Math.round(weatherData.daily.temperature_2m_min[index]),
                weatherCode: weatherData.daily.weather_code[index],
                precipitation: weatherData.daily.precipitation_sum[index],
              }));
              setForecast(forecastData);
            }

            // Mock alerts
            setAlerts([
              { type: 'rain', message: 'Heavy rain expected tomorrow', severity: 'moderate' },
            ]);
          } catch (error) {
            Alert.alert('Error', 'Failed to fetch weather data');
          }
        },
        (error) => {
          Alert.alert('Error', 'Failed to get location');
        },
        { enableHighAccuracy: true, timeout: 15000 }
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch weather');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const getWeatherIcon = (code) => {
    if (code === 0 || code === 1) return 'wb-sunny';
    if (code >= 2 && code <= 3) return 'cloud';
    if (code >= 45 && code <= 48) return 'cloud';
    if (code >= 51 && code <= 67) return 'grain';
    if (code >= 71 && code <= 86) return 'ac-unit';
    if (code >= 95 && code <= 99) return 'flash-on';
    return 'cloud';
  };

  const getWeatherCondition = (code) => {
    if (code === 0) return 'Clear';
    if (code === 1) return 'Mainly Clear';
    if (code >= 2 && code <= 3) return 'Cloudy';
    if (code >= 45 && code <= 48) return 'Foggy';
    if (code >= 51 && code <= 67) return 'Rainy';
    if (code >= 71 && code <= 86) return 'Snowy';
    if (code >= 95 && code <= 99) return 'Thunderstorm';
    return 'Unknown';
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchWeatherData();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#1B5E20" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Weather</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>Loading weather...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#1B5E20" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Weather</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Icon name="refresh" size={24} color="#1B5E20" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Current Weather */}
        {currentWeather && (
          <View style={styles.currentWeatherCard}>
            <View style={styles.locationHeader}>
              <Icon name="location-on" size={20} color="#2E7D32" />
              <Text style={styles.locationText}>{location}</Text>
            </View>
            <View style={styles.temperatureContainer}>
              <Icon 
                name={getWeatherIcon(currentWeather.weatherCode)} 
                size={80} 
                color="#2E7D32" 
              />
              <Text style={styles.temperature}>{currentWeather.temperature}°C</Text>
            </View>
            <Text style={styles.condition}>
              {getWeatherCondition(currentWeather.weatherCode)}
            </Text>
            <View style={styles.weatherDetails}>
              <View style={styles.detailItem}>
                <Icon name="opacity" size={20} color="#666666" />
                <Text style={styles.detailText}>Humidity: {currentWeather.humidity}%</Text>
              </View>
              <View style={styles.detailItem}>
                <Icon name="air" size={20} color="#666666" />
                <Text style={styles.detailText}>Wind: {currentWeather.windSpeed} km/h</Text>
              </View>
            </View>
          </View>
        )}

        {/* Alerts */}
        {alerts.length > 0 && (
          <View style={styles.alertsSection}>
            <Text style={styles.sectionTitle}>Alerts</Text>
            {alerts.map((alert, index) => (
              <View key={index} style={styles.alertCard}>
                <Icon name="warning" size={24} color="#FF9800" />
                <Text style={styles.alertText}>{alert.message}</Text>
              </View>
            ))}
          </View>
        )}

        {/* 7-Day Forecast */}
        <View style={styles.forecastSection}>
          <Text style={styles.sectionTitle}>7-Day Forecast</Text>
          {forecast.map((day, index) => (
            <View key={index} style={styles.forecastCard}>
              <Text style={styles.forecastDate}>
                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </Text>
              <Icon 
                name={getWeatherIcon(day.weatherCode)} 
                size={32} 
                color="#2E7D32" 
              />
              <View style={styles.forecastTemps}>
                <Text style={styles.maxTemp}>{day.maxTemp}°</Text>
                <Text style={styles.minTemp}>{day.minTemp}°</Text>
              </View>
              {day.precipitation > 0 && (
                <Text style={styles.precipitation}>{day.precipitation}mm</Text>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginLeft: 10,
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666666',
  },
  currentWeatherCard: {
    backgroundColor: '#E8F5E8',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 20,
    marginTop: 20,
    alignItems: 'center',
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationText: {
    fontSize: 16,
    color: '#2E7D32',
    marginLeft: 6,
    fontWeight: '600',
  },
  temperatureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  temperature: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginLeft: 16,
  },
  condition: {
    fontSize: 20,
    color: '#2E7D32',
    marginBottom: 20,
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 6,
  },
  alertsSection: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 12,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  alertText: {
    flex: 1,
    fontSize: 14,
    color: '#E65100',
    marginLeft: 12,
  },
  forecastSection: {
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 20,
  },
  forecastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  forecastDate: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    fontWeight: '600',
  },
  forecastTemps: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  maxTemp: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginRight: 8,
  },
  minTemp: {
    fontSize: 16,
    color: '#666666',
  },
  precipitation: {
    fontSize: 12,
    color: '#2196F3',
    marginLeft: 12,
  },
});

export default WeatherScreen;

