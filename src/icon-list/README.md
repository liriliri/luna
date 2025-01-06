# Luna Icon List

Show list of icons and their names.

## Demo

https://luna.liriliri.io/?path=/story/icon-list

## Install

Add the following script and style to your page.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-icon-list/luna-icon-list.css" />
<script src="//cdn.jsdelivr.net/npm/luna-icon-list/luna-icon-list.js"></script>
```

You can also get it on npm.

```bash
npm install luna-icon-list --save
```

```javascript
import 'luna-icon-list/luna-icon-list.css'
import LunaIconList from 'luna-icon-list'
```

## Usage

```javascript
const iconList = new LunaIconList(container)
```

## Configuration

* icons(IIcon[]): Icon list.
* size(number): Icon size.

## Types

### IIcon

