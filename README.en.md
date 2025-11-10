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

**[Live Demo](https://lledellebell.github.io/peek-carousel/examples/example-built.html)**

> [한국어](./README.md)

## Features

- **3 Layout Modes** - Stack/Card, Radial Rotation, Classic Slide
- **Full Interaction Support** - Touch/drag, keyboard, and mouse wheel navigation
- **Zero Dependencies** - Built with pure vanilla JavaScript
- **Fully Accessible** - ARIA support and keyboard navigation

## Installation

```bash
npm install peek-carousel
```

```javascript
import PeekCarousel from 'peek-carousel';
```

Or via CDN:

```html
<link rel="stylesheet" href="https://unpkg.com/peek-carousel/dist/peek-carousel.min.css">
<script src="https://unpkg.com/peek-carousel/dist/peek-carousel.min.js"></script>
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
  layoutMode: 'stack', // 'stack', 'radial', 'classic'
  autoRotate: false
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

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile Safari (iOS 12+)
- Chrome Mobile (Android 5+)

## Usage Examples

```javascript
// Basic usage
const carousel = new PeekCarousel('#myCarousel');

// Change layout mode
new PeekCarousel('#myCarousel', { layoutMode: 'radial' });

// Enable auto-rotate
new PeekCarousel('#myCarousel', { autoRotate: true });
```

## Customization

Override CSS classes to customize styles:

```css
.peek-carousel__btn { /* Button styles */ }
.peek-carousel__indicator--active::before { /* Indicator styles */ }
```

## Development

```bash
git clone https://github.com/lledellebell/peek-carousel.git
npm install
npm run build
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) file for details

## Credits

Inspired by the swipe interaction on the iPhone 17 Pro product page.

- [Image 1](./public/motivation0.png)

## Changelog

See [GitHub Releases](https://github.com/lledellebell/peek-carousel/releases) for the changelog.
