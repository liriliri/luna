# Luna Toolbar

Application toolbar.

## Demo

https://luna.liriliri.io/?path=/story/toolbar

## Install

Add the following script and style to your page.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-toolbar/luna-toolbar.css" />
<script src="//cdn.jsdelivr.net/npm/luna-toolbar/luna-toolbar.js"></script>
```

You can also get it on npm.

```bash
npm install luna-toolbar --save
```

```javascript
import 'luna-toolbar/luna-toolbar.css'
import LunaToolbar from 'luna-toolbar'
```

## Usage

```javascript
const toolbar = new LunaToolbar(container)
toolbar.appendText('Test')
```

## Api

### appendHtml(html: string | HTMLElement): LunaToolbarHtml

Append html.

### appendInput(key: string, value: string, placeholder?: string): ToolbarInput

Append text input.

### appendSelect(key: string, value: string, options: PlainObj<string>): LunaToolbarSelect

Append select.

### appendSeparator(): ToolbarSeparator

Append separator.

### appendSpace(): ToolbarSpace

Append item that fills the remaining space.

### appendText(text: string): LunaToolbarText

Append text.

### clear(): void

Clear all.

### remove(item: LunaToolbarItem): void

Remove item.
