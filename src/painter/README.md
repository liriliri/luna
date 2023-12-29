# Luna Painter

Simple drawing tool.

## Demo

https://luna.liriliri.io/?path=/story/painter

## Install

Add the following script and style to your page.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-painter/luna-painter.css" />
<script src="//cdn.jsdelivr.net/npm/luna-painter/luna-painter.js"></script>
```

You can also get it on npm.

```bash
npm install luna-painter --save
```

```javascript
import 'luna-painter/luna-painter.css'
import LunaPainter from 'luna-painter'
```

## Usage

```javascript
const container = document.getElementById('container')
const painer = new LunaPainter(container)
```
