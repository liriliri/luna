# Luna Menu

Simple menu.

## Demo

https://luna.liriliri.io/?path=/story/menu

## Install

Add the following script and style to your page.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-menu/luna-menu.css" />
<script src="//cdn.jsdelivr.net/npm/luna-menu/luna-menu.js"></script>
```

You can also get it on npm.

```bash
npm install luna-menu --save
```

```javascript
import 'luna-menu/luna-menu.css'
import LunaMenu from 'luna-menu'
```

## Usage

```javascript
const menu = new LunaMenu()
menu.append({
  type: 'normal',
  label: 'New File',
  click() {
    console.log('New File clicked')
  }
})
menu.show(0, 0)
```

## Api

### append(options: object)

Append menu item.

Options:
  * type(string): normal, separator or submenu.
  * label(string): Menu label.
  * click(function): Click event handler.
  * submenu(Menu): SubMenu.

### insert(pos: number, options: object)

Inert menu item to given position.

### show(x: number, y: number)

Show menu at target position.