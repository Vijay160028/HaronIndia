import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AuthAPI from '../services/api';
import { useUser } from '../context/UserContext';

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
  const categoryScrollRef = useRef(null);

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
    { id: 'grains', name: 'Grains', icon: 'wheat' },
    { id: 'vegetables', name: 'Vegetables', icon: 'carrot' },
    { id: 'fruits', name: 'Fruits', icon: 'apple' },
    { id: 'pulses', name: 'Pulses', icon: 'seed' },
    { id: 'spices', name: 'Spices', icon: 'pepper' },
    { id: 'other', name: 'Other', icon: 'apps' },
  ];

  const units = [
    { id: 'kg', name: 'Kilogram (kg)' },
    { id: 'quintal', name: 'Quintal' },
    { id: 'ton', name: 'Ton' },
    { id: 'bag', name: 'Bag' },
    { id: 'piece', name: 'Piece' },
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Scroll to start when category changes to show selected category first
    if (field === 'category' && categoryScrollRef.current) {
      setTimeout(() => {
        categoryScrollRef.current?.scrollTo({ x: 0, animated: true });
      }, 100);
    }
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
            {formData.image ? (
              <Image 
                source={{ uri: formData.image }} 
                style={styles.productImage}
                resizeMode="cover"
              />
            ) : (
              <MaterialCommunityIcons name="image-outline" size={48} color="#CCCCCC" />
            )}
          </View>
          <TouchableOpacity style={styles.imageButton}>
            <Icon name="camera-alt" size={20} color="#2E7D32" />
            <Text style={styles.imageButtonText}>Add Photo</Text>
          </TouchableOpacity>
        </View>

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
            <Text style={styles.label}>Category *</Text>
            <ScrollView 
              ref={categoryScrollRef}
              horizontal 
              showsHorizontalScrollIndicator={true}
              contentContainerStyle={styles.categoryScrollContent}
              style={styles.categoryScrollView}
            >
              {categories
                .sort((a, b) => {
                  // Move selected category to the front
                  if (a.id === formData.category) return -1;
                  if (b.id === formData.category) return 1;
                  return 0;
                })
                .map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryChip,
                    formData.category === category.id && styles.categoryChipActive
                  ]}
                  onPress={() => handleInputChange('category', category.id)}
                >
                  <MaterialCommunityIcons 
                    name={category.icon} 
                    size={20} 
                    color={formData.category === category.id ? '#FFFFFF' : '#2E7D32'} 
                  />
                  <Text
                    style={[
                      styles.categoryText,
                      formData.category === category.id && styles.categoryTextActive
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
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
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
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
  categoryScrollView: {
    maxHeight: 60,
  },
  categoryScrollContent: {
    paddingRight: 20,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: '#2E7D32',
  },
  categoryChipActive: {
    backgroundColor: '#2E7D32',
  },
  categoryText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
  },
  categoryTextActive: {
    color: '#FFFFFF',
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

