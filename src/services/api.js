// API Configuration
const API_BASE_URL = 'https://us-central1-fir-ac00e.cloudfunctions.net/api';

/**
 * API Service for Authentication
 */
class AuthAPI {
  /**
   * Sign up a new user
   * @param {Object} userData - User signup data
   * @returns {Promise<Object>} - Response data
   */
  static async signup(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: userData.fullName,
          phoneNumber: userData.phoneNumber,
          email: userData.email,
          password: userData.password,
          confirmPassword: userData.confirmPassword,
          userType: userData.userType || 'farmer',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle API errors
        const error = new Error(data.message || 'Signup failed');
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      // Handle network errors
      if (error.message === 'Network request failed') {
        throw new Error('Network error. Please check your internet connection.');
      }
      throw error;
    }
  }

  /**
   * Sign in with email and password
   * @param {Object} credentials - Email and password
   * @returns {Promise<Object>} - Response data
   */
  static async signin(credentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          loginMethod: 'email',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.message || 'Sign in failed');
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      if (error.message === 'Network request failed') {
        throw new Error('Network error. Please check your internet connection.');
      }
      throw error;
    }
  }

  /**
   * Send OTP to phone number
   * @param {string} phoneNumber - Phone number
   * @returns {Promise<Object>} - Response data
   */
  static async sendOTP(phoneNumber) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.message || 'Failed to send OTP');
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      if (error.message === 'Network request failed') {
        throw new Error('Network error. Please check your internet connection.');
      }
      throw error;
    }
  }

  /**
   * Get all products
   * @returns {Promise<Object>} - Response data with products array
   */
  static async getProducts() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.message || 'Failed to fetch products');
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      if (error.message === 'Network request failed') {
        throw new Error('Network error. Please check your internet connection.');
      }
      throw error;
    }
  }

  /**
   * Get product by ID
   * @param {string} productId - Product ID
   * @returns {Promise<Object>} - Response data with product details
   */
  static async getProductById(productId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.message || 'Failed to fetch product');
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      if (error.message === 'Network request failed') {
        throw new Error('Network error. Please check your internet connection.');
      }
      throw error;
    }
  }

  /**
   * Get all rental equipment
   * @returns {Promise<Object>} - Response data with rentals array
   */
  static async getRentals() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/rental`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.message || 'Failed to fetch rentals');
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      if (error.message === 'Network request failed') {
        throw new Error('Network error. Please check your internet connection.');
      }
      throw error;
    }
  }

  /**
   * Get rental by ID
   * @param {string} rentalId - Rental ID
   * @returns {Promise<Object>} - Response data with rental details
   */
  static async getRentalById(rentalId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/rental/${rentalId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.message || 'Failed to fetch rental');
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      if (error.message === 'Network request failed') {
        throw new Error('Network error. Please check your internet connection.');
      }
      throw error;
    }
  }

  /**
   * Create a new product listing
   * @param {Object} productData - Product data
   * @param {string} token - Auth token
   * @returns {Promise<Object>} - Response data
   */
  static async createProduct(productData, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.message || 'Failed to create product');
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      if (error.message === 'Network request failed') {
        throw new Error('Network error. Please check your internet connection.');
      }
      throw error;
    }
  }

  /**
   * Create a new product listing for sale
   * @param {Object} productData - Product data (name, category, price, unit, quantity, stock)
   * @param {string} token - Auth token
   * @returns {Promise<Object>} - Response data
   */
  static async createSellProduct(productData, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sell`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.message || 'Failed to create product listing');
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      if (error.message === 'Network request failed') {
        throw new Error('Network error. Please check your internet connection.');
      }
      throw error;
    }
  }

  /**
   * Update a product listing
   * @param {string} productId - Product ID
   * @param {Object} productData - Updated product data
   * @param {string} token - Auth token
   * @returns {Promise<Object>} - Response data
   */
  static async updateProduct(productId, productData, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.message || 'Failed to update product');
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      if (error.message === 'Network request failed') {
        throw new Error('Network error. Please check your internet connection.');
      }
      throw error;
    }
  }

  /**
   * Delete a product listing
   * @param {string} productId - Product ID
   * @param {string} token - Auth token
   * @returns {Promise<Object>} - Response data
   */
  static async deleteProduct(productId, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.message || 'Failed to delete product');
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      if (error.message === 'Network request failed') {
        throw new Error('Network error. Please check your internet connection.');
      }
      throw error;
    }
  }

  /**
   * Delete a sell product listing
   * @param {string} productId - Product ID
   * @param {string} token - Auth token
   * @returns {Promise<Object>} - Response data
   */
  static async deleteSellProduct(productId, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sell/${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.message || 'Failed to delete product');
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      if (error.message === 'Network request failed') {
        throw new Error('Network error. Please check your internet connection.');
      }
      throw error;
    }
  }

  /**
   * Get my products (products listed by current user)
   * @param {string} token - Auth token
   * @returns {Promise<Object>} - Response data with products array
   */
  static async getMyProducts(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/my`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.message || 'Failed to fetch your products');
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      if (error.message === 'Network request failed') {
        throw new Error('Network error. Please check your internet connection.');
      }
      throw error;
    }
  }

  /**
   * Get my sell products (products listed for sale by current user)
   * @param {string} token - Auth token
   * @returns {Promise<Object>} - Response data with products array
   */
  static async getMySellProducts(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sell`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.message || 'Failed to fetch your products');
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      if (error.message === 'Network request failed') {
        throw new Error('Network error. Please check your internet connection.');
      }
      throw error;
    }
  }
}

export default AuthAPI;

