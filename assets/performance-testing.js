/**
 * EcoVibe Theme - Performance Testing Script
 * 
 * This script helps automate performance testing for the EcoVibe theme.
 * It can be run in the browser console to check various performance metrics.
 */

(function() {
  'use strict';

  // Performance Testing Object
  const PerformanceTester = {
    
    // Core Web Vitals Testing
    testCoreWebVitals: function() {
      console.log('🧪 Testing Core Web Vitals...');
      
      // LCP (Largest Contentful Paint)
      if ('PerformanceObserver' in window) {
        new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            const lcp = entry.startTime;
            console.log(`📊 LCP: ${lcp.toFixed(2)}ms ${lcp < 2500 ? '✅' : '❌'}`);
          }
        }).observe({ type: 'largest-contentful-paint', buffered: true });
      }

      // FID (First Input Delay)
      if ('PerformanceObserver' in window) {
        new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            const fid = entry.duration;
            console.log(`📊 FID: ${fid.toFixed(2)}ms ${fid < 100 ? '✅' : '❌'}`);
          }
        }).observe({ type: 'first-input', buffered: true });
      }

      // CLS (Cumulative Layout Shift)
      if ('PerformanceObserver' in window) {
        let cls = 0;
        new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (!entry.hadRecentInput) {
              cls += entry.value;
            }
          }
          console.log(`📊 CLS: ${cls.toFixed(3)} ${cls < 0.1 ? '✅' : '❌'}`);
        }).observe({ type: 'layout-shift', buffered: true });
      }
    },

    // Performance Metrics Testing
    testPerformanceMetrics: function() {
      console.log('🧪 Testing Performance Metrics...');
      
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        const metrics = {
          'DNS Lookup': navigation.domainLookupEnd - navigation.domainLookupStart,
          'TCP Connection': navigation.connectEnd - navigation.connectStart,
          'TLS Negotiation': navigation.secureConnectionStart > 0 ? navigation.connectEnd - navigation.secureConnectionStart : 0,
          'TTFB': navigation.responseStart - navigation.requestStart,
          'Download': navigation.responseEnd - navigation.responseStart,
          'DOM Processing': navigation.domContentLoadedEventEnd - navigation.responseEnd,
          'Total Load Time': navigation.loadEventEnd - navigation.navigationStart
        };

        Object.entries(metrics).forEach(([metric, value]) => {
          console.log(`📊 ${metric}: ${value.toFixed(2)}ms`);
        });
      }
    },

    // Image Optimization Testing
    testImageOptimization: function() {
      console.log('🧪 Testing Image Optimization...');
      
      const images = document.querySelectorAll('img');
      let optimizedImages = 0;
      let totalImages = images.length;

      images.forEach(img => {
        // Check for lazy loading
        if (img.loading === 'lazy' || img.hasAttribute('data-src')) {
          optimizedImages++;
        }
        
        // Check for WebP support
        if (img.src.includes('.webp')) {
          optimizedImages++;
        }
        
        // Check for responsive images
        if (img.srcset) {
          optimizedImages++;
        }
      });

      console.log(`📊 Image Optimization: ${optimizedImages}/${totalImages * 3} features enabled`);
    },

    // Accessibility Testing
    testAccessibility: function() {
      console.log('🧪 Testing Accessibility...');
      
      const issues = [];
      
      // Check for alt text
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        if (!img.alt && !img.hasAttribute('aria-hidden')) {
          issues.push('Missing alt text on image');
        }
      });

      // Check for heading hierarchy
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let lastLevel = 0;
      headings.forEach(heading => {
        const level = parseInt(heading.tagName.charAt(1));
        if (level > lastLevel + 1) {
          issues.push(`Heading hierarchy issue: ${heading.tagName} after h${lastLevel}`);
        }
        lastLevel = level;
      });

      // Check for focus indicators
      const focusableElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex]');
      focusableElements.forEach(element => {
        const styles = window.getComputedStyle(element);
        if (styles.outline === 'none' && !styles.boxShadow.includes('0 0')) {
          issues.push('Missing focus indicator on focusable element');
        }
      });

      // Check for ARIA labels
      const interactiveElements = document.querySelectorAll('button, input, select, textarea');
      interactiveElements.forEach(element => {
        if (!element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby') && !element.textContent.trim()) {
          issues.push('Missing ARIA label on interactive element');
        }
      });

      console.log(`📊 Accessibility Issues: ${issues.length} found`);
      if (issues.length > 0) {
        console.log('Issues:', issues);
      }
    },

    // Mobile Testing
    testMobileFeatures: function() {
      console.log('🧪 Testing Mobile Features...');
      
      const isMobile = window.innerWidth <= 768;
      const touchSupport = 'ontouchstart' in window;
      
      console.log(`📊 Mobile Viewport: ${isMobile ? '✅' : '❌'}`);
      console.log(`📊 Touch Support: ${touchSupport ? '✅' : '❌'}`);
      
      // Check for mobile menu
      const mobileMenu = document.querySelector('[data-mobile-menu]') || document.querySelector('.mobile-menu');
      console.log(`📊 Mobile Menu: ${mobileMenu ? '✅' : '❌'}`);
      
      // Check for touch targets
      const buttons = document.querySelectorAll('button, a, input[type="button"], input[type="submit"]');
      let touchTargetIssues = 0;
      buttons.forEach(button => {
        const rect = button.getBoundingClientRect();
        if (rect.width < 44 || rect.height < 44) {
          touchTargetIssues++;
        }
      });
      console.log(`📊 Touch Targets: ${touchTargetIssues === 0 ? '✅' : '❌'} (${touchTargetIssues} issues)`);
    },

    // SEO Testing
    testSEO: function() {
      console.log('🧪 Testing SEO...');
      
      const issues = [];
      
      // Check for title tag
      const title = document.querySelector('title');
      if (!title || !title.textContent.trim()) {
        issues.push('Missing or empty title tag');
      }
      
      // Check for meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription || !metaDescription.content.trim()) {
        issues.push('Missing or empty meta description');
      }
      
      // Check for canonical URL
      const canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        issues.push('Missing canonical URL');
      }
      
      // Check for Open Graph tags
      const ogTitle = document.querySelector('meta[property="og:title"]');
      const ogDescription = document.querySelector('meta[property="og:description"]');
      const ogImage = document.querySelector('meta[property="og:image"]');
      
      if (!ogTitle || !ogDescription || !ogImage) {
        issues.push('Missing Open Graph tags');
      }
      
      // Check for structured data
      const structuredData = document.querySelector('script[type="application/ld+json"]');
      if (!structuredData) {
        issues.push('Missing structured data');
      }
      
      console.log(`📊 SEO Issues: ${issues.length} found`);
      if (issues.length > 0) {
        console.log('Issues:', issues);
      }
    },

    // Run All Tests
    runAllTests: function() {
      console.log('🚀 Starting EcoVibe Theme Performance Tests...');
      console.log('=====================================');
      
      this.testCoreWebVitals();
      this.testPerformanceMetrics();
      this.testImageOptimization();
      this.testAccessibility();
      this.testMobileFeatures();
      this.testSEO();
      
      console.log('=====================================');
      console.log('✅ Performance testing complete!');
      console.log('📊 Check the results above for any issues.');
    }
  };

  // Auto-run tests when script loads
  if (document.readyState === 'complete') {
    PerformanceTester.runAllTests();
  } else {
    window.addEventListener('load', () => {
      PerformanceTester.runAllTests();
    });
  }

  // Make tester available globally
  window.EcoVibeTester = PerformanceTester;

  // Instructions
  console.log('🧪 EcoVibe Theme Performance Tester loaded!');
  console.log('📋 Available commands:');
  console.log('  - EcoVibeTester.runAllTests() - Run all tests');
  console.log('  - EcoVibeTester.testCoreWebVitals() - Test Core Web Vitals');
  console.log('  - EcoVibeTester.testPerformanceMetrics() - Test performance metrics');
  console.log('  - EcoVibeTester.testImageOptimization() - Test image optimization');
  console.log('  - EcoVibeTester.testAccessibility() - Test accessibility');
  console.log('  - EcoVibeTester.testMobileFeatures() - Test mobile features');
  console.log('  - EcoVibeTester.testSEO() - Test SEO');

})();
