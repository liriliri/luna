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
  url: '/wallpaper.jpg',
})
console.log(cropper.getData())
```

## Configuration

* url(string): Image url.
* preview(HTMLElement): Preview dom container.

## Api

### getData(): object

Get size, position data of image and crop box.

### getCanvas(): HTMLCanvasElement

Get a canvas with cropped image drawn.

### reset(): void

Resize crop box.