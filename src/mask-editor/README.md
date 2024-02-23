# Luna Mask Editor

Image mask editing.

## Demo

https://luna.liriliri.io/?path=/story/mask-editor

## Install

Add the following script and style to your page.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-toolbar/luna-toolbar.css" />
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-painter/luna-painter.css" />
<script src="//cdn.jsdelivr.net/npm/luna-toolbar/luna-toolbar.js"></script>
<script src="//cdn.jsdelivr.net/npm/luna-painter/luna-painter.js"></script>
<script src="//cdn.jsdelivr.net/npm/luna-mask-editor/luna-mask-editor.js"></script>
```

You can also get it on npm.

```bash
npm install luna-mask-editor luna-painter luna-toolbar --save
```

```javascript
import 'luna-toolbar/luna-toolbar.css'
import 'luna-painter/luna-painter.css'
import LunaMaskEditor from 'luna-mask-editor'
```

## Usage

```javascript
const container = document.getElementById('container')
const maskEditor = new LunaMaskEditor(container)
```

## Configuration

* image(string): Image src.

## Api

### getCanvas(): HTMLCanvasElement

Get a canvas with mask drawn.
