# Luna DOM Highlighter

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

* showRulers(boolean): Whether the rulers should be shown.
* showExtensionLines(boolean): Whether the extension lines from node to the rulers should be shown.
* showInfo(boolean): Whether the node info tooltip should be shown.
* showStyles(boolean): Whether the node styles in the tooltip.
* showAccessibilityInfo(boolean): Whether the a11y info should be shown.
* colorFormat(string): The color format used to format color styles.
* contentColor(string): The content box highlight fill color.
* paddingColor(string): The padding highlight fill color.
* borderColor(string): The border highlight fill color.
* marginColor(string): The margin highlight fill color.
* monitorResize(boolean): Auto redraw if target element is resized.

## Api

### highlight(target: HTMLElement | Text, options?: object): void

Highlight element or text node.

### hide(): void

Hide highlight.