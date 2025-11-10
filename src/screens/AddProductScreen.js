import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Alert, ActivityIndicator, Modal, Platform, PermissionsAndroid } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import AuthAPI from '../services/api';
import { useUser } from '../context/UserContext';
import { getImageSource } from '../utils/imageUtils';

const AddProductScreen = ({ navigation, route }) => {
  const { productId, editMode } = route.params || {};
  const { user, getAuthToken } = useUser();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    unit: 'kg',
    quantity: '',
    image: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (editMode && productId) {
      fetchProductDetails();
    }
  }, [editMode, productId]);

  const fetchProductDetails = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await AuthAPI.getProductById(productId);
      // const product = response.data || response.product || response;
      // setFormData({
      //   name: product.name || '',
      //   description: product.description || '',
      //   category: product.category || '',
      //   price: product.price || '',
      //   unit: product.unit || 'kg',
      //   quantity: product.quantity || product.stock || '',
      //   image: product.image || '',
      // });
    } catch (err) {
      Alert.alert('Error', 'Failed to load product details');
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    { id: 'grains', name: 'Grains', icon: 'corn' },
    { id: 'vegetables', name: 'Vegetables', icon: 'carrot' },
    { id: 'fruits', name: 'Fruits', icon: 'apple' },
    { id: 'pulses', name: 'Pulses', icon: 'sprout' },
    { id: 'spices', name: 'Spices', icon: 'chili-mild' },
    { id: 'other', name: 'Other', icon: 'apps' },
  ];

  const units = [
    { id: 'kg', name: 'Kilogram (kg)' },
    { id: 'quintal', name: 'Quintal' },
    { id: 'ton', name: 'Ton' },
    { id: 'bag', name: 'Bag' },
    { id: 'piece', name: 'Piece' },
  ];

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        // First check if permission is already granted
        const checkResult = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.CAMERA
        );
        
        if (checkResult) {
          console.log('Camera permission already granted');
          return true;
        }

        // Request permission
        console.log('Requesting camera permission...');
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'Haron India needs access to your camera to take product photos.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        
        console.log('Camera permission result:', granted);
        
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Camera permission granted');
          return true;
        } else if (granted === PermissionsAndroid.RESULTS.DENIED) {
          Alert.alert(
            'Permission Denied',
            'Camera permission is required to take photos. Please grant permission to continue.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Try Again', onPress: () => requestCameraPermission() },
            ]
          );
          return false;
        } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          Alert.alert(
            'Permission Required',
            'Camera permission has been permanently denied. Please enable it in Settings > Apps > Haron India > Permissions > Camera.',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Open Settings', 
                onPress: () => {
                  // On Android, we can't directly open settings, but we can guide the user
                  Alert.alert(
                    'How to Enable',
                    'Go to Settings > Apps > Haron India > Permissions > Camera and enable it.'
                  );
                }
              },
            ]
          );
          return false;
        } else {
          return false;
        }
      } catch (err) {
        console.error('Camera permission error:', err);
        Alert.alert('Error', 'Failed to request camera permission. Please try again.');
        return false;
      }
    }
    // iOS permissions are handled automatically by the image picker
    return true;
  };

  const handleImagePicker = async (type) => {
    setShowImageOptions(false);
    
    // Check if image picker is available
    if (!launchCamera || !launchImageLibrary) {
      Alert.alert(
        'Image Picker Not Available',
        'Please rebuild the app after installing react-native-image-picker. Run: npm run android'
      );
      return;
    }
    
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
      includeBase64: false,
    };

    try {
      if (type === 'camera') {
        // Always request camera permission for Android before opening camera
        if (Platform.OS === 'android') {
          const hasPermission = await requestCameraPermission();
          if (!hasPermission) {
            // Permission was denied or not granted
            // The requestCameraPermission function already shows appropriate alerts
            return;
          }
        }
        // Launch camera after permission is granted
        launchCamera(options, (response) => {
          handleImageResponse(response);
        });
      } else {
        // For gallery, no permission needed on Android 10+ (scoped storage)
        // But we'll still try to launch it
        launchImageLibrary(options, (response) => {
          handleImageResponse(response);
        });
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to open image picker. Please rebuild the app.');
      setUploadingImage(false);
    }
  };

  const handleImageResponse = (response) => {
    if (response.didCancel) {
      return;
    }

    if (response.errorMessage) {
      Alert.alert('Error', response.errorMessage);
      return;
    }

    if (response.assets && response.assets[0]) {
      const asset = response.assets[0];
      const imageUri = asset.uri;
      
      if (imageUri) {
        setUploadingImage(true);
        try {
          // Store the local URI
          // In production, you'd upload to a server and get a URL back
          handleInputChange('image', imageUri);
          setUploadingImage(false);
        } catch (error) {
          console.error('Image processing error:', error);
          Alert.alert('Error', 'Failed to process image');
          setUploadingImage(false);
        }
      }
    } else if (response.uri) {
      // Fallback for older API format
      setUploadingImage(true);
      try {
        handleInputChange('image', response.uri);
        setUploadingImage(false);
      } catch (error) {
        console.error('Image processing error:', error);
        Alert.alert('Error', 'Failed to process image');
        setUploadingImage(false);
      }
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Please enter product name');
      return false;
    }
    if (!formData.category) {
      Alert.alert('Validation Error', 'Please select a category');
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid price');
      return false;
    }
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid quantity');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const productData = {
        name: formData.name.trim(),
        category: formData.category,
        price: parseFloat(formData.price),
        unit: formData.unit,
        quantity: parseFloat(formData.quantity),
        stock: parseFloat(formData.quantity),
      };

      // Add optional fields if provided
      if (formData.description.trim()) {
        productData.description = formData.description.trim();
      }
      if (formData.image.trim()) {
        productData.image = formData.image.trim();
      }

      const token = await getAuthToken();
      if (editMode) {
        await AuthAPI.updateProduct(productId, productData, token);
        Alert.alert('Success', 'Product updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        await AuthAPI.createSellProduct(productData, token);
        Alert.alert('Success', 'Product listed successfully', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>Loading product details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#1B5E20" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {editMode ? 'Edit Product' : 'Add Product'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Product Image */}
        <View style={styles.imageSection}>
          <View style={styles.imageContainer}>
            {uploadingImage ? (
              <ActivityIndicator size="large" color="#2E7D32" />
            ) : formData.image ? (
              <View style={styles.imageWrapper}>
                <Image 
                  source={getImageSource(formData.image)} 
                  style={styles.productImage}
                  resizeMode="cover"
                />
                <TouchableOpacity 
                  style={styles.removeImageButton}
                  onPress={() => handleInputChange('image', '')}
                >
                  <Icon name="close" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <MaterialCommunityIcons name="image-outline" size={48} color="#CCCCCC" />
            )}
          </View>
          <TouchableOpacity 
            style={styles.imageButton}
            onPress={() => setShowImageOptions(true)}
            disabled={uploadingImage}
          >
            <Icon name="camera-alt" size={20} color="#2E7D32" />
            <Text style={styles.imageButtonText}>
              {formData.image ? 'Change Photo' : 'Add Photo'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Image Options Modal */}
        <Modal
          visible={showImageOptions}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowImageOptions(false)}
        >
          <View style={styles.imageOptionsModal}>
            <View style={styles.imageOptionsContainer}>
              <Text style={styles.imageOptionsTitle}>Select Photo</Text>
              <TouchableOpacity
                style={styles.imageOptionButton}
                onPress={() => handleImagePicker('camera')}
              >
                <Icon name="camera-alt" size={24} color="#2E7D32" />
                <Text style={styles.imageOptionText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.imageOptionButton}
                onPress={() => handleImagePicker('gallery')}
              >
                <Icon name="photo-library" size={24} color="#2E7D32" />
                <Text style={styles.imageOptionText}>Choose from Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.imageOptionButton, styles.cancelButton]}
                onPress={() => setShowImageOptions(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Form Fields */}
        <View style={styles.formSection}>
          {/* Product Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Product Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Wheat, Rice, Tomatoes"
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
            />
          </View>

          {/* Category */}
          <View style={styles.inputGroup}>
            <View style={styles.filterLabelContainer}>
              <Icon name="category" size={18} color="#2E7D32" style={styles.filterIcon} />
            <Text style={styles.label}>Category *</Text>
            </View>
            <TouchableOpacity
              style={styles.categoryDropdown}
              onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
            >
              <View style={styles.categoryDropdownContent}>
                {formData.category ? (
                  <>
                    <View style={styles.categoryIconContainer}>
                      <MaterialCommunityIcons 
                        name={categories.find(c => c.id === formData.category)?.icon || 'apps'} 
                        size={22} 
                        color="#2E7D32" 
                      />
                    </View>
                    <Text style={styles.categoryDropdownText}>
                      {categories.find(c => c.id === formData.category)?.name || 'Select Category'}
                    </Text>
                  </>
                ) : (
                  <>
                    <View style={styles.categoryIconContainer}>
                      <MaterialCommunityIcons name="apps" size={22} color="#999999" />
                    </View>
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

            <Modal
              visible={showCategoryDropdown}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setShowCategoryDropdown(false)}
            >
              <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setShowCategoryDropdown(false)}
              >
                <View style={styles.dropdownMenu}>
                  {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                        styles.dropdownItem,
                        formData.category === category.id && styles.dropdownItemActive
                  ]}
                      onPress={() => {
                        handleInputChange('category', category.id);
                        setShowCategoryDropdown(false);
                      }}
                >
                      <View style={[
                        styles.dropdownItemIconContainer,
                        formData.category === category.id && styles.dropdownItemIconContainerActive
                      ]}>
                  <MaterialCommunityIcons 
                    name={category.icon} 
                    size={20} 
                    color={formData.category === category.id ? '#FFFFFF' : '#2E7D32'} 
                  />
                      </View>
                  <Text
                    style={[
                          styles.dropdownItemText,
                          formData.category === category.id && styles.dropdownItemTextActive
                    ]}
                  >
                    {category.name}
                  </Text>
                      {formData.category === category.id && (
                        <Icon name="check" size={20} color="#FFFFFF" />
                      )}
                </TouchableOpacity>
              ))}
                </View>
              </TouchableOpacity>
            </Modal>
          </View>

          {/* Price and Unit */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Price per Unit *</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                keyboardType="numeric"
                value={formData.price}
                onChangeText={(value) => handleInputChange('price', value)}
              />
            </View>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Unit *</Text>
              <View style={styles.pickerContainer}>
                {units.map((unit) => (
                  <TouchableOpacity
                    key={unit.id}
                    style={[
                      styles.unitChip,
                      formData.unit === unit.id && styles.unitChipActive
                    ]}
                    onPress={() => handleInputChange('unit', unit.id)}
                  >
                    <Text
                      style={[
                        styles.unitText,
                        formData.unit === unit.id && styles.unitTextActive
                      ]}
                    >
                      {unit.id}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Quantity */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Available Quantity *</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              keyboardType="numeric"
              value={formData.quantity}
              onChangeText={(value) => handleInputChange('quantity', value)}
            />
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your product..."
              multiline
              numberOfLines={4}
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
            />
          </View>

          {/* Image URL */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Image URL (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="https://example.com/image.jpg"
              value={formData.image}
              onChangeText={(value) => handleInputChange('image', value)}
            />
          </View>
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
            <Text style={styles.submitButtonText}>
              {editMode ? 'Update Product' : 'List Product'}
            </Text>
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
  imageSection: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 15,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
  },
  imageButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
  },
  imageOptionsModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  imageOptionsContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  imageOptionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 20,
    textAlign: 'center',
  },
  imageOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: 12,
  },
  imageOptionText: {
    marginLeft: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginTop: 8,
  },
  cancelButtonText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  formSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
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
  filterLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterIcon: {
    marginRight: 6,
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
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
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
  categoryIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#E8F5E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryDropdownText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B5E20',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    paddingTop: 100,
  },
  dropdownMenu: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  categoryDropdownPlaceholder: {
    fontSize: 16,
    color: '#999999',
    flex: 1,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItemActive: {
    backgroundColor: '#2E7D32',
  },
  dropdownItemIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#E8F5E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dropdownItemIconContainerActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dropdownItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  dropdownItemTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  unitChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 8,
    marginBottom: 8,
  },
  unitChipActive: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  unitText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
  },
  unitTextActive: {
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 30,
  },
  submitButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddProductScreen;

