# Luna Log

Terminal log viewer.

## Demo

https://luna.liriliri.io/?path=/story/log

## Install

Add the following script and style to your page.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-text-viewer/luna-text-viewer.css" />
<script src="//cdn.jsdelivr.net/npm/luna-text-viewer/luna-text-viewer.js"></script>
<script src="//cdn.jsdelivr.net/npm/luna-log/luna-log.js"></script>
```

You can also get it on npm.

```bash
npm install luna-log luna-text-viewer --save
```

```javascript
import 'luna-text-viewer/luna-text-viewer.css'
import LunaLog from 'luna-log'
```

## Usage

```javascript
const log = new LunaLog(container)
log.setOption({
  log: 'npm install',
})
```

## Configuration

* log(string): Log to display.
* maxHeight(number): Max viewer height.
* wrapLongLines(boolean): Wrap lone lines.

## Api

### append(log: string): void

Append log.
