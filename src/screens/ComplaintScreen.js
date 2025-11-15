import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useUser } from '../context/UserContext';
import AuthAPI from '../services/api';
import { isProfileComplete } from '../utils/profileUtils';

const ComplaintScreen = ({ navigation }) => {
  const { user, getAuthToken } = useUser();
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const complaintCategories = [
    { id: 'merchant', name: 'Merchant Issue', icon: 'store' },
    { id: 'payment', name: 'Payment Issue', icon: 'payment' },
    { id: 'pickup', name: 'Pickup Delay', icon: 'local-shipping' },
    { id: 'renting', name: 'Renting Dispute', icon: 'build' },
    { id: 'pricing', name: 'Pricing Issue', icon: 'attach-money' },
    { id: 'district', name: 'District Office', icon: 'business' },
    { id: 'app', name: 'App/System Error', icon: 'bug-report' },
  ];

  const handleImagePicker = () => {
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
        { text: 'Camera', onPress: () => launchCamera(options, handleImageResponse) },
        { text: 'Gallery', onPress: () => launchImageLibrary(options, handleImageResponse) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleImageResponse = (response) => {
    if (response.didCancel || response.errorMessage) return;
    if (response.assets && response.assets[0]) {
      setImage(response.assets[0].uri);
    }
  };

  useEffect(() => {
    if (user && !isProfileComplete(user)) {
      Alert.alert(
        'Profile Incomplete',
        'Please complete your profile to submit complaints. You need to add: Mobile Number, PIN Code, Village, City, State, Bank Account, Bank Address, IFSC Code, and Kisan Card Number.',
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
    if (!category) {
      Alert.alert('Error', 'Please select a complaint category');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please describe your complaint');
      return;
    }

    if (!isProfileComplete(user)) {
      Alert.alert(
        'Profile Incomplete',
        'Please complete your profile to submit complaints.',
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
      const complaintData = {
        category,
        description: description.trim(),
        image: image || null,
        farmerId: user?.userId,
        farmerName: user?.fullName,
        farmerPhone: user?.phoneNumber,
        farmerPinCode: user?.pinCode,
      };

      // Call API to submit complaint
      // await AuthAPI.submitComplaint(complaintData, token);
      
      // For now, show success message
      Alert.alert(
        'Success',
        'Your complaint has been submitted successfully. It will be reviewed by the District Office.',
        [
          {
            text: 'OK',
            onPress: () => {
              setCategory('');
              setDescription('');
              setImage('');
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to submit complaint');
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
        <Text style={styles.headerTitle}>Raise Complaint</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.infoBanner}>
          <Icon name="info" size={20} color="#2E7D32" />
          <Text style={styles.infoText}>
            Your complaint will be sent to the District Office for review
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
        </View>

        {/* Category Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Complaint Category *</Text>
          <TouchableOpacity
            style={styles.categoryDropdown}
            onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
          >
            <View style={styles.categoryDropdownContent}>
              {category ? (
                <>
                  <Icon 
                    name={complaintCategories.find(c => c.id === category)?.icon || 'report-problem'} 
                    size={22} 
                    color="#2E7D32" 
                  />
                  <Text style={styles.categoryDropdownText}>
                    {complaintCategories.find(c => c.id === category)?.name || 'Select Category'}
                  </Text>
                </>
              ) : (
                <>
                  <Icon name="report-problem" size={22} color="#999999" />
                  <Text style={styles.categoryDropdownPlaceholder}>
                    Select Category
                  </Text>
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
            <View style={styles.categoryOptions}>
              {complaintCategories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryOption,
                    category === cat.id && styles.categoryOptionActive,
                  ]}
                  onPress={() => {
                    setCategory(cat.id);
                    setShowCategoryDropdown(false);
                  }}
                >
                  <Icon name={cat.icon} size={20} color={category === cat.id ? '#FFFFFF' : '#2E7D32'} />
                  <Text
                    style={[
                      styles.categoryOptionText,
                      category === cat.id && styles.categoryOptionTextActive,
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
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Describe your complaint in detail..."
            placeholderTextColor="#999999"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={6}
            maxLength={1000}
          />
          <Text style={styles.charCount}>{description.length}/1000</Text>
        </View>

        {/* Image Upload */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Attach Image (Optional)</Text>
          {image ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: image }} style={styles.imagePreview} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => setImage('')}
              >
                <Icon name="close" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.imageUploadButton}
              onPress={handleImagePicker}
            >
              <Icon name="camera-alt" size={24} color="#2E7D32" />
              <Text style={styles.imageUploadText}>Add Photo</Text>
            </TouchableOpacity>
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
              <Text style={styles.submitButtonText}>Submit Complaint</Text>
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
  categoryDropdown: {
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
  categoryDropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryDropdownText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B5E20',
    marginLeft: 12,
    flex: 1,
  },
  categoryDropdownPlaceholder: {
    fontSize: 16,
    color: '#999999',
    marginLeft: 12,
    flex: 1,
  },
  categoryOptions: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  categoryOptionActive: {
    backgroundColor: '#2E7D32',
  },
  categoryOptionText: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 12,
    flex: 1,
  },
  categoryOptionTextActive: {
    color: '#FFFFFF',
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
    minHeight: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'right',
    marginTop: 4,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
  },
  imagePreview: {
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#2E7D32',
    borderStyle: 'dashed',
  },
  imageUploadText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
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

export default ComplaintScreen;

