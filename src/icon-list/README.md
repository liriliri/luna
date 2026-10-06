# Luna Icon List

Show list of icons and their names.

## Demo

https://luna.liriliri.io/?path=/story/icon-list

## Install

Add the following script and style to your page.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-drag-selector/luna-drag-selector.css" />
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-icon-list/luna-icon-list.css" />
<script src="//cdn.jsdelivr.net/npm/luna-drag-selector/luna-drag-selector.js"></script>
<script src="//cdn.jsdelivr.net/npm/luna-icon-list/luna-icon-list.js"></script>
```

You can also get it on npm.

```bash
npm install luna-icon-list luna-drag-selector --save
```

```javascript
import 'luna-drag-selector/luna-drag-selector.css'
import 'luna-icon-list/luna-icon-list.css'
import LunaIconList from 'luna-icon-list'
```

## Usage

```javascript
const iconList = new LunaIconList(container, {
  multiSelections: true,
})
iconList.setIcons([
  {
    src: '/logo.png',
    name: 'Luna',
  },
])
iconList.on('select', (icons) => {
  console.log(icons)
})
```

## Configuration

* filter(string | RegExp | AnyFn): Icon filter.
* hotkey(boolean | IHotkey): Enable hotkey or custom hotkey bindings.
* multiSelections(boolean): Allow multiple selections.
* selectable(boolean): Whether icon is selectable.
* size(number): Icon size.

## Api

### append(data: IIcon): void

Append icon.

### clear(): void

Clear all icons.

### focus(): void

Focus icon list.

### getSelected(): Icon[]

Get selected icons.

### select(index?: number): boolean

Select icon by index.

### setIcons(icons: IIcon[]): void

Set icons.

## Types

### IHotkey

* down(string): Move selection down.
* left(string): Move selection left.
* open(string): Open selected icon.
* right(string): Move selection right.
* up(string): Move selection up.

### IIcon

* title(string): Title shown on hover.
