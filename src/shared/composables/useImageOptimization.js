/**
 * Image optimization utilities for Cloudinary URLs
 */

const CLOUDINARY_CLOUD = 'ddd2yf0ii';

/**
 * Check if a URL is from Cloudinary
 */
export const isCloudinaryUrl = (url) => {
  return url && url.includes('res.cloudinary.com');
};

/**
 * Generate optimized Cloudinary URL with transformations
 * @param {string} url - Original Cloudinary URL
 * @param {object} options - Transformation options
 * @returns {string} - Transformed URL
 */
export const getOptimizedUrl = (url, options = {}) => {
  if (!url || !isCloudinaryUrl(url)) return url;

  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
    gravity,
    effect,
    radius
  } = options;

  const transformations = [];

  // Format
  if (format) transformations.push(`f_${format}`);

  // Quality
  if (quality) transformations.push(`q_${quality}`);

  // Dimensions
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);

  // Crop mode
  if (crop) transformations.push(`c_${crop}`);

  // Gravity (for face detection, etc)
  if (gravity) transformations.push(`g_${gravity}`);

  // Effects
  if (effect) transformations.push(`e_${effect}`);

  // Radius (for rounded corners)
  if (radius) transformations.push(`r_${radius}`);

  const urlParts = url.split('/upload/');
  if (urlParts.length === 2) {
    return `${urlParts[0]}/upload/${transformations.join(',')}/${urlParts[1]}`;
  }

  return url;
};

/**
 * Generate thumbnail URL
 */
export const getThumbnailUrl = (url, size = 150) => {
  return getOptimizedUrl(url, {
    width: size,
    height: size,
    crop: 'thumb',
    gravity: 'auto'
  });
};

/**
 * Generate placeholder URL (low quality blurred)
 */
export const getPlaceholderUrl = (url) => {
  return getOptimizedUrl(url, {
    width: 50,
    quality: 10,
    effect: 'blur:500'
  });
};

/**
 * Generate responsive srcset for an image
 */
export const getSrcSet = (url, widths = [320, 640, 768, 1024, 1280, 1536]) => {
  if (!isCloudinaryUrl(url)) return null;

  return widths.map(w => {
    const optimizedUrl = getOptimizedUrl(url, { width: w });
    return `${optimizedUrl} ${w}w`;
  }).join(', ');
};

/**
 * Get default sizes attribute for responsive images
 */
export const getDefaultSizes = () => {
  return '(max-width: 320px) 320px, (max-width: 640px) 640px, (max-width: 768px) 768px, (max-width: 1024px) 1024px, (max-width: 1280px) 1280px, 1536px';
};

/**
 * Generate avatar URL with face detection
 */
export const getAvatarUrl = (url, size = 100) => {
  return getOptimizedUrl(url, {
    width: size,
    height: size,
    crop: 'thumb',
    gravity: 'face',
    radius: 'max'
  });
};

/**
 * Generate gallery image URL (optimized for cards)
 */
export const getGalleryImageUrl = (url, width = 400) => {
  return getOptimizedUrl(url, {
    width,
    crop: 'fill',
    gravity: 'auto'
  });
};

/**
 * Generate full-size optimized image
 */
export const getFullSizeUrl = (url, maxWidth = 1920) => {
  return getOptimizedUrl(url, {
    width: maxWidth,
    crop: 'limit'
  });
};

/**
 * Composable for using image optimization in Vue components
 */
export const useImageOptimization = () => {
  return {
    isCloudinaryUrl,
    getOptimizedUrl,
    getThumbnailUrl,
    getPlaceholderUrl,
    getSrcSet,
    getDefaultSizes,
    getAvatarUrl,
    getGalleryImageUrl,
    getFullSizeUrl
  };
};

export default useImageOptimization;
