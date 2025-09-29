/**
 * Enhanced Product Page Utilities - Advanced product functionality
 * Provides image gallery, variants, reviews, recommendations, and performance optimization
 */

window.productUtils = {
  // Configuration
  config: {
    debounceDelay: 300,
    imageLoadDelay: 100,
    reviewLoadDelay: 500,
    recommendationCacheTime: 300000, // 5 minutes
    galleryTransitionDuration: 300,
    zoomLevel: 2.5,
    lightboxEnabled: true,
    lazyLoadEnabled: true
  },

  // State management
  state: {
    currentVariant: null,
    selectedOptions: {},
    isUpdating: false,
    galleryIndex: 0,
    isZoomed: false,
    reviewsLoaded: false,
    recommendationsLoaded: false,
    recentlyViewed: []
  },

  // Cache for performance
  cache: {
    variants: new Map(),
    reviews: new Map(),
    recommendations: new Map()
  },

  /**
   * Initialize product utilities
   */
  init() {
    this.initializeProductData();
    this.setupImageGallery();
    this.setupVariantSelector();
    this.setupQuantitySelector();
    this.setupAddToCart();
    this.setupWishlist();
    this.setupReviews();
    this.setupRecommendations();
    this.setupRecentlyViewed();
    this.setupAccessibility();
    this.setupPerformanceOptimizations();
    this.loadRecentlyViewed();
  },

  /**
   * Initialize product data from page
   */
  initializeProductData() {
    // Get product data from script tags
    const productScript = document.querySelector('[data-product-json]');
    const variantsScript = document.querySelector('[data-variants-json]');
    
    if (productScript) {
      this.product = JSON.parse(productScript.textContent);
      this.state.currentVariant = this.product.selected_or_first_available_variant;
    }
    
    if (variantsScript) {
      this.variants = JSON.parse(variantsScript.textContent);
      this.buildVariantMap();
    }

    // Initialize selected options
    this.initializeSelectedOptions();
  },

  /**
   * Build variant map for quick lookup
   */
  buildVariantMap() {
    this.variants.forEach(variant => {
      const key = variant.options.join(' / ');
      this.cache.variants.set(key, variant);
    });
  },

  /**
   * Initialize selected options from current variant
   */
  initializeSelectedOptions() {
    if (this.state.currentVariant) {
      this.state.selectedOptions = {
        [this.product.options[0]]: this.state.currentVariant.option1,
        [this.product.options[1]]: this.state.currentVariant.option2,
        [this.product.options[2]]: this.state.currentVariant.option3
      };
    }
  },

  /**
   * Setup image gallery functionality
   */
  setupImageGallery() {
    const gallery = document.querySelector('[data-media-gallery]');
    if (!gallery) return;

    // Setup thumbnail navigation
    this.setupThumbnailNavigation();
    
    // Setup image zoom
    this.setupImageZoom();
    
    // Setup lightbox
    this.setupLightbox();
    
    // Setup swipe gestures for mobile
    this.setupSwipeGestures();
    
    // Setup keyboard navigation
    this.setupGalleryKeyboardNavigation();
  },

  /**
   * Setup thumbnail navigation
   */
  setupThumbnailNavigation() {
    const thumbnails = document.querySelectorAll('.product__media-thumbnail');
    const mediaItems = document.querySelectorAll('.product__media-item');

    thumbnails.forEach((thumbnail, index) => {
      thumbnail.addEventListener('click', () => {
        this.switchToMedia(index);
      });

      // Add keyboard support
      thumbnail.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.switchToMedia(index);
        }
      });
    });
  },

  /**
   * Switch to specific media item
   */
  switchToMedia(index) {
    const mediaItems = document.querySelectorAll('.product__media-item');
    const thumbnails = document.querySelectorAll('.product__media-thumbnail');

    // Update active states
    mediaItems.forEach((item, i) => {
      item.classList.toggle('active', i === index);
    });

    thumbnails.forEach((thumb, i) => {
      thumb.classList.toggle('active', i === index);
    });

    this.state.galleryIndex = index;

    // Lazy load the new image
    this.lazyLoadMedia(mediaItems[index]);

    // Announce to screen readers
    this.announceToScreenReader(`Image ${index + 1} of ${mediaItems.length}`);
  },

  /**
   * Setup image zoom functionality
   */
  setupImageZoom() {
    const zoomImages = document.querySelectorAll('.product__media-zoom');
    
    zoomImages.forEach(image => {
      image.addEventListener('click', (e) => {
        e.preventDefault();
        this.openLightbox(image.href);
      });

      // Add hover zoom effect
      if (this.config.zoomLevel > 1) {
        image.addEventListener('mouseenter', () => {
          this.enableHoverZoom(image);
        });

        image.addEventListener('mouseleave', () => {
          this.disableHoverZoom(image);
        });
      }
    });
  },

  /**
   * Enable hover zoom effect
   */
  enableHoverZoom(image) {
    const img = image.querySelector('img');
    if (img) {
      img.style.transform = `scale(${this.config.zoomLevel})`;
      img.style.transition = `transform ${this.config.galleryTransitionDuration}ms ease`;
    }
  },

  /**
   * Disable hover zoom effect
   */
  disableHoverZoom(image) {
    const img = image.querySelector('img');
    if (img) {
      img.style.transform = 'scale(1)';
    }
  },

  /**
   * Setup lightbox functionality
   */
  setupLightbox() {
    if (!this.config.lightboxEnabled) return;

    // Create lightbox container
    this.createLightboxContainer();

    // Setup lightbox events
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-lightbox]')) {
        e.preventDefault();
        const href = e.target.closest('[data-lightbox]').href;
        this.openLightbox(href);
      }
    });

    // Close lightbox on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isLightboxOpen()) {
        this.closeLightbox();
      }
    });
  },

  /**
   * Create lightbox container
   */
  createLightboxContainer() {
    const lightbox = document.createElement('div');
    lightbox.className = 'product-lightbox';
    lightbox.innerHTML = `
      <div class="product-lightbox__overlay">
        <div class="product-lightbox__content">
          <button class="product-lightbox__close" aria-label="Close lightbox">
            <svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          </button>
          <div class="product-lightbox__image-container">
            <img class="product-lightbox__image" src="" alt="">
          </div>
          <div class="product-lightbox__navigation">
            <button class="product-lightbox__prev" aria-label="Previous image">
              <svg viewBox="0 0 24 24"><path fill="currentColor" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
            </button>
            <button class="product-lightbox__next" aria-label="Next image">
              <svg viewBox="0 0 24 24"><path fill="currentColor" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(lightbox);

    // Setup lightbox events
    lightbox.querySelector('.product-lightbox__close').addEventListener('click', () => {
      this.closeLightbox();
    });

    lightbox.querySelector('.product-lightbox__overlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        this.closeLightbox();
      }
    });

    lightbox.querySelector('.product-lightbox__prev').addEventListener('click', () => {
      this.navigateLightbox(-1);
    });

    lightbox.querySelector('.product-lightbox__next').addEventListener('click', () => {
      this.navigateLightbox(1);
    });
  },

  /**
   * Open lightbox with image
   */
  openLightbox(imageSrc) {
    const lightbox = document.querySelector('.product-lightbox');
    const lightboxImage = lightbox.querySelector('.product-lightbox__image');
    
    lightboxImage.src = imageSrc;
    lightboxImage.alt = this.product.title;
    lightbox.classList.add('product-lightbox--open');
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Focus management
    lightbox.querySelector('.product-lightbox__close').focus();
  },

  /**
   * Close lightbox
   */
  closeLightbox() {
    const lightbox = document.querySelector('.product-lightbox');
    lightbox.classList.remove('product-lightbox--open');
    
    // Restore body scroll
    document.body.style.overflow = '';
  },

  /**
   * Navigate lightbox images
   */
  navigateLightbox(direction) {
    const mediaItems = document.querySelectorAll('.product__media-item');
    const newIndex = this.state.galleryIndex + direction;
    
    if (newIndex >= 0 && newIndex < mediaItems.length) {
      this.switchToMedia(newIndex);
      
      // Update lightbox image
      const lightboxImage = document.querySelector('.product-lightbox__image');
      const newImageSrc = mediaItems[newIndex].querySelector('img').src;
      lightboxImage.src = newImageSrc;
    }
  },

  /**
   * Check if lightbox is open
   */
  isLightboxOpen() {
    const lightbox = document.querySelector('.product-lightbox');
    return lightbox && lightbox.classList.contains('product-lightbox--open');
  },

  /**
   * Setup swipe gestures for mobile
   */
  setupSwipeGestures() {
    const gallery = document.querySelector('[data-media-gallery]');
    if (!gallery) return;

    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;

    gallery.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    });

    gallery.addEventListener('touchend', (e) => {
      endX = e.changedTouches[0].clientX;
      endY = e.changedTouches[0].clientY;
      
      const diffX = startX - endX;
      const diffY = startY - endY;
      
      // Only trigger if horizontal swipe is greater than vertical
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        if (diffX > 0) {
          // Swipe left - next image
          this.navigateGallery(1);
        } else {
          // Swipe right - previous image
          this.navigateGallery(-1);
        }
      }
    });
  },

  /**
   * Navigate gallery
   */
  navigateGallery(direction) {
    const mediaItems = document.querySelectorAll('.product__media-item');
    const newIndex = this.state.galleryIndex + direction;
    
    if (newIndex >= 0 && newIndex < mediaItems.length) {
      this.switchToMedia(newIndex);
    }
  },

  /**
   * Setup gallery keyboard navigation
   */
  setupGalleryKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      if (e.target.closest('[data-media-gallery]')) {
        switch (e.key) {
          case 'ArrowLeft':
            e.preventDefault();
            this.navigateGallery(-1);
            break;
          case 'ArrowRight':
            e.preventDefault();
            this.navigateGallery(1);
            break;
        }
      }
    });
  },

  /**
   * Setup variant selector
   */
  setupVariantSelector() {
    const variantInputs = document.querySelectorAll('input[name^="option"]');
    
    variantInputs.forEach(input => {
      input.addEventListener('change', () => {
        this.updateVariant();
      });
    });
  },

  /**
   * Update variant based on selected options
   */
  updateVariant() {
    if (this.state.isUpdating) return;
    
    this.state.isUpdating = true;
    
    // Get selected options
    const selectedOptions = {};
    const optionInputs = document.querySelectorAll('input[name^="option"]:checked');
    
    optionInputs.forEach(input => {
      selectedOptions[input.name] = input.value;
    });

    // Find matching variant
    const variant = this.findVariantByOptions(selectedOptions);
    
    if (variant) {
      this.state.currentVariant = variant;
      this.state.selectedOptions = selectedOptions;
      
      // Update UI
      this.updateVariantUI(variant);
      
      // Update URL
      this.updateVariantURL(variant);
      
      // Announce to screen readers
      this.announceToScreenReader(`Variant selected: ${variant.title}`);
    }
    
    this.state.isUpdating = false;
  },

  /**
   * Find variant by selected options
   */
  findVariantByOptions(selectedOptions) {
    return this.variants.find(variant => {
      return Object.keys(selectedOptions).every(optionName => {
        const optionIndex = parseInt(optionName.replace('option', '')) - 1;
        return variant.options[optionIndex] === selectedOptions[optionName];
      });
    });
  },

  /**
   * Update variant UI
   */
  updateVariantUI(variant) {
    // Update price
    this.updatePrice(variant);
    
    // Update availability
    this.updateAvailability(variant);
    
    // Update variant ID in form
    this.updateVariantId(variant);
    
    // Update media if variant has specific media
    this.updateVariantMedia(variant);
    
    // Update stock indicator
    this.updateStockIndicator(variant);
  },

  /**
   * Update price display
   */
  updatePrice(variant) {
    const priceContainer = document.querySelector('#price-' + this.getSectionId());
    if (!priceContainer) return;

    const price = variant.price;
    const comparePrice = variant.compare_at_price;
    
    let priceHTML = '';
    
    if (comparePrice && comparePrice > price) {
      priceHTML = `
        <span class="price price--sale">
          <span class="visually-hidden">Regular price</span>
          <s class="price__regular">${this.formatMoney(comparePrice)}</s>
          <span class="visually-hidden">Sale price</span>
          <span class="price__sale">${this.formatMoney(price)}</span>
        </span>
      `;
    } else {
      priceHTML = `
        <span class="price price--regular">
          <span class="visually-hidden">Regular price</span>
          ${this.formatMoney(price)}
        </span>
      `;
    }
    
    priceContainer.innerHTML = priceHTML;
  },

  /**
   * Update availability display
   */
  updateAvailability(variant) {
    const addToCartButton = document.querySelector('.product__add-to-cart');
    if (!addToCartButton) return;

    if (variant.available) {
      addToCartButton.disabled = false;
      addToCartButton.textContent = 'Add to cart';
    } else {
      addToCartButton.disabled = true;
      addToCartButton.textContent = 'Sold out';
    }
  },

  /**
   * Update variant ID in form
   */
  updateVariantId(variant) {
    const variantInput = document.querySelector('input[name="id"]');
    if (variantInput) {
      variantInput.value = variant.id;
    }
  },

  /**
   * Update variant media
   */
  updateVariantMedia(variant) {
    if (variant.featured_media) {
      const mediaIndex = this.product.media.findIndex(media => media.id === variant.featured_media.id);
      if (mediaIndex !== -1) {
        this.switchToMedia(mediaIndex);
      }
    }
  },

  /**
   * Update stock indicator
   */
  updateStockIndicator(variant) {
    const stockIndicator = document.querySelector('[data-stock-indicator]');
    if (!stockIndicator) return;

    let stockHTML = '';
    
    if (variant.inventory_quantity > 0) {
      stockHTML = `
        <span class="product-form__stock-status product-form__stock-status--in-stock">
          In Stock (${variant.inventory_quantity} available)
        </span>
      `;
    } else if (variant.inventory_policy === 'continue') {
      stockHTML = `
        <span class="product-form__stock-status product-form__stock-status--available">
          Available
        </span>
      `;
    } else {
      stockHTML = `
        <span class="product-form__stock-status product-form__stock-status--out-of-stock">
          Out of Stock
        </span>
      `;
    }
    
    stockIndicator.innerHTML = stockHTML;
  },

  /**
   * Update variant URL
   */
  updateVariantURL(variant) {
    const url = new URL(window.location);
    url.searchParams.set('variant', variant.id);
    window.history.replaceState({}, '', url);
  },

  /**
   * Setup quantity selector
   */
  setupQuantitySelector() {
    const quantityInput = document.querySelector('.quantity-input__input');
    const decreaseButton = document.querySelector('.quantity-input__button--minus');
    const increaseButton = document.querySelector('.quantity-input__button--plus');

    if (decreaseButton) {
      decreaseButton.addEventListener('click', () => {
        this.decreaseQuantity();
      });
    }

    if (increaseButton) {
      increaseButton.addEventListener('click', () => {
        this.increaseQuantity();
      });
    }

    if (quantityInput) {
      quantityInput.addEventListener('change', () => {
        this.validateQuantity();
      });
    }
  },

  /**
   * Decrease quantity
   */
  decreaseQuantity() {
    const quantityInput = document.querySelector('.quantity-input__input');
    if (quantityInput) {
      const currentValue = parseInt(quantityInput.value) || 1;
      if (currentValue > 1) {
        quantityInput.value = currentValue - 1;
        this.announceToScreenReader(`Quantity: ${quantityInput.value}`);
      }
    }
  },

  /**
   * Increase quantity
   */
  increaseQuantity() {
    const quantityInput = document.querySelector('.quantity-input__input');
    if (quantityInput) {
      const currentValue = parseInt(quantityInput.value) || 1;
      quantityInput.value = currentValue + 1;
      this.announceToScreenReader(`Quantity: ${quantityInput.value}`);
    }
  },

  /**
   * Validate quantity input
   */
  validateQuantity() {
    const quantityInput = document.querySelector('.quantity-input__input');
    if (quantityInput) {
      const value = parseInt(quantityInput.value);
      if (isNaN(value) || value < 1) {
        quantityInput.value = 1;
      }
    }
  },

  /**
   * Setup add to cart functionality
   */
  setupAddToCart() {
    const addToCartForm = document.querySelector('[data-type="add-to-cart-form"]');
    if (!addToCartForm) return;

    addToCartForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleAddToCart();
    });
  },

  /**
   * Handle add to cart
   */
  async handleAddToCart() {
    if (this.state.isUpdating) return;

    const form = document.querySelector('[data-type="add-to-cart-form"]');
    const formData = new FormData(form);
    const addToCartButton = form.querySelector('.product__add-to-cart');
    
    // Show loading state
    this.setAddToCartLoading(true);
    
    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        
        // Show success message
        this.showAddToCartSuccess();
        
        // Update cart count
        if (window.cartUtils) {
          window.cartUtils.updateCartCount();
        }
        
        // Add to recently viewed
        this.addToRecentlyViewed();
        
        // Track event
        this.trackAddToCart(result);
        
      } else {
        throw new Error('Failed to add to cart');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      this.showAddToCartError();
    } finally {
      this.setAddToCartLoading(false);
    }
  },

  /**
   * Set add to cart loading state
   */
  setAddToCartLoading(loading) {
    const addToCartButton = document.querySelector('.product__add-to-cart');
    if (!addToCartButton) return;

    if (loading) {
      addToCartButton.disabled = true;
      addToCartButton.classList.add('loading');
      addToCartButton.innerHTML = `
        <span>Adding to cart...</span>
        <div class="loading-overlay__spinner">
          <svg viewBox="0 0 24 24"><path fill="currentColor" d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"/></svg>
        </div>
      `;
    } else {
      addToCartButton.disabled = false;
      addToCartButton.classList.remove('loading');
      addToCartButton.innerHTML = `
        <span>Add to cart</span>
        <div class="loading-overlay__spinner hidden">
          <svg viewBox="0 0 24 24"><path fill="currentColor" d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"/></svg>
        </div>
      `;
    }
  },

  /**
   * Show add to cart success message
   */
  showAddToCartSuccess() {
    this.showNotification('Product added to cart!', 'success');
  },

  /**
   * Show add to cart error message
   */
  showAddToCartError() {
    this.showNotification('Failed to add product to cart. Please try again.', 'error');
  },

  /**
   * Setup wishlist functionality
   */
  setupWishlist() {
    const wishlistButton = document.querySelector('[data-wishlist-toggle]');
    if (!wishlistButton) return;

    wishlistButton.addEventListener('click', () => {
      this.toggleWishlist();
    });
  },

  /**
   * Toggle wishlist
   */
  toggleWishlist() {
    const wishlistButton = document.querySelector('[data-wishlist-toggle]');
    const isInWishlist = wishlistButton.classList.contains('in-wishlist');
    
    if (isInWishlist) {
      this.removeFromWishlist();
    } else {
      this.addToWishlist();
    }
  },

  /**
   * Add to wishlist
   */
  addToWishlist() {
    const wishlistButton = document.querySelector('[data-wishlist-toggle]');
    wishlistButton.classList.add('in-wishlist');
    wishlistButton.setAttribute('aria-label', 'Remove from wishlist');
    
    this.showNotification('Added to wishlist!', 'success');
    this.announceToScreenReader('Added to wishlist');
  },

  /**
   * Remove from wishlist
   */
  removeFromWishlist() {
    const wishlistButton = document.querySelector('[data-wishlist-toggle]');
    wishlistButton.classList.remove('in-wishlist');
    wishlistButton.setAttribute('aria-label', 'Add to wishlist');
    
    this.showNotification('Removed from wishlist', 'info');
    this.announceToScreenReader('Removed from wishlist');
  },

  /**
   * Setup reviews functionality
   */
  setupReviews() {
    const reviewsContainer = document.querySelector('.product-reviews');
    if (!reviewsContainer) return;

    // Lazy load reviews
    this.lazyLoadReviews();
  },

  /**
   * Lazy load reviews
   */
  lazyLoadReviews() {
    const reviewsContainer = document.querySelector('.product-reviews');
    if (!reviewsContainer) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.state.reviewsLoaded) {
          this.loadReviews();
          observer.unobserve(entry.target);
        }
      });
    });

    observer.observe(reviewsContainer);
  },

  /**
   * Load reviews
   */
  async loadReviews() {
    if (this.state.reviewsLoaded) return;

    try {
      // Simulate loading reviews (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, this.config.reviewLoadDelay));
      
      this.state.reviewsLoaded = true;
      this.renderReviews();
      
    } catch (error) {
      console.error('Failed to load reviews:', error);
    }
  },

  /**
   * Render reviews
   */
  renderReviews() {
    const reviewsContainer = document.querySelector('.product-reviews');
    if (!reviewsContainer) return;

    // Add reviews content (this would be populated with actual review data)
    reviewsContainer.innerHTML = `
      <div class="product-reviews__content">
        <h3 class="product-reviews__title">Customer Reviews</h3>
        <div class="product-reviews__summary">
          <div class="product-reviews__rating">
            <span class="product-reviews__stars">★★★★★</span>
            <span class="product-reviews__count">(24 reviews)</span>
          </div>
        </div>
        <div class="product-reviews__list">
          <!-- Reviews would be rendered here -->
        </div>
      </div>
    `;
  },

  /**
   * Setup recommendations
   */
  setupRecommendations() {
    const recommendationsContainer = document.querySelector('.product-recommendations');
    if (!recommendationsContainer) return;

    // Lazy load recommendations
    this.lazyLoadRecommendations();
  },

  /**
   * Lazy load recommendations
   */
  lazyLoadRecommendations() {
    const recommendationsContainer = document.querySelector('.product-recommendations');
    if (!recommendationsContainer) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.state.recommendationsLoaded) {
          this.loadRecommendations();
          observer.unobserve(entry.target);
        }
      });
    });

    observer.observe(recommendationsContainer);
  },

  /**
   * Load recommendations
   */
  async loadRecommendations() {
    if (this.state.recommendationsLoaded) return;

    try {
      // Simulate loading recommendations (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      this.state.recommendationsLoaded = true;
      this.renderRecommendations();
      
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    }
  },

  /**
   * Render recommendations
   */
  renderRecommendations() {
    const recommendationsContainer = document.querySelector('.product-recommendations');
    if (!recommendationsContainer) return;

    // Add recommendations content (this would be populated with actual recommendation data)
    recommendationsContainer.innerHTML = `
      <div class="product-recommendations__content">
        <h3 class="product-recommendations__title">You might also like</h3>
        <div class="product-recommendations__grid">
          <!-- Recommendations would be rendered here -->
        </div>
      </div>
    `;
  },

  /**
   * Setup recently viewed
   */
  setupRecentlyViewed() {
    // Add current product to recently viewed
    this.addToRecentlyViewed();
  },

  /**
   * Add product to recently viewed
   */
  addToRecentlyViewed() {
    const productData = {
      id: this.product.id,
      title: this.product.title,
      handle: this.product.handle,
      image: this.product.featured_image,
      price: this.state.currentVariant.price,
      url: this.product.url
    };

    // Remove if already exists
    this.state.recentlyViewed = this.state.recentlyViewed.filter(
      item => item.id !== productData.id
    );

    // Add to beginning
    this.state.recentlyViewed.unshift(productData);

    // Keep only last 10
    this.state.recentlyViewed = this.state.recentlyViewed.slice(0, 10);

    // Save to localStorage
    try {
      localStorage.setItem('recentlyViewed', JSON.stringify(this.state.recentlyViewed));
    } catch (error) {
      console.error('Failed to save recently viewed:', error);
    }
  },

  /**
   * Load recently viewed from localStorage
   */
  loadRecentlyViewed() {
    try {
      const stored = localStorage.getItem('recentlyViewed');
      if (stored) {
        this.state.recentlyViewed = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load recently viewed:', error);
      this.state.recentlyViewed = [];
    }
  },

  /**
   * Setup accessibility features
   */
  setupAccessibility() {
    // Add ARIA live region for announcements
    this.createAriaLiveRegion();
    
    // Setup focus management
    this.setupFocusManagement();
    
    // Setup keyboard navigation
    this.setupKeyboardNavigation();
  },

  /**
   * Create ARIA live region
   */
  createAriaLiveRegion() {
    const liveRegion = document.createElement('div');
    liveRegion.id = 'product-announcements';
    liveRegion.className = 'sr-only';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    document.body.appendChild(liveRegion);
  },

  /**
   * Setup focus management
   */
  setupFocusManagement() {
    // Focus management for lightbox
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab' && this.isLightboxOpen()) {
        this.trapFocusInLightbox(e);
      }
    });
  },

  /**
   * Trap focus in lightbox
   */
  trapFocusInLightbox(e) {
    const lightbox = document.querySelector('.product-lightbox');
    const focusableElements = lightbox.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  },

  /**
   * Setup keyboard navigation
   */
  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      // Escape key to close lightbox
      if (e.key === 'Escape' && this.isLightboxOpen()) {
        this.closeLightbox();
      }
    });
  },

  /**
   * Setup performance optimizations
   */
  setupPerformanceOptimizations() {
    // Lazy load images
    this.setupLazyLoading();
    
    // Preload critical resources
    this.preloadCriticalResources();
    
    // Setup intersection observer for performance monitoring
    this.setupPerformanceMonitoring();
  },

  /**
   * Setup lazy loading
   */
  setupLazyLoading() {
    if (!this.config.lazyLoadEnabled) return;

    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  },

  /**
   * Lazy load media
   */
  lazyLoadMedia(mediaItem) {
    const img = mediaItem.querySelector('img[data-src]');
    if (img) {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    }
  },

  /**
   * Preload critical resources
   */
  preloadCriticalResources() {
    // Preload next image in gallery
    const mediaItems = document.querySelectorAll('.product__media-item');
    if (mediaItems.length > 1) {
      const nextIndex = (this.state.galleryIndex + 1) % mediaItems.length;
      const nextImg = mediaItems[nextIndex].querySelector('img');
      if (nextImg && nextImg.src) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = nextImg.src;
        document.head.appendChild(link);
      }
    }
  },

  /**
   * Setup performance monitoring
   */
  setupPerformanceMonitoring() {
    // Monitor image load times
    const images = document.querySelectorAll('.product__image');
    images.forEach(img => {
      img.addEventListener('load', () => {
        this.trackImageLoadTime(img);
      });
    });
  },

  /**
   * Track image load time
   */
  trackImageLoadTime(img) {
    const loadTime = performance.now();
    console.log(`Image loaded in ${loadTime}ms:`, img.src);
  },

  /**
   * Utility functions
   */

  /**
   * Format money
   */
  formatMoney(cents) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  },

  /**
   * Get section ID
   */
  getSectionId() {
    const section = document.querySelector('.product');
    return section ? section.dataset.sectionId || 'main' : 'main';
  },

  /**
   * Show notification
   */
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `product-notification product-notification--${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
      color: white;
      border-radius: 0.5rem;
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  },

  /**
   * Announce to screen readers
   */
  announceToScreenReader(message) {
    const liveRegion = document.getElementById('product-announcements');
    if (liveRegion) {
      liveRegion.textContent = message;
    }
  },

  /**
   * Track add to cart event
   */
  trackAddToCart(result) {
    if (window.gtag) {
      window.gtag('event', 'add_to_cart', {
        currency: 'USD',
        value: result.price / 100,
        items: [{
          item_id: result.product_id,
          item_name: this.product.title,
          item_category: this.product.type,
          quantity: result.quantity,
          price: result.price / 100
        }]
      });
    }
  }
};

// Initialize product utilities when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  window.productUtils.init();
});
