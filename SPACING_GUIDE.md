# Spacing & Styling Guide

## Overview

This Shopify Liquid theme implements a modern, comprehensive design system with customizable spacing and styling through the settings schema. The system follows current best practices for accessibility, responsiveness, and maintainability.

## Design System Architecture

### 1. CSS Custom Properties (Design Tokens)

All styling values are defined as CSS custom properties in `assets/base.css`, making them easily customizable through the Shopify theme settings.

### 2. Modular Spacing Scale

The theme uses a consistent spacing scale based on modern design principles:

```css
--spacing-xs: 0.25rem (4px)
--spacing-sm: 0.5rem (8px)
--spacing-md: 1rem (16px)
--spacing-lg: 1.5rem (24px)
--spacing-xl: 2rem (32px)
--spacing-2xl: 3rem (48px)
--spacing-3xl: 4rem (64px)
--spacing-4xl: 6rem (96px)
```

### 3. Logical Properties Support

Modern CSS logical properties are used for better internationalization:

```css
/* Block (vertical) spacing */
--spacing-block-xs, --spacing-block-sm, etc.

/* Inline (horizontal) spacing */
--spacing-inline-xs, --spacing-inline-sm, etc.
```

## Modern CSS Features

### 1. Fluid Typography

When enabled, font sizes use `clamp()` for responsive scaling:

```css
--font-size-base: clamp(1rem, 2.5vw, 1.125rem);
```

### 2. Container Queries

Support for component-based responsive design:

```css
@container (min-width: 640px) {
  .container-md\:text-base { font-size: var(--font-size-base); }
}
```

### 3. Aspect Ratio Utilities

Modern aspect ratio utilities for consistent media sizing:

```css
.aspect-square { aspect-ratio: 1 / 1; }
.aspect-video { aspect-ratio: 16 / 9; }
.aspect-photo { aspect-ratio: 4 / 3; }
```

## Accessibility Features

### 1. Focus Management

Customizable focus outlines with proper spacing:

```css
--focus-outline-width: 2px;
```

### 2. Touch Targets

Minimum touch target size for mobile accessibility:

```css
--touch-target-size: 44px;
```

### 3. Reading Flow

Automatic spacing for optimal reading experience:

```css
.reading-flow > * + * {
  margin-block-start: var(--spacing-md);
}
```

## Utility Classes

### Spacing Utilities

#### Traditional Spacing
```css
.m-xs, .m-sm, .m-md, .m-lg, .m-xl
.p-xs, .p-sm, .p-md, .p-lg, .p-xl
```

#### Logical Properties
```css
.mb-block-xs, .mt-block-sm, .my-block-md
.mr-inline-xs, .ml-inline-sm, .mx-inline-md
```

#### Gap Utilities
```css
.gap-xs, .gap-sm, .gap-md, .gap-lg, .gap-xl
.gap-block-xs, .gap-inline-sm
```

### Typography Utilities

```css
.text-xs, .text-sm, .text-base, .text-lg, .text-xl
.font-light, .font-normal, .font-medium, .font-semibold, .font-bold
```

### Layout Utilities

```css
.flex, .grid, .block, .inline-block
.items-center, .justify-between, .flex-col, .flex-row
```

## Settings Schema Customization

### Typography Settings
- Font family selection (primary/secondary)
- Font size ranges (xs to 5xl)
- Line height controls
- Fluid typography toggle

### Spacing Settings
- Spacing scale customization (xs to 4xl)
- Container max width options
- Container padding controls

### Modern CSS Features
- Fluid typography enable/disable
- Logical properties toggle
- Container queries support

### Accessibility Settings
- Focus outline width
- Touch target size
- Reading line length

### Liquid Glass Effects
- Glass effect toggle
- Background colors
- Blur intensity controls
- Shadow customization

## Best Practices

### 1. Use Design Tokens

Always use CSS custom properties instead of hardcoded values:

```css
/* ✅ Good */
padding: var(--spacing-md);

/* ❌ Avoid */
padding: 16px;
```

### 2. Logical Properties

Use logical properties for better internationalization:

```css
/* ✅ Good */
margin-block-start: var(--spacing-md);
padding-inline: var(--spacing-lg);

/* ❌ Avoid */
margin-top: var(--spacing-md);
padding-left: var(--spacing-lg);
padding-right: var(--spacing-lg);
```

### 3. Responsive Design

Use utility classes for responsive behavior:

```css
/* ✅ Good */
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">

/* ❌ Avoid */
<div style="display: grid; grid-template-columns: repeat(3, 1fr);">
```

### 4. Accessibility

Always consider accessibility:

```css
/* ✅ Good */
<button class="btn btn-primary touch-target focus-spacing">

/* ❌ Avoid */
<button style="padding: 4px;">
```

## Browser Support

- Modern browsers with CSS custom properties support
- Logical properties: Chrome 69+, Firefox 41+, Safari 12.2+
- Container queries: Chrome 105+, Firefox 110+, Safari 16+
- Aspect ratio: Chrome 88+, Firefox 89+, Safari 15+

## Performance Considerations

1. **Critical CSS**: Essential styles are inlined in `critical.css`
2. **Design Tokens**: CSS custom properties reduce CSS size
3. **Utility Classes**: Reusable classes reduce duplication
4. **Conditional Features**: Modern features can be disabled for older browsers

## Migration Guide

### From Hardcoded Values

```css
/* Before */
.section {
  padding: 20px;
  margin-bottom: 30px;
}

/* After */
.section {
  padding: var(--spacing-lg);
  margin-block-end: var(--spacing-xl);
}
```

### From Traditional Properties

```css
/* Before */
.card {
  margin-top: 16px;
  margin-bottom: 16px;
  padding-left: 24px;
  padding-right: 24px;
}

/* After */
.card {
  margin-block: var(--spacing-md);
  padding-inline: var(--spacing-lg);
}
```

## Conclusion

This design system provides a solid foundation for building accessible, responsive, and maintainable Shopify themes. The comprehensive settings schema allows for extensive customization while maintaining consistency and best practices.

For questions or contributions, please refer to the main project documentation.
