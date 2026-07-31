// src/utils/krogerService.js
// Legacy product-search client retained for future Cloudflare route work.
// Current production APIs are same-origin; never fall back to localhost in a
// deployed browser build.

const API_BASE = "";

/**
 * Search for grocery products using Kroger API
 * @param {Object} options - Search parameters
 * @param {string} options.term - Search term (e.g., "milk", "bread", "chicken")
 * @param {string} options.brand - Filter by brand name
 * @param {string} options.locationId - 8-digit store location for pricing
 * @param {number} options.limit - Max results (default 10, max 50)
 * @returns {Promise<Object>} { success, products, meta }
 */
export async function searchKrogerProducts(options = {}) {
  try {
    const params = new URLSearchParams();

    if (options.term) params.append("term", options.term);
    if (options.brand) params.append("brand", options.brand);
    if (options.locationId) params.append("locationId", options.locationId);
    if (options.limit) params.append("limit", options.limit);
    if (options.start) params.append("start", options.start);
    if (options.fulfillment) params.append("fulfillment", options.fulfillment);

    const response = await fetch(`${API_BASE}/api/kroger/search?${params.toString()}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Product search failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Kroger search error:", error);
    throw error;
  }
}

/**
 * Get detailed product information by ID
 * @param {string} productId - 13-digit product ID
 * @param {string} locationId - Optional 8-digit location for pricing
 * @returns {Promise<Object>} { success, product, rawData }
 */
export async function getKrogerProduct(productId, locationId = null) {
  try {
    const params = locationId ? `?locationId=${encodeURIComponent(locationId)}` : "";
    const response = await fetch(
      `${API_BASE}/api/kroger/product/${encodeURIComponent(productId)}${params}`,
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Product lookup failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Kroger product details error:", error);
    throw error;
  }
}

/**
 * Convert recipe ingredients to grocery items using Kroger search
 * @param {Array} ingredients - Array of ingredient strings
 * @param {string} locationId - Optional location for pricing
 * @returns {Promise<Array>} Array of matched grocery items
 */
export async function ingredientsToGroceryItems(ingredients, locationId = null) {
  const results = [];

  for (const ingredient of ingredients) {
    try {
      const cleanTerm = extractMainIngredient(ingredient);
      const response = await searchKrogerProducts({
        term: cleanTerm,
        locationId,
        limit: 3,
      });

      if (response.success && response.products.length > 0) {
        results.push({
          ...response.products[0],
          originalIngredient: ingredient,
          alternates: response.products.slice(1),
        });
      } else {
        results.push({
          name: ingredient,
          originalIngredient: ingredient,
          matched: false,
          message: "Product not found - manual selection needed",
        });
      }
    } catch (error) {
      console.error(`Failed to match ingredient: ${ingredient}`, error);
      results.push({
        name: ingredient,
        originalIngredient: ingredient,
        matched: false,
        error: error.message,
      });
    }
  }

  return results;
}

/**
 * Helper: Extract main ingredient from string like "2 cups milk" -> "milk"
 * @param {string} ingredient - Full ingredient string
 * @returns {string} Cleaned search term
 */
export function extractMainIngredient(ingredient) {
  const cleaned = ingredient
    .toLowerCase()
    .replace(/\d+(\.\d+)?/g, "")
    .replace(
      /\b(cup|cups|tablespoon|tablespoons|tbsp|teaspoon|teaspoons|tsp|pound|pounds|lb|lbs|ounce|ounces|oz|gram|grams|g|kg|ml|liter|liters|package|packages|can|cans|of|to|taste|chopped|diced|sliced|minced|fresh|dried|optional)\b/gi,
      "",
    )
    .replace(/[(),]/g, "")
    .trim();

  return cleaned || ingredient;
}

/**
 * Get product images for a grocery item
 * @param {Object} product - Product object from Kroger
 * @returns {string|null} Best available image URL
 */
export function getProductImage(product) {
  if (!product?.images) return null;

  return (
    product.images.medium ||
    product.images.small ||
    product.images.thumbnail ||
    product.imageUrl ||
    null
  );
}

/**
 * Format price for display
 * @param {Object} priceInfo - Price object from product
 * @returns {string} Formatted price string
 */
export function formatProductPrice(priceInfo) {
  if (!priceInfo) return "Price unavailable";

  const price = priceInfo.promo || priceInfo.regular;
  if (!price) return "Price unavailable";

  const formatted = `$${price.toFixed(2)}`;

  if (priceInfo.promo && priceInfo.promo < priceInfo.regular) {
    return `${formatted} (Sale! Was $${priceInfo.regular.toFixed(2)})`;
  }

  return formatted;
}

/**
 * Check if Kroger API is available/configured
 * @returns {Promise<boolean>}
 */
export async function isKrogerAvailable() {
  try {
    const response = await fetch(`${API_BASE}/api/kroger/search?term=test&limit=1`);
    return response.status !== 503;
  } catch {
    return false;
  }
}
