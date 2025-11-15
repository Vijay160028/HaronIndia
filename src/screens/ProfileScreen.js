import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useUser } from '../context/UserContext';
import AuthAPI from '../services/api';
import { isProfileComplete } from '../utils/profileUtils';

const ProfileScreen = ({ navigation }) => {
  const { user, getAuthToken, refetchUserData } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isValidatingIFSC, setIsValidatingIFSC] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    pinCode: '',
    village: '',
    city: '',
    state: '',
    bankAccountNumber: '',
    bankAddress: '',
    ifscCode: '',
    kisanCardNumber: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        phoneNumber: user.phoneNumber || '',
        email: user.email || '',
        pinCode: user.pinCode || '',
        village: user.village || '',
        city: user.city || '',
        state: user.state || '',
        bankAccountNumber: user.bankAccountNumber || '',
        bankAddress: user.bankAddress || '',
        ifscCode: user.ifscCode || '',
        kisanCardNumber: user.kisanCardNumber || '',
      });
    }
  }, [user]);

  const validateIFSC = async (ifsc) => {
    if (!ifsc || ifsc.length !== 11) {
      return { valid: false, message: 'IFSC code must be 11 characters' };
    }
    
    setIsValidatingIFSC(true);
    try {
      const response = await fetch(`https://ifsc.razorpay.com/${ifsc.toUpperCase()}`);
      if (response.ok) {
        const data = await response.json();
        setIsValidatingIFSC(false);
        
        // Build bank address from IFSC API response
        const addressParts = [];
        if (data.ADDRESS) addressParts.push(data.ADDRESS);
        if (data.BRANCH) addressParts.push(data.BRANCH);
        if (data.CITY) addressParts.push(data.CITY);
        if (data.DISTRICT) addressParts.push(data.DISTRICT);
        if (data.STATE) addressParts.push(data.STATE);
        if (data.PINCODE) addressParts.push(`PIN: ${data.PINCODE}`);
        
        const bankAddress = addressParts.join(', ');
        
        return { 
          valid: true, 
          bankName: data.BANK || '',
          bankAddress: bankAddress || '',
          branch: data.BRANCH || '',
          city: data.CITY || '',
          state: data.STATE || '',
        };
      } else {
        setIsValidatingIFSC(false);
        return { valid: false, message: 'Invalid IFSC code' };
      }
    } catch (error) {
      setIsValidatingIFSC(false);
      return { valid: true, message: 'Could not validate IFSC. Please verify manually.' };
    }
  };

  const handleSave = async () => {
    // Validation
    if (!formData.fullName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (formData.phoneNumber && !/^[6-9][0-9]{9}$/.test(formData.phoneNumber)) {
      Alert.alert('Error', 'Please enter a valid 10-digit Indian mobile number');
      return;
    }

    if (formData.pinCode && formData.pinCode.trim() !== '' && !/^[0-9]{6}$/.test(formData.pinCode)) {
      Alert.alert('Error', 'Please enter a valid 6-digit PIN code');
      return;
    }

    if (formData.ifscCode && formData.ifscCode.trim() !== '') {
      if (formData.ifscCode.length !== 11) {
        Alert.alert('Error', 'IFSC code must be 11 characters');
        return;
      }
      
      const ifscValidation = await validateIFSC(formData.ifscCode);
      if (!ifscValidation.valid) {
        Alert.alert('Error', ifscValidation.message || 'Invalid IFSC code');
        return;
      }
      
      // Auto-fill bank address if available from IFSC validation
      if (ifscValidation.bankAddress && !formData.bankAddress.trim()) {
        setFormData(prev => ({
          ...prev,
          bankAddress: ifscValidation.bankAddress,
        }));
      }
    }

    setIsSaving(true);
    try {
      const token = await getAuthToken();
      const updateData = {
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        // Email is not included - it cannot be changed
        pinCode: formData.pinCode.trim(),
        village: formData.village.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        bankAccountNumber: formData.bankAccountNumber.trim(),
        bankAddress: formData.bankAddress.trim(),
        ifscCode: formData.ifscCode.toUpperCase().trim(),
        kisanCardNumber: formData.kisanCardNumber.trim(),
      };

      // Call API to update profile
      await AuthAPI.updateProfile(updateData, token);
      
      // Refetch user data
      await refetchUserData();
      
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      let errorMessage = 'Failed to update profile';
      
      if (error.status === 400) {
        errorMessage = error.data?.message || 'Invalid data. Please check your details.';
      } else if (error.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original user data
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        phoneNumber: user.phoneNumber || '',
        email: user.email || '',
        pinCode: user.pinCode || '',
        village: user.village || '',
        city: user.city || '',
        state: user.state || '',
        bankAccountNumber: user.bankAccountNumber || '',
        bankAddress: user.bankAddress || '',
        ifscCode: user.ifscCode || '',
        kisanCardNumber: user.kisanCardNumber || '',
      });
    }
    setIsEditing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#1B5E20" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        {!isEditing ? (
          <TouchableOpacity onPress={() => setIsEditing(true)}>
            <Icon name="edit" size={24} color="#2E7D32" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Incomplete Banner */}
        {!isProfileComplete(user) && !isEditing && (
          <View style={styles.incompleteBanner}>
            <Icon name="info" size={20} color="#FF9800" />
            <Text style={styles.incompleteBannerText}>
              Complete your profile to access all features
            </Text>
            <TouchableOpacity 
              style={styles.completeButton}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.completeButtonText}>Complete Profile</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.fullName}
                onChangeText={(text) => setFormData({ ...formData, fullName: text })}
                placeholder="Enter your full name"
                editable={isEditing}
              />
            ) : (
              <Text style={styles.value}>{formData.fullName || 'Not set'}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mobile Number</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.phoneNumber}
                onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
                placeholder="Enter 10-digit mobile number"
                keyboardType="phone-pad"
                maxLength={10}
                editable={isEditing}
              />
            ) : (
              <Text style={styles.value}>{formData.phoneNumber || 'Not set'}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{formData.email || 'Not set'}</Text>
            <Text style={styles.hint}>Email cannot be changed</Text>
          </View>
        </View>

        {/* Address Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>PIN Code</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.pinCode}
                onChangeText={(text) => setFormData({ ...formData, pinCode: text })}
                placeholder="Enter 6-digit PIN code"
                keyboardType="numeric"
                maxLength={6}
                editable={isEditing}
              />
            ) : (
              <Text style={styles.value}>{formData.pinCode || 'Not set'}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Village</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.village}
                onChangeText={(text) => setFormData({ ...formData, village: text })}
                placeholder="Enter village name"
                editable={isEditing}
              />
            ) : (
              <Text style={styles.value}>{formData.village || 'Not set'}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>City</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.city}
                onChangeText={(text) => setFormData({ ...formData, city: text })}
                placeholder="Enter city name"
                editable={isEditing}
            />
          ) : (
              <Text style={styles.value}>{formData.city || 'Not set'}</Text>
            )}
            </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>State</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.state}
                onChangeText={(text) => setFormData({ ...formData, state: text })}
                placeholder="Enter state name"
                editable={isEditing}
              />
            ) : (
              <Text style={styles.value}>{formData.state || 'Not set'}</Text>
            )}
          </View>
        </View>

        {/* Bank Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bank Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bank Account Number</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.bankAccountNumber}
                onChangeText={(text) => setFormData({ ...formData, bankAccountNumber: text })}
                placeholder="Enter bank account number"
                keyboardType="numeric"
                editable={isEditing}
              />
            ) : (
              <Text style={styles.value}>
                {formData.bankAccountNumber ? `****${formData.bankAccountNumber.slice(-4)}` : 'Not set'}
              </Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bank Address</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.bankAddress}
                onChangeText={(text) => setFormData({ ...formData, bankAddress: text })}
                placeholder="Enter bank address"
                multiline
                numberOfLines={3}
                editable={isEditing}
              />
            ) : (
              <Text style={styles.value}>{formData.bankAddress || 'Not set'}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>IFSC Code</Text>
            {isEditing ? (
              <View>
                <TextInput
                  style={styles.input}
                  value={formData.ifscCode}
                  onChangeText={async (text) => {
                    const upperText = text.toUpperCase();
                    setFormData({ ...formData, ifscCode: upperText });
                    
                    // Auto-fetch bank address when IFSC is complete (11 characters)
                    if (upperText.length === 11) {
                      const ifscValidation = await validateIFSC(upperText);
                      if (ifscValidation.valid && ifscValidation.bankAddress) {
                        setFormData(prev => ({
                          ...prev,
                          ifscCode: upperText,
                          bankAddress: ifscValidation.bankAddress,
                        }));
                      }
                    }
                  }}
                  placeholder="Enter IFSC code"
                  autoCapitalize="characters"
                  maxLength={11}
                  editable={isEditing}
                />
                {isValidatingIFSC && (
                  <ActivityIndicator size="small" color="#2E7D32" style={styles.validationIndicator} />
                )}
                {formData.ifscCode.length === 11 && (
                  <Text style={styles.hint}>Bank address will be auto-filled</Text>
                )}
              </View>
            ) : (
              <Text style={styles.value}>{formData.ifscCode || 'Not set'}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Kisan Card Number</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.kisanCardNumber}
                onChangeText={(text) => setFormData({ ...formData, kisanCardNumber: text })}
                placeholder="Enter Kisan Card number"
                editable={isEditing}
              />
            ) : (
              <Text style={styles.value}>{formData.kisanCardNumber || 'Not set'}</Text>
            )}
          </View>
        </View>

        {/* Save Button */}
        {isEditing && (
          <TouchableOpacity 
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Icon name="save" size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
        )}
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
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  cancelText: {
    fontSize: 16,
    color: '#FF5722',
    fontWeight: '600',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  value: {
    fontSize: 16,
    color: '#666666',
    paddingVertical: 4,
  },
  hint: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
  },
  validationIndicator: {
    marginTop: 8,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E7D32',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 10,
  },
  saveButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  incompleteBanner: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  incompleteBannerText: {
    flex: 1,
    fontSize: 14,
    color: '#E65100',
    marginLeft: 12,
    marginRight: 12,
  },
  completeButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
