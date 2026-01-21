/**
 * Frontend Kroger Service Tests
 * Tests for src/utils/krogerService.js
 * 
 * To run: npm test -- krogerService.test.js
 */

import {
  searchKrogerProducts,
  getKrogerProduct,
  ingredientsToGroceryItems,
  extractMainIngredient,
  getProductImage,
  formatProductPrice,
  isKrogerAvailable
} from '../utils/krogerService.js';

// Mock fetch
global.fetch = jest.fn();

describe('krogerService - Frontend API Wrapper', () => {
  const API_BASE = 'http://localhost:3001';

  beforeEach(() => {
    fetch.mockClear();
  });

  describe('searchKrogerProducts', () => {
    test('should build correct search URL', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, products: [] })
      });

      await searchKrogerProducts({ term: 'milk', limit: 5 });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/kroger/search'),
        undefined
      );
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('term=milk'),
        undefined
      );
    });

    test('should handle successful search', async () => {
      const mockProducts = [
        { id: '1', name: 'Milk 1%', price: 3.99 },
        { id: '2', name: 'Milk 2%', price: 4.49 }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, products: mockProducts })
      });

      const result = await searchKrogerProducts({ term: 'milk' });

      expect(result.success).toBe(true);
      expect(result.products).toEqual(mockProducts);
    });

    test('should handle API errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Search failed' })
      });

      try {
        await searchKrogerProducts({ term: 'milk' });
        fail('Should throw error');
      } catch (error) {
        expect(error.message).toContain('failed');
      }
    });

    test('should handle network errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      try {
        await searchKrogerProducts({ term: 'milk' });
        fail('Should throw error');
      } catch (error) {
        expect(error.message).toContain('Network error');
      }
    });

    test('should include all optional parameters', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, products: [] })
      });

      await searchKrogerProducts({
        term: 'milk',
        brand: 'Store Brand',
        locationId: '01500001',
        limit: 10,
        start: 2,
        fulfillment: 'csp'
      });

      const callUrl = fetch.mock.calls[0][0];
      expect(callUrl).toContain('term=milk');
      expect(callUrl).toContain('brand=Store');
      expect(callUrl).toContain('locationId=01500001');
      expect(callUrl).toContain('limit=10');
      expect(callUrl).toContain('start=2');
      expect(callUrl).toContain('fulfillment=csp');
    });
  });

  describe('getKrogerProduct', () => {
    test('should fetch product details', async () => {
      const mockProduct = {
        id: '0000000000001',
        name: 'Product',
        price: 5.99
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, product: mockProduct })
      });

      const result = await getKrogerProduct('0000000000001');

      expect(result.product).toEqual(mockProduct);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/kroger/product/0000000000001'),
        undefined
      );
    });

    test('should include location ID if provided', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, product: {} })
      });

      await getKrogerProduct('0000000000001', '01500001');

      const callUrl = fetch.mock.calls[0][0];
      expect(callUrl).toContain('locationId=01500001');
    });

    test('should handle not found error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Product not found' })
      });

      try {
        await getKrogerProduct('9999999999999');
        fail('Should throw error');
      } catch (error) {
        expect(error.message).toContain('failed');
      }
    });
  });

  describe('ingredientsToGroceryItems', () => {
    beforeEach(() => {
      fetch.mockClear();
    });

    test('should convert ingredients to grocery items', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          products: [{ id: '1', name: 'Milk 1%', price: 3.99 }]
        })
      });

      const result = await ingredientsToGroceryItems(['2 cups milk']);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('originalIngredient', '2 cups milk');
    });

    test('should handle unmatched ingredients', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, products: [] })
      });

      const result = await ingredientsToGroceryItems(['3 cups xyzabc']);

      expect(result[0]).toHaveProperty('matched', false);
      expect(result[0]).toHaveProperty('message', 'Product not found - manual selection needed');
    });

    test('should handle multiple ingredients', async () => {
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            products: [{ id: '1', name: 'Milk', price: 3.99 }]
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            products: [{ id: '2', name: 'Bread', price: 2.49 }]
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            products: [{ id: '3', name: 'Butter', price: 4.99 }]
          })
        });

      const result = await ingredientsToGroceryItems([
        '2 cups milk',
        '1 loaf bread',
        '1 stick butter'
      ]);

      expect(result).toHaveLength(3);
      expect(fetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('extractMainIngredient', () => {
    test('should remove quantities and units', () => {
      expect(extractMainIngredient('2 cups milk')).toBe('milk');
      expect(extractMainIngredient('1/2 tbsp salt')).toBe('salt');
      expect(extractMainIngredient('500g chicken')).toBe('chicken');
    });

    test('should handle complex ingredient strings', () => {
      expect(extractMainIngredient('3 tablespoons olive oil')).toContain('oil');
      expect(extractMainIngredient('1 can (14oz) diced tomatoes')).toContain('tomato');
      expect(extractMainIngredient('2 lbs ground beef, chopped')).toContain('beef');
    });

    test('should preserve original if cleaning results in empty string', () => {
      expect(extractMainIngredient('2 3 4')).toBe('2 3 4');
    });

    test('should be case insensitive', () => {
      expect(extractMainIngredient('2 CUPS MILK')).toBe('milk');
    });
  });

  describe('getProductImage', () => {
    test('should prefer medium image size', () => {
      const product = {
        images: {
          thumbnail: 'small.jpg',
          small: 'med_small.jpg',
          medium: 'medium.jpg',
          large: 'large.jpg'
        }
      };

      expect(getProductImage(product)).toBe('medium.jpg');
    });

    test('should fallback to small if medium unavailable', () => {
      const product = {
        images: {
          small: 'small.jpg',
          thumbnail: 'tiny.jpg'
        }
      };

      expect(getProductImage(product)).toBe('small.jpg');
    });

    test('should fallback to thumbnail as last resort', () => {
      const product = {
        images: { thumbnail: 'tiny.jpg' }
      };

      expect(getProductImage(product)).toBe('tiny.jpg');
    });

    test('should return null if no images', () => {
      expect(getProductImage({ images: {} })).toBeNull();
      expect(getProductImage({})).toBeNull();
      expect(getProductImage(null)).toBeNull();
    });

    test('should check imageUrl property', () => {
      const product = { imageUrl: 'fallback.jpg' };
      expect(getProductImage(product)).toBeNull(); // No images object
    });
  });

  describe('formatProductPrice', () => {
    test('should format regular price', () => {
      const priceInfo = { regular: 5.99 };
      expect(formatProductPrice(priceInfo)).toBe('$5.99');
    });

    test('should show promo savings', () => {
      const priceInfo = {
        regular: 9.99,
        promo: 6.99
      };

      const result = formatProductPrice(priceInfo);
      expect(result).toContain('$6.99');
      expect(result).toContain('Sale');
      expect(result).toContain('$9.99');
    });

    test('should use promo if cheaper', () => {
      const priceInfo = {
        regular: 5.00,
        promo: 3.50
      };

      const result = formatProductPrice(priceInfo);
      expect(result).toContain('$3.50');
    });

    test('should handle missing price info', () => {
      expect(formatProductPrice(null)).toBe('Price unavailable');
      expect(formatProductPrice({})).toBe('Price unavailable');
      expect(formatProductPrice({ promo: null, regular: null })).toBe('Price unavailable');
    });

    test('should format prices to 2 decimals', () => {
      const priceInfo = { regular: 5.1 };
      expect(formatProductPrice(priceInfo)).toBe('$5.10');
    });
  });

  describe('isKrogerAvailable', () => {
    test('should return true if API responds with 200', async () => {
      fetch.mockResolvedValueOnce({ status: 200 });

      const result = await isKrogerAvailable();
      expect(result).toBe(true);
    });

    test('should return false if API returns 503', async () => {
      fetch.mockResolvedValueOnce({ status: 503 });

      const result = await isKrogerAvailable();
      expect(result).toBe(false);
    });

    test('should return false on network error', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await isKrogerAvailable();
      expect(result).toBe(false);
    });

    test('should make test search request', async () => {
      fetch.mockResolvedValueOnce({ status: 200 });

      await isKrogerAvailable();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/kroger/search'),
        undefined
      );
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('term=test'),
        undefined
      );
    });
  });
});
