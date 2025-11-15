import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, FlatList, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AuthAPI from '../services/api';
import { useCart } from '../context/CartContext';
import { getImageSource } from '../utils/imageUtils';

// Dummy farming equipment data
const dummyEquipment = [
  {
    id: 'rent-1',
    name: 'Mahindra 575 DI Tractor',
    category: 'tractor',
    description: 'Powerful 47 HP tractor with 4WD, perfect for plowing and tilling',
    rentalPrice: '2500',
    rentalUnit: 'per day',
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400',
    rating: 4.8,
    reviews: 45,
    isAvailable: true,
    location: 'Jabalpur, MP',
    specifications: {
      'HP': '47 HP',
      'Fuel Type': 'Diesel',
      'Transmission': '8 Forward + 2 Reverse',
    },
  },
  {
    id: 'rent-2',
    name: 'John Deere Combine Harvester',
    category: 'harvester',
    description: 'Advanced combine harvester for efficient crop harvesting',
    rentalPrice: '8000',
    rentalUnit: 'per day',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400',
    rating: 4.9,
    reviews: 32,
    isAvailable: true,
    location: 'Indore, MP',
    specifications: {
      'Cutting Width': '4.5 meters',
      'Engine HP': '150 HP',
      'Fuel Type': 'Diesel',
    },
  },
  {
    id: 'rent-3',
    name: 'Rotavator Tiller',
    category: 'plow',
    description: 'Heavy duty rotavator for deep tilling and soil preparation',
    rentalPrice: '1200',
    rentalUnit: 'per day',
    image: 'https://images.unsplash.com/photo-1615485925510-865933b2cbf0?w=400',
    rating: 4.6,
    reviews: 28,
    isAvailable: true,
    location: 'Bhopal, MP',
    specifications: {
      'Width': '6 feet',
      'HP Required': '35-50 HP',
      'Type': 'Heavy Duty',
    },
  },
  {
    id: 'rent-4',
    name: 'Drip Irrigation System',
    category: 'irrigation',
    description: 'Complete drip irrigation setup for 1 acre with timer',
    rentalPrice: '1500',
    rentalUnit: 'per day',
    image: 'https://images.unsplash.com/photo-1615485501498-4c6c8e8b0b1a?w=400',
    rating: 4.7,
    reviews: 56,
    isAvailable: true,
    location: 'Nagpur, Maharashtra',
    specifications: {
      'Coverage': '1 Acre',
      'Timer': 'Included',
      'Pipes': '500 meters',
    },
  },
  {
    id: 'rent-5',
    name: 'Boom Sprayer',
    category: 'sprayer',
    description: '12 feet boom sprayer for pesticide and fertilizer application',
    rentalPrice: '1800',
    rentalUnit: 'per day',
    image: 'https://images.unsplash.com/photo-1592078615290-4ee0b49c1c0e?w=400',
    rating: 4.5,
    reviews: 38,
    isAvailable: true,
    location: 'Raipur, Chhattisgarh',
    specifications: {
      'Boom Width': '12 feet',
      'Tank Capacity': '400 liters',
      'HP Required': '30-40 HP',
    },
  },
  {
    id: 'rent-6',
    name: 'Disc Harrow',
    category: 'plow',
    description: 'Heavy duty disc harrow for soil breaking and leveling',
    rentalPrice: '1000',
    rentalUnit: 'per day',
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400',
    rating: 4.4,
    reviews: 22,
    isAvailable: true,
    location: 'Jabalpur, MP',
    specifications: {
      'Width': '7 feet',
      'Discs': '20 discs',
      'HP Required': '40-50 HP',
    },
  },
  {
    id: 'rent-7',
    name: 'Cultivator',
    category: 'cultivator',
    description: 'Multi-row cultivator for weed control and soil aeration',
    rentalPrice: '900',
    rentalUnit: 'per day',
    image: 'https://images.unsplash.com/photo-1615485925510-865933b2cbf0?w=400',
    rating: 4.6,
    reviews: 41,
    isAvailable: true,
    location: 'Indore, MP',
    specifications: {
      'Width': '9 feet',
      'Rows': '9 rows',
      'HP Required': '35-45 HP',
    },
  },
  {
    id: 'rent-8',
    name: 'Seed Drill Machine',
    category: 'other',
    description: 'Precision seed drill for uniform seed sowing',
    rentalPrice: '1400',
    rentalUnit: 'per day',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400',
    rating: 4.7,
    reviews: 29,
    isAvailable: true,
    location: 'Bhopal, MP',
    specifications: {
      'Width': '8 feet',
      'Rows': '13 rows',
      'HP Required': '40-50 HP',
    },
  },
];

const RentScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('rentIn'); // 'rentIn' or 'rentOut'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [equipment, setEquipment] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const { getCartItemCount } = useCart();

  const fetchEquipment = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await AuthAPI.getRentals();
      // Handle different response formats
      const rentalsData = response.data || response.rentals || response.rental || response;
      const rentalsArray = Array.isArray(rentalsData) ? rentalsData : [];
      
      // Use API data if available, otherwise use dummy data
      if (rentalsArray.length > 0) {
        setEquipment(rentalsArray);
      } else {
        // Dummy farming equipment data
        setEquipment(dummyEquipment);
      }
    } catch (err) {
      setError(err.message || 'Failed to load equipment');
      // Use dummy data on error for demo purposes
      setEquipment(dummyEquipment);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  const categories = [
    { id: 'all', name: 'All', icon: 'apps' },
    { id: 'tractor', name: 'Tractors', icon: 'tractor' },
    { id: 'harvester', name: 'Harvesters', icon: 'wheat' },
    { id: 'plow', name: 'Plows & Tillers', icon: 'shovel' },
    { id: 'irrigation', name: 'Irrigation', icon: 'water-pump' },
    { id: 'sprayer', name: 'Sprayers', icon: 'spray' },
    { id: 'cultivator', name: 'Cultivators', icon: 'rake' },
    { id: 'other', name: 'Other', icon: 'tools' },
  ];

  const filteredEquipment = equipment.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || 
                           item.category?.toLowerCase() === selectedCategory.toLowerCase() ||
                           item.categoryId === selectedCategory ||
                           item.subCategory === selectedCategory;
    const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderEquipment = ({ item }) => {
    const equipmentId = item.id || item.productId || item._id;
    const equipmentName = item.name || item.title || 'Equipment';
    const equipmentDescription = item.description || item.desc || '';
    const equipmentImageUri = item.image || item.imageUrl || item.thumbnail || '';
    const rentalPrice = item.rentalPrice || item.price || item.pricePerUnit || '0';
    const rentalUnit = item.rentalUnit || item.unit || 'per day';
    const equipmentRating = item.rating || item.averageRating || 0;
    const equipmentReviews = item.reviews || item.reviewCount || 0;
    const isAvailable = item.isAvailable !== false && item.available !== false;
    const location = item.location || item.city || item.address || '';

    return (
      <TouchableOpacity 
        style={styles.equipmentCard}
        onPress={() => navigation.navigate('ProductDetail', { productId: equipmentId, isRental: true })}
      >
        <Image 
          source={getImageSource(equipmentImageUri)} 
          style={styles.equipmentImage}
          resizeMode="cover"
        />
        {!isAvailable && (
          <View style={styles.unavailableBadge}>
            <Text style={styles.unavailableText}>Unavailable</Text>
          </View>
        )}
        <View style={styles.equipmentInfo}>
          <Text style={styles.equipmentName} numberOfLines={1}>{equipmentName}</Text>
          {location && (
            <View style={styles.locationContainer}>
              <Icon name="location-on" size={12} color="#666666" />
              <Text style={styles.locationText} numberOfLines={1}>{location}</Text>
            </View>
          )}
          <Text style={styles.equipmentDescription} numberOfLines={2}>
            {equipmentDescription}
          </Text>
          <View style={styles.equipmentRating}>
            <Icon name="star" size={14} color="#FFA726" />
            <Text style={styles.ratingText}>{equipmentRating.toFixed(1)}</Text>
            <Text style={styles.reviewsText}>({equipmentReviews} reviews)</Text>
          </View>
          <View style={styles.equipmentFooter}>
            <View>
              <Text style={styles.rentalPrice}>{rentalPrice}</Text>
              <Text style={styles.rentalUnit}>{rentalUnit}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.rentButton, !isAvailable && styles.rentButtonDisabled]}
              onPress={(e) => {
                e.stopPropagation();
                if (isAvailable) {
                  navigation.navigate('ProductDetail', { productId: equipmentId, isRental: true });
                }
              }}
              disabled={!isAvailable}
            >
              <Text style={styles.rentButtonText}>Rent</Text>
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
        <Text style={styles.headerTitle}>Rent Equipment</Text>
        {activeTab === 'rentIn' && (
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
        )}
        {activeTab === 'rentOut' && (
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('RentOutForm')}
          >
            <Icon name="add" size={24} color="#1B5E20" />
          </TouchableOpacity>
        )}
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'rentIn' && styles.activeTab]}
          onPress={() => setActiveTab('rentIn')}
        >
          <Text style={[styles.tabText, activeTab === 'rentIn' && styles.activeTabText]}>
            Rent-In
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'rentOut' && styles.activeTab]}
          onPress={() => setActiveTab('rentOut')}
        >
          <Text style={[styles.tabText, activeTab === 'rentOut' && styles.activeTabText]}>
            Rent-Out
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'rentIn' && (
          <>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#666666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for tractors, harvesters, plows..."
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

        {/* Equipment List */}
        <View style={styles.equipmentSection}>
          <Text style={styles.sectionTitle}>
            {filteredEquipment.length} Equipment Available
          </Text>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2E7D32" />
              <Text style={styles.loadingText}>Loading equipment...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Icon name="error-outline" size={48} color="#FF5722" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchEquipment}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : filteredEquipment.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="tractor" size={48} color="#999999" />
              <Text style={styles.emptyText}>No equipment found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
            </View>
          ) : (
            <FlatList
              data={filteredEquipment}
              renderItem={renderEquipment}
              keyExtractor={(item) => (item.id || item.productId || item._id || Math.random()).toString()}
              scrollEnabled={false}
              numColumns={2}
              columnWrapperStyle={styles.equipmentRow}
            />
          )}
        </View>
          </>
        )}

        {activeTab === 'rentOut' && (
          <View style={styles.rentOutContainer}>
            <View style={styles.infoBanner}>
              <MaterialCommunityIcons name="information" size={20} color="#2E7D32" />
              <Text style={styles.infoText}>
                List your equipment for rent. After submission, Merchant 3 (M3) will verify your equipment.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addEquipmentButton}
              onPress={() => navigation.navigate('RentOutForm')}
            >
              <Icon name="add" size={24} color="#FFFFFF" />
              <Text style={styles.addEquipmentButtonText}>Add Equipment for Rent</Text>
            </TouchableOpacity>
            <Text style={styles.sectionTitle}>My Listed Equipment</Text>
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="tractor" size={48} color="#999999" />
              <Text style={styles.emptyText}>No equipment listed yet</Text>
              <Text style={styles.emptySubtext}>
                Start by adding your first equipment for rent
              </Text>
            </View>
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
  addButton: {
    padding: 5,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#2E7D32',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  activeTabText: {
    color: '#2E7D32',
  },
  rentOutContainer: {
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#2E7D32',
    marginLeft: 10,
  },
  addEquipmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E7D32',
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  addEquipmentButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
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
  equipmentSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 15,
  },
  equipmentRow: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  equipmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '48%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  equipmentImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#E0E0E0',
  },
  unavailableBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 87, 34, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  unavailableText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  equipmentInfo: {
    padding: 12,
  },
  equipmentName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  locationText: {
    fontSize: 11,
    color: '#666666',
    marginLeft: 4,
  },
  equipmentDescription: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 8,
    lineHeight: 16,
  },
  equipmentRating: {
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
  equipmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rentalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  rentalUnit: {
    fontSize: 11,
    color: '#999999',
  },
  rentButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  rentButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  rentButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
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

export default RentScreen;
