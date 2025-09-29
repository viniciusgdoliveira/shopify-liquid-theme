class Header extends HTMLElement {
  constructor() {
    super();
    this.mobileToggle = this.querySelector('.header__mobile-toggle');
    this.mobileMenu = this.querySelector('.header__mobile-menu');
    this.searchToggle = this.querySelector('.header__search-toggle');
    this.searchForm = this.querySelector('.header__search');
    
    this.init();
  }

  init() {
    this.setupMobileMenu();
    this.setupSearch();
    this.setupCartCount();
  }

  setupMobileMenu() {
    if (!this.mobileToggle || !this.mobileMenu) return;
    
    this.mobileToggle.addEventListener('click', () => {
      const isExpanded = this.mobileToggle.getAttribute('aria-expanded') === 'true';
      
      this.mobileToggle.setAttribute('aria-expanded', !isExpanded);
      this.mobileMenu.classList.toggle('active');
      
      // Prevent body scroll when menu is open
      document.body.style.overflow = !isExpanded ? 'hidden' : '';
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.contains(e.target) && this.mobileMenu.classList.contains('active')) {
        this.mobileToggle.setAttribute('aria-expanded', 'false');
        this.mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      }
    });

    // Close mobile menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.mobileMenu.classList.contains('active')) {
        this.mobileToggle.setAttribute('aria-expanded', 'false');
        this.mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  setupSearch() {
    if (!this.searchToggle || !this.searchForm) return;
    
    this.searchToggle.addEventListener('click', () => {
      this.searchForm.classList.toggle('active');
      
      if (this.searchForm.classList.contains('active')) {
        const searchInput = this.searchForm.querySelector('.search-form__input');
        if (searchInput) {
          searchInput.focus();
        }
      }
    });

    // Close search when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.searchForm.contains(e.target) && this.searchForm.classList.contains('active')) {
        this.searchForm.classList.remove('active');
      }
    });
  }

  setupCartCount() {
    // Update cart count when cart changes
    document.addEventListener('cart:updated', (e) => {
      const cartCount = this.querySelector('.header__cart-count');
      if (cartCount && e.detail) {
        cartCount.textContent = e.detail.item_count;
        cartCount.style.display = e.detail.item_count > 0 ? 'block' : 'none';
      }
    });

    // Also listen for cart count updates from cart utilities
    const cartCountElements = document.querySelectorAll('.cart-count, [data-cart-count]');
    cartCountElements.forEach(element => {
      if (element.textContent === '0' || element.textContent === '') {
        element.style.display = 'none';
      }
    });
  }
}

customElements.define('shopify-header', Header);
