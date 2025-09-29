/**
 * Enhanced Collection Page Utilities - Advanced collection functionality
 * Provides filtering, sorting, pagination, grid/list views, and performance optimization
 */

window.collectionUtils = {
  // Configuration
  config: {
    debounceDelay: 300,
    filterDelay: 500,
    paginationDelay: 200,
    infiniteScrollThreshold: 200,
    lazyLoadThreshold: 100,
    cacheTime: 300000, // 5 minutes
    maxFilters: 10,
    enableAnalytics: true,
    enableInfiniteScroll: true,
    enableLazyLoading: true
  },

  // State management
  state: {
    currentView: 'grid',
    currentSort: 'manual',
    currentFilters: {},
    isLoading: false,
    hasMorePages: true,
    currentPage: 1,
    totalPages: 1,
    products: [],
    filteredProducts: [],
    isFiltering: false,
    isSorting: false,
    isPaginating: false
  },

  // Cache for performance
  cache: {
    products: new Map(),
    filters: new Map(),
    sortOptions: new Map(),
    pagination: new Map()
  },

  /**
   * Initialize collection utilities
   */
  init() {
    this.initializeCollectionData();
    this.setupFiltering();
    this.setupSorting();
    this.setupPagination();
    this.setupViewToggle();
    this.setupInfiniteScroll();
    this.setupLazyLoading();
    this.setupAccessibility();
    this.setupPerformanceOptimizations();
    this.loadInitialState();
  },

  /**
   * Initialize collection data from page
   */
  initializeCollectionData() {
    // Get collection data from URL and page
    const urlParams = new URLSearchParams(window.location.search);
    this.state.currentSort = urlParams.get('sort_by') || 'manual';
    this.state.currentPage = parseInt(urlParams.get('page')) || 1;
    
    // Parse filters from URL
    this.parseFiltersFromURL();
    
    // Get products from page
    this.initializeProducts();
    
    // Get pagination info
    this.initializePagination();
  },

  /**
   * Parse filters from URL parameters
   */
  parseFiltersFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const filters = {};
    
    // Parse price filters
    const priceMin = urlParams.get('filter.v.price.gte');
    const priceMax = urlParams.get('filter.v.price.lte');
    if (priceMin) filters.priceMin = parseInt(priceMin);
    if (priceMax) filters.priceMax = parseInt(priceMax);
    
    // Parse tag filters
    const tagFilters = urlParams.getAll('filter.v.tag');
    if (tagFilters.length > 0) {
      filters.tags = tagFilters;
    }
    
    // Parse vendor filters
    const vendorFilters = urlParams.getAll('filter.v.vendor');
    if (vendorFilters.length > 0) {
      filters.vendors = vendorFilters;
    }
    
    // Parse availability filters
    const availabilityFilters = urlParams.getAll('filter.v.availability');
    if (availabilityFilters.length > 0) {
      filters.availability = availabilityFilters;
    }
    
    this.state.currentFilters = filters;
  },

  /**
   * Initialize products from page
   */
  initializeProducts() {
    const productElements = document.querySelectorAll('[data-product-id]');
    this.state.products = Array.from(productElements).map(element => {
      const productId = element.dataset.productId;
      return {
        id: productId,
        element: element,
        data: this.extractProductData(element)
      };
    });
    
    this.state.filteredProducts = [...this.state.products];
  },

  /**
   * Extract product data from element
   */
  extractProductData(element) {
    const title = element.querySelector('.collection__product-title, .v-collection__product-title');
    const price = element.querySelector('.collection__product-price, .v-collection__product-price');
    const vendor = element.querySelector('.collection__product-vendor, .v-collection__product-vendor');
    const tags = element.dataset.tags ? element.dataset.tags.split(',') : [];
    const availability = element.dataset.availability || 'in_stock';
    
    return {
      title: title ? title.textContent.trim() : '',
      price: price ? this.parsePrice(price.textContent) : 0,
      vendor: vendor ? vendor.textContent.trim() : '',
      tags: tags,
      availability: availability,
      element: element
    };
  },

  /**
   * Parse price from text
   */
  parsePrice(priceText) {
    const match = priceText.match(/[\d,]+\.?\d*/);
    return match ? parseFloat(match[0].replace(/,/g, '')) : 0;
  },

  /**
   * Initialize pagination
   */
  initializePagination() {
    const paginationElement = document.querySelector('.collection__pagination, .v-collection__pagination');
    if (paginationElement) {
      const currentPageElement = paginationElement.querySelector('.collection__pagination-number--current, .v-collection__pagination-number--current');
      const totalPagesElement = paginationElement.querySelectorAll('.collection__pagination-number, .v-collection__pagination-number');
      
      if (currentPageElement) {
        this.state.currentPage = parseInt(currentPageElement.textContent);
      }
      
      if (totalPagesElement.length > 0) {
        this.state.totalPages = totalPagesElement.length;
      }
    }
  },

  /**
   * Setup filtering functionality
   */
  setupFiltering() {
    // Price filters
    this.setupPriceFilters();
    
    // Tag filters
    this.setupTagFilters();
    
    // Vendor filters
    this.setupVendorFilters();
    
    // Availability filters
    this.setupAvailabilityFilters();
    
    // Clear filters
    this.setupClearFilters();
    
    // Filter events
    this.setupFilterEvents();
  },

  /**
   * Setup price filters
   */
  setupPriceFilters() {
    const priceMinInput = document.querySelector('[data-price-min]');
    const priceMaxInput = document.querySelector('[data-price-max]');
    
    if (priceMinInput && priceMaxInput) {
      // Set initial values from URL
      if (this.state.currentFilters.priceMin) {
        priceMinInput.value = this.state.currentFilters.priceMin / 100;
      }
      if (this.state.currentFilters.priceMax) {
        priceMaxInput.value = this.state.currentFilters.priceMax / 100;
      }
      
      // Add event listeners
      priceMinInput.addEventListener('input', this.debounce(() => {
        this.handlePriceFilterChange();
      }, this.config.debounceDelay));
      
      priceMaxInput.addEventListener('input', this.debounce(() => {
        this.handlePriceFilterChange();
      }, this.config.debounceDelay));
    }
  },

  /**
   * Setup tag filters
   */
  setupTagFilters() {
    const tagInputs = document.querySelectorAll('[data-filter="tag"], [data-filter="color"], [data-filter="size"], [data-filter="material"]');
    
    tagInputs.forEach(input => {
      // Set initial state from URL
      if (this.state.currentFilters.tags && this.state.currentFilters.tags.includes(input.value)) {
        input.checked = true;
      }
      
      // Add event listener
      input.addEventListener('change', () => {
        this.handleTagFilterChange();
      });
    });
  },

  /**
   * Setup vendor filters
   */
  setupVendorFilters() {
    const vendorInputs = document.querySelectorAll('[data-filter="vendor"]');
    
    vendorInputs.forEach(input => {
      // Set initial state from URL
      if (this.state.currentFilters.vendors && this.state.currentFilters.vendors.includes(input.value)) {
        input.checked = true;
      }
      
      // Add event listener
      input.addEventListener('change', () => {
        this.handleVendorFilterChange();
      });
    });
  },

  /**
   * Setup availability filters
   */
  setupAvailabilityFilters() {
    const availabilityInputs = document.querySelectorAll('[data-filter="availability"]');
    
    availabilityInputs.forEach(input => {
      // Set initial state from URL
      if (this.state.currentFilters.availability && this.state.currentFilters.availability.includes(input.value)) {
        input.checked = true;
      }
      
      // Add event listener
      input.addEventListener('change', () => {
        this.handleAvailabilityFilterChange();
      });
    });
  },

  /**
   * Setup clear filters
   */
  setupClearFilters() {
    const clearButton = document.querySelector('[data-clear-filters]');
    if (clearButton) {
      clearButton.addEventListener('click', () => {
        this.clearAllFilters();
      });
    }
  },

  /**
   * Setup filter events
   */
  setupFilterEvents() {
    // Apply filters button
    const applyButton = document.querySelector('[data-apply-filters]');
    if (applyButton) {
      applyButton.addEventListener('click', () => {
        this.applyFilters();
      });
    }
    
    // Filter panel toggle
    const filterToggle = document.querySelector('[data-filter-toggle]');
    const filterPanel = document.querySelector('[data-filter-panel]');
    if (filterToggle && filterPanel) {
      filterToggle.addEventListener('click', () => {
        this.toggleFilterPanel();
      });
    }
    
    // Mobile filter toggle
    const mobileFilterToggle = document.querySelector('[data-mobile-filter-toggle]');
    const mobileFilterOverlay = document.querySelector('[data-mobile-filter-overlay]');
    if (mobileFilterToggle && mobileFilterOverlay) {
      mobileFilterToggle.addEventListener('click', () => {
        this.toggleMobileFilters();
      });
    }
  },

  /**
   * Handle price filter change
   */
  handlePriceFilterChange() {
    const priceMinInput = document.querySelector('[data-price-min]');
    const priceMaxInput = document.querySelector('[data-price-max]');
    
    if (priceMinInput && priceMaxInput) {
      const priceMin = priceMinInput.value ? parseInt(priceMinInput.value) * 100 : null;
      const priceMax = priceMaxInput.value ? parseInt(priceMaxInput.value) * 100 : null;
      
      this.state.currentFilters.priceMin = priceMin;
      this.state.currentFilters.priceMax = priceMax;
      
      this.applyFilters();
    }
  },

  /**
   * Handle tag filter change
   */
  handleTagFilterChange() {
    const tagInputs = document.querySelectorAll('[data-filter="tag"], [data-filter="color"], [data-filter="size"], [data-filter="material"]:checked');
    const tags = Array.from(tagInputs).map(input => input.value);
    
    this.state.currentFilters.tags = tags;
    this.applyFilters();
  },

  /**
   * Handle vendor filter change
   */
  handleVendorFilterChange() {
    const vendorInputs = document.querySelectorAll('[data-filter="vendor"]:checked');
    const vendors = Array.from(vendorInputs).map(input => input.value);
    
    this.state.currentFilters.vendors = vendors;
    this.applyFilters();
  },

  /**
   * Handle availability filter change
   */
  handleAvailabilityFilterChange() {
    const availabilityInputs = document.querySelectorAll('[data-filter="availability"]:checked');
    const availability = Array.from(availabilityInputs).map(input => input.value);
    
    this.state.currentFilters.availability = availability;
    this.applyFilters();
  },

  /**
   * Apply filters
   */
  applyFilters() {
    if (this.state.isFiltering) return;
    
    this.state.isFiltering = true;
    this.showLoadingState();
    
    // Build filter URL
    const filterURL = this.buildFilterURL();
    
    // Apply filters via AJAX or page reload
    if (this.config.enableAjaxFiltering) {
      this.applyFiltersAjax(filterURL);
    } else {
      window.location.href = filterURL;
    }
  },

  /**
   * Build filter URL
   */
  buildFilterURL() {
    const url = new URL(window.location);
    
    // Clear existing filters
    url.searchParams.delete('filter.v.price.gte');
    url.searchParams.delete('filter.v.price.lte');
    url.searchParams.delete('filter.v.tag');
    url.searchParams.delete('filter.v.vendor');
    url.searchParams.delete('filter.v.availability');
    
    // Add price filters
    if (this.state.currentFilters.priceMin) {
      url.searchParams.set('filter.v.price.gte', this.state.currentFilters.priceMin);
    }
    if (this.state.currentFilters.priceMax) {
      url.searchParams.set('filter.v.price.lte', this.state.currentFilters.priceMax);
    }
    
    // Add tag filters
    if (this.state.currentFilters.tags && this.state.currentFilters.tags.length > 0) {
      this.state.currentFilters.tags.forEach(tag => {
        url.searchParams.append('filter.v.tag', tag);
      });
    }
    
    // Add vendor filters
    if (this.state.currentFilters.vendors && this.state.currentFilters.vendors.length > 0) {
      this.state.currentFilters.vendors.forEach(vendor => {
        url.searchParams.append('filter.v.vendor', vendor);
      });
    }
    
    // Add availability filters
    if (this.state.currentFilters.availability && this.state.currentFilters.availability.length > 0) {
      this.state.currentFilters.availability.forEach(availability => {
        url.searchParams.append('filter.v.availability', availability);
      });
    }
    
    return url.toString();
  },

  /**
   * Apply filters via AJAX
   */
  async applyFiltersAjax(filterURL) {
    try {
      const response = await fetch(filterURL, {
        method: 'GET',
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      if (response.ok) {
        const html = await response.text();
        this.updateCollectionContent(html);
        this.updateURL(filterURL);
        this.announceToScreenReader('Filters applied');
      } else {
        throw new Error('Failed to apply filters');
      }
    } catch (error) {
      console.error('Filter error:', error);
      this.showFilterError();
    } finally {
      this.state.isFiltering = false;
      this.hideLoadingState();
    }
  },

  /**
   * Update collection content
   */
  updateCollectionContent(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Update products
    const newProducts = doc.querySelectorAll('[data-product-id]');
    const productsContainer = document.querySelector('[data-collection-products]');
    
    if (productsContainer) {
      productsContainer.innerHTML = '';
      newProducts.forEach(product => {
        productsContainer.appendChild(product);
      });
    }
    
    // Update pagination
    const newPagination = doc.querySelector('.collection__pagination, .v-collection__pagination');
    const paginationContainer = document.querySelector('.collection__pagination, .v-collection__pagination');
    
    if (newPagination && paginationContainer) {
      paginationContainer.innerHTML = newPagination.innerHTML;
    }
    
    // Update product count
    const newCount = doc.querySelector('.collection__count, .v-collection__count');
    const countContainer = document.querySelector('.collection__count, .v-collection__count');
    
    if (newCount && countContainer) {
      countContainer.innerHTML = newCount.innerHTML;
    }
    
    // Re-initialize products
    this.initializeProducts();
  },

  /**
   * Clear all filters
   */
  clearAllFilters() {
    // Clear filter inputs
    const filterInputs = document.querySelectorAll('[data-filter]');
    filterInputs.forEach(input => {
      input.checked = false;
    });
    
    // Clear price inputs
    const priceMinInput = document.querySelector('[data-price-min]');
    const priceMaxInput = document.querySelector('[data-price-max]');
    if (priceMinInput) priceMinInput.value = '';
    if (priceMaxInput) priceMaxInput.value = '';
    
    // Clear state
    this.state.currentFilters = {};
    
    // Apply cleared filters
    this.applyFilters();
    
    this.announceToScreenReader('All filters cleared');
  },

  /**
   * Toggle filter panel
   */
  toggleFilterPanel() {
    const filterPanel = document.querySelector('[data-filter-panel]');
    if (filterPanel) {
      filterPanel.classList.toggle('active');
    }
  },

  /**
   * Toggle mobile filters
   */
  toggleMobileFilters() {
    const mobileFilterOverlay = document.querySelector('[data-mobile-filter-overlay]');
    if (mobileFilterOverlay) {
      mobileFilterOverlay.classList.toggle('active');
      
      if (mobileFilterOverlay.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
  },

  /**
   * Setup sorting functionality
   */
  setupSorting() {
    const sortSelect = document.querySelector('[data-collection-sort]');
    if (sortSelect) {
      // Set initial value
      sortSelect.value = this.state.currentSort;
      
      // Add event listener
      sortSelect.addEventListener('change', (e) => {
        this.handleSortChange(e.target.value);
      });
    }
  },

  /**
   * Handle sort change
   */
  handleSortChange(sortValue) {
    if (this.state.isSorting) return;
    
    this.state.isSorting = true;
    this.state.currentSort = sortValue;
    
    // Build sort URL
    const sortURL = this.buildSortURL();
    
    // Apply sort via AJAX or page reload
    if (this.config.enableAjaxSorting) {
      this.applySortAjax(sortURL);
    } else {
      window.location.href = sortURL;
    }
  },

  /**
   * Build sort URL
   */
  buildSortURL() {
    const url = new URL(window.location);
    url.searchParams.set('sort_by', this.state.currentSort);
    return url.toString();
  },

  /**
   * Apply sort via AJAX
   */
  async applySortAjax(sortURL) {
    try {
      const response = await fetch(sortURL, {
        method: 'GET',
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      if (response.ok) {
        const html = await response.text();
        this.updateCollectionContent(html);
        this.updateURL(sortURL);
        this.announceToScreenReader('Products sorted');
      } else {
        throw new Error('Failed to sort products');
      }
    } catch (error) {
      console.error('Sort error:', error);
      this.showSortError();
    } finally {
      this.state.isSorting = false;
    }
  },

  /**
   * Setup pagination functionality
   */
  setupPagination() {
    // Previous/Next buttons
    const prevButton = document.querySelector('[data-pagination="prev"]');
    const nextButton = document.querySelector('[data-pagination="next"]');
    
    if (prevButton) {
      prevButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.handlePagination('prev');
      });
    }
    
    if (nextButton) {
      nextButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.handlePagination('next');
      });
    }
    
    // Page numbers
    const pageNumbers = document.querySelectorAll('[data-page]');
    pageNumbers.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const page = parseInt(e.target.dataset.page);
        this.handlePagination(page);
      });
    });
    
    // Load more button
    const loadMoreButton = document.querySelector('[data-load-more]');
    if (loadMoreButton) {
      loadMoreButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleLoadMore();
      });
    }
  },

  /**
   * Handle pagination
   */
  handlePagination(direction) {
    if (this.state.isPaginating) return;
    
    this.state.isPaginating = true;
    
    let newPage = this.state.currentPage;
    
    if (direction === 'prev') {
      newPage = Math.max(1, this.state.currentPage - 1);
    } else if (direction === 'next') {
      newPage = Math.min(this.state.totalPages, this.state.currentPage + 1);
    } else if (typeof direction === 'number') {
      newPage = direction;
    }
    
    if (newPage !== this.state.currentPage) {
      this.state.currentPage = newPage;
      this.navigateToPage(newPage);
    }
    
    this.state.isPaginating = false;
  },

  /**
   * Navigate to page
   */
  navigateToPage(page) {
    const url = new URL(window.location);
    url.searchParams.set('page', page);
    window.location.href = url.toString();
  },

  /**
   * Handle load more
   */
  async handleLoadMore() {
    if (this.state.isPaginating || !this.state.hasMorePages) return;
    
    this.state.isPaginating = true;
    this.showLoadMoreLoading();
    
    try {
      const nextPage = this.state.currentPage + 1;
      const url = new URL(window.location);
      url.searchParams.set('page', nextPage);
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      if (response.ok) {
        const html = await response.text();
        this.appendMoreProducts(html);
        this.state.currentPage = nextPage;
        this.updateLoadMoreButton();
      } else {
        throw new Error('Failed to load more products');
      }
    } catch (error) {
      console.error('Load more error:', error);
      this.showLoadMoreError();
    } finally {
      this.state.isPaginating = false;
      this.hideLoadMoreLoading();
    }
  },

  /**
   * Append more products
   */
  appendMoreProducts(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const newProducts = doc.querySelectorAll('[data-product-id]');
    const productsContainer = document.querySelector('[data-collection-products]');
    
    if (productsContainer && newProducts.length > 0) {
      newProducts.forEach(product => {
        productsContainer.appendChild(product);
      });
      
      // Re-initialize products
      this.initializeProducts();
      
      // Lazy load new images
      this.lazyLoadNewImages();
    }
  },

  /**
   * Update load more button
   */
  updateLoadMoreButton() {
    const loadMoreButton = document.querySelector('[data-load-more]');
    if (loadMoreButton) {
      if (this.state.currentPage >= this.state.totalPages) {
        loadMoreButton.style.display = 'none';
        this.state.hasMorePages = false;
      }
    }
  },

  /**
   * Setup view toggle functionality
   */
  setupViewToggle() {
    const viewButtons = document.querySelectorAll('[data-view]');
    viewButtons.forEach(button => {
      button.addEventListener('click', () => {
        const view = button.dataset.view;
        this.handleViewChange(view);
      });
    });
    
    // Load saved view preference
    const savedView = localStorage.getItem('collectionView');
    if (savedView) {
      this.state.currentView = savedView;
      this.updateViewButtons();
      this.applyView();
    }
  },

  /**
   * Handle view change
   */
  handleViewChange(view) {
    this.state.currentView = view;
    this.updateViewButtons();
    this.applyView();
    
    // Save preference
    localStorage.setItem('collectionView', view);
    
    this.announceToScreenReader(`View changed to ${view}`);
  },

  /**
   * Update view buttons
   */
  updateViewButtons() {
    const viewButtons = document.querySelectorAll('[data-view]');
    viewButtons.forEach(button => {
      button.classList.toggle('active', button.dataset.view === this.state.currentView);
    });
  },

  /**
   * Apply view
   */
  applyView() {
    const productsContainer = document.querySelector('[data-collection-products]');
    if (productsContainer) {
      productsContainer.className = productsContainer.className.replace(/collection--\w+/, `collection--${this.state.currentView}`);
    }
  },

  /**
   * Setup infinite scroll
   */
  setupInfiniteScroll() {
    if (!this.config.enableInfiniteScroll) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && this.state.hasMorePages && !this.state.isPaginating) {
          this.handleLoadMore();
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: `${this.config.infiniteScrollThreshold}px`
    });
    
    const loadMoreButton = document.querySelector('[data-load-more]');
    if (loadMoreButton) {
      observer.observe(loadMoreButton);
    }
  },

  /**
   * Setup lazy loading
   */
  setupLazyLoading() {
    if (!this.config.enableLazyLoading) return;
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: `${this.config.lazyLoadThreshold}px`
    });
    
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => imageObserver.observe(img));
  },

  /**
   * Lazy load new images
   */
  lazyLoadNewImages() {
    const newImages = document.querySelectorAll('img[data-src]');
    newImages.forEach(img => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      }
    });
  },

  /**
   * Setup accessibility features
   */
  setupAccessibility() {
    // Add ARIA live region for announcements
    this.createAriaLiveRegion();
    
    // Setup keyboard navigation
    this.setupKeyboardNavigation();
    
    // Setup focus management
    this.setupFocusManagement();
  },

  /**
   * Create ARIA live region
   */
  createAriaLiveRegion() {
    const liveRegion = document.createElement('div');
    liveRegion.id = 'collection-announcements';
    liveRegion.className = 'sr-only';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    document.body.appendChild(liveRegion);
  },

  /**
   * Setup keyboard navigation
   */
  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      // Escape key to close mobile filters
      if (e.key === 'Escape') {
        const mobileFilterOverlay = document.querySelector('[data-mobile-filter-overlay]');
        if (mobileFilterOverlay && mobileFilterOverlay.classList.contains('active')) {
          this.toggleMobileFilters();
        }
      }
    });
  },

  /**
   * Setup focus management
   */
  setupFocusManagement() {
    // Focus management for mobile filters
    const mobileFilterToggle = document.querySelector('[data-mobile-filter-toggle]');
    const mobileFilterClose = document.querySelector('[data-mobile-filter-close]');
    
    if (mobileFilterToggle && mobileFilterClose) {
      mobileFilterToggle.addEventListener('click', () => {
        setTimeout(() => {
          mobileFilterClose.focus();
        }, 100);
      });
      
      mobileFilterClose.addEventListener('click', () => {
        setTimeout(() => {
          mobileFilterToggle.focus();
        }, 100);
      });
    }
  },

  /**
   * Setup performance optimizations
   */
  setupPerformanceOptimizations() {
    // Preload next page
    this.preloadNextPage();
    
    // Setup performance monitoring
    this.setupPerformanceMonitoring();
  },

  /**
   * Preload next page
   */
  preloadNextPage() {
    if (this.state.currentPage < this.state.totalPages) {
      const nextPage = this.state.currentPage + 1;
      const url = new URL(window.location);
      url.searchParams.set('page', nextPage);
      
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url.toString();
      document.head.appendChild(link);
    }
  },

  /**
   * Setup performance monitoring
   */
  setupPerformanceMonitoring() {
    // Monitor filter performance
    const filterStartTime = performance.now();
    
    // Track filter completion
    document.addEventListener('collectionFiltersApplied', () => {
      const filterEndTime = performance.now();
      const filterTime = filterEndTime - filterStartTime;
      console.log(`Filters applied in ${filterTime}ms`);
    });
  },

  /**
   * Load initial state
   */
  loadInitialState() {
    // Load saved preferences
    const savedView = localStorage.getItem('collectionView');
    if (savedView) {
      this.state.currentView = savedView;
      this.applyView();
    }
    
    // Apply initial filters
    this.applyInitialFilters();
  },

  /**
   * Apply initial filters
   */
  applyInitialFilters() {
    if (Object.keys(this.state.currentFilters).length > 0) {
      this.updateFilterUI();
    }
  },

  /**
   * Update filter UI
   */
  updateFilterUI() {
    // Update price inputs
    const priceMinInput = document.querySelector('[data-price-min]');
    const priceMaxInput = document.querySelector('[data-price-max]');
    
    if (priceMinInput && this.state.currentFilters.priceMin) {
      priceMinInput.value = this.state.currentFilters.priceMin / 100;
    }
    if (priceMaxInput && this.state.currentFilters.priceMax) {
      priceMaxInput.value = this.state.currentFilters.priceMax / 100;
    }
    
    // Update tag inputs
    if (this.state.currentFilters.tags) {
      this.state.currentFilters.tags.forEach(tag => {
        const input = document.querySelector(`[data-filter][value="${tag}"]`);
        if (input) input.checked = true;
      });
    }
    
    // Update vendor inputs
    if (this.state.currentFilters.vendors) {
      this.state.currentFilters.vendors.forEach(vendor => {
        const input = document.querySelector(`[data-filter="vendor"][value="${vendor}"]`);
        if (input) input.checked = true;
      });
    }
    
    // Update availability inputs
    if (this.state.currentFilters.availability) {
      this.state.currentFilters.availability.forEach(availability => {
        const input = document.querySelector(`[data-filter="availability"][value="${availability}"]`);
        if (input) input.checked = true;
      });
    }
  },

  /**
   * Show loading state
   */
  showLoadingState() {
    const productsContainer = document.querySelector('[data-collection-products]');
    if (productsContainer) {
      productsContainer.classList.add('loading');
    }
  },

  /**
   * Hide loading state
   */
  hideLoadingState() {
    const productsContainer = document.querySelector('[data-collection-products]');
    if (productsContainer) {
      productsContainer.classList.remove('loading');
    }
  },

  /**
   * Show load more loading
   */
  showLoadMoreLoading() {
    const loadMoreButton = document.querySelector('[data-load-more]');
    if (loadMoreButton) {
      const text = loadMoreButton.querySelector('.collection__load-more-text, .v-collection__load-more-text');
      const spinner = loadMoreButton.querySelector('.collection__load-more-spinner, .v-collection__load-more-spinner');
      
      if (text) text.style.display = 'none';
      if (spinner) spinner.style.display = 'inline-block';
      
      loadMoreButton.disabled = true;
    }
  },

  /**
   * Hide load more loading
   */
  hideLoadMoreLoading() {
    const loadMoreButton = document.querySelector('[data-load-more]');
    if (loadMoreButton) {
      const text = loadMoreButton.querySelector('.collection__load-more-text, .v-collection__load-more-text');
      const spinner = loadMoreButton.querySelector('.collection__load-more-spinner, .v-collection__load-more-spinner');
      
      if (text) text.style.display = 'inline-block';
      if (spinner) spinner.style.display = 'none';
      
      loadMoreButton.disabled = false;
    }
  },

  /**
   * Show filter error
   */
  showFilterError() {
    this.showNotification('Failed to apply filters. Please try again.', 'error');
  },

  /**
   * Show sort error
   */
  showSortError() {
    this.showNotification('Failed to sort products. Please try again.', 'error');
  },

  /**
   * Show load more error
   */
  showLoadMoreError() {
    this.showNotification('Failed to load more products. Please try again.', 'error');
  },

  /**
   * Show notification
   */
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `collection-notification collection-notification--${type}`;
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
    const liveRegion = document.getElementById('collection-announcements');
    if (liveRegion) {
      liveRegion.textContent = message;
    }
  },

  /**
   * Update URL
   */
  updateURL(url) {
    window.history.replaceState({}, '', url);
  },

  /**
   * Debounce function
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
  }
};

// Initialize collection utilities when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  window.collectionUtils.init();
});
