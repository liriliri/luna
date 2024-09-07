# Luna Image List

Show list of images.

## Demo

https://luna.liriliri.io/?path=/story/image-list

## Install

Add the following script and style to your page.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-carousel/luna-carousel.css" />
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-image-viewer/luna-image-viewer.css" />
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-toolbar/luna-toolbar.css" />
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-gallery/luna-gallery.css" />
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-image-list/luna-image-list.css" />
<script src="//cdn.jsdelivr.net/npm/luna-carousel/luna-carousel.js"></script>
<script src="//cdn.jsdelivr.net/npm/luna-image-viewer/luna-image-viewer.js"></script>
<script src="//cdn.jsdelivr.net/npm/luna-toolbar/luna-toolbar.js"></script>
<script src="//cdn.jsdelivr.net/npm/luna-gallery/luna-gallery.js"></script>
<script src="//cdn.jsdelivr.net/npm/luna-image-list/luna-image-list.js"></script>
```

You can also get it on npm.

```bash
npm install luna-image-list luna-gallery luna-toolbar luna-image-viewer luna-carousel --save
```

```javascript
import 'luna-carousel/luna-carousel.css'
import 'luna-image-viewer/luna-image-viewer.css'
import 'luna-toolbar/luna-toolbar.css'
import 'luna-gallery/luna-gallery.css'
import 'luna-image-list/luna-image-list.css'
import LunaImageList from 'luna-image-list'
```

## Usage

```javascript
const imageList = new LunaImageList(container)
imageList.append('https://luna.liriliri.io/pic1.png', 'pic1.png')
```

## Configuration

* horizontalMargin(number): Horizontal margin.
* rowHeight(number): Row height.
* showTitle(boolean): Show title.
* verticalMargin(number): Vertical margin.

## Api

### append(src: string, title?: string): void

Append image.
