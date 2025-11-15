import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useUser } from '../context/UserContext';
import AuthAPI from '../services/api';

const ContactScreen = ({ navigation }) => {
  const { user, getAuthToken } = useUser();
  const [merchants, setMerchants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMerchants();
  }, []);

  const fetchMerchants = async () => {
    setIsLoading(true);
    try {
      const token = await getAuthToken();
      // Fetch merchants based on farmer's PIN code and village
      // For now, using mock data - replace with actual API call
      const mockMerchants = [
        {
          id: 'm1',
          type: 'Merchant 1 (M1)',
          role: 'Procurement, Grain Selling, Price Issues',
          phoneNumber: '+91 9876543210',
          icon: 'store',
        },
        {
          id: 'm2',
          type: 'Merchant 2 (M2)',
          role: 'Inputs, Fertilizer/Seed Sales, Finance, KCC',
          phoneNumber: '+91 9876543211',
          icon: 'agriculture',
        },
        {
          id: 'm3',
          type: 'Merchant 3 (M3)',
          role: 'Advisory, Rent-Out Verification, Guidance',
          phoneNumber: '+91 9876543212',
          icon: 'support-agent',
        },
      ];
      setMerchants(mockMerchants);
    } catch (error) {
      Alert.alert('Error', 'Failed to load merchant contacts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCall = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`).catch(() => {
      Alert.alert('Error', 'Unable to make phone call');
    });
  };

  const handleSMS = (phoneNumber) => {
    Linking.openURL(`sms:${phoneNumber}`).catch(() => {
      Alert.alert('Error', 'Unable to send SMS');
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#1B5E20" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Merchants</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.infoBanner}>
          <Icon name="info" size={20} color="#2E7D32" />
          <Text style={styles.infoText}>
            Contact merchants mapped to your village and PIN code
          </Text>
        </View>

        {merchants.map((merchant) => (
          <View key={merchant.id} style={styles.merchantCard}>
            <View style={styles.merchantHeader}>
              <View style={styles.merchantIconContainer}>
                <Icon name={merchant.icon} size={32} color="#2E7D32" />
              </View>
              <View style={styles.merchantInfo}>
                <Text style={styles.merchantType}>{merchant.type}</Text>
                <Text style={styles.merchantRole}>{merchant.role}</Text>
              </View>
            </View>
            <View style={styles.merchantActions}>
              <TouchableOpacity 
                style={styles.callButton}
                onPress={() => handleCall(merchant.phoneNumber)}
              >
                <Icon name="phone" size={20} color="#FFFFFF" />
                <Text style={styles.callButtonText}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.smsButton}
                onPress={() => handleSMS(merchant.phoneNumber)}
              >
                <Icon name="message" size={20} color="#2E7D32" />
                <Text style={styles.smsButtonText}>SMS</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.phoneContainer}>
              <Icon name="phone" size={16} color="#666666" />
              <Text style={styles.phoneNumber}>{merchant.phoneNumber}</Text>
            </View>
          </View>
        ))}
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
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#2E7D32',
    marginLeft: 10,
  },
  merchantCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  merchantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  merchantIconContainer: {
    width: 56,
    height: 56,
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  merchantInfo: {
    flex: 1,
  },
  merchantType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 4,
  },
  merchantRole: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  merchantActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E7D32',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    justifyContent: 'center',
  },
  callButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  smsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    justifyContent: 'center',
  },
  smsButtonText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  phoneNumber: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
  },
});

export default ContactScreen;

