# Luna Gallery

Lightweight gallery.

## Demo

https://luna.liriliri.io/?path=/story/gallery

## Install

Add the following script and style to your page.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-carousel/luna-carousel.css" />
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-image-viewer/luna-image-viewer.css" />
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-toolbar/luna-toolbar.css" />
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-gallery/luna-gallery.css" />
<script src="//cdn.jsdelivr.net/npm/luna-carousel/luna-carousel.js"></script>
<script src="//cdn.jsdelivr.net/npm/luna-image-viewer/luna-image-viewer.js"></script>
<script src="//cdn.jsdelivr.net/npm/luna-toolbar/luna-toolbar.js"></script>
<script src="//cdn.jsdelivr.net/npm/luna-gallery/luna-gallery.js"></script>
```

You can also get it on npm.

```bash
npm install luna-gallery luna-toolbar luna-image-viewer luna-carousel --save
```

```javascript
import 'luna-carousel/luna-carousel.css'
import 'luna-image-viewer/luna-image-viewer.css'
import 'luna-toolbar/luna-toolbar.css'
import 'luna-gallery/luna-gallery.css'
import LunaGallery from 'luna-gallery'
```

## Usage

```javascript
const gallery = new LunaGallery(container)
gallery.append('https://luna.liriliri.io/pic1.png', 'pic1.png')
gallery.show()
```

## Configuration

* inline(boolean): Enable inline mode.

## Api

### append(src: string, title?: string): void

Append image.

### clear(): void

Clear all images.

### insert(pos: number, src: string, title?: string): void

Insert image at given position.

### slideTo(idx: number): void

Slide to the item at given index.
