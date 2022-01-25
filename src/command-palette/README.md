# Luna Command Palette

Command palette.

## Demo

https://luna.liriliri.io/?path=/story/command-palette

## Install

Add the following script and style to your page.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-command-palette/luna-command-palette.css" />
<script src="//cdn.jsdelivr.net/npm/luna-command-palette/luna-command-palette.js"></script>
```

You can also get it on npm.

```bash
npm install luna-command-palette --save
```

```javascript
import 'luna-command-palette/luna-command-palette.css'
import LunaCommandPalette from 'luna-command-palette'
```

## Usage

```javascript
const container = document.getElementById('container')
const commandPalette = new LunaCommandPalette(container, { 
  placeholder: 'Type a command',
  shortcut: 'Ctrl+P',
  commands: [
    {
      title: 'Reload Page',
      shortcut: 'Ctrl+R',
      handler(e) {
        if (e && e.preventDefault) {
          e.preventDefault()
        }
        location.reload()
      }
    }
  ]
})
commandPalette.show()
```

## Configuration

* placeholder(string): Search input placeholder.
* shortcut(string): Keyboard shortcut for opening the command palette.
* commands(array): Commands to show.

Command:

* title(string): Command title.
* handler(function): Function to execute if command is triggered.
* shortcut(string): Shortcut to trigger command.

## Api

### show(): void

Show command palette.

### hide(): void

Hide command palette.

