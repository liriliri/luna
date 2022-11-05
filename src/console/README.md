# Luna Console

Console for logging, similar to the one in chrome DevTools.
All these methods can be used in the same way as window.console object.
log, error, info, warn, dir, time/timeLog/timeEnd, clear, count/countReset, assert, table, group/groupCollapsed/groupEnd

## Demo

https://luna.liriliri.io/?path=/story/console

## Install

Add the following script and style to your page.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-object-viewer/luna-object-viewer.css" />
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-data-grid/luna-data-grid.css" />
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-console/luna-console.css" />
<script src="//cdn.jsdelivr.net/npm/luna-object-viewer/luna-object-viewer.js"></script>
<script src="//cdn.jsdelivr.net/npm/luna-data-grid/luna-data-grid.js"></script>
<script src="//cdn.jsdelivr.net/npm/luna-console/luna-console.js"></script>
```

You can also get it on npm.

```bash
npm install luna-console luna-data-grid luna-object-viewer --save
```

```javascript
import 'luna-object-viewer/luna-object-viewer.css'
import 'luna-data-grid/luna-data-grid.css'
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

* accessGetter(boolean): Access getter value.
* asyncRender(boolean): Asynchronous rendering.
* filter(string | RegExp | AnyFn): Log filter.
* lazyEvaluation(boolean): Lazy evaluation for objects.
* maxNum(number): Max log number, zero means infinite.
* showHeader(boolean): Show time and from.
* unenumerable(boolean): Show unenumerable properties.

## Api

### evaluate(code: string): void

Evaluate JavaScript.

### html(args: any): void

Log out html content.
