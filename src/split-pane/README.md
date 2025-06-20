# Luna Split Pane

A component for creating resizable split panes.

## Demo

https://luna.liriliri.io/?path=/story/split-pane

## Install

Add the following script and style to your page.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-split-pane/luna-split-pane.css" />
<script src="//cdn.jsdelivr.net/npm/luna-split-pane/luna-split-pane.js"></script>
```

You can also get it on npm.

```bash
npm install luna-split-pane --save
```

```javascript
import 'luna-split-pane/luna-split-pane.css'
import LunaSplitPane from 'luna-split-pane'
```

## Usage

```javascript
const splitPane = new SplitPane(container, {
  direction: 'horizontal', // or 'vertical',
})
splitPane.append(document.createElement('div'), {
  minSize: 100,
  weight: 50,
})
```

## Configuration

* direction('vertical' | 'horizontal'): Direction to split.

## Api

### append(el: HTMLElement, options?: IElOptions): void

Append an element.

### update(el: HTMLElement, options: IElOptions): void

Update an element's options.
