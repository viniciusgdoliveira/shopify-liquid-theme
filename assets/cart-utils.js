/**
 * Enhanced Cart Utilities - Centralized cart management functions
 * Provides consistent cart operations across the theme with advanced features
 */

window.cartUtils = {
  /**
   * Add item to cart with enhanced error handling and validation
   * @param {string|number} variantId - Product variant ID
   * @param {number} quantity - Quantity to add
   * @param {Object} options - Additional options (selling_plan, properties)
   * @returns {Promise<Object>} Result object with success status
   */
  async addToCart(variantId, quantity = 1, options = {}) {
    try {
      // Validate inputs
      if (!variantId) {
        throw new Error('Variant ID is required');
      }
      
      if (quantity < 1) {
        throw new Error('Quantity must be at least 1');
      }

      const requestBody = {
        id: variantId,
        quantity: quantity
      };

      // Add selling plan if provided
      if (options.selling_plan) {
        requestBody.selling_plan = options.selling_plan;
      }

      // Add properties if provided
      if (options.properties && Object.keys(options.properties).length > 0) {
        requestBody.properties = options.properties;
      }

      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Update cart count and trigger events
      this.updateCartCount();
      this.dispatchCartEvent('cart:item-added', { item: data, quantity });
      
      return { success: true, data };
    } catch (error) {
      console.error('Add to cart error:', error);
      this.dispatchCartEvent('cart:error', { error: error.message });
      return { success: false, error: error.message };
    }
  },

  /**
   * Update cart item quantity
   * @param {number} line - Line item number
   * @param {number} quantity - New quantity
   * @returns {Promise<Object>} Result object with success status
   */
  async updateCartItem(line, quantity) {
    try {
      const response = await fetch('/cart/change.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          line: line,
          quantity: quantity
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Update cart item error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Remove item from cart
   * @param {number} line - Line item number
   * @returns {Promise<Object>} Result object with success status
   */
  async removeFromCart(line) {
    try {
      const response = await fetch('/cart/change.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          line: line,
          quantity: 0
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Remove from cart error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get current cart data
   * @returns {Promise<Object>} Cart data
   */
  async getCart() {
    try {
      const response = await fetch('/cart.js');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Get cart error:', error);
      return null;
    }
  },

  /**
   * Update cart count display
   * Updates all cart count elements on the page
   */
  updateCartCount() {
    // Get current cart count
    this.getCart().then(cart => {
      if (cart) {
        const count = cart.item_count;
        
        // Update all cart count elements
        const cartCountElements = document.querySelectorAll('.cart-count, [data-cart-count], .header__cart-count');
        cartCountElements.forEach(element => {
          element.textContent = count;
          element.style.display = count > 0 ? 'block' : 'none';
        });

        // Dispatch custom event for other components
        document.dispatchEvent(new CustomEvent('cart:updated', {
          detail: { item_count: count, cart: cart }
        }));
      }
    });
  },

  /**
   * Get base URL for the store
   * @returns {string} Base URL
   */
  getBaseUrl() {
    return window.location.origin;
  },

  /**
   * Debounce function for performance optimization
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Open cart drawer
   */
  openCartDrawer() {
    const cartDrawer = document.querySelector('cart-drawer') || document.getElementById('cart-drawer');
    console.log('Opening cart drawer, element found:', cartDrawer);
    
    if (cartDrawer) {
      if (cartDrawer.open) {
        cartDrawer.open();
      } else {
        cartDrawer.classList.add('cart-drawer--open');
        document.body.classList.add('cart-drawer-open');
        console.log('Cart drawer opened via class toggle');
      }
    } else {
      console.error('Cart drawer element not found!');
    }
  },

  /**
   * Close cart drawer
   */
  closeCartDrawer() {
    const cartDrawer = document.querySelector('cart-drawer') || document.getElementById('cart-drawer');
    if (cartDrawer) {
      if (cartDrawer.close) {
        cartDrawer.close();
      } else {
        cartDrawer.classList.remove('cart-drawer--open');
        document.body.classList.remove('cart-drawer-open');
      }
    }
  },

  /**
   * Dispatch cart events for other components to listen to
   * @param {string} eventName - Event name
   * @param {Object} detail - Event detail data
   */
  dispatchCartEvent(eventName, detail = {}) {
    document.dispatchEvent(new CustomEvent(eventName, { detail }));
  },

  /**
   * Get cart data with caching
   * @param {boolean} forceRefresh - Force refresh cache
   * @returns {Promise<Object>} Cart data
   */
  async getCartData(forceRefresh = false) {
    if (!forceRefresh && this.cartCache && Date.now() - this.cartCache.timestamp < 5000) {
      return this.cartCache.data;
    }

    try {
      const response = await fetch('/cart.js');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Cache the data
      this.cartCache = {
        data,
        timestamp: Date.now()
      };
      
      return data;
    } catch (error) {
      console.error('Get cart data error:', error);
      return null;
    }
  },

  /**
   * Clear cart cache
   */
  clearCartCache() {
    this.cartCache = null;
  },

  /**
   * Add multiple items to cart
   * @param {Array} items - Array of items to add
   * @returns {Promise<Object>} Result object
   */
  async addMultipleToCart(items) {
    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ items })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.updateCartCount();
      this.dispatchCartEvent('cart:items-added', { items: data.items });
      
      return { success: true, data };
    } catch (error) {
      console.error('Add multiple to cart error:', error);
      this.dispatchCartEvent('cart:error', { error: error.message });
      return { success: false, error: error.message };
    }
  },

  /**
   * Update cart note
   * @param {string} note - Cart note
   * @returns {Promise<Object>} Result object
   */
  async updateCartNote(note) {
    try {
      const response = await fetch('/cart/update.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ note })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.clearCartCache();
      this.dispatchCartEvent('cart:note-updated', { note });
      
      return { success: true, data };
    } catch (error) {
      console.error('Update cart note error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Apply discount code
   * @param {string} discountCode - Discount code
   * @returns {Promise<Object>} Result object
   */
  async applyDiscountCode(discountCode) {
    try {
      const response = await fetch('/discount/' + discountCode);
      
      if (response.ok) {
        // Redirect to checkout with discount
        window.location.href = '/checkout?discount=' + encodeURIComponent(discountCode);
        return { success: true };
      } else {
        throw new Error('Invalid discount code');
      }
    } catch (error) {
      console.error('Apply discount code error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get cart summary for display
   * @returns {Object} Cart summary
   */
  getCartSummary() {
    if (!this.cartCache?.data) return null;
    
    const cart = this.cartCache.data;
    return {
      itemCount: cart.item_count,
      totalPrice: cart.total_price,
      totalWeight: cart.total_weight,
      currency: cart.currency,
      items: cart.items.map(item => ({
        id: item.id,
        title: item.product_title,
        variant: item.variant_title,
        quantity: item.quantity,
        price: item.price,
        linePrice: item.line_price,
        image: item.image
      }))
    };
  },

  /**
   * Check if cart meets free shipping threshold
   * @param {number} threshold - Free shipping threshold in cents
   * @returns {Object} Free shipping info
   */
  getFreeShippingInfo(threshold = 7500) {
    if (!this.cartCache?.data) return null;
    
    const cart = this.cartCache.data;
    const remaining = threshold - cart.total_price;
    
    return {
      threshold,
      currentTotal: cart.total_price,
      remaining: Math.max(0, remaining),
      qualifies: cart.total_price >= threshold,
      percentage: Math.min(100, (cart.total_price / threshold) * 100)
    };
  },

  /**
   * Initialize cart utilities
   * Sets up event listeners and initial state
   */
  init() {
    // Initialize cache
    this.cartCache = null;
    
    // Update cart count on page load
    this.updateCartCount();

    // Listen for cart updates from other sources
    document.addEventListener('cart:updated', (e) => {
      this.updateCartCount();
    });

    // Handle cart drawer open/close events
    document.addEventListener('click', (e) => {
      // Open cart drawer (multiple trigger selectors)
      if (e.target.closest('[data-cart-drawer-open]') || 
          e.target.closest('[data-cart-drawer-trigger]') ||
          e.target.closest('.header__cart-link')) {
        console.log('Cart drawer trigger clicked:', e.target);
        e.preventDefault();
        this.openCartDrawer();
      }

      // Close cart drawer
      if (e.target.closest('[data-cart-drawer-close]')) {
        e.preventDefault();
        this.closeCartDrawer();
      }
    });

    // Close cart drawer on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeCartDrawer();
      }
    });

    // Close cart drawer when clicking outside
    document.addEventListener('click', (e) => {
      const cartDrawer = document.querySelector('cart-drawer') || document.getElementById('cart-drawer');
      if (cartDrawer && cartDrawer.classList.contains('cart-drawer--open')) {
        if (!cartDrawer.contains(e.target) && 
            !e.target.closest('[data-cart-drawer-open]') &&
            !e.target.closest('[data-cart-drawer-trigger]') &&
            !e.target.closest('.header__cart-link')) {
          this.closeCartDrawer();
        }
      }
    });

    // Listen for cart drawer events
    document.addEventListener('cart-drawer:opened', () => {
      this.dispatchCartEvent('cart:drawer-opened');
    });

    document.addEventListener('cart-drawer:closed', () => {
      this.dispatchCartEvent('cart:drawer-closed');
    });
  }
};

// Initialize cart utilities when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  window.cartUtils.init();
});
