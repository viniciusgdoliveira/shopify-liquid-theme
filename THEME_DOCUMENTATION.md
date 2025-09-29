# EcoVibe Theme Documentation

## Table of Contents
1. [Theme Overview](#theme-overview)
2. [Installation Guide](#installation-guide)
3. [Customization Options](#customization-options)
4. [Features Overview](#features-overview)
5. [Troubleshooting Guide](#troubleshooting-guide)
6. [Support Information](#support-information)
7. [Technical Specifications](#technical-specifications)

---

## Theme Overview

**EcoVibe** is a modern, sustainable-focused Shopify Liquid 2.0 theme designed for eco-conscious brands. Built with performance, accessibility, and sustainability in mind, it provides a comprehensive solution for online stores that prioritize environmental responsibility and user experience.

### Key Features
- 🌱 **Sustainability-Focused Design**: Built with eco-conscious brands in mind
- ⚡ **Performance Optimized**: Core Web Vitals compliant with lazy loading and image optimization
- ♿ **Accessibility Compliant**: WCAG 2.1 AA standards with keyboard navigation and screen reader support
- 🌍 **Multi-Language Support**: English, Portuguese (Brazil), and Spanish
- 📱 **Mobile-First Design**: Responsive design optimized for all devices
- 🎨 **Modern UI/UX**: Clean, minimalist design following Allbirds principles
- 🔧 **Easy Customization**: Comprehensive theme settings and customization options

### Target Audience
- Sustainable fashion brands
- Eco-friendly product retailers
- Environmental organizations
- Conscious consumer brands
- Green technology companies

---

## Installation Guide

### Prerequisites
- Active Shopify store
- Admin access to your Shopify store
- Basic understanding of Shopify theme management

### Installation Steps

#### Method 1: Theme Store Installation (Recommended)
1. Visit the Shopify Theme Store
2. Search for "EcoVibe"
3. Click "Add theme" to install
4. The theme will be added to your store's theme library

#### Method 2: Manual Installation
1. Download the theme files from the Theme Store
2. Go to **Online Store > Themes** in your Shopify admin
3. Click **Upload theme**
4. Select the downloaded theme file
5. Click **Upload**

#### Method 3: Development Installation
1. Install Shopify CLI: `npm install -g @shopify/cli`
2. Clone the theme repository
3. Run `shopify theme dev` to start development server
4. Use `shopify theme push` to deploy changes

### Initial Setup
1. **Activate the theme**: Go to **Online Store > Themes** and click **Publish** on EcoVibe
2. **Configure basic settings**: Navigate to **Customize** to set up your store
3. **Upload your logo**: Add your brand logo in the header settings
4. **Set up navigation**: Configure your main navigation menu
5. **Configure colors**: Customize your brand colors in theme settings

### Quick Start Checklist
- [ ] Theme installed and activated
- [ ] Logo uploaded
- [ ] Navigation menu configured
- [ ] Brand colors set
- [ ] Contact information added
- [ ] Payment methods configured
- [ ] Shipping settings configured

---

## Customization Options

### Theme Settings

#### Global Settings
Access theme settings via **Customize > Theme settings**

**Brand Identity**
- Logo upload and positioning
- Favicon configuration
- Brand colors and color schemes
- Typography settings (headings, body text)

**Layout Settings**
- Header layout and navigation
- Footer configuration
- Page width and spacing
- Mobile optimization settings

**Performance Settings**
- Image optimization options
- Lazy loading configuration
- Animation preferences
- Loading performance settings

#### Section Customization

**Header Section**
- Logo placement and sizing
- Navigation menu configuration
- Search functionality toggle
- Cart icon customization
- Mobile menu settings

**Footer Section**
- Company information
- Social media links
- Newsletter signup
- Payment icons
- Copyright information

**Product Page Sections**
- Product gallery layout
- Product information display
- Add to cart button styling
- Product recommendations
- Trust badges and reviews

**Collection Page Sections**
- Product grid layout
- Filtering options
- Sorting capabilities
- Pagination settings
- Product badges

### Advanced Customization

#### CSS Custom Properties
The theme uses CSS custom properties for easy customization:

```css
:root {
  --color-primary: #2c5530;
  --color-secondary: #4a7c59;
  --color-accent: #8fbc8f;
  --font-family-primary: 'Inter', sans-serif;
  --font-family-secondary: 'Playfair Display', serif;
  --border-radius: 8px;
  --spacing-unit: 1rem;
}
```

#### Custom CSS
Add custom CSS via **Customize > Theme settings > Custom CSS**:

```css
/* Example: Custom button styling */
.custom-button {
  background: linear-gradient(45deg, var(--color-primary), var(--color-secondary));
  border-radius: var(--border-radius);
  padding: 1rem 2rem;
  transition: all 0.3s ease;
}

.custom-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
```

#### Liquid Customization
For advanced users, you can modify Liquid templates:

1. **Duplicate the theme** before making changes
2. **Edit template files** in the code editor
3. **Test changes** on a development store
4. **Deploy changes** to your live store

### Color Schemes
The theme includes pre-built color schemes:

**Default (Green)**
- Primary: #2c5530 (Forest Green)
- Secondary: #4a7c59 (Sage Green)
- Accent: #8fbc8f (Light Green)

**Ocean (Blue)**
- Primary: #1e3a8a (Deep Blue)
- Secondary: #3b82f6 (Blue)
- Accent: #60a5fa (Light Blue)

**Earth (Brown)**
- Primary: #92400e (Brown)
- Secondary: #d97706 (Amber)
- Accent: #fbbf24 (Yellow)

---

## Features Overview

### Core Features

#### 🛍️ **E-Commerce Functionality**
- **Product Pages**: Advanced image galleries, variant selection, reviews
- **Collection Pages**: Filtering, sorting, grid/list views, infinite scroll
- **Cart Functionality**: Drawer cart, AJAX updates, save for later
- **Search**: Predictive search, filters, typo tolerance
- **Checkout**: Optimized checkout flow, trust badges

#### 🎨 **Design & User Experience**
- **Responsive Design**: Mobile-first approach, optimized for all devices
- **Modern UI**: Clean, minimalist design following sustainability principles
- **Animations**: Smooth transitions and micro-interactions
- **Accessibility**: WCAG 2.1 AA compliance, keyboard navigation
- **Performance**: Core Web Vitals optimized, lazy loading

#### 🌍 **Internationalization**
- **Multi-Language**: English, Portuguese (Brazil), Spanish
- **Currency Support**: Multi-currency with automatic detection
- **Localization**: Region-specific content and formatting
- **SEO**: Hreflang tags, localized meta tags

#### 🔧 **Customization**
- **Theme Settings**: Comprehensive customization options
- **Section Builder**: Drag-and-drop section management
- **Block System**: Modular content blocks
- **Custom CSS**: Advanced styling options
- **Developer-Friendly**: Clean, documented code

### Advanced Features

#### 📊 **Analytics & SEO**
- **Google Analytics**: Built-in integration
- **Facebook Pixel**: Social media tracking
- **Structured Data**: Rich snippets for search engines
- **Meta Tags**: Comprehensive SEO optimization
- **Sitemap**: Automatic XML sitemap generation

#### 🛡️ **Security & Performance**
- **HTTPS**: Secure connections
- **Content Security Policy**: Enhanced security headers
- **Image Optimization**: WebP/AVIF support with fallbacks
- **Caching**: Optimized caching strategies
- **CDN**: Content delivery network optimization

#### 📱 **Mobile Features**
- **Touch Gestures**: Swipe navigation, pinch-to-zoom
- **Mobile Menu**: Optimized mobile navigation
- **Progressive Web App**: PWA capabilities
- **Offline Support**: Basic offline functionality

---

## Troubleshooting Guide

### Common Issues

#### Theme Not Loading Properly
**Symptoms**: Blank page, broken layout, missing styles
**Solutions**:
1. Clear browser cache and cookies
2. Check for JavaScript errors in browser console
3. Verify theme files are complete
4. Contact support if issue persists

#### Images Not Displaying
**Symptoms**: Broken images, missing product photos
**Solutions**:
1. Check image file formats (JPEG, PNG, WebP supported)
2. Verify image file sizes (recommended: under 2MB)
3. Ensure images are properly uploaded to Shopify
4. Check lazy loading settings

#### Mobile Layout Issues
**Symptoms**: Poor mobile experience, layout breaks
**Solutions**:
1. Test on actual mobile devices
2. Check responsive breakpoints
3. Verify mobile-specific CSS
4. Test touch interactions

#### Performance Issues
**Symptoms**: Slow loading, poor Core Web Vitals scores
**Solutions**:
1. Enable lazy loading in theme settings
2. Optimize image sizes and formats
3. Minimize custom CSS and JavaScript
4. Use Shopify's built-in performance tools

#### Translation Issues
**Symptoms**: Missing translations, incorrect language display
**Solutions**:
1. Verify locale files are complete
2. Check language settings in Shopify admin
3. Ensure proper hreflang implementation
4. Test with different browsers and devices

### Debug Mode

Enable debug mode for development:
1. Add `?preview_theme_id=YOUR_THEME_ID` to any URL
2. Use browser developer tools
3. Check console for errors
4. Verify network requests

### Error Codes

| Error Code | Description | Solution |
|------------|-------------|----------|
| 404 | Page not found | Check URL structure and navigation |
| 500 | Server error | Contact Shopify support |
| Liquid Error | Template error | Check Liquid syntax |
| CSS Error | Styling issue | Verify CSS syntax |

### Getting Help

1. **Check Documentation**: Review this guide thoroughly
2. **Search Knowledge Base**: Look for similar issues
3. **Contact Support**: Reach out to our support team
4. **Community Forum**: Ask questions in our community

---

## Support Information

### Documentation Resources
- **Theme Documentation**: [viniciusgdoliveira.dev/shopify/liquid/docs](https://viniciusgdoliveira.dev/shopify/liquid/docs)
- **Support Contact**: [viniciusgdoliveira.dev/contact](https://viniciusgdoliveira.dev/contact)
- **GitHub Repository**: Available for developers
- **Video Tutorials**: Step-by-step setup guides

### Support Channels
- **Email Support**: support@viniciusgdoliveira.dev
- **Live Chat**: Available during business hours
- **Community Forum**: Peer-to-peer support
- **Video Calls**: For complex issues (by appointment)

### Response Times
- **General Inquiries**: 24-48 hours
- **Technical Issues**: 12-24 hours
- **Critical Issues**: 4-8 hours
- **Emergency Support**: Available for critical issues

### What's Included in Support
- ✅ Theme installation and setup
- ✅ Basic customization guidance
- ✅ Bug fixes and updates
- ✅ Performance optimization
- ✅ Accessibility compliance
- ✅ SEO optimization

### What's Not Included
- ❌ Custom development work
- ❌ Third-party app integration
- ❌ Advanced Liquid modifications
- ❌ Custom design work
- ❌ Content creation

---

## Technical Specifications

### System Requirements
- **Shopify Plan**: Basic Shopify or higher
- **Browser Support**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile Support**: iOS 12+, Android 8+
- **Internet Connection**: Broadband recommended

### Performance Metrics
- **Lighthouse Score**: 90+ (Performance)
- **Core Web Vitals**: All metrics in "Good" range
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1

### File Structure
```
theme/
├── assets/           # CSS, JS, images
├── blocks/           # Reusable block components
├── config/           # Theme settings and data
├── layout/           # Main layout templates
├── locales/          # Translation files
├── sections/         # Dynamic sections
├── snippets/         # Reusable code snippets
└── templates/        # Page templates
```

### Browser Compatibility
| Browser | Version | Support Level |
|---------|---------|---------------|
| Chrome | 90+ | Full Support |
| Firefox | 88+ | Full Support |
| Safari | 14+ | Full Support |
| Edge | 90+ | Full Support |
| Internet Explorer | 11 | Limited Support |

### Accessibility Compliance
- **WCAG Level**: 2.1 AA
- **Screen Readers**: NVDA, JAWS, VoiceOver
- **Keyboard Navigation**: Full support
- **Color Contrast**: 4.5:1 minimum ratio
- **Touch Targets**: 44px minimum size

### SEO Features
- **Structured Data**: Product, Organization, Breadcrumb
- **Meta Tags**: Comprehensive meta tag support
- **Sitemap**: Automatic XML sitemap
- **Hreflang**: Multi-language support
- **Canonical URLs**: Proper canonical implementation

---

## Changelog

### Version 1.0.0 (Current)
- Initial release
- Core theme functionality
- Multi-language support
- Accessibility compliance
- Performance optimization
- SEO optimization

### Planned Updates
- Advanced filtering system
- Enhanced mobile features
- Additional color schemes
- More customization options
- Performance improvements

---

## License

This theme is licensed under the Shopify Theme Store License. See the LICENSE file for details.

---

## Credits

**Theme Developer**: Vinicius G. de Oliveira
**Design Inspiration**: Allbirds design principles
**Sustainability Focus**: Environmental responsibility
**Performance Optimization**: Core Web Vitals compliance
**Accessibility**: WCAG 2.1 AA standards

---

*Last updated: December 2024*
*Theme Version: 1.0.0*
*Documentation Version: 1.0.0*
