# Luna File List

List files in the directory.

## Demo

https://luna.liriliri.io/?path=/story/file-list

## Install

Add the following script and style to your page.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-data-grid/luna-data-grid.css" />
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-file-list/luna-file-list.css" />
<script src="//cdn.jsdelivr.net/npm/luna-data-grid/luna-data-grid.js"></script>
<script src="//cdn.jsdelivr.net/npm/luna-file-list/luna-file-list.js"></script>
```

You can also get it on npm.

```bash
npm install luna-file-list luna-data-grid --save
```

```javascript
import 'luna-data-grid/luna-data-grid.css'
import 'luna-file-list/luna-file-list.css'
import LunaFileList from 'luna-file-list'
```

## Configuration

* directory(string): Current directory.
* files(IFile[]): File list.
* listView(boolean): Show files in list view.

## Types

### IFile

* ctime(number): Create time.
* directory(boolean): Whether file is a directory.
* name(string): File name.
* size(number): File size.
