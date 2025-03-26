# Luna Dom Viewer

Dom tree navigator.

## Demo

https://luna.liriliri.io/?path=/story/dom-viewer

## Install

Add the following script and style to your page.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-dom-viewer/luna-dom-viewer.css" />
<script src="//cdn.jsdelivr.net/npm/luna-dom-viewer/luna-dom-viewer.js"></script>
```

You can also get it on npm.

```bash
npm install luna-dom-viewer --save
```

```javascript
import 'luna-dom-viewer/luna-dom-viewer.css'
import LunaDomViewer from 'luna-dom-viewer'
```

## Usage

```javascript
const container = document.getElementById('container')
const domViewer = new LunaDomViewer(container)
domViewer.expand()
```

## Configuration

* hotkey(boolean): Enable hotkey.
* ignore(AnyFn): Predicate function which removes the matching child nodes.
* ignoreAttr(AnyFn): Predicate function which removes the matching node attributes.
* lowerCaseTagName(boolean): Whether to convert tag name to lower case.
* node(ChildNode): Html element to navigate.
* observe(boolean): Observe dom mutation.

## Api

### select(node?: ChildNode): void

Select given node.
