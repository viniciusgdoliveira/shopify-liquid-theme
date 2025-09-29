#!/usr/bin/env node

/**
 * Performance Testing Script for EcoVibe Shopify Theme
 * Comprehensive performance analysis and optimization recommendations
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class PerformanceTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      total: 0,
      details: [],
      metrics: {
        totalSize: 0,
        cssSize: 0,
        jsSize: 0,
        imageSize: 0,
        fontSize: 0,
        otherSize: 0
      }
    };
    
    this.themePath = process.cwd();
    this.performanceThresholds = {
      maxFileSize: 1 * 1024 * 1024, // 1MB
      maxCSSSize: 500 * 1024, // 500KB
      maxJSSize: 300 * 1024, // 300KB
      maxImageSize: 2 * 1024 * 1024, // 2MB
      maxFontSize: 500 * 1024, // 500KB
      maxTotalSize: 10 * 1024 * 1024 // 10MB
    };
  }

  /**
   * Run all performance tests
   */
  async runAllTests() {
    console.log('⚡ Starting EcoVibe Theme Performance Testing...\n');
    
    try {
      await this.testFileSizes();
      await this.testCSSPerformance();
      await this.testJavaScriptPerformance();
      await this.testImageOptimization();
      await this.testFontOptimization();
      await this.testCriticalCSS();
      await this.testLazyLoading();
      await this.testCaching();
      await this.testCompression();
      await this.testCoreWebVitals();
      
      this.generateReport();
    } catch (error) {
      console.error('❌ Performance testing failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Test file sizes
   */
  async testFileSizes() {
    console.log('📏 Testing file sizes...');
    
    const allFiles = this.findAllFiles();
    
    for (const file of allFiles) {
      try {
        const stats = fs.statSync(file);
        const size = stats.size;
        const relativePath = path.relative(this.themePath, file);
        
        this.results.metrics.totalSize += size;
        
        // Categorize file types
        if (file.endsWith('.css')) {
          this.results.metrics.cssSize += size;
        } else if (file.endsWith('.js')) {
          this.results.metrics.jsSize += size;
        } else if (this.isImageFile(file)) {
          this.results.metrics.imageSize += size;
        } else if (this.isFontFile(file)) {
          this.results.metrics.fontSize += size;
        } else {
          this.results.metrics.otherSize += size;
        }
        
        // Check individual file sizes
        if (size > this.performanceThresholds.maxFileSize) {
          this.fail(`Large file detected: ${relativePath} (${this.formatBytes(size)})`);
        } else if (size > this.performanceThresholds.maxFileSize / 2) {
          this.warn(`Moderately large file: ${relativePath} (${this.formatBytes(size)})`);
        } else {
          this.pass(`File size OK: ${relativePath} (${this.formatBytes(size)})`);
        }
      } catch (error) {
        this.fail(`Error checking file size for ${file}: ${error.message}`);
      }
    }
    
    // Check total theme size
    if (this.results.metrics.totalSize > this.performanceThresholds.maxTotalSize) {
      this.fail(`Theme size too large: ${this.formatBytes(this.results.metrics.totalSize)}`);
    } else {
      this.pass(`Theme size OK: ${this.formatBytes(this.results.metrics.totalSize)}`);
    }
  }

  /**
   * Test CSS performance
   */
  async testCSSPerformance() {
    console.log('🎨 Testing CSS performance...');
    
    const cssFiles = this.findFiles('.css');
    
    for (const file of cssFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const relativePath = path.relative(this.themePath, file);
        
        // Check for performance issues
        const issues = [];
        
        // Check for excessive use of !important
        const importantCount = (content.match(/!important/g) || []).length;
        if (importantCount > 20) {
          issues.push(`Excessive use of !important (${importantCount} instances)`);
        }
        
        // Check for deep nesting
        const maxNesting = this.getMaxCSSNesting(content);
        if (maxNesting > 4) {
          issues.push(`Deep CSS nesting detected (${maxNesting} levels)`);
        }
        
        // Check for unused CSS
        if (content.includes('@import') && !content.includes('@import url(')) {
          issues.push('Potential @import performance issue');
        }
        
        // Check for large CSS files
        if (content.length > this.performanceThresholds.maxCSSSize) {
          issues.push(`CSS file too large (${this.formatBytes(content.length)})`);
        }
        
        // Check for mobile-first approach
        if (content.includes('@media') && !content.includes('max-width')) {
          issues.push('Potential mobile-first CSS issue');
        }
        
        if (issues.length > 0) {
          this.warn(`CSS performance issues in ${relativePath}: ${issues.join(', ')}`);
        } else {
          this.pass(`CSS performance OK: ${relativePath}`);
        }
      } catch (error) {
        this.fail(`Error checking CSS performance in ${file}: ${error.message}`);
      }
    }
  }

  /**
   * Test JavaScript performance
   */
  async testJavaScriptPerformance() {
    console.log('⚡ Testing JavaScript performance...');
    
    const jsFiles = this.findFiles('.js');
    
    for (const file of jsFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const relativePath = path.relative(this.themePath, file);
        
        // Check for performance issues
        const issues = [];
        
        // Check for large JavaScript files
        if (content.length > this.performanceThresholds.maxJSSize) {
          issues.push(`JavaScript file too large (${this.formatBytes(content.length)})`);
        }
        
        // Check for synchronous operations
        if (content.includes('document.write') || content.includes('innerHTML')) {
          issues.push('Potential synchronous DOM operations');
        }
        
        // Check for memory leaks
        if (content.includes('addEventListener') && !content.includes('removeEventListener')) {
          issues.push('Potential memory leak (missing removeEventListener)');
        }
        
        // Check for inefficient loops
        if (content.includes('for (var') || content.includes('for (let')) {
          const loopCount = (content.match(/for\s*\(/g) || []).length;
          if (loopCount > 10) {
            issues.push(`Many loops detected (${loopCount} instances)`);
          }
        }
        
        // Check for jQuery usage
        if (content.includes('$(') || content.includes('jQuery')) {
          issues.push('jQuery usage detected (consider vanilla JS)');
        }
        
        if (issues.length > 0) {
          this.warn(`JavaScript performance issues in ${relativePath}: ${issues.join(', ')}`);
        } else {
          this.pass(`JavaScript performance OK: ${relativePath}`);
        }
      } catch (error) {
        this.fail(`Error checking JavaScript performance in ${file}: ${error.message}`);
      }
    }
  }

  /**
   * Test image optimization
   */
  async testImageOptimization() {
    console.log('🖼️  Testing image optimization...');
    
    const imageFiles = this.findImageFiles();
    
    for (const file of imageFiles) {
      try {
        const stats = fs.statSync(file);
        const size = stats.size;
        const relativePath = path.relative(this.themePath, file);
        
        // Check image file sizes
        if (size > this.performanceThresholds.maxImageSize) {
          this.fail(`Large image file: ${relativePath} (${this.formatBytes(size)})`);
        } else if (size > this.performanceThresholds.maxImageSize / 2) {
          this.warn(`Moderately large image: ${relativePath} (${this.formatBytes(size)})`);
        } else {
          this.pass(`Image size OK: ${relativePath} (${this.formatBytes(size)})`);
        }
        
        // Check for modern image formats
        if (file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png')) {
          this.warn(`Consider using WebP format for: ${relativePath}`);
        }
        
        // Check for image dimensions
        if (this.isImageFile(file)) {
          try {
            const dimensions = this.getImageDimensions(file);
            if (dimensions.width > 2000 || dimensions.height > 2000) {
              this.warn(`Large image dimensions: ${relativePath} (${dimensions.width}x${dimensions.height})`);
            }
          } catch (error) {
            // Skip dimension check if not available
          }
        }
      } catch (error) {
        this.fail(`Error checking image optimization for ${file}: ${error.message}`);
      }
    }
  }

  /**
   * Test font optimization
   */
  async testFontOptimization() {
    console.log('🔤 Testing font optimization...');
    
    const fontFiles = this.findFontFiles();
    
    for (const file of fontFiles) {
      try {
        const stats = fs.statSync(file);
        const size = stats.size;
        const relativePath = path.relative(this.themePath, file);
        
        // Check font file sizes
        if (size > this.performanceThresholds.maxFontSize) {
          this.fail(`Large font file: ${relativePath} (${this.formatBytes(size)})`);
        } else if (size > this.performanceThresholds.maxFontSize / 2) {
          this.warn(`Moderately large font: ${relativePath} (${this.formatBytes(size)})`);
        } else {
          this.pass(`Font size OK: ${relativePath} (${this.formatBytes(size)})`);
        }
        
        // Check for font format optimization
        if (file.endsWith('.ttf') || file.endsWith('.otf')) {
          this.warn(`Consider using WOFF2 format for: ${relativePath}`);
        }
      } catch (error) {
        this.fail(`Error checking font optimization for ${file}: ${error.message}`);
      }
    }
  }

  /**
   * Test critical CSS
   */
  async testCriticalCSS() {
    console.log('🎯 Testing critical CSS...');
    
    const criticalCSSFile = path.join(this.themePath, 'assets/critical.css');
    
    if (fs.existsSync(criticalCSSFile)) {
      try {
        const content = fs.readFileSync(criticalCSSFile, 'utf8');
        const size = content.length;
        
        if (size > 50 * 1024) { // 50KB
          this.warn(`Critical CSS file is large: ${this.formatBytes(size)}`);
        } else {
          this.pass(`Critical CSS size OK: ${this.formatBytes(size)}`);
        }
        
        // Check for critical CSS content
        if (content.includes('body') && content.includes('h1') && content.includes('h2')) {
          this.pass('Critical CSS contains essential styles');
        } else {
          this.warn('Critical CSS may be missing essential styles');
        }
      } catch (error) {
        this.fail(`Error checking critical CSS: ${error.message}`);
      }
    } else {
      this.fail('Critical CSS file not found');
    }
  }

  /**
   * Test lazy loading
   */
  async testLazyLoading() {
    console.log('🔄 Testing lazy loading...');
    
    const liquidFiles = this.findFiles('.liquid');
    
    for (const file of liquidFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const relativePath = path.relative(this.themePath, file);
        
        // Check for lazy loading implementation
        if (content.includes('<img') && !content.includes('loading="lazy"') && !content.includes('data-src')) {
          this.warn(`Missing lazy loading on images in: ${relativePath}`);
        } else if (content.includes('loading="lazy"') || content.includes('data-src')) {
          this.pass(`Lazy loading implemented in: ${relativePath}`);
        }
        
        // Check for lazy loading JavaScript
        if (content.includes('IntersectionObserver') || content.includes('lazy')) {
          this.pass(`Lazy loading JavaScript found in: ${relativePath}`);
        }
      } catch (error) {
        this.fail(`Error checking lazy loading in ${file}: ${error.message}`);
      }
    }
  }

  /**
   * Test caching
   */
  async testCaching() {
    console.log('💾 Testing caching...');
    
    const liquidFiles = this.findFiles('.liquid');
    
    for (const file of liquidFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const relativePath = path.relative(this.themePath, file);
        
        // Check for cache headers
        if (content.includes('cache-control') || content.includes('max-age')) {
          this.pass(`Caching headers found in: ${relativePath}`);
        }
        
        // Check for asset versioning
        if (content.includes('asset_url') && content.includes('?v=')) {
          this.pass(`Asset versioning found in: ${relativePath}`);
        } else if (content.includes('asset_url')) {
          this.warn(`Consider adding asset versioning in: ${relativePath}`);
        }
      } catch (error) {
        this.fail(`Error checking caching in ${file}: ${error.message}`);
      }
    }
  }

  /**
   * Test compression
   */
  async testCompression() {
    console.log('🗜️  Testing compression...');
    
    const allFiles = this.findAllFiles();
    
    for (const file of allFiles) {
      try {
        const stats = fs.statSync(file);
        const size = stats.size;
        const relativePath = path.relative(this.themePath, file);
        
        // Check for minified files
        if (file.endsWith('.css') || file.endsWith('.js')) {
          const content = fs.readFileSync(file, 'utf8');
          
          // Check for minification indicators
          const hasMinification = content.includes('/*!') || 
                                 content.includes('//!') || 
                                 content.length < size * 0.8;
          
          if (hasMinification) {
            this.pass(`File appears minified: ${relativePath}`);
          } else {
            this.warn(`File may not be minified: ${relativePath}`);
          }
        }
      } catch (error) {
        this.fail(`Error checking compression for ${file}: ${error.message}`);
      }
    }
  }

  /**
   * Test Core Web Vitals
   */
  async testCoreWebVitals() {
    console.log('📊 Testing Core Web Vitals...');
    
    // Check for Core Web Vitals optimizations
    const liquidFiles = this.findFiles('.liquid');
    
    for (const file of liquidFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const relativePath = path.relative(this.themePath, file);
        
        // Check for LCP optimizations
        if (content.includes('preload') || content.includes('prefetch')) {
          this.pass(`Resource preloading found in: ${relativePath}`);
        }
        
        // Check for CLS optimizations
        if (content.includes('width=') && content.includes('height=')) {
          this.pass(`Image dimensions specified in: ${relativePath}`);
        }
        
        // Check for FID optimizations
        if (content.includes('defer') || content.includes('async')) {
          this.pass(`Script optimization found in: ${relativePath}`);
        }
      } catch (error) {
        this.fail(`Error checking Core Web Vitals in ${file}: ${error.message}`);
      }
    }
  }

  /**
   * Helper methods
   */
  findFiles(extension) {
    const files = [];
    const searchPath = this.themePath;
    
    const search = (dir) => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          search(fullPath);
        } else if (extension.includes('*') || item.endsWith(extension)) {
          files.push(fullPath);
        }
      }
    };
    
    search(searchPath);
    return files;
  }

  findAllFiles() {
    const files = [];
    const searchPath = this.themePath;
    
    const search = (dir) => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          search(fullPath);
        } else {
          files.push(fullPath);
        }
      }
    };
    
    search(searchPath);
    return files;
  }

  findImageFiles() {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico'];
    return this.findAllFiles().filter(file => 
      imageExtensions.some(ext => file.toLowerCase().endsWith(ext))
    );
  }

  findFontFiles() {
    const fontExtensions = ['.woff', '.woff2', '.ttf', '.otf', '.eot'];
    return this.findAllFiles().filter(file => 
      fontExtensions.some(ext => file.toLowerCase().endsWith(ext))
    );
  }

  isImageFile(file) {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico'];
    return imageExtensions.some(ext => file.toLowerCase().endsWith(ext));
  }

  isFontFile(file) {
    const fontExtensions = ['.woff', '.woff2', '.ttf', '.otf', '.eot'];
    return fontExtensions.some(ext => file.toLowerCase().endsWith(ext));
  }

  getMaxCSSNesting(content) {
    let maxNesting = 0;
    let currentNesting = 0;
    
    for (const char of content) {
      if (char === '{') {
        currentNesting++;
        maxNesting = Math.max(maxNesting, currentNesting);
      } else if (char === '}') {
        currentNesting--;
      }
    }
    
    return maxNesting;
  }

  getImageDimensions(file) {
    // This is a simplified version - in a real implementation,
    // you would use a library like 'image-size' to get actual dimensions
    return { width: 0, height: 0 };
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  pass(message) {
    this.results.passed++;
    this.results.total++;
    this.results.details.push({ type: 'pass', message });
    console.log(`✅ ${message}`);
  }

  fail(message) {
    this.results.failed++;
    this.results.total++;
    this.results.details.push({ type: 'fail', message });
    console.log(`❌ ${message}`);
  }

  warn(message) {
    this.results.warnings++;
    this.results.details.push({ type: 'warn', message });
    console.log(`⚠️  ${message}`);
  }

  /**
   * Generate performance report
   */
  generateReport() {
    console.log('\n📊 Performance Test Results Summary:');
    console.log('====================================');
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⚠️  Warnings: ${this.results.warnings}`);
    console.log(`📈 Total: ${this.results.total}`);
    
    console.log('\n📏 File Size Analysis:');
    console.log(`Total Theme Size: ${this.formatBytes(this.results.metrics.totalSize)}`);
    console.log(`CSS Files: ${this.formatBytes(this.results.metrics.cssSize)}`);
    console.log(`JavaScript Files: ${this.formatBytes(this.results.metrics.jsSize)}`);
    console.log(`Image Files: ${this.formatBytes(this.results.metrics.imageSize)}`);
    console.log(`Font Files: ${this.formatBytes(this.results.metrics.fontSize)}`);
    console.log(`Other Files: ${this.formatBytes(this.results.metrics.otherSize)}`);
    
    const successRate = ((this.results.passed / this.results.total) * 100).toFixed(2);
    console.log(`🎯 Success Rate: ${successRate}%`);
    
    if (this.results.failed > 0) {
      console.log('\n❌ Performance Issues:');
      this.results.details
        .filter(detail => detail.type === 'fail')
        .forEach(detail => console.log(`   - ${detail.message}`));
    }
    
    if (this.results.warnings > 0) {
      console.log('\n⚠️  Performance Warnings:');
      this.results.details
        .filter(detail => detail.type === 'warn')
        .forEach(detail => console.log(`   - ${detail.message}`));
    }
    
    // Save report to file
    const reportPath = path.join(this.themePath, 'PERFORMANCE_REPORT.md');
    const reportContent = this.generateMarkdownReport();
    fs.writeFileSync(reportPath, reportContent);
    
    console.log(`\n📄 Detailed performance report saved to: ${reportPath}`);
    
    if (this.results.failed > 0) {
      console.log('\n🚨 Some performance tests failed. Please optimize the theme before submission.');
      process.exit(1);
    } else {
      console.log('\n🎉 All performance tests passed! Theme is optimized for performance.');
    }
  }

  /**
   * Generate markdown report
   */
  generateMarkdownReport() {
    const timestamp = new Date().toISOString();
    const successRate = ((this.results.passed / this.results.total) * 100).toFixed(2);
    
    let report = `# EcoVibe Theme Performance Report\n\n`;
    report += `**Generated:** ${timestamp}\n`;
    report += `**Theme:** EcoVibe\n`;
    report += `**Version:** 1.0.0\n\n`;
    
    report += `## Summary\n\n`;
    report += `- ✅ **Passed:** ${this.results.passed}\n`;
    report += `- ❌ **Failed:** ${this.results.failed}\n`;
    report += `- ⚠️  **Warnings:** ${this.results.warnings}\n`;
    report += `- 📈 **Total:** ${this.results.total}\n`;
    report += `- 🎯 **Success Rate:** ${successRate}%\n\n`;
    
    report += `## File Size Analysis\n\n`;
    report += `- **Total Theme Size:** ${this.formatBytes(this.results.metrics.totalSize)}\n`;
    report += `- **CSS Files:** ${this.formatBytes(this.results.metrics.cssSize)}\n`;
    report += `- **JavaScript Files:** ${this.formatBytes(this.results.metrics.jsSize)}\n`;
    report += `- **Image Files:** ${this.formatBytes(this.results.metrics.imageSize)}\n`;
    report += `- **Font Files:** ${this.formatBytes(this.results.metrics.fontSize)}\n`;
    report += `- **Other Files:** ${this.formatBytes(this.results.metrics.otherSize)}\n\n`;
    
    if (this.results.failed > 0) {
      report += `## Performance Issues\n\n`;
      this.results.details
        .filter(detail => detail.type === 'fail')
        .forEach(detail => report += `- ❌ ${detail.message}\n`);
      report += `\n`;
    }
    
    if (this.results.warnings > 0) {
      report += `## Performance Warnings\n\n`;
      this.results.details
        .filter(detail => detail.type === 'warn')
        .forEach(detail => report += `- ⚠️  ${detail.message}\n`);
      report += `\n`;
    }
    
    report += `## All Test Results\n\n`;
    this.results.details.forEach(detail => {
      const icon = detail.type === 'pass' ? '✅' : detail.type === 'fail' ? '❌' : '⚠️';
      report += `${icon} ${detail.message}\n`;
    });
    
    return report;
  }
}

// Run the performance tests
if (require.main === module) {
  const tester = new PerformanceTester();
  tester.runAllTests().catch(console.error);
}

module.exports = PerformanceTester;
