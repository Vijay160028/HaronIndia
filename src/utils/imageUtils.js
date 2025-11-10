/**
 * Utility functions for handling images with fallback to default avatar
 */

// Default placeholder image for products - using a better placeholder service
// You can also use a local image asset: require('../assets/images/default-product.png')
export const DEFAULT_PRODUCT_IMAGE = 'https://via.placeholder.com/400x400/E8F5E8/2E7D32?text=No+Image';

// Default avatar image for users - using a placeholder service with user icon
// You can also use a local image asset: require('../assets/images/default-avatar.png')
export const DEFAULT_USER_AVATAR = 'https://via.placeholder.com/200x200/E8F5E8/2E7D32?text=User';

/**
 * Get image source with fallback to default avatar
 * @param {string} imageUri - The image URI from backend
 * @returns {object} Image source object with uri
 */
export const getImageSource = (imageUri) => {
  // Check if imageUri is valid
  if (!imageUri || 
      imageUri.trim() === '' || 
      imageUri === 'null' || 
      imageUri === 'undefined' ||
      imageUri === 'https://via.placeholder.com/400' ||
      imageUri === 'https://via.placeholder.com/400x400') {
    return { uri: DEFAULT_PRODUCT_IMAGE };
  }
  return { uri: imageUri };
};

/**
 * Get user avatar image source with fallback to default avatar
 * @param {string} avatarUri - The avatar URI from backend
 * @returns {object} Image source object with uri
 */
export const getUserAvatarSource = (avatarUri) => {
  // Handle null, undefined, or empty values
  if (!avatarUri) {
    return { uri: DEFAULT_USER_AVATAR };
  }
  
  // Convert to string and trim to handle edge cases
  const avatarString = String(avatarUri).trim();
  
  // Check if avatarUri is valid
  if (avatarString === '' || 
      avatarString === 'null' || 
      avatarString === 'undefined' ||
      avatarString === 'Null' ||
      avatarString === 'Undefined' ||
      avatarString.toLowerCase() === 'null' ||
      avatarString.toLowerCase() === 'undefined') {
    return { uri: DEFAULT_USER_AVATAR };
  }
  
  return { uri: avatarString };
};

/**
 * Check if image URI is valid
 * @param {string} imageUri - The image URI to check
 * @returns {boolean} True if image URI is valid
 */
export const isValidImageUri = (imageUri) => {
  if (!imageUri || 
      imageUri.trim() === '' || 
      imageUri === 'null' || 
      imageUri === 'undefined' ||
      imageUri === 'https://via.placeholder.com/400' ||
      imageUri === 'https://via.placeholder.com/400x400') {
    return false;
  }
  return true;
};

