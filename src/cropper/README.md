# Luna Cropper

Image cropper.

## Demo

https://luna.liriliri.io/?path=/story/cropper

## Install

Add the following script and style to your page.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-cropper/luna-cropper.css" />
<script src="//cdn.jsdelivr.net/npm/luna-cropper/luna-cropper.js"></script>
```

You can also get it on npm.

```bash
npm install luna-cropper --save
```

```javascript
import 'luna-cropper/luna-cropper.css'
import LunaCropper from 'luna-cropper'
```

## Usage

```javascript
const container = document.getElementById('container')
const cropper = new LunaCropper(container, {
  url: 'https://res.liriliri.io/luna/wallpaper.jpg',
})
console.log(cropper.getData())
```

## Configuration

* preview(null | HTMLElement): Preview dom container.
* url(string): Image url.

## Api

### getCanvas(): HTMLCanvasElement

Get a canvas with cropped image drawn.

### getData(): object

Get size, position data of image and crop box.

### reset(): void

Resize crop box.
