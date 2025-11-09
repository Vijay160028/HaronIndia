import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useCart } from '../context/CartContext';

const CartScreen = ({ navigation }) => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartItemCount } = useCart();

  const parsePrice = (price) => {
    if (typeof price === 'number') {
      return isNaN(price) ? 0 : price;
    }
    if (typeof price === 'string') {
      // Remove currency symbols, commas, and other non-numeric characters except decimal point
      const cleaned = price.replace(/[^\d.-]/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  const handleRemoveItem = async (productId) => {
    const result = await removeFromCart(productId);
    if (result.success) {
      Alert.alert('Success', result.message);
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    await updateQuantity(productId, newQuantity);
  };

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            const result = await clearCart();
            if (result.success) {
              Alert.alert('Success', result.message);
            }
          },
        },
      ]
    );
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty. Add some products first.');
      return;
    }
    Alert.alert('Checkout', 'Proceeding to checkout...', [
      {
        text: 'OK',
        onPress: () => {
          // TODO: Navigate to checkout screen
          console.log('Navigate to checkout');
        },
      },
    ]);
  };

  const cartTotal = getCartTotal();
  const itemCount = getCartItemCount();

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
        <Text style={styles.headerTitle}>Shopping Cart</Text>
        {cartItems.length > 0 && (
          <TouchableOpacity onPress={handleClearCart}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="shopping-cart" size={80} color="#CCCCCC" />
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <Text style={styles.emptySubtext}>Add products to get started</Text>
          <TouchableOpacity 
            style={styles.shopButton}
            onPress={() => navigation.navigate('Buy')}
          >
            <Text style={styles.shopButtonText}>Browse Products</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {cartItems.map((item) => {
              const productId = item.id || item.productId || item._id;
              const productName = item.name || item.title || 'Product';
              const productImage = item.image || item.imageUrl || item.thumbnail || 'https://via.placeholder.com/400';
              const productPrice = parsePrice(item.price || item.pricePerUnit || 0);
              const productUnit = item.unit || item.unitType || 'per unit';
              const quantity = item.quantity || 1;
              const itemTotal = productPrice * quantity;

              return (
                <View key={productId} style={styles.cartItem}>
                  <Image 
                    source={{ uri: productImage }} 
                    style={styles.itemImage}
                    resizeMode="cover"
                  />
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={2}>{productName}</Text>
                    <Text style={styles.itemUnit}>{productUnit}</Text>
                    <View style={styles.itemFooter}>
                      <Text style={styles.itemPrice}>₹{productPrice.toFixed(2)}</Text>
                      <View style={styles.quantityContainer}>
                        <TouchableOpacity 
                          style={styles.quantityButton}
                          onPress={() => handleUpdateQuantity(productId, quantity - 1)}
                        >
                          <Icon name="remove" size={18} color="#2E7D32" />
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{quantity}</Text>
                        <TouchableOpacity 
                          style={styles.quantityButton}
                          onPress={() => handleUpdateQuantity(productId, quantity + 1)}
                        >
                          <Icon name="add" size={18} color="#2E7D32" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <Text style={styles.itemTotal}>Total: ₹{itemTotal.toFixed(2)}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => handleRemoveItem(productId)}
                  >
                    <Icon name="delete-outline" size={24} color="#FF5722" />
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>

          {/* Bottom Summary */}
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Items ({itemCount})</Text>
              <Text style={styles.summaryValue}>₹{cartTotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery</Text>
              <Text style={styles.summaryValue}>Free</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₹{cartTotal.toFixed(2)}</Text>
            </View>
            <TouchableOpacity 
              style={styles.checkoutButton}
              onPress={handleCheckout}
            >
              <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
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
  clearText: {
    fontSize: 14,
    color: '#FF5722',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666666',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 30,
  },
  shopButton: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
  },
  shopButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 15,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  itemUnit: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 8,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 4,
  },
  quantityButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  removeButton: {
    padding: 5,
    marginLeft: 10,
  },
  summary: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  checkoutButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CartScreen;

