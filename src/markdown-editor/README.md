# Luna Markdown Editor

Markdown editor with preview.

## Demo

https://luna.liriliri.io/?path=/story/markdown-editor

## Install

Add the following script and style to your page.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-carousel/luna-carousel.css" />
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-gallery/luna-gallery.css" />
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-syntax-highlighter/luna-syntax-highlighter.css" />
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-markdown-viewer/luna-markdown-viewer.css" />
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-markdown-editor/luna-markdown-editor.css" />
<script src="//cdn.jsdelivr.net/npm/luna-carousel/luna-carousel.js"></script>
<script src="//cdn.jsdelivr.net/npm/luna-gallery/luna-gallery.js"></script>
<script src="//cdn.jsdelivr.net/npm/luna-syntax-highlighter/luna-syntax-highlighter.js"></script>
<script src="//cdn.jsdelivr.net/npm/luna-markdown-viewer/luna-markdown-viewer.js"></script>
<script src="//cdn.jsdelivr.net/npm/luna-markdown-editor/luna-markdown-editor.js"></script>
```

You can also get it on npm.

```bash
npm install luna-markdown-editor luna-markdown-viewer luna-syntax-highlighter luna-gallery luna-carousel --save
```

```javascript
import 'luna-carousel/luna-carousel.css'
import 'luna-gallery/luna-gallery.css'
import 'luna-syntax-highlighter/luna-syntax-highlighter.css'
import 'luna-markdown-viewer/luna-markdown-viewer.css'
import 'luna-markdown-editor/luna-markdown-editor.css'
import LunaMarkdownEditor from 'luna-markdown-editor'
```

## Usage

```javascript
const markdownEditor = new LunaMarkdownEditor(container)
```

## Configuration

* markdown(string): Initial markdown text.

## Api

### markdown(markdown?: string): undefined | string

Get or set markdown text.
