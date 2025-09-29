/**
 * Cart System JavaScript
 * Handles real-time cart updates, shipping calculations, and cart notifications
 */

class CartSystem {
  constructor() {
    this.cart = null;
    this.isUpdating = false;
    this.shippingRates = [];
    this.init();
  }

  init() {
    this.bindEvents();
    this.initializeShippingCalculator();
    this.setupCartNotifications();
  }

  bindEvents() {
    // Cart update events
    document.addEventListener('cart:refresh', () => this.refreshCart());
    document.addEventListener('cart:updated', (event) => this.handleCartUpdate(event.detail.cart));
    document.addEventListener('variant:added', (event) => this.handleVariantAdded(event.detail.variant));
    
    // Quantity change events
    document.addEventListener('change', (event) => {
      if (event.target.matches('[data-line]')) {
        this.updateLineItem(event.target);
      }
    });

    // Remove item events
    document.addEventListener('click', (event) => {
      if (event.target.matches('.line-item__remove-button')) {
        event.preventDefault();
        this.removeLineItem(event.target);
      }
    });

    // Shipping calculator events
    document.addEventListener('click', (event) => {
      if (event.target.matches('#botao-calculo-frete')) {
        event.preventDefault();
        this.calculateShippingRates();
      }
    });
  }

  async refreshCart() {
    try {
      const response = await fetch('/cart.js');
      this.cart = await response.json();
      this.updateCartUI();
      this.updateFreeShippingBar();
      this.dispatchCartUpdatedEvent();
    } catch (error) {
      console.error('Error refreshing cart:', error);
      this.showNotification('Erro ao atualizar carrinho', 'error');
    }
  }

  async updateLineItem(input) {
    if (this.isUpdating) return;
    
    this.isUpdating = true;
    const line = input.dataset.line;
    const quantity = parseInt(input.value);
    
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
        this.cart = await response.json();
        this.updateCartUI();
        this.updateFreeShippingBar();
        this.dispatchCartUpdatedEvent();
        this.showNotification('Carrinho atualizado', 'success');
      } else {
        throw new Error('Failed to update cart');
      }
    } catch (error) {
      console.error('Error updating line item:', error);
      this.showNotification('Erro ao atualizar item', 'error');
      // Revert input value
      input.value = this.cart.items[line - 1]?.quantity || 1;
    } finally {
      this.isUpdating = false;
    }
  }

  async removeLineItem(button) {
    if (this.isUpdating) return;
    
    this.isUpdating = true;
    const line = button.dataset.line;
    
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

      if (response.ok) {
        this.cart = await response.json();
        this.updateCartUI();
        this.updateFreeShippingBar();
        this.dispatchCartUpdatedEvent();
        this.showNotification('Item removido do carrinho', 'success');
      } else {
        throw new Error('Failed to remove item');
      }
    } catch (error) {
      console.error('Error removing line item:', error);
      this.showNotification('Erro ao remover item', 'error');
    } finally {
      this.isUpdating = false;
    }
  }

  updateCartUI() {
    // Update cart count in header
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(element => {
      element.textContent = this.cart.item_count;
      element.style.display = this.cart.item_count > 0 ? 'block' : 'none';
    });

    // Update cart total
    const cartTotalElements = document.querySelectorAll('.cart-total');
    cartTotalElements.forEach(element => {
      element.textContent = this.formatMoney(this.cart.total_price);
    });

    // Update mini-cart content
    this.updateMiniCart();
  }

  updateMiniCart() {
    const miniCart = document.getElementById('mini-cart');
    if (!miniCart) return;

    // Update cart title
    const title = miniCart.querySelector('.drawer__title');
    if (title) {
      if (this.cart.item_count === 0) {
        title.textContent = 'Carrinho';
      } else {
        title.textContent = `${this.cart.item_count} ${this.cart.item_count === 1 ? 'item' : 'itens'}`;
      }
    }

    // Update cart content
    const content = miniCart.querySelector('.drawer__content');
    if (content) {
      if (this.cart.item_count === 0) {
        content.innerHTML = `
          <div class="drawer__content drawer__content--center">
            <p>Carrinho vazio</p>
            <div class="button-wrapper">
              <a href="/collections/all" class="button button--primary">Começar a comprar</a>
            </div>
          </div>
        `;
      } else {
        // Update existing items or reload the section
        this.reloadMiniCartSection();
      }
    }
  }

  async reloadMiniCartSection() {
    try {
      const response = await fetch('/?section_id=cart-drawer');
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const newMiniCart = doc.getElementById('mini-cart');
      
      if (newMiniCart) {
        const currentMiniCart = document.getElementById('mini-cart');
        currentMiniCart.innerHTML = newMiniCart.innerHTML;
      }
    } catch (error) {
      console.error('Error reloading mini-cart:', error);
    }
  }

  updateFreeShippingBar() {
    const freeShippingBar = document.querySelector('.shipping-bar');
    if (!freeShippingBar) return;

    const threshold = parseInt(freeShippingBar.dataset.threshold);
    const currentTotal = this.cart.total_price;
    const progress = Math.min(currentTotal / threshold, 1);

    freeShippingBar.style.setProperty('--progress', progress);

    const text = freeShippingBar.querySelector('.shipping-bar__text');
    if (text) {
      if (currentTotal >= threshold) {
        text.textContent = 'Frete grátis!';
      } else {
        const remaining = threshold - currentTotal;
        text.textContent = `Faltam ${this.formatMoney(remaining)} para frete grátis`;
      }
    }
  }

  initializeShippingCalculator() {
    const zipInput = document.getElementById('zip-code');
    const calculateBtn = document.getElementById('botao-calculo-frete');
    
    if (zipInput) {
      zipInput.addEventListener('input', (event) => {
        this.formatZipCode(event.target);
        this.validateZipCode(event.target);
      });
      
      zipInput.addEventListener('paste', (event) => {
        setTimeout(() => {
          this.formatZipCode(event.target);
          this.validateZipCode(event.target);
        }, 10);
      });
    }
    
    if (calculateBtn) {
      calculateBtn.addEventListener('click', (event) => {
        event.preventDefault();
        this.calculateShippingRates();
      });
    }
  }

  formatZipCode(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 5) {
      value = value.substring(0, 5) + '-' + value.substring(5, 8);
    }
    input.value = value;
  }

  validateZipCode(input) {
    const button = document.getElementById('botao-calculo-frete');
    const errorElement = document.getElementById('shipping-error');
    const zipCode = input.value.replace(/\D/g, '');
    
    if (errorElement) {
      errorElement.style.display = 'none';
    }
    
    if (zipCode.length === 8) {
      if (button) {
        button.disabled = false;
        button.classList.add('cart-drawer__shipping-btn--valid');
      }
    } else {
      if (button) {
        button.disabled = true;
        button.classList.remove('cart-drawer__shipping-btn--valid');
      }
    }
  }

  async calculateShippingRates() {
    const zipInput = document.getElementById('zip-code');
    const button = document.getElementById('botao-calculo-frete');
    const loader = document.getElementById('loader-botao-frete');
    const result = document.getElementById('result-cep');
    const errorElement = document.getElementById('shipping-error');

    if (!zipInput || !button || !result) return;

    const zipCode = zipInput.value.replace(/\D/g, '');
    
    if (zipCode.length !== 8) {
      this.showShippingError('CEP deve ter 8 dígitos');
      return;
    }

    // Show loading state
    button.disabled = true;
    button.classList.add('cart-drawer__shipping-btn--loading');
    if (loader) loader.style.display = 'inline-block';
    result.style.display = 'none';
    if (errorElement) errorElement.style.display = 'none';

    try {
      // Simulate API call - replace with actual shipping API
      const response = await this.fetchShippingRates(zipCode);
      
      if (response.success) {
        this.displayShippingRates(response.rates);
      } else {
        this.showShippingError(response.message || 'Erro ao calcular frete');
      }
    } catch (error) {
      console.error('Error calculating shipping:', error);
      this.showShippingError('Erro ao calcular frete');
    } finally {
      button.disabled = false;
      button.classList.remove('cart-drawer__shipping-btn--loading');
      if (loader) loader.style.display = 'none';
    }
  }

  async fetchShippingRates(zipCode) {
    // This is a placeholder - replace with actual shipping API integration
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          rates: [
            { name: 'PAC', price: 1500, days: '5-7 dias úteis' },
            { name: 'SEDEX', price: 2500, days: '2-3 dias úteis' },
            { name: 'SEDEX 10', price: 3500, days: '1 dia útil' }
          ]
        });
      }, 1000);
    });
  }

  displayShippingRates(rates) {
    const result = document.getElementById('result-cep');
    if (!result) return;

    let html = '<div class="cart-drawer__shipping-rates">';
    rates.forEach(rate => {
      html += `
        <div class="cart-drawer__shipping-rate">
          <div class="cart-drawer__shipping-rate-info">
            <span class="cart-drawer__shipping-rate-name">${rate.name}</span>
            <span class="cart-drawer__shipping-rate-days">${rate.days}</span>
          </div>
          <span class="cart-drawer__shipping-rate-price">${this.formatMoney(rate.price)}</span>
        </div>
      `;
    });
    html += '</div>';

    result.innerHTML = html;
    result.style.display = 'block';
  }

  showShippingError(message) {
    const errorElement = document.getElementById('shipping-error');
    const result = document.getElementById('result-cep');
    
    if (errorElement) {
      const errorText = errorElement.querySelector('.cart-drawer__shipping-error-text');
      if (errorText) {
        errorText.textContent = message;
      }
      errorElement.style.display = 'block';
    }
    
    if (result) {
      result.style.display = 'none';
    }
  }

  setupCartNotifications() {
    // Create notification container if it doesn't exist
    if (!document.getElementById('cart-notifications')) {
      const container = document.createElement('div');
      container.id = 'cart-notifications';
      container.className = 'cart-notifications';
      document.body.appendChild(container);
    }
  }

  showNotification(message, type = 'info') {
    const container = document.getElementById('cart-notifications');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = `cart-notification cart-notification--${type}`;
    notification.textContent = message;

    container.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.classList.add('cart-notification--show');
    }, 10);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.classList.remove('cart-notification--show');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  handleCartUpdate(cart) {
    this.cart = cart;
    this.updateCartUI();
    this.updateFreeShippingBar();
  }

  handleVariantAdded(variant) {
    this.showNotification(`${variant.product_title} adicionado ao carrinho`, 'success');
  }

  dispatchCartUpdatedEvent() {
    document.dispatchEvent(new CustomEvent('cart:updated', {
      detail: { cart: this.cart },
      bubbles: true
    }));
  }

  formatMoney(cents) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  }
}

// Initialize cart system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.cartSystem = new CartSystem();
});

// Global function for shipping calculator (called from HTML)
window.calculateShippingRates = function() {
  if (window.cartSystem) {
    window.cartSystem.calculateShippingRates();
  }
};