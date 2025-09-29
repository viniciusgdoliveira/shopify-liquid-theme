/**
 * Enhanced Search Utilities - Advanced search functionality
 * Provides AJAX search, autocomplete, filtering, and performance optimization
 */

window.searchUtils = {
  // Configuration
  config: {
    debounceDelay: 300,
    minQueryLength: 2,
    maxSuggestions: 8,
    cacheTimeout: 300000, // 5 minutes
    apiEndpoints: {
      search: '/search/suggest.json',
      products: '/search.json',
      collections: '/collections.json'
    }
  },

  // Cache for search results
  cache: new Map(),
  
  // Current search state
  state: {
    isSearching: false,
    currentQuery: '',
    activeFilters: {},
    sortBy: 'relevance',
    currentPage: 1,
    resultsPerPage: 20
  },

  /**
   * Initialize search utilities
   */
  init() {
    this.setupEventListeners();
    this.setupAutocomplete();
    this.setupFilters();
    this.setupKeyboardNavigation();
    this.loadSearchHistory();
  },

  /**
   * Setup global event listeners
   */
  setupEventListeners() {
    // Search form submissions
    document.addEventListener('submit', (e) => {
      if (e.target.classList.contains('search-form')) {
        e.preventDefault();
        this.handleSearchSubmit(e.target);
      }
    });

    // Search input changes
    document.addEventListener('input', (e) => {
      if (e.target.name === 'q' || e.target.classList.contains('search-input')) {
        this.handleSearchInput(e.target);
      }
    });

    // Filter changes
    document.addEventListener('change', (e) => {
      if (e.target.closest('.search-filters')) {
        this.handleFilterChange(e.target);
      }
    });

    // Sort changes
    document.addEventListener('change', (e) => {
      if (e.target.name === 'sort_by') {
        this.handleSortChange(e.target);
      }
    });

    // Pagination
    document.addEventListener('click', (e) => {
      if (e.target.closest('.pagination')) {
        e.preventDefault();
        this.handlePagination(e.target);
      }
    });

    // Clear search
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-clear-search]')) {
        this.clearSearch();
      }
    });
  },

  /**
   * Setup autocomplete functionality
   */
  setupAutocomplete() {
    const searchInputs = document.querySelectorAll('input[name="q"], .search-input');
    
    searchInputs.forEach(input => {
      // Create autocomplete container
      const autocompleteContainer = this.createAutocompleteContainer(input);
      
      // Handle input events
      input.addEventListener('input', this.debounce((e) => {
        this.handleAutocomplete(e.target, autocompleteContainer);
      }, this.config.debounceDelay));

      // Handle focus/blur
      input.addEventListener('focus', () => {
        if (input.value.length >= this.config.minQueryLength) {
          this.showAutocomplete(autocompleteContainer);
        }
      });

      input.addEventListener('blur', (e) => {
        // Delay hiding to allow clicking on suggestions
        setTimeout(() => {
          this.hideAutocomplete(autocompleteContainer);
        }, 200);
      });

      // Handle keyboard navigation
      input.addEventListener('keydown', (e) => {
        this.handleAutocompleteKeyboard(e, autocompleteContainer);
      });
    });
  },

  /**
   * Setup filter functionality
   */
  setupFilters() {
    const filterContainer = document.querySelector('.search-filters');
    if (!filterContainer) return;

    // Initialize filter state
    this.initializeFilters();

    // Setup mobile filter toggle
    const mobileFilterToggle = document.querySelector('[data-mobile-filters-toggle]');
    if (mobileFilterToggle) {
      mobileFilterToggle.addEventListener('click', () => {
        this.toggleMobileFilters();
      });
    }

    // Setup filter clear
    const clearFiltersBtn = document.querySelector('[data-clear-filters]');
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', () => {
        this.clearAllFilters();
      });
    }
  },

  /**
   * Setup keyboard navigation
   */
  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      // Escape key to close search
      if (e.key === 'Escape') {
        this.closeSearch();
      }

      // Ctrl/Cmd + K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.focusSearch();
      }
    });
  },

  /**
   * Handle search form submission
   */
  async handleSearchSubmit(form) {
    const query = form.querySelector('input[name="q"]').value.trim();
    if (!query) return;

    // Add to search history
    this.addToSearchHistory(query);

    // Perform search
    await this.performSearch(query);
  },

  /**
   * Handle search input changes
   */
  handleSearchInput(input) {
    const query = input.value.trim();
    this.state.currentQuery = query;

    // Update URL without page reload
    this.updateSearchURL(query);

    // Show/hide clear button
    this.toggleClearButton(query);
  },

  /**
   * Handle autocomplete
   */
  async handleAutocomplete(input, container) {
    const query = input.value.trim();
    
    if (query.length < this.config.minQueryLength) {
      this.hideAutocomplete(container);
      return;
    }

    try {
      const suggestions = await this.getSearchSuggestions(query);
      this.renderAutocomplete(suggestions, container, query);
      this.showAutocomplete(container);
    } catch (error) {
      console.error('Autocomplete error:', error);
      this.hideAutocomplete(container);
    }
  },

  /**
   * Handle filter changes
   */
  async handleFilterChange(filter) {
    const filterType = filter.dataset.filterType;
    const filterValue = filter.value;

    if (filter.checked !== undefined) {
      // Checkbox filter
      if (filter.checked) {
        this.state.activeFilters[filterType] = this.state.activeFilters[filterType] || [];
        if (!this.state.activeFilters[filterType].includes(filterValue)) {
          this.state.activeFilters[filterType].push(filterValue);
        }
      } else {
        if (this.state.activeFilters[filterType]) {
          this.state.activeFilters[filterType] = this.state.activeFilters[filterType]
            .filter(value => value !== filterValue);
          if (this.state.activeFilters[filterType].length === 0) {
            delete this.state.activeFilters[filterType];
          }
        }
      }
    } else {
      // Select/range filter
      if (filterValue) {
        this.state.activeFilters[filterType] = filterValue;
      } else {
        delete this.state.activeFilters[filterType];
      }
    }

    // Update URL and perform search
    this.updateSearchURL();
    await this.performSearch();
  },

  /**
   * Handle sort changes
   */
  async handleSortChange(select) {
    this.state.sortBy = select.value;
    this.state.currentPage = 1;
    
    this.updateSearchURL();
    await this.performSearch();
  },

  /**
   * Handle pagination
   */
  async handlePagination(link) {
    const page = parseInt(link.dataset.page) || 1;
    this.state.currentPage = page;
    
    this.updateSearchURL();
    await this.performSearch();
  },

  /**
   * Perform search with current state
   */
  async performSearch(query = null) {
    if (this.state.isSearching) return;

    this.state.isSearching = true;
    this.state.currentQuery = query || this.state.currentQuery;

    try {
      // Show loading state
      this.showLoadingState();

      // Build search parameters
      const params = this.buildSearchParams();
      
      // Perform search
      const results = await this.fetchSearchResults(params);
      
      // Render results
      this.renderSearchResults(results);
      
      // Update pagination
      this.updatePagination(results);
      
      // Update filters
      this.updateFilters(results);
      
      // Analytics
      this.trackSearchEvent(results);

    } catch (error) {
      console.error('Search error:', error);
      this.showSearchError(error);
    } finally {
      this.state.isSearching = false;
      this.hideLoadingState();
    }
  },

  /**
   * Get search suggestions
   */
  async getSearchSuggestions(query) {
    const cacheKey = `suggestions_${query}`;
    
    // Check cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.config.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const response = await fetch(`${this.config.apiEndpoints.search}?q=${encodeURIComponent(query)}&resources[type]=product&resources[limit]=${this.config.maxSuggestions}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const suggestions = this.processSuggestions(data);
      
      // Cache results
      this.cache.set(cacheKey, {
        data: suggestions,
        timestamp: Date.now()
      });

      return suggestions;
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      return [];
    }
  },

  /**
   * Fetch search results
   */
  async fetchSearchResults(params) {
    const cacheKey = `results_${JSON.stringify(params)}`;
    
    // Check cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.config.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${this.config.apiEndpoints.products}?${queryString}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Cache results
      this.cache.set(cacheKey, {
        data: data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.error('Failed to fetch search results:', error);
      throw error;
    }
  },

  /**
   * Build search parameters
   */
  buildSearchParams() {
    const params = {
      q: this.state.currentQuery,
      type: 'product',
      page: this.state.currentPage,
      limit: this.state.resultsPerPage
    };

    // Add sorting
    if (this.state.sortBy && this.state.sortBy !== 'relevance') {
      params.sort_by = this.state.sortBy;
    }

    // Add filters
    Object.entries(this.state.activeFilters).forEach(([type, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => {
          params[`filter.${type}`] = v;
        });
      } else {
        params[`filter.${type}`] = value;
      }
    });

    return params;
  },

  /**
   * Process suggestions data
   */
  processSuggestions(data) {
    const suggestions = [];
    
    if (data.resources && data.resources.results) {
      data.resources.results.forEach(result => {
        suggestions.push({
          type: 'product',
          title: result.title,
          url: result.url,
          image: result.image,
          price: result.price,
          vendor: result.vendor
        });
      });
    }

    // Add popular searches
    if (data.queries && data.queries.length > 0) {
      data.queries.slice(0, 3).forEach(query => {
        suggestions.push({
          type: 'query',
          title: query,
          url: `/search?q=${encodeURIComponent(query)}`
        });
      });
    }

    return suggestions;
  },

  /**
   * Create autocomplete container
   */
  createAutocompleteContainer(input) {
    const container = document.createElement('div');
    container.className = 'search-autocomplete';
    container.style.cssText = `
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 0.5rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      max-height: 300px;
      overflow-y: auto;
      display: none;
    `;

    // Position relative to input
    input.parentElement.style.position = 'relative';
    input.parentElement.appendChild(container);

    return container;
  },

  /**
   * Render autocomplete suggestions
   */
  renderAutocomplete(suggestions, container, query) {
    if (suggestions.length === 0) {
      container.innerHTML = '<div class="search-autocomplete__empty">No suggestions found</div>';
      return;
    }

    const html = suggestions.map((suggestion, index) => {
      const isHighlighted = index === 0;
      const highlightClass = isHighlighted ? 'search-autocomplete__item--highlighted' : '';
      
      if (suggestion.type === 'product') {
        return `
          <div class="search-autocomplete__item search-autocomplete__item--product ${highlightClass}" 
               data-url="${suggestion.url}" data-index="${index}">
            <div class="search-autocomplete__item-image">
              <img src="${suggestion.image || '/assets/no-image.svg'}" alt="${suggestion.title}" loading="lazy">
            </div>
            <div class="search-autocomplete__item-content">
              <div class="search-autocomplete__item-title">${this.highlightQuery(suggestion.title, query)}</div>
              <div class="search-autocomplete__item-meta">
                ${suggestion.vendor ? `<span class="search-autocomplete__item-vendor">${suggestion.vendor}</span>` : ''}
                ${suggestion.price ? `<span class="search-autocomplete__item-price">${suggestion.price}</span>` : ''}
              </div>
            </div>
          </div>
        `;
      } else {
        return `
          <div class="search-autocomplete__item search-autocomplete__item--query ${highlightClass}" 
               data-url="${suggestion.url}" data-index="${index}">
            <div class="search-autocomplete__item-icon">
              <svg viewBox="0 0 24 24"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
            </div>
            <div class="search-autocomplete__item-content">
              <div class="search-autocomplete__item-title">${this.highlightQuery(suggestion.title, query)}</div>
            </div>
          </div>
        `;
      }
    }).join('');

    container.innerHTML = html;

    // Add click handlers
    container.querySelectorAll('.search-autocomplete__item').forEach(item => {
      item.addEventListener('click', () => {
        const url = item.dataset.url;
        if (url) {
          window.location.href = url;
        }
      });
    });
  },

  /**
   * Handle autocomplete keyboard navigation
   */
  handleAutocompleteKeyboard(e, container) {
    const items = container.querySelectorAll('.search-autocomplete__item');
    const highlighted = container.querySelector('.search-autocomplete__item--highlighted');
    
    if (items.length === 0) return;

    let currentIndex = highlighted ? parseInt(highlighted.dataset.index) : -1;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        currentIndex = Math.min(currentIndex + 1, items.length - 1);
        this.highlightAutocompleteItem(items, currentIndex);
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        currentIndex = Math.max(currentIndex - 1, 0);
        this.highlightAutocompleteItem(items, currentIndex);
        break;
        
      case 'Enter':
        e.preventDefault();
        if (highlighted) {
          const url = highlighted.dataset.url;
          if (url) {
            window.location.href = url;
          }
        }
        break;
        
      case 'Escape':
        this.hideAutocomplete(container);
        break;
    }
  },

  /**
   * Highlight autocomplete item
   */
  highlightAutocompleteItem(items, index) {
    items.forEach((item, i) => {
      item.classList.toggle('search-autocomplete__item--highlighted', i === index);
    });
  },

  /**
   * Show autocomplete
   */
  showAutocomplete(container) {
    container.style.display = 'block';
  },

  /**
   * Hide autocomplete
   */
  hideAutocomplete(container) {
    container.style.display = 'none';
  },

  /**
   * Highlight query in text
   */
  highlightQuery(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  },

  /**
   * Render search results
   */
  renderSearchResults(results) {
    const container = document.querySelector('.search-results');
    if (!container) return;

    if (results.results_count === 0) {
      container.innerHTML = this.renderNoResults();
      return;
    }

    const html = results.results.map(result => this.renderSearchResult(result)).join('');
    container.innerHTML = html;

    // Add event listeners for quick actions
    this.setupResultEventListeners();
  },

  /**
   * Render individual search result
   */
  renderSearchResult(result) {
    return `
      <div class="search-result" data-product-id="${result.id}">
        <div class="search-result__image">
          <a href="${result.url}">
            <img src="${result.featured_image || '/assets/no-image.svg'}" 
                 alt="${result.title}" 
                 loading="lazy">
          </a>
        </div>
        <div class="search-result__content">
          <h3 class="search-result__title">
            <a href="${result.url}">${result.title}</a>
          </h3>
          <div class="search-result__meta">
            ${result.vendor ? `<span class="search-result__vendor">${result.vendor}</span>` : ''}
            ${result.price ? `<span class="search-result__price">${result.price}</span>` : ''}
          </div>
          <div class="search-result__actions">
            <button class="search-result__quick-add" data-product-id="${result.id}">
              Quick Add
            </button>
            <button class="search-result__wishlist" data-product-id="${result.id}">
              ♥
            </button>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Render no results state
   */
  renderNoResults() {
    return `
      <div class="search-no-results">
        <div class="search-no-results__icon">
          <svg viewBox="0 0 24 24"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
        </div>
        <h3 class="search-no-results__title">No results found</h3>
        <p class="search-no-results__text">Try adjusting your search or filters</p>
        <div class="search-no-results__suggestions">
          <h4>Popular searches:</h4>
          <div class="search-no-results__tags">
            ${this.getPopularSearches().map(term => 
              `<a href="/search?q=${encodeURIComponent(term)}" class="search-no-results__tag">${term}</a>`
            ).join('')}
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Setup result event listeners
   */
  setupResultEventListeners() {
    // Quick add buttons
    document.querySelectorAll('.search-result__quick-add').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleQuickAdd(button.dataset.productId);
      });
    });

    // Wishlist buttons
    document.querySelectorAll('.search-result__wishlist').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleWishlist(button.dataset.productId);
      });
    });
  },

  /**
   * Handle quick add
   */
  async handleQuickAdd(productId) {
    try {
      const result = await window.cartUtils.addToCart(productId, 1);
      if (result.success) {
        this.showNotification('Product added to cart!', 'success');
      } else {
        this.showNotification('Failed to add product to cart', 'error');
      }
    } catch (error) {
      console.error('Quick add error:', error);
      this.showNotification('Failed to add product to cart', 'error');
    }
  },

  /**
   * Handle wishlist
   */
  handleWishlist(productId) {
    // Implement wishlist functionality
    this.showNotification('Added to wishlist!', 'success');
  },

  /**
   * Show notification
   */
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `search-notification search-notification--${type}`;
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
   * Update search URL
   */
  updateSearchURL(query = null) {
    const url = new URL(window.location);
    const searchQuery = query || this.state.currentQuery;
    
    if (searchQuery) {
      url.searchParams.set('q', searchQuery);
    } else {
      url.searchParams.delete('q');
    }

    // Add filters
    Object.entries(this.state.activeFilters).forEach(([type, value]) => {
      if (Array.isArray(value)) {
        url.searchParams.delete(`filter.${type}`);
        value.forEach(v => {
          url.searchParams.append(`filter.${type}`, v);
        });
      } else {
        url.searchParams.set(`filter.${type}`, value);
      }
    });

    // Add sorting
    if (this.state.sortBy && this.state.sortBy !== 'relevance') {
      url.searchParams.set('sort_by', this.state.sortBy);
    } else {
      url.searchParams.delete('sort_by');
    }

    // Add page
    if (this.state.currentPage > 1) {
      url.searchParams.set('page', this.state.currentPage);
    } else {
      url.searchParams.delete('page');
    }

    // Update URL without page reload
    window.history.replaceState({}, '', url);
  },

  /**
   * Show loading state
   */
  showLoadingState() {
    const container = document.querySelector('.search-results');
    if (container) {
      container.innerHTML = '<div class="search-loading">Loading...</div>';
    }
  },

  /**
   * Hide loading state
   */
  hideLoadingState() {
    const loading = document.querySelector('.search-loading');
    if (loading) {
      loading.remove();
    }
  },

  /**
   * Show search error
   */
  showSearchError(error) {
    const container = document.querySelector('.search-results');
    if (container) {
      container.innerHTML = `
        <div class="search-error">
          <h3>Search Error</h3>
          <p>Something went wrong. Please try again.</p>
          <button onclick="window.searchUtils.performSearch()">Retry</button>
        </div>
      `;
    }
  },

  /**
   * Clear search
   */
  clearSearch() {
    this.state.currentQuery = '';
    this.state.activeFilters = {};
    this.state.sortBy = 'relevance';
    this.state.currentPage = 1;

    // Clear input
    const searchInput = document.querySelector('input[name="q"]');
    if (searchInput) {
      searchInput.value = '';
    }

    // Clear filters
    this.clearAllFilters();

    // Update URL
    this.updateSearchURL();

    // Hide autocomplete
    document.querySelectorAll('.search-autocomplete').forEach(container => {
      this.hideAutocomplete(container);
    });
  },

  /**
   * Clear all filters
   */
  clearAllFilters() {
    this.state.activeFilters = {};
    
    // Uncheck all filter inputs
    document.querySelectorAll('.search-filters input[type="checkbox"]').forEach(input => {
      input.checked = false;
    });
    
    // Reset select inputs
    document.querySelectorAll('.search-filters select').forEach(select => {
      select.selectedIndex = 0;
    });
  },

  /**
   * Toggle mobile filters
   */
  toggleMobileFilters() {
    const filters = document.querySelector('.search-filters');
    if (filters) {
      filters.classList.toggle('search-filters--mobile-open');
    }
  },

  /**
   * Focus search input
   */
  focusSearch() {
    const searchInput = document.querySelector('input[name="q"]');
    if (searchInput) {
      searchInput.focus();
    }
  },

  /**
   * Close search
   */
  closeSearch() {
    document.querySelectorAll('.search-autocomplete').forEach(container => {
      this.hideAutocomplete(container);
    });
  },

  /**
   * Toggle clear button
   */
  toggleClearButton(query) {
    const clearBtn = document.querySelector('[data-clear-search]');
    if (clearBtn) {
      clearBtn.style.display = query ? 'block' : 'none';
    }
  },

  /**
   * Load search history
   */
  loadSearchHistory() {
    try {
      const history = localStorage.getItem('searchHistory');
      if (history) {
        this.searchHistory = JSON.parse(history);
      } else {
        this.searchHistory = [];
      }
    } catch (error) {
      this.searchHistory = [];
    }
  },

  /**
   * Add to search history
   */
  addToSearchHistory(query) {
    if (!query || query.length < 2) return;

    // Remove if already exists
    this.searchHistory = this.searchHistory.filter(item => item !== query);
    
    // Add to beginning
    this.searchHistory.unshift(query);
    
    // Keep only last 10
    this.searchHistory = this.searchHistory.slice(0, 10);
    
    // Save to localStorage
    try {
      localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  },

  /**
   * Get popular searches
   */
  getPopularSearches() {
    return ['sustainable', 'organic', 'eco-friendly', 'natural', 'green'];
  },

  /**
   * Track search event
   */
  trackSearchEvent(results) {
    // Implement analytics tracking
    if (window.gtag) {
      window.gtag('event', 'search', {
        search_term: this.state.currentQuery,
        results_count: results.results_count
      });
    }
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
  },

  /**
   * Initialize filters
   */
  initializeFilters() {
    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    
    // Set current query
    this.state.currentQuery = urlParams.get('q') || '';
    
    // Set current page
    this.state.currentPage = parseInt(urlParams.get('page')) || 1;
    
    // Set sort
    this.state.sortBy = urlParams.get('sort_by') || 'relevance';
    
    // Set filters
    urlParams.forEach((value, key) => {
      if (key.startsWith('filter.')) {
        const filterType = key.replace('filter.', '');
        this.state.activeFilters[filterType] = value;
      }
    });
  },

  /**
   * Update pagination
   */
  updatePagination(results) {
    const pagination = document.querySelector('.search-pagination');
    if (!pagination) return;

    const totalPages = Math.ceil(results.results_count / this.state.resultsPerPage);
    const currentPage = this.state.currentPage;

    let html = '<div class="search-pagination__wrapper">';
    
    // Previous button
    if (currentPage > 1) {
      html += `<a href="#" class="search-pagination__prev" data-page="${currentPage - 1}">Previous</a>`;
    }
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      if (i === currentPage) {
        html += `<span class="search-pagination__current">${i}</span>`;
      } else {
        html += `<a href="#" class="search-pagination__page" data-page="${i}">${i}</a>`;
      }
    }
    
    // Next button
    if (currentPage < totalPages) {
      html += `<a href="#" class="search-pagination__next" data-page="${currentPage + 1}">Next</a>`;
    }
    
    html += '</div>';
    pagination.innerHTML = html;
  },

  /**
   * Update filters
   */
  updateFilters(results) {
    // Update filter counts and availability
    // This would be implemented based on the actual filter structure
  }
};

// Initialize search utilities when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  window.searchUtils.init();
});
