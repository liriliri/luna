# Luna Syntax Highlighter

Syntax highlighter using highlightjs.

## Demo

https://luna.liriliri.io/?path=/story/syntax-highlighter

## Install

Add the following script and style to your page.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-syntax-highlighter/luna-syntax-highlighter.css" />
<script src="//cdn.jsdelivr.net/npm/luna-syntax-highlighter/luna-syntax-highlighter.js"></script>
```

You can also get it on npm.

```bash
npm install luna-syntax-highlighter --save
```

```javascript
import 'luna-syntax-highlighter/luna-syntax-highlighter.css'
import LunaSyntaxHighlighter from 'luna-syntax-highlighter'
```

## Usage

```javascript
const syntaxHighlighter = new LunaSyntaxHighlighter(container)
syntaxHighlighter.setOption({
  code: 'const a = 1;',
  language: 'javascript',
})
```

## Configuration

* code(string): Code to highlight.
* language(string): Language to highlight code in.
* showLineNumbers(boolean): Show line numbers.
* wrapLongLines(boolean): Wrap lone lines.

## Api

### static getLanguage(name: string): any

Highlight.js getLanguage.

### static registerLanguage(name: string, fn: AnyFn): void

Highlight.js registerLanguage.
