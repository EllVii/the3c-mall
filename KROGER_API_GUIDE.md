# Kroger API Integration Guide

**Quick Reference for Kroger API Integration**

This guide provides step-by-step instructions for integrating the Kroger API into The 3C Mall once your developer application is approved.

---

## ⚡ Quick Start (Post-Approval)

### Prerequisites
- ✅ Kroger Developer Account approved
- ✅ Client ID and Client Secret received
- ✅ Node.js server running (`server/` directory)

### 1. Configure Credentials (2 minutes)

Edit `server/.env`:
```env
# Kroger API Credentials
KROGER_CLIENT_ID=your-client-id-from-kroger-portal
KROGER_CLIENT_SECRET=your-client-secret-from-kroger-portal
KROGER_API_BASE=https://api.kroger.com/v1
KROGER_SCOPE=product.compact

# Optional: For location-based features
KROGER_DEFAULT_ZIP=90210
```

**🔒 Security Note:** Never commit `.env` file to git. It's already in `.gitignore`.

### 2. Install Dependencies (1 minute)

```bash
cd server
npm install axios simple-oauth2 node-cache
```

### 3. Test Authentication (3 minutes)

Create `server/test-kroger-auth.js`:
```javascript
require('dotenv').config();
const axios = require('axios');

async function testKrogerAuth() {
  try {
    // Request access token
    const authResponse = await axios.post(
      'https://api.kroger.com/v1/connect/oauth2/token',
      'grant_type=client_credentials&scope=product.compact',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(
            `${process.env.KROGER_CLIENT_ID}:${process.env.KROGER_CLIENT_SECRET}`
          ).toString('base64')}`
        }
      }
    );

    console.log('✅ Authentication successful!');
    console.log('Access Token:', authResponse.data.access_token.substring(0, 20) + '...');
    console.log('Expires In:', authResponse.data.expires_in, 'seconds');
    return authResponse.data.access_token;
  } catch (error) {
    console.error('❌ Authentication failed:', error.response?.data || error.message);
    throw error;
  }
}

// Test product search
async function testProductSearch(accessToken) {
  try {
    const response = await axios.get(
      'https://api.kroger.com/v1/products',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        },
        params: {
          'filter.term': 'milk',
          'filter.limit': 5
        }
      }
    );

    console.log('✅ Product search successful!');
    console.log('Found products:', response.data.data.length);
    console.log('Sample product:', response.data.data[0]?.description);
  } catch (error) {
    console.error('❌ Product search failed:', error.response?.data || error.message);
  }
}

// Run tests
(async () => {
  console.log('🧪 Testing Kroger API Integration...\n');
  const token = await testKrogerAuth();
  await testProductSearch(token);
})();
```

Run the test:
```bash
node server/test-kroger-auth.js
```

Expected output:
```
✅ Authentication successful!
Access Token: eyJhbGciOiJSUzI1NiIs...
Expires In: 1800 seconds
✅ Product search successful!
Found products: 5
Sample product: Kroger® Vitamin D Whole Milk
```

---

## 🏗️ Production Integration

### Step 1: Create Kroger API Service

Create `server/services/krogerAPI.js`:

```javascript
const axios = require('axios');
const NodeCache = require('node-cache');

// Cache tokens for 25 minutes (they expire in 30)
const tokenCache = new NodeCache({ stdTTL: 1500 });

// Cache product data for 1 hour
const productCache = new NodeCache({ stdTTL: 3600 });

class KrogerAPI {
  constructor() {
    this.clientId = process.env.KROGER_CLIENT_ID;
    this.clientSecret = process.env.KROGER_CLIENT_SECRET;
    this.baseUrl = process.env.KROGER_API_BASE || 'https://api.kroger.com/v1';
    this.scope = process.env.KROGER_SCOPE || 'product.compact';
  }

  /**
   * Get or refresh OAuth access token
   */
  async getAccessToken() {
    // Check cache first
    const cached = tokenCache.get('accessToken');
    if (cached) return cached;

    try {
      const authString = Buffer.from(
        `${this.clientId}:${this.clientSecret}`
      ).toString('base64');

      const response = await axios.post(
        `${this.baseUrl}/connect/oauth2/token`,
        `grant_type=client_credentials&scope=${this.scope}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${authString}`
          }
        }
      );

      const token = response.data.access_token;
      tokenCache.set('accessToken', token);
      return token;
    } catch (error) {
      console.error('Kroger API authentication failed:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with Kroger API');
    }
  }

  /**
   * Search for products by name
   */
  async searchProducts(searchTerm, options = {}) {
    const cacheKey = `search:${searchTerm}:${JSON.stringify(options)}`;
    const cached = productCache.get(cacheKey);
    if (cached) return cached;

    try {
      const token = await this.getAccessToken();
      const response = await axios.get(`${this.baseUrl}/products`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        params: {
          'filter.term': searchTerm,
          'filter.limit': options.limit || 10,
          'filter.locationId': options.locationId,
          ...options
        }
      });

      const products = response.data.data || [];
      productCache.set(cacheKey, products);
      return products;
    } catch (error) {
      console.error('Kroger product search failed:', error.response?.data || error.message);
      return [];
    }
  }

  /**
   * Get product details by UPC or product ID
   */
  async getProduct(productId, locationId = null) {
    const cacheKey = `product:${productId}:${locationId}`;
    const cached = productCache.get(cacheKey);
    if (cached) return cached;

    try {
      const token = await this.getAccessToken();
      const params = {};
      if (locationId) params['filter.locationId'] = locationId;

      const response = await axios.get(`${this.baseUrl}/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        params
      });

      const product = response.data.data;
      productCache.set(cacheKey, product);
      return product;
    } catch (error) {
      console.error('Kroger get product failed:', error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Find nearby Kroger stores
   */
  async findNearbyStores(zipCode, radiusMiles = 10) {
    const cacheKey = `stores:${zipCode}:${radiusMiles}`;
    const cached = productCache.get(cacheKey);
    if (cached) return cached;

    try {
      const token = await this.getAccessToken();
      const response = await axios.get(`${this.baseUrl}/locations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        params: {
          'filter.zipCode.near': zipCode,
          'filter.radiusInMiles': radiusMiles,
          'filter.limit': 10
        }
      });

      const stores = response.data.data || [];
      productCache.set(cacheKey, stores);
      return stores;
    } catch (error) {
      console.error('Kroger store search failed:', error.response?.data || error.message);
      return [];
    }
  }

  /**
   * Extract price from product data
   */
  extractPrice(product) {
    // Kroger API returns prices in items[0].price.regular or items[0].price.promo
    if (!product?.items?.length) return null;
    
    const item = product.items[0];
    const price = item.price?.promo || item.price?.regular;
    
    return price ? parseFloat(price) : null;
  }
}

module.exports = new KrogerAPI();
```

### Step 2: Add API Endpoints

Update `server/index.js` to add Kroger endpoints:

```javascript
const krogerAPI = require('./services/krogerAPI');

// Search Kroger products
app.get('/api/kroger/search', async (req, res) => {
  try {
    const { q, limit, locationId } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query (q) is required' });
    }

    const products = await krogerAPI.searchProducts(q, { 
      limit: parseInt(limit) || 10,
      locationId 
    });

    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Kroger search error:', error);
    res.status(500).json({ error: 'Failed to search Kroger products' });
  }
});

// Get product details and price
app.get('/api/kroger/product/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { locationId } = req.query;

    const product = await krogerAPI.getProduct(id, locationId);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      success: true,
      product,
      price: krogerAPI.extractPrice(product)
    });
  } catch (error) {
    console.error('Kroger product error:', error);
    res.status(500).json({ error: 'Failed to get product details' });
  }
});

// Find nearby Kroger stores
app.get('/api/kroger/stores', async (req, res) => {
  try {
    const { zipCode, radius } = req.query;
    
    if (!zipCode) {
      return res.status(400).json({ error: 'zipCode parameter is required' });
    }

    const stores = await krogerAPI.findNearbyStores(
      zipCode, 
      parseInt(radius) || 10
    );

    res.json({
      success: true,
      count: stores.length,
      stores
    });
  } catch (error) {
    console.error('Kroger stores error:', error);
    res.status(500).json({ error: 'Failed to find Kroger stores' });
  }
});
```

### Step 3: Update Frontend Integration

Update `src/utils/groceryPricingTest.js` to fetch real Kroger prices:

```javascript
// Add this function to fetch real Kroger prices
async function fetchKrogerPrice(itemName) {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE}/api/kroger/search?q=${encodeURIComponent(itemName)}&limit=1`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.products && data.products.length > 0) {
      const product = data.products[0];
      return krogerAPI.extractPrice(product);
    }
    
    return null;
  } catch (error) {
    console.error('Failed to fetch Kroger price:', error);
    return null;
  }
}

// Update ensurePricesByStore to use real API when available
async function ensurePricesByStoreAsync(itemName, pricesByStore = {}) {
  const out = { ...pricesByStore };
  
  // Try to fetch real Kroger price if not already set
  if (!out.kroger && import.meta.env.VITE_USE_KROGER_API === 'true') {
    const realPrice = await fetchKrogerPrice(itemName);
    if (realPrice) {
      out.kroger = realPrice;
    }
  }
  
  // Fill in missing stores with defaults
  for (const sid of STORE_IDS) {
    if (out[sid] == null) {
      out[sid] = null;
    }
  }
  
  return out;
}
```

Add to `.env`:
```env
# Enable real Kroger API integration
VITE_USE_KROGER_API=true
```

---

## 🧪 Testing Your Integration

### Test Checklist

```bash
# 1. Test authentication
node server/test-kroger-auth.js

# 2. Test search endpoint
curl "http://localhost:3001/api/kroger/search?q=milk&limit=5"

# 3. Test product endpoint (use a product ID from search results)
curl "http://localhost:3001/api/kroger/product/0001111041700"

# 4. Test stores endpoint
curl "http://localhost:3001/api/kroger/stores?zipCode=90210&radius=10"

# 5. Check API health
curl "http://localhost:3001/api/health"
```

### Expected Responses

**Search Response:**
```json
{
  "success": true,
  "count": 5,
  "products": [
    {
      "productId": "0001111041700",
      "description": "Kroger® Vitamin D Whole Milk",
      "items": [
        {
          "price": {
            "regular": 3.99,
            "promo": null
          }
        }
      ]
    }
  ]
}
```

---

## 📊 Rate Limits & Best Practices

### Kroger API Rate Limits (Standard Tier)
- **Requests:** 10,000 per day
- **Burst:** 100 per minute
- **Recommended:** Cache responses for 1+ hours

### Optimization Strategies

1. **Implement Caching**
   - ✅ Already implemented in `krogerAPI.js`
   - Token cached for 25 minutes
   - Product data cached for 1 hour
   - Can extend cache time for stable products

2. **Batch Requests**
   - Search for multiple items in one query when possible
   - Use broader search terms and filter locally

3. **Monitor Usage**
   - Log API calls to track daily usage
   - Set up alerts at 80% of daily limit
   - Implement graceful degradation (fall back to cached/mock data)

4. **Error Handling**
   - Retry with exponential backoff
   - Fall back to cached data if API unavailable
   - Show user-friendly messages on errors

---

## 🐛 Troubleshooting

### "401 Unauthorized"
- **Cause:** Invalid or expired credentials
- **Fix:** 
  1. Verify `KROGER_CLIENT_ID` and `KROGER_CLIENT_SECRET` in `.env`
  2. Check credentials in Kroger Developer Portal
  3. Ensure credentials are for production (not sandbox) if in production

### "403 Forbidden"
- **Cause:** API scope or permissions issue
- **Fix:**
  1. Verify requested scope in your Kroger application
  2. Check that your app is approved for production use
  3. Ensure you're using correct API endpoints

### "429 Too Many Requests"
- **Cause:** Rate limit exceeded
- **Fix:**
  1. Implement longer caching (increase `stdTTL` in NodeCache)
  2. Reduce API call frequency
  3. Check for request loops in code
  4. Consider upgrading to higher tier if needed

### "No products found"
- **Cause:** Search term too specific or product not available
- **Fix:**
  1. Try broader search terms
  2. Add location filter (`locationId`)
  3. Check if product exists in Kroger stores
  4. Fall back to alternative products

### "Prices are null"
- **Cause:** Product doesn't have pricing at selected location
- **Fix:**
  1. Provide `locationId` in request
  2. Check if product is available at that store
  3. Fall back to estimated pricing
  4. Show "Price not available" message

---

## 🔐 Security Checklist

- [ ] Credentials stored in `.env` (not in code)
- [ ] `.env` file in `.gitignore`
- [ ] Never log full credentials
- [ ] Use environment variables in production
- [ ] Implement rate limiting on your endpoints
- [ ] Validate all user inputs
- [ ] Handle errors without exposing sensitive data
- [ ] Use HTTPS in production
- [ ] Rotate credentials periodically

---

## 📈 Monitoring & Maintenance

### What to Monitor

1. **API Usage**
   - Daily request count
   - Rate limit proximity
   - Response times

2. **Error Rates**
   - Authentication failures
   - Search errors
   - Timeout frequency

3. **Cache Performance**
   - Hit/miss ratio
   - Cache size
   - Eviction frequency

### Logging

Add to `server/services/krogerAPI.js`:

```javascript
// Track API usage
let apiCallCount = 0;

async function getAccessToken() {
  apiCallCount++;
  console.log(`[Kroger API] Auth request #${apiCallCount}`);
  // ... rest of function
}

// Reset daily counter (run via cron job)
function resetDailyCounter() {
  console.log(`[Kroger API] Daily usage: ${apiCallCount} calls`);
  apiCallCount = 0;
}
```

---

## 🎯 Next Steps After Integration

1. **Test thoroughly** with real products from your local Kroger
2. **Monitor API usage** for first week
3. **Gather user feedback** on price accuracy
4. **Optimize caching** based on usage patterns
5. **Consider other store APIs** (Walmart, Target) using similar pattern
6. **Document any issues** and solutions for future reference

---

## 📚 Additional Resources

- **Kroger API Docs:** https://developer.kroger.com/reference
- **OAuth 2.0 Guide:** https://www.oauth.com/oauth2-servers/client-credentials/
- **Node.js Best Practices:** https://github.com/goldbergyoni/nodebestpractices
- **API Caching Strategies:** https://www.npmjs.com/package/node-cache

---

**Questions?**
- Check Kroger Developer Portal support
- Review API documentation
- Check error logs in `server/` console output
- Update `API_STATUS.md` with any issues or solutions

---

**Last Updated:** January 2024  
**Status:** Ready for use after API approval  
**Maintained By:** The 3C Mall Development Team
