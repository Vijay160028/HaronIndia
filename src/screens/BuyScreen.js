import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AuthAPI from '../services/api';
import { useCart } from '../context/CartContext';

const BuyScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart, getCartItemCount } = useCart();

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
    { id: 'seeds', name: 'Seeds', icon: 'eco' },
    { id: 'fertilizers', name: 'Fertilizers', icon: 'science' },
    { id: 'pesticides', name: 'Pesticides', icon: 'bug-report' },
    { id: 'tools', name: 'Tools', icon: 'build' },
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
    const productImage = item.image || item.imageUrl || item.thumbnail || 'https://via.placeholder.com/400';
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
          source={{ uri: productImage }} 
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

        {/* Categories */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.categoryChipActive
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <MaterialCommunityIcons 
                name={category.icon} 
                size={20} 
                color={selectedCategory === category.id ? '#FFFFFF' : '#2E7D32'} 
              />
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.categoryTextActive
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

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
  categoriesContainer: {
    marginBottom: 20,
  },
  categoriesContent: {
    paddingHorizontal: 20,
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

