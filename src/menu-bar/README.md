# Luna Menu Bar

Application menu bar.

## Demo

https://luna.liriliri.io/?path=/story/menu-bar

## Install

Add the following script and style to your page.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-menu/luna-menu.css" />
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-menu-bar/luna-menu-bar.css" />
<script src="//cdn.jsdelivr.net/npm/luna-menu/luna-menu.js"></script>
<script src="//cdn.jsdelivr.net/npm/luna-menu-bar/luna-menu-bar.js"></script>
```

You can also get it on npm.

```bash
npm install luna-menu-bar luna-menu --save
```

```javascript
import 'luna-menu/luna-menu.css'
import 'luna-menu-bar/luna-menu-bar.css'
import LunaMenuBar from 'luna-menu-bar'
```

## Usage

```javascript
const container = document.getElementById('container')
const menuBar = new LunaMenuBar(container)
menuBar.append({
  label: 'File',
  submenu: LunaMenu.build([
    {
      label: 'Exit',
      click() {
        console.log('Exit clicked')
      }
    }
  ])
})
```

## Api

### append(options: IMenuItemOptions): void

Append menu item.

### insert(pos: number, options: IMenuItemOptions): void

Insert menu item to given position.

### build(container: HTMLElement, template: any[]): LunaComponent

Create menu bar from template.

## Types

### IMenuItemOptions

* label(string): Menu label.
* submenu(LunaComponent): Sub menu.
