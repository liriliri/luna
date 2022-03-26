# Luna Scrollbar

Custom scrollbar.

## Demo

https://luna.liriliri.io/?path=/story/scrollbar

## Install

Add the following script and style to your page.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-scrollbar/luna-scrollbar.css" />
<script src="//cdn.jsdelivr.net/npm/luna-scrollbar/luna-scrollbar.js"></script>
```

You can also get it on npm.

```bash
npm install luna-scrollbar --save
```

```javascript
import 'luna-scrollbar/luna-scrollbar.css'
import LunaScrollbar from 'luna-scrollbar'
```

## Usage

```javascript
const scrollbar = new LunaScrollbar(container)
scrollbar.getContent().innerHTML = 'test'
```

## Api

### getContent(): HTMLElement

Get content element.
