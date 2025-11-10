# PeekCarousel

[![npm version](https://badgen.net/npm/v/peek-carousel)](https://www.npmjs.com/package/peek-carousel)
[![npm downloads](https://badgen.net/npm/dm/peek-carousel)](https://www.npmjs.com/package/peek-carousel)
[![bundle size](https://badgen.net/bundlephobia/minzip/peek-carousel)](https://bundlephobia.com/package/peek-carousel)
[![license](https://badgen.net/npm/license/peek-carousel)](https://opensource.org/licenses/MIT)

[![stars](https://badgen.net/github/stars/lledellebell/peek-carousel)](https://github.com/lledellebell/peek-carousel/stargazers)
[![issues](https://badgen.net/github/open-issues/lledellebell/peek-carousel)](https://github.com/lledellebell/peek-carousel/issues)
[![forks](https://badgen.net/github/forks/lledellebell/peek-carousel)](https://github.com/lledellebell/peek-carousel/network/members)
[![last commit](https://badgen.net/github/last-commit/lledellebell/peek-carousel)](https://github.com/lledellebell/peek-carousel/commits)

[![JavaScript](https://badgen.net/badge/JavaScript/ES6+/yellow)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![SCSS](https://badgen.net/badge/SCSS/Sass/pink)](https://sass-lang.com/)
[![dependencies](https://badgen.net/badge/dependencies/0/green)](https://www.npmjs.com/package/peek-carousel)

A modular carousel library inspired by the swipe interaction on the iPhone 17 Pro product page. Features a 'peek effect' where the next/previous items are slightly visible on either side of the active item, providing intuitive navigation. Supports three layout modes (Stack/Card, Radial Rotation, Classic Slide) with smooth transitions, touch/drag support, and full accessibility.

> [한국어](./README.md)

## Features

- **Three Layout Modes**
  - **Stack/Card Mode**: Center card with left/right peek preview
  - **Radial Rotation Mode**: 3D circular rotation carousel
  - **Classic Slide Mode**: Horizontal slide layout with center active item and peek display
- **Modular Architecture** - Extensible structure built with ES6 modules
- **Auto Icon Injection** - Navigation and auto-rotate button icons automatically provided
- **Fully Responsive** - Optimized experience on all devices
- **Touch & Drag** - Swipe and drag support with momentum scrolling
- **Keyboard Navigation** - Arrow keys, Home/End, Space, number keys (1-N)
- **Auto-rotate** - Optional automatic carousel rotation with progress indicators
- **Accessible** - Full ARIA support and keyboard navigation
- **Performance Optimized** - Image preloading, momentum scrolling, shortest-path rotation
- **Customizable** - Easy theming with SCSS variables
- **Zero Dependencies** - Pure vanilla JavaScript
- **Multiple Build Formats** - ESM, UMD, and minified versions available

## Installation

### NPM

```bash
npm install peek-carousel
```

### CDN

```html
<!-- CSS -->
<link rel="stylesheet" href="https://unpkg.com/peek-carousel/dist/peek-carousel.min.css">

<!-- JavaScript (UMD) -->
<script src="https://unpkg.com/peek-carousel/dist/peek-carousel.min.js"></script>
```

### ES Module

```javascript
import PeekCarousel from 'peek-carousel';
```

### Manual

Download the latest release and include the files:

```html
<!-- CSS -->
<link rel="stylesheet" href="path/to/dist/peek-carousel.min.css">

<!-- JavaScript (UMD) -->
<script src="path/to/dist/peek-carousel.min.js"></script>
```

Or use ES Module:

```javascript
import PeekCarousel from './dist/peek-carousel.esm.min.js';
```

## Quick Start

### 1. HTML Structure

```html
<div class="peek-carousel" id="myCarousel">
  <div class="peek-carousel__track">
    <!-- Carousel Items -->
    <div class="peek-carousel__item">
      <figure class="peek-carousel__figure">
        <img class="peek-carousel__image" src="image1.jpg" alt="Image 1" width="650" height="490" />
        <figcaption class="peek-carousel__caption">
          <span class="peek-carousel__caption-title">Image 1</span>
          <span class="peek-carousel__caption-subtitle">Description</span>
        </figcaption>
      </figure>
    </div>

    <div class="peek-carousel__item">
      <figure class="peek-carousel__figure">
        <img class="peek-carousel__image" src="image2.jpg" alt="Image 2" width="650" height="490" />
        <figcaption class="peek-carousel__caption">
          <span class="peek-carousel__caption-title">Image 2</span>
          <span class="peek-carousel__caption-subtitle">Description</span>
        </figcaption>
      </figure>
    </div>

    <!-- More items... -->
  </div>
</div>

<!-- Navigation buttons, indicators, auto-rotate button, and counter are automatically generated -->
```

### 2. Initialize JavaScript

```javascript
const carousel = new PeekCarousel('#myCarousel', {
  startIndex: 0,
  layoutMode: 'stack', // 'stack', 'radial', or 'classic'
  autoRotate: false,
  autoRotateInterval: 3000,
  swipeThreshold: 50,
  dragThreshold: 80,
  preloadRange: 2,
  enableKeyboard: true,
  enableWheel: true,
  enableTouch: true,
  enableMouse: true
});
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `startIndex` | `number` | `0` | Starting slide index (0-based) |
| `layoutMode` | `string` | `'stack'` | Layout mode: `'stack'` (Stack/Card), `'radial'` (circular rotation), or `'classic'` (classic slide) |
| `autoRotate` | `boolean` | `false` | Enable auto-rotation on init |
| `autoRotateInterval` | `number` | `2500` | Auto-rotation interval in milliseconds |
| `swipeThreshold` | `number` | `50` | Swipe threshold distance in pixels |
| `dragThreshold` | `number` | `80` | Drag threshold distance in pixels |
| `preloadRange` | `number` | `2` | Number of images to preload around current item |
| `enableKeyboard` | `boolean` | `true` | Enable keyboard navigation |
| `enableWheel` | `boolean` | `true` | Enable mouse wheel navigation |
| `enableTouch` | `boolean` | `true` | Enable touch/swipe navigation |
| `enableMouse` | `boolean` | `true` | Enable mouse drag navigation |
| `showNavigation` | `boolean` | `true` | Show navigation buttons |
| `showCounter` | `boolean` | `true` | Show counter display |
| `showIndicators` | `boolean` | `true` | Show indicator buttons |
| `showAutoRotateButton` | `boolean` | `true` | Show auto-rotate toggle button |

## API Methods

### Navigation

```javascript
// Go to next slide
carousel.next();

// Go to previous slide
carousel.prev();

// Go to specific slide (0-based index)
carousel.goTo(2);
```

### Auto-rotate

```javascript
// Start auto-rotation
carousel.startAutoRotate();

// Stop auto-rotation
carousel.stopAutoRotate();

// Toggle auto-rotation
carousel.toggleAutoRotate();
```

### Cleanup

```javascript
// Destroy carousel and remove event listeners
carousel.destroy();
```

### Properties

```javascript
// Get current slide index
console.log(carousel.currentIndex);

// Get total number of slides
console.log(carousel.totalItems);

// Check if auto-rotating
console.log(carousel.isAutoRotating);
```

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `←` / `→` | Previous / Next slide |
| `Home` | Jump to first slide |
| `End` | Jump to last slide |
| `1` - `N` | Jump to specific slide (1-based) |
| `Space` | Toggle auto-rotate |

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile Safari (iOS 12+)
- Chrome Mobile (Android 5+)

## Usage Examples

### Basic Usage

```javascript
const carousel = new PeekCarousel('#myCarousel');
```

### Radial Mode

```javascript
const carousel = new PeekCarousel('#myCarousel', {
  layoutMode: 'radial' // 3D circular rotation
});
```

### Classic Slide Mode

```javascript
const carousel = new PeekCarousel('#myCarousel', {
  layoutMode: 'classic' // Horizontal slide layout
});
```

### With Auto-rotate

```javascript
const carousel = new PeekCarousel('#myCarousel', {
  autoRotate: true,
  autoRotateInterval: 5000
});
```

### Dynamic Layout Mode Switching

```javascript
const carousel = new PeekCarousel('#myCarousel');

// Change layout mode
carousel.options.layoutMode = 'radial'; // or 'classic'
carousel.updateLayoutClass();
carousel.animator.updateCarousel();
```

### Disable Interactions

```javascript
const carousel = new PeekCarousel('#myCarousel', {
  enableKeyboard: false,
  enableWheel: false,
  enableMouse: false
});
```

### Programmatic Control

```javascript
const carousel = new PeekCarousel('#myCarousel');

// Navigate programmatically
document.getElementById('customNext').addEventListener('click', () => {
  carousel.next();
});

// Jump to specific slide
document.getElementById('jumpToSlide3').addEventListener('click', () => {
  carousel.goTo(2); // 0-based index
});
```

## Customization

You can customize the carousel by overriding CSS styles:

```css
/* Button styles */
.peek-carousel__btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Indicator styles */
.peek-carousel__indicator--active::before {
  background: #667eea;
}

/* Mode-specific styles */
.peek-carousel--stack .peek-carousel__item { /* ... */ }
.peek-carousel--radial .peek-carousel__item { /* ... */ }
.peek-carousel--classic .peek-carousel__item { /* ... */ }
```

## Development

### Build Setup

```bash
# Clone repository
git clone https://github.com/lledellebell/peek-carousel.git
cd peek-carousel

# Install dependencies
npm install

# Production build
npm run build

# Start development server (Python)
python -m http.server 8080

# Open http://localhost:8080/examples/example-built.html
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) file for details

## Credits

Inspired by the swipe interaction on the iPhone 17 Pro product page.

- [Image 1](./public/motivation0.png)

## Changelog

### 1.0.0 (2025-01-XX)
- Initial release
- **Three Layout Modes**: Stack/Card, Radial Rotation, Classic Slide
- **Modular Architecture**: Extensible structure built with ES6 modules
- **Shortest-path Rotation**: Optimized rotation algorithm in Radial mode
- **Full Touch/Drag Support**: Including momentum scrolling
- **Keyboard Navigation**: Arrow keys, Home/End, Space, number keys
- **Auto-rotate Feature**: Apple Camera-style progress indicators
- **Auto Icon Injection**: Navigation and auto-rotate button icons automatically provided
- **Multiple Build Formats**: ESM, UMD, and minified versions
- **SCSS-based Styling**: Customizable variables
- **Full Accessibility**: ARIA support
