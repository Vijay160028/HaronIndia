import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AuthAPI from '../services/api';
import { useCart } from '../context/CartContext';

const ProductDetailScreen = ({ navigation, route }) => {
  const { productId, isRental } = route.params || {};
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    if (productId) {
      fetchProductDetails();
    } else {
      setError('Product ID is missing');
      setIsLoading(false);
    }
  }, [productId, fetchProductDetails]);

  const fetchProductDetails = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let response;
      if (isRental) {
        // Fetch rental equipment details
        response = await AuthAPI.getRentalById(productId);
      } else {
        // Fetch product details
        response = await AuthAPI.getProductById(productId);
      }
      // Handle different response formats
      const productData = response.data || response.product || response.rental || response;
      setProduct(productData);
    } catch (err) {
      setError(err.message || `Failed to load ${isRental ? 'rental' : 'product'} details`);
      Alert.alert('Error', err.message || `Failed to load ${isRental ? 'rental' : 'product'} details. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  }, [productId, isRental]);

  const handleAddToCart = async () => {
    if (!product) return;
    
    const result = await addToCart(product, quantity);
    if (result.success) {
      Alert.alert('Success', `${result.message}!`, [
        {
          text: 'Continue Shopping',
          style: 'cancel',
        },
        {
          text: 'View Cart',
          onPress: () => navigation.navigate('Cart'),
        },
      ]);
    } else {
      Alert.alert('Error', result.message);
    }
  };

  const handleBuyNow = () => {
    if (!product) return;
    
    Alert.alert('Buy Now', 'Proceeding to checkout...', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Continue',
        onPress: async () => {
          // Add to cart first, then navigate to checkout
          await addToCart(product, quantity);
          // TODO: Navigate to checkout screen
          navigation.navigate('Cart');
        },
      },
    ]);
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
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

  if (error || !product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={64} color="#FF5722" />
          <Text style={styles.errorText}>{error || 'Product not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchProductDetails}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.goBackButton} onPress={() => navigation.goBack()}>
            <Text style={styles.goBackButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const productName = product.name || product.title || 'Product';
  const productDescription = product.description || product.desc || product.details || 'No description available';
  const productImage = product.image || product.imageUrl || product.thumbnail || 'https://via.placeholder.com/400';
  const productPrice = isRental 
    ? (product.rentalPrice || product.price || product.pricePerUnit || '0')
    : (product.price || product.pricePerUnit || '0');
  const productUnit = isRental 
    ? (product.rentalUnit || product.unit || 'per day')
    : (product.unit || product.unitType || 'per unit');
  const productRating = product.rating || product.averageRating || 0;
  const productReviews = product.reviews || product.reviewCount || 0;
  const productCategory = product.category || product.categoryName || 'Uncategorized';
  
  // Fix inStock logic: prioritize explicit inStock value, then check stock quantity
  // For rentals, check availability instead
  const inStock = isRental 
    ? (product.isAvailable !== false && product.available !== false)
    : (product.inStock === true || (product.inStock !== false && (product.stock === undefined || product.stock > 0)));
  const stock = product.stock || product.quantity || 0;

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
        <Text style={styles.headerTitle}>Product Details</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Icon name="share" size={24} color="#1B5E20" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: productImage }} 
            style={styles.productImage}
            resizeMode="cover"
          />
          {!inStock && (
            <View style={styles.outOfStockBadge}>
              <Text style={styles.outOfStockText}>
                {isRental ? 'Unavailable' : 'Out of Stock'}
              </Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <View style={styles.categoryBadge}>
            <MaterialCommunityIcons name="tag" size={14} color="#2E7D32" />
            <Text style={styles.categoryText}>{productCategory}</Text>
          </View>

          <Text style={styles.productName}>{productName}</Text>

          <View style={styles.ratingContainer}>
            <View style={styles.rating}>
              <Icon name="star" size={18} color="#FFA726" />
              <Text style={styles.ratingText}>{productRating.toFixed(1)}</Text>
              <Text style={styles.reviewsText}>({productReviews} reviews)</Text>
            </View>
            {inStock && (
              <View style={styles.stockContainer}>
                <Icon name="check-circle" size={16} color="#2E7D32" />
                <Text style={styles.stockText}>
                  {isRental ? 'Available for Rent' : `In Stock (available)`}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>{productPrice}</Text>
            <Text style={styles.unit}>{productUnit}</Text>
          </View>

          {/* Quantity Selector */}
          <View style={styles.quantityContainer}>
            <Text style={styles.quantityLabel}>
              {isRental ? 'Rental Period (Days):' : 'Quantity:'}
            </Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={decreaseQuantity}
                disabled={quantity <= 1}
              >
                <Icon name="remove" size={20} color={quantity <= 1 ? "#CCCCCC" : "#2E7D32"} />
              </TouchableOpacity>
              <Text style={styles.quantityValue}>{quantity}</Text>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={increaseQuantity}
                disabled={!inStock || (!isRental && quantity >= stock)}
              >
                <Icon name="add" size={20} color={(!inStock || (!isRental && quantity >= stock)) ? "#CCCCCC" : "#2E7D32"} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{productDescription}</Text>
          </View>

          {/* Additional Details */}
          {product.specifications && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Specifications</Text>
              {Object.entries(product.specifications).map(([key, value]) => (
                <View key={key} style={styles.specRow}>
                  <Text style={styles.specKey}>{key}:</Text>
                  <Text style={styles.specValue}>{value}</Text>
                </View>
              ))}
            </View>
          )}

          {product.benefits && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Benefits</Text>
              {Array.isArray(product.benefits) ? (
                product.benefits.map((benefit, index) => (
                  <View key={index} style={styles.benefitItem}>
                    <Icon name="check-circle" size={16} color="#2E7D32" />
                    <Text style={styles.benefitText}>{benefit}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.description}>{product.benefits}</Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity 
          style={styles.cartButton}
          onPress={handleAddToCart}
          disabled={!inStock}
        >
          <Icon name={isRental ? "event" : "add-shopping-cart"} size={20} color="#2E7D32" />
          <Text style={styles.cartButtonText}>
            {isRental ? 'Add to Rental Cart' : 'Add to Cart'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.buyButton, !inStock && styles.buyButtonDisabled]}
          onPress={handleBuyNow}
          disabled={!inStock}
        >
          <Text style={styles.buyButtonText}>
            {isRental ? 'Rent Now' : 'Buy Now'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  shareButton: {
    padding: 5,
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
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#FF5722',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#2E7D32',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  goBackButton: {
    marginTop: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  goBackButtonText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '600',
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#F5F5F5',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  outOfStockBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(255, 87, 34, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  outOfStockText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  productInfo: {
    padding: 20,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  categoryText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginLeft: 6,
  },
  reviewsText: {
    fontSize: 14,
    color: '#999999',
    marginLeft: 4,
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockText: {
    fontSize: 14,
    color: '#2E7D32',
    marginLeft: 4,
    fontWeight: '600',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  unit: {
    fontSize: 16,
    color: '#999999',
    marginLeft: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 22,
  },
  specRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  specKey: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '600',
    width: 120,
  },
  specValue: {
    fontSize: 14,
    color: '#333333',
    flex: 1,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  actionBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  cartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E8',
    paddingVertical: 14,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: '#2E7D32',
  },
  cartButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginLeft: 8,
  },
  buyButton: {
    flex: 1,
    backgroundColor: '#2E7D32',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  buyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default ProductDetailScreen;

