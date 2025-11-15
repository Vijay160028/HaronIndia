import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors, typography, spacing } from '../constants/theme';
import AuthAPI from '../services/api';
import { useUser } from '../context/UserContext';

const OrdersScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const { getAuthToken, isLoggedIn } = useUser();

  useEffect(() => {
    if (isLoggedIn) {
      fetchOrders();
    } else {
      setIsLoading(false);
    }
  }, [isLoggedIn]);

  const fetchOrders = async () => {
    try {
      const token = await getAuthToken();
      if (!token) {
        setError('Authentication required. Please sign in.');
        setIsLoading(false);
        return;
      }

      const response = await AuthAPI.getOrders(token);
      // Handle different response formats
      const ordersData = response.data || response.orders || response;
      const ordersArray = Array.isArray(ordersData) ? ordersData : [];
      setOrders(ordersArray);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Failed to load orders');
      setOrders([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return '#2E7D32';
      case 'pending':
        return '#FF9800';
      case 'processing':
        return '#2196F3';
      case 'cancelled':
        return '#F44336';
      default:
        return '#666666';
    }
  };

  const renderOrder = (order) => {
    const orderId = order.id || order.orderId || order._id || 'N/A';
    const orderDate = formatDate(order.createdAt || order.orderDate || order.date);
    const orderStatus = order.status || order.paymentStatus || 'pending';
    const totalAmount = order.totalAmount || order.total || 0;
    const itemsCount = order.items?.length || 0;

    return (
      <TouchableOpacity
        key={orderId}
        style={styles.orderCard}
        onPress={() => {
          // Navigate to order details if needed
          Alert.alert('Order Details', `Order ID: ${orderId}\nStatus: ${orderStatus}\nTotal: ₹${totalAmount.toFixed(2)}`);
        }}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderId}>Order #{orderId}</Text>
            <Text style={styles.orderDate}>{orderDate}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(orderStatus) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(orderStatus) }]}>
              {orderStatus.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.orderBody}>
          <View style={styles.orderRow}>
            <Icon name="shopping-bag" size={16} color="#666666" />
            <Text style={styles.orderText}>{itemsCount} item{itemsCount !== 1 ? 's' : ''}</Text>
          </View>
          {order.merchantName && (
            <View style={styles.orderRow}>
              <Icon name="store" size={16} color="#666666" />
              <Text style={styles.orderText}>{order.merchantName}</Text>
            </View>
          )}
          {order.deliveryAddress && (
            <View style={styles.orderRow}>
              <Icon name="location-on" size={16} color="#666666" />
              <Text style={styles.orderText} numberOfLines={1}>
                {order.deliveryAddress.city || ''} {order.deliveryAddress.state || ''}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.orderFooter}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalAmount}>₹{totalAmount.toFixed(2)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Orders</Text>
          <Text style={styles.subtitle}>Track your orders and view order history</Text>
        </View>
        <View style={styles.content}>
          <View style={styles.emptyState}>
            <Icon name="lock" size={64} color="#CCCCCC" />
            <Text style={styles.emptyTitle}>Sign In Required</Text>
            <Text style={styles.emptySubtitle}>
              Please sign in to view your orders
            </Text>
            <TouchableOpacity
              style={styles.signInButton}
              onPress={() => navigation.navigate('SignIn')}
            >
              <Text style={styles.signInButtonText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>My Orders</Text>
          <Text style={styles.subtitle}>Track your orders and view order history</Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2E7D32" />
            <Text style={styles.loadingText}>Loading orders...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Icon name="error-outline" size={48} color="#FF5722" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchOrders}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.content}>
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyTitle}>No Orders Yet</Text>
              <Text style={styles.emptySubtitle}>
                Your orders will appear here once you start shopping
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.ordersList}>
            {orders.map((order) => renderOrder(order))}
          </View>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary || '#1B5E20',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary || '#666666',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#FF5722',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary || '#333333',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary || '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  signInButton: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  ordersList: {
    gap: 16,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: '#999999',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  orderBody: {
    marginBottom: 12,
    gap: 8,
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderText: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  totalLabel: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
});

export default OrdersScreen;
