# Luna Path Bar

File explorer path bar.

## Demo

https://luna.liriliri.io/?path=/story/path-bar

## Install

Add the following script and style to your page.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-path-bar/luna-path-bar.css" />
<script src="//cdn.jsdelivr.net/npm/luna-path-bar/luna-path-bar.js"></script>
```

You can also get it on npm.

```bash
npm install luna-path-bar --save
```

```javascript
import 'luna-path-bar/luna-path-bar.css'
import LunaPathBar from 'luna-path-bar'
```

## Usage

```javascript
const pathBar = new LunaPathBar(container, { path: '/home/user' })
pathBar.setOption('path', '/home/user/documents')
pathBar.on('change', (path) => {
  console.log('Path changed:', path)
})
```

## Configuration

* path(string): File path.
* rootLabel(string): Root label.
