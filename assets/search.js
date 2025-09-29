/**
 * Enhanced Search System JavaScript
 * Handles predictive search, advanced filtering, AJAX results, and search analytics
 */

class SearchSystem {
  constructor() {
    this.searchInput = null;
    this.predictiveSearchContainer = null;
    this.searchResults = null;
    this.searchForm = null;
    this.currentQuery = '';
    this.searchTimeout = null;
    this.isSearching = false;
    this.activeFilters = new Map();
    this.sortBy = 'relevance';
    this.currentPage = 1;
    this.resultsPerPage = 20;
    this.searchAnalytics = {
      searches: [],
      filters: new Map(),
      results: []
    };
    this.init();
  }

  init() {
    this.bindEvents();
    this.initializePredictiveSearch();
    this.initializeFilters();
    this.initializeSorting();
    this.initializePagination();
    this.initializeMobileFilters();
    this.loadSearchState();
  }

  bindEvents() {
    // Search input events
    document.addEventListener('input', (event) => {
      if (event.target.matches('[data-search-input], .search-form__input')) {
        this.handleSearchInput(event.target);
      }
    });

    // Search form submission
    document.addEventListener('submit', (event) => {
      if (event.target.matches('[data-search-form], .search-form')) {
        this.handleSearchSubmit(event);
      }
    });

    // Filter events
    document.addEventListener('change', (event) => {
      if (event.target.matches('[data-filter-type], .search-filters__checkbox-input, .search-filters__price-min, .search-filters__price-max')) {
        this.handleFilterChange(event.target);
      }
    });

    // Sort events
    document.addEventListener('change', (event) => {
      if (event.target.matches('[data-search-sort], .search-controls__sort-select')) {
        this.handleSortChange(event.target);
      }
    });

    // Clear search
    document.addEventListener('click', (event) => {
      if (event.target.matches('[data-clear-search]')) {
        this.clearSearch();
      }
    });

    // Clear filters
    document.addEventListener('click', (event) => {
      if (event.target.matches('[data-clear-filters]')) {
        this.clearAllFilters();
      }
    });

    // Mobile filter toggle
    document.addEventListener('click', (event) => {
      if (event.target.matches('[data-mobile-filters-toggle]')) {
        this.toggleMobileFilters();
      }
    });

    // Quick add to cart
    document.addEventListener('click', (event) => {
      if (event.target.matches('[data-product-id]')) {
        this.handleQuickAdd(event.target);
      }
    });

    // Wishlist toggle
    document.addEventListener('click', (event) => {
      if (event.target.matches('[data-wishlist-toggle]')) {
        this.handleWishlistToggle(event.target);
      }
    });

    // Close predictive search
    document.addEventListener('click', (event) => {
      if (!event.target.closest('.predictive-search') && !event.target.closest('[data-search-input]')) {
        this.hidePredictiveSearch();
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (event) => {
      this.handleKeyboardNavigation(event);
    });

    // Window resize for mobile filters
    window.addEventListener('resize', () => {
      this.handleWindowResize();
    });
  }

  initializePredictiveSearch() {
    this.searchInput = document.querySelector('[data-search-input], .search-form__input');
    this.predictiveSearchContainer = document.querySelector('.predictive-search');
    
    if (this.searchInput) {
      this.setupPredictiveSearch();
    }
  }

  setupPredictiveSearch() {
    // Use existing predictive search container or create one
    if (!this.predictiveSearchContainer) {
      this.predictiveSearchContainer = document.querySelector('.predictive-search');
    }
    
    if (!this.predictiveSearchContainer) {
      // Create predictive search container if it doesn't exist
      const container = document.createElement('div');
      container.className = 'predictive-search';
      container.setAttribute('data-predictive-search', '');
      container.style.display = 'none';
      document.body.appendChild(container);
      this.predictiveSearchContainer = container;
    }
  }

  handleSearchInput(input) {
    const query = input.value.trim();
    
    if (query === this.currentQuery) return;
    
    this.currentQuery = query;
    
    // Clear previous timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    // Show/hide predictive search
    if (query.length >= 2) {
      this.searchTimeout = setTimeout(() => {
        this.performPredictiveSearch(query);
      }, 300);
    } else {
      this.hidePredictiveSearch();
    }

    // Track search analytics
    this.trackSearchInput(query);
  }

  async performPredictiveSearch(query) {
    if (this.isSearching) return;
    
    this.isSearching = true;
    this.showPredictiveSearchLoading();

    try {
      const response = await fetch(`/search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=product,article,page,collection&resources[limit]=5&section_id=predictive-search`);
      const data = await response.json();
      
      this.displayPredictiveResults(data);
      this.trackPredictiveSearch(query, data);
    } catch (error) {
      console.error('Error performing predictive search:', error);
      this.hidePredictiveSearch();
    } finally {
      this.isSearching = false;
    }
  }

  displayPredictiveResults(data) {
    if (!this.predictiveSearchContainer) return;

    // Use the existing predictive search section if available
    const existingSection = document.querySelector('.predictive-search');
    if (existingSection && data.html) {
      existingSection.innerHTML = data.html;
      this.showPredictiveSearch();
      return;
    }

    // Fallback: build HTML manually
    let html = '';

    // Products
    if (data.resources && data.resources.products && data.resources.products.length > 0) {
      html += '<div class="predictive-search__section">';
      html += '<h3 class="predictive-search__section-title">Products</h3>';
      html += '<ul class="predictive-search__list">';
      
      data.resources.products.forEach(product => {
        html += `
          <li class="predictive-search__item" data-predictive-search-item>
            <a href="${product.url}" class="predictive-search__link">
              ${product.featured_media ? `<img src="${product.featured_media | image_url: width: 210}" alt="${product.title}" class="predictive-search__image">` : ''}
              <div class="predictive-search__content">
                <span class="predictive-search__title">${product.title}</span>
                <span class="predictive-search__price">${this.formatMoney(product.price)}</span>
              </div>
            </a>
          </li>
        `;
      });
      
      html += '</ul></div>';
    }

    // Articles
    if (data.resources && data.resources.articles && data.resources.articles.length > 0) {
      html += '<div class="predictive-search__section">';
      html += '<h3 class="predictive-search__section-title">Articles</h3>';
      html += '<ul class="predictive-search__list">';
      
      data.resources.articles.forEach(article => {
        html += `
          <li class="predictive-search__item" data-predictive-search-item>
            <a href="${article.url}" class="predictive-search__link">
              <div class="predictive-search__content">
                <span class="predictive-search__title">${article.title}</span>
              </div>
            </a>
          </li>
        `;
      });
      
      html += '</ul></div>';
    }

    // Pages
    if (data.resources && data.resources.pages && data.resources.pages.length > 0) {
      html += '<div class="predictive-search__section">';
      html += '<h3 class="predictive-search__section-title">Pages</h3>';
      html += '<ul class="predictive-search__list">';
      
      data.resources.pages.forEach(page => {
        html += `
          <li class="predictive-search__item" data-predictive-search-item>
            <a href="${page.url}" class="predictive-search__link">
              <div class="predictive-search__content">
                <span class="predictive-search__title">${page.title}</span>
              </div>
            </a>
          </li>
        `;
      });
      
      html += '</ul></div>';
    }

    // Collections
    if (data.resources && data.resources.collections && data.resources.collections.length > 0) {
      html += '<div class="predictive-search__section">';
      html += '<h3 class="predictive-search__section-title">Collections</h3>';
      html += '<ul class="predictive-search__list">';
      
      data.resources.collections.forEach(collection => {
        html += `
          <li class="predictive-search__item" data-predictive-search-item>
            <a href="${collection.url}" class="predictive-search__link">
              <div class="predictive-search__content">
                <span class="predictive-search__title">${collection.title}</span>
              </div>
            </a>
          </li>
        `;
      });
      
      html += '</ul></div>';
    }

    // Show all results link
    if (html) {
      html += `
        <div class="predictive-search__footer">
          <a href="/search?q=${encodeURIComponent(this.currentQuery)}" class="predictive-search__view-all">
            View all results for "${this.currentQuery}"
          </a>
        </div>
      `;
    }

    this.predictiveSearchContainer.innerHTML = html;
    this.showPredictiveSearch();
  }

  showPredictiveSearch() {
    if (this.predictiveSearchContainer) {
      this.predictiveSearchContainer.style.display = 'block';
      this.predictiveSearchContainer.classList.add('predictive-search--visible');
    }
  }

  hidePredictiveSearch() {
    if (this.predictiveSearchContainer) {
      this.predictiveSearchContainer.style.display = 'none';
      this.predictiveSearchContainer.classList.remove('predictive-search--visible');
    }
  }

  showPredictiveSearchLoading() {
    if (this.predictiveSearchContainer) {
      this.predictiveSearchContainer.innerHTML = `
        <div class="predictive-search__loading">
          <div class="spinner"></div>
          <span>Searching...</span>
        </div>
      `;
      this.showPredictiveSearch();
    }
  }

  handleSearchSubmit(event) {
    const form = event.target;
    const input = form.querySelector('input[name="q"]');
    
    if (input && input.value.trim()) {
      // Hide predictive search
      this.hidePredictiveSearch();
      
      // Track search submission
      this.trackSearchSubmission(input.value.trim());
      
      // Allow form to submit normally
      return true;
    }
    
    event.preventDefault();
    return false;
  }

  initializeFilters() {
    const filterContainer = document.querySelector('[data-search-filters], .search-filters');
    if (filterContainer) {
      this.setupFilterManagement();
    }
  }

  setupFilterManagement() {
    // Initialize active filters from URL
    this.parseActiveFiltersFromURL();
    
    // Update filter UI
    this.updateFilterUI();
    
    // Initialize price range sliders
    this.initializePriceRangeSliders();
  }

  parseActiveFiltersFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Clear existing filters
    this.activeFilters.clear();
    
    // Parse filter parameters
    urlParams.forEach((value, key) => {
      if (key.startsWith('filter.')) {
        const filterName = key.replace('filter.', '');
        const values = value.split(',');
        this.activeFilters.set(filterName, values);
      }
    });
    
    // Parse sort parameter
    if (urlParams.has('sort_by')) {
      this.sortBy = urlParams.get('sort_by');
    }
    
    // Parse page parameter
    if (urlParams.has('page')) {
      this.currentPage = parseInt(urlParams.get('page')) || 1;
    }
  }

  handleFilterChange(input) {
    const filterType = input.dataset.filterType || input.name.replace('filter.', '');
    const filterValue = input.value;
    
    if (input.type === 'checkbox') {
      if (input.checked) {
        this.addFilter(filterType, filterValue);
      } else {
        this.removeFilter(filterType, filterValue);
      }
    } else if (input.type === 'radio') {
      this.setFilter(filterType, filterValue);
    } else if (input.type === 'range') {
      this.handlePriceRangeChange(input);
    }
    
    this.updateURL();
    this.updateSearchResults();
    this.trackFilterUsage(filterType, filterValue);
  }

  addFilter(filterName, value) {
    if (!this.activeFilters.has(filterName)) {
      this.activeFilters.set(filterName, []);
    }
    
    const values = this.activeFilters.get(filterName);
    if (!values.includes(value)) {
      values.push(value);
    }
  }

  removeFilter(filterName, value) {
    if (this.activeFilters.has(filterName)) {
      const values = this.activeFilters.get(filterName);
      const index = values.indexOf(value);
      if (index > -1) {
        values.splice(index, 1);
        if (values.length === 0) {
          this.activeFilters.delete(filterName);
        }
      }
    }
  }

  setFilter(filterName, value) {
    this.activeFilters.set(filterName, [value]);
  }

  handlePriceRangeChange(input) {
    const filterType = input.dataset.filterType;
    const value = parseInt(input.value);
    
    if (filterType === 'price_min') {
      this.setFilter('price_min', value.toString());
    } else if (filterType === 'price_max') {
      this.setFilter('price_max', value.toString());
    }
    
    // Update price display
    this.updatePriceDisplay();
  }

  updateURL() {
    const url = new URL(window.location);
    
    // Remove existing filter parameters
    const paramsToRemove = [];
    url.searchParams.forEach((value, key) => {
      if (key.startsWith('filter.') || key === 'sort_by' || key === 'page') {
        paramsToRemove.push(key);
      }
    });
    paramsToRemove.forEach(key => url.searchParams.delete(key));
    
    // Add active filters
    this.activeFilters.forEach((values, filterName) => {
      if (values.length > 0) {
        url.searchParams.set(`filter.${filterName}`, values.join(','));
      }
    });
    
    // Add sort parameter
    if (this.sortBy && this.sortBy !== 'relevance') {
      url.searchParams.set('sort_by', this.sortBy);
    }
    
    // Add page parameter
    if (this.currentPage > 1) {
      url.searchParams.set('page', this.currentPage.toString());
    }
    
    // Update URL without page reload
    window.history.replaceState({}, '', url);
  }

  async updateSearchResults() {
    const searchSection = document.querySelector('.search-section');
    if (!searchSection) return;
    
    const sectionId = searchSection.dataset.sectionId || 'search';
    const terms = this.currentQuery || new URLSearchParams(window.location.search).get('q') || '';
    
    // Build filter parameters
    const filterParams = new URLSearchParams();
    this.activeFilters.forEach((values, filterName) => {
      if (values.length > 0) {
        filterParams.set(`filter.${filterName}`, values.join(','));
      }
    });
    
    // Add sort parameter
    if (this.sortBy && this.sortBy !== 'relevance') {
      filterParams.set('sort_by', this.sortBy);
    }
    
    // Add page parameter
    if (this.currentPage > 1) {
      filterParams.set('page', this.currentPage.toString());
    }
    
    try {
      this.showSearchLoading();
      
      const response = await fetch(`/?section_id=${sectionId}&q=${encodeURIComponent(terms)}&${filterParams.toString()}`);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const newResults = doc.querySelector('.search-results');
      
      if (newResults) {
        const currentResults = searchSection.querySelector('.search-results');
        if (currentResults) {
          currentResults.innerHTML = newResults.innerHTML;
        }
      }
      
      this.hideSearchLoading();
      this.trackSearchResults(terms, this.activeFilters);
    } catch (error) {
      console.error('Error updating search results:', error);
      this.hideSearchLoading();
    }
  }

  updateFilterUI() {
    // Update checkbox states
    this.activeFilters.forEach((values, filterName) => {
      values.forEach(value => {
        const input = document.querySelector(`input[data-filter-type="${filterName}"][value="${value}"]`);
        if (input) {
          input.checked = true;
        }
      });
    });
    
    // Update active filter count
    const totalActiveFilters = Array.from(this.activeFilters.values()).reduce((sum, values) => sum + values.length, 0);
    const countElement = document.querySelector('[data-active-filters-count]');
    if (countElement) {
      countElement.textContent = totalActiveFilters;
      countElement.style.display = totalActiveFilters > 0 ? 'inline' : 'none';
    }
  }

  handleTabChange(tab) {
    const targetType = tab.dataset.predictiveSearchTab;
    const targetId = tab.getAttribute('aria-controls');
    
    if (!targetId) return;
    
    // Hide all tab content
    document.querySelectorAll('.predictive-search__results-categories-item').forEach(content => {
      content.hidden = true;
    });
    
    // Show target content
    const targetContent = document.getElementById(targetId);
    if (targetContent) {
      targetContent.hidden = false;
    }
    
    // Update tab states
    document.querySelectorAll('.tabs-nav__item').forEach(t => {
      t.setAttribute('aria-expanded', 'false');
    });
    tab.setAttribute('aria-expanded', 'true');
    
    // Load content if not already loaded
    if (targetContent && !targetContent.dataset.loaded) {
      this.loadTabContent(targetType, targetContent);
    }
  }

  async loadTabContent(type, container) {
    const searchSection = document.querySelector('.search-section');
    if (!searchSection) return;
    
    const sectionId = searchSection.dataset.sectionId || 'search';
    const terms = this.currentQuery || new URLSearchParams(window.location.search).get('q') || '';
    
    try {
      const response = await fetch(`/?section_id=${sectionId}&q=${encodeURIComponent(terms)}&type=${type}`);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const newContent = doc.querySelector(`#${container.id}`);
      
      if (newContent) {
        container.innerHTML = newContent.innerHTML;
        container.dataset.loaded = 'true';
      }
    } catch (error) {
      console.error('Error loading tab content:', error);
    }
  }

  handleKeyboardNavigation(event) {
    if (!this.predictiveSearchContainer || !this.predictiveSearchContainer.classList.contains('predictive-search--visible')) {
      return;
    }
    
    const items = this.predictiveSearchContainer.querySelectorAll('[data-predictive-search-item]');
    const activeItem = this.predictiveSearchContainer.querySelector('[data-predictive-search-item--active]');
    let currentIndex = -1;
    
    if (activeItem) {
      currentIndex = Array.from(items).indexOf(activeItem);
    }
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        currentIndex = Math.min(currentIndex + 1, items.length - 1);
        this.setActivePredictiveItem(items[currentIndex]);
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        currentIndex = Math.max(currentIndex - 1, 0);
        this.setActivePredictiveItem(items[currentIndex]);
        break;
        
      case 'Enter':
        if (activeItem) {
          event.preventDefault();
          const link = activeItem.querySelector('a');
          if (link) {
            window.location.href = link.href;
          }
        }
        break;
        
      case 'Escape':
        this.hidePredictiveSearch();
        if (this.searchInput) {
          this.searchInput.focus();
        }
        break;
    }
  }

  setActivePredictiveItem(item) {
    // Remove active class from all items
    this.predictiveSearchContainer.querySelectorAll('[data-predictive-search-item]').forEach(i => {
      i.removeAttribute('data-predictive-search-item--active');
    });
    
    // Add active class to current item
    if (item) {
      item.setAttribute('data-predictive-search-item--active', '');
    }
  }

  formatMoney(cents) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  }

  // New methods for enhanced search functionality
  initializeSorting() {
    const sortSelect = document.querySelector('[data-search-sort]');
    if (sortSelect) {
      sortSelect.addEventListener('change', (event) => {
        this.handleSortChange(event.target);
      });
    }
  }

  handleSortChange(select) {
    this.sortBy = select.value;
    this.currentPage = 1; // Reset to first page when sorting
    this.updateURL();
    this.updateSearchResults();
    this.trackSortUsage(this.sortBy);
  }

  initializePagination() {
    // Handle pagination clicks
    document.addEventListener('click', (event) => {
      if (event.target.matches('.pagination__item a, .pagination__link')) {
        event.preventDefault();
        const url = new URL(event.target.href);
        const page = url.searchParams.get('page');
        if (page) {
          this.currentPage = parseInt(page);
          this.updateURL();
          this.updateSearchResults();
        }
      }
    });
  }

  initializeMobileFilters() {
    const mobileToggle = document.querySelector('[data-mobile-filters-toggle]');
    const filtersContainer = document.querySelector('[data-search-filters]');
    
    if (mobileToggle && filtersContainer) {
      // Handle mobile filter toggle
      mobileToggle.addEventListener('click', () => {
        this.toggleMobileFilters();
      });
    }
  }

  toggleMobileFilters() {
    const filtersContainer = document.querySelector('[data-search-filters]');
    if (filtersContainer) {
      filtersContainer.classList.toggle('search-filters--mobile-open');
    }
  }

  handleWindowResize() {
    // Close mobile filters on desktop
    if (window.innerWidth >= 768) {
      const filtersContainer = document.querySelector('[data-search-filters]');
      if (filtersContainer) {
        filtersContainer.classList.remove('search-filters--mobile-open');
      }
    }
  }

  initializePriceRangeSliders() {
    const minSlider = document.querySelector('[data-filter-type="price_min"]');
    const maxSlider = document.querySelector('[data-filter-type="price_max"]');
    
    if (minSlider && maxSlider) {
      minSlider.addEventListener('input', () => {
        this.updatePriceDisplay();
      });
      
      maxSlider.addEventListener('input', () => {
        this.updatePriceDisplay();
      });
    }
  }

  updatePriceDisplay() {
    const minSlider = document.querySelector('[data-filter-type="price_min"]');
    const maxSlider = document.querySelector('[data-filter-type="price_max"]');
    const minDisplay = document.querySelector('.search-filters__price-min-display');
    const maxDisplay = document.querySelector('.search-filters__price-max-display');
    
    if (minSlider && minDisplay) {
      minDisplay.textContent = this.formatMoney(parseInt(minSlider.value) * 100);
    }
    
    if (maxSlider && maxDisplay) {
      maxDisplay.textContent = this.formatMoney(parseInt(maxSlider.value) * 100);
    }
  }

  clearSearch() {
    const searchInput = document.querySelector('[data-search-input]');
    if (searchInput) {
      searchInput.value = '';
      this.currentQuery = '';
      this.hidePredictiveSearch();
    }
  }

  clearAllFilters() {
    this.activeFilters.clear();
    this.updateFilterUI();
    this.updateURL();
    this.updateSearchResults();
  }

  showSearchLoading() {
    const loadingElement = document.querySelector('[data-search-loading]');
    if (loadingElement) {
      loadingElement.style.display = 'block';
    }
  }

  hideSearchLoading() {
    const loadingElement = document.querySelector('[data-search-loading]');
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
  }

  loadSearchState() {
    // Load search state from URL on page load
    this.parseActiveFiltersFromURL();
    this.updateFilterUI();
  }

  handleQuickAdd(button) {
    const productId = button.dataset.productId;
    const variantId = button.dataset.variantId;
    
    if (productId && variantId) {
      // Add to cart logic
      this.addToCart(variantId, 1);
    }
  }

  handleWishlistToggle(button) {
    const productId = button.dataset.productId;
    
    if (productId) {
      // Toggle wishlist logic
      this.toggleWishlist(productId);
    }
  }

  async addToCart(variantId, quantity) {
    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: variantId,
          quantity: quantity
        })
      });
      
      if (response.ok) {
        // Show success message
        this.showNotification('Product added to cart', 'success');
      } else {
        throw new Error('Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      this.showNotification('Failed to add product to cart', 'error');
    }
  }

  toggleWishlist(productId) {
    // Implement wishlist toggle logic
    console.log('Toggle wishlist for product:', productId);
  }

  showNotification(message, type = 'info') {
    // Create and show notification
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // Analytics methods
  trackSearchInput(query) {
    this.searchAnalytics.searches.push({
      query: query,
      timestamp: Date.now(),
      type: 'input'
    });
  }

  trackSearchSubmission(query) {
    this.searchAnalytics.searches.push({
      query: query,
      timestamp: Date.now(),
      type: 'submission'
    });
  }

  trackPredictiveSearch(query, data) {
    this.searchAnalytics.searches.push({
      query: query,
      timestamp: Date.now(),
      type: 'predictive',
      results: data
    });
  }

  trackFilterUsage(filterType, value) {
    if (!this.searchAnalytics.filters.has(filterType)) {
      this.searchAnalytics.filters.set(filterType, []);
    }
    
    this.searchAnalytics.filters.get(filterType).push({
      value: value,
      timestamp: Date.now()
    });
  }

  trackSortUsage(sortBy) {
    this.searchAnalytics.searches.push({
      query: this.currentQuery,
      timestamp: Date.now(),
      type: 'sort',
      sortBy: sortBy
    });
  }

  trackSearchResults(query, filters) {
    this.searchAnalytics.results.push({
      query: query,
      filters: Array.from(filters.entries()),
      timestamp: Date.now()
    });
  }
}

// Initialize search system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.searchSystem = new SearchSystem();
});
