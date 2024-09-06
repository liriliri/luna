# Luna Image List

Show list of images.

## Demo

https://luna.liriliri.io/?path=/story/image-list

## Install

Add the following script and style to your page.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-image-list/luna-image-list.css" />
<script src="//cdn.jsdelivr.net/npm/luna-image-list/luna-image-list.js"></script>
```

You can also get it on npm.

```bash
npm install luna-image-list --save
```

```javascript
import 'luna-image-list/luna-image-list.css'
import LunaImageList from 'luna-image-list'
```

## Usage

```javascript
const imageList = new LunaImageList(container)
imageList.append('https://luna.liriliri.io/pic1.png', 'pic1.png')
```

## Configuration

* rowHeight(number): Row height.
