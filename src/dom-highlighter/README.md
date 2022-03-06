# Luna Dom Highlighter

Highlighter for html elements.

## Demo

https://luna.liriliri.io/?path=/story/dom-highlighter

## Install

Add the following script and style to your page.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-dom-highlighter/luna-dom-highlighter.css" />
<script src="//cdn.jsdelivr.net/npm/luna-dom-highlighter/luna-dom-highlighter.js"></script>
```

You can also get it on npm.

```bash
npm install luna-dom-highlighter --save
```

```javascript
import 'luna-dom-highlighter/luna-dom-highlighter.css'
import LunaDomHighlighter from 'luna-dom-highlighter'
```

## Usage

```javascript
const domHighlighter = new LunaDomHighlighter(container, {
  showRulers: true,
  showExtensionLines: true,
  showInfo: true,
})
domHighlighter.highlight(document.getElementById('test'))
domHighlighter.hide()
```

## Configuration

* borderColor(string | IRgb): The border highlight fill color.
* colorFormat('rgb' | 'hsl' | 'hex'): The color format used to format color styles.
* contentColor(string | IRgb): The content box highlight fill color.
* marginColor(string | IRgb): The margin highlight fill color.
* monitorResize(boolean | IRgb): Auto redraw if target element is resized.
* paddingColor(string | IRgb): The padding highlight fill color.
* showAccessibilityInfo(boolean): Whether the a11y info should be shown.
* showExtensionLines(boolean): Whether the extension lines from node to the rulers should be shown.
* showInfo(boolean): Whether the node info tooltip should be shown.
* showRulers(boolean): Whether the rulers should be shown.
* showStyles(boolean): Whether the node styles in the tooltip.

## Api

### hide(): void

Hide highlight.

### highlight(target: HTMLElement | Text,options?: IOptions): void

Highlight element or text node.

## Types

### IRgb

* a(number): Alpha.
* b(number): Blue.
* g(number): Green.
* r(number): Red.
