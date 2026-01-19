// server/kroger.js
// Kroger Products API integration with OAuth2 authentication

import axios from 'axios';
import { betaMessaging } from '../src/utils/betaMessaging.js';

const KROGER_BASE_URL = 'https://api.kroger.com';
const KROGER_AUTH_URL = 'https://api.kroger.com/v1/connect/oauth2/token';

/**
 * Manages OAuth2 access token for Kroger API
 */
class KrogerAuth {
  constructor(clientId, clientSecret) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Get a valid access token (fetches new one if expired)
   */
  async getAccessToken() {
    // Return cached token if still valid (with 5 min buffer)
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry - 300000) {
      return this.accessToken;
    }

    // Fetch new token using Client Credentials flow
    try {
      const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      
      const response = await axios.post(
        KROGER_AUTH_URL,
        'grant_type=client_credentials&scope=product.compact',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${credentials}`
          }
        }
      );

      this.accessToken = response.data.access_token;
      // expires_in is in seconds
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
      
      console.log('✅ Kroger access token obtained, expires at:', new Date(this.tokenExpiry));
      return this.accessToken;
    } catch (error) {
      console.error('❌ Failed to get Kroger access token:', error.response?.data || error.message);
      // Use beta-safe messaging for Kroger API integration
      console.info('ℹ️ Note:', betaMessaging.kroger.internal);
      throw new Error('Kroger API authentication not available in beta');
    }
  }
}

/**
 * Kroger API Service
 */
export class KrogerService {
  constructor(clientId, clientSecret) {
    if (!clientId || !clientSecret) {
      console.warn('⚠️ Kroger API credentials not configured. Set KROGER_CLIENT_ID and KROGER_CLIENT_SECRET');
    }
    this.auth = new KrogerAuth(clientId, clientSecret);
    this.enabled = !!(clientId && clientSecret);
  }

  /**
   * Search for products by term, brand, or productId
   * @param {Object} options - Search parameters
   * @param {string} options.term - Search term (milk, bread, etc.)
   * @param {string} options.brand - Filter by brand name
   * @param {string} options.productId - Exact product ID lookup
   * @param {string} options.locationId - 8-digit location ID for pricing & availability
   * @param {string} options.fulfillment - Filter by fulfillment type (ais, csp, dth, sth)
   * @param {number} options.limit - Number of results (1-50, default 10)
   * @param {number} options.start - Pagination offset
   * @returns {Promise<Object>} Product search results with images, prices, nutrition
   */
  async searchProducts(options = {}) {
    if (!this.enabled) {
      throw new Error('Kroger API is not configured');
    }

    const { term, brand, productId, locationId, fulfillment, limit = 10, start = 1 } = options;

    // Validate required search parameter
    if (!term && !brand && !productId) {
      throw new Error('Must provide at least one of: term, brand, or productId');
    }

    try {
      const token = await this.auth.getAccessToken();
      
      const params = new URLSearchParams();
      if (term) params.append('filter.term', term);
      if (brand) params.append('filter.brand', brand);
      if (productId) params.append('filter.productId', productId);
      if (locationId) params.append('filter.locationId', locationId);
      if (fulfillment) params.append('filter.fulfillment', fulfillment);
      if (limit) params.append('filter.limit', Math.min(limit, 50));
      if (start) params.append('filter.start', start);

      const response = await axios.get(`${KROGER_BASE_URL}/v1/products?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('❌ Kroger product search failed:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get detailed product information by ID
   * @param {string} productId - 13-digit product ID or UPC (omit check digit from barcode)
   * @param {string} locationId - Optional 8-digit location ID for pricing & availability
   * @returns {Promise<Object>} Detailed product with images, nutrition, allergens
   */
  async getProductDetails(productId, locationId = null) {
    if (!this.enabled) {
      throw new Error('Kroger API is not configured');
    }

    if (!productId || productId.length !== 13) {
      throw new Error('Product ID must be 13 digits');
    }

    try {
      const token = await this.auth.getAccessToken();
      
      const params = locationId ? `?filter.locationId=${locationId}` : '';
      const response = await axios.get(`${KROGER_BASE_URL}/v1/products/${productId}${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('❌ Kroger product details failed:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Helper: Extract product images from API response
   * @param {Object} product - Product object from API
   * @returns {Object} Image URLs by size (thumbnail, small, medium, large, xlarge)
   */
  static getProductImages(product) {
    const images = {};
    
    if (product.images && product.images.length > 0) {
      // Find the default or first front-facing image
      const frontImage = product.images.find(img => img.perspective === 'front') || product.images[0];
      
      if (frontImage && frontImage.sizes) {
        frontImage.sizes.forEach(size => {
          images[size.size] = size.url;
        });
      }
    }
    
    return images;
  }

  /**
   * Helper: Extract pricing from product item
   * @param {Object} product - Product object from API
   * @returns {Object|null} Price information (regular, promo, perUnit)
   */
  static getProductPrice(product) {
    if (!product.items || product.items.length === 0) {
      return null;
    }

    const item = product.items[0]; // First item (usually the primary variant)
    
    return {
      regular: item.price?.regular || null,
      promo: item.price?.promo || null,
      nationalRegular: item.nationalPrice?.regular || null,
      nationalPromo: item.nationalPrice?.promo || null,
      size: item.size || null,
      soldBy: item.soldBy || 'unit',
      inStock: item.inventory?.stockLevel !== 'TEMPORARILY_OUT_OF_STOCK'
    };
  }

  /**
   * Helper: Transform Kroger product to your app's grocery item format
   * @param {Object} product - Product object from Kroger API
   * @returns {Object} Standardized grocery item
   */
  static toGroceryItem(product) {
    const images = this.getProductImages(product);
    const price = this.getProductPrice(product);

    return {
      id: product.productId,
      name: product.description,
      brand: product.brand,
      category: product.categories?.[0] || 'Uncategorized',
      imageUrl: images.medium || images.small || images.thumbnail || null,
      images: images,
      price: price?.regular || price?.promo || null,
      priceInfo: price,
      size: price?.size || null,
      nutrition: product.nutritionInformation || null,
      allergens: product.allergens || [],
      snapEligible: product.snapEligible || false,
      organic: !!product.organicClaimName,
      nonGmo: product.nonGmo || false,
      source: 'kroger',
      sourceId: product.productId,
      aisle: product.aisleLocations?.[0]?.description || null
    };
  }
}

// Export singleton instance
let krogerService = null;

export function getKrogerService() {
  if (!krogerService) {
    const clientId = process.env.KROGER_CLIENT_ID;
    const clientSecret = process.env.KROGER_CLIENT_SECRET;
    krogerService = new KrogerService(clientId, clientSecret);
  }
  return krogerService;
}
