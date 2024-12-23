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

### appendButton(content: string | HTMLElement, handler: AnyFn, state?: IButtonState): LunaToolbarButton

Append button.

### appendCheckbox(key: string, value: boolean, label: string): LunaToolbarCheckbox

Append checkbox.

### appendHtml(html: string | HTMLElement): LunaToolbarHtml

Append html.

### appendInput(key: string, value: string, placeholder?: string): LunaToolbarInput

Append text input.

### appendNumber(key: string, value: number, options?: INumberOptions): LunaToolbarNumber

Append number.

### appendSelect(key: string, value: string, options: PlainObj<string>): LunaToolbarSelect

Append select.

### appendSeparator(): ToolbarSeparator

Append separator.

### appendSpace(): LunaToolbarSpace

Append item that fills the remaining space.

### appendText(text: string): LunaToolbarText

Append text.

### clear(): void

Clear all.

### remove(item: LunaToolbarItem): void

Remove item.

## Types

### INumberOptions

* max(number): Max value.
* min(number): Min value.
* step(number): Interval between legal numbers.
