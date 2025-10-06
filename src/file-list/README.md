# Luna File List

List files in the directory.

## Demo

https://luna.liriliri.io/?path=/story/file-list

## Install

Add the following script and style to your page.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-menu/luna-menu.css" />
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-data-grid/luna-data-grid.css" />
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-drag-selector/luna-drag-selector.css" />
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-icon-list/luna-icon-list.css" />
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-file-list/luna-file-list.css" />
<script src="//cdn.jsdelivr.net/npm/luna-menu/luna-menu.js"></script>
<script src="//cdn.jsdelivr.net/npm/luna-data-grid/luna-data-grid.js"></script>
<script src="//cdn.jsdelivr.net/npm/luna-drag-selector/luna-drag-selector.js"></script>
<script src="//cdn.jsdelivr.net/npm/luna-icon-list/luna-icon-list.js"></script>
<script src="//cdn.jsdelivr.net/npm/luna-file-list/luna-file-list.js"></script>
```

You can also get it on npm.

```bash
npm install luna-file-list luna-icon-list luna-drag-selector luna-data-grid luna-menu --save
```

```javascript
import 'luna-menu/luna-menu.css'
import 'luna-data-grid/luna-data-grid.css'
import 'luna-drag-selector/luna-drag-selector.css'
import 'luna-icon-list/luna-icon-list.css'
import 'luna-file-list/luna-file-list.css'
import LunaFileList from 'luna-file-list'
```

## Usage

```javascript
const fileList = new LunaFileList(container, {
 listView: true,
 files: [
  { name: 'file1.txt', mtime: new Date(), size: 1024 },
 ],
})
```

## Configuration

* columns(Column[]): List view columns.
* files(IFile[]): File list.
* filter(string | RegExp | AnyFn): File filter.
* listView(boolean): Show files in list view.

## Types

### IFile

* directory(boolean): Whether file is a directory.
* mime(string): MIME type.
* mode(string | number): File mode.
* mtime(Date): Modified timestamp.
* name(string): File name.
* size(number): File size.
* thumbnail(string): Thumbnail.
