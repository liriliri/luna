# Luna Modal

Create modal dialogs.

## Demo

https://luna.liriliri.io/?path=/story/modal

## Install

Add the following script and style to your page.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-modal/luna-modal.css" />
<script src="//cdn.jsdelivr.net/npm/luna-modal/luna-modal.js"></script>
```

You can also get it on npm.

```bash
npm install luna-modal --save
```

```javascript
import 'luna-modal/luna-modal.css'
import LunaModal from 'luna-modal'
```

## Usage

```javascript
const container = document.getElementById('container')
const modal = new LunaModal(container, {
  title: 'This is the Title',
  content: 'This is the content.',
})
modal.show()

LunaModal.alert('This is the alert content.')
```

## Configuration

* content(string | HTMLElement): Modal content.
* footer(string | HTMLElement): Modal footer.
* showClose(boolean): Whether to show close button.
* title(string): Modal title.
* width(number): Modal width.

## Api

### hide(): void

Hide the modal.

### show(): void

Show the modal.

### static alert(msg: string): void

Like `window.alert`.

### static confirm(msg: string): Promise<boolean>

Like `window.confirm`.

### static prompt(title?: string, defaultText?: string): Promise<null | string>

Like `window.prompt`.

### static setContainer(container: HTMLElement): void

Set alert, prompt, confirm container, need to be called first.
