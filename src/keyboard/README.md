# Luna Keyboard

Virtual keyboard.

## Demo

https://luna.liriliri.io/?path=/story/keyboard

## Install

Add the following script and style to your page.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-keyboard/luna-keyboard.css" />
<script src="//cdn.jsdelivr.net/npm/luna-keyboard/luna-keyboard.js"></script>
```

You can also get it on npm.

```bash
npm install luna-keyboard --save
```

```javascript
import 'luna-keyboard/luna-keyboard.css'
import LunaKeyboard from 'luna-keyboard'
```

## Usage

```javascript
const textarea = document.getElementById('textarea')
const container = document.getElementById('container')
const keyboard = new LunaKeyboard(container)
keyboard.on('change', (input) => {
  textarea.value = input
})
textarea.addEventListener('input', (event) => {
  keyboard.setInput(event.target.value)
})
```

## Api

### setInput(input: string): void

Set input.
