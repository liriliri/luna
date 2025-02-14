# Luna Virtual List

Vertical list with virtual scrolling.

## Demo

https://luna.liriliri.io/?path=/story/virtual-list

## Install

Add the following script and style to your page.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-virtual-list/luna-virtual-list.css" />
<script src="//cdn.jsdelivr.net/npm/luna-virtual-list/luna-virtual-list.js"></script>
```

You can also get it on npm.

```bash
npm install luna-virtual-list --save
```

```javascript
import 'luna-virtual-list/luna-virtual-list.css'
import LunaVirtualList from 'luna-virtual-list'
```

## Usage

```javascript
const virtualList = new VirtualList(container, {
  autoScroll: true,
})
virtualList.append(document.createElement('div'))
```

## Configuration

* autoScroll(boolean): Auto scroll if at bottom.

## Api

### append(el: HTMLElement): void

Append item.

### clear(): void

Clear all items.

### remove(el: HTMLElement): void

Remove item.

### setItems(els: HTMLElement[]): void

Set items.

### update(el?: HTMLElement): void

Update heights.
