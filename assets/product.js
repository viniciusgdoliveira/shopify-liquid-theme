class ProductForm extends HTMLElement {
  constructor() {
    super();
    this.form = this.querySelector('form');
    this.form.querySelector('[name=id]').disabled = false;
    this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
    this.cartDrawer = document.querySelector('cart-drawer');
    this.cartNotification = document.querySelector('cart-notification');
  }

  async onSubmitHandler(evt) {
    evt.preventDefault();
    const submitButton = evt.target;
    
    if (submitButton.classList.contains('loading')) return;

    this.handleErrorMessage();
    
    // Set active element for focus management
    if (this.cartDrawer) {
      this.cartDrawer.setActiveElement(document.activeElement);
    }
    if (this.cartNotification) {
      this.cartNotification.setActiveElement(document.activeElement);
    }

    submitButton.classList.add('loading');
    const spinner = submitButton.querySelector('.loading-overlay__spinner');
    if (spinner) {
      spinner.classList.remove('hidden');
    }

    try {
      const formData = new FormData(this.form);
      const variantId = formData.get('id');
      const quantity = parseInt(formData.get('quantity')) || 1;

      // Use the new cart utilities
      const result = await window.cartUtils.addToCart(variantId, quantity);

      if (result.success) {
        // Update cart count
        window.cartUtils.updateCartCount();

        // Open cart drawer if available
        if (this.cartDrawer) {
          await this.cartDrawer.render();
          this.cartDrawer.open();
        } else if (this.cartNotification) {
          // Fallback to notification
          this.cartNotification.open();
        } else {
          // Fallback to redirect
          window.location.href = '/cart';
        }
      } else {
        this.handleErrorMessage(result.error || 'Failed to add item to cart');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      this.handleErrorMessage('Failed to add item to cart. Please try again.');
    } finally {
      submitButton.classList.remove('loading');
      if (spinner) {
        spinner.classList.add('hidden');
      }
    }
  }

  handleErrorMessage(errorMessage = false) {
    this.errorMessageWrapper = this.errorMessageWrapper || this.querySelector('.product-form__error-message');
    this.errorMessage = this.errorMessage || this.errorMessageWrapper.querySelector('.error-message');

    this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage);

    if (errorMessage) {
      this.errorMessage.textContent = errorMessage;
    }
  }
}

customElements.define('product-form', ProductForm);

// Variant selector
class VariantSelector extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('change', this.onVariantChange);
  }

  onVariantChange() {
    this.updateOptions();
    this.updateMasterId();
    this.toggleAddButton(true, '', false);
    this.updatePickupAvailability();
    this.removeErrorMessage();

    if (!this.currentVariant) {
      this.toggleAddButton(true, '', true);
      this.setUnavailable();
    } else {
      this.updateMedia();
      this.updateURL();
      this.updateVariantInput();
      this.renderProductInfo();
    }
  }

  updateOptions() {
    this.options = Array.from(this.querySelectorAll('input[type="radio"]:checked'), input => {
      return input.value;
    });
  }

  updateMasterId() {
    this.currentVariant = this.getVariantData().find(variant => {
      return !variant.options.map((option, index) => {
        return this.options[index] === option;
      }).includes(false);
    });
  }

  updateMedia() {
    if (!this.currentVariant) return;
    if (!this.currentVariant.featured_media) return;

    const mediaGallery = document.querySelector(`[id^="MediaGallery-${this.dataset.section}"]`);
    if (!mediaGallery) return;

    const mediaId = `${this.dataset.section}-${this.currentVariant.featured_media.id}`;
    const activeMedia = mediaGallery.querySelector(`[data-media-id="${mediaId}"]`);
    if (!activeMedia) return;

    mediaGallery.querySelectorAll('[data-media-id]').forEach((item) => {
      item.classList.remove('active');
    });
    activeMedia.classList.add('active');
  }

  updateURL() {
    if (!this.currentVariant || this.dataset.updateUrl === 'false') return;
    window.history.replaceState({}, '', `${this.dataset.url}?variant=${this.currentVariant.id}`);
  }

  updateVariantInput() {
    const productForms = document.querySelectorAll(`#product-form-${this.dataset.section}, #product-form-installment`);
    productForms.forEach(productForm => {
      const input = productForm.querySelector('input[name="id"]');
      input.value = this.currentVariant.id;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  updatePickupAvailability() {
    const pickUpAvailability = document.querySelector('pickup-availability');
    if (!pickUpAvailability) return;

    if (this.currentVariant && this.currentVariant.available) {
      pickUpAvailability.setAttribute('variant-id', this.currentVariant.id);
    } else {
      pickUpAvailability.removeAttribute('variant-id');
    }
  }

  removeErrorMessage() {
    const section = this.closest('section');
    if (!section) return;

    const productForm = section.querySelector('product-form');
    if (productForm) productForm.handleErrorMessage();
  }

  renderProductInfo() {
    fetch(`${this.dataset.url}?variant=${this.currentVariant.id}&section_id=${this.dataset.section}`)
      .then((response) => response.text())
      .then((responseText) => {
        const html = new DOMParser().parseFromString(responseText, 'text/html');
        const destination = document.getElementById(`price-${this.dataset.section}`);
        const source = html.getElementById(`price-${this.dataset.section}`);
        if (source && destination) destination.innerHTML = source.innerHTML;

        const price = document.getElementById(`price-${this.dataset.section}`);

        if (price) price.classList.remove('visibility-hidden');
        this.toggleAddButton(!this.currentVariant.available, window.variantStrings.soldOut);
      });
  }

  toggleAddButton(disable = true, text, modifyClass = true) {
    const productForm = document.getElementById(`product-form-${this.dataset.section}`);
    if (!productForm) return;

    const addButton = productForm.querySelector('[name="add"]');
    const addButtonText = productForm.querySelector('[name="add"] > span');

    if (!addButton) return;

    if (disable) {
      addButton.setAttribute('disabled', 'disabled');
      if (text) addButtonText.textContent = text;
    } else {
      addButton.removeAttribute('disabled');
      addButtonText.textContent = window.variantStrings.addToCart;
    }

    if (!modifyClass) return;
  }

  setUnavailable() {
    const button = document.getElementById(`product-form-${this.dataset.section}`)?.querySelector('[name="add"]');
    if (!button) return;
    button.setAttribute('disabled', 'disabled');
    button.textContent = window.variantStrings.unavailable;
  }

  getVariantData() {
    this.variantData = this.variantData || JSON.parse(this.querySelector('[data-variants-json]').textContent);
    return this.variantData;
  }
}

customElements.define('variant-selector', VariantSelector);

// Quantity selector
class QuantityInput extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input');
    this.changeEvent = new Event('change', { bubbles: true });

    this.querySelectorAll('button').forEach(
      (button) => button.addEventListener('click', this.onButtonClick.bind(this))
    );
  }

  onButtonClick(event) {
    event.preventDefault();
    const previousValue = this.input.value;

    event.target.name === 'plus' ? this.input.stepUp() : this.input.stepDown();
    if (previousValue !== this.input.value) this.input.dispatchEvent(this.changeEvent);
  }
}

customElements.define('quantity-input', QuantityInput);

// Media gallery navigation
document.addEventListener('DOMContentLoaded', function() {
  const mediaGallery = document.querySelector('[data-media-gallery]');
  if (!mediaGallery) return;
  
  const mediaItems = mediaGallery.querySelectorAll('.product__media-item');
  const thumbnails = mediaGallery.querySelectorAll('.product__media-thumbnail');
  
  thumbnails.forEach(thumbnail => {
    thumbnail.addEventListener('click', (e) => {
      e.preventDefault();
      const mediaId = thumbnail.dataset.mediaId;
      
      // Show selected media
      mediaItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.mediaId === mediaId) {
          item.classList.add('active');
        }
      });
      
      // Update active thumbnail
      thumbnails.forEach(thumb => {
        thumb.classList.remove('active');
      });
      thumbnail.classList.add('active');
    });
  });
});
