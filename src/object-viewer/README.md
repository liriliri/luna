# Luna Object Viewer

JavaScript object viewer, useful for building debugging tool.

## Demo

https://luna.liriliri.io/?path=/story/object-viewer

## Install

Add the following script and style to your page.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-object-viewer/luna-object-viewer.css" />
<script src="//cdn.jsdelivr.net/npm/luna-object-viewer/luna-object-viewer.js"></script>
```

You can also get it on npm.

```bash
npm install luna-object-viewer --save
```

```javascript
import 'luna-object-viewer/luna-object-viewer.css'
import LunaObjectViewer from 'luna-object-viewer'
```

## Usage

```javascript
const container = document.getElementById('container')
const objectViewer = new LunaObjectViewer(container, {
  unenumerable: false,
  accessGetter: true,
})
objectViewer.set(window.navigator)
```

## Configuration

* accessGetter(boolean): Access getter value.
* object(any): JavaScript object to display.
* prototype(boolean): Show prototype.
* unenumerable(boolean): Show unenumerable properties.

## Api

### set(data: any): void

Set the JavaScript object to display.
