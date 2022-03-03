# Luna Window

HTML5 window manager.

## Demo

https://luna.liriliri.io/?path=/story/window

## Install

Add the following script and style to your page.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-window/luna-window.css" />
<script src="//cdn.jsdelivr.net/npm/luna-window/luna-window.js"></script>
```

You can also get it on npm.

```bash
npm install luna-window --save
```

```javascript
import 'luna-window/luna-window.css'
import LunaWindow from 'luna-window'
```

## Usage

```javascript
const win = new LunaWindow({
  title: 'Window Title',
  x: 50,
  y: 50,
  width: 800,
  height: 600,
  content: 'This is the content.'
})
win.show()
```

## Configuration

* content(string|HTMLElement): Content to display, url is supported.
* height(number): Height of the window.
* minHeight(number): Minimum height of the window.
* minWidth(number): Minimum width of the window.
* title(string): Title of the window.
* width(number): Width of the window.
* x(number): Offset to the left of the viewport.
* y(number): Offset to the top of the viewport.

## Api

### maximize(): void

Maximize the window.

### minimize(): void

Minimize the window.

### show(): void

Show the window.
