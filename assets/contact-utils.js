/**
 * Enhanced Contact Form Utilities - Advanced contact forms, newsletter signup, and customer account features
 * Provides comprehensive form handling, validation, and user experience optimization
 */

window.contactUtils = {
  // Configuration
  config: {
    debounceDelay: 300,
    validationDelay: 500,
    submitTimeout: 30000,
    enableAnalytics: true,
    enableRecaptcha: false,
    enableHoneypot: true,
    enableAutoSave: true,
    enableProgressIndicator: true,
    enableFileUpload: false,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    enableEmailValidation: true,
    enablePhoneValidation: true,
    enableAddressValidation: true,
    enableNewsletterSignup: true,
    enableContactForm: true,
    enableCustomerAccount: true
  },

  // State management
  state: {
    forms: new Map(),
    validation: new Map(),
    autoSave: new Map(),
    progress: new Map(),
    fileUploads: new Map(),
    isSubmitting: false,
    currentForm: null,
    formData: new Map(),
    validationErrors: new Map(),
    successMessages: new Map(),
    errorMessages: new Map()
  },

  // Cache for performance
  cache: {
    validationRules: new Map(),
    formTemplates: new Map(),
    successMessages: new Map(),
    errorMessages: new Map()
  },

  /**
   * Initialize contact form utilities
   */
  init() {
    this.initializeForms();
    this.setupFormValidation();
    this.setupAutoSave();
    this.setupProgressIndicators();
    this.setupFileUploads();
    this.setupNewsletterSignup();
    this.setupContactForms();
    this.setupCustomerAccount();
    this.setupAccessibility();
    this.setupPerformanceOptimizations();
  },

  /**
   * Initialize all forms on the page
   */
  initializeForms() {
    const forms = document.querySelectorAll('form[data-contact-form], form[data-newsletter-form], form[data-customer-form]');
    
    forms.forEach(form => {
      const formId = form.id || `form-${Date.now()}`;
      this.state.forms.set(formId, {
        element: form,
        type: form.dataset.contactForm || form.dataset.newsletterForm || form.dataset.customerForm,
        isValid: false,
        isSubmitting: false,
        validationErrors: new Map(),
        autoSaveData: new Map()
      });
      
      this.setupFormEventListeners(form);
    });
  },

  /**
   * Setup form event listeners
   */
  setupFormEventListeners(form) {
    const formId = form.id || `form-${Date.now()}`;
    const formState = this.state.forms.get(formId);
    
    if (!formState) return;

    // Form submission
    form.addEventListener('submit', (e) => {
      this.handleFormSubmit(e, formId);
    });

    // Input validation
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.addEventListener('blur', () => {
        this.validateField(input, formId);
      });
      
      input.addEventListener('input', this.debounce(() => {
        this.validateField(input, formId);
        if (this.config.enableAutoSave) {
          this.autoSaveForm(formId);
        }
      }, this.config.validationDelay));
    });

    // Form reset
    form.addEventListener('reset', () => {
      this.resetForm(formId);
    });
  },

  /**
   * Setup form validation
   */
  setupFormValidation() {
    // Email validation
    this.cache.validationRules.set('email', {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address'
    });

    // Phone validation
    this.cache.validationRules.set('phone', {
      pattern: /^[\+]?[1-9][\d]{0,15}$/,
      message: 'Please enter a valid phone number'
    });

    // Required field validation
    this.cache.validationRules.set('required', {
      pattern: /^.+$/,
      message: 'This field is required'
    });

    // Minimum length validation
    this.cache.validationRules.set('minLength', {
      pattern: (value, min) => value.length >= min,
      message: (min) => `Minimum ${min} characters required`
    });

    // Maximum length validation
    this.cache.validationRules.set('maxLength', {
      pattern: (value, max) => value.length <= max,
      message: (max) => `Maximum ${max} characters allowed`
    });

    // URL validation
    this.cache.validationRules.set('url', {
      pattern: /^https?:\/\/.+/,
      message: 'Please enter a valid URL'
    });

    // Number validation
    this.cache.validationRules.set('number', {
      pattern: /^\d+$/,
      message: 'Please enter a valid number'
    });

    // Date validation
    this.cache.validationRules.set('date', {
      pattern: /^\d{4}-\d{2}-\d{2}$/,
      message: 'Please enter a valid date (YYYY-MM-DD)'
    });
  },

  /**
   * Validate a single field
   */
  validateField(field, formId) {
    const formState = this.state.forms.get(formId);
    if (!formState) return;

    const fieldName = field.name;
    const fieldValue = field.value.trim();
    const fieldType = field.type;
    const isRequired = field.hasAttribute('required');
    const minLength = field.getAttribute('minlength');
    const maxLength = field.getAttribute('maxlength');
    const pattern = field.getAttribute('pattern');

    let isValid = true;
    let errorMessage = '';

    // Required field validation
    if (isRequired && !fieldValue) {
      isValid = false;
      errorMessage = 'This field is required';
    }

    // Email validation
    if (isValid && fieldType === 'email' && fieldValue) {
      const emailRule = this.cache.validationRules.get('email');
      if (!emailRule.pattern.test(fieldValue)) {
        isValid = false;
        errorMessage = emailRule.message;
      }
    }

    // Phone validation
    if (isValid && fieldType === 'tel' && fieldValue) {
      const phoneRule = this.cache.validationRules.get('phone');
      if (!phoneRule.pattern.test(fieldValue)) {
        isValid = false;
        errorMessage = phoneRule.message;
      }
    }

    // URL validation
    if (isValid && fieldType === 'url' && fieldValue) {
      const urlRule = this.cache.validationRules.get('url');
      if (!urlRule.pattern.test(fieldValue)) {
        isValid = false;
        errorMessage = urlRule.message;
      }
    }

    // Number validation
    if (isValid && fieldType === 'number' && fieldValue) {
      const numberRule = this.cache.validationRules.get('number');
      if (!numberRule.pattern.test(fieldValue)) {
        isValid = false;
        errorMessage = numberRule.message;
      }
    }

    // Date validation
    if (isValid && fieldType === 'date' && fieldValue) {
      const dateRule = this.cache.validationRules.get('date');
      if (!dateRule.pattern.test(fieldValue)) {
        isValid = false;
        errorMessage = dateRule.message;
      }
    }

    // Pattern validation
    if (isValid && pattern && fieldValue) {
      const regex = new RegExp(pattern);
      if (!regex.test(fieldValue)) {
        isValid = false;
        errorMessage = field.getAttribute('data-pattern-message') || 'Invalid format';
      }
    }

    // Length validation
    if (isValid && fieldValue) {
      if (minLength && fieldValue.length < parseInt(minLength)) {
        isValid = false;
        errorMessage = `Minimum ${minLength} characters required`;
      }
      
      if (maxLength && fieldValue.length > parseInt(maxLength)) {
        isValid = false;
        errorMessage = `Maximum ${maxLength} characters allowed`;
      }
    }

    // Update field state
    this.updateFieldState(field, isValid, errorMessage);
    
    // Update form state
    if (isValid) {
      formState.validationErrors.delete(fieldName);
    } else {
      formState.validationErrors.set(fieldName, errorMessage);
    }

    // Update form validity
    this.updateFormValidity(formId);
  },

  /**
   * Update field visual state
   */
  updateFieldState(field, isValid, errorMessage) {
    const fieldContainer = field.closest('.form-field, .input-group');
    
    if (fieldContainer) {
      fieldContainer.classList.remove('form-field--error', 'form-field--success');
      
      if (isValid) {
        fieldContainer.classList.add('form-field--success');
      } else {
        fieldContainer.classList.add('form-field--error');
      }
    }

    // Update field classes
    field.classList.remove('form-input--error', 'form-input--success');
    
    if (isValid) {
      field.classList.add('form-input--success');
    } else {
      field.classList.add('form-input--error');
    }

    // Update error message
    let errorElement = fieldContainer?.querySelector('.form-field__error');
    
    if (errorElement) {
      errorElement.textContent = errorMessage;
      errorElement.style.display = errorMessage ? 'block' : 'none';
    } else if (errorMessage) {
      // Create error element if it doesn't exist
      errorElement = document.createElement('div');
      errorElement.className = 'form-field__error';
      errorElement.textContent = errorMessage;
      errorElement.setAttribute('role', 'alert');
      errorElement.setAttribute('aria-live', 'polite');
      
      if (fieldContainer) {
        fieldContainer.appendChild(errorElement);
      } else {
        field.parentNode.insertBefore(errorElement, field.nextSibling);
      }
    }
  },

  /**
   * Update form validity
   */
  updateFormValidity(formId) {
    const formState = this.state.forms.get(formId);
    if (!formState) return;

    const form = formState.element;
    const requiredFields = form.querySelectorAll('input[required], textarea[required], select[required]');
    const hasErrors = formState.validationErrors.size > 0;
    const allRequiredFilled = Array.from(requiredFields).every(field => field.value.trim() !== '');

    formState.isValid = !hasErrors && allRequiredFilled;

    // Update submit button state
    const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
    if (submitButton) {
      submitButton.disabled = !formState.isValid || formState.isSubmitting;
    }

    // Update form classes
    form.classList.toggle('form--valid', formState.isValid);
    form.classList.toggle('form--invalid', !formState.isValid);
  },

  /**
   * Handle form submission
   */
  async handleFormSubmit(event, formId) {
    event.preventDefault();
    
    const formState = this.state.forms.get(formId);
    if (!formState || formState.isSubmitting) return;

    const form = formState.element;
    const formType = formState.type;

    // Validate all fields
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      this.validateField(input, formId);
    });

    // Check if form is valid
    if (!formState.isValid) {
      this.showFormError(formId, 'Please correct the errors below');
      return;
    }

    // Set submitting state
    formState.isSubmitting = true;
    this.state.isSubmitting = true;
    this.updateFormState(formId);

    try {
      // Show progress indicator
      if (this.config.enableProgressIndicator) {
        this.showProgressIndicator(formId);
      }

      // Handle different form types
      let result;
      switch (formType) {
        case 'contact':
          result = await this.submitContactForm(form);
          break;
        case 'newsletter':
          result = await this.submitNewsletterForm(form);
          break;
        case 'customer':
          result = await this.submitCustomerForm(form);
          break;
        default:
          result = await this.submitGenericForm(form);
      }

      if (result.success) {
        this.showFormSuccess(formId, result.message);
        this.resetForm(formId);
        this.trackFormSubmission(formType, 'success');
      } else {
        throw new Error(result.message || 'Form submission failed');
      }

    } catch (error) {
      console.error('Form submission error:', error);
      this.showFormError(formId, error.message || 'An error occurred. Please try again.');
      this.trackFormSubmission(formType, 'error');
    } finally {
      formState.isSubmitting = false;
      this.state.isSubmitting = false;
      this.updateFormState(formId);
      this.hideProgressIndicator(formId);
    }
  },

  /**
   * Submit contact form
   */
  async submitContactForm(form) {
    const formData = new FormData(form);
    
    // Add honeypot check
    if (this.config.enableHoneypot) {
      const honeypot = form.querySelector('[name="website"]');
      if (honeypot && honeypot.value) {
        throw new Error('Spam detected');
      }
    }

    // Add reCAPTCHA if enabled
    if (this.config.enableRecaptcha) {
      const recaptchaResponse = form.querySelector('[name="g-recaptcha-response"]');
      if (!recaptchaResponse || !recaptchaResponse.value) {
        throw new Error('Please complete the reCAPTCHA verification');
      }
    }

    // Submit form
    const response = await fetch(form.action, {
      method: 'POST',
      body: formData,
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    if (!response.ok) {
      throw new Error('Network error occurred');
    }

    const result = await response.json();
    return result;
  },

  /**
   * Submit newsletter form
   */
  async submitNewsletterForm(form) {
    const formData = new FormData(form);
    const email = formData.get('email');

    // Validate email
    if (!email || !this.isValidEmail(email)) {
      throw new Error('Please enter a valid email address');
    }

    // Submit to newsletter service
    const response = await fetch('/contact#contact_form', {
      method: 'POST',
      body: formData,
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to subscribe to newsletter');
    }

    return {
      success: true,
      message: 'Successfully subscribed to newsletter!'
    };
  },

  /**
   * Submit customer form
   */
  async submitCustomerForm(form) {
    const formData = new FormData(form);
    
    // Submit to Shopify customer API
    const response = await fetch(form.action, {
      method: 'POST',
      body: formData,
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Form submission failed');
    }

    return {
      success: true,
      message: 'Form submitted successfully!'
    };
  },

  /**
   * Submit generic form
   */
  async submitGenericForm(form) {
    const formData = new FormData(form);
    
    const response = await fetch(form.action, {
      method: 'POST',
      body: formData,
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    if (!response.ok) {
      throw new Error('Form submission failed');
    }

    return {
      success: true,
      message: 'Form submitted successfully!'
    };
  },

  /**
   * Setup auto-save functionality
   */
  setupAutoSave() {
    if (!this.config.enableAutoSave) return;

    // Auto-save form data to localStorage
    setInterval(() => {
      this.state.forms.forEach((formState, formId) => {
        if (formState.element && !formState.isSubmitting) {
          this.autoSaveForm(formId);
        }
      });
    }, 30000); // Auto-save every 30 seconds
  },

  /**
   * Auto-save form data
   */
  autoSaveForm(formId) {
    const formState = this.state.forms.get(formId);
    if (!formState) return;

    const form = formState.element;
    const formData = new FormData(form);
    const data = {};

    for (let [key, value] of formData.entries()) {
      data[key] = value;
    }

    formState.autoSaveData = data;
    localStorage.setItem(`form_${formId}`, JSON.stringify(data));
  },

  /**
   * Restore auto-saved form data
   */
  restoreFormData(formId) {
    const formState = this.state.forms.get(formId);
    if (!formState) return;

    const savedData = localStorage.getItem(`form_${formId}`);
    if (!savedData) return;

    try {
      const data = JSON.parse(savedData);
      const form = formState.element;

      Object.entries(data).forEach(([key, value]) => {
        const field = form.querySelector(`[name="${key}"]`);
        if (field && field.type !== 'password') {
          field.value = value;
        }
      });
    } catch (error) {
      console.error('Error restoring form data:', error);
    }
  },

  /**
   * Setup progress indicators
   */
  setupProgressIndicators() {
    if (!this.config.enableProgressIndicator) return;

    // Create progress indicator element
    const progressIndicator = document.createElement('div');
    progressIndicator.className = 'form-progress';
    progressIndicator.innerHTML = `
      <div class="form-progress__bar">
        <div class="form-progress__fill"></div>
      </div>
      <div class="form-progress__text">Submitting...</div>
    `;
    progressIndicator.style.display = 'none';
    document.body.appendChild(progressIndicator);
  },

  /**
   * Show progress indicator
   */
  showProgressIndicator(formId) {
    const progressIndicator = document.querySelector('.form-progress');
    if (progressIndicator) {
      progressIndicator.style.display = 'block';
      progressIndicator.setAttribute('aria-live', 'polite');
    }
  },

  /**
   * Hide progress indicator
   */
  hideProgressIndicator(formId) {
    const progressIndicator = document.querySelector('.form-progress');
    if (progressIndicator) {
      progressIndicator.style.display = 'none';
    }
  },

  /**
   * Setup file uploads
   */
  setupFileUploads() {
    if (!this.config.enableFileUpload) return;

    const fileInputs = document.querySelectorAll('input[type="file"]');
    
    fileInputs.forEach(input => {
      input.addEventListener('change', (e) => {
        this.handleFileUpload(e, input);
      });
    });
  },

  /**
   * Handle file upload
   */
  handleFileUpload(event, input) {
    const files = Array.from(event.target.files);
    const maxSize = this.config.maxFileSize;
    const allowedTypes = this.config.allowedFileTypes;

    files.forEach(file => {
      // Check file size
      if (file.size > maxSize) {
        this.showFileError(input, `File ${file.name} is too large. Maximum size is ${this.formatFileSize(maxSize)}`);
        return;
      }

      // Check file type
      if (!allowedTypes.includes(file.type)) {
        this.showFileError(input, `File type ${file.type} is not allowed`);
        return;
      }

      // Show file preview
      this.showFilePreview(input, file);
    });
  },

  /**
   * Show file preview
   */
  showFilePreview(input, file) {
    const previewContainer = input.parentNode.querySelector('.file-preview');
    if (!previewContainer) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      if (file.type.startsWith('image/')) {
        previewContainer.innerHTML = `
          <img src="${e.target.result}" alt="Preview" class="file-preview__image">
          <div class="file-preview__info">
            <span class="file-preview__name">${file.name}</span>
            <span class="file-preview__size">${this.formatFileSize(file.size)}</span>
          </div>
        `;
      } else {
        previewContainer.innerHTML = `
          <div class="file-preview__info">
            <span class="file-preview__name">${file.name}</span>
            <span class="file-preview__size">${this.formatFileSize(file.size)}</span>
          </div>
        `;
      }
    };
    reader.readAsDataURL(file);
  },

  /**
   * Show file error
   */
  showFileError(input, message) {
    const errorElement = input.parentNode.querySelector('.file-error');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  },

  /**
   * Format file size
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Setup newsletter signup
   */
  setupNewsletterSignup() {
    if (!this.config.enableNewsletterSignup) return;

    const newsletterForms = document.querySelectorAll('form[data-newsletter-form]');
    
    newsletterForms.forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleNewsletterSignup(form);
      });
    });
  },

  /**
   * Handle newsletter signup
   */
  async handleNewsletterSignup(form) {
    const email = form.querySelector('input[type="email"]').value;
    
    if (!this.isValidEmail(email)) {
      this.showNewsletterError(form, 'Please enter a valid email address');
      return;
    }

    try {
      const result = await this.submitNewsletterForm(form);
      this.showNewsletterSuccess(form, result.message);
      form.reset();
    } catch (error) {
      this.showNewsletterError(form, error.message);
    }
  },

  /**
   * Show newsletter success
   */
  showNewsletterSuccess(form, message) {
    const successElement = form.querySelector('.newsletter-success');
    if (successElement) {
      successElement.textContent = message;
      successElement.style.display = 'block';
    }
  },

  /**
   * Show newsletter error
   */
  showNewsletterError(form, message) {
    const errorElement = form.querySelector('.newsletter-error');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  },

  /**
   * Setup contact forms
   */
  setupContactForms() {
    if (!this.config.enableContactForm) return;

    const contactForms = document.querySelectorAll('form[data-contact-form]');
    
    contactForms.forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleContactForm(form);
      });
    });
  },

  /**
   * Handle contact form
   */
  async handleContactForm(form) {
    try {
      const result = await this.submitContactForm(form);
      this.showContactSuccess(form, result.message);
      form.reset();
    } catch (error) {
      this.showContactError(form, error.message);
    }
  },

  /**
   * Show contact success
   */
  showContactSuccess(form, message) {
    const successElement = form.querySelector('.contact-success');
    if (successElement) {
      successElement.textContent = message;
      successElement.style.display = 'block';
    }
  },

  /**
   * Show contact error
   */
  showContactError(form, message) {
    const errorElement = form.querySelector('.contact-error');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  },

  /**
   * Setup customer account features
   */
  setupCustomerAccount() {
    if (!this.config.enableCustomerAccount) return;

    // Setup customer account forms
    const customerForms = document.querySelectorAll('form[data-customer-form]');
    
    customerForms.forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleCustomerForm(form);
      });
    });

    // Setup account navigation
    this.setupAccountNavigation();
  },

  /**
   * Handle customer form
   */
  async handleCustomerForm(form) {
    try {
      const result = await this.submitCustomerForm(form);
      this.showCustomerSuccess(form, result.message);
    } catch (error) {
      this.showCustomerError(form, error.message);
    }
  },

  /**
   * Show customer success
   */
  showCustomerSuccess(form, message) {
    const successElement = form.querySelector('.customer-success');
    if (successElement) {
      successElement.textContent = message;
      successElement.style.display = 'block';
    }
  },

  /**
   * Show customer error
   */
  showCustomerError(form, message) {
    const errorElement = form.querySelector('.customer-error');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  },

  /**
   * Setup account navigation
   */
  setupAccountNavigation() {
    const accountNav = document.querySelector('.customer-account__nav');
    if (!accountNav) return;

    const navLinks = accountNav.querySelectorAll('.customer-account__nav-link');
    
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        this.handleAccountNavigation(e, link);
      });
    });
  },

  /**
   * Handle account navigation
   */
  handleAccountNavigation(event, link) {
    // Add loading state
    link.classList.add('loading');
    
    // Remove loading state after navigation
    setTimeout(() => {
      link.classList.remove('loading');
    }, 1000);
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
    liveRegion.id = 'form-announcements';
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
    // Setup performance monitoring
    this.setupPerformanceMonitoring();
  },

  /**
   * Setup performance monitoring
   */
  setupPerformanceMonitoring() {
    // Monitor form load time
    const loadStartTime = performance.now();
    
    window.addEventListener('load', () => {
      const loadEndTime = performance.now();
      const loadTime = loadEndTime - loadStartTime;
      console.log(`Contact forms loaded in ${loadTime}ms`);
    });
  },

  /**
   * Update form state
   */
  updateFormState(formId) {
    const formState = this.state.forms.get(formId);
    if (!formState) return;

    const form = formState.element;
    const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
    
    if (submitButton) {
      submitButton.disabled = formState.isSubmitting || !formState.isValid;
      
      if (formState.isSubmitting) {
        submitButton.textContent = 'Submitting...';
        submitButton.classList.add('loading');
      } else {
        submitButton.textContent = submitButton.dataset.originalText || 'Submit';
        submitButton.classList.remove('loading');
      }
    }
  },

  /**
   * Show form success
   */
  showFormSuccess(formId, message) {
    const formState = this.state.forms.get(formId);
    if (!formState) return;

    const form = formState.element;
    const successElement = form.querySelector('.form-success');
    
    if (successElement) {
      successElement.textContent = message;
      successElement.style.display = 'block';
      successElement.setAttribute('role', 'status');
      successElement.setAttribute('aria-live', 'polite');
    }

    // Announce to screen readers
    this.announceToScreenReader(message);
  },

  /**
   * Show form error
   */
  showFormError(formId, message) {
    const formState = this.state.forms.get(formId);
    if (!formState) return;

    const form = formState.element;
    const errorElement = form.querySelector('.form-error');
    
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
      errorElement.setAttribute('role', 'alert');
      errorElement.setAttribute('aria-live', 'polite');
    }

    // Announce to screen readers
    this.announceToScreenReader(message);
  },

  /**
   * Reset form
   */
  resetForm(formId) {
    const formState = this.state.forms.get(formId);
    if (!formState) return;

    const form = formState.element;
    form.reset();
    
    // Clear validation errors
    formState.validationErrors.clear();
    
    // Clear auto-save data
    localStorage.removeItem(`form_${formId}`);
    
    // Reset form state
    formState.isValid = false;
    formState.isSubmitting = false;
    
    // Update form UI
    this.updateFormValidity(formId);
    
    // Hide success/error messages
    const successElement = form.querySelector('.form-success');
    const errorElement = form.querySelector('.form-error');
    
    if (successElement) successElement.style.display = 'none';
    if (errorElement) errorElement.style.display = 'none';
  },

  /**
   * Track form submission
   */
  trackFormSubmission(formType, status) {
    if (!this.config.enableAnalytics) return;

    if (window.gtag) {
      window.gtag('event', 'form_submit', {
        form_type: formType,
        status: status
      });
    }
  },

  /**
   * Announce to screen readers
   */
  announceToScreenReader(message) {
    const liveRegion = document.getElementById('form-announcements');
    if (liveRegion) {
      liveRegion.textContent = message;
    }
  },

  /**
   * Validate email
   */
  isValidEmail(email) {
    const emailRule = this.cache.validationRules.get('email');
    return emailRule && emailRule.pattern.test(email);
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

// Initialize contact form utilities when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  window.contactUtils.init();
});
