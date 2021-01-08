# Luna Editor

Wysiwyg editor.

## Demo

https://luna.liriliri.io/?path=/story/editor

## Install

Add the following script and style to your page.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-editor/luna-editor.css" />
<script src="//cdn.jsdelivr.net/npm/luna-editor/luna-editor.js"></script>
```

You can also get it on npm.

```bash
npm install luna-editor --save
```

```javascript
import 'luna-editor/luna-editor.css'
import LunaEditor from 'luna-editor'
```

## Usage

```javascript
const container = document.getElementById('container')
const editor = new LunaEditor(container)
console.log(editor.html())
```