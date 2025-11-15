import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Image, ActivityIndicator, Platform, PermissionsAndroid } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useUser } from '../context/UserContext';
import AuthAPI from '../services/api';

const RentOutFormScreen = ({ navigation }) => {
  const { user, getAuthToken } = useUser();
  const [formData, setFormData] = useState({
    equipmentName: '',
    model: '',
    description: '',
    category: '',
    costPerHour: '',
    availabilityStatus: 'available',
    quantityAvailable: '',
    withOperator: false,
    image: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showAvailabilityDropdown, setShowAvailabilityDropdown] = useState(false);

  const categories = [
    { id: 'tractor', name: 'Tractor', icon: 'tractor' },
    { id: 'harvester', name: 'Harvester', icon: 'wheat' },
    { id: 'rotavator', name: 'Rotavator', icon: 'shovel' },
    { id: 'water-tanker', name: 'Water Tanker', icon: 'water-pump' },
    { id: 'sprayer', name: 'Sprayer Pump', icon: 'spray' },
    { id: 'other', name: 'Other', icon: 'tools' },
    { id: 'custom', name: 'Custom', icon: 'add-circle-outline' },
  ];

  const availabilityOptions = [
    { id: 'available', name: 'Available' },
    { id: 'unavailable', name: 'Unavailable' },
  ];

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        return false;
      }
    }
    return true;
  };

  const handleImagePicker = async () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
    };

    Alert.alert(
      'Select Image',
      'Choose an option',
      [
        {
          text: 'Camera',
          onPress: async () => {
            const hasPermission = await requestCameraPermission();
            if (hasPermission) {
              launchCamera(options, handleImageResponse);
            }
          },
        },
        { text: 'Gallery', onPress: () => launchImageLibrary(options, handleImageResponse) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleImageResponse = (response) => {
    if (response.didCancel || response.errorMessage) return;
    if (response.assets && response.assets[0]) {
      setFormData({ ...formData, image: response.assets[0].uri });
    }
  };

  const handleSubmit = async () => {
    if (!formData.equipmentName.trim()) {
      Alert.alert('Error', 'Please enter equipment name');
      return;
    }
    if (!formData.category) {
      Alert.alert('Error', 'Please select a category');
      return;
    }
    if (!formData.costPerHour || parseFloat(formData.costPerHour) <= 0) {
      Alert.alert('Error', 'Please enter a valid cost per hour');
      return;
    }
    if (!formData.quantityAvailable || parseInt(formData.quantityAvailable) <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await getAuthToken();
      const equipmentData = {
        ...formData,
        farmerId: user?.userId,
        farmerName: user?.fullName,
        farmerPhone: user?.phoneNumber,
      };

      // Call API to submit rent-out equipment
      // await AuthAPI.createRentOutEquipment(equipmentData, token);
      
      Alert.alert(
        'Success',
        'Your equipment has been submitted. Merchant 3 (M3) will verify it before it becomes visible.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to submit equipment');
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
        <Text style={styles.headerTitle}>List Equipment for Rent</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.infoBanner}>
          <MaterialCommunityIcons name="information" size={20} color="#2E7D32" />
          <Text style={styles.infoText}>
            After submission, Merchant 3 (M3) will verify your equipment before it becomes visible.
          </Text>
        </View>

        {/* Equipment Image */}
        <View style={styles.imageSection}>
          {formData.image ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: formData.image }} style={styles.equipmentImage} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => setFormData({ ...formData, image: '' })}
              >
                <Icon name="close" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.imageUploadButton}
              onPress={handleImagePicker}
            >
              <Icon name="camera-alt" size={32} color="#2E7D32" />
              <Text style={styles.imageUploadText}>Add Equipment Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Equipment Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Equipment Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Mahindra Tractor"
            value={formData.equipmentName}
            onChangeText={(text) => setFormData({ ...formData, equipmentName: text })}
          />
        </View>

        {/* Model */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Model</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 575 DI"
            value={formData.model}
            onChangeText={(text) => setFormData({ ...formData, model: text })}
          />
        </View>

        {/* Category */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category *</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
          >
            <View style={styles.dropdownContent}>
              {formData.category ? (
                <>
                  <MaterialCommunityIcons 
                    name={categories.find(c => c.id === formData.category)?.icon || 'tools'} 
                    size={22} 
                    color="#2E7D32" 
                  />
                  <Text style={styles.dropdownText}>
                    {categories.find(c => c.id === formData.category)?.name || 'Select Category'}
                  </Text>
                </>
              ) : (
                <>
                  <MaterialCommunityIcons name="tools" size={22} color="#999999" />
                  <Text style={styles.dropdownPlaceholder}>Select Category</Text>
                </>
              )}
            </View>
            <Icon 
              name={showCategoryDropdown ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} 
              size={24} 
              color="#666666" 
            />
          </TouchableOpacity>
          {showCategoryDropdown && (
            <View style={styles.dropdownOptions}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.dropdownOption,
                    formData.category === cat.id && styles.dropdownOptionActive,
                  ]}
                  onPress={() => {
                    setFormData({ ...formData, category: cat.id });
                    setShowCategoryDropdown(false);
                  }}
                >
                  <MaterialCommunityIcons 
                    name={cat.icon} 
                    size={20} 
                    color={formData.category === cat.id ? '#FFFFFF' : '#2E7D32'} 
                  />
                  <Text
                    style={[
                      styles.dropdownOptionText,
                      formData.category === cat.id && styles.dropdownOptionTextActive,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Describe your equipment..."
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Cost per Hour */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Cost per Hour (₹) *</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            keyboardType="numeric"
            value={formData.costPerHour}
            onChangeText={(text) => setFormData({ ...formData, costPerHour: text })}
          />
        </View>

        {/* Quantity Available */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Quantity Available *</Text>
          <TextInput
            style={styles.input}
            placeholder="1"
            keyboardType="numeric"
            value={formData.quantityAvailable}
            onChangeText={(text) => setFormData({ ...formData, quantityAvailable: text })}
          />
        </View>

        {/* Availability Status */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Availability Status *</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowAvailabilityDropdown(!showAvailabilityDropdown)}
          >
            <Text style={styles.dropdownText}>
              {availabilityOptions.find(o => o.id === formData.availabilityStatus)?.name || 'Available'}
            </Text>
            <Icon 
              name={showAvailabilityDropdown ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} 
              size={24} 
              color="#666666" 
            />
          </TouchableOpacity>
          {showAvailabilityDropdown && (
            <View style={styles.dropdownOptions}>
              {availabilityOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.dropdownOption,
                    formData.availabilityStatus === option.id && styles.dropdownOptionActive,
                  ]}
                  onPress={() => {
                    setFormData({ ...formData, availabilityStatus: option.id });
                    setShowAvailabilityDropdown(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownOptionText,
                      formData.availabilityStatus === option.id && styles.dropdownOptionTextActive,
                    ]}
                  >
                    {option.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* With/Without Operator */}
        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setFormData({ ...formData, withOperator: !formData.withOperator })}
          >
            {formData.withOperator ? (
              <Icon name="check-box" size={24} color="#2E7D32" />
            ) : (
              <Icon name="check-box-outline-blank" size={24} color="#999999" />
            )}
          </TouchableOpacity>
          <Text style={styles.checkboxLabel}>With Operator</Text>
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
              <Text style={styles.submitButtonText}>Submit for Verification</Text>
            </>
          )}
        </TouchableOpacity>
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
  imageSection: {
    alignItems: 'center',
    paddingVertical: 20,
    marginHorizontal: 20,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  equipmentImage: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageUploadButton: {
    width: '100%',
    height: 200,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#2E7D32',
    borderStyle: 'dashed',
  },
  imageUploadText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
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
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dropdownText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B5E20',
    marginLeft: 12,
    flex: 1,
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
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
  },
  checkbox: {
    marginRight: 10,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333333',
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
    marginBottom: 30,
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
});

export default RentOutFormScreen;

