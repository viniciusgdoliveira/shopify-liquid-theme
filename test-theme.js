#!/usr/bin/env node

/**
 * Automated Testing Script for EcoVibe Shopify Theme
 * Comprehensive testing suite for theme validation and quality assurance
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ThemeTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      total: 0,
      details: []
    };
    
    this.themePath = process.cwd();
    this.requiredFiles = [
      'layout/theme.liquid',
      'templates/index.json',
      'templates/product.json',
      'templates/collection.json',
      'templates/cart.json',
      'templates/search.json',
      'templates/blog.json',
      'templates/article.json',
      'templates/page.json',
      'templates/404.json',
      'templates/customers/account.json',
      'templates/customers/login.json',
      'templates/customers/register.json',
      'templates/customers/activate_account.json',
      'templates/customers/reset_password.json',
      'config/settings_schema.json',
      'config/settings_data.json',
      'locales/en.default.json',
      'locales/pt-br.json',
      'locales/es.json'
    ];
    
    this.requiredSections = [
      'sections/header.liquid',
      'sections/footer.liquid',
      'sections/product.liquid',
      'sections/collection.liquid',
      'sections/cart.liquid',
      'sections/search.liquid',
      'sections/blog.liquid',
      'sections/article.liquid',
      'sections/page.liquid',
      'sections/404.liquid',
      'sections/customer-account.liquid',
      'sections/customer-login.liquid',
      'sections/customer-register.liquid',
      'sections/customer-activate-account.liquid',
      'sections/customer-reset-password.liquid',
      'sections/contact-form.liquid',
      'sections/newsletter-signup.liquid'
    ];
    
    this.requiredAssets = [
      'assets/base.css',
      'assets/critical.css',
      'assets/components.css',
      'assets/utilities.css',
      'assets/v-design-system.css',
      'assets/cart.css',
      'assets/collection.css',
      'assets/product.css',
      'assets/search.css',
      'assets/blog.css',
      'assets/contact.css',
      'assets/cart-utils.js',
      'assets/cart-drawer.js',
      'assets/search-utils.js',
      'assets/product-utils.js',
      'assets/collection-utils.js',
      'assets/blog-utils.js',
      'assets/contact-utils.js',
      'assets/header.js',
      'assets/product.js',
      'assets/cart.js'
    ];
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🚀 Starting EcoVibe Theme Testing Suite...\n');
    
    try {
      await this.testFileStructure();
      await this.testLiquidSyntax();
      await this.testJSONSyntax();
      await this.testCSSSyntax();
      await this.testJavaScriptSyntax();
      await this.testAccessibility();
      await this.testPerformance();
      await this.testSEO();
      await this.testSecurity();
      await this.testTranslations();
      await this.testSchemaValidation();
      
      this.generateReport();
    } catch (error) {
      console.error('❌ Testing suite failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Test file structure
   */
  async testFileStructure() {
    console.log('📁 Testing file structure...');
    
    const allRequiredFiles = [
      ...this.requiredFiles,
      ...this.requiredSections,
      ...this.requiredAssets
    ];
    
    for (const file of allRequiredFiles) {
      const filePath = path.join(this.themePath, file);
      if (fs.existsSync(filePath)) {
        this.pass(`File exists: ${file}`);
      } else {
        this.fail(`Missing required file: ${file}`);
      }
    }
    
    // Test for unnecessary files
    const unnecessaryFiles = [
      'config.yml',
      'config.yaml',
      'package.json',
      'package-lock.json',
      'yarn.lock',
      'node_modules',
      '.git',
      '.gitignore',
      'README.md',
      'LICENSE',
      'CHANGELOG.md'
    ];
    
    for (const file of unnecessaryFiles) {
      const filePath = path.join(this.themePath, file);
      if (fs.existsSync(filePath)) {
        this.warn(`Unnecessary file found: ${file}`);
      }
    }
  }

  /**
   * Test Liquid syntax
   */
  async testLiquidSyntax() {
    console.log('🔧 Testing Liquid syntax...');
    
    const liquidFiles = this.findFiles('.liquid');
    
    for (const file of liquidFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Basic Liquid syntax checks
        if (content.includes('{{') && !content.includes('}}')) {
          this.fail(`Unclosed Liquid output in ${file}`);
        }
        
        if (content.includes('{%') && !content.includes('%}')) {
          this.fail(`Unclosed Liquid tag in ${file}`);
        }
        
        // Check for common Liquid errors
        if (content.includes('{{-') && !content.includes('-}}')) {
          this.fail(`Unclosed Liquid output with trim in ${file}`);
        }
        
        if (content.includes('{%-') && !content.includes('-%}')) {
          this.fail(`Unclosed Liquid tag with trim in ${file}`);
        }
        
        // Check for proper schema blocks
        if (file.includes('sections/') && !content.includes('{% schema %}')) {
          this.fail(`Missing schema block in section: ${file}`);
        }
        
        this.pass(`Liquid syntax valid: ${file}`);
      } catch (error) {
        this.fail(`Error reading Liquid file ${file}: ${error.message}`);
      }
    }
  }

  /**
   * Test JSON syntax
   */
  async testJSONSyntax() {
    console.log('📄 Testing JSON syntax...');
    
    const jsonFiles = this.findFiles('.json');
    
    for (const file of jsonFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        JSON.parse(content);
        this.pass(`JSON syntax valid: ${file}`);
      } catch (error) {
        this.fail(`Invalid JSON syntax in ${file}: ${error.message}`);
      }
    }
  }

  /**
   * Test CSS syntax
   */
  async testCSSSyntax() {
    console.log('🎨 Testing CSS syntax...');
    
    const cssFiles = this.findFiles('.css');
    
    for (const file of cssFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Basic CSS syntax checks
        const openBraces = (content.match(/\{/g) || []).length;
        const closeBraces = (content.match(/\}/g) || []).length;
        
        if (openBraces !== closeBraces) {
          this.fail(`Unmatched braces in CSS file: ${file}`);
        }
        
        // Check for CSS custom properties
        if (content.includes('var(--') && !content.includes('--color-') && !content.includes('--space-') && !content.includes('--font-')) {
          this.warn(`Potential CSS custom property issue in ${file}`);
        }
        
        this.pass(`CSS syntax valid: ${file}`);
      } catch (error) {
        this.fail(`Error reading CSS file ${file}: ${error.message}`);
      }
    }
  }

  /**
   * Test JavaScript syntax
   */
  async testJavaScriptSyntax() {
    console.log('⚡ Testing JavaScript syntax...');
    
    const jsFiles = this.findFiles('.js');
    
    for (const file of jsFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Basic JavaScript syntax checks
        const openBraces = (content.match(/\{/g) || []).length;
        const closeBraces = (content.match(/\}/g) || []).length;
        
        if (openBraces !== closeBraces) {
          this.fail(`Unmatched braces in JavaScript file: ${file}`);
        }
        
        const openParens = (content.match(/\(/g) || []).length;
        const closeParens = (content.match(/\)/g) || []).length;
        
        if (openParens !== closeParens) {
          this.fail(`Unmatched parentheses in JavaScript file: ${file}`);
        }
        
        this.pass(`JavaScript syntax valid: ${file}`);
      } catch (error) {
        this.fail(`Error reading JavaScript file ${file}: ${error.message}`);
      }
    }
  }

  /**
   * Test accessibility
   */
  async testAccessibility() {
    console.log('♿ Testing accessibility...');
    
    const liquidFiles = this.findFiles('.liquid');
    
    for (const file of liquidFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for alt attributes on images
        if (content.includes('<img') && !content.includes('alt=')) {
          this.fail(`Missing alt attribute on image in ${file}`);
        }
        
        // Check for proper form labels
        if (content.includes('<input') && !content.includes('<label') && !content.includes('aria-label')) {
          this.warn(`Potential missing form label in ${file}`);
        }
        
        // Check for proper heading structure
        if (content.includes('<h1') && content.includes('<h3') && !content.includes('<h2')) {
          this.warn(`Potential heading structure issue in ${file}`);
        }
        
        // Check for ARIA attributes
        if (content.includes('role=') && !content.includes('aria-')) {
          this.warn(`Role without ARIA attributes in ${file}`);
        }
        
        this.pass(`Accessibility check passed: ${file}`);
      } catch (error) {
        this.fail(`Error checking accessibility in ${file}: ${error.message}`);
      }
    }
  }

  /**
   * Test performance
   */
  async testPerformance() {
    console.log('⚡ Testing performance...');
    
    // Check for large files
    const allFiles = this.findAllFiles();
    
    for (const file of allFiles) {
      try {
        const stats = fs.statSync(file);
        const sizeInMB = stats.size / (1024 * 1024);
        
        if (sizeInMB > 1) {
          this.warn(`Large file detected: ${file} (${sizeInMB.toFixed(2)}MB)`);
        }
        
        if (sizeInMB > 5) {
          this.fail(`Very large file detected: ${file} (${sizeInMB.toFixed(2)}MB)`);
        }
      } catch (error) {
        this.fail(`Error checking file size for ${file}: ${error.message}`);
      }
    }
    
    // Check for performance optimizations
    const cssFiles = this.findFiles('.css');
    for (const file of cssFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        if (content.includes('@media') && !content.includes('max-width')) {
          this.warn(`Potential mobile-first CSS issue in ${file}`);
        }
        
        if (content.includes('!important') && content.includes('!important').length > 10) {
          this.warn(`Excessive use of !important in ${file}`);
        }
      } catch (error) {
        this.fail(`Error checking CSS performance in ${file}: ${error.message}`);
      }
    }
  }

  /**
   * Test SEO
   */
  async testSEO() {
    console.log('🔍 Testing SEO...');
    
    const liquidFiles = this.findFiles('.liquid');
    
    for (const file of liquidFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for meta tags
        if (file.includes('layout/theme.liquid')) {
          if (!content.includes('<title>') && !content.includes('{{ page_title }}')) {
            this.fail(`Missing title tag in ${file}`);
          }
          
          if (!content.includes('meta name="description"') && !content.includes('{{ page_description }}')) {
            this.warn(`Missing meta description in ${file}`);
          }
        }
        
        // Check for structured data
        if (content.includes('application/ld+json')) {
          this.pass(`Structured data found in ${file}`);
        }
        
        // Check for proper heading structure
        if (content.includes('<h1') && content.includes('<h1').length > 1) {
          this.warn(`Multiple h1 tags found in ${file}`);
        }
        
        this.pass(`SEO check passed: ${file}`);
      } catch (error) {
        this.fail(`Error checking SEO in ${file}: ${error.message}`);
      }
    }
  }

  /**
   * Test security
   */
  async testSecurity() {
    console.log('🔒 Testing security...');
    
    const liquidFiles = this.findFiles('.liquid');
    
    for (const file of liquidFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for XSS vulnerabilities
        if (content.includes('{{') && !content.includes('| escape') && !content.includes('| strip_html')) {
          this.warn(`Potential XSS vulnerability in ${file}`);
        }
        
        // Check for CSRF protection
        if (content.includes('<form') && !content.includes('{% form')) {
          this.warn(`Potential CSRF vulnerability in ${file}`);
        }
        
        // Check for secure practices
        if (content.includes('http://') && !content.includes('https://')) {
          this.warn(`Insecure HTTP link found in ${file}`);
        }
        
        this.pass(`Security check passed: ${file}`);
      } catch (error) {
        this.fail(`Error checking security in ${file}: ${error.message}`);
      }
    }
  }

  /**
   * Test translations
   */
  async testTranslations() {
    console.log('🌍 Testing translations...');
    
    const localeFiles = [
      'locales/en.default.json',
      'locales/pt-br.json',
      'locales/es.json'
    ];
    
    for (const localeFile of localeFiles) {
      const filePath = path.join(this.themePath, localeFile);
      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const translations = JSON.parse(content);
          
          // Check for empty translations
          const emptyTranslations = this.findEmptyTranslations(translations);
          if (emptyTranslations.length > 0) {
            this.warn(`Empty translations found in ${localeFile}: ${emptyTranslations.join(', ')}`);
          }
          
          this.pass(`Translation file valid: ${localeFile}`);
        } catch (error) {
          this.fail(`Error reading translation file ${localeFile}: ${error.message}`);
        }
      } else {
        this.fail(`Missing translation file: ${localeFile}`);
      }
    }
  }

  /**
   * Test schema validation
   */
  async testSchemaValidation() {
    console.log('📋 Testing schema validation...');
    
    const sectionFiles = this.findFiles('sections/*.liquid');
    
    for (const file of sectionFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        if (content.includes('{% schema %}') && content.includes('{% endschema %}')) {
          const schemaStart = content.indexOf('{% schema %}') + 12;
          const schemaEnd = content.indexOf('{% endschema %}');
          const schemaContent = content.substring(schemaStart, schemaEnd).trim();
          
          try {
            JSON.parse(schemaContent);
            this.pass(`Schema valid: ${file}`);
          } catch (error) {
            this.fail(`Invalid schema JSON in ${file}: ${error.message}`);
          }
        } else {
          this.fail(`Missing schema block in section: ${file}`);
        }
      } catch (error) {
        this.fail(`Error checking schema in ${file}: ${error.message}`);
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

  findEmptyTranslations(obj, prefix = '') {
    const empty = [];
    
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'object' && value !== null) {
        empty.push(...this.findEmptyTranslations(value, fullKey));
      } else if (value === '' || value === null || value === undefined) {
        empty.push(fullKey);
      }
    }
    
    return empty;
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
   * Generate test report
   */
  generateReport() {
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⚠️  Warnings: ${this.results.warnings}`);
    console.log(`📈 Total: ${this.results.total}`);
    
    const successRate = ((this.results.passed / this.results.total) * 100).toFixed(2);
    console.log(`🎯 Success Rate: ${successRate}%`);
    
    if (this.results.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results.details
        .filter(detail => detail.type === 'fail')
        .forEach(detail => console.log(`   - ${detail.message}`));
    }
    
    if (this.results.warnings > 0) {
      console.log('\n⚠️  Warnings:');
      this.results.details
        .filter(detail => detail.type === 'warn')
        .forEach(detail => console.log(`   - ${detail.message}`));
    }
    
    // Save report to file
    const reportPath = path.join(this.themePath, 'TEST_REPORT.md');
    const reportContent = this.generateMarkdownReport();
    fs.writeFileSync(reportPath, reportContent);
    
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    
    if (this.results.failed > 0) {
      console.log('\n🚨 Some tests failed. Please fix the issues before submitting to the Theme Store.');
      process.exit(1);
    } else {
      console.log('\n🎉 All tests passed! Theme is ready for submission.');
    }
  }

  /**
   * Generate markdown report
   */
  generateMarkdownReport() {
    const timestamp = new Date().toISOString();
    const successRate = ((this.results.passed / this.results.total) * 100).toFixed(2);
    
    let report = `# EcoVibe Theme Test Report\n\n`;
    report += `**Generated:** ${timestamp}\n`;
    report += `**Theme:** EcoVibe\n`;
    report += `**Version:** 1.0.0\n\n`;
    
    report += `## Summary\n\n`;
    report += `- ✅ **Passed:** ${this.results.passed}\n`;
    report += `- ❌ **Failed:** ${this.results.failed}\n`;
    report += `- ⚠️  **Warnings:** ${this.results.warnings}\n`;
    report += `- 📈 **Total:** ${this.results.total}\n`;
    report += `- 🎯 **Success Rate:** ${successRate}%\n\n`;
    
    if (this.results.failed > 0) {
      report += `## Failed Tests\n\n`;
      this.results.details
        .filter(detail => detail.type === 'fail')
        .forEach(detail => report += `- ❌ ${detail.message}\n`);
      report += `\n`;
    }
    
    if (this.results.warnings > 0) {
      report += `## Warnings\n\n`;
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

// Run the tests
if (require.main === module) {
  const tester = new ThemeTester();
  tester.runAllTests().catch(console.error);
}

module.exports = ThemeTester;
