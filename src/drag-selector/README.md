# Luna Drag Selector

Drag selector for selecting multiple items.

## Demo

https://luna.liriliri.io/?path=/story/drag-selector

## Install

Add the following script and style to your page.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-drag-selector/luna-drag-selector.css" />
<script src="//cdn.jsdelivr.net/npm/luna-drag-selector/luna-drag-selector.js"></script>
```

You can also get it on npm.

```bash
npm install luna-drag-selector --save
```

```javascript
import 'luna-drag-selector/luna-drag-selector.css'
import LunaDragSelector from 'luna-drag-selector'
```

## Usage

```javascript
const dragSelector = new DragSelector(container)
let selectedElements = []
dragSelector.on('select', () => {
  selectedElements = []
  if (dragSelector.isSelected(itemElement)) {
    selectedElements.push(itemElement)
  }
})
dragSelector.on('change', () => {
  console.log('Selection changed:', selectedElements)
})
```

## Api

### isSelected(el: HTMLElement): boolean

Check whether an element is selected.
