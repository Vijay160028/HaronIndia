import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, FlatList, ActivityIndicator, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AuthAPI from '../services/api';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { getImageSource } from '../utils/imageUtils';
import { isProfileComplete } from '../utils/profileUtils';

const BuyScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const { addToCart, getCartItemCount } = useCart();
  const { user } = useUser();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await AuthAPI.getProducts();
      // Handle different response formats
      const productsData = response.data || response.products || response;
      const productsArray = Array.isArray(productsData) ? productsData : [];
      setProducts(productsArray);
    } catch (err) {
      setError(err.message || 'Failed to load products');
      // Keep fallback products for demo purposes
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    { id: 'all', name: 'All', icon: 'apps' },
    { id: 'equipment', name: 'Equipment', icon: 'build' },
    { id: 'fertilizers', name: 'Fertilizers', icon: 'flask-outline' },
    { id: 'seeds', name: 'Seeds', icon: 'sprout' },
  ];

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'all' || 
                           product.category?.toLowerCase() === selectedCategory.toLowerCase() ||
                           product.categoryId === selectedCategory;
    const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.title?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderProduct = ({ item }) => {
    const productId = item.id || item.productId || item._id;
    const productName = item.name || item.title || 'Product';
    const productDescription = item.description || item.desc || '';
    const productImageUri = item.image || item.imageUrl || item.thumbnail || '';
    const productPrice = item.price || item.pricePerUnit || '0';
    const productUnit = item.unit || item.unitType || 'per unit';
    const productRating = item.rating || item.averageRating || 0;
    const productReviews = item.reviews || item.reviewCount || 0;

    return (
      <TouchableOpacity 
        style={styles.productCard}
        onPress={() => navigation.navigate('ProductDetail', { productId })}
      >
        <Image 
          source={getImageSource(productImageUri)} 
          style={styles.productImage}
          resizeMode="cover"
        />
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={1}>{productName}</Text>
          <Text style={styles.productDescription} numberOfLines={2}>
            {productDescription}
          </Text>
          <View style={styles.productRating}>
            <Icon name="star" size={14} color="#FFA726" />
            <Text style={styles.ratingText}>{productRating.toFixed(1)}</Text>
            <Text style={styles.reviewsText}>({productReviews} reviews)</Text>
          </View>
          <View style={styles.productFooter}>
            <View>
              <Text style={styles.productPrice}>{productPrice}</Text>
              <Text style={styles.productUnit}>{productUnit}</Text>
            </View>
            <TouchableOpacity 
              style={styles.addToCartButton}
              onPress={async () => {
                if (!isProfileComplete(user)) {
                  Alert.alert(
                    'Profile Incomplete',
                    'Please complete your profile to add items to cart. You need to add: Mobile Number, PIN Code, Village, City, State, Bank Account, Bank Address, IFSC Code, and Kisan Card Number.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { 
                        text: 'Complete Profile', 
                        onPress: () => navigation.navigate('Profile')
                      },
                    ]
                  );
                  return;
                }
                const result = await addToCart(item, 1);
                if (result.success) {
                  // Show success feedback (optional: could use a toast notification)
                }
              }}
            >
              <Icon name="add-shopping-cart" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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
        <Text style={styles.headerTitle}>Buy Seeds & Inputs</Text>
        <TouchableOpacity 
          style={styles.cartButton}
          onPress={() => navigation.navigate('Cart')}
        >
          <Icon name="shopping-cart" size={24} color="#1B5E20" />
          {getCartItemCount() > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>
                {getCartItemCount() > 99 ? '99+' : getCartItemCount()}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#666666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for seeds, fertilizers, tools..."
            placeholderTextColor="#999999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close" size={20} color="#666666" />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Dropdown */}
        <View style={styles.categoryDropdownContainer}>
          <View style={styles.filterLabelContainer}>
            <Icon name="filter-list" size={18} color="#2E7D32" style={styles.filterIcon} />
            <Text style={styles.filterLabel}>Filter by Category</Text>
          </View>
          <TouchableOpacity
            style={styles.categoryDropdown}
            onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
          >
            <View style={styles.categoryDropdownContent}>
              <View style={styles.categoryIconContainer}>
                <MaterialCommunityIcons 
                  name={categories.find(c => c.id === selectedCategory)?.icon || 'apps'} 
                  size={22} 
                  color="#2E7D32" 
                />
              </View>
              <Text style={styles.categoryDropdownText}>
                {categories.find(c => c.id === selectedCategory)?.name || 'All Categories'}
              </Text>
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
                      selectedCategory === category.id && styles.dropdownItemActive
                    ]}
                    onPress={() => {
                      setSelectedCategory(category.id);
                      setShowCategoryDropdown(false);
                    }}
                  >
                    <View style={[
                      styles.dropdownItemIconContainer,
                      selectedCategory === category.id && styles.dropdownItemIconContainerActive
                    ]}>
                      <MaterialCommunityIcons 
                        name={category.icon} 
                        size={20} 
                        color={selectedCategory === category.id ? '#FFFFFF' : '#2E7D32'} 
                      />
                    </View>
                    <Text
                      style={[
                        styles.dropdownItemText,
                        selectedCategory === category.id && styles.dropdownItemTextActive
                      ]}
                    >
                      {category.name}
                    </Text>
                    {selectedCategory === category.id && (
                      <Icon name="check" size={20} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>
        </View>

        {/* Products List */}
        <View style={styles.productsSection}>
          <Text style={styles.sectionTitle}>
            {filteredProducts.length} Products Found
          </Text>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2E7D32" />
              <Text style={styles.loadingText}>Loading products...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Icon name="error-outline" size={48} color="#FF5722" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchProducts}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : filteredProducts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="inventory-2" size={48} color="#999999" />
              <Text style={styles.emptyText}>No products found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
            </View>
          ) : (
            <FlatList
              data={filteredProducts}
              renderItem={renderProduct}
              keyExtractor={(item) => (item.id || item.productId || item._id || Math.random()).toString()}
              scrollEnabled={false}
              numColumns={2}
              columnWrapperStyle={styles.productRow}
            />
          )}
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
  cartButton: {
    padding: 5,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF5722',
    borderRadius: 10,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    paddingVertical: 0,
  },
  categoryDropdownContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  filterLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterIcon: {
    marginRight: 6,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1B5E20',
  },
  categoryDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#2E7D32',
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
  productsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 15,
  },
  productRow: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '48%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#E0E0E0',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 8,
    lineHeight: 16,
  },
  productRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333333',
    marginLeft: 4,
  },
  reviewsText: {
    fontSize: 11,
    color: '#999999',
    marginLeft: 4,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  productUnit: {
    fontSize: 11,
    color: '#999999',
  },
  addToCartButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666666',
  },
  errorContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
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
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666666',
  },
  emptySubtext: {
    marginTop: 4,
    fontSize: 14,
    color: '#999999',
  },
});

export default BuyScreen;

