/**
 * Enhanced Cart Drawer Component
 * Modern cart drawer with advanced features following Shopify best practices
 */

class CartDrawer extends HTMLElement {
  constructor() {
    super();
    this.isOpen = false;
    this.isLoading = false;
    this.cartData = null;
    this.debounceTimer = null;
    
    // Bind methods
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
    this.toggle = this.toggle.bind(this);
    this.render = this.render.bind(this);
    this.updateCart = this.updateCart.bind(this);
    
    this.init();
  }

  async init() {
    // Set up event listeners
    this.setupEventListeners();
    
    // Load initial cart data
    await this.loadCartData();
    
    // Render initial state
    this.render();
  }

  setupEventListeners() {
    // Close drawer events
    this.addEventListener('click', (e) => {
      if (e.target.closest('[data-cart-drawer-close]')) {
        this.close();
      }
    });

    // Quantity controls
    this.addEventListener('click', (e) => {
      if (e.target.closest('[data-cart-quantity-increase]')) {
        this.handleQuantityIncrease(e);
      } else if (e.target.closest('[data-cart-quantity-decrease]')) {
        this.handleQuantityDecrease(e);
      }
    });

    // Quantity input changes
    this.addEventListener('change', (e) => {
      if (e.target.hasAttribute('data-cart-quantity-input')) {
        this.handleQuantityChange(e);
      }
    });

    // Remove item
    this.addEventListener('click', (e) => {
      if (e.target.closest('[data-cart-remove]')) {
        this.handleRemoveItem(e);
      }
    });

    // Add upsell product
    this.addEventListener('click', (e) => {
      if (e.target.closest('[data-product-id]')) {
        this.handleUpsellAdd(e);
      }
    });

    // Cart note auto-save
    this.addEventListener('input', (e) => {
      if (e.target.id === 'cart-note') {
        this.handleNoteChange(e);
      }
    });

    // Checkout button
    this.addEventListener('click', (e) => {
      if (e.target.closest('[data-cart-checkout]')) {
        this.handleCheckout(e);
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.contains(e.target) && !e.target.closest('[data-cart-drawer-trigger]')) {
        this.close();
      }
    });
  }

  async loadCartData() {
    try {
      const response = await fetch('/cart.js');
      if (response.ok) {
        this.cartData = await response.json();
      }
    } catch (error) {
      console.error('Failed to load cart data:', error);
    }
  }

  async updateCart() {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.classList.add('cart-drawer--loading');
    
    try {
      await this.loadCartData();
      this.render();
      this.updateCartCount();
      this.dispatchCartUpdatedEvent();
    } catch (error) {
      console.error('Failed to update cart:', error);
      this.showError('Failed to update cart. Please try again.');
    } finally {
      this.isLoading = false;
      this.classList.remove('cart-drawer--loading');
    }
  }

  async handleQuantityIncrease(e) {
    e.preventDefault();
    const button = e.target.closest('[data-cart-quantity-increase]');
    const input = button.parentElement.querySelector('[data-cart-quantity-input]');
    const line = parseInt(input.dataset.line);
    const currentQuantity = parseInt(input.value) || 0;
    const newQuantity = currentQuantity + 1;

    await this.updateCartItem(line, newQuantity);
  }

  async handleQuantityDecrease(e) {
    e.preventDefault();
    const button = e.target.closest('[data-cart-quantity-decrease]');
    const input = button.parentElement.querySelector('[data-cart-quantity-input]');
    const line = parseInt(input.dataset.line);
    const currentQuantity = parseInt(input.value) || 0;
    const newQuantity = Math.max(0, currentQuantity - 1);

    await this.updateCartItem(line, newQuantity);
  }

  async handleQuantityChange(e) {
    const input = e.target;
    const line = parseInt(input.dataset.line);
    const quantity = parseInt(input.value) || 0;

    // Debounce the update
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.updateCartItem(line, quantity);
    }, 500);
  }

  async handleRemoveItem(e) {
    e.preventDefault();
    const button = e.target.closest('[data-cart-remove]');
    const line = parseInt(button.dataset.line);
    
    // Show loading state
    const originalContent = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<span class="loading-spinner"></span>';

    try {
      await this.updateCartItem(line, 0);
    } catch (error) {
      button.disabled = false;
      button.innerHTML = originalContent;
      this.showError('Failed to remove item. Please try again.');
    }
  }

  async handleUpsellAdd(e) {
    e.preventDefault();
    const button = e.target.closest('[data-product-id]');
    const productId = button.dataset.productId;
    
    // Show loading state
    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = 'Adding...';

    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: productId,
          quantity: 1
        })
      });

      if (response.ok) {
        button.textContent = 'Added!';
        setTimeout(() => {
          button.disabled = false;
          button.textContent = originalText;
        }, 1500);
        
        await this.updateCart();
      } else {
        throw new Error('Failed to add product');
      }
    } catch (error) {
      button.disabled = false;
      button.textContent = 'Try Again';
      setTimeout(() => {
        button.textContent = originalText;
      }, 2000);
      this.showError('Failed to add product. Please try again.');
    }
  }

  async handleNoteChange(e) {
    const note = e.target.value;
    
    // Debounce the update
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(async () => {
      try {
        await fetch('/cart/update.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ note })
        });
      } catch (error) {
        console.error('Failed to update cart note:', error);
      }
    }, 500);
  }

  async handleCheckout(e) {
    e.preventDefault();
    
    // Show loading state
    const button = e.target.closest('[data-cart-checkout]');
    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = 'Redirecting...';

    try {
      // Redirect to checkout
      window.location.href = '/checkout';
    } catch (error) {
      button.disabled = false;
      button.textContent = originalText;
      this.showError('Failed to proceed to checkout. Please try again.');
    }
  }

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

      if (response.ok) {
        await this.updateCart();
      } else {
        throw new Error('Failed to update cart item');
      }
    } catch (error) {
      console.error('Failed to update cart item:', error);
      this.showError('Failed to update item. Please try again.');
    }
  }

  updateCartCount() {
    if (!this.cartData) return;
    
    const count = this.cartData.item_count;
    const cartCountElements = document.querySelectorAll('.cart-count, [data-cart-count], .header__cart-count');
    
    cartCountElements.forEach(element => {
      element.textContent = count;
      element.style.display = count > 0 ? 'block' : 'none';
    });
  }

  dispatchCartUpdatedEvent() {
    document.dispatchEvent(new CustomEvent('cart:updated', {
      detail: { 
        item_count: this.cartData?.item_count || 0,
        cart: this.cartData 
      }
    }));
  }

  showError(message) {
    const errorElement = this.querySelector('.cart-drawer__error');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
      setTimeout(() => {
        errorElement.style.display = 'none';
      }, 5000);
    }
  }

  render() {
    if (!this.cartData) return;

    // Update cart count
    this.updateCartCount();

    // Update cart items
    this.updateCartItems();
    
    // Update cart summary
    this.updateCartSummary();
    
    // Update free shipping bar
    this.updateFreeShippingBar();
  }

  updateCartItems() {
    const itemsContainer = this.querySelector('.cart-drawer__items');
    if (!itemsContainer) return;

    if (this.cartData.items.length === 0) {
      itemsContainer.innerHTML = this.renderEmptyCart();
      return;
    }

    itemsContainer.innerHTML = this.cartData.items.map((item, index) => 
      this.renderCartItem(item, index + 1)
    ).join('');
  }

  updateCartSummary() {
    const subtotalElement = this.querySelector('.cart-drawer__subtotal-amount');
    const totalElement = this.querySelector('.cart-drawer__total-amount');
    
    if (subtotalElement) {
      subtotalElement.textContent = this.formatMoney(this.cartData.total_price);
    }
    
    if (totalElement) {
      totalElement.textContent = this.formatMoney(this.cartData.total_price);
    }
  }

  updateFreeShippingBar() {
    const shippingBar = this.querySelector('.cart-drawer__shipping-bar');
    if (!shippingBar) return;

    const threshold = parseInt(this.dataset.threshold) || 7500;
    const remaining = threshold - this.cartData.total_price;
    
    if (remaining > 0) {
      const progressPercentage = (this.cartData.total_price / threshold) * 100;
      const progressFill = shippingBar.querySelector('.cart-drawer__shipping-bar-fill');
      const progressText = shippingBar.querySelector('.cart-drawer__shipping-text');
      
      if (progressFill) {
        progressFill.style.width = `${Math.min(progressPercentage, 100)}%`;
      }
      
      if (progressText) {
        progressText.textContent = `Add ${this.formatMoney(remaining)} more for free shipping`;
      }
    }
  }

  renderCartItem(item, line) {
    return `
      <div class="cart-drawer__item" data-cart-item-key="${item.key}">
        <div class="cart-drawer__item-image">
          ${item.image ? 
            `<img src="${item.image}" alt="${item.title}" class="cart-drawer__item-img" loading="lazy">` :
            `<div class="cart-drawer__item-placeholder">
              <svg class="cart-drawer__placeholder" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>`
          }
        </div>
        
        <div class="cart-drawer__item-details">
          <h3 class="cart-drawer__item-title">
            <a href="${item.url}" class="cart-drawer__item-link">${item.product_title}</a>
          </h3>
          
          ${item.variant_title !== 'Default Title' ? 
            `<div class="cart-drawer__item-variant">${item.variant_title}</div>` : ''
          }
          
          <div class="cart-drawer__item-price">
            ${item.original_price !== item.final_price ? 
              `<span class="cart-drawer__item-price-original">${this.formatMoney(item.original_price)}</span>
               <span class="cart-drawer__item-price-final">${this.formatMoney(item.final_price)}</span>` :
              `<span class="cart-drawer__item-price-regular">${this.formatMoney(item.final_price)}</span>`
            }
          </div>
          
          <div class="cart-drawer__item-quantity">
            <div class="cart-drawer__quantity-controls">
              <button type="button" class="cart-drawer__quantity-btn cart-drawer__quantity-btn--minus" 
                      data-cart-quantity-decrease data-line="${line}"
                      aria-label="Decrease quantity">
                <svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 13H5v-2h14v2z"/></svg>
              </button>
              <input type="number" class="cart-drawer__quantity-input" 
                     value="${item.quantity}" min="0" 
                     data-cart-quantity-input data-line="${line}">
              <button type="button" class="cart-drawer__quantity-btn cart-drawer__quantity-btn--plus" 
                      data-cart-quantity-increase data-line="${line}"
                      aria-label="Increase quantity">
                <svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
              </button>
            </div>
          </div>
        </div>
        
        <div class="cart-drawer__item-actions">
          <button type="button" class="cart-drawer__remove-btn" 
                  data-cart-remove data-line="${line}"
                  aria-label="Remove item">
            <svg viewBox="0 0 24 24"><path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
          </button>
        </div>
      </div>
    `;
  }

  renderEmptyCart() {
    return `
      <div class="cart-drawer__empty">
        <div class="cart-drawer__empty-icon">
          <svg viewBox="0 0 24 24">
            <path fill="currentColor" d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7M9 3V4H15V3H9M7 6V19H17V6H7Z"/>
          </svg>
        </div>
        <h3 class="cart-drawer__empty-title">Your cart is empty</h3>
        <p class="cart-drawer__empty-text">Add some items to get started</p>
        <a href="/collections/all" class="cart-drawer__continue-btn button button--primary">
          Continue Shopping
        </a>
      </div>
    `;
  }

  formatMoney(cents) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this.cartData?.currency || 'USD'
    }).format(cents / 100);
  }

  open() {
    if (this.isOpen) return;
    
    this.isOpen = true;
    this.classList.add('cart-drawer--open');
    document.body.classList.add('cart-drawer-open');
    
    // Focus management
    this.focusFirstElement();
    
    // Dispatch event
    this.dispatchEvent(new CustomEvent('cart-drawer:opened'));
  }

  close() {
    if (!this.isOpen) return;
    
    this.isOpen = false;
    this.classList.remove('cart-drawer--open');
    document.body.classList.remove('cart-drawer-open');
    
    // Dispatch event
    this.dispatchEvent(new CustomEvent('cart-drawer:closed'));
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  focusFirstElement() {
    const focusableElements = this.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }
}

// Register the custom element
customElements.define('cart-drawer', CartDrawer);

// Global cart drawer instance
window.CartDrawer = CartDrawer;
