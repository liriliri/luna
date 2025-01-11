# Luna File List

List files in the directory.

## Demo

https://luna.liriliri.io/?path=/story/file-list

## Install

Add the following script and style to your page.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-data-grid/luna-data-grid.css" />
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-icon-list/luna-icon-list.css" />
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-file-list/luna-file-list.css" />
<script src="//cdn.jsdelivr.net/npm/luna-data-grid/luna-data-grid.js"></script>
<script src="//cdn.jsdelivr.net/npm/luna-icon-list/luna-icon-list.js"></script>
<script src="//cdn.jsdelivr.net/npm/luna-file-list/luna-file-list.js"></script>
```

You can also get it on npm.

```bash
npm install luna-file-list luna-icon-list luna-data-grid --save
```

```javascript
import 'luna-data-grid/luna-data-grid.css'
import 'luna-icon-list/luna-icon-list.css'
import 'luna-file-list/luna-file-list.css'
import LunaFileList from 'luna-file-list'
```

## Configuration

* files(IFile[]): File list.
* listView(boolean): Show files in list view.

## Types

### IFile

* directory(boolean): Whether file is a directory.
* mtime(number): Modified timestamp.
* name(string): File name.
* size(number): File size.
* thumbnail(string): Thumbnail.
