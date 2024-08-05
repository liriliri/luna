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
  image: 'https://luna.liriliri.io/pic1.png',
})
imageViewer.zoom(0.1)
```

## Configuration

* image(string): Image src.
* initialCoverage(number): Initial coverage.
* zoomOnWheel(boolean): Enable to zoom the image by mouse wheel.

## Api

### reset(): void

Reset image to initial state.

### rotate(degree: number): void

Rotate image with a relative degree.

### rotateTo(degree: number): void

Rotate image to an absolute degree.

### zoom(ratio: number, pivot?: IPivot): void

Zoom image with a relative ratio.

### zoomTo(ratio: number, pivot?: IPivot): void

Zoom image to an absolute ratio.

## Types

### IPivot

* x(number): Pivot point x.
* y(number): Pivot point y.
