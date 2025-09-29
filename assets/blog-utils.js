/**
 * Enhanced Blog Utilities - Advanced blog functionality
 * Provides article pages, blog listing, related articles, and performance optimization
 */

window.blogUtils = {
  // Configuration
  config: {
    debounceDelay: 300,
    lazyLoadDelay: 100,
    infiniteScrollThreshold: 200,
    relatedArticlesCount: 3,
    cacheTime: 300000, // 5 minutes
    enableInfiniteScroll: true,
    enableLazyLoading: true,
    enableRelatedArticles: true,
    enableSocialSharing: true,
    enableReadingTime: true,
    enableTableOfContents: true
  },

  // State management
  state: {
    currentBlog: null,
    currentArticle: null,
    articles: [],
    relatedArticles: [],
    isLoading: false,
    hasMorePages: true,
    currentPage: 1,
    totalPages: 1,
    readingTime: 0,
    tableOfContents: [],
    socialShares: {
      facebook: 0,
      twitter: 0,
      linkedin: 0,
      pinterest: 0
    }
  },

  // Cache for performance
  cache: {
    articles: new Map(),
    relatedArticles: new Map(),
    socialShares: new Map(),
    readingTime: new Map()
  },

  /**
   * Initialize blog utilities
   */
  init() {
    this.initializeBlogData();
    this.setupBlogListing();
    this.setupArticlePage();
    this.setupRelatedArticles();
    this.setupSocialSharing();
    this.setupReadingTime();
    this.setupTableOfContents();
    this.setupInfiniteScroll();
    this.setupLazyLoading();
    this.setupAccessibility();
    this.setupPerformanceOptimizations();
  },

  /**
   * Initialize blog data from page
   */
  initializeBlogData() {
    // Get blog data from page
    if (window.blog) {
      this.state.currentBlog = window.blog;
    }
    
    if (window.article) {
      this.state.currentArticle = window.article;
    }
    
    // Get articles from page
    this.initializeArticles();
    
    // Get pagination info
    this.initializePagination();
  },

  /**
   * Initialize articles from page
   */
  initializeArticles() {
    const articleElements = document.querySelectorAll('[data-article-id]');
    this.state.articles = Array.from(articleElements).map(element => {
      const articleId = element.dataset.articleId;
      return {
        id: articleId,
        element: element,
        data: this.extractArticleData(element)
      };
    });
  },

  /**
   * Extract article data from element
   */
  extractArticleData(element) {
    const title = element.querySelector('.blog__article-title, .article__title');
    const excerpt = element.querySelector('.blog__article-excerpt, .article__excerpt');
    const author = element.querySelector('.blog__article-author, .article__author');
    const date = element.querySelector('.blog__article-date, .article__date');
    const image = element.querySelector('.blog__article-image, .article__image');
    const tags = element.querySelectorAll('.blog__article-tag, .article__tag');
    
    return {
      title: title ? title.textContent.trim() : '',
      excerpt: excerpt ? excerpt.textContent.trim() : '',
      author: author ? author.textContent.trim() : '',
      date: date ? date.textContent.trim() : '',
      image: image ? image.src : '',
      tags: Array.from(tags).map(tag => tag.textContent.trim()),
      element: element
    };
  },

  /**
   * Initialize pagination
   */
  initializePagination() {
    const paginationElement = document.querySelector('.blog__pagination, .article__pagination');
    if (paginationElement) {
      const currentPageElement = paginationElement.querySelector('.blog__pagination-number--current, .article__pagination-number--current');
      const totalPagesElement = paginationElement.querySelectorAll('.blog__pagination-number, .article__pagination-number');
      
      if (currentPageElement) {
        this.state.currentPage = parseInt(currentPageElement.textContent);
      }
      
      if (totalPagesElement.length > 0) {
        this.state.totalPages = totalPagesElement.length;
      }
    }
  },

  /**
   * Setup blog listing functionality
   */
  setupBlogListing() {
    // Article cards
    this.setupArticleCards();
    
    // Pagination
    this.setupBlogPagination();
    
    // Search and filtering
    this.setupBlogSearch();
    
    // Category filtering
    this.setupBlogCategories();
    
    // Tag filtering
    this.setupBlogTags();
  },

  /**
   * Setup article cards
   */
  setupArticleCards() {
    const articleCards = document.querySelectorAll('.blog__article-card, .article__card');
    
    articleCards.forEach(card => {
      // Add hover effects
      card.addEventListener('mouseenter', () => {
        this.handleArticleCardHover(card, true);
      });
      
      card.addEventListener('mouseleave', () => {
        this.handleArticleCardHover(card, false);
      });
      
      // Add click tracking
      card.addEventListener('click', () => {
        this.trackArticleClick(card);
      });
    });
  },

  /**
   * Handle article card hover
   */
  handleArticleCardHover(card, isHovering) {
    const image = card.querySelector('.blog__article-image, .article__image');
    const title = card.querySelector('.blog__article-title, .article__title');
    
    if (isHovering) {
      if (image) {
        image.style.transform = 'scale(1.05)';
      }
      if (title) {
        title.style.color = 'var(--color-primary)';
      }
    } else {
      if (image) {
        image.style.transform = 'scale(1)';
      }
      if (title) {
        title.style.color = '';
      }
    }
  },

  /**
   * Track article click
   */
  trackArticleClick(card) {
    const articleId = card.dataset.articleId;
    const articleTitle = card.querySelector('.blog__article-title, .article__title')?.textContent;
    
    if (this.config.enableAnalytics) {
      // Track article click
      if (window.gtag) {
        window.gtag('event', 'article_click', {
          article_id: articleId,
          article_title: articleTitle
        });
      }
    }
  },

  /**
   * Setup blog pagination
   */
  setupBlogPagination() {
    // Previous/Next buttons
    const prevButton = document.querySelector('[data-pagination="prev"]');
    const nextButton = document.querySelector('[data-pagination="next"]');
    
    if (prevButton) {
      prevButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleBlogPagination('prev');
      });
    }
    
    if (nextButton) {
      nextButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleBlogPagination('next');
      });
    }
    
    // Page numbers
    const pageNumbers = document.querySelectorAll('[data-page]');
    pageNumbers.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const page = parseInt(e.target.dataset.page);
        this.handleBlogPagination(page);
      });
    });
    
    // Load more button
    const loadMoreButton = document.querySelector('[data-load-more]');
    if (loadMoreButton) {
      loadMoreButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleLoadMoreArticles();
      });
    }
  },

  /**
   * Handle blog pagination
   */
  handleBlogPagination(direction) {
    if (this.state.isLoading) return;
    
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
      this.navigateToBlogPage(newPage);
    }
  },

  /**
   * Navigate to blog page
   */
  navigateToBlogPage(page) {
    const url = new URL(window.location);
    url.searchParams.set('page', page);
    window.location.href = url.toString();
  },

  /**
   * Handle load more articles
   */
  async handleLoadMoreArticles() {
    if (this.state.isLoading || !this.state.hasMorePages) return;
    
    this.state.isLoading = true;
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
        this.appendMoreArticles(html);
        this.state.currentPage = nextPage;
        this.updateLoadMoreButton();
      } else {
        throw new Error('Failed to load more articles');
      }
    } catch (error) {
      console.error('Load more articles error:', error);
      this.showLoadMoreError();
    } finally {
      this.state.isLoading = false;
      this.hideLoadMoreLoading();
    }
  },

  /**
   * Append more articles
   */
  appendMoreArticles(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const newArticles = doc.querySelectorAll('[data-article-id]');
    const articlesContainer = document.querySelector('[data-blog-articles]');
    
    if (articlesContainer && newArticles.length > 0) {
      newArticles.forEach(article => {
        articlesContainer.appendChild(article);
      });
      
      // Re-initialize articles
      this.initializeArticles();
      
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
   * Setup blog search
   */
  setupBlogSearch() {
    const searchInput = document.querySelector('[data-blog-search]');
    if (searchInput) {
      searchInput.addEventListener('input', this.debounce(() => {
        this.handleBlogSearch(searchInput.value);
      }, this.config.debounceDelay));
    }
  },

  /**
   * Handle blog search
   */
  handleBlogSearch(query) {
    if (query.length < 2) {
      this.clearBlogSearch();
      return;
    }
    
    this.filterArticlesByQuery(query);
  },

  /**
   * Filter articles by query
   */
  filterArticlesByQuery(query) {
    const articles = document.querySelectorAll('[data-article-id]');
    const queryLower = query.toLowerCase();
    
    articles.forEach(article => {
      const title = article.querySelector('.blog__article-title, .article__title')?.textContent.toLowerCase();
      const excerpt = article.querySelector('.blog__article-excerpt, .article__excerpt')?.textContent.toLowerCase();
      const tags = Array.from(article.querySelectorAll('.blog__article-tag, .article__tag')).map(tag => tag.textContent.toLowerCase());
      
      const matches = title?.includes(queryLower) || 
                     excerpt?.includes(queryLower) || 
                     tags.some(tag => tag.includes(queryLower));
      
      article.style.display = matches ? 'block' : 'none';
    });
    
    this.updateSearchResults(query);
  },

  /**
   * Clear blog search
   */
  clearBlogSearch() {
    const articles = document.querySelectorAll('[data-article-id]');
    articles.forEach(article => {
      article.style.display = 'block';
    });
    
    this.updateSearchResults('');
  },

  /**
   * Update search results
   */
  updateSearchResults(query) {
    const resultsContainer = document.querySelector('[data-search-results]');
    if (resultsContainer) {
      const visibleArticles = document.querySelectorAll('[data-article-id]:not([style*="display: none"])');
      const totalArticles = document.querySelectorAll('[data-article-id]').length;
      
      if (query) {
        resultsContainer.textContent = `Found ${visibleArticles.length} of ${totalArticles} articles for "${query}"`;
      } else {
        resultsContainer.textContent = `Showing ${totalArticles} articles`;
      }
    }
  },

  /**
   * Setup blog categories
   */
  setupBlogCategories() {
    const categoryButtons = document.querySelectorAll('[data-blog-category]');
    
    categoryButtons.forEach(button => {
      button.addEventListener('click', () => {
        const category = button.dataset.blogCategory;
        this.filterArticlesByCategory(category);
        this.updateActiveCategory(button);
      });
    });
  },

  /**
   * Filter articles by category
   */
  filterArticlesByCategory(category) {
    const articles = document.querySelectorAll('[data-article-id]');
    
    articles.forEach(article => {
      const articleCategory = article.dataset.articleCategory;
      const matches = category === 'all' || articleCategory === category;
      
      article.style.display = matches ? 'block' : 'none';
    });
  },

  /**
   * Update active category
   */
  updateActiveCategory(activeButton) {
    const categoryButtons = document.querySelectorAll('[data-blog-category]');
    categoryButtons.forEach(button => {
      button.classList.toggle('active', button === activeButton);
    });
  },

  /**
   * Setup blog tags
   */
  setupBlogTags() {
    const tagButtons = document.querySelectorAll('[data-blog-tag]');
    
    tagButtons.forEach(button => {
      button.addEventListener('click', () => {
        const tag = button.dataset.blogTag;
        this.filterArticlesByTag(tag);
        this.updateActiveTag(button);
      });
    });
  },

  /**
   * Filter articles by tag
   */
  filterArticlesByTag(tag) {
    const articles = document.querySelectorAll('[data-article-id]');
    
    articles.forEach(article => {
      const articleTags = article.dataset.articleTags ? article.dataset.articleTags.split(',') : [];
      const matches = tag === 'all' || articleTags.includes(tag);
      
      article.style.display = matches ? 'block' : 'none';
    });
  },

  /**
   * Update active tag
   */
  updateActiveTag(activeButton) {
    const tagButtons = document.querySelectorAll('[data-blog-tag]');
    tagButtons.forEach(button => {
      button.classList.toggle('active', button === activeButton);
    });
  },

  /**
   * Setup article page functionality
   */
  setupArticlePage() {
    if (!this.state.currentArticle) return;
    
    // Article content
    this.setupArticleContent();
    
    // Article navigation
    this.setupArticleNavigation();
    
    // Article sharing
    this.setupArticleSharing();
    
    // Article comments
    this.setupArticleComments();
  },

  /**
   * Setup article content
   */
  setupArticleContent() {
    const articleContent = document.querySelector('.article__content, .blog__article-content');
    if (articleContent) {
      // Add reading progress
      this.setupReadingProgress();
      
      // Add table of contents
      if (this.config.enableTableOfContents) {
        this.generateTableOfContents(articleContent);
      }
      
      // Add reading time
      if (this.config.enableReadingTime) {
        this.calculateReadingTime(articleContent);
      }
    }
  },

  /**
   * Setup reading progress
   */
  setupReadingProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'article__reading-progress';
    progressBar.innerHTML = '<div class="article__reading-progress-bar"></div>';
    document.body.appendChild(progressBar);
    
    const progressBarElement = progressBar.querySelector('.article__reading-progress-bar');
    
    window.addEventListener('scroll', () => {
      const article = document.querySelector('.article__content, .blog__article-content');
      if (!article) return;
      
      const articleTop = article.offsetTop;
      const articleHeight = article.offsetHeight;
      const windowHeight = window.innerHeight;
      const scrollTop = window.pageYOffset;
      
      const progress = Math.min(100, Math.max(0, (scrollTop - articleTop + windowHeight) / articleHeight * 100));
      progressBarElement.style.width = `${progress}%`;
    });
  },

  /**
   * Generate table of contents
   */
  generateTableOfContents(articleContent) {
    const headings = articleContent.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headings.length === 0) return;
    
    const toc = document.createElement('div');
    toc.className = 'article__table-of-contents';
    toc.innerHTML = '<h3>Table of Contents</h3><ul></ul>';
    
    const tocList = toc.querySelector('ul');
    
    headings.forEach((heading, index) => {
      const id = `heading-${index}`;
      heading.id = id;
      
      const li = document.createElement('li');
      li.className = `article__toc-item article__toc-item--${heading.tagName.toLowerCase()}`;
      
      const a = document.createElement('a');
      a.href = `#${id}`;
      a.textContent = heading.textContent;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        heading.scrollIntoView({ behavior: 'smooth' });
      });
      
      li.appendChild(a);
      tocList.appendChild(li);
    });
    
    articleContent.insertBefore(toc, articleContent.firstChild);
  },

  /**
   * Calculate reading time
   */
  calculateReadingTime(articleContent) {
    const text = articleContent.textContent;
    const wordsPerMinute = 200;
    const words = text.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    
    this.state.readingTime = minutes;
    
    const readingTimeElement = document.querySelector('[data-reading-time]');
    if (readingTimeElement) {
      readingTimeElement.textContent = `${minutes} min read`;
    }
  },

  /**
   * Setup article navigation
   */
  setupArticleNavigation() {
    const prevButton = document.querySelector('[data-article-nav="prev"]');
    const nextButton = document.querySelector('[data-article-nav="next"]');
    
    if (prevButton) {
      prevButton.addEventListener('click', () => {
        this.navigateToArticle('prev');
      });
    }
    
    if (nextButton) {
      nextButton.addEventListener('click', () => {
        this.navigateToArticle('next');
      });
    }
  },

  /**
   * Navigate to article
   */
  navigateToArticle(direction) {
    const currentArticle = this.state.currentArticle;
    if (!currentArticle) return;
    
    // This would typically fetch the next/previous article from the server
    // For now, we'll just show a message
    this.showNotification(`Navigate to ${direction} article`, 'info');
  },

  /**
   * Setup article sharing
   */
  setupArticleSharing() {
    if (!this.config.enableSocialSharing) return;
    
    const shareButtons = document.querySelectorAll('[data-share]');
    
    shareButtons.forEach(button => {
      button.addEventListener('click', () => {
        const platform = button.dataset.share;
        this.shareArticle(platform);
      });
    });
  },

  /**
   * Share article
   */
  shareArticle(platform) {
    const article = this.state.currentArticle;
    if (!article) return;
    
    const url = window.location.href;
    const title = article.title;
    const description = article.excerpt;
    const image = article.image;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'pinterest':
        shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(image)}&description=${encodeURIComponent(description)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(description + '\n\n' + url)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      this.trackSocialShare(platform);
    }
  },

  /**
   * Track social share
   */
  trackSocialShare(platform) {
    if (this.config.enableAnalytics) {
      if (window.gtag) {
        window.gtag('event', 'share', {
          method: platform,
          content_type: 'article',
          item_id: this.state.currentArticle?.id
        });
      }
    }
  },

  /**
   * Setup article comments
   */
  setupArticleComments() {
    const commentForm = document.querySelector('[data-comment-form]');
    if (commentForm) {
      commentForm.addEventListener('submit', (e) => {
        this.handleCommentSubmit(e);
      });
    }
  },

  /**
   * Handle comment submit
   */
  async handleCommentSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        this.showNotification('Comment submitted successfully!', 'success');
        form.reset();
        // Reload comments section
        this.loadComments();
      } else {
        throw new Error('Failed to submit comment');
      }
    } catch (error) {
      console.error('Comment submit error:', error);
      this.showNotification('Failed to submit comment. Please try again.', 'error');
    }
  },

  /**
   * Load comments
   */
  async loadComments() {
    const commentsContainer = document.querySelector('[data-comments]');
    if (!commentsContainer) return;
    
    try {
      const response = await fetch(window.location.href, {
        method: 'GET',
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      if (response.ok) {
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newComments = doc.querySelector('[data-comments]');
        
        if (newComments) {
          commentsContainer.innerHTML = newComments.innerHTML;
        }
      }
    } catch (error) {
      console.error('Load comments error:', error);
    }
  },

  /**
   * Setup related articles
   */
  setupRelatedArticles() {
    if (!this.config.enableRelatedArticles || !this.state.currentArticle) return;
    
    this.loadRelatedArticles();
  },

  /**
   * Load related articles
   */
  async loadRelatedArticles() {
    const article = this.state.currentArticle;
    if (!article) return;
    
    try {
      // This would typically fetch related articles from the server
      // For now, we'll simulate loading related articles
      await new Promise(resolve => setTimeout(resolve, 500));
      
      this.renderRelatedArticles();
    } catch (error) {
      console.error('Load related articles error:', error);
    }
  },

  /**
   * Render related articles
   */
  renderRelatedArticles() {
    const relatedContainer = document.querySelector('[data-related-articles]');
    if (!relatedContainer) return;
    
    // This would typically render actual related articles
    // For now, we'll show a placeholder
    relatedContainer.innerHTML = `
      <div class="related-articles">
        <h3>Related Articles</h3>
        <div class="related-articles__grid">
          <div class="related-articles__placeholder">
            <p>Related articles will be loaded here</p>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Setup infinite scroll
   */
  setupInfiniteScroll() {
    if (!this.config.enableInfiniteScroll) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && this.state.hasMorePages && !this.state.isLoading) {
          this.handleLoadMoreArticles();
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
      rootMargin: '100px'
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
    liveRegion.id = 'blog-announcements';
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
      // Escape key to close modals
      if (e.key === 'Escape') {
        const modal = document.querySelector('.modal.active');
        if (modal) {
          this.closeModal(modal);
        }
      }
    });
  },

  /**
   * Setup focus management
   */
  setupFocusManagement() {
    // Focus management for modals
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
      modal.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          this.trapFocusInModal(e, modal);
        }
      });
    });
  },

  /**
   * Trap focus in modal
   */
  trapFocusInModal(e, modal) {
    const focusableElements = modal.querySelectorAll(
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
    // Monitor page load time
    const loadStartTime = performance.now();
    
    window.addEventListener('load', () => {
      const loadEndTime = performance.now();
      const loadTime = loadEndTime - loadStartTime;
      console.log(`Blog page loaded in ${loadTime}ms`);
    });
  },

  /**
   * Show load more loading
   */
  showLoadMoreLoading() {
    const loadMoreButton = document.querySelector('[data-load-more]');
    if (loadMoreButton) {
      const text = loadMoreButton.querySelector('.blog__load-more-text, .article__load-more-text');
      const spinner = loadMoreButton.querySelector('.blog__load-more-spinner, .article__load-more-spinner');
      
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
      const text = loadMoreButton.querySelector('.blog__load-more-text, .article__load-more-text');
      const spinner = loadMoreButton.querySelector('.blog__load-more-spinner, .article__load-more-spinner');
      
      if (text) text.style.display = 'inline-block';
      if (spinner) spinner.style.display = 'none';
      
      loadMoreButton.disabled = false;
    }
  },

  /**
   * Show load more error
   */
  showLoadMoreError() {
    this.showNotification('Failed to load more articles. Please try again.', 'error');
  },

  /**
   * Show notification
   */
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `blog-notification blog-notification--${type}`;
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
    const liveRegion = document.getElementById('blog-announcements');
    if (liveRegion) {
      liveRegion.textContent = message;
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
  }
};

// Initialize blog utilities when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  window.blogUtils.init();
});
