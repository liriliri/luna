# Luna Text Viewer

Text viewer with line number.

## Demo

https://luna.liriliri.io/?path=/story/text-viewer

## Install

Add the following script and style to your page.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-text-viewer/luna-text-viewer.css" />
<script src="//cdn.jsdelivr.net/npm/luna-text-viewer/luna-text-viewer.js"></script>
```

You can also get it on npm.

```bash
npm install luna-text-viewer --save
```

```javascript
import 'luna-text-viewer/luna-text-viewer.css'
import LunaTextViewer from 'luna-text-viewer'
```

## Usage

```javascript
const textViewer = new LunaTextViewer(container)
textViewer.setOption({
  text: 'Luna Text Viewer',
})
```

## Configuration

* escape(boolean): Whether to escape text or not.
* maxHeight(number): Max viewer height.
* showLineNumbers(boolean): Show line numbers.
* text(string): Text to view.
* wrapLongLines(boolean): Wrap lone lines.

## Api

### append(text: string): undefined | $

Append text.
