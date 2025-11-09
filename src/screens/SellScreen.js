import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AuthAPI from '../services/api';
import { useUser } from '../context/UserContext';

const SellScreen = ({ navigation }) => {
  const [myProducts, setMyProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, getAuthToken } = useUser();

  const fetchMyProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await getAuthToken();
      const response = await AuthAPI.getMySellProducts(token);
      // Handle different response formats
      const productsData = response.data || response.products || response.product || response;
      const productsArray = Array.isArray(productsData) ? productsData : [];
      setMyProducts(productsArray);
    } catch (err) {
      setError(err.message || 'Failed to load your products');
      setMyProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [getAuthToken]);

  useEffect(() => {
    fetchMyProducts();
  }, [fetchMyProducts]);

  const handleDeleteProduct = (productId) => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product listing?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getAuthToken();
              await AuthAPI.deleteSellProduct(productId, token);
              await fetchMyProducts();
              Alert.alert('Success', 'Product deleted successfully');
            } catch (err) {
              Alert.alert('Error', err.message || 'Failed to delete product');
            }
          },
        },
      ]
    );
  };

  const renderProduct = ({ item }) => {
    const productId = item.id || item.productId || item._id;
    const productName = item.name || item.title || 'Product';
    const productImage = item.image || item.imageUrl || item.thumbnail || 'https://via.placeholder.com/400';
    const productPrice = item.price || item.pricePerUnit || '0';
    const productUnit = item.unit || item.unitType || 'per unit';
    const quantity = item.quantity || item.stock || '0';
    const status = item.status || 'Active';
    const createdAt = item.createdAt || item.date || '';

    return (
      <TouchableOpacity 
        style={styles.productCard}
        onPress={() => navigation.navigate('ProductDetail', { productId, isMyProduct: true })}
      >
        <Image 
          source={{ uri: productImage }} 
          style={styles.productImage}
          resizeMode="cover"
        />
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={1}>{productName}</Text>
          <View style={styles.productDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Price:</Text>
              <Text style={styles.detailValue}>₹{productPrice} / {productUnit}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Quantity:</Text>
              <Text style={styles.detailValue}>{quantity}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status:</Text>
              <View style={[styles.statusBadge, status === 'Active' && styles.statusActive]}>
                <Text style={[styles.statusText, status === 'Active' && styles.statusTextActive]}>
                  {status}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.productActions}>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => navigation.navigate('AddProduct', { productId, editMode: true })}
            >
              <Icon name="edit" size={18} color="#2E7D32" />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => handleDeleteProduct(productId)}
            >
              <Icon name="delete-outline" size={18} color="#FF5722" />
              <Text style={styles.deleteButtonText}>Delete</Text>
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
        <Text style={styles.headerTitle}>My Products</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('AddProduct')}
        >
          <Icon name="add" size={24} color="#2E7D32" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <MaterialCommunityIcons name="information" size={20} color="#2E7D32" />
          <Text style={styles.infoText}>
            List your produce for sale and reach buyers directly
          </Text>
        </View>

        {/* Products List */}
        <View style={styles.productsSection}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2E7D32" />
              <Text style={styles.loadingText}>Loading your products...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Icon name="error-outline" size={48} color="#FF5722" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchMyProducts}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : myProducts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="basket-outline" size={64} color="#CCCCCC" />
              <Text style={styles.emptyText}>No products listed yet</Text>
              <Text style={styles.emptySubtext}>
                Start selling by adding your first product
              </Text>
              <TouchableOpacity 
                style={styles.addFirstButton}
                onPress={() => navigation.navigate('AddProduct')}
              >
                <Icon name="add" size={20} color="#FFFFFF" />
                <Text style={styles.addFirstButtonText}>Add Your First Product</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.sectionTitle}>
                {myProducts.length} Product{myProducts.length !== 1 ? 's' : ''} Listed
              </Text>
              <FlatList
                data={myProducts}
                renderItem={renderProduct}
                keyExtractor={(item) => (item.id || item.productId || item._id || Math.random()).toString()}
                scrollEnabled={false}
              />
            </>
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
  addButton: {
    padding: 5,
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
  productsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 15,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#E0E0E0',
  },
  productInfo: {
    padding: 15,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  productDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#FFE0B2',
  },
  statusActive: {
    backgroundColor: '#C8E6C9',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E65100',
  },
  statusTextActive: {
    color: '#2E7D32',
  },
  productActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
  },
  editButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FFEBEE',
  },
  deleteButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#FF5722',
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
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666666',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 24,
  },
  addFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E7D32',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
  },
  addFirstButtonText: {
    marginLeft: 8,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SellScreen;

