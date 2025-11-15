import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useUser } from '../context/UserContext';
import AuthAPI from '../services/api';
import { isProfileComplete } from '../utils/profileUtils';

const FinanceScreen = ({ navigation }) => {
  const { user, getAuthToken } = useUser();
  const [requestType, setRequestType] = useState(''); // 'loan' or 'kcc'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRequestTypeDropdown, setShowRequestTypeDropdown] = useState(false);

  const requestTypes = [
    { id: 'loan', name: 'Loan Request', icon: 'account-balance-wallet', description: 'Apply for agricultural loan' },
    { id: 'kcc', name: 'Kisan Credit Card (KCC)', icon: 'credit-card', description: 'Apply for Kisan Credit Card' },
  ];

  useEffect(() => {
    if (user && !isProfileComplete(user)) {
      Alert.alert(
        'Profile Incomplete',
        'Please complete your profile to submit finance requests. You need to add: Mobile Number, PIN Code, Village, City, State, Bank Account, Bank Address, IFSC Code, and Kisan Card Number.',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => navigation.goBack() },
          {
            text: 'Complete Profile',
            onPress: () => navigation.navigate('Profile'),
          },
        ]
      );
    }
  }, [user, navigation]);

  const handleSubmit = async () => {
    if (!requestType) {
      Alert.alert('Error', 'Please select a request type (Loan or KCC)');
      return;
    }

    if (!isProfileComplete(user)) {
      Alert.alert(
        'Profile Incomplete',
        'Please complete your profile to submit finance requests.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Complete Profile',
            onPress: () => navigation.navigate('Profile'),
          },
        ]
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await getAuthToken();
      const financeData = {
        requestType,
      };

      // Call API to submit finance request
      await AuthAPI.submitLoanRequest(financeData, token);
      
      Alert.alert(
        'Success',
        `Your ${requestType === 'loan' ? 'loan' : 'KCC'} request has been submitted successfully. Merchant 2 (M2) will contact you to discuss the details.`,
        [
          {
            text: 'OK',
            onPress: () => {
              setRequestType('');
            },
          },
        ]
      );
    } catch (error) {
      let errorMessage = 'Failed to submit finance request';
      
      if (error.status === 400) {
        errorMessage = error.data?.message || 'Invalid request. Please check your details.';
      } else if (error.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
      } else if (error.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
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
        <Text style={styles.headerTitle}>Finance Services</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.infoBanner}>
          <Icon name="info" size={20} color="#2E7D32" />
          <Text style={styles.infoText}>
            Select your finance request type. Merchant 2 (M2) will contact you to discuss the details (amount, purpose, tenure, etc.).
          </Text>
        </View>

        {/* Auto-filled Farmer Details */}
        <View style={styles.farmerDetailsCard}>
          <Text style={styles.sectionTitle}>Your Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Name:</Text>
            <Text style={styles.detailValue}>{user?.fullName || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Phone:</Text>
            <Text style={styles.detailValue}>{user?.phoneNumber || 'N/A'}</Text>
          </View>
          {user?.pinCode && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>PIN Code:</Text>
              <Text style={styles.detailValue}>{user.pinCode}</Text>
            </View>
          )}
          {user?.bankAccountNumber && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Bank Account:</Text>
              <Text style={styles.detailValue}>****{user.bankAccountNumber.slice(-4)}</Text>
            </View>
          )}
          {user?.kisanCardNumber && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Kisan Card:</Text>
              <Text style={styles.detailValue}>{user.kisanCardNumber}</Text>
            </View>
          )}
        </View>

        {/* Request Type Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Request Type *</Text>
          <TouchableOpacity
            style={styles.requestTypeDropdown}
            onPress={() => setShowRequestTypeDropdown(!showRequestTypeDropdown)}
          >
            <View style={styles.dropdownContent}>
              {requestType ? (
                <>
                  <Icon 
                    name={requestTypes.find(t => t.id === requestType)?.icon || 'account-balance'} 
                    size={24} 
                    color="#2E7D32" 
                  />
                  <View style={styles.requestTypeInfo}>
                    <Text style={styles.dropdownText}>
                      {requestTypes.find(t => t.id === requestType)?.name || 'Select Type'}
                    </Text>
                    <Text style={styles.requestTypeDescription}>
                      {requestTypes.find(t => t.id === requestType)?.description || ''}
                    </Text>
                  </View>
                </>
              ) : (
                <>
                  <Icon name="account-balance" size={24} color="#999999" />
                  <Text style={styles.dropdownPlaceholder}>Select Request Type</Text>
                </>
              )}
            </View>
            <Icon 
              name={showRequestTypeDropdown ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} 
              size={24} 
              color="#666666" 
            />
          </TouchableOpacity>

          {showRequestTypeDropdown && (
            <View style={styles.dropdownOptions}>
              {requestTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.dropdownOption,
                    requestType === type.id && styles.dropdownOptionActive,
                  ]}
                  onPress={() => {
                    setRequestType(type.id);
                    setShowRequestTypeDropdown(false);
                  }}
                >
                  <Icon 
                    name={type.icon} 
                    size={24} 
                    color={requestType === type.id ? '#FFFFFF' : '#2E7D32'} 
                  />
                  <View style={styles.requestTypeInfo}>
                    <Text
                      style={[
                        styles.dropdownOptionText,
                        requestType === type.id && styles.dropdownOptionTextActive,
                      ]}
                    >
                      {type.name}
                    </Text>
                    <Text
                      style={[
                        styles.requestTypeDescriptionSmall,
                        requestType === type.id && styles.requestTypeDescriptionActive,
                      ]}
                    >
                      {type.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>


        {/* Submit Button */}
        <TouchableOpacity 
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Icon name="send" size={20} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>
                Submit {requestType === 'loan' ? 'Loan' : requestType === 'kcc' ? 'KCC' : ''} Request
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Note */}
        <View style={styles.noteCard}>
          <Icon name="note" size={20} color="#666666" />
          <Text style={styles.noteText}>
            Note: After submission, a ticket will be generated and sent to Merchant 2 (M2). 
            M2 will contact you to discuss the amount, purpose, tenure, and other details.
          </Text>
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
  farmerDetailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  inputGroup: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  requestTypeDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  requestTypeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  dropdownText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B5E20',
  },
  requestTypeDescription: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  requestTypeDescriptionSmall: {
    fontSize: 11,
    color: '#999999',
    marginTop: 2,
  },
  requestTypeDescriptionActive: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: '#999999',
    marginLeft: 12,
    flex: 1,
  },
  dropdownOptions: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownOptionActive: {
    backgroundColor: '#2E7D32',
  },
  dropdownOptionText: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 12,
    flex: 1,
  },
  dropdownOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'right',
    marginTop: 4,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  kccInfoCard: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 20,
  },
  kccInfoContent: {
    flex: 1,
    marginLeft: 12,
  },
  kccInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 8,
  },
  kccInfoText: {
    fontSize: 14,
    color: '#2E7D32',
    lineHeight: 20,
    marginBottom: 8,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E7D32',
    paddingVertical: 16,
    borderRadius: 8,
    marginHorizontal: 20,
    marginTop: 30,
  },
  submitButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  noteCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: '#E65100',
    marginLeft: 12,
    lineHeight: 18,
  },
});

export default FinanceScreen;

