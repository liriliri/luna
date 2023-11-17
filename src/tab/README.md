# Luna Tab

Easy tabs.

## Demo

https://luna.liriliri.io/?path=/story/tab

## Install

Add the following script and style to your page.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-tab/luna-tab.css" />
<script src="//cdn.jsdelivr.net/npm/luna-tab/luna-tab.js"></script>
```

You can also get it on npm.

```bash
npm install luna-tab --save
```

```javascript
import 'luna-tab/luna-tab.css'
import LunaTab from 'luna-tab'
```

## Usage

```javascript
const container = document.getElementById('container')
const tab = new LunaTabs(container, {
  height: 30,
})
tab.append({
  id: 'console',
  title: 'Console',
})
tab.select('console')
tab.on('select', id => {
  console.log(id)
})
```

## Configuration

* height(number): Tab height.

## Api

### append(tab: ITab): void

Append tab.

### deselect(): void

Deselect tabs.

### insert(pos: number, tab: ITab): void

Insert tab at given position.

### remove(id: string): void

Remove tab.

### select(id: string): void

Select tab.

## Types

### ITab

* id(string): Tab id.
* title(string): Tab title.
