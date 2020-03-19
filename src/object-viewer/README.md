# Luna Object Viewer

JavaScript Object Viewer.

## Install

```bash
npm install luna-object-viewer --save
```

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-object-viewer/luna-object-viewer.css" />
<script src="//cdn.jsdelivr.net/npm/luna-object-viewer/luna-object-viewer.js"></script>
```

## Usage

```javascript
const container = document.getElementById('container')
const objectViewer = new LunaObjectViewer(container, {
  unenumerable: true,
  accessGetter: true
})
objectViewer.set(window)
```

## Configuration

* unenumerable: Show unenumerable properties.
* accessGetter: Access getter value.