# Luna Carousel

Lightweight carousel.

## Demo

https://luna.liriliri.io/?path=/story/carousel

## Install

Add the following script and style to your page.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-carousel/luna-carousel.css" />
<script src="//cdn.jsdelivr.net/npm/luna-carousel/luna-carousel.js"></script>
```

You can also get it on npm.

```bash
npm install luna-carousel --save
```

```javascript
import 'luna-carousel/luna-carousel.css'
import LunaCarousel from 'luna-carousel'
```

## Usage

```javascript
const carousel = new LunaCarousel(container, { interval: 5000 })
carousel.append('<div style="background:#e73c5e;">ITEM 1</div>')
```

## Configuration

* interval(number): Time between automatically cycling. 

## Api

### cycle(): void

Cycle through the carousel items.

### pause(): void

Stop cycling.

### prev(): void

Slide to the previous item.

### next(): void

Slide to the next item.

### slideTo(idx: number): void

Slide to the item at given index.

### append(content: string | HTMLElement): void

Append item.

### insert(pos: number, content: string | HTMLElement): void

Insert item at given position.