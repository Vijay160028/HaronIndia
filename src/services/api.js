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
}

export default AuthAPI;

