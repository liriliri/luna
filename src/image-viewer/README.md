# Luna Image Viewer

Single image viewer.

## Demo

https://luna.liriliri.io/?path=/story/image-viewer

## Install

Add the following script and style to your page.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-image-viewer/luna-image-viewer.css" />
<script src="//cdn.jsdelivr.net/npm/luna-image-viewer/luna-image-viewer.js"></script>
```

You can also get it on npm.

```bash
npm install luna-image-viewer --save
```

```javascript
import 'luna-image-viewer/luna-image-viewer.css'
import LunaImageViewer from 'luna-image-viewer'
```

## Usage

```javascript
const imageViewer = new LunaImageViewer(container, {
  image: 'https://res.liriliri.io/luna/pic1.jpg',
})
imageViewer.zoom(0.1)
```

## Configuration

* image(string): Image src.
* initialCoverage(number): Initial coverage.

## Api

### reset(): void

Reset image to initial state.

### rotate(degree: number): void

Rotate image with a relative degree.

### rotateTo(degree: number): void

Rotate image to an absolute degree.

### zoom(ratio: number): void

Zoom image with a relative ratio.

### zoomTo(ratio: number): void

Zoom image to an absolute ratio.
