# Luna Markdown Viewer

Live markdown renderer.

## Demo

https://luna.liriliri.io/?path=/story/markdown-viewer

## Install

Add the following script and style to your page.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-syntax-highlighter/luna-syntax-highlighter.css" />
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-carousel/luna-carousel.css" />
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-gallery/luna-gallery.css" />
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-markdown-viewer/luna-markdown-viewer.css" />
<script src="//cdn.jsdelivr.net/npm/luna-syntax-highlighter/luna-syntax-highlighter.js"></script>
<script src="//cdn.jsdelivr.net/npm/luna-carousel/luna-carousel.js"></script>
<script src="//cdn.jsdelivr.net/npm/luna-gallery/luna-gallery.js"></script>
<script src="//cdn.jsdelivr.net/npm/luna-markdown-viewer/luna-markdown-viewer.js"></script>
```

You can also get it on npm.

```bash
npm install luna-markdown-viewer luna-gallery luna-carousel luna-syntax-highlighter --save
```

```javascript
import 'luna-syntax-highlighter/luna-syntax-highlighter.css'
import 'luna-carousel/luna-carousel.css'
import 'luna-gallery/luna-gallery.css'
import 'luna-markdown-viewer/luna-markdown-viewer.css'
import LunaMarkdownViewer from 'luna-markdown-viewer'
```

## Usage

```javascript
const markdownViewer = new LunaMarkdownViewer(container)
markdownViewer.setOption({ markdown: '# h1' })
```

## Configuration

* markdown(string): Markdown text to render.
