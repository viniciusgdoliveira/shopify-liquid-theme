/**
 * Accessibility Enhancement Script
 * Provides keyboard navigation, screen reader support, and accessibility features
 */

class AccessibilityEnhancer {
  constructor() {
    this.init();
  }

  init() {
    this.setupKeyboardNavigation();
    this.setupScreenReaderSupport();
    this.setupFocusManagement();
    this.setupAnnouncements();
    this.setupReducedMotion();
    this.setupHighContrast();
  }

  /**
   * Setup keyboard navigation for interactive elements
   */
  setupKeyboardNavigation() {
    // Add keyboard support for custom buttons
    document.addEventListener('keydown', (e) => {
      // Handle Enter key on custom buttons
      if (e.key === 'Enter' && e.target.classList.contains('btn')) {
        e.target.click();
      }

      // Handle Escape key to close modals/drawers
      if (e.key === 'Escape') {
        this.closeModals();
      }

      // Handle Tab key for better focus management
      if (e.key === 'Tab') {
        this.handleTabNavigation(e);
      }
    });

    // Add keyboard support for dropdowns
    this.setupDropdownKeyboardSupport();
  }

  /**
   * Setup screen reader support
   */
  setupScreenReaderSupport() {
    // Announce dynamic content changes
    this.setupLiveRegions();
    
    // Add proper labels to form elements
    this.enhanceFormLabels();
    
    // Add descriptions to interactive elements
    this.enhanceInteractiveElements();
  }

  /**
   * Setup focus management
   */
  setupFocusManagement() {
    // Trap focus in modals
    this.setupFocusTrap();
    
    // Restore focus after modal closes
    this.setupFocusRestore();
    
    // Manage focus for dynamic content
    this.setupDynamicFocus();
  }

  /**
   * Setup announcements for screen readers
   */
  setupAnnouncements() {
    this.announcementsContainer = document.getElementById('announcements');
    
    if (!this.announcementsContainer) {
      this.announcementsContainer = document.createElement('div');
      this.announcementsContainer.id = 'announcements';
      this.announcementsContainer.className = 'sr-only';
      this.announcementsContainer.setAttribute('aria-live', 'polite');
      this.announcementsContainer.setAttribute('aria-atomic', 'true');
      document.body.appendChild(this.announcementsContainer);
    }
  }

  /**
   * Announce message to screen readers
   */
  announce(message) {
    if (this.announcementsContainer) {
      this.announcementsContainer.textContent = message;
      // Clear after announcement
      setTimeout(() => {
        this.announcementsContainer.textContent = '';
      }, 1000);
    }
  }

  /**
   * Setup reduced motion support
   */
  setupReducedMotion() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    if (prefersReducedMotion.matches) {
      document.documentElement.classList.add('reduced-motion');
    }

    prefersReducedMotion.addEventListener('change', (e) => {
      if (e.matches) {
        document.documentElement.classList.add('reduced-motion');
      } else {
        document.documentElement.classList.remove('reduced-motion');
      }
    });
  }

  /**
   * Setup high contrast support
   */
  setupHighContrast() {
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)');
    
    if (prefersHighContrast.matches) {
      document.documentElement.classList.add('high-contrast');
    }

    prefersHighContrast.addEventListener('change', (e) => {
      if (e.matches) {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
      }
    });
  }

  /**
   * Setup dropdown keyboard support
   */
  setupDropdownKeyboardSupport() {
    const dropdowns = document.querySelectorAll('[data-dropdown]');
    
    dropdowns.forEach(dropdown => {
      const trigger = dropdown.querySelector('[data-dropdown-trigger]');
      const menu = dropdown.querySelector('[data-dropdown-menu]');
      
      if (trigger && menu) {
        trigger.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.openDropdown(dropdown);
            this.focusFirstMenuItem(menu);
          }
        });

        menu.addEventListener('keydown', (e) => {
          this.handleMenuKeyboard(e, dropdown);
        });
      }
    });
  }

  /**
   * Handle keyboard navigation in dropdown menus
   */
  handleMenuKeyboard(e, dropdown) {
    const menu = dropdown.querySelector('[data-dropdown-menu]');
    const items = menu.querySelectorAll('[role="menuitem"]');
    const currentIndex = Array.from(items).indexOf(document.activeElement);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % items.length;
        items[nextIndex].focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        const prevIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
        items[prevIndex].focus();
        break;
      case 'Escape':
        e.preventDefault();
        this.closeDropdown(dropdown);
        break;
      case 'Home':
        e.preventDefault();
        items[0].focus();
        break;
      case 'End':
        e.preventDefault();
        items[items.length - 1].focus();
        break;
    }
  }

  /**
   * Open dropdown and announce to screen readers
   */
  openDropdown(dropdown) {
    dropdown.classList.add('open');
    dropdown.setAttribute('aria-expanded', 'true');
    this.announce('Dropdown opened');
  }

  /**
   * Close dropdown and announce to screen readers
   */
  closeDropdown(dropdown) {
    dropdown.classList.remove('open');
    dropdown.setAttribute('aria-expanded', 'false');
    const trigger = dropdown.querySelector('[data-dropdown-trigger]');
    if (trigger) {
      trigger.focus();
    }
    this.announce('Dropdown closed');
  }

  /**
   * Focus first menu item
   */
  focusFirstMenuItem(menu) {
    const firstItem = menu.querySelector('[role="menuitem"]');
    if (firstItem) {
      firstItem.focus();
    }
  }

  /**
   * Handle tab navigation
   */
  handleTabNavigation(e) {
    // Add visual focus indicators
    document.body.classList.add('keyboard-navigation');
    
    // Remove focus indicators on mouse interaction
    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-navigation');
    }, { once: true });
  }

  /**
   * Close all modals and drawers
   */
  closeModals() {
    // Close cart drawer
    const cartDrawer = document.querySelector('[data-cart-drawer]');
    if (cartDrawer && cartDrawer.classList.contains('open')) {
      cartDrawer.classList.remove('open');
      this.announce('Cart drawer closed');
    }

    // Close any open modals
    const modals = document.querySelectorAll('.modal.open');
    modals.forEach(modal => {
      modal.classList.remove('open');
      this.announce('Modal closed');
    });

    // Close any open dropdowns
    const dropdowns = document.querySelectorAll('[data-dropdown].open');
    dropdowns.forEach(dropdown => {
      this.closeDropdown(dropdown);
    });
  }

  /**
   * Setup focus trap for modals
   */
  setupFocusTrap() {
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length > 0) {
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        modal.addEventListener('keydown', (e) => {
          if (e.key === 'Tab') {
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
          }
        });
      }
    });
  }

  /**
   * Setup focus restore after modal closes
   */
  setupFocusRestore() {
    let lastFocusedElement = null;

    // Store focused element when modal opens
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-modal-trigger]')) {
        lastFocusedElement = document.activeElement;
      }
    });

    // Restore focus when modal closes
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lastFocusedElement) {
        setTimeout(() => {
          lastFocusedElement.focus();
          lastFocusedElement = null;
        }, 100);
      }
    });
  }

  /**
   * Setup dynamic focus management
   */
  setupDynamicFocus() {
    // Focus management for AJAX content
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Focus first focusable element in new content
              const focusableElement = node.querySelector(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
              );
              if (focusableElement) {
                focusableElement.focus();
              }
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Setup live regions for dynamic content
   */
  setupLiveRegions() {
    // Create live region for cart updates
    const cartLiveRegion = document.createElement('div');
    cartLiveRegion.id = 'cart-live-region';
    cartLiveRegion.className = 'sr-only';
    cartLiveRegion.setAttribute('aria-live', 'polite');
    cartLiveRegion.setAttribute('aria-atomic', 'true');
    document.body.appendChild(cartLiveRegion);

    // Announce cart updates
    document.addEventListener('cart:updated', (e) => {
      const { itemCount, itemName } = e.detail;
      cartLiveRegion.textContent = `${itemName} added to cart. ${itemCount} items in cart.`;
    });
  }

  /**
   * Enhance form labels
   */
  enhanceFormLabels() {
    const inputs = document.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
      if (!input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby')) {
        const label = document.querySelector(`label[for="${input.id}"]`);
        if (label) {
          input.setAttribute('aria-labelledby', label.id || `label-${input.id}`);
        }
      }
    });
  }

  /**
   * Enhance interactive elements
   */
  enhanceInteractiveElements() {
    // Add proper roles to custom buttons
    const customButtons = document.querySelectorAll('.btn:not([role])');
    customButtons.forEach(button => {
      button.setAttribute('role', 'button');
    });

    // Add proper roles to custom links
    const customLinks = document.querySelectorAll('a:not([href]):not([role])');
    customLinks.forEach(link => {
      link.setAttribute('role', 'button');
      link.setAttribute('tabindex', '0');
    });
  }
}

// Initialize accessibility enhancements when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new AccessibilityEnhancer();
});

// Export for use in other scripts
window.AccessibilityEnhancer = AccessibilityEnhancer;
