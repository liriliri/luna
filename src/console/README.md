# Luna Console

Console for logging, similar to the one in chrome DevTools.

## Demo

https://luna.liriliri.io/?path=/story/console

## Install

Add the following script and style to your page.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-object-viewer/luna-object-viewer.css" />
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-console/luna-console.css" />
<script src="//cdn.jsdelivr.net/npm/luna-object-viewer/luna-object-viewer.js"></script>
<script src="//cdn.jsdelivr.net/npm/luna-console/luna-console.js"></script>
```

You can also get it on npm.

```bash
npm install luna-console luna-object-viewer --save
```

```javascript
import 'luna-object-viewer/luna-object-viewer.css'
import 'luna-console/luna-console.css'
import LunaConsole from 'luna-console'
```

## Usage

```javascript
const container = document.getElementById('container')
const console = new LunaConsole(container)
console.log('luna')
```

## Configuration

* maxNum(number): Max log number, zero means infinite.
* asyncRender(boolean): Asynchronous rendering.
* showHeader(boolean): Show time and from.

## Api

### evaluate(code: string): void

Evaluate JavaScript.

### setMaxNum(num: number): void

Set max log number.

### destroy(): void

Destroy console.