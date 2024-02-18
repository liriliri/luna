# Luna Painter

Simple drawing tool.

## Demo

https://luna.liriliri.io/?path=/story/painter

## Install

Add the following script and style to your page.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-toolbar/luna-toolbar.css" />
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-painter/luna-painter.css" />
<script src="//cdn.jsdelivr.net/npm/luna-toolbar/luna-toolbar.js"></script>
<script src="//cdn.jsdelivr.net/npm/luna-painter/luna-painter.js"></script>
```

You can also get it on npm.

```bash
npm install luna-painter luna-toolbar --save
```

```javascript
import 'luna-toolbar/luna-toolbar.css'
import 'luna-painter/luna-painter.css'
import LunaPainter from 'luna-painter'
```

## Usage

```javascript
const container = document.getElementById('container')
const painer = new LunaPainter(container)
```

## Configuration

* height(number): Canvas height.
* tool(string): Initial used tool.
* width(number): Canvas width.

## Api

### addLayer(): number

Add layer.

### getActiveLayer(): Layer

Get active layer.

### getCurrentToolName(): string

Get current tool name.

### getTool(name: string): void | LunaComponent

Get tool.

### useTool(name: string): void

Use tool.
