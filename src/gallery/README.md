# Luna Gallery

Lightweight gallery.

## Demo

https://luna.liriliri.io/?path=/story/gallery

## Install

Add the following script and style to your page.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-carousel/luna-carousel.css" />
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-gallery/luna-gallery.css" />
<script src="//cdn.jsdelivr.net/npm/luna-carousel/luna-carousel.js"></script>
<script src="//cdn.jsdelivr.net/npm/luna-gallery/luna-gallery.js"></script>
```

You can also get it on npm.

```bash
npm install luna-gallery luna-carousel --save
```

```javascript
import 'luna-carousel/luna-carousel.css'
import 'luna-gallery/luna-gallery.css'
import LunaGallery from 'luna-gallery'
```

## Usage

```javascript
const container = document.getElementById('container')
const gallery = new LunaGallery(container)
gallery.append('https://res.liriliri.io/chii/pic1.jpg', 'pic1.jpg')
gallery.show()
```

## Api

### append(src: string, title?: string): void

Append image.

### clear(): void

Clear all images.

### insert(pos: number, src: string, title?: string): void

Insert image at given position.

### slideTo(idx: number): void

Slide to the item at given index.
